class OverworldMap {
  constructor(config) {
    this.overworld = null;
    this.gameObjects = {}; // Live objects are in here
    this.configObjects = config.configObjects; // Configuration content


    this.cutsceneSpaces = config.cutsceneSpaces || {};
    this.walls = config.walls || {};

    this.lowerImage = new Image();
    this.lowerImage.src = config.lowerSrc;

    this.upperImage = new Image();
    this.upperImage.src = config.upperSrc;

    this.isCutscenePlaying = false;
    this.isPaused = false;
  }

  drawLowerImage(ctx, cameraPerson) {
    ctx.drawImage(
      this.lowerImage,
      utils.withGrid(8) - cameraPerson.x,
      utils.withGrid(5) - cameraPerson.y
    )
  }

  drawUpperImage(ctx, cameraPerson) {
    ctx.drawImage(
      this.upperImage,
      utils.withGrid(8) - cameraPerson.x,
      utils.withGrid(5) - cameraPerson.y
    )
  }

  isSpaceTaken(currentX, currentY, direction) {
    let { x, y } = utils.nextPosition(currentX, currentY, direction);
    if (this.walls[`${x},${y}`]) {
      return true;
    }
    //Check for game objects at this position
    return Object.values(this.gameObjects).find(obj => {
      if (obj.x === x && obj.y === y) { return true; }
      if (obj.intentPosition && obj.intentPosition[0] === x && obj.intentPosition[1] === y) {
        return true;
      }
      return false;
    })

  }

  mountObjects() {
    Object.keys(this.configObjects).forEach(key => {

      let object = this.configObjects[key];
      object.id = key;

      let instance;
      if (object.type === "Person") {
        instance = new Person(object);
      }
      this.gameObjects[key] = instance;
      this.gameObjects[key].id = key;
      instance.mount(this);
    })
  }

  async startCutscene(events) {
    this.isCutscenePlaying = true;

    for (let i = 0; i < events.length; i++) {
      const eventHandler = new OverworldEvent({
        event: events[i],
        map: this,
      })
      await eventHandler.init();
    }
    this.isCutscenePlaying = false;
  }

  checkForActionCutscene() {
    const hero = this.gameObjects["hero"];
    const nextCoords = utils.nextPosition(hero.x, hero.y, hero.direction);
    const match = Object.values(this.gameObjects).find(object => {
      return `${object.x},${object.y}` === `${nextCoords.x},${nextCoords.y}`
    });
    if (!this.isCutscenePlaying && match && match.talking.length) {

      const relevantScenario = match.talking.find(scenario => {
        if (scenario.disqualify && scenario.disqualify.length !== 0) {
          return (scenario.disqualify).every(sf => {
            return !playerState.storyFlags.includes(sf);
          }) && (scenario.required || []).every(sf => {
            return playerState.storyFlags.includes(sf);
          })
        }
        else {//只有required，和required和disqualify都没有的情况
          return (scenario.required || []).every(sf => {
            return playerState.storyFlags.includes(sf);
          })
        }
      })
      relevantScenario && this.startCutscene(relevantScenario.events)
    }
  }

  checkForFootstepCutscene() {
    const hero = this.gameObjects["hero"];
    // console.log("const hero = this.gameObjects['hero'];");
    const match = this.cutsceneSpaces[`${hero.x},${hero.y}`];
    if (!this.isCutscenePlaying && match) {
      // this.startCutscene(match[0].events)

      const relevantScenario = match.find(scenario => {
        if (scenario.disqualify && scenario.disqualify.length !== 0) {
          // console.log(scenario.disqualify,playerState.storyFlags);
          return (scenario.disqualify).every(sf => {
            return !playerState.storyFlags.includes(sf)
          }) && (scenario.required || []).every(sf => {
            return playerState.storyFlags.includes(sf)
          })
        }
        else {//只有required，和required和disqualify都没有的情况
          return (scenario.required || []).every(sf => {
            return playerState.storyFlags.includes(sf)
          })
        }
      })
      relevantScenario && this.startCutscene(relevantScenario.events)
    }
  }
}

