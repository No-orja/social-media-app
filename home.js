const url = "https://tarmeezacademy.com/api/v1"

// SCROLL ===============>
let currentPage = 1;
let lastPage = 1;
let isLoading = false;

window.addEventListener("scroll", function () {
  const nearBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 200;

  if (nearBottom && currentPage < lastPage && !isLoading) {
    isLoading = true;
    currentPage += 1;
    showPost(false, currentPage, false).finally(() => {
      setTimeout(() => isLoading = false, 500);
    });
  }
});
//================>
setTimeout(() => {
  showContentAfterDataLoad();
}, 1000); 
setupUI()
showPost()

function showContentAfterDataLoad() {
  document.getElementById("loader").style.display = "none";
  document.getElementById("appContent").classList.remove("hidden-until-load");
}


document.getElementById('logo').addEventListener('click', function(event) {
  event.preventDefault(); //عشان الصفحة ما ترجع تتحمل 
  window.scrollTo({ //يمرر المستخدم إلى أعلى الصفحة
    top: 0,
    behavior: 'smooth' // Smooth scrolling
  });
});

function setupUI(){
    let loginDiv = document.getElementById("loginDiv")
    let logoutDiv = document.getElementById("logoutDiv")
    let token = localStorage.getItem("token")
    let makePostDiv = document.getElementById("makePostDiv")
    let navUser = document.getElementById("nav-user")
    let navImg = document.getElementById("nav-img")
    let newPostImage = document.getElementById("imgInfo")
    let editButtons = document.querySelectorAll("#updateBtn");
    let deleteButtons = document.querySelectorAll("#deleteBtn");
    const user = getUser();

    if(token != null){
        editButtons.forEach(btn => btn.style.display = "inline");
        deleteButtons.forEach(btn => btn.style.display = "inline");
        logoutDiv.style.setProperty("display", "flex", "important");
        loginDiv.style.setProperty("display", "none", "important");
        makePostDiv.style.setProperty("display", "block", "important")

      if (user) {
        navUser.innerHTML = `@${user.username}`;
        navImg.src = user.profile_image;
        newPostImage.src = user.profile_image
      }
    }else{
        logoutDiv.style.setProperty("display", "none", "important");
        loginDiv.style.setProperty("display", "flex", "important");
        makePostDiv.style.setProperty("display", "none", "important")
        editButtons.forEach(btn => btn.style.display = "none");
        deleteButtons.forEach(btn => btn.style.display = "none")
    }
}

function loginBtn(){
  toggleLoader(true)
  let username = document.getElementById("username-input").value
  let password = document.getElementById("password-input").value
  
  if (!username || !password) {
    alert("Username and password are required.");
    toggleLoader(false);
    return;
  }

  axios.post(`${url}/login`, {
      "username": username,
      "password": password
    })
    .then(function (response) {
      toggleLoader(false)
      const user = JSON.stringify(response.data.user);
      const token = response.data.token 
      localStorage.setItem("token",token)
      localStorage.setItem("user", user);
      console.log(token)
      console.log(user)
      const modal = document.getElementById("Login-modal")
      const nodalInstance = bootstrap.Modal.getInstance(modal)
      nodalInstance.hide()
      
      setupUI()
    })  
    .catch(function (error) {
    toggleLoader(false);
    if (error.response && error.response.data) {
      console.log("⚠️ Error response:", error.response.data);
      alert(error.response.data.message || "Login failed.");
    } else {
      console.log("❌ Unknown error:", error);
      alert("Something went wrong!");
    }
  });

}

function logoutBtn(){
    localStorage.removeItem("token")
    setupUI()
    console.log("deleted")
}

function registerBtn() {
  let username = document.getElementById("register-username-input").value;
  let password = document.getElementById("register-password-input").value;
  let name = document.getElementById("register-name-input").value;
  let image = document.getElementById("img-username-input").files[0];

  if (!username || !password || !name || !image) {
    alert("🛑 كل الحقول مطلوبة، بما فيها الصورة");
    return;
  }

  let formData = new FormData();
  formData.append("username", username);
  formData.append("password", password);
  formData.append("name", name);
  formData.append("image", image);

  toggleLoader(true);

  axios.post(`${url}/register`, formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  })
  .then(function (response) {
    toggleLoader(false);

    const user = JSON.stringify(response.data.user);
    const token = response.data.token;
    localStorage.setItem("token", token);
    localStorage.setItem("user", user);

    console.log(token);
    console.log(user);

    // ✅ نقفل مودال التسجيل بعد النجاح فقط
    const modal = document.getElementById("register-modal");
    const modalInstance = bootstrap.Modal.getInstance(modal);
    modalInstance.hide();

    setupUI();
  })
  .catch(function (error) {
    toggleLoader(false);
    if (error.response && error.response.data) {
      console.log("❌ Register Error:", error.response.data);
      alert(error.response.data.message || "Registration failed.");
    } else {
      console.log("Unknown error:", error);
      alert("Something went wrong!");
    }
  });
}

