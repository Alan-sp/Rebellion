class ChooseMenu {
    constructor({ choices, onComplete }) {
        this.choices = choices;
        this.onComplete = onComplete;
    }

    getOptions(pageKey) {

        //Case 1: Show the first page of options
        if (pageKey === "root") {
            return [
                ...this.choices.map(choice => {//这里必须得用箭头函数，不能用 function(choice) {}
                    return {
                        label: choice.label,
                        description: choice.description,
                        handler: () => {
                            window.playerState.storyFlags[choice.storyflag] = true;

                            //成就系统
                            const currentUsername = window.localStorage.getItem("Sec-Sight-current-username");
                            const file = window.localStorage.getItem("second_sight_achievements_" + currentUsername);
                            let achievements = file ? JSON.parse(file) : {};
                            achievements[choice.storyflag] = true;
                            window.localStorage.setItem("second_sight_achievements_" + currentUsername, JSON.stringify(achievements));

                            this.close();
                        }
                    };
                })
            ]
        }

    }

    createElement() {
        this.element = document.createElement("div");
        this.element.classList.add("ChooseMenu");
        this.element.classList.add("overlayMenu");
        this.element.innerHTML = (`
        <h2>Choose Menu</h2>
      `)
    }

    close() {
        this.keyboardMenu.end();
        this.element.remove();
        this.onComplete();
    }

    init(container) {
        this.createElement();
        this.keyboardMenu = new KeyboardMenu({
            descriptionContainer: container
        })
        this.keyboardMenu.init(this.element);
        this.keyboardMenu.setOptions(this.getOptions("root"));

        container.appendChild(this.element);
    }

}