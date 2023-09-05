class PauseMenu {
  constructor({ progress, onComplete }) {
    this.progress = progress;
    this.onComplete = onComplete;
  }

  getOptions(pageKey) {

    if (pageKey === "root") {
      const saveFile = this.progress.getSaveFile();
      return [
        {
          label: "Save Quickly",
          description: "Save your progress",
          handler: () => {
            this.progress.save();
            this.close();
          }
        },
        saveFile ? {
          label: "Load Quickly",
          description: "Resume your adventure",
          handler: () => {
            this.esc?.unbind();
            this.keyboardMenu.end();
            this.element.remove();
            this.onComplete(true);

            let oldcanvas = document.querySelector(".game-canvas");
            oldcanvas.remove();

            //尝试清楚原先的eventListener
            // let oldGameContainer = document.querySelector(".game-container");
            // let newGameContainer = oldGameContainer.cloneNode(true);
            // oldGameContainer.remove();
            // document.body.appendChild(newGameContainer);

            let canv = document.createElement('canvas');
            canv.classList.add("game-canvas");
            document.querySelector(".game-container").appendChild(canv);
            canv.height = 500;
            canv.width = 800;

            const overworld = new Overworld({
              element: document.querySelector(".game-container")
            });
            window.overworld = overworld;
            overworld.init({
              forbidTitleScreen: true,
              useSaveFile: true,
            });

          }
        } : null,
        {
          label: "Archives",
          description: "Click this to save or load",
          handler: () => {
            this.progress.setWhereToContinue();
            this.close();
            window.open("./progress/archive.html", '_self');
          }
        },
        {
          label: "Achievements",
          description: "Click to see what you have accomplish",
          handler: () => {
            this.progress.setWhereToContinue();
            this.close();
            window.open("./achievements/achievements.html", '_self');
          }
        },
        {
          label: "Title Page",
          description: "Go back to Title Page",
          handler: () => {
            this.close();
            window.open("./MainGame.html", '_self');
          }
        },
        {
          label: "Close",
          description: "Close the pause menu",
          handler: () => {
            this.close();
          }
        },
      ].filter(v => v);
    }

  }

  createElement() {
    this.element = document.createElement("div");
    this.element.classList.add("PauseMenu");
    this.element.classList.add("overlayMenu");
    this.element.innerHTML = (`
      <h2>Pause Menu</h2>
    `)
  }

  close() {
    this.esc?.unbind();
    this.keyboardMenu.end();
    this.element.remove();
    this.onComplete();
  }

  async init(container) {
    this.createElement();
    this.keyboardMenu = new KeyboardMenu({
      descriptionContainer: container
    })
    this.keyboardMenu.init(this.element);
    this.keyboardMenu.setOptions(this.getOptions("root"));

    container.appendChild(this.element);

    utils.wait(200);
    this.esc = new KeyPressListener("Escape", () => {
      this.close();
    })
  }

}