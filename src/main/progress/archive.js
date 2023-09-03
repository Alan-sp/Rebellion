// document.addEventListener('DOMContentLoaded', function () {
// setTimeout(() => {
let archiveContainers = document.querySelectorAll(".glass");
function override(id) {
    const currentUsername = window.localStorage.getItem("Sec-Sight-current-username");
    const nowProgress = window.localStorage.getItem("second_sight_whereToContinue");
    window.localStorage.setItem("Second_Sight_SaveFile_" + currentUsername + "_" + id, nowProgress);

    window.open("../continue.html", '_self');
}

function load(id) {
    const currentUsername = window.localStorage.getItem("Sec-Sight-current-username");
    const nowProgress = window.localStorage.getItem("Second_Sight_SaveFile_" + currentUsername + "_" + id);
    window.localStorage.setItem("second_sight_whereToContinue", nowProgress);

    window.open("../continue.html", '_self');
}
console.log(archiveContainers);
for (let i = 0; i < archiveContainers.length; i++) {
    console.log(i + "###" + archiveContainers[i]);

    const progress = new Progress(i);
    const archiveContainer = archiveContainers[i];
    const file = progress.getSaveFile();

    if (file) {
        //地图名称
        let mapId = archiveContainer.querySelector(".mapId");
        mapId.innerText = file.mapId;

        //存档时间
        let time = document.createElement("p");
        time.innerText = file.time;
        archiveContainer.appendChild(time);

        //读档按钮
        let loadBtn = document.createElement("button");
        loadBtn.innerText = "读档";
        loadBtn.id = i;
        loadBtn.classList.add("load-button");
        loadBtn.onclick = function (e) {
            load(this.id);
        };
        archiveContainer.querySelector(".button-container").appendChild(loadBtn);

        //设置背景为存档处地图
        // archiveContainer.style.backgroundImage = 'url(../images/maps/' + file.mapId + '-lower.png)';
        // archiveContainer.style.backgroundAttachment = "local";
    }

    let overrideBtn = document.createElement("button");
    overrideBtn.innerText = "覆盖该存档";
    overrideBtn.id = i;
    overrideBtn.classList.add("override-button");
    overrideBtn.onclick = function (e) {
        override(this.id);
    };
    archiveContainer.querySelector(".button-container").appendChild(overrideBtn);


}

    // let loadBtns = document.querySelectorAll(".load-button");
    // console.log(loadBtns);
    // });


// }, 1000);
