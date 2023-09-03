(function () {

    const continueGame = window.localStorage.getItem("second_sight_whereToContinue") ? true : false;
    const overworld = new Overworld({
        element: document.querySelector(".game-container")
    });
    window.overworld = overworld;
    overworld.init({
        forbidTitleScreen: continueGame,
        useSaveFile: continueGame,
        continueThere: continueGame,
    });
    
})();