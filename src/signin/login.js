function loginUser() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const storedUserData = localStorage.getItem("userRegistration");
  /*  if (storedUserData) {
        const userData = JSON.parse(storedUserData);
        if (userData.username === username && userData.password === password) {
            alert("登录成功！");
            window.location = "../cover/cover.html";
        } else {
            alert("用户名或密码不正确！");
        }
    } else {
        alert("未找到注册信息，请先注册！");
        window.location = "signin.html";
    }*/
    window.location = "../choose/first.html";
}