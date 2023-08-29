var i=0;

function aboutMe(){
    var slogan = document.getElementById("slogan");
    var slogan2 = document.getElementById("slogan2");
    if(i==0){
        i=1;
        slogan.style.height="300px";
        slogan2.innerHTML="    这是今天我头大的个人介绍站，真名王雨轩，来自北京，2004年出生，现就读于北京理工大学，在日常生活中活泼开朗，喜欢打篮球，喜欢音乐，喜欢旅游。<br>    我就读于计算机科学与技术拔尖班，掌握C、python、html等编程语言，有过网站开发与部署经历，参与过项目开发，对编程、开发很感兴趣。<br>    我的志向在于为人类的进步做出一点点贡献，我认为通过开发产品改善人类生活是其中的关键点之一。也因此，我对人工智能很感兴趣。我认为，人工智能的本质和形成过程就是人类不断地认识自己、改善自身的过程。我也非常愿意参与到相关研究中去。<br>    欢迎点击下方按钮查看我的个人主页，也欢迎点击右下按钮与我Email联系！";
    } else {
        i=0;
        slogan.style.height="50px";
        slogan2.innerHTML="朋克人生即将再次袭来...";
    }
    
}


function copytoclipboard(){
    const textToCopy = 'wangyuxuanbilly@163.com';
    navigator.clipboard.writeText(textToCopy);
    var messageBox = document.getElementById("custom-message-box");
        messageBox.style.display = "block";

        setTimeout(function() {
            messageBox.style.display = "none";
        }, 3000);
}

function copytoclipboard1(){
    const textToCopy = '15201637057';
    navigator.clipboard.writeText(textToCopy);
    var messageBox = document.getElementById("custom-message-box");
        messageBox.style.display = "block";

        setTimeout(function() {
            messageBox.style.display = "none";
        }, 3000);
}

function copytoclipboard2(){
    const textToCopy = '3224384112';
    navigator.clipboard.writeText(textToCopy);
    var messageBox = document.getElementById("custom-message-box");
        messageBox.style.display = "block";

        setTimeout(function() {
            messageBox.style.display = "none";
        }, 3000);
}