function profileClicked(){
  let user = getUser()
  let userId = user.id
  window.location = `./profileUserPage.html?userid=${userId}`
}

function showPost(reload = true, page = 1, showLoader = true) {
  if (showLoader) toggleLoader(true);

  return axios.get(`${url}/posts?page=${page}`)
    .then(function (response) {
      if (showLoader) toggleLoader(false);

      let user = getUser();
      const posts = response.data.data || [];
      lastPage = response.data.meta.last_page;

      const postsContainer = document.getElementById("posts");
      let content = "";

      if (reload) {
  postsContainer.innerHTML = "";      }

      for (let post of posts) {
        let isMyPost = user != null && post.author.id == user.id;
        let btnEditContent = "";

        if (isMyPost) {
          btnEditContent = `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor"
              class="bi bi-pencil-square" viewBox="0 0 16 16" style="color:white; cursor:pointer"
              onclick="btnPostUpdate('${encodeURIComponent(JSON.stringify(post))}')">
              <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75
              2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5
              0 0 0 .196-.12l6.813-6.814z"/>
              <path fill-rule="evenodd"
                d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0
                1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0
                1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5
                0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5
                1.5 0 0 0 1 2.5z"/>
            </svg>

            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor"
              class="bi bi-trash-fill" viewBox="0 0 16 16" style="color:#a32a2a; cursor:pointer"
              onclick="btnPostDelete('${encodeURIComponent(JSON.stringify(post))}')">
              <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1
              1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0
              2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0
              0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0
              0-1 1zm3 4a.5.5 0 0 1 .5.5v7a.5.5
              0 0 1-1 0v-7a.5.5 0 0 1 .5-.5M8
              5a.5.5 0 0 1 .5.5v7a.5.5 0 0
              1-1 0v-7A.5.5 0 0 1 8 5m3
              .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0"/>
            </svg>
          `;
        }

        const postImage = (typeof post.image === 'string' && post.image) ? post.image : '';
        const profileImage = (typeof post.author.profile_image === 'string' && post.author.profile_image)
          ? post.author.profile_image
          : 'https://www.pngitem.com/pimgs/m/146-1468479_my-profile-icon-blank-profile-picture-circle-hd.png';

        content += `
          <div class="card shadow mb-4" style="background-color: rgb(52, 51, 51);">
            <div class="card-header d-flex align-items-center justify-content-between">
              <div class="d-flex align-items-center" onclick="userClicked(${post.author.id})" style="cursor:pointer">
                <img src="${profileImage}" class="rounded-circle border border-3" style="width: 40px; height: 40px; margin-right: 10px; object-fit: cover;">
                <div>
                  <h4 style="margin: 0; color:white">${post.author.name}</h4>
                  <p style="margin: 0; color:white">@${post.author.username}</p>
                  <small style="color:gray">${post.created_at}</small>
                </div>
              </div>
              <div>${btnEditContent}</div>
            </div>
            <div class="card-body">
              <p style="color:white">${post.body}</p>
              ${postImage ? `<img src="${postImage}" class="post-img w-100" id="post-img">` : ""}

              <div class="mt-2" style="color: white;">
                <span>(${post.comments_count}) Comments</span>
                <span style="margin-left: 10px;">(0) Shares</span>
              </div>

              <hr style="color:white">
              <div class="d-flex align-items-center" style="color:white;">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor"
                  class="bi bi-heart" viewBox="0 0 16 16" style="margin-left: 15px; cursor: pointer;">
                  <path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641
                  2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357
                  3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878
                  10.4.28 8.717 2.01zM8 15C-7.333 4.868
                  3.279-3.04 7.824 1.143q.09.083.176.171a3
                  3 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15"/>
                </svg>

                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor"
                  class="bi bi-chat-dots" viewBox="0 0 16 16"
                  style="margin-left: 30px;cursor:pointer"
                  data-bs-toggle="modal" data-bs-target="#showPostByModal"
                  onclick="showModalForComment(${post.id})">
                  <path d="M5 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0m4 0a1 1 0 1 1-2 0
                  1 1 0 0 1 2 0m3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2"/>
                  <path d="m2.165 15.803.02-.004c1.83-.363 2.948-.842
                  3.468-1.105A9 9 0 0 0 8 15c4.418 0
                  8-3.134 8-7s-3.582-7-8-7-8 3.134-8
                  7c0 1.76.743 3.37 1.97 4.6a10.4
                  10.4 0 0 1-.524 2.318l-.003.011a11
                  11 0 0 1-.244.637c-.079.186.074.394.273.362a22
                  22 0 0 0 .693-.125m.8-3.108a1 1 0 0 0-.287-.801C1.618
                  10.83 1 9.468 1 8c0-3.192 3.004-6
                  7-6s7 2.808 7 6-3.004 6-7 6a8
                  8 0 0 1-2.088-.272 1 1 0 0 0-.711.074c-.387.196-1.24.57-2.634.893a11
                  11 0 0 0 .398-2"/>
                </svg>

                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor"
                  class="bi bi-send" viewBox="0 0 16 16" style="margin-left: 30px;cursor:pointer">
                  <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819
                  14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643
                  7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5
                  0 0 1 .54.11ZM6.636 10.07l2.761
                  4.338L14.13 2.576zm6.787-8.201L1.591
                  6.602l4.339 2.76z"/>
                </svg>
              </div>
            </div>
          </div>
        `;
      }

      postsContainer.innerHTML += content;
      setupUI();
    })
    .catch(function (error) {
      console.log(error);
    });
}

