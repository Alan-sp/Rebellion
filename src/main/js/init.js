function New_Message(Text)
{
  const message = new TextMessage({
    text: Text,
    onComplete: () =>{
        document.querySelectorAll(".lihui").forEach(item =>{
          item.style.display = "none";
        })          
    } 
  })
  message.init(document.querySelector(".game-container"));
}

(function () {

  // New_Message("跟空壳一样");
  // New_Message("......");
  // New_Message("真是奇怪的家伙");
  // New_Message("......");
  // New_Message("男子只是沉默着接过信封，走向注定的宿命。");
  // New_Message("......");
  // New_Message("只一定要成功啊骑士老爷！北边士兵的命可就全看您了。");
  // New_Message("先别着急走，（士兵边说边从甲胄的缝隙中掏出一封信件）殿下让你时刻带着这个（雪白的信纸被递到男子手中），千万别丢了。");
  // New_Message("话音未落，马车上已传来细微的金属摩擦声，男子一言不发地走向路的尽头。");
  // New_Message("只能到这里了，再往前的话就会被哨塔发现……");
  // New_Message("——吁—— 突如其来的刹车打破了车上的沉默 前方御马的士兵走到马车前。");
  // New_Message("......");
  // New_Message("喂 骑士老爷。您这么受国王重用，一定知道些内幕吧？您说说这帮好吃懒做的家伙到底想干什么啊？");
  // New_Message("......");
  // New_Message("真是的！仗都打这个份上了，这帮人不愿意参军就算了…….还在哪里罢工游行，也不知道这些闹革命的想干嘛。");
  // New_Message("伴随着呼啸的风声，茂密的森林中有几辆马车疾驰而过，车上的士兵有的紧绷神经，眼观四方，有的则谈笑风生，滔滔不绝，身着银铠的男子在人群中沉默不语，显得格格不入。");

  const overworld = new Overworld({
    element: document.querySelector(".game-container")
  });
  window.overworld = overworld;
  overworld.init({});
})();