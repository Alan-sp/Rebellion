(function () {

  const overworld = new Overworld({
    element: document.querySelector(".game-container")
  });
  window.overworld = overworld;
  overworld.init({});
})();