window.OverworldMaps = {
  Intro:{
    id:"Intro",
    lowerSrc: "",
    upperSrc: "",
    configObjects:
    {
        hero: {
          type: "Person",
          isPlayerControlled: true,
          x: utils.withGrid(20),
          y: utils.withGrid(20),
          src: "./images/characters/empty.png",
          useShadow: false,
        },
        Intro1:{
          type:"Person",
          x: utils.withGrid(21),
          y: utils.withGrid(20),
          src: "./images/characters/empty.png",
          talking: [
            {
              events: [
                { who: "interact", type: "textMessage", text: "伴随着呼啸的风声，茂密的森林中有几辆马车疾驰而过，车上的士兵有的紧绷神经，眼观四方，有的则谈笑风生，滔滔不绝，身着银铠的男子在人群中沉默不语，显得格格不入" },
                { who: "interact", type: "textMessage", text: "士兵A：真是的！仗都打这个份上了，这帮人不愿意参军就算了…….还在哪里罢工游行，也不知道这些闹革命的想干嘛。" },
                { who: "interact", type: "textMessage", text: "士兵B：害，还轮不到你操心。我教会那边的朋友都说了，这些不出力的多多少少都是收了魔王钱的!也就是还没被抓到尾巴，等战争结束了一个个都是得上绞刑架的主。" },
                { who: "interact", type: "textMessage", text: "身着银凯的男子：…………." },
                { who: "interact", type: "textMessage", text: "士兵A：喂 骑士老爷。您这么受国王重用，一定知道些内幕吧？您说说这帮好吃懒做的家伙到底想干什么啊？" },
                { who: "interact", type: "textMessage", text: "身着银凯的男子：…………." },
                { who: "interact", type: "textMessage", text: "身着银凯的男子：——吁—— 突如其来的刹车打破了车上的沉默 前方御马的士兵走到马车前。" },
                { who: "interact", type: "textMessage", text: "士兵C：只能到这里了，再往前的话就会被哨塔发现……" },
                { who: "interact", type: "textMessage", text: "话音未落，马车上已传来细微的金属摩擦声，男子一言不发地走向路的尽头。" },
                { who: "interact", type: "textMessage", text: "士兵C：先别着急走，（士兵边说边从甲胄的缝隙中掏出一封信件）殿下让你时刻带着这个（雪白的信纸被递到男子手中），千万别丢了。" },
                { who: "interact", type: "textMessage", text: "士兵B：一定要成功啊骑士老爷！北边士兵的命可就全看您了。" },
                { who: "interact", type: "textMessage", text: "男子只是沉默着接过信封，走向注定的宿命。" },
                { who: "interact", type: "textMessage", text: "………" },
                { who: "interact", type: "textMessage", text: "士兵B：真是奇怪的家伙" },
                { who: "interact", type: "textMessage", text: "………" },
                { who: "interact", type: "textMessage", text: "士兵B：跟空壳一样" },
                {
                  type: "changeMap",
                  map: "Bedroom1",
                  x: utils.withGrid(7),
                  y: utils.withGrid(3),
                  direction: "up"
                }
              ]
            }
          ],
        },
        Intro2:{
          type:"Person",
          x: utils.withGrid(21),
          y: utils.withGrid(20),
          src: "./images/characters/empty.png",
          talking: [
            {
              events: [
                { who: "interact", type: "textMessage", text: "伴随着呼啸的风声，茂密的森林中有几辆马车疾驰而过，车上的士兵有的紧绷神经，眼观四方，有的则谈笑风生，滔滔不绝，身着银铠的男子在人群中沉默不语，显得格格不入" },
                { who: "interact", type: "textMessage", text: "士兵A：真是的！仗都打这个份上了，这帮人不愿意参军就算了…….还在哪里罢工游行，也不知道这些闹革命的想干嘛。" },
                { who: "interact", type: "textMessage", text: "士兵B：害，还轮不到你操心。我教会那边的朋友都说了，这些不出力的多多少少都是收了魔王钱的!也就是还没被抓到尾巴，等战争结束了一个个都是得上绞刑架的主。" },
                { who: "interact", type: "textMessage", text: "身着银凯的男子：…………." },
                { who: "interact", type: "textMessage", text: "士兵A：喂 骑士老爷。您这么受国王重用，一定知道些内幕吧？您说说这帮好吃懒做的家伙到底想干什么啊？" },
                { who: "interact", type: "textMessage", text: "身着银凯的男子：…………." },
                { who: "interact", type: "textMessage", text: "身着银凯的男子：——吁—— 突如其来的刹车打破了车上的沉默 前方御马的士兵走到马车前。" },
                { who: "interact", type: "textMessage", text: "士兵C：只能到这里了，再往前的话就会被哨塔发现……" },
                { who: "interact", type: "textMessage", text: "话音未落，马车上已传来细微的金属摩擦声，男子一言不发地走向路的尽头。" },
                { who: "interact", type: "textMessage", text: "士兵C：先别着急走，（士兵边说边从甲胄的缝隙中掏出一封信件）殿下让你时刻带着这个（雪白的信纸被递到男子手中），千万别丢了。" },
                { who: "interact", type: "textMessage", text: "士兵B：一定要成功啊骑士老爷！北边士兵的命可就全看您了。" },
                { who: "interact", type: "textMessage", text: "男子只是沉默着接过信封，走向注定的宿命。" },
                { who: "interact", type: "textMessage", text: "………" },
                { who: "interact", type: "textMessage", text: "士兵B：真是奇怪的家伙" },
                { who: "interact", type: "textMessage", text: "………" },
                { who: "interact", type: "textMessage", text: "士兵B：跟空壳一样" },
                {
                  type: "changeMap",
                  map: "Bedroom1",
                  x: utils.withGrid(7),
                  y: utils.withGrid(3),
                  direction: "up"
                }
              ]
            }
          ],
        },
        Intro3:{
          type:"Person",
          x: utils.withGrid(19),
          y: utils.withGrid(20),
          src: "./images/characters/empty.png",
          talking: [
            {
              events: [
                { who: "interact", type: "textMessage", text: "伴随着呼啸的风声，茂密的森林中有几辆马车疾驰而过，车上的士兵有的紧绷神经，眼观四方，有的则谈笑风生，滔滔不绝，身着银铠的男子在人群中沉默不语，显得格格不入" },
                { who: "interact", type: "textMessage", text: "士兵A：真是的！仗都打这个份上了，这帮人不愿意参军就算了…….还在哪里罢工游行，也不知道这些闹革命的想干嘛。" },
                { who: "interact", type: "textMessage", text: "士兵B：害，还轮不到你操心。我教会那边的朋友都说了，这些不出力的多多少少都是收了魔王钱的!也就是还没被抓到尾巴，等战争结束了一个个都是得上绞刑架的主。" },
                { who: "interact", type: "textMessage", text: "身着银凯的男子：…………." },
                { who: "interact", type: "textMessage", text: "士兵A：喂 骑士老爷。您这么受国王重用，一定知道些内幕吧？您说说这帮好吃懒做的家伙到底想干什么啊？" },
                { who: "interact", type: "textMessage", text: "身着银凯的男子：…………." },
                { who: "interact", type: "textMessage", text: "身着银凯的男子：——吁—— 突如其来的刹车打破了车上的沉默 前方御马的士兵走到马车前。" },
                { who: "interact", type: "textMessage", text: "士兵C：只能到这里了，再往前的话就会被哨塔发现……" },
                { who: "interact", type: "textMessage", text: "话音未落，马车上已传来细微的金属摩擦声，男子一言不发地走向路的尽头。" },
                { who: "interact", type: "textMessage", text: "士兵C：先别着急走，（士兵边说边从甲胄的缝隙中掏出一封信件）殿下让你时刻带着这个（雪白的信纸被递到男子手中），千万别丢了。" },
                { who: "interact", type: "textMessage", text: "士兵B：一定要成功啊骑士老爷！北边士兵的命可就全看您了。" },
                { who: "interact", type: "textMessage", text: "男子只是沉默着接过信封，走向注定的宿命。" },
                { who: "interact", type: "textMessage", text: "………" },
                { who: "interact", type: "textMessage", text: "士兵B：真是奇怪的家伙" },
                { who: "interact", type: "textMessage", text: "………" },
                { who: "interact", type: "textMessage", text: "士兵B：跟空壳一样" },
                {
                  type: "changeMap",
                  map: "Bedroom1",
                  x: utils.withGrid(7),
                  y: utils.withGrid(3),
                  direction: "up"
                }
              ]
            }
          ],
        },
        Intro4:{
          type:"Person",
          x: utils.withGrid(20),
          y: utils.withGrid(21),
          src: "./images/characters/empty.png",
          talking: [
            {
              events: [
                { who: "interact", type: "textMessage", text: "伴随着呼啸的风声，茂密的森林中有几辆马车疾驰而过，车上的士兵有的紧绷神经，眼观四方，有的则谈笑风生，滔滔不绝，身着银铠的男子在人群中沉默不语，显得格格不入" },
                { who: "interact", type: "textMessage", text: "士兵A：真是的！仗都打这个份上了，这帮人不愿意参军就算了…….还在哪里罢工游行，也不知道这些闹革命的想干嘛。" },
                { who: "interact", type: "textMessage", text: "士兵B：害，还轮不到你操心。我教会那边的朋友都说了，这些不出力的多多少少都是收了魔王钱的!也就是还没被抓到尾巴，等战争结束了一个个都是得上绞刑架的主。" },
                { who: "interact", type: "textMessage", text: "身着银凯的男子：…………." },
                { who: "interact", type: "textMessage", text: "士兵A：喂 骑士老爷。您这么受国王重用，一定知道些内幕吧？您说说这帮好吃懒做的家伙到底想干什么啊？" },
                { who: "interact", type: "textMessage", text: "身着银凯的男子：…………." },
                { who: "interact", type: "textMessage", text: "身着银凯的男子：——吁—— 突如其来的刹车打破了车上的沉默 前方御马的士兵走到马车前。" },
                { who: "interact", type: "textMessage", text: "士兵C：只能到这里了，再往前的话就会被哨塔发现……" },
                { who: "interact", type: "textMessage", text: "话音未落，马车上已传来细微的金属摩擦声，男子一言不发地走向路的尽头。" },
                { who: "interact", type: "textMessage", text: "士兵C：先别着急走，（士兵边说边从甲胄的缝隙中掏出一封信件）殿下让你时刻带着这个（雪白的信纸被递到男子手中），千万别丢了。" },
                { who: "interact", type: "textMessage", text: "士兵B：一定要成功啊骑士老爷！北边士兵的命可就全看您了。" },
                { who: "interact", type: "textMessage", text: "男子只是沉默着接过信封，走向注定的宿命。" },
                { who: "interact", type: "textMessage", text: "………" },
                { who: "interact", type: "textMessage", text: "士兵B：真是奇怪的家伙" },
                { who: "interact", type: "textMessage", text: "………" },
                { who: "interact", type: "textMessage", text: "士兵B：跟空壳一样" },
                {
                  type: "changeMap",
                  map: "Bedroom1",
                  x: utils.withGrid(7),
                  y: utils.withGrid(3),
                  direction: "up"
                }
              ]
            }
          ],
        },
        Intro:{
          type:"Person",
          x: utils.withGrid(20),
          y: utils.withGrid(19),
          src: "./images/characters/empty.png",
          talking: [
            {
              events: [
                { who: "interact", type: "textMessage", text: "伴随着呼啸的风声，茂密的森林中有几辆马车疾驰而过，车上的士兵有的紧绷神经，眼观四方，有的则谈笑风生，滔滔不绝，身着银铠的男子在人群中沉默不语，显得格格不入" },
                { who: "interact", type: "textMessage", text: "士兵A：真是的！仗都打这个份上了，这帮人不愿意参军就算了…….还在哪里罢工游行，也不知道这些闹革命的想干嘛。" },
                { who: "interact", type: "textMessage", text: "士兵B：害，还轮不到你操心。我教会那边的朋友都说了，这些不出力的多多少少都是收了魔王钱的!也就是还没被抓到尾巴，等战争结束了一个个都是得上绞刑架的主。" },
                { who: "interact", type: "textMessage", text: "身着银凯的男子：…………." },
                { who: "interact", type: "textMessage", text: "士兵A：喂 骑士老爷。您这么受国王重用，一定知道些内幕吧？您说说这帮好吃懒做的家伙到底想干什么啊？" },
                { who: "interact", type: "textMessage", text: "身着银凯的男子：…………." },
                { who: "interact", type: "textMessage", text: "身着银凯的男子：——吁—— 突如其来的刹车打破了车上的沉默 前方御马的士兵走到马车前。" },
                { who: "interact", type: "textMessage", text: "士兵C：只能到这里了，再往前的话就会被哨塔发现……" },
                { who: "interact", type: "textMessage", text: "话音未落，马车上已传来细微的金属摩擦声，男子一言不发地走向路的尽头。" },
                { who: "interact", type: "textMessage", text: "士兵C：先别着急走，（士兵边说边从甲胄的缝隙中掏出一封信件）殿下让你时刻带着这个（雪白的信纸被递到男子手中），千万别丢了。" },
                { who: "interact", type: "textMessage", text: "士兵B：一定要成功啊骑士老爷！北边士兵的命可就全看您了。" },
                { who: "interact", type: "textMessage", text: "男子只是沉默着接过信封，走向注定的宿命。" },
                { who: "interact", type: "textMessage", text: "………" },
                { who: "interact", type: "textMessage", text: "士兵B：真是奇怪的家伙" },
                { who: "interact", type: "textMessage", text: "………" },
                { who: "interact", type: "textMessage", text: "士兵B：跟空壳一样" },
                {
                  type: "changeMap",
                  map: "Bedroom1",
                  x: utils.withGrid(7),
                  y: utils.withGrid(3),
                  direction: "up"
                }
              ]
            }
          ],
        },
    }
  },
  Bedroom1: {//记得这里首字母大写
    id: "Bedroom1",
    lowerSrc: "./images/maps/1_floor1.png",
    upperSrc: "",
    configObjects: {
      hero: {
        type: "Person",
        isPlayerControlled: true,
        x: utils.withGrid(7),
        y: utils.withGrid(3),
        useShadow: true,
      },

      piano:{
        type:"Person",
        x: utils.withGrid(3),
        y: utils.withGrid(2),
        src: "./images/characters/empty.png",
        talking: [
          {
            events: [
              { who: "interact", type: "textMessage", text: "你看着这架古老而诡异的钢琴，心中渐生疑窦。" },
              { who: "hero", type: "textMessage", text: "这究竟是怎么回事。" },
              { type: "addStoryFlag", flag: "end?" },
            ]
          }
        ],
      },

      doors1:
      {
        type:"Person",
        x: utils.withGrid(11),
        y: utils.withGrid(1),
        src: "./images/characters/empty.png",
        talking: [
          {
            events: [
              { disqualify:"doorkey",who: "interact", type: "textMessage", text: "魔石铸造的大门紧闭着，你轻轻的敲击俩下，似乎不是蛮力能破坏的，不起眼的锁眼吸引了你的注意，似乎只有找到钥匙才能通往下一层。" },
              { required:"doorkey",who: "interact", type: "textMessage", text: "你将钥匙插入生锈的铁索，伴随着清脆的转动声，岩石磨蹭的动静于耳畔响起，诡异的圆盘从石板中浮现，拨开层层浮土，歪斜的石刻向你讲述着一个谜题" },
              { required:"doorkey",type: "addStoryFlag", flag: "door_opened" },
            ]
          }
        ],
      },
      food:
      {
        type:"Person",
        x: utils.withGrid(8),
        y: utils.withGrid(8),
        src: "./images/characters/empty.png",
        talking: [
          {
            events: [
              {who: "interact", type: "textMessage", text: "桌子上摆着许多残羹剩饭，但不难看出佳肴的美味" },
              // { required:"doorkey",type: "addStoryFlag", flag: "door_opened" },
            ]
          }
        ],
      },
      paintings:
      {
        type:"Person",
        x: utils.withGrid(19),
        y: utils.withGrid(1),
        src: "./images/characters/empty.png",
        talking: [
          {
            events: [
              {who: "interact", type: "textMessage", text: "墙上摆着许许多多的名画" },
              // { required:"doorkey",type: "addStoryFlag", flag: "door_opened" },
            ]
          }
        ],
      }
    },
    cutsceneSpaces: {
      [utils.asGridCoord(7, 3)]: [{
        disqualify:["Seen_intro"],
        events: [
              { type: "textMessage", text: "经过一阵跋涉你终于得以解开魔都神秘的面纱来到了地牢的一层，多亏士兵的掩护，你在森林中并未受到多少阻拦" },
              { type: "textMessage", text: "成功到达使你在阴森腐臭的地牢反倒感到一阵轻松，你从胸前拿出那张雪白的信纸，伴着微弱的火光，漆黑的笔墨诉说着你的使命----------" },
              { type: "addStoryFlag",flag: "Seen_intro"},
          ]
    }],
      [utils.asGridCoord(1, 2)]: [{
        events: [
          {
            type: "changeMap",
            map: "dungen",
            x: utils.withGrid(2),
            y: utils.withGrid(2),
            direction: "right"
          },
        ]
    }],
     [utils.asGridCoord(11, 2)]: [{
        required:["door_opened"],
        events: [
        {
          type: "changeMap",
          map: "bossroom",
          x: utils.withGrid(6),
          y: utils.withGrid(11),
          direction: "right"
        },
      ]
    }],
      [utils.asGridCoord(21, 4)]: [{
        events: [
          {
            type: "changeMap",
            map: "Floor1",
            x: utils.withGrid(2),
            y: utils.withGrid(6),
            direction: "right"
          },
        ]
      }],

    },
    walls: function () {
      let walls = {};
      ["0,1","0,2","0,3","0,4","0,5","0,6","0,7","0,8","0,9","0,10","0,11","0,12",
      "2,1","3,1","4,1","5,1","6,1","7,1","8,1",
      "1,11",
      "2,11",
      "2,12",
      "2	,11",
      "3	,11",
      "4	,12",
      "5	,12",
      "6	,12",
      "7	,12",
      "8	,12",
      "9	,12",
      "10	,13",
      "11	,13",
      "12	,12",
      "13	,12",
      "14	,12",
      "15	,12",
      "16	,12",
      "17	,12",
      "18	,12",
      "19	,11",
      "20	,11",
      "20	,11",
      "21	,11",
      "21	,11",
      "21	,10",
      "21	,9",
      "21	,8",
      "21	,7",
      "21	,6",
      "21	,5",
      "22	,4",
      "21	,3",
      "21	,2",
      "21	,1",
      "20	,1",
      "19	,1",
      "18	,1",
      "17	,1",
      "16	,1",
      "15	,1",
      "14	,1",
      "13	,1",
      "12	,1",
      "11	,1",
      "10	,1",
      "9	,1",
      "8	,1",
      "7	,1",
      "6	,1",
      "5	,1",
      "4	,1",
      "3	,1",
      "2	,1",
      "1	,1",
      "3	,2",
      "1	,4",
      "2	,4",
      "4	,4",
      "9	,2",
      "9	,3",
      "13	,2",
      "13	,3",
      "8	,6",
      "9	,6",
      "10	,6",
      "11	,6",
      "12	,6",
      "13	,6",
      "8	,7",
      "9	,7",
      "10	,7",
      "11	,7",
      "12	,7",
      "13	,7",
      "9	,10",
      "12	,10",
      "13	,10",
      "8,8",
      "9,8",
      "10,8",
      "11,8",
      "12,8",
      "13,8",
      "14,8",
      "14,7",
    ].forEach(coord => {
        let [x, y] = coord.split(",");
        walls[utils.asGridCoord(x, y)] = true;
      })
      return walls;
    }(),
  },
  Floor1:{
    id: "Floor1",
    lowerSrc: "./images/maps/2_Floor1.png",
    upperSrc: "",
    configObjects: {
      hero: {
        type: "Person",
        isPlayerControlled: true,
        x: utils.withGrid(3),
        y: utils.withGrid(5),
        useShadow: true,
      },
    },
    cutsceneSpaces: {
      [utils.asGridCoord(2, 6)]: [
        {
          events: [
            {
              type: "changeMap",
              map: "Bedroom1",
              x: utils.withGrid(2),
              y: utils.withGrid(8),
              direction: "up"
            }
          ]
        }
      ],
    },
    walls: function () {
      let walls = {};
      [ "2	,2",
        "3	,2",
        "4	,2",
        "5	,1",
        "6	,1",
        "7	,2",
        "7	,3",
        "7	,4",
        "7	,5",
        "8	,5",
        "9	,5",
        "10	,5",
        "8	,2",
        "9	,2",
        "10	,2",
        "11	,2",
        "12	,2",
        "13	,3",
        "13	,4",
        "13	,5",
        "13	,6",
        "13	,7",
        "13	,8",
        "13	,9",
        "12	,10",
        "11	,10",
        "10	,10",
        "9	,10",
        "8	,10",
        "7	,10",
        "6	,10",
        "5	,10",
        "4	,10",
        "3	,10",
        "2	,10",
        "1	,9",
        "1	,8",
        "1	,7",
        "1	,5",
        "1	,4",
        "1	,3",
        "0	,5",
        "0	,7",
        "3	,7",
        "4	,7",
        "5	,7",
        "6	,7",
        "10	,7",
        "10	,8",
        "11	,7",
        "11	,8",
    ].forEach(coord => {
        let [x, y] = coord.split(",");
        walls[utils.asGridCoord(x, y)] = true;
      })
      return walls;
    }(),
  },
  dungen: {
    id: "dungen",
    lowerSrc: "./images/maps/dungen.png",
    upperSrc: "",
    configObjects: {
      hero: {
        type: "Person",
        isPlayerControlled: true,
        x: utils.withGrid(3),
        y: utils.withGrid(5),
        useShadow: true,
      },

      Girl:
      {
        type:"Person",
        x: utils.withGrid(11),
        y: utils.withGrid(8),
        src: "./images/characters/empty.png",
        talking:[
        {
            disqualify:["Girl_Talked"],
            events:[
            { who:"hero",type:"textMessage",text:"（焦急地）这声音，难道是帝国的冒险者吗？请救救我！我已经被困在这里太久了！"},
            { type:"textMessage",text:"声音远远传来，像是从过去传来的呼救，火把的光芒逐渐揭开了黑暗中的谜团，揭示出一个瘦小的身影，被锁链紧紧束缚在石柱上。她双眼被黑色布料遮蔽，身上的衣物褴褛不堪，映衬着她那露出疮口的皮肤，似乎是在默默地述说着自己的苦难"},
            { who:"hero",type:"textMessage",text:"（少女的惨状微微勾起了你的同情心，但身上的重任容不得你放下丝毫警戒）你是哪支部队的？帝国军中从未见过你的面孔。"},
            { who:"hero",type:"textMessage",text:"（急切地解释）你不认识我也是正常的。我是108团的指挥官，碍于平民出身，我总是佩戴头盔隐藏身份。"},
            { who:"hero",type:"textMessage",text:"（深思熟虑）阿斯蒙蒂娅……她怎么会将一位军官关押在这里？（这似乎并不符合她的作风）她可不会放过如何劳动力，就算是军官也不该被关在这里。"},
            { who:"hero",type:"textMessage",text:"（苦涩地解释）我的部队也被困在这里，魔王恐怕我会煽动哗变，所以将我关押单独一处。请你帮我脱离困境，我的士兵们定会在你需要的时候伸出援手！"},
            { type:"textMessage",text:"少女的提议正中你的下怀，多一份力量总好过单打独斗，可心头却又涌上一股不安，脑中不时闪现陌生的回忆，搅乱着你的思绪，为了完成国王的愿望，你该…….."},
            {
              type: "choose",
              choices: [
                {
                  label: "伺机偷袭，以绝后患",
                  description: "",
                  // storyflag: "Girl_Talked",
                  events:[
                      { type:"textMessage",text:"思考良久后，你终于做出了选择"},
                      { who:"hero",type:"textMessage",text:"离远一点，我帮你砍断锁链。"},
                      { who:"hero",type:"textMessage",text:"谢谢你，冒险者。你的选择将带来改变，我会…….."},
                      { type:"textMessage",text:"话音未落，沉重的锁链已落在地上，随后如注的鲜血侵蚀于地板的间隙中，你的剑刃毫不留情地划过空气，将束缚少女的锁链斩断，同时将少女本人一刀刺穿。"},
                      { who:"hero",type:"textMessage",text:"（虚弱地）你…你是怎么发现的…"},
                      { type:"textMessage",text:"你的表情依然冷漠，看不出丝毫变化，显然仅凭几段模糊的记忆无法确定少女的真伪，但有两件事你是确定的，首先，国王的命令不容失败。其次，这场“谋杀”没有目击者……"},
                      { type:"textMessage",text:"片刻后，少女魔王的身躯在血泊中显现，与此同时你还在她身上找到了一把破旧的钥匙，显然通往下一层的道路已在你眼前显现。"},
                      { type: "addStoryFlag", flag: "doorkey" },
                      { type: "addStoryFlag", flag: "Girl_Talked" },
                  ]

                },
                {
                  label: "保持怀疑，无视请求",
                  description: "",
                  storyflag: "badend1",
                  events:[
                    { type:"textMessage",text:"脑中闪现的回忆让你意识到事情的蹊跷，你不愿将信任托付给这样一个素未相识又疑点重重的人，你决定保持警惕，不被少女的请求所动摇。"},
                    { who:"hero",type:"textMessage",text:"（语气冷漠）你的故事听起来颇具说服力，但我需要更多的证据来确认你的身份。"},
                    { who:"hero",type:"textMessage",text:"（失望和无奈地低下头）我明白你的怀疑。或许在你的眼中，我只是一个陌生的声音而已。"},
                    { type:"textMessage",text:"你没有再多说什么，转身离开了密室，将少女留在了那里。你的内心仍在犹豫，但还是决定相信自己的直觉。然而背后传来的声响打断了你的思考，顷刻间，一道锁链已出现在你面前，下一秒它便死死扼住你的咽喉令你动弹不得，你用尽全身力气转过头去寻找着力量的主人，只看到一张血盆大口向你袭来，锁骨粉碎的声音成为了你最后的遗言。"},
                  ]
                },
                {
                  label: "斩断锁链，解救少女",
                  description: "",
                  storyflag: "badend1",
                  events:[
                    { type:"textMessage",text:"也许是少女正中下怀的提议，也许是少女倾国倾城的妆容，你的冷漠为少女所融化，紧握着武器，目光坚定，转瞬间挥动剑刃，将锁链斩断，释放了少女。"},
                    { who:"hero",type:"textMessage",text:"自由之感充盈，感激地看着你）谢谢你，冒险者。你的善举将永远铭记于心。"},
                    { type:"textMessage",text:"你微笑着点头，小心翼翼地搀扶着少女走出了密室。然而，当你踏出阴影却发现身后少女精致的五官崩解成三瓣，露出了形态可怖的尖牙利齿，在你震惊之余，地城的阴影凝聚成人性，数个体态扭曲的生物向你袭来……..最后“少女”的肆意狂笑回荡在你最后的意识中。"},
                  ]
                },
              ],
            },
          ],
        }
        ],
      },
    },
    cutsceneSpaces: {
      [utils.asGridCoord(1, 2)]: [
        {
          events: [
            {
              type: "changeMap",
              map: "Bedroom1",
              x: utils.withGrid(2),
              y: utils.withGrid(8),
              direction: "up"
            }
          ]
        }
      ],
    },
    walls: function () {
      let walls = {};
      ["2, 2",
       "3, 2",
       "4, 2",
       "5, 2",
       "6, 2",
       "7, 2",
       "8, 1",
       "9, 2",
       "10, 2",
       "11, 1",
       "12, 2",
       "12, 3",
       "11, 4",
       "10, 4",
       "10, 5",
       "10, 6",
       "11, 7",
       "10, 9",
       "11, 10",
       "12, 11",
       "11, 12",
       "10, 12",
       "9, 12",
       "8, 12",
       "7, 11",
       "6, 11",
       "5, 11",
       "4, 11",
       "3, 12",
       "2, 11",
       "1, 11", 
       "0, 10",
       "0, 9",
       "0, 8",
       "0, 7",
       "0, 6",
       "0, 5",
       "0, 4",
       "0, 3",
       "0, 2",
       "0, 1",
       "1, 1",
       "6, 9",
       "6, 8",
       "6, 7",
       "6, 6",
      ].forEach(coord => {
        let [x, y] = coord.split(",");
        walls[utils.asGridCoord(x, y)] = true;
      })
      return walls;
    }(),
  },
  bossroom: {
    id: "bossroom",
    lowerSrc: "./images/maps/bossroom.png",
    upperSrc: "",
    configObjects: {
      hero: {
        type: "Person",
        isPlayerControlled: true,
        x: utils.withGrid(6),
        y: utils.withGrid(14),
        useShadow: true,
      },  
    },
    cutsceneSpaces: {
      [utils.asGridCoord(6, 14)]: [
        {
          events: [
            {
              type: "changeMap",
              map: "Bedroom1",
              x: utils.withGrid(2),
              y: utils.withGrid(8),
              direction: "up"
            }
          ]
        }
      ],
      [utils.asGridCoord(6, 2)]: [
        {
          events: [
            {
              type: "changeMap",
              map: "hall",
              x: utils.withGrid(2),
              y: utils.withGrid(8),
              direction: "up"
            }
          ]
        }
      ],
      [utils.asGridCoord(6, 12)]: [
        {
          disqualify:["Seen_intro2"],
          events: [
            { type:"textMessage",text:"伴随着谜题的破解，古老的石板一分为二，随后紧闭的石门裂开一道缝隙，你悄悄靠近，仔细打量着门后的房间，却发现来了意外的身影"},
            { type:"textMessage",text:"雷比利恩：（阿斯蒙蒂娅？她不是应该在前线指挥吗？为什么会出现在这里？）"},
            { type:"textMessage",text:"在疑惑之余，一位随从从房间的另一边进入，似乎有什么在通报什么消息，阿斯蒙蒂娅的注意也完全被吸引了过去，这似乎是个突入的好机会，但二人交谈的内容又让你十分好奇，为了完成国王的愿望，你该…….."},
            {
              type: "choose",
              choices: [
                {
                  label: "继续观察，收集情报",
                  description: "",
                  // storyflag: "Girl_Talked",
                  events:[
                      { type:"textMessage",text:"显然阿斯蒙蒂娅的出现不在帝国的考量中，谁知道在背后是否有着更多的阴谋，为了完成国王的命令，你决定收集更多的情报，来拼凑出这背后的真相"},
                      { who:"hero",type:"textMessage",text:"是北方哨站传来的信件，大人，前线已经开战了，帝国预计投入了200多万人，中央集团军和南方部队都被投入了进去。"},
                      { who:"hero",type:"textMessage",text:"阿斯蒙蒂娅：看来帝国也是下了血本啊，为了掩护这边的行动，连这种“佯攻”都做的出来"},
                      { type:"textMessage",text:"属下：大人，没有您的坐镇，纵使暂居有利地势，北方军也只会被全灭，再漂亮的战损比也没有意义，抓不到俘虏，劳动力也补充不上，这样下去….."},
                      { who:"hero",type:"textMessage",text:"阿斯蒙蒂娅：你说的没错，一般的战争打到最后都是场消耗战，在局部战役上我们节节胜利，但在大体战略上，则落入下风，一方面即将功覆的城池被帝国付之一炬，让我们只能得到一片焦土，另一方面教会又将其嫁祸给我们，煽动仇恨以圣战之名换来远远不断的兵员，最后在瑞达尼亚之战我们更是损失了一员大将。到此刻在战略层面我们已经宣告失败，但还有一样筹码没有被放入赌局。"},
                      { type:"textMessage",text:"属下：另外一件神器？"},
                      { type:"textMessage",text:"阿斯蒙蒂娅：正是如此，贪婪的帝国以神器为诱饵发动战争，逼我们败后出卖更多的土地，而此刻占尽上分的他们竟想连这点饵料也要夺回！"},
                      { type:"textMessage",text:"属下：所以他们才派出雷比利恩来刺杀魔王，却没想到我们早已做好准备，那魔王又怎么敢笃定神器会在一个小小的骑士身上？"},
                      { type:"textMessage",text:"阿斯蒙蒂娅：神器的力量只有另一件神器才能撼动，也正因如此它才能成为撼动战局的筹码，为了保证万无一失国王一定会把另一件神器交给他，而我们将利用这份贪婪扭转一切。"},
                      { type:"textMessage",text:"属下：还有一件事 大人，安排在密室的朵芮拉已经三个小时没有回信了……."},
                      { type:"textMessage",text:"阿斯蒙蒂娅：是吗（故意放慢语调，将头缓缓转向大门的方向）"},
                      { type: "addStoryFlag", flag: "Seen_intro2" },
                  ]
                },
                {
                  label: "抓住机会，先发制人",
                  description: "",
                  // storyflag: "badend1",
                  events:[
                    { type:"textMessage",text:"显然此刻阿斯蒙蒂娅的注意还在与属下的交谈中，丝毫没有察觉远处的大门已被缓缓推开一道缝隙。"},
                    { who:"hero",type:"textMessage",text:"雷比利恩：现在攻击的话一定可以给予她重创"},
                    { who:"hero",type:"textMessage",text:"说罢，你摘下背后的长弓，伴随着沉重的呼吸声慢慢舒展紧绷的弓弦，缓慢而又简单，将望山慢慢对向目标，不料移动的弓把触碰到了石墙，发出的声音渺小却又清脆"},
                    { who:"hero",type:"textMessage",text:"雷比利恩:(该死，刚刚的声音暴露了我)"},
                    { type:"textMessage",text:"嘴上的咒骂无法挽回眼下的局面，你立刻放开手中的弓弦，淬毒的箭矢划过优美的弧线却被一旁的属下挡住"},
                    { who:"hero",type:"textMessage",text:"懦弱之人，给我滚出来!"},
                    { type:"textMessage",text:"话音未落，炙热的火舌如一把长剑刺穿了石铸的大门，早有准备的你立马跳开，下一秒身旁的掩体便在烈焰中分崩离析，你拍拍身上的尘灰，踏出沸腾的蒸汽，直面阿斯蒙蒂娅。"},
                    { type: "addStoryFlag", flag: "Seen_intro2" },
                  ]
                },
              ],
            },
          ]
        }
      ],
      [utils.asGridCoord(6, 10)]: [
        {
          required:["Seen_intro2"],
          events: [
            { type:"textMessage",text:"伴随着蒸汽的散去，赤色的瞳孔从白雾中显现，在国王的计划中，这些干部无论是否处于王城，都不过是帝国征途下的猎物，而此刻对方的眼神更像蛰伏已久的猎手，她从容的坐下，率先向你开了口。"},
            { type:"textMessage",text:"阿斯蒙蒂娅：你能到这里，说明朵芮拉已经失败了吧，可惜了我费尽心思为她伪造的身份，说吧你是怎么识破的？"},
            { who:"hero",type:"textMessage",text:"雷比利恩：（沉默不语）"},
            { who:"hero",type:"textMessage",text:"阿斯蒙蒂娅：仔细想来，知道108团团长生死的应该只有第三干部才对，但那家伙已经下地狱了，也就是说……..你在根本没法确认身份的情况下杀死了她，对吧？"},
            { who:"hero",type:"textMessage",text:"雷比利恩：这都是为了帝国的百姓，在这里多待一秒……"},
            { who:"hero",type:"textMessage",text:"还没容你说完，对面传来的声响便打断了你的回击，下一秒座上的阿斯蒙蒂娅便大笑起来，冷酷而尖锐，仿佛是一把锋利的刀刃，轻易地刺穿了你的言辞"},
            { who:"hero",type:"textMessage",text:"阿斯蒙蒂娅：“为了帝国的百姓”？炸毁商人的屋舍是为了百姓？焚烧贫农的土地是为了百姓？ 你不过是服务王室的一条忠犬，为了维持他们的胜利干出这些事情的你，真的相信这句话吗？"},
            { who:"hero",type:"textMessage",text:"雷比利恩：（不屑的说到）不然呢？让你们这些魔族佬把平民抓起来当奴隶，然后在他们自己的土地上被剥削到死？"},
            { who:"hero",type:"textMessage",text:"你本以为你的言语会扳回一城，却没想到对方的回答更加凌厉。"},
            { who:"hero",type:"textMessage",text:"阿斯蒙蒂娅： 我不否认这一点，但那只是对人类。那你们呢？拥有最多土地，为百姓而战的国王，却将他的臣民送上绞刑架，只因他们渴望自己的土地。这难道不算你口中的剥削吗？"},
            { who:"hero",type:"textMessage",text:"如此恶毒的指控让你怒火中烧，却又找不出话语去说服她，或者说，说服你自己。你只好放弃这场“辩论”，让刀剑代替你的唇齿。"},
            { who:"hero",type:"textMessage",text:"雷比利恩：这么喜欢颠倒黑白，就让我带你的项上人头区去与国王争论吧（默默将剑举起）"},
            { who:"hero",type:"textMessage",text:"阿斯蒙蒂娅： 说实话，我并不觉得自己能战胜神器的持有者……..(轻蔑一笑)但我也不觉得自己会败给一只无头苍蝇（炽热的烈焰在掌中成形）"},
            { type:"textMessage",text:"下半场开始了"},
            { type: "embedPage", container: document.querySelector(".game-container"), toEmbed: "./fight/demo_turn.html"},
            { type:"textMessage",text:"很明显，你的刀剑比唇齿更加灵动，几轮交锋下，阿斯蒙蒂娅已偏体鳞伤，她再一次将手中的魔力凝聚成火焰，却顿时化为四溅的火花消散在空气中，身体重重摔在地板上。"},
            { who:"hero",type:"textMessage",text:"雷比利恩：（慢慢走去，抓起她的头发）别给我死了，你脑子里的东西可比你重要多了。"},
            { type:"textMessage",text:"地上的阿斯蒙蒂娅沉默着，好像失去了意志。"},
            { who:"hero",type:"textMessage",text:"雷比利恩：（你挥起拳头重重砸向她的疮口）喂！快起来，现在轮到我向你问话了"},
            { type:"textMessage",text:"剧烈的疼痛让阿斯蒙蒂娅在哀嚎中清醒，但她的意志依旧顽强。"},
            { who:"hero",type:"textMessage",text:"阿斯蒙蒂娅：（虚弱的语气）我跟你这种劣等生物没什么好讲的。"},
            { who:"hero",type:"textMessage",text:"雷比利恩：我也觉得你会这么说，没事我们可以慢慢聊（从腰间掏出匕首）"},
            { who:"hero",type:"textMessage",text:"阿斯蒙蒂娅：你还真是……..没有人性啊（颤抖的双手打了一个响指）"},
            { type:"textMessage",text:"响指声回荡在空气，脚下的血液隐隐传来灼热的气息，顿感不妙的你立刻翻身躲到一边，顷刻间阿斯蒙蒂娅消失在自己烈焰中，在最后她保留了身为魔王干部的尊严。好在房间并无大碍，也许这里还有情报等待你发掘"},  
          ]
        }
      ],
    },
    walls: function () {
      let walls = {};
      [
      ].forEach(coord => {
        let [x, y] = coord.split(",");
        walls[utils.asGridCoord(x, y)] = true;
      })
      return walls;
    }(),
  },
  hall: {
    id: "hall",
    lowerSrc: "./images/maps/hall.png",
    upperSrc: "",
    configObjects: {
      hero: {
        type: "Person",
        isPlayerControlled: true,
        x: utils.withGrid(3),
        y: utils.withGrid(5),
        useShadow: true,
      },
      door:{
        type: "Person",
        x: utils.withGrid(11),
        y: utils.withGrid(1),
        src: "./images/characters/empty.png",
        talking: [
          {
            events: [
              { disqualify:"Ashram_key",who: "interact", type: "textMessage", text: "与第一层一样，通往下一层的大门依旧紧锁着，看来只有找到这层的钥匙才能继续。" },
              { required:"Ashram_key",who: "interact", type: "textMessage", text: "你熟练地将钥匙插入锁孔，下一秒相似的石盘从门上浮现，但石刻上的谜语，已有些许不同。" },
              { required:"Ashram_key",type: "addStoryFlag", flag: "door2_opened" },
            ]
          }
        ],
      }
    },
    cutsceneSpaces: {
      [utils.asGridCoord(11, 13)]: [
        {
          events: [
            {
              type: "changeMap",
              map: "Bedroom1",
              x: utils.withGrid(2),
              y: utils.withGrid(8),
              direction: "up"
            }
          ]
        }
      ],
      [utils.asGridCoord(21, 3)]: [
        {
          events: [
            {
              type: "changeMap",
              map: "cell",
              x: utils.withGrid(2),
              y: utils.withGrid(8),
              direction: "up"
            }
          ]
        }
      ],
      [utils.asGridCoord(11, 2)]: [
        {
          required:["door2_opened"],
          events: [
            {
              type: "changeMap",
              map: "Ashram",
              x: utils.withGrid(2),
              y: utils.withGrid(8),
              direction: "up"
            }
          ]
        }
      ],
    },
    walls: function () {
      let walls = {};
      [
        
      ].forEach(coord => {
        let [x, y] = coord.split(",");
        walls[utils.asGridCoord(x, y)] = true;
      })
      return walls;
    }(),
  },
  attic: {
    id: "attic",
    lowerSrc: "./images/maps/attic-lower.png",
    upperSrc: "./images/maps/attic-upper.png",
    configObjects: {
      hero: {
        type: "Person",
        isPlayerControlled: true,
        x: utils.withGrid(3),
        y: utils.withGrid(5),
        useShadow: true,
      },
      poizen: {
        type: "Person",
        x: utils.withGrid(5),
        y: utils.withGrid(3),
        src: "./images/characters/empty.png",
        talking: [
          {
            events: [
              { who: "interact", type: "textMessage", text: "一瓶毒药。虽然光看颜色就知道这不是好惹的东西，但是瓶子上还是规矩地印着骷髅头的标志。不知道为什么会摆在在这里，好像已经被人打开过了。" },
            ]
          }
        ],
      },
      window: {
        type: "Person",
        x: utils.withGrid(3),
        y: utils.withGrid(2),
        src: "./images/characters/empty.png",
        talking: [
          {
            events: [
              { who: "interact", type: "textMessage", text: "你依然如此向往窗外的风景。好吧，阁楼外阳光明媚绿草如茵，满意了？23333" },
            ]
          }
        ],
      },
      bear: {
        type: "Person",
        x: utils.withGrid(8),
        y: utils.withGrid(5),
        src: "./images/characters/empty.png",
        talking: [
          {
            events: [
              { who: "interact", type: "textMessage", text: "一只破旧的玩具熊，怀里好像有一张纸条。" },
              { who: "interact", type: "textMessage", text: "【纸条上歪歪扭扭写着】：我看不见了。爸爸妈妈到现在都没回来，他们是不是不要我了，不...不，不会的，不会的，不会的吧……我……（字迹凌乱看不清了）" },
            ]
          }
        ],
      },
      bed3: {
        type: "Person",
        x: utils.withGrid(2),
        y: utils.withGrid(3),
        src: "./images/characters/empty.png",
        talking: [
          {
            events: [
              { who: "interact", type: "textMessage", text: "你果然还是这么懒，见到床就想躺！床上干干净净什么都没有！" },
            ]
          }
        ],
      },
      bed4: {
        type: "Person",
        x: utils.withGrid(2),
        y: utils.withGrid(4),
        src: "./images/characters/empty.png",
        talking: [
          {
            events: [
              { who: "interact", type: "textMessage", text: "你果然还是这么懒，见到床就想躺！床上干干净净什么都没有！" },
            ]
          }
        ],
      },
      tape: {
        type: "Person",
        x: utils.withGrid(6),
        y: utils.withGrid(3),
        src: "./images/characters/empty.png",
        talking: [
          {
            events: [
              { who: "interact", type: "textMessage", text: "一份磁盘。或许可以通过电视机看看它里面的东西。" },
              { type: "addStoryFlag", flag: "tape" },
            ]
          }
        ],
      },
      luggage: {
        type: "Person",
        x: utils.withGrid(4),
        y: utils.withGrid(7),
        src: "./images/characters/empty.png",
        talking: [
          {
            events: [
              { who: "interact", type: "textMessage", text: "一个遗物箱。旁边的墙壁上好像有字。" },
            ]
          }
        ],
      },
      words: {
        type: "Person",
        x: utils.withGrid(5),
        y: utils.withGrid(8),
        src: "./images/characters/empty.png",
        talking: [
          {
            events: [
              { who: "interact", type: "textMessage", text: "路易斯，记住，死的本该是你，不是你的女儿瑞雯--路易斯.哈里森" },
              { who: "interact", type: "textMessage", text: "女儿，妈妈对不起你。如果我们多陪陪你...也许你就不会抑郁症严重到做傻事去喝那瓶毒药了--莫莉.哈里森"},
              { type: "textMessage", text: "看得出来，哈里森夫妇对女儿瑞雯的死追悔莫及。" },
            ]
          }
        ],
      },
      machine: {
        type: "Person",
        x: utils.withGrid(6),
        y: utils.withGrid(7),
        src: "./images/characters/empty.png",
        talking: [
          {
            disqualify: ["over2", "key-to-garden"],
            events: [
              { who: "interact", type: "textMessage", text: "这是一台发电机，但是又不止发电机..." },
              { who: "hero", type: "textMessage", text: "【克莱尔】：哈里森先生曾经说过，这是一所房子里最危险的东西，引爆它可以把整个房子炸成灰烬。" },
              { who: "hero", type: "textMessage", text: "【克莱尔】：......他们偷走了我爸爸妈妈的尸体，也偷走了他们的声音和记忆，不问我的意愿成为我的“家人”。而我一直对此一无所知，甚至还叫他们爸爸妈妈......" },
              { who: "hero", type: "textMessage", text: "【克莱尔】：现在，有了这台发电机......" },
              {
                type: "choose",
                choices: [
                  {
                    label: "你要报仇，炸掉这所房子",
                    description: "让暴风雨来得更猛烈些吧。",
                    storyflag: "over2",
                  },
                  {
                    label: "你要去花园，找工程师",
                    description: "或许会有惊喜呢？",
                    storyflag: "key-to-garden",
                  }
                ],
              },
            ]
          }
        ],
      },
    },
    cutsceneSpaces: {
      [utils.asGridCoord(2, 6)]: [
        {
          events: [
            {
              type: "changeMap",
              map: "livingroom",
              x: utils.withGrid(1),
              y: utils.withGrid(8),
              direction: "down"
            }
          ]
        }
      ],
      [utils.asGridCoord(2, 7)]: [
        {
          disqualify: ["SEEN_INTRO6"],
          events: [
            { type: "addStoryFlag", flag: "SEEN_INTRO6" },
            { who: "hero", type: "textMessage", text: "【克莱尔】：这里...有好多小孩的东西。" },
            { who: "hero", type: "textMessage", text: "【克莱尔】：果然，我一定是被他们绑架来的..." },
            { who: "hero", type: "textMessage", text: "【克莱尔】：爸爸...妈妈..." },
          ]
        }
      ],
      [utils.asGridCoord(2, 5)]: [
        {
          disqualify: ["SEEN_INTRO6"],
          events: [
            { type: "addStoryFlag", flag: "SEEN_INTRO6" },
            { who: "hero", type: "textMessage", text: "【克莱尔】：这里...有好多小孩的东西。" },
            { who: "hero", type: "textMessage", text: "【克莱尔】：果然，我一定是被他们绑架来的..." },
            { who: "hero", type: "textMessage", text: "【克莱尔】：爸爸...妈妈..." },
          ]
        },
      ],
      [utils.asGridCoord(1, 6)]: [
        {
          disqualify: ["SEEN_INTRO6"],
          events: [
            { type: "addStoryFlag", flag: "SEEN_INTRO6" },
            { who: "hero", type: "textMessage", text: "【克莱尔】：这里...有好多小孩的东西。" },
            { who: "hero", type: "textMessage", text: "【克莱尔】：果然，我一定是被他们绑架来的..." },
            { who: "hero", type: "textMessage", text: "【克莱尔】：爸爸...妈妈..." },
          ]
        },
      ],
      [utils.asGridCoord(3, 6)]: [
        {
          disqualify: ["SEEN_INTRO6"],
          events: [
            { type: "addStoryFlag", flag: "SEEN_INTRO6" },
            { who: "hero", type: "textMessage", text: "【克莱尔】：这里...有好多小孩的东西。" },
            { who: "hero", type: "textMessage", text: "【克莱尔】：果然，我一定是被他们绑架来的..." },
            { who: "hero", type: "textMessage", text: "【克莱尔】：爸爸...妈妈..." },
          ]
        },
      ],
      [utils.asGridCoord(6, 5)]: [
        {
          disqualify: ["free-over2"],
          required: ["over2"],
          events: [
            { type: "gameOver", path: "./gameover/over2.html" },//相对game.html的文件路径，而不是相对OverworldMap.js!!!
            { type: "addStoryFlag", flag: "free-over2" },
          ]
        },
        {
          required: ["key-to-garden"],
          disqualify: ["SEEN_INTRO7"],
          events: [
            { type: "addStoryFlag", flag: "SEEN_INTRO7" },
            { who: "hero", type: "textMessage", text: "【克莱尔】：...冷静下来。这到底是怎么回事，我又为什么能重见光明......" },
            { who: "hero", type: "textMessage", text: "【克莱尔】：......" },
            { who: "hero", type: "textMessage", text: "【克莱尔】：我想，我知道谁能为我解惑了。" },
            { who: "hero", type: "textMessage", text: "【克莱尔】：威尔叔叔是厉害的工程师，也是爸爸妈妈的老朋友。虽然不确定他知不知道我和爸爸妈妈发生的事......但是他一定愿意帮我。" },
          ]
        },
      ],
      [utils.asGridCoord(5, 6)]: [
        {
          disqualify: ["free-over2"],
          required: ["over2"],
          events: [
            { type: "gameOver", path: "./gameover/over2.html" },//相对game.html的文件路径，而不是相对OverworldMap.js!!!
            { type: "addStoryFlag", flag: "free-over2" },
          ]
        },
        {
          required: ["key-to-garden"],
          disqualify: ["SEEN_INTRO7"],
          events: [
            { type: "addStoryFlag", flag: "SEEN_INTRO7" },
            { who: "hero", type: "textMessage", text: "【克莱尔】：...冷静下来。这到底是怎么回事，我又为什么能重见光明......" },
            { who: "hero", type: "textMessage", text: "【克莱尔】：......" },
            { who: "hero", type: "textMessage", text: "【克莱尔】：我想，我知道谁能为我解惑了。" },
            { who: "hero", type: "textMessage", text: "【克莱尔】：威尔叔叔是厉害的工程师，也是爸爸妈妈的老朋友。虽然不确定他知不知道我和爸爸妈妈发生的事......但是他一定愿意帮我。" },
          ]
        },
      ],
      [utils.asGridCoord(7, 6)]: [
        {
          disqualify: ["free-over2"],
          required: ["over2"],
          events: [
            { type: "gameOver", path: "./gameover/over2.html" },//相对game.html的文件路径，而不是相对OverworldMap.js!!!
            { type: "addStoryFlag", flag: "free-over2" },
          ]
        },
        {
          required: ["key-to-garden"],
          disqualify: ["SEEN_INTRO7"],
          events: [
            { type: "addStoryFlag", flag: "SEEN_INTRO7" },
            { who: "hero", type: "textMessage", text: "【克莱尔】：...冷静下来。这到底是怎么回事，我又为什么能重见光明......" },
            { who: "hero", type: "textMessage", text: "【克莱尔】：......" },
            { who: "hero", type: "textMessage", text: "【克莱尔】：我想，我知道谁能为我解惑了。" },
            { who: "hero", type: "textMessage", text: "【克莱尔】：威尔叔叔是厉害的工程师，也是爸爸妈妈的老朋友。虽然不确定他知不知道我和爸爸妈妈发生的事......但是他一定愿意帮我。" },
          ]
        },
      ],
     
    },
    walls: function () {
      let walls = {};
      ["1,8", "2,8", "3,8", "4,8", "5,8", "6,8", "7,8", "8,8",
        "0,7", "4,7", "6,7", "9,7", "7,7", "8,7",
        "8,6", "0,6",
        "8,5", "0,5",
        "9,4", "2,4", "1,4",
        "9,3", "7,3", "6,3", "5,3", "2,3", "1,3", "8,3",
        "8,2", "7,2", "6,2", "5,2", "4,2", "3,2", "2,2", "1,2",
      ].forEach(coord => {
        let [x, y] = coord.split(",");
        walls[utils.asGridCoord(x, y)] = true;
      })
      return walls;
    }(),
  },
  cell: {
    id: "cell",
    lowerSrc: "./images/maps/cell.png",
    upperSrc: "",
    configObjects: {
      hero: {
        type: "Person",
        isPlayerControlled: true,
        x: utils.withGrid(3),
        y: utils.withGrid(5),
        useShadow: true,
      },
      dwarf: {
        type: "Person",
        x: utils.withGrid(3),
        y: utils.withGrid(10),
        useShadow: true,
        src: "./images/characters/empty.png",
        talking: [
          {
            events: [
              { who: "interact", type: "textMessage", text: "房间的角落的牢笼中端坐着一个神秘的人影，你握紧手上的利刃，慢慢靠近，却不曾想到对方先开了口。" },
              { who: "interact", type: "textMessage", text: "神秘的人影：人类？我可没听说摩拉克斯有囚禁人类工匠。" },
              { who: "interact", type: "textMessage", text: "独特的口音加上房间的布局，让你立马分辨出对方的身份——这是给被强征的矮人工匠，考虑到帝国与矮人国的友好关系，你斩断了铁锁，推开牢门。" },
              { who: "hero", type: "textMessage", text: "雷比利恩：帝国派我来此执行任务，我正在这里收集线索，请将你知道的，有关摩拉克斯的一切告诉我，我会带你离开这里。 " },
              { who: "interact", type: "textMessage", text: "矮人:谢谢你的善举，年轻人，只可惜摩拉克斯远比他展现的更谨慎，我在这里几个月所接触的，不过只有武器的锻造工作而已，没法向你提供有利的情报。" },
              { who: "hero", type: "textMessage", text: "雷比利恩:我理解你的苦衷，现在矮人国和人类已经达成了对魔族的统一战线，我们可以一起结束这场战争（伸出手）" },
              { who: "hero", type: "textMessage", text: "矮人:只是你的战争，孩子，我没有兴趣与你一同砍下陌生人的头颅，为他人铸剑非我所愿，现在我已恢复自由，何去何从是我决定" },
              { who: "hero", type: "textMessage", text: "旁白:说罢，矮人从床上起身，默默走向柜子从中翻找着什么，片刻后端出一筐铁器" },
              { who: "hero", type: "textMessage", text: "矮人:事到如今，我的这些作品也不该再成为刽子手的帮凶了，但这块盾牌你就拿去吧，我相信你会用它去守护而非屠戮，谢谢你让我能让我做出自己的选择。" },
              { who: "interact", type: "textMessage", text: "矮人一边等待着你的回答，一边将木筐拖向熔炉。你本只在意摩拉克斯的情报，无意向矮人索要报酬，但显然凝聚矮人精华的刀枪剑戟胜过你手中平平无奇的破铜烂铁，比起那副盾牌也更具诱惑力，可矮人国名义上还是帝国的盟友，为了完成国王的愿望，你该…….." },
              {
                type: "choose",
                choices: [
                  {
                    label: "武力胁迫，据为己有",
                    description: "",
                    // storyflag: "Girl_Talked",
                    events:[
                        { type:"textMessage",text:"旁白：虽然矮人的盾牌足以助你一臂之力，但为了保证任务的万无一失，你还需要更多助力，为此你不惜以武力相威胁。"},
                        { who:"hero",type:"textMessage",text:"雷比利恩：（将剑指向矮人）很可惜，只有沾血的利刃才能换来永久的和平，请你留下这批武器，我会用它们结束这一切，我保证。"},
                        { who:"hero",type:"textMessage",text:"矮人：（失望的眼神）以战争获得的和平只能以战争维护，执迷于暴力的你，只会带来更多的鲜血，真正的和平不需要你这样的人 "},
                        { type:"textMessage",text:"矮人从杂乱的铁器中抽出一把长柄铁锤，精致的锻工让你为之沉沦，而它的主人早已摆好架势，身经百战的你马上意识到了问题的严重性，此人绝不简单。"},
                        { type:"textMessage",text:"……………….."},
                        { who:"hero",type:"矮人：只有这种程度吗？"},
                        { type:"textMessage",text:"看似笨重的铁锤稳稳接下你的攻击，紧接着又快速击碎你的关节，短短几个回合你便瘫倒在地，再无翻身可能。"},
                        { who:"hero",type:"雷比利恩：救….救我……"},
                        { who:"hero",type:"矮人再一次挥锤，而你已无力躲闪，一个可笑的念头在你脑中闪过………….”要是有块盾牌就好了”"},
                        { type: "gameOver", path: "./gameover/over3.html" }
                    ]
  
                  },
                  {
                    label: "欣然笑纳，鸣金启航",
                    description: "",
                    storyflag: "",
                    events:[
                      { who:"hero",type:"textMessage",text:"雷比利恩:真是精湛的工艺啊，我会珍重使用，带着它终结这场战争。"},
                      { type:"textMessage",text:"坚实的盾牌让你信心倍增，肩上的重量也提醒着你的重任，有太多无关的人被牵扯了，这场战争该结束了"},
                      { type:"addStoryFlag",flag:"shield"},
                    ]
                  },
                  {
                    label: "但为正义，不图回报",
                    description: "",
                    storyflag: "",
                    events:[
                      { who:"hero",type:"textMessage",text:"雷比利恩：我无意向您索要报酬，我只想早日结束这场战争，不该再有人牵扯进去了，成为刽子手的只有我这样的人就够了"},
                      { type:"textMessage",text:"你转过身去头也不回的走向门口，却被身后的矮人叫住"},
                      { who:"hero",type:"textMessage",text:"矮人：没想到语气冰冷的你，竟会做出回答。"},
                      { who:"hero",type:"textMessage",text:"矮人：不过（上下打量着）可能正是你这样的人才能做出不同的选择吧，（伸手）这是武器库的钥匙，里面的武器虽远远不如我的做工，但哪里兴许还有你需要的信息。"},
                      { type:"addStoryFlag",flag:"Arsenal_Key"},
                      { who:"hero",type:"textMessage",text:"雷比利恩：谢谢，（坚定的语气）我会结束这场战争的。"},
                      { who:"hero",type:"interact",text:"带着钥匙与决心，你再一次转身"},
                    ]
                  },
                ],
              },
            ]
          }
        ],
      },
      channel: {
        type: "Person",
        x: utils.withGrid(8),
        y: utils.withGrid(2),
        useShadow: true,
        src: "./images/characters/empty.png",
        talking: [
          {
            events: [
              { disqualify:"Ashram_key",who: "interact", type: "textMessage", text: "在这个肮脏的水槽下，好像有什么在闪闪发光。" },
              { disqualify:"Ashram_key",who: "hero", type: "textMessage", text: "这……一把钥匙？" },
              { type: "addStoryFlag",flag: "Ashram_key"},
            ]
          }
        ],
      },
    },

    cutsceneSpaces: {
      [utils.asGridCoord(1, 6)]: [
        {
          events: [
            {
              type: "changeMap",
              map: "hall",
              x: utils.withGrid(2),
              y: utils.withGrid(8),
              direction: "up"
            }
          ]
        }
      ],
    },
    walls: function () {
      let walls = {};
      [
      ].forEach(coord => {
        let [x, y] = coord.split(",");
        walls[utils.asGridCoord(x, y)] = true;
      })
      return walls;
    }(),
  },
  Ashram: {
    id: "Ashram",
    lowerSrc: "./images/maps/Ashram.png",
    upperSrc: "",
    configObjects: {
      hero: {
        type: "Person",
        isPlayerControlled: true,
        x: utils.withGrid(6),
        y: utils.withGrid(13),
        useShadow: true,
      },
    },
    cutsceneSpaces: {
      [utils.asGridCoord(5, 14)]: [
        {
          events: [
            {
              type: "changeMap",
              map: "hall",
              x: utils.withGrid(2),
              y: utils.withGrid(8),
              direction: "up"
            }
          ]
        }
      ],
      [utils.asGridCoord(6, 14)]: [
        {
          events: [
            {
              type: "changeMap",
              map: "hall",
              x: utils.withGrid(2),
              y: utils.withGrid(8),
              direction: "up"
            }
          ]
        }
      ],
      [utils.asGridCoord(6, 12)]: [
        {
          disqualify:["Seen_intro3"],
          events: [
            {type:"textMessage",text:"有第一层的经验，你已不再苦恼于谜题的破解，很快伴着滑块复位的声音，沉重的石门露出一丝缝隙，谨慎的你依旧选择了暗中观察。"},
            { who: "hero", type: "textMessage", text: "雷比利恩：（两个人，一个看体型无疑是摩拉克斯，另外一个则是术师的打扮）" },
            { who: "hero", type: "textMessage", text: "术士：以上就是潜伏在教会的间谍带来的情报，接下来我将把这些传达给魔王" },
            { who: "hero", type: "textMessage", text: "摩拉克斯：原来如此（将纸递给术士），难怪国王会感派他一个人来，快去把这情报带给魔王，前方已经传来阿斯蒙蒂娅战败的消息，想必此时他已身处这层，我们已经没有多少时间可以浪费了" },
            { who: "hero", type: "textMessage", text: "术士：大人无须担忧（挥动着手中的魔杖，吟唱起咒语）" },
            {type:"textMessage",text:"咒语虽晦涩难懂，但你立马意识到了它的含义——传送."},
            {type:"textMessage",text:"你顿感不妙，还未得知情报内容的你不敢估计其传播的后果，可眼前的术士明显不是平庸之辈，贸然袭击只会召至腹背受敌，但此刻你已没有多少时间去犹豫，为了完成国王的愿望，你该…….."},
            {type:"addStoryFlag",flag:"Seen_intro3"},
            {
              type: "choose",
              choices: [
                {
                  label: "即刻出击，打断传送",
                  description: "",
                  // storyflag: "Girl_Talked",
                  events:[
                      { type:"textMessage",text:"即使承担如此风险，你也不愿让这份情报溜走，你张开弓弦，念起熟悉的咒语，随后穿过缝隙的羽箭化作一小阵剑雨，划过空气的声音惊动了房间的二人。"},
                      { who:"hero",type:"textMessage",text:"摩拉克斯：有敌袭！。"},
                      { type:"textMessage",text:"机敏的术士立马张开护盾将，阵阵剑雨化作魔力消散在空气中，但那支实实在在的箭矢，精准的命中了他手中的牛皮纸，下一秒远处的钢丝连带着箭与信纸一并回收"},
                      { who:"hero",type:"textMessage",text:"术士：可恶！一开始的目标就是情报吗。"},
                      { who:"hero",type:"textMessage",text:"摩拉克斯：事已至此不必追悔了，我掩护你，现在开始跑还能口头传达给魔王"},
                      { who:"hero",type:"textMessage",text:"术士：大人…….至少让我最后再帮您一把"},
                      { type:"textMessage",text:"古老的魔杖在再一次舞动，顷刻间摩拉克斯庞大的身躯被诡异的红光所笼罩，难以预估的魔力从房间尽头传来。上一秒还沉浸在截获情报的你此刻将要面对一头真正的凶兽。"},
                      { type: "addStoryFlag", flag: "Seen_intro2" },
                  ]
                },
                {
                  label: "等待时机，暂避锋芒",
                  description: "",
                  // storyflag: "badend1",
                  events:[
                    { type:"textMessage",text:"虽然眼前的情报十分重要，但倘若为此丢掉性命才是得不偿失，你决定等待术士的离去，再单独与摩拉克斯决斗。"},
                    { type:"textMessage",text:"借助着传送魔法的闪光，你你将淬毒的匕首甩出，渴望用这奇袭来先发制人，但霎那间，摩拉克斯的臂膀已举至半空，快到产生残影，下一秒你的飞刀已被他稳稳接住。"},
                    { who:"hero",type:"textMessage",text:"摩拉克斯：出来吧，雷比利恩，我知道你在哪里"},
                    { type:"textMessage",text:"计划的破产让你不得不面对眼前的现实，你默默安慰自己，至少躲开了术士，如此恐怖的肉体若遇到魔法的加持定会将你人类的身躯轻易碾碎，你倒吸一口凉气，跨过石铸的门槛，直面眼前的凶兽"},
                  ]
                },
              ],
            },

          ]
        }
      ],
      [utils.asGridCoord(6, 9)]: [
        {
          required:["Seen_intro3"],
          events: [
            { who: "hero", type: "textMessage", text: "摩拉克斯：看来的你力量真的不容小觑，就算是那个阿斯蒙蒂娅也没能减缓你的步伐。" },
            { who: "hero", type: "textMessage", text: "雷比利恩：（冷笑）你这种体格的怪物，还会去夸赞别人的拳脚？有如此力量的你为什么会甘愿退居二线，这副躯体在战场上才来的更加自在吧。" },
            { who: "hero", type: "textMessage", text: "摩拉克斯：如你所说，我曾抱着同样的想法参与了第四次人魔战争，和所有魔族的年轻人一样自顾自的相信其他民族的鲜血定能换来国家的繁荣与昌盛。"},
            { who: "hero", type: "textMessage", text: "摩拉克斯：可结果呢，一纸和书便失去了318万平方公里的土地和17吨黄金，却只换来短短30余年的和平" },
            { who: "hero", type: "textMessage", text: "雷比利恩：如此厌恶战争的你，如今又为何站在这里，你所改良的武器和军代系统，带来了远超你双手的死亡，别告诉我你不知道" },
            { who: "hero", type: "textMessage", text: "摩拉克斯：那你呢人类，你知道那318万公里的土地可以产出多少煤矿吗？那17吨黄金能换来多少粮草吗？当你们在夺来的土地上焚火取暖时，又有多少魔族在寒风中活活饿死？" },
            { who: "hero", type: "textMessage", text: "雷比利恩：我理解你的愤怒，但在当时看来只有这样削弱你们的国力，才能避免下一场战争的爆发" },
            { who: "hero", type: "textMessage", text: "摩拉克斯：避免战争？在你们起草那张合约的时候战争就已经爆发了，那318万公理的要塞咽喉便是今日你们驻扎的前线，那17吨黄金换来的便是如今你手里的凶器，最清楚下一次战争将要到来并位置准备的就是你们人类自己。" },
            { type:"textMessage",text:"面对摆在眼前的事实，你顿时哑口无言，教会只向你讲述了牺牲英烈的勇敢，国王只向你展示了帝国庞大的疆土，却没人告诉你这背后的代价"},
            { who: "hero", type:"textMessage",text:"雷比利恩：可如今的你为什么又要选择加入这场战争呢"},
            { who: "hero", type:"textMessage",text:"摩拉克斯：选择？假使每个人只为他自己的信念去打仗，就没有战争了，此刻我能做的至少协助魔王，避免我们失去剩下的领土。"},
            { type:"textMessage",text:"沉重的话题让房间陷入死寂，你曾以为的战争英雄，魔王干部，此刻更像一个被卷入漩涡的普通人，而你仿佛就是下一个"},
            { who: "hero", type:"textMessage",text:"雷比利恩：说了这么多，你我不过终究还是敌人罢了，既然帝国早已埋下仇恨的种子，那我所能做的也只有把它扼杀在摇篮中，为此我接受你的仇恨（举起手中的双间）"},
            { who: "hero", type:"textMessage",text:"摩拉克斯：（释然的笑）同样手染鲜血的我又怎会加恨于你，王国需要残忍的人，就好像自然需要狼一样。"},
            { type:"textMessage",text:"此刻，外面的一切对二人都不再重要，空阔的房间中，唯有两头野兽等待共舞"},
            { type: "embedPage", container: document.querySelector(".game-container"), toEmbed: "./fight/demo_turn.html"},
          ]
        }
      ],
    },
    walls: function () {
      let walls = {};
      [
      ].forEach(coord => {
        let [x, y] = coord.split(",");
        walls[utils.asGridCoord(x, y)] = true;
      })
      return walls;
    }(),
  },
  basement: {
    id: "basement",
    lowerSrc: "./images/maps/basement-lower.png",
    upperSrc: "./images/maps/basement-upper.png",
    configObjects: {
      hero: {
        type: "Person",
        isPlayerControlled: true,
        x: utils.withGrid(5),
        y: utils.withGrid(3),
        useShadow: true,
      },
      window: {
        type: "Person",
        x: utils.withGrid(5),
        y: utils.withGrid(2),
        src: "./images/characters/empty.png",
        talking: [
          {
            events: [
              { who: "interact", type: "textMessage", text: "出现在地下室的神奇窗户。窗外是一堵砖墙，你试探着推了推，发现窗户并不能打开。" },
              { who:'hero', type: "textMessage", text: "【克莱尔】：......" },
              { who:'hero', type: "textMessage", text: "【克莱尔】：............好吧。" },
            ]
          }
        ],
      },
      box: {
        type: "Person",
        x: utils.withGrid(4),
        y: utils.withGrid(3),
        src: "./images/characters/empty.png",
        talking: [
          {
            events: [
              { who: "interact", type: "textMessage", text: "一个看起来十分敦实的箱子。" },
              { who: "interact", type: "textMessage", text: "确实，阁楼拉出器听起来感觉应该是放在箱子里的，可惜这个箱子里并没有。这个时候你突然（被编剧）灵光一现，觉得自己也许应该去别的角落里看看。" },
            ]
          }
        ],
      },
      attic_key: {
        type: "Person",
        x: utils.withGrid(1),
        y: utils.withGrid(9),
        src: "./images/characters/empty.png",
        talking: [
          {
            events: [
              { type: "textMessage", text: "你找到了阁楼拉出器。" },
              { type: "addStoryFlag", flag: "attic-key" },
              { who: "hero", type: "textMessage", text: "【克莱尔】：现在可以去阁楼了。重见光明前我从不知道这里还有阁楼...入口大概在客厅里。" },
            ]
          }
        ],
      },
      box2: {
        type: "Person",
        x: utils.withGrid(8),
        y: utils.withGrid(7),
        src: "./images/characters/empty.png",
        talking: [
          {
            events: [
              { who: "interact", type: "textMessage", text: "被生活糟蹋得破破烂烂的箱子。一看就是堆在地下室很久没人动过的，除了厚厚的灰尘，里面什么都不会有。" },
              { who: "interact", type: "textMessage", text: "你的双手现在沾满了灰，这令爱干净的你感到万分不适。" },
              { who: "hero", type: "textMessage", text: "【克莱尔】：阿嚏！Q皿Q" },
            ]
          }
        ],
      },
      safebox: {
        type: "Person",
        x: utils.withGrid(6),
        y: utils.withGrid(3),
        src: "./images/characters/empty.png",
        talking: [
          {
            required: ["message"],
            events: [
              { type: "textMessage", text: "一些从电子杂志上摘录下的个人介绍。你在杂志页的底部发现了设计精美的杂志名————“Science”，并且意识到这些摘录全都是关于同一个人的。" },
              { who: "kp", type: "textMessage", text: "威尔.罗伯特，机器人神经和智能领域高级工程师，世界机器人研究会首席科学家。" },
              { who: "kp", type: "textMessage", text: "早年间为人造智慧领域的权威专家，为人造智慧产生做出过关键性贡献，机器人和生化人人权和独立人格的坚定支持者，在机器人人权合法化之前，因其理念不合受到机器人研究会的排挤而退出，后隐藏身份独居，不再参与任何机器人的研究与改造工作……" },
              { who: "kp", type: "textMessage", text: "在早年的专访中，威尔先生曾经透露过一个特别的小习惯：“...喜欢在雕塑里埋下智慧芯片，以完成数据搜索。”" },
              { who: "hero", type: "textMessage", text: "【克莱尔】：这是威尔叔叔！以前......爸爸妈妈会请威尔叔叔来家里做客，那时候我还很小，不过我记得这个会陪我玩的叔叔。" },
              { who: "hero", type: "textMessage", text: "【克莱尔】：不过，这种明显是特意收集的信息...而且还放在地下室..." },
              { who: "hero", type: "textMessage", text: "【克莱尔】：是那两个人，是哈里森做的吗？而且为什么是威尔叔叔呢？" },
              { type: "textMessage", text: "还有一个快要没电的音频存储器，充满着晦涩难懂的会议录音和平平无奇的通话记录。" },
              { type: "textMessage", text: "就在你即将被这些听不懂的东西消磨完耐心，几乎要认定这玩意没什么特别的时候，一份几个月前的通话记录引起了你的注意。" },
              { who: "mum", type: "textMessage", text: "【哈里森夫人】：威尔先生，我们知道您已经不干这行了...但是求求您，再这样下去，她就要不行了..." },
              { who: "kp", type: "textMessage", text: "【威尔.罗伯特】：哈里森夫人，您要知道，这孩子叫克莱尔.布兰德！" },
              { who: "kp", type: "textMessage", text: "【威尔.罗伯特】：虽然她没有人类的身体，但她的父母那样爱她...她有着与人类一般无二的情感，她有一颗人类的心啊！" },
              { who: "kp", type: "textMessage", text: "【威尔.罗伯特】：这是个无辜的好孩子。恕我直言，您这样做，实在是..." },
              { who: "mum", type: "textMessage", text: "【哈里森夫人】：我们会陪伴她、照顾她、无微不至地爱她，我们可以做她的父母！她可以...她可以继续和爸爸妈妈开开心心地生活，这难道不好吗？" },
              { who: "kp", type: "textMessage", text: "【威尔.罗伯特】：可这是欺骗！...更何况，您甚至，还禁止我找回她的视觉模块。" },
              { who: "mum", type: "textMessage", text: "【哈里森夫人】：想得到幸福至少要付出些微不足道的代价，况且，善意的谎言值得原谅、无伤大雅。" },
              { who: "mum", type: "textMessage", text: "【哈里森夫人】：要知道，如果她不能从身份和情感上成为我们的女儿，那我们做的这一切都将毫无意义。" },
              { who: "kp", type: "textMessage", text: "【威尔.罗伯特】：你！我不可能同" },
              { who: "mum", type: "textMessage", text: "【哈里森夫人】：（打断）威尔先生！" },
              { who: "mum", type: "textMessage", text: "【哈里森夫人】：请您慎重考虑一下。虽然您不再活跃在人们的视野中了，但是您名下的那些进行着项目的独立实验室..." },
              { who: "mum", type: "textMessage", text: "【哈里森夫人】：万一出了什么意外...实验室里您那些意气风发的后辈何其无辜啊。" },
              { who: "mum", type: "textMessage", text: "【哈里森夫人】：还请您冷静下来，仔细考虑一下。毕竟，我们听说您与布兰德一家私交甚笃，想必您一定也不想看到可怜的克莱尔这么早就随她父母而去。" },
              { who: "kp", type: "textMessage", text: "【威尔.罗伯特】：............" },
              { who: "kp", type: "textMessage", text: "【威尔.罗伯特】：......我会考虑的，但我需要时间。" },
              { who: "mum", type: "textMessage", text: "【哈里森夫人】：麻烦您尽快给我们答复，她真的撑不了多久了...请您理解我们为人父母的心情。" },
              { who: "mum", type: "textMessage", text: "【哈里森夫人】：无论您想得到什么都可以...为了这件事，我们会不惜一切代价。" },
              { type: "textMessage", text: "通话戛然而止，你知道了部分的真相。" },
              { who: "hero", type: "textMessage", text: "【克莱尔】：......" },
            ]
          },
          {
            disqualify: ["hahaha", "message"],
            events: [
              { type: "textMessage", text: "你找到了一个坏了的保险箱" },
              {
                type: "choose",
                choices: [
                  {
                    label: "你打算打开看看里面的东西",
                    description: "勇敢的北理工人有时候需要勇敢",
                    storyflag: "message",
                  },
                  {
                    label: "你打算离开，万一触发警报",
                    description: "勇敢的北理工人需要谨慎",
                    storyflag: "hahaha",
                  }
                ],
              },
            ]
          },
        ],
      },
    },
    cutsceneSpaces: {
      [utils.asGridCoord(8, 8)]: [
        {
          events: [
            {
              type: "changeMap",
              map: "livingroom",
              x: utils.withGrid(4),
              y: utils.withGrid(9),
              direction: "left"
            }
          ]
        }
      ],
      [utils.asGridCoord(7, 8)]: [
        {
          disqualify: ["SEEN_INTRO5"],
          events: [
            { type: "addStoryFlag", flag: "SEEN_INTRO5" },
            { who: "hero", type: "textMessage", text: "【克莱尔】：！" },
            { type: "textMessage", text: "地下室的空气明显有些浑浊。你敏锐地察觉到，除了灰尘的气息，这里还有一丝令你感到不适与违和的味道。" },
            { who: "hero", type: "textMessage", text: "【克莱尔】：不知道为什么，这种味道让我想到“死亡”。" },
            { who: "hero", type: "textMessage", text: "【克莱尔】：！！！等等。" },
            { type: "textMessage", text: "昏暗的灯光下，你突然发现不远处破损的柜子里...仿佛支出了一截手臂。" },
            { who: "hero", type: "textMessage", text: "【克莱尔】：！！！" },
            { who: "hero", type: "textMessage", text: "【克莱尔】：这...是我妈妈的手臂，她曾经说过她的手臂上有一块心形的胎记。" },
            { who: "hero", type: "textMessage", text: "【克莱尔】：妈妈什么时候...是那场事故？既然那两个人分别有爸爸和妈妈的声音，爸爸不会也..." },
            { type: "textMessage", text: "你踟蹰片刻，上前查看。" },
            { who: "hero", type: "textMessage", text: "【克莱尔】：......果然..." },
            { who: "hero", type: "textMessage", text: "【克莱尔】：...他们到底想要什么？为什么他们要假装是我的爸爸妈妈？我是被他们绑架来的？" },
            { who: "hero", type: "textMessage", text: "【克莱尔】：救命...我要离开这个地方！救命...！" },
            { who: "bianju", type: "textMessage", text: "【善良美丽的编剧大人】：孩子你可以在这个房间里找找阁楼的拉出器，听起来它应该在箱子中才是。" },
            { who: "bianju", type: "textMessage", text: "【善良美丽的编剧大人】：友情提示，如果你愿意多点耐心，也许会有很多收获。" },
            //    {type: "embedPage", container: document.querySelector(".game-container"), toEmbed: "./mini-game/number-puzzle/index.html"},//同样是相对game.html的路径
            //    { who: "hero", type: "textMessage", text: "拼图游戏不适合我" },//蓝色血液
          ]
        },
      ],
    },
    walls: function () {
      let walls = {};
      ["9,8", "5,8", "1,8",
        "1,9", "2,10", "3,9", "4,9", "5,9", "6,9", "7,10", "8,9",
        "8,7", "0,7",
        "1,6", "7,6", "8,6",
        "8,5", "1,5",
        "0,4", "9,4",
        "8,3", "7,3", "6,3", "4,3", "3,3", "2,3", "1,3",
        "1,2", "2,2", "3,2", "4,2", "5,2", "6,2", "7,2", "8,2",
      ].forEach(coord => {
        let [x, y] = coord.split(",");
        walls[utils.asGridCoord(x, y)] = true;
      })
      return walls;
    }(),
  },
  kitchen: {
    id: "kitchen",
    lowerSrc: "./images/maps/kitchen-lower.png",
    upperSrc: "./images/maps/kitchen-upper.png",
    configObjects: {
      hero: {
        type: "Person",
        isPlayerControlled: true,
        x: utils.withGrid(3),
        y: utils.withGrid(5),
        useShadow: true,
      },
      fire: {
        type: "Person",
        x: utils.withGrid(3),
        y: utils.withGrid(3),
        src: "./images/characters/empty.png",
        talking: [
          {
            events: [
              { who: "interact", type: "textMessage", text: "干干净净的灶台。一览无余，没有什么特别的。" },
              { who: "hero", type: "textMessage", text: "【克莱尔】：这几个月以来，妈妈...不，她从没让我靠近过这些可能产生危险的东西。" },
              { who: "hero", type: "textMessage", text: "【克莱尔】：我最好还是离灶台远点。" },
            ]
          }
        ],
      },
      nothing1: {
        type: "Person",
        x: utils.withGrid(6),
        y: utils.withGrid(4),
        src: "./images/characters/empty.png",
        talking: [
          {
            events: [
              { who: "interact", type: "textMessage", text: "一盘洗得干干净净的水果。你仿佛看到它们在向你挥舞并不存在的手臂，热情地盼望着去你空空如也的胃里做客。" },
              { who: "hero", type: "textMessage", text: "【克莱尔】：既然如此......" },
              { who: "hero", type: "textMessage", text: "【克莱尔】：(喀嚓喀嚓)" },
            ]
          }
        ],
      },
      nothing2: {
        type: "Person",
        x: utils.withGrid(8),
        y: utils.withGrid(3),
        src: "./images/characters/empty.png",
        talking: [
          {
            events: [
              { who: "interact", type: "textMessage", text: "冰箱里会不会有惊喜呢？你仔细地翻找了一下。" },
              { who: "interact", type: "textMessage", text: "很遗憾，并没有，看来哈里森先生确实不会把钥匙放在厨房。去别的房间找找吧。" },
            ]
          }
        ],
      },
    },
    cutsceneSpaces: {
      [utils.asGridCoord(1, 6)]: [
        {
          events: [
            {
              type: "changeMap",
              map: "livingroom",
              x: utils.withGrid(13),
              y: utils.withGrid(9),
              direction: "left"
            }
          ]
        }
      ],
      [utils.asGridCoord(2, 6)]: [
        {
          disqualify:["inform10"],
          events: [
            { type: "textMessage", text: "厨房里冷冷清清的..." },
            { type: "addStoryFlag", flag:"inform10" },
          ]
        }
      ],
    },
    walls: function () {
      let walls = {};
      ["0,6", "9,6", "9,7", "8,7", "7,7", "6,7", "5,7", "4,7", "3,7", "2,7", "1,7",
        "9,5", "2,5", "1,5",
        "1,4", "2,4","4,4","5,4","6,4","7,4","9,4", 
        "9,3", "8,3", "7,3", "6,3", "4,3", "3,3", "2,3", "1,3",
      ].forEach(coord => {
        let [x, y] = coord.split(",");
        walls[utils.asGridCoord(x, y)] = true;
      })
      return walls;
    }(),
  },
  maze: {
    id: "maze",
    lowerSrc: "./images/maps/maze-lower.png",
    upperSrc: "./images/maps/maze-upper.png",
    configObjects: {
      hero: {
        type: "Person",
        isPlayerControlled: true,
        x: utils.withGrid(2),
        y: utils.withGrid(2),
        useShadow: true,
      },
    },
    cutsceneSpaces: {
      [utils.asGridCoord(21, 21)]: [
        {
          events: [
            {
              type: "changeMap",
              map: "Bedroom1",
              x: utils.withGrid(3),
              y: utils.withGrid(6),
              direction: "down"
            },
            { type: "textMessage", text: "达成成就：迷宫世界" },
            { type: "addStoryFlag", flag: "game2" },
          ]
        }
      ],
      [utils.asGridCoord(1, 1)]: [
        {
          events: [
            {
              type: "changeMap",
              map: "Bedroom1",
              x: utils.withGrid(3),
              y: utils.withGrid(6),
              direction: "down"
            },
            { who:"hero", type: "textMessage", text: "算了，迷宫不适合我。" },
          ]
        }
      ],
    },
    walls: function () {
      let walls = {};
      ["0,0", "1,0", "2,0", "3,0", "4,0", "5,0", "6,0", "7,0", "8,0", "9,0", "10,0", "11,0", 
       "12,0", "13,0", "14,0", "15,0", "16,0", "17,0", "18,0", "19,0", "20,0", "21,0","22,0",
       "0,1", "5,1", "8,1","22,1",
       "0,2", "1,2", "3,2","5,2","7,2","8,2","10,2", "11,2", "12,2", 
       "13,2","14,2","16,2","17,2","18,2","19,2", "20,2", "21,2", "21,2",
       "0,3", "3,3", "5,3", "10,3", "12,3", "22,3", 
       "0,4", "1,4", "3,4", "4,4", "5,4", "8,4", "10,4", "12,4", 
       "13,4", "14,4", "15,4", "16,4", "17,4", "18,4", "19,4", "20,4", "22,4", 
       "0,5", "8,5", "10,5", "12,5", "16,5", "22,5",
       "0,6", "2,6", "3,6", "4,6", "5,6", "6,6", "7,6", "8,6", "9,6", "10,6", 
       "12,6", "14,6", "16,6", "18,6", "19,6", "20,6", "21,6", "22,6",
       "0,7", "2,7", "8,7", "14,7", "22,7",
       "0,8", "2,8", "4,8", "6,8", "8,8", "10,8", "12,8", "13,8", "14,8", "15,8",
       "16,8", "17,8", "18,8", "19,8", "20,8", "21,8", "22,8", 
       "0,9", "2,9", "4,9", "6,9", "8,9", "9,9", "10,9", "22,9", 
       "0,10", "2,10", "4,10", "6,10", "8,10", "10,10", "12,12", "13,10",
       "14,10", "15,10", "16,10", "17,10", "18,10", "20,10", "21,10", "22,10",
       "0,11", "1,11", "2,11", "4,11", "5,11", "6,11", "10,11", "12,11", "20,11", "22,11",
       "0,12", "2,12", "4,12", "6,12", "7,12", "8,12", "10,12", "12,12",
       "13,12", "14,12", "15,12", "17,12", "18,12", "20,12", "22,12", 
       "0,13", "4,13", "8,13", "10,13", "18,13", "22,13",
       "0,14", "2,14", "4,14", "6,14", "8,14", "10,14", "11,14", "12,14", "13,14", 
       "14,14", "15,14", "16,14", "18,14", "19,14", "20,14", "21,14", "22,14",
       "0,15", "2,15", "4,15", "6,15", "8,15", "18,15", "22,15",
       "0,16", "2,16", "4,16", "6,16", "10,16", "11,16", "12,16", "13,16",
       "14,16", "15,16", "16,16", "17,16", "18,16", "20,16", "22,16",
       "0,17", "2,17", "4,17", "6,17", "8,17", "10,17", "20,17", "22,17",
       "0,18", "2,18", "4,18", "5,18", "6,18", "7,18", "8,18", "9,18", "10,18", "11,18",
       "12,18", "13,18", "14,18", "15,18", "16,18", "18,18", "19,18", "20,18", "22,18",
       "0,19", "2,19", "6,19", "18,19", "22,19",
       "0,20", "2,20", "4,20", "6,20", "8,20", "10,20", "11,20", "12,20", "13,20", "14,20",
       "15,20", "17,20", "18,20", "20,20", "21,20", "22,20",
       "0,21", "2,21", "4,21", "8,21", "14,21", "18,21", "22,21",
       "0,22", "1,22", "2,22", "3,22", "4,22", "5,22", "6,22", "7,22", "8,22", "9,22",
       "10,22", "11,22", "12,22", "13,22", "14,22", "15,22", "16,22", "17,22", "18,22", "19,22",
       "20,22", "21,22", "22,22",
      ].forEach(coord => {
        let [x, y] = coord.split(",");
        walls[utils.asGridCoord(x, y)] = true;
      })
      return walls;
    }(),
  },  
}
