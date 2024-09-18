const url = "https://tarmeezacademy.com/api/v1"

let currentPage = 1;
let lastPage = 1;
// SCROLL ===============>
  window.addEventListener("scroll", function() {
    const endOfPage = window.innerHeight + window.scrollY >= document.body.offsetHeight;
    console.log(`Scroll event fired. End of Page: ${endOfPage}, Current Page: ${currentPage}, Last Page: ${lastPage}`);
    if (endOfPage && currentPage < lastPage) {
        currentPage += 1;
        showPost(false, currentPage);
    }
});
     
//================>
setupUI()
showPost()

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
      console.log(error);
    });
}

function logoutBtn(){
    localStorage.removeItem("token")
    setupUI()
    console.log("deleted")
}

function registerBtn(){

  let username = document.getElementById("register-username-input").value;
  let password = document.getElementById("register-password-input").value;
  let name = document.getElementById("register-name-input").value;
  let image = document.getElementById("img-username-input").files[0];

    let formData = new FormData()
    formData.append("username",username)
    formData.append("password",password)
    formData.append("name",name)
    formData.append("image",image)
    toggleLoader(true)
  axios.post(`${url}/register`, formData, {
      headers:{
        "Content-Type": "multipart/form-data"
      }
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
      console.log(error);
    });


  const modal = document.getElementById("register-modal");
  const nodalInstance = bootstrap.Modal.getInstance(modal);
  nodalInstance.hide();
}

function profileClicked(){
  let user = getUser()
  let userId = user.id
  window.location = `./profileUserPage.html?userid=${userId}`
}


