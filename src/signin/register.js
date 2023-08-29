function registerUser() {
    let username = document.getElementById('username');
    let psd = document.getElementById('password');
    let rpsd = document.getElementById('re_password');

    if (username==''||rpsd.value == '' || psd.value == '') {
        alert("账号密码不能为空！");
        return;
    }

    if (psd.value.length < 6) {
        alert("密码不能小于6位！");
        return;
    }

    if (rpsd.value == psd.value) {
        const userData = {
            username: username.value,
            password: psd.value 
        };

        localStorage.setItem("userRegistration", JSON.stringify(userData));
        alert("注册成功，即将跳转到登录界面");
        window.location = "login.html";
    } else {
        alert("密码不一致！");
        rpsd.value = "";
    }
}