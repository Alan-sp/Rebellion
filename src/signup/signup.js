function checkForm() {
    let username = document.getElementById('username');
    let psd = document.getElementById('password');
    let rpsd = document.getElementById('re_password');


    if (username.value == "") {
        username.style.border = "1px solid rgba(197,81,58,0.8)";
        alert("please enter your username.");
        return;
    } else {
        username.style.border = " 1px solid rgba(255,255,255,0.3)";
    }

    if (rpsd.value == '' || psd.value == '') {
        alert("please enter your password.");
        return;
    }


    if (psd.value.length < 6) {
        alert("your password is too short.");
        return;
    }

    if (rpsd.value == psd.value) {

        var messageBox = document.getElementById("custom-message-box");
        messageBox.style.display = "block";

        setTimeout(function() {
            messageBox.style.display = "none";
            window.location = "../login/login.html";
        }, 3000);

        
        
        


    } else {
        alert("Failed to certificate your password.");
        rpsd.value = "";
    }

}