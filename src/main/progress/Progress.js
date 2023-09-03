class Progress {
  constructor(id = -1) {
    let currentUsername = localStorage["Sec-Sight-current-username"];
    this.mapId = "Bedroom1";//birthplace, home
    this.startingHeroX = 0;
    this.startingHeroY = 0;
    this.startingHeroDirection = "down";
    this.saveFileKey = "Second_Sight_SaveFile_" + currentUsername + "_" +id;
    this.getTime();
  }

  save() {
    window.localStorage.setItem(this.saveFileKey, JSON.stringify({
      mapId: this.mapId,
      startingHeroX: this.startingHeroX,
      startingHeroY: this.startingHeroY,
      startingHeroDirection: this.startingHeroDirection,
      playerState: {
        storyFlags: playerState.storyFlags
      },
      time: this.time,
    }))
  }

  nowProgress() {
    return JSON.stringify({
      mapId: this.mapId,
      startingHeroX: this.startingHeroX,
      startingHeroY: this.startingHeroY,
      startingHeroDirection: this.startingHeroDirection,
      playerState: {
        storyFlags: playerState.storyFlags
      },
      time: this.time,
    });
  }

  getSaveFile(whereToContinue = null) {

    if (!window.localStorage) {
      return null;
    }

    let whereToLoad = whereToContinue || this.saveFileKey;
    const file = window.localStorage.getItem(whereToLoad);
    return file ? JSON.parse(file) : null
  }

  load(whereToContinue = null) {
    const file = this.getSaveFile(whereToContinue);
    if (file) {
      this.mapId = file.mapId;
      this.startingHeroX = file.startingHeroX;
      this.startingHeroY = file.startingHeroY;
      this.startingHeroDirection = file.startingHeroDirection;
      Object.keys(file.playerState).forEach(key => {
        playerState[key] = file.playerState[key];
      })
    }
  }

  getTime() {
    this.time = new Date();
    this.month = this.time.getMonth() + 1;//得到月份
    this.date = this.time.getDate();//得到日期
    this.hour = this.time.getHours();//得到小时数
    this.minute = this.time.getMinutes();//得到分钟数
  }

  setWhereToContinue() {
    window.localStorage.setItem("second_sight_whereToContinue", JSON.stringify({
      mapId: this.mapId,
      startingHeroX: this.startingHeroX,
      startingHeroY: this.startingHeroY,
      startingHeroDirection: this.startingHeroDirection,
      playerState: {
        storyFlags: playerState.storyFlags
      },
      time: this.time,
    }))
  }
}