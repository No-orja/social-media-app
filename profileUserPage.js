const url = "https://tarmeezacademy.com/api/v1"
setupUI()

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
    let editButtons = document.querySelectorAll("#updateBtn");
    let deleteButtons = document.querySelectorAll("#deleteBtn");
    const user = getUser();

    if(token != null){
        logoutDiv.style.setProperty("display", "flex", "important");
        loginDiv.style.setProperty("display", "none", "important");
        editButtons.forEach(btn => btn.style.display = "inline");
        deleteButtons.forEach(btn => btn.style.display = "inline");
        

      if (user) {
        navUser.innerHTML = `@${user.username}`;
        navImg.src = user.profile_image;


      }
    }else{
        logoutDiv.style.setProperty("display", "none", "important");
        loginDiv.style.setProperty("display", "flex", "important");
        editButtons.forEach(btn => btn.style.display = "none");
        deleteButtons.forEach(btn => btn.style.display = "none")
    }
}

function getUser() {
    let user = null;
    let storageUser = localStorage.getItem("user");
    if (storageUser) {
        user = JSON.parse(storageUser);
    }
    return user;
}

function loginBtn(){
    
    let username = document.getElementById("username-input").value
    let password = document.getElementById("password-input").value
    
    axios.post(`${url}/login`, {
        "username": username,
        "password": password
      })
      .then(function (response) {
        const user = JSON.stringify(response.data.user);
        const token = response.data.token 
        localStorage.setItem("token",token)
        localStorage.setItem("user", user);
        console.log(token)
        console.log(user)
        const modal = document.getElementById("Login-modal")
        const nodalInstance = bootstrap.Modal.getInstance(modal)
        nodalInstance.hide()
        
        getUserIdForPage()
        setupUI()
      })
      
      .catch(function (error) {
        console.log(error);
      });
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
    
    axios.post(`${url}/register`, formData, {
        headers:{
          "Content-Type": "multipart/form-data"
        }
      })
      .then(function (response) {
        const user = JSON.stringify(response.data.user);
        const token = response.data.token 
        localStorage.setItem("token",token)
        localStorage.setItem("user", user);
        console.log(token)
        console.log(user)
        
        const modal = document.getElementById("Login-modal")
        const nodalInstance = bootstrap.Modal.getInstance(modal)
        nodalInstance.hide()
        getUserIdForPage()
        setupUI()
      })
      
      .catch(function (error) {
        console.log(error);
      });
  
  
    const modal = document.getElementById("register-modal");
    const nodalInstance = bootstrap.Modal.getInstance(modal);
    nodalInstance.hide();
}
  
function logoutBtn(){
    localStorage.removeItem("token")
    setupUI()
    
    console.log("deleted")
    getUserIdForPage();

}

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
      showAlert(isCreate ? "Failed to create post. Please try again." : "Failed to update post. Please try again.", "alert-danger");
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
            <img src="${commentProfileImage}" alt="" class="rounded-circle border border-4" style="width: 50px; height: 50px; margin-right: 10px;">
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
 