function userClicked(userId){
  window.location = `./profileUserPage.html?userid=${userId}`
}

function getUser() {
  let user = null;
  let storageUser = localStorage.getItem("user");
  if (storageUser) {
      user = JSON.parse(storageUser);
  }
  return user;
}

//Delete btn
function btnPostDelete(postObj){
  let post = JSON.parse(decodeURIComponent(postObj))
  console.log(post)

  document.getElementById("delete-post-id-input").value = post.id

  let postModal = new bootstrap.Modal(document.getElementById("delete-modal"),{})
  postModal.toggle()
}

function confirmPostDelete() {

  const token = localStorage.getItem("token");
  const postId = document.getElementById("delete-post-id-input").value;
  const url = `https://tarmeezacademy.com/api/v1/posts/${postId}`;
  let headers = {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "multipart/form-data"
  };

  axios.delete(url, { headers: headers })
    .then(function (response) {
      console.log(response);

      // إغلاق نافذة الحذف
      const modal = document.getElementById("delete-modal");
      const modalInstance = bootstrap.Modal.getInstance(modal);
      modalInstance.hide();

      // تحديث الواجهة
      showPost();  // تأكد من استدعاء دالة عرض البوستات الجديدة
    })
    .catch(function (error) {
      console.log("Error:", error);
    });
}

//Update btn
function btnPostUpdate(postObj) {
  let post = JSON.parse(decodeURIComponent(postObj));
  console.log(post);

  document.getElementById("titleModal").innerHTML = "Update post";
  document.getElementById("post-id-input").value = post.id;
  document.getElementById("body-input").value = post.body;
  document.getElementById("cretePostBtn").innerHTML = "Update";

  let postModal = new bootstrap.Modal(document.getElementById("addPostWithImg-modal"), {});
  postModal.toggle();
  showPost(true,1)
}

function confirmPostUpdate() {
  toggleLoader(true);
  const token = localStorage.getItem("token");
  const postId = document.getElementById("post-id-input").value;
  const body = document.getElementById("body-input").value;
  const image = document.getElementById("img-input").files[0];

  let headers = {
    "Authorization": `Bearer ${token}`
  };
  let request;

  if (image) {
    let formData = new FormData();
    formData.append("body", body);
    formData.append("image", image);
    headers["Content-Type"] = "multipart/form-data";
    request = axios.put(`${url}/posts/${postId}`, formData, { headers });
  } else {
    request = axios.put(`${url}/posts/${postId}`, { body }, { headers });
  }

  request
    .then(function (response) {
      bootstrap.Modal.getInstance(document.getElementById("addPostWithImg-modal")).hide();
      showPost();
      setupUI();
    })
    .catch(function (error) {
      console.log("❌ Update Error:", error.response?.data || error);
      alert("Post update failed.");
    })
    .finally(() => toggleLoader(false));
}

// create post without img 
function btnPostCreate(){
  let body = document.getElementById("bodyWithoutImg").value;
  // let postId = document.getElementById("post-id-input").value;
  const token = localStorage.getItem("token");

  if (!body) {
      alert("the body is null!")
      return;
  }

  let formData = new FormData();
  formData.append("body", body);
  axios.post(`${url}/posts`, formData, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "multipart/form-data"
      }
  })
  .then(function (response) {
      console.log(response);
      showPost()
      setupUI();
  })
  .catch(function (error) {
      console.log(error);
    });
}