function showPost(reload = true, page = 1 ) {
  let content = "";
  toggleLoader(true)

  axios.get(`${url}/posts?page=${page}`)
    .then(function (response) {
      toggleLoader(false)
      let user = getUser();
      const token = localStorage.getItem("token");
      const posts = response.data.data || [];
      lastPage = response.data.meta.last_page
      if(reload){
        document.getElementById("posts").innerHTML = ""
      }
      for (let post of posts) {
        let isMyPost = user != null && post.author.id == user.id;
        let btnEditContent = ``;
        if (isMyPost) {
          btnEditContent = 
          `
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" class="bi bi-pencil-square" viewBox="0 0 16 16"  style="color:white; cursor:pointer" id="updateBtn" onclick="btnPostUpdate('${encodeURIComponent(JSON.stringify(post))}')">
                <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"/>
            </svg>

            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" class="bi bi-trash-fill" viewBox="0 0 16 16" style="color:#a32a2a; cursor:pointer" id="deleteBtn" onclick="btnPostDelete('${encodeURIComponent(JSON.stringify(post))}')">
                <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5M8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5m3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0"/>
            </svg>
          `;
        }
        let postImage = (typeof post.image === 'string' && post.image) ? post.image : '';
        let profileImage = (typeof post.author.profile_image === 'string' && post.author.profile_image) ?
         post.author.profile_image : 
         'https://www.pngitem.com/pimgs/m/146-1468479_my-profile-icon-blank-profile-picture-circle-hd.png';
        let author = post.author;
        content += `
          <div class="posts" id="posts">
            <div class="card shadow" style="margin-bottom: 50px; background-color: rgb(52, 51, 51);">
              <div class="card-header  d-flex align-items-center justify-content-between" style="background-color: rgb(52, 51, 51);curser:pointer">
                <div class="d-flex align-items-center" onclick="userClicked(${author.id})" style="cursor:pointer">
                  <img src="${profileImage}" class="rounded-circle border border-4" style="width: 40px; height:40px; margin-right: 10px;">
                  <div>
                    <h4 style="margin: 0; color:white">${author.name}</h4>
                    <div class="d-flex align-items-center">
                      <p style="margin: 0; color:white">@${author.username}</p>
                      <h6 style="margin: 0 0 0 10px; color: rgb(169, 169, 169);">${post.created_at}</h6>
                    </div>
                  </div>
                </div>
                <div id="btnDeleteUpdate" style="margin-left: auto;">
                  ${btnEditContent}
                </div>
              </div>

              <div class="card-body" style="cursor: pointer;">
                <p style="color:white">${post.body}</p>
                ${postImage ? `<img src="${postImage}" class="w-100" style="height: 20%">` : ''}
                <span style="margin-left: 5px;color:white">(${post.comments_count}) Comments</span>
                <span style="margin-left: 5px;color:white">(0) Shares</span>

                <hr style="color:white">
                <div class="d-flex align-items-center" style="color:white;">

                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-heart " viewBox="0 0 16 16" style="margin-left: 15px; cursor: pointer;" id="likeIcon">
                    <path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143q.09.083.176.171a3 3 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15"/>
                  </svg>

                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-chat-dots" viewBox="0 0 16 16" style="margin-left: 30px;cursor:pointer" data-bs-toggle="modal" data-bs-target="#showPostByModal" onclick="showModalForComment(${post.id})">
                    <path d="M5 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0m4 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2"/>
                    <path d="m2.165 15.803.02-.004c1.83-.363 2.948-.842 3.468-1.105A9 9 0 0 0 8 15c4.418 0 8-3.134 8-7s-3.582-7-8-7-8 3.134-8 7c0 1.76.743 3.37 1.97 4.6a10.4 10.4 0 0 1-.524 2.318l-.003.011a11 11 0 0 1-.244.637c-.079.186.074.394.273.362a22 22 0 0 0 .693-.125m.8-3.108a1 1 0 0 0-.287-.801C1.618 10.83 1 9.468 1 8c0-3.192 3.004-6 7-6s7 2.808 7 6-3.004 6-7 6a8 8 0 0 1-2.088-.272 1 1 0 0 0-.711.074c-.387.196-1.24.57-2.634.893a11 11 0 0 0 .398-2"/>
                  </svg>

                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-send" viewBox="0 0 16 16" style="margin-left: 30px;cursor:pointer">
                    <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576zm6.787-8.201L1.591 6.602l4.339 2.76z"/>
                  </svg>

                </div>  
              </div>
            </div>
          </div>
        `;
      }
      const postsContainer = document.getElementById("posts");
      postsContainer.innerHTML = content;
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

  let postModal = new bootstrap.Modal(document.getElementById("addPostWithImg-modal"), {});
  postModal.toggle();
  showPost(true,1)
}

function confirmPostUpdate() {
  const token = localStorage.getItem("token");
  const postId = document.getElementById("post-id-input").value;
  const body = document.getElementById("body-input").value;
  const image = document.getElementById("img-input").files[0]; // يمكن أن يكون غير مطلوب إذا لم تكن هناك صورة

  let formData = new FormData();
  formData.append("body", body);
  if (image) {
    formData.append("image", image);
  }

  axios.put(`${url}/posts/${postId}`, formData, {
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "multipart/form-data"
    }
  })
  .then(function (response) {
    console.log(response);

    const modal = document.getElementById("addPostWithImg-modal");
    const modalInstance = bootstrap.Modal.getInstance(modal);
    modalInstance.hide();
    
    showPost();
    setupUI();
  })
  .catch(function (error) {
    console.log(error);
  });
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

function showModalForComment(id) {

  axios.get(`${url}/posts/${id}`)
    .then((response) => {
      const comments = response.data.data.comments;
      const author = response.data.data.author;
      const post = response.data.data;
      let postImage = (typeof post.image === 'string' && post.image) ? post.image : '';

      let commentProfileImage = author.profile_image && typeof author.profile_image === 'string' ?
      author.profile_image : 
      'https://www.pngitem.com/pimgs/m/146-1468479_my-profile-icon-blank-profile-picture-circle-hd.png';
      document.getElementById("modal-title-forComment").innerHTML = author.username;
      document.getElementById("modal-imgProfile-forComment").src = commentProfileImage;
      document.getElementById("modal-Body-forComment").innerHTML = post.body;
      document.getElementById("modal-imgPost-forComment").src = postImage;

      const addCommentText = `
        <!-- ADD COMMENT -->
        <div class="input-container" style="display: flex; align-items: center; padding: 9px;" id="div-addComment">
          <input type="text" id="commentInput" class="form-control" placeholder="Add a comment..." style="flex: 1; margin-right: 10px;">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-send" viewBox="0 0 16 16" style="cursor: pointer; color:white" onclick="createCommentClicked(${post.id})"  >
            <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576zm6.787-8.201L1.591 6.602l4.339 2.76z"/>
          </svg>      
        </div>
      `;

      if (comments.length === 0) {
        document.getElementById("ifNoComment").innerHTML = "No comments yet";
      }

      let commentContent = ''; 
      for (let comment of comments) {
        commentContent += `
          <!-- COMMENT -->
          <div class="comments-section p-3" style="background-color: rgb(52, 51, 51); margin-bottom: 5px;" id="">
            <!-- img + username -->
            <img src="${comment.author.profile_image}" alt="" class="rounded-circle border border-4" style="width: 50px; height: 50px; margin-right: 10px;">
            <b style="color:white">@${comment.author.username}</b>
            <!-- COMMENT BODY -->
            <div style="color:white; margin-top: 5px;">${comment.body}</div>
          </div>
        `;
      }
      document.getElementById("commentContent").innerHTML = commentContent;
      document.getElementById("addCommentText").innerHTML = addCommentText;
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

function toggleLoader(show = true){
  if(show){
    document.getElementById("loader").style.visibility = 'visible'
  }else{
    document.getElementById("loader").style.visibility = 'hidden'
  }
}

