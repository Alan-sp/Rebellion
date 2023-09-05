class TitleScreen {
  constructor({ progress }) {
    this.progress = progress;
  }
  getOptions(resolve) {
    const file = window.localStorage.getItem("end?");
    const safeFile = this.progress.getSaveFile();
    return [
      {
        label: "New Game",
        description: "Start a new adventure.",
        handler: () => {
          this.close();
          resolve();
        }
      },
      safeFile ? {
        label: "Load Quickly",
        description: "Resume your adventure",
        handler: () => {
          this.close();
          resolve(safeFile);
        }
      } : null,
      file ? {
        label: "Awake",
        description: "Begin your new journey",
        handler: () => {
          // window.playerStates.
          this.close();
          resolve();
        }
      } : null,
      {
        label: "Archives",
        description: "Click this to save or load",
        handler: () => {
          window.open("../menu/archive.html", '_self');
          resolve();
        }
      },
      {
        label: "Achievements",
        description: "Click to see what you have accomplish",
        handler: () => {
          window.open("./achievements/achievements.html", '_self');
          resolve();
        }
      },
    ].filter(v => v);
  }

  createElement() {
    this.element = document.createElement("div");
    this.element.classList.add("TitleScreen");
    this.element.innerHTML = (`
      <div id="water"></div>
      <div id="upper"></div>
    `);
  }

  close() {
    this.stopWater();
    this.keyboardMenu.end();
    this.element.remove();
  }

  startWater(){
    this.timeline = new TimelineMax({
        repeat: -1,
        yoyo: true
    });

    let feTurb = document.querySelector('#feturbulence');
    this.timeline.add(
        new TweenMax.to(feTurb, 8, {
            onUpdateParams: [feTurb], //pass the filter element to onUpdate
            onUpdate: function(fe) {
                var bfX = this.progress() * 0.005 + 0.015, //base frequency x
                    bfY = this.progress() * 0.05 + 0.1, //base frequency y
                    bfStr = bfX.toString() + ' ' + bfY.toString(); //base frequency string
                fe.setAttribute('baseFrequency', bfStr);
            }
        }), 0
    );
  }

  stopWater(){
    this.timeline.pause();
  }

  init(container) {
    return new Promise(resolve => {
      this.createElement();
      container.appendChild(this.element);
      this.keyboardMenu = new KeyboardMenu();
      this.keyboardMenu.init(this.element);
      this.keyboardMenu.setOptions(this.getOptions(resolve));
      this.startWater();
    })
  }

}