//create post with img
function btnPostCreateWithImg(){
  let body = document.getElementById("body-input").value;
  let image = document.getElementById("img-input").files[0]
  // let postId = document.getElementById("post-id-input").value;
  const token = localStorage.getItem("token");

  let formData = new FormData();
  formData.append("body", body);
  formData.append("image", image)
  axios.post(`${url}/posts`, formData, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "multipart/form-data"
      }
  })
  .then(function (response) {
      console.log(response);
      if (!body || !image) {
        alert("the body or image is null!")
        return;
      }
      const modal = document.getElementById("addPostWithImg-modal");
      const modalInstance = bootstrap.Modal.getInstance(modal);
      modalInstance.hide();
      showPost()
      setupUI();
  })
  .catch(function (error) {
      console.log(error);
  });
} 
function handlePostModalAction() {
  const postId = document.getElementById("post-id-input").value;
  if (postId) {
    confirmPostUpdate(); 
  } else {
    btnPostCreateWithImg();
  }
}
function showModalForComment(id) {
  axios.get(`${url}/posts/${id}`)
    .then((response) => {
      const post = response.data.data;
      const comments = post.comments;
      const author = post.author;

      // بيانات البوست
      const postBody = post.body || '';
      const postImage = (typeof post.image === 'string' && post.image) ? post.image : '';
      const profileImage = (typeof author.profile_image === 'string' && author.profile_image)
        ? author.profile_image
        : 'https://www.pngitem.com/pimgs/m/146-1468479_my-profile-icon-blank-profile-picture-circle-hd.png';

      // تعبئة بيانات المودال
      document.getElementById("modal-title-forComment").innerHTML = author.username;
      document.getElementById("modal-imgProfile-forComment").src = profileImage;
      document.getElementById("modal-Body-forComment").innerHTML = postBody;

      const modalImg = document.getElementById("modal-imgPost-forComment");
      if (postImage) {
        modalImg.src = postImage;
        modalImg.style.display = "block";
      } else {
        modalImg.style.display = "none";
      }

      // عرض التعليقات
      let commentContent = '';
      for (let comment of comments) {
        
        const commentImg = (typeof comment.author.profile_image === 'string' && comment.author.profile_image)
          ? comment.author.profile_image
          : 'https://www.pngitem.com/pimgs/m/146-1468479_my-profile-icon-blank-profile-picture-circle-hd.png';

        commentContent += `
          <div class="comments-section p-3" style="background-color: rgb(52, 51, 51); margin-bottom: 5px;">
            <img src="${commentImg}" alt="" class="rounded-circle border border-3" style="width: 40px; height: 40px; margin-right: 10px; object-fit: cover;">
            <b style="color:white">@${comment.author.username}</b>
            <div style="color:white; margin-top: 5px;">${comment.body}</div>
          </div>
        `;
      }

      document.getElementById("commentContent").innerHTML = commentContent;
      document.getElementById("ifNoComment").innerHTML = comments.length === 0 ? "No comments yet" : "Comments:";

      // إدخال تعليق جديد
      document.getElementById("addCommentText").innerHTML = `
        <div class="input-container" style="display: flex; align-items: center; padding: 9px;" id="div-addComment">
          <input type="text" id="commentInput" class="form-control" placeholder="Add a comment..." style="flex: 1; margin-right: 10px;">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-send" viewBox="0 0 16 16" style="cursor: pointer; color:white" onclick="createCommentClicked(${post.id})">
            <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576zm6.787-8.201L1.591 6.602l4.339 2.76z"/>
          </svg>
        </div>
      `;
    })
    .catch((error) => {
      console.log(error);
    });
}

// add comment btn function
 function createCommentClicked(id){
   let commentBody = document.getElementById("commentInput").value
   const token = localStorage.getItem("token")
   const url = `https://tarmeezacademy.com/api/v1/posts/${id}/comments`
  if (!token) {
    alert("You must be logged in to comment!");
    return;
  }

  if (!commentBody.trim()) {
    alert("Comment cannot be empty.");
    return;
  }
   let params = {
     "body": commentBody
   }

  axios.post(url,params,{
    headers:{
      "Authorization": `Bearer ${token}`,
    }
  })
  .then(function (response) {
    showModalForComment(id)
    showPost()
  })
  .catch(function (error) {
    console.log(error);
   });
}
 //Show img when click
document.addEventListener("click", function (e) {
  if (e.target && e.target.id === "post-img") {
    const imgSrc = e.target.getAttribute("src");
    document.getElementById("modalImage").src = imgSrc;
    const modal = new bootstrap.Modal(document.getElementById("imageModal"));
    modal.show();
  }
});

function toggleLoader(show = true){
  if(show){
    document.getElementById("loader").style.visibility = 'visible'
  }else{
    document.getElementById("loader").style.visibility = 'hidden'
  }
}


