class OverworldEvent {
  constructor({ map, event }) {
    this.map = map;
    this.event = event;
  }

  stand(resolve) {
    const who = this.map.gameObjects[this.event.who];
    who.startBehavior({
      map: this.map
    }, {
      type: "stand",
      direction: this.event.direction,
      time: this.event.time
    })
    //Set up a handler to complete when correct person is done walking, then resolve the event
    const completeHandler = e => {
      if (e.detail.whoId === this.event.who) {
        document.removeEventListener("PersonStandComplete", completeHandler);
        resolve();
      }
    }
    document.addEventListener("PersonStandComplete", completeHandler)
  }

  walk(resolve) {
    const who = this.map.gameObjects[this.event.who];
    who.startBehavior({
      map: this.map
    }, {
      type: "walk",
      direction: this.event.direction,
      retry: true
    })

    //Set up a handler to complete when correct person is done walking, then resolve the event
    const completeHandler = e => {
      if (e.detail.whoId === this.event.who) {
        document.removeEventListener("PersonWalkingComplete", completeHandler);
        resolve();
      }
    }
    document.addEventListener("PersonWalkingComplete", completeHandler)

  }

  textMessage(resolve) {

    if(this.event.disqualify && window.playerState.storyFlags.includes(this.event.disqualify[0]))
    {
      resolve();
      return;
    }

    if(this.event.required && window.playerState.storyFlags.includes(this.event.required[0])==false)
    {
      resolve();
      return;
    }

    if (this.event.faceHero) {
      const obj = this.map.gameObjects[this.event.faceHero];
      obj.direction = utils.oppositeDirection(this.map.gameObjects["hero"].direction);
    }

    //zwy add
    if(this.event.who){
      //console.log("event:", this.event);
      //this.map.gameObjects[`${this.event.who}`].showLihui();
      document.getElementById(`${this.event.who}`).style.display = "block";
    }

    const message = new TextMessage({
      text: this.event.text,
      onComplete: () =>{
        if(this.event.who){
          //this.map.gameObjects[`${this.event.who}`].hideLihui();
          document.querySelectorAll(".lihui").forEach(item =>{
            item.style.display = "none";
          })          
        }
        resolve();
      } 
    })
    message.init(document.querySelector(".game-container"));
  }

  changeMap(resolve) {

    //Deactivate old objects
    Object.values(this.map.gameObjects).forEach(obj => {
      obj.isMounted = false;
    })

    const sceneTransition = new SceneTransition();
    sceneTransition.init(document.querySelector(".game-container"), () => {
      this.map.overworld.startMap(window.OverworldMaps[this.event.map], {
        x: this.event.x,
        y: this.event.y,
        direction: this.event.direction,
      });
      resolve();
      sceneTransition.fadeOut();
    })
  }

  pause(resolve) {
    this.map.isPaused = true;
    const menu = new PauseMenu({
      progress: this.map.overworld.progress,
      onComplete: (freezeOverworld) => {
        resolve();
        // console.log("www"+this.map.overworld.width); 为什么会console.log两次
        if (!freezeOverworld) {
          this.map.isPaused = false;
          this.map.overworld.startGameLoop();
        }
        else {
          this.map.isPaused = true;
          this.map.overworld.enter.unbind();
          this.map.overworld.esc.unbind();
        }
      }
    });
    menu.init(document.querySelector(".game-container"));
  }

  addStoryFlag(resolve) {
    if(this.event.disqualify && window.playerState.storyFlags.includes(this.event.disqualify))
    {
      resolve();
      return;
    }
 
    if(this.event.required && window.playerState.storyFlags.includes(this.event.required)==false)
    {
      resolve();
      return;
    }
    window.playerState.storyFlags.push(this.event.flag);
    console.log(this.event.flag);
    const currentUsername = window.localStorage.getItem("Sec-Sight-current-username");

    const file = window.localStorage.getItem("second_sight_achievements_" + currentUsername);
    let achievements = file ? JSON.parse(file) : {};
    achievements[this.event.flag] = true;
    window.localStorage.setItem("second_sight_achievements_" + currentUsername, JSON.stringify(achievements));

    resolve();
  }

  choose(resolve) {
    console.log("choose something! begin");
    const chooseMenu = new ChooseMenu({
      choices: this.event.choices,
      onComplete: () => {
        resolve();
      },
      map: this.map,
    })
    chooseMenu.init(document.querySelector(".game-container"));
  }

  gameOver(resolve) {
    console.log("game over! link to" + this.event.path);
    resolve();
    window.open(this.event.path, '_self');
  }

  embedPage(resolve) {
    const completeHandler = () => {
      document.removeEventListener("backToGame", completeHandler);
      document.querySelector("canvas").classList.remove("toEmbed-canvas");
      toEmbed.remove();
      btn.remove();

      resolve();
    }
    document.addEventListener("backToGame", completeHandler);
    const container = this.event.container;

    let toEmbed = document.createElement("iframe");
    toEmbed.src = this.event.toEmbed;
    toEmbed.classList.add("toEmbed");
    document.querySelector("canvas").classList.add("toEmbed-canvas");
    container.appendChild(toEmbed);

    let btn = document.createElement("button");
    btn.innerText = "back to game";
    btn.classList.add("backToGame-button");
    btn.addEventListener("click", () => { utils.emitEvent("backToGame", completeHandler) });
    document.querySelector(".how-to-play").appendChild(btn);
  }

  init() {
    return new Promise(resolve => {
      this[this.event.type](resolve)
    })
  }

}