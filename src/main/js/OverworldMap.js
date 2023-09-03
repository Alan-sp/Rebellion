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
            return !playerState.storyFlags[sf]
          }) && (scenario.required || []).every(sf => {
            return playerState.storyFlags[sf]
          })
        }
        else {//只有required，和required和disqualify都没有的情况
          return (scenario.required || []).every(sf => {
            return playerState.storyFlags[sf]
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
          return (scenario.disqualify).every(sf => {
            return !playerState.storyFlags[sf]
          }) && (scenario.required || []).every(sf => {
            return playerState.storyFlags[sf]
          })
        }
        else {//只有required，和required和disqualify都没有的情况
          return (scenario.required || []).every(sf => {
            return playerState.storyFlags[sf]
          })
        }
      })
      relevantScenario && this.startCutscene(relevantScenario.events)
    }
  }
}

window.OverworldMaps = {
  Bedroom1: {//记得这里首字母大写
    id: "Bedroom1",
    lowerSrc: "./images/maps/1_floor1.png",
    // lowerSrc: "./images/maps/bedroom1-lower.png",
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
        x: utils.withGrid(2),
        y: utils.withGrid(2),
        src: "./images/characters/empty.png",
        talking: [
          {
            events: [
              { type: "addStoryFlag", flag: "doorkey" },
              { who: "interact", type: "textMessage", text: "你看着这架古老而诡异的钢琴，心中渐生疑窦。" },
              { who: "hero", type: "textMessage", text: "这究竟是怎么回事。" },
            ]
          }
        ],
      },

      doors1:
      {
        type:"Person",
        x: utils.withGrid(11),
        y: utils.withGrid(2),
        src: "./images/characters/empty.png",
        talking: [
          {
            events: [
              { disqualify:"doorkey",who: "interact", type: "textMessage", text: "魔石铸造的大门紧闭着，你轻轻的敲击俩下，似乎不是蛮力能破坏的，不起眼的锁眼吸引了你的注意，似乎只有找到钥匙才能通往下一层。" },
              { required:"doorkey",who: "interact", type: "textMessage", text: "你将钥匙插入生锈的铁索，伴随着清脆的转动声，岩石磨蹭的动静于耳畔响起，诡异的圆盘从石板中浮现，拨开层层浮土，歪斜的石刻向你讲述着一个谜题" },
            ]
          }
        ],
      }
      
    },
    cutsceneSpaces: {
      [utils.asGridCoord(7, 3)]: [{
          // required: ["you-can-go"],
          // disqualify: ["robot-is-happy", "robot-is-depressed"],
        events: [
            // { type: "addStoryFlag", flag: "SEEN_INTRO" },
              { type: "textMessage", text: "经过一阵跋涉你终于得以解开魔都神秘的面纱来到了地牢的一层，多亏士兵的掩护，你在森林中并未受到多少阻拦" },
              { type: "textMessage", text: "成功到达使你在阴森腐臭的地牢反倒感到一阵轻松，你从胸前拿出那张雪白的信纸，伴着微弱的火光，漆黑的笔墨诉说着你的使命----------" },
          ]
    }],
    [utils.asGridCoord(1, 2)]: [{
      // required: ["you-can-go"],
      // disqualify: ["robot-is-happy", "robot-is-depressed"],
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


      // [utils.asGridCoord(6, 3)]: [{
      //   disqualify: ["SEEN_INTRO"],
      //   events: [
      //     { type: "addStoryFlag", flag: "SEEN_INTRO" },
      //     { who: "hero", type: "textMessage", text: "【克莱尔】：啊...我的眼睛，好痛！" },
      //     { who: "hero", type: "textMessage", text: "【克莱尔】：这是...？" },
      //     { who: "hero", type: "textMessage", text: "【克莱尔】：我的手？我能看见了？不是做梦吧？" },
      //     { who: "hero", type: "textMessage", text: "【克莱尔】：咦？床头柜有一张纸条？" },
      //     { who: "hero", type: "textMessage", text: "（纸条文字）别让他们知道，你能看见了！！！" },
      //     { who: "hero", type: "textMessage", text: "【克莱尔】：真奇怪，谁还会用这么古老的方式传递信息，为什么不能让他们..." },
      //     { who: "hero", type: "textMessage", text: "【女人】：克莱尔你醒了啊，我扶你去外面透透气吧。" },
      //     { who: "hero", type: "textMessage", text: "(内心独白）她不是我的妈妈，我不认识她，可为什么声音一模一样，还有那个纸团..." },
      //     { who: "hero", type: "textMessage", text: "（内心独白）我要找到这一切的真相！" },
      //   ]
      // }],
      // [utils.asGridCoord(7, 4)]: [{
      //   disqualify: ["SEEN_INTRO"],
      //   events: [
      //     { type: "addStoryFlag", flag: "SEEN_INTRO" },
      //     { who: "hero", type: "textMessage", text: "【克莱尔】：啊...我的眼睛，好痛！" },
      //     { who: "hero", type: "textMessage", text: "【克莱尔】：这是...？" },
      //     { who: "hero", type: "textMessage", text: "【克莱尔】：我的手？我能看见了？不是做梦吧？" },
      //     { who: "hero", type: "textMessage", text: "【克莱尔】：咦？床头柜有一张纸条？" },
      //     { who: "hero", type: "textMessage", text: "（纸条文字）别让他们知道，你能看见了！！！" },
      //     { who: "hero", type: "textMessage", text: "【克莱尔】：真奇怪，谁还会用这么古老的方式传递信息，为什么不能让他们..." },
      //     { who: "hero", type: "textMessage", text: "【女人】：克莱尔你醒了啊，我扶你去外面透透气吧。" },
      //     { who: "hero", type: "textMessage", text: "(内心独白）她不是我的妈妈，我不认识她，可为什么声音一模一样，还有那个纸团..." },
      //     { who: "hero", type: "textMessage", text: "（内心独白）我要找到这一切的真相！" },
      //   ]
      // }],
      // }],

      [utils.asGridCoord(11, 13)]: [{
        // disqualify: ["game2"],
        /*
        events: [
          { type: "embedPage", container: document.querySelector(".game-container"), toEmbed: "./mini-game/maze/maze.html" },//同样是相对game.html的路径
          { type: "textMessage", text: "达成成就：迷宫世界" },
          { type: "addStoryFlag", flag: "game2" },
        ]*/
        events: [
          {
            type: "changeMap",
            map: "Floor1",
            x: utils.withGrid(1),
            y: utils.withGrid(1),
            direction: "right"
          },
        ]
      }],

      [utils.asGridCoord(4, 6)]: [
        {
          disqualify: ["game1"],
          events: [
            { type: "embedPage", name: "game1", container: document.querySelector(".game-container"), toEmbed: "./mini-game/number-puzzle/puzzle.html" },//同样是相对game.html的路径
            { who: "hero", type: "textMessage", text: "数字华容道不适合我" },
            { type: "textMessage", text: "达成成就：游戏人生" },
            { type: "addStoryFlag", flag: "game1" },
          ]
        }
      ],

      //test
      // [utils.asGridCoord(9, 5)]: [
      //   {
      //     required: ["robot-is-depressed"],
      //     disqualify: ["chefRootie"],
      //     events: [
      //       { who: "hero", type: "textMessage", text: "【克莱尔】我要挂了！" },
      //       { type: "CG", path: "../game.html"},
      //     ]
      //   },
      //   {
      //     events: [
      //       { who: "somebody", type: "textMessage", text: "test" },
      //     ]
      //   }
      // ]
    },
    walls: function () {
      let walls = {};
      ["0,1","0,2","0,3","0,4","0,5","0,6","0,7","0,8","0,9","0,10","0,11","0,12",
      "2,1","3,1","4,1","5,1","6,1","7,1","8,1"].forEach(coord => {
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

      boss:
      {
        type:"Person",
        x: utils.withGrid(11),
        y: utils.withGrid(8),
        src: "./images/characters/empty.png",
        talking:[
        {
            events:[
            {
              type: "choose",
              choices: [
                {
                  label: "与魔王交战",
                  description: "既然重见光明，是时候用眼睛看看这个家了",
                  storyflag: "fight",
                },
                {
                  label: "果断逃跑",
                  description: "果然还是很在意那一瞬间异常的慌张，地下室里究竟有什么呢",
                  storyflag: "go-into-basement-without-key",
                }
              ],
            },
          ],
        }
        ],
      },
    },
    cutsceneSpaces: {
      [utils.asGridCoord(10, 8)]: [
        {
          required:["fight"],
          events: [
            { who: "boss", type: "textMessage", text: "塔塔开。" },
          ]
        }
      ],
      [utils.asGridCoord(12, 2)]: [
        {
          events: [
            {
              type: "changeMap",
              map: "Bathroom",
              x: utils.withGrid(2),
              y: utils.withGrid(8),
              direction: "up"
            }
          ]
        }
      ],
      [utils.asGridCoord(1, 5)]: [
        {
          required: ["key-to-bedroom2"],
          events: [
            {
              type: "changeMap",
              map: "bedroom2",
              x: utils.withGrid(12),
              y: utils.withGrid(5),
              direction: "left"
            }
          ]
        },
        {
          disqualify: ["SEEN_INTRO3"],
          required: ["key-to-basement"],
          events: [
            { type: "addStoryFlag", flag: "SEEN_INTRO3" },
            { who: "dad", type: "textMessage", text: "【哈里森先生】：我们做的这一切到底有什么意义？" },
            { who: "dad", type: "textMessage", text: "【哈里森先生】：你执意要带她回来，可我们不可能一直这样欺骗下去。" },
            { who: "hero", type: "textMessage", text: "【克莱尔】：什么欺骗...这是在说我？" },
            { who: "mum", type: "textMessage", text: "【哈里森夫人】：她把我们当成家人！有了克莱尔，我们也许就能弥补曾经的过错。" },
            { who: "mum", type: "textMessage", text: "【哈里森夫人】：可怜的孩子...我的女儿......" },
            { who: "mum", type: "textMessage", text: "【哈里森夫人】：我不相信看着克莱尔，你的心就能平静无波。陪伴她、照顾她、看到她无忧无虑的笑脸使我的心得到了久违的宁静。难道送给她礼物、听到她笑声的时候，你就没有得到一丝一毫的救赎？" },
            { who: "dad", type: "textMessage", text: "【哈里森先生】：......不...不！莫莉，那样的心情、那样沉重的悲恸，绝不应该用这种方式被轻易救赎。" },
            { who: "dad", type: "textMessage", text: "【哈里森先生】：我做不到！" },
            { who: "dad", type: "textMessage", text: "【哈里森先生】：虽然每次看到她都让我想起瑞雯，但这孩子的名字是克莱尔。她不是我的女儿，她甚至没有血肉做成的心脏！" },
            { who: "mum", type: "textMessage", text: "【哈里森夫人】：......（无言啜泣）" },
            { who: "hero", type: "textMessage", text: "【克莱尔】：什么......" },
            { who: "dad", type: "textMessage", text: "【哈里森先生】：我绝不相信...一堆冰冷的代码能取代我的挚爱。我做不到为此放下愧疚，甚至从中又得到些自欺欺人的痛苦...莫莉，你想想瑞雯......" },
            { who: "hero", type: "textMessage", text: "【克莱尔】：......" },
            { who: "hero", type: "textMessage", text: "【克莱尔】：可是...难道我不是人类吗？" },
            { who: "hero", type: "textMessage", text: "【克莱尔】：不可能！我不可能是生化人，我有爸爸妈妈，我的记忆都是虚假的吗？" },
            { type: "addStoryFlag", flag: "key-to-bedroom2" },
            {
              type: "changeMap",
              map: "bedroom2",
              x: utils.withGrid(12),
              y: utils.withGrid(5),
              direction: "left"
            },
            //    {type: "embedPage", container: document.querySelector(".game-container"), toEmbed: "./mini-game/number-puzzle/index.html"},//同样是相对game.html的路径
            //    { who: "hero", type: "textMessage", text: "拼图游戏不适合我" },//蓝色血液
          ]
        },
        {
          events: [
            { type: "textMessage", text: "你什么都没有搜集到难道想触发剧情？快去找找线索吧！" },
          ]
        },
      ],
      [utils.asGridCoord(1, 8)]: [
        {
          required: ["attic-key"],
          events: [
            {
              type: "changeMap",
              map: "attic",
              x: utils.withGrid(2),
              y: utils.withGrid(6),
              direction: "down"
            }
          ]
        },
        {
          events: [
            { who: "interact", type: "textMessage", text: "阁楼的梯子太高了。没有阁楼拉出器，高大的成年男性也上不去。" },
            { who: "hero", type: "textMessage", text: "更何况我只是个小女孩。" },
          ]
        }
      ],
      [utils.asGridCoord(13, 5)]: [
        {
          events: [
            {
              type: "changeMap",
              map: "study",
              x: utils.withGrid(0),
              y: utils.withGrid(9),
              direction: "right"
            }
          ]
        }
      ],
      [utils.asGridCoord(4, 2)]: [
        {
          required: ["key-to-garden"],
          events: [
            {
              type: "changeMap",
              map: "garden",
              x: utils.withGrid(7),
              y: utils.withGrid(11),
              direction: "up"
            }
          ]
        },
        {
          events: [
            { who: "hero", type: "textMessage", text: "你没有触发剧情，你不能去花园。" },
          ]
        }
      ],
      [utils.asGridCoord(4, 9)]: [
        {
          required: ["key-to-basement", "close-alarm"],
          events: [
            {
              type: "changeMap",
              map: "basement",
              x: utils.withGrid(8),
              y: utils.withGrid(8),
              direction: "left"
            }
          ]
        },
        {
          required: ["key-to-basement"],
          events: [
            {
              type: "choose",
              choices: [
                {
                  label: "你有了钥匙但是你确定直接进去不管警报吗？",
                  description: "勇敢的北理工人有时候需要勇敢，或许不是现在",
                  storyflag: "over1",
                },
                {
                  label: "你打算再搜索一下其他的线索",
                  description: "这么大的地图，你不好好找一下？",
                  storyflag: "search-livingroom",
                }
              ],
            }
          ]
        },
        {
          events: [
            {
              type: "choose",
              choices: [
                {
                  label: "你没有钥匙，打算试试钻进去",
                  description: "勇敢的北理工人有时候需要勇敢，或许不是现在",
                  storyflag: "over1",
                },
                {
                  label: "你打算再搜索一下其他的线索",
                  description: "这么大的地图，你不好好找一下？",
                  storyflag: "search-livingroom",
                }
              ],
            },
          ]
        }
      ],
      [utils.asGridCoord(4, 8)]: [
        {
          required: ["over1"],
          events: [
            { type: "textMessage", text: "Pity，一念之差，你做了错误的选择。" },
            { type: "gameOver", path: "./gameover/over1.html" },//相对game.html的文件路径，而不是相对OverworldMap.js!!!
          ]
        },
      ],
      [utils.asGridCoord(3, 9)]: [
        {
          required: ["over1"],
          events: [
            { type: "textMessage", text: "Pity，一念之差，你做了错误的选择。" },
            { type: "gameOver", path: "./gameover/over1.html" },//相对game.html的文件路径，而不是相对OverworldMap.js!!!
          ]
        },
      ],
    },
    walls: function () {
      let walls = {};
      [
        // "2,1", "3,2", "3,3", "5,3", "6,4", "7,4", "8,4", "9,4", "11,4", "13,4", "1,4", "14,4", "4,1",
        // "13,3", "11,3", "1,3", "10,3",
        // "1,2", "5,2", "11,2", "13,2", "12,1",
        // "14,5", "0,5","0,8",
        // "0,6", "1,6", "5,6", "13,6",
        // "13,7", "5,7", "4,7", "1,7",
        // "5,8", "7,8", "8,8", "9,8", "13,8",
        // "14,9", "9,9", "8,9", "7,9", "5,9", "0,9",
        // "1,10", "2,10", "3,10", "4,10", "5,10", "13,10",
        // "13,11", "5,11",
        // "5,12", "6,12", "8,12", "9,12", "13,12",
        // "14,13", "6,13",
        // "6,14", "7,14", "8,14", "9,14", "10,14", "11,14", "13,14",
        // "12,15",
      ].forEach(coord => {
        let [x, y] = coord.split(",");
        walls[utils.asGridCoord(x, y)] = true;
      })
      return walls;
    }(),
  },
  Bathroom: {
    id: "Bathroom",
    lowerSrc: "./images/maps/bathroom-lower.png",
    upperSrc: "./images/maps/bathroom-upper.png",
    configObjects: {
      hero: {
        type: "Person",
        isPlayerControlled: true,
        x: utils.withGrid(3),
        y: utils.withGrid(5),
        useShadow: true,
      },

      mum: {
        type: "Person",
        x: utils.withGrid(5),
        y: utils.withGrid(6),
        src: "./images/characters/mum.png",
        useShadow: true,
        talking: [
          {
            required: ["chefRootie"],
            events: [{ type: "textMessage", faceHero: ["mum"], text: "My veggies need more growth." }],

          },
          {
            events: [
              { type: "textMessage", text: "Veggies are the fuel for the heart and soul!", faceHero: "mum" },
              { type: "addStoryFlag", flag: "chefRootie" },
              { type: "textMessage", text: "达成成就：奇怪的话语" },
            ]
          }
        ],
      },
      books: {
        type: "Person",
        x: utils.withGrid(7),
        y: utils.withGrid(6),
        src: "./images/characters/empty.png",
        talking: [
          {
            events: [
              { who: "hero", type: "textMessage", text: "我想，上厕所的时候，有时是需要一点厕所文学的。" },
              { type: "addStoryFlag", flag:"literary"},
              { type: "textMessage", text: "达成成就：厕所文学" },
            ]
          }
        ],
      },
      shower: {
        type: "Person",
        x: utils.withGrid(2),
        y: utils.withGrid(4),
        src: "./images/characters/empty.png",
        talking: [
          {
            events: [
              { who: "interact", type: "textMessage", text: "平平无奇的淋浴间。这里看起来不像放值得注意的东西的地方。" },
            ]
          }
        ],
      },
      bathtub1: {
        type: "Person",
        x: utils.withGrid(4),
        y: utils.withGrid(4),
        src: "./images/characters/empty.png",
        talking: [
          {
            events: [
              { who: "interact", type: "textMessage", text: "干净的浴缸。里面理所当然什么也没有。" },
            ]
          }
        ],
      },
      bathtub2: {
        type: "Person",
        x: utils.withGrid(5),
        y: utils.withGrid(4),
        src: "./images/characters/empty.png",
        talking: [
          {
            events: [
              { who: "interact", type: "textMessage", text: "干净的浴缸。里面理所当然什么也没有。" },
            ]
          }
        ],
      },
      dress: {
        type: "Person",
        x: utils.withGrid(8),
        y: utils.withGrid(4),
        src: "./images/characters/empty.png",
        talking: [
          {
            events: [
              { who: "interact", type: "textMessage", text: "漂亮的裙子。摸起来潮潮的，看起来是才洗了还没有晾干。" },
            ]
          }
        ],
      },
      clothes: {
        type: "Person",
        x: utils.withGrid(9),
        y: utils.withGrid(4),
        src: "./images/characters/empty.png",
        talking: [
          {
            events: [
              { who: "interact", type: "textMessage", text: "你翻了翻洗衣机以及脏衣篓，没有找到什么值得注意的东西。" },
            ]
          }
        ],
      },
      zhe: {
        type: "Person",
        x: utils.withGrid(10),
        y: utils.withGrid(6),
        src: "./images/characters/empty.png",
        talking: [
          {
            events: [
              { who: "interact", type: "textMessage", text: "你！这都不放过吗，马桶它干干净净清清白白，假使你想找什么东西，也不应该怀疑到这里来！" },
            ]
          }
        ],
      },
      guizi: {
        type: "Person",
        x: utils.withGrid(7),
        y: utils.withGrid(4),
        src: "./images/characters/empty.png",
        talking: [
          {
            events: [
              { who: "interact", type: "textMessage", text: "小巧但能装的收纳柜。第一层抽屉里摆满了洗护用品；第二层抽屉里是干净的毛巾浴巾；第三层抽屉里......" },
              { who: "hero", type: "textMessage", text: "【克莱尔】：......洗发水三联包，买二送一...妈妈意外的贤惠呢..." },
              { type: "textMessage", text: "你不禁怀疑起自己翻看这个柜子的意义来。" },
            ]
          }
        ],
      },
      mirror: {
        type: "Person",
        x: utils.withGrid(6),
        y: utils.withGrid(3),
        src: "./images/characters/empty.png",
        talking: [
          {
            events: [
              { who: "hero", type: "textMessage", text: "【克莱尔】：嗯......" },
              { who: "hero", type: "textMessage", text: "【克莱尔】：罗衣何飘飖，轻裾随风还。腰若流纨素，口如含朱丹。闲静如姣花照水，行动如若柳扶风。秾纤得中，修短合度。肩若削成，腰如约素。延颈秀项，皓质呈露。螓首蛾眉，巧笑倩兮，美目盼兮。" },
              { who: "hero", type: "textMessage", text: "【克莱尔】：我真好看！" },
              { type: "addStoryFlag", flag:"narcissus"},
              { type: "textMessage", text: "达成成就：纳喀索斯" },
            ]
          }
        ],
      },
    },
    cutsceneSpaces: {
      [utils.asGridCoord(2, 8)]: [
        {
          events: [
            {
              type: "changeMap",
              map: "livingroom",
              x: utils.withGrid(12),
              y: utils.withGrid(2),
              direction: "up"
            }
          ]
        }
      ],
    },
    walls: function () {
      let walls = {};
      ["1,8", "1,7", "1,6", "1,5", "1,4", "2,4", "3,4", "4,4", "5,4", "6,3",
        "7,4", "8,4", "9,4", "10,4", "11,5", "10,6", "10,7", "9,7", "8,7", "8,6", "7,6", "6,6", "4,6",
        "3,7", "3,8", "3,6", "2,9",
      ].forEach(coord => {
        let [x, y] = coord.split(",");
        walls[utils.asGridCoord(x, y)] = true;
      })
      return walls;
    }(),
  },
  bedroom2: {
    id: "bedroom2",
    lowerSrc: "./images/maps/bedroom2-lower.png",
    upperSrc: "./images/maps/bedroom2-upper.png",
    configObjects: {
      hero: {
        type: "Person",
        isPlayerControlled: true,
        x: utils.withGrid(3),
        y: utils.withGrid(5),
        useShadow: true,
      },
      close_alarm: {
        type: "Person",
        x: utils.withGrid(5),
        y: utils.withGrid(2),
        src: "./images/characters/empty.png",
        talking: [
          {
            events: [
              { type: "textMessage", text: "你解除了地下室的警报。" },
              { type: "addStoryFlag", flag: "close-alarm" },
            ]
          }
        ],
      },
      bed1: {
        type: "Person",
        x: utils.withGrid(4),
        y: utils.withGrid(3),
        src: "./images/characters/empty.png",
        talking: [
          {
            events: [
              { who: "interact", type: "textMessage", text: "说了不要这么懒，见到床就想躺！床上是不会有警报器的！" },
            ]
          }
        ],
      },
      bed2: {
        type: "Person",
        x: utils.withGrid(3),
        y: utils.withGrid(3),
        src: "./images/characters/empty.png",
        talking: [
          {
            events: [
              { who: "interact", type: "textMessage", text: "说了不要这么懒，见到床就想躺！床上是不会有警报器的！" },
            ]
          }
        ],
      },
      plant: {
        type: "Person",
        x: utils.withGrid(5),
        y: utils.withGrid(7),
        src: "./images/characters/empty.png",
        talking: [
          {
            events: [
              { who: "interact", type: "textMessage", text: "这也是一株没用的绿植。如果你要找报警器的话，想想也知道，报警器要连着电，肯定应该在靠着墙的地方。" },
              { who:'hero', type: "textMessage", text: "【克莱尔】：虽然很离奇，但是我真的觉得这一株植物和客厅里钢琴旁边那一株长得一模一样。" },
            ]
          }
        ],
      },
      wardrobe1: {
        type: "Person",
        x: utils.withGrid(1),
        y: utils.withGrid(3),
        src: "./images/characters/empty.png",
        talking: [
          {
            events: [
              { who:'hero', type: "textMessage", text: "【克莱尔】：这是哈里森夫人的衣柜。" },
            ]
          }
        ],
      },
      wardrobe2: {
        type: "Person",
        x: utils.withGrid(1),
        y: utils.withGrid(4),
        src: "./images/characters/empty.png",
        talking: [
          {
            events: [
              { who:'hero', type: "textMessage", text: "【克莱尔】：这是哈里森先生的衣柜。" },
            ]
          }
        ],
      },
      wardrobe3: {
        type: "Person",
        x: utils.withGrid(1),
        y: utils.withGrid(5),
        src: "./images/characters/empty.png",
        talking: [
          {
            events: [
              { who:'hero', type: "textMessage", text: "【克莱尔】：这是哈里森先生的衣柜。" },
            ]
          }
        ],
      },
      bookshelf1: {
        type: "Person",
        x: utils.withGrid(1),
        y: utils.withGrid(6),
        src: "./images/characters/empty.png",
        talking: [
          {
            events: [
              { who: "interact", type: "textMessage", text: "一个摆满了书的书架。仔细看了看书名，你感觉知识的气息扑面而来。除此之外，没有什么值得注意的了。" },
              { who:'hero', type: "textMessage", text: "【克莱尔】：好......好高深。" },
            ]
          }
        ],
      },
      bookshelf2: {
        type: "Person",
        x: utils.withGrid(1),
        y: utils.withGrid(7),
        src: "./images/characters/empty.png",
        talking: [
          {
            events: [
              { who: "interact", type: "textMessage", text: "一个摆满了书的书架。仔细看了看书名，你感觉知识的气息扑面而来。除此之外，没有什么值得注意的了。" },
              { who:'hero', type: "textMessage", text: "【克莱尔】：好......好艰涩。" },
            ]
          }
        ],
      },
      window1: {
        type: "Person",
        x: utils.withGrid(2),
        y: utils.withGrid(2),
        src: "./images/characters/empty.png",
        talking: [
          {
            events: [
              { who: "interact", type: "textMessage", text: "窗外是优美的风景。令人愉悦，但没什么特别的。" },
              { who: "interact", type: "textMessage", text: "（不过如果你是在找报警器的话...相信我，玩到这里还在打窗户主意的绝对不多！）" },
            ]
          }
        ],
      },
      window2: {
        type: "Person",
        x: utils.withGrid(10),
        y: utils.withGrid(2),
        src: "./images/characters/empty.png",
        talking: [
          {
            events: [
              { who: "interact", type: "textMessage", text: "窗外是优美的风景。令人愉悦，但没什么特别的。" },
              { who: "interact", type: "textMessage", text: "（不过如果你是在找报警器的话...相信我，玩到这里还在打窗户主意的绝对不多！）" },
            ]
          }
        ],
      },
      book: {
        type: "Person",
        x: utils.withGrid(4),
        y: utils.withGrid(8),
        src: "./images/characters/empty.png",
        talking: [
          {
            events: [
              { who: "interact", type: "textMessage", text: "一本通讯录。里面记载了大量的电话和地址，但是好像和报警器没什么关系。" },
            ]
          }
        ],
      },
      photo1: {
        type: "Person",
        x: utils.withGrid(6),
        y: utils.withGrid(2),
        src: "./images/characters/empty.png",
        talking: [
          {
            events: [
              { who: "interact", type: "textMessage", text: "又是一张写着“瑞雯，我们永远爱你”的相片，难道说他们是瑞雯的父母？我真的只是一个生化人？不不不，我一定要找到真相！" },
            ]
          }
        ],
      },
      photo: {
        type: "Person",
        x: utils.withGrid(11),
        y: utils.withGrid(2),
        src: "./images/maps/bathroom-upper.png",
        talking: [
          {
            events: [
              { type: "textMessage", text: "好吧，这是一个彩蛋，你真的这么细节吗？？？！！我说我说：报警器在床头柜。我想想还有什么能告诉你，好吧，告诉你写下这些物品互动是lyh嘿嘿（当然不全是，zwy暗戳戳地补充道）" },
            ]
          }
        ],
      },
      computer: {
        type: "Person",
        x: utils.withGrid(9),
        y: utils.withGrid(3),
        src: "./images/characters/empty.png",
        talking: [
          {
            events: [
              { who: "hero", type: "textMessage", text: "【克莱尔】：这是我父母的声音，原来我听到的是……假的……还有这些画面，都是爸爸妈妈的记忆。为什么会有这些…?他们到底想要什么！？(呜咽)" },
              { who: "dad", type: "textMessage", text: "【2××6年7月21日】那大概是我生命中最痛苦的一天了。我看着她躺在雨里一动不动，跪在原地愣了好久，妻子已经哭得几乎断气，我攥起她的手一遍遍地喊她的名字，脑子像被撕裂了一样疼的要命…… ……" },
              { who: "dad", type: "textMessage", text: "我怒斥自己作为一个父亲的无能，连最爱的人都保护不了，让她在痛苦中离去，甚至没有听到爸爸妈妈的一句安慰……为什么我就不能辞掉那该死的工作专心陪她？为什么我们直到她抑郁到绝望都没有发现？为什么……" },
              { who: "dad", type: "textMessage", text: "【2××7年9月15日】女儿，从你离开我们到现在已经一年多了，我和妈妈没有一天，一分一秒不在想你，我曾一度想随你而去，到那边好好的陪着你，但我没脸再见你，没有资格就这么让自己解脱，留下你妈妈和爷爷奶奶，让他们承担痛苦的惩罚。" },
              { who: "dad", type: "textMessage", text: "今天是你的生日，我很抱歉没能陪着你，愿你在天堂快乐……" },
              { who: "dad", type: "textMessage", text: "【2××7年10月29日】今天克莱尔的表现很好，学会了在客厅里摸索着走动。也不知道是因为我们的影响还是这孩子本身的性格，不，应该说是程序，她在这件事面前总是表现地很坚强，乐观，我看到了在瑞雯身上不曾有过的东西……" },
              { who: "dad", type: "textMessage", text: "目前为止我们对她的到来还是心存一丝感激，但接下来要怎么相处，会发生什么，谁也说不准……" },
              //    {type: "embedPage", container: document.querySelector(".game-container"), toEmbed: "../mini-game/number-puzzle/index.html"},//同样是相对game.html的路径
              //    { who: "hero", type: "textMessage", text: "拼图游戏不适合我" },//蓝色血液
            ]
          },
        ],
      },
    },
    cutsceneSpaces: {
      [utils.asGridCoord(12, 5)]: [
        {
          events: [
            {
              type: "changeMap",
              map: "livingroom",
              x: utils.withGrid(1),
              y: utils.withGrid(5),
              direction: "right"
            }
          ]
        }
      ],
      [utils.asGridCoord(10, 5)]: [
        {
          events: [
            { type: "addStoryFlag", flag:"not-touch" },
          ]
        }
      ],
      [utils.asGridCoord(11, 5)]: [
        {
          required:["not-touch"],
          disqualify: ["SEEN_INTRO11","close-alarm"],
          events: [
            { type: "addStoryFlag", flag: "SEEN_INTRO11" },
            { type: "textMessage", text: "你隐隐觉得床边的桌子上东西摆放很奇怪，也许你会想去看看。" },
          ]
        },
        {
          disqualify: ["SEEN_INTRO4"],
          events: [
            { type: "addStoryFlag", flag: "SEEN_INTRO4" },
            { who: "dad", type: "textMessage", text: "【哈里森先生】：克莱尔？有什么事吗？" },
            { who: "hero", type: "textMessage", text: "【克莱尔】：我...我只是想到处走走。睡了好久了，想活动一下。" },
            { who: "mum", type: "textMessage", text: "【哈里森夫人】：那宝贝儿，你自己小心一些。" },
            { who: "hero", type: "textMessage", text: "哈里森夫妇离开了。" },
            //    {type: "embedPage", container: document.querySelector(".game-container"), toEmbed: "./mini-game/number-puzzle/index.html"},//同样是相对game.html的路径
            //    { who: "hero", type: "textMessage", text: "拼图游戏不适合我" },//蓝色血液
          ]
        },
      ],
    },
    walls: function () {
      let walls = {};
      [
        "1,2", "2,2", "3,2", "4,2", "5,2", "6,2", "7,2", "8,2", "9,2", "10,2", "11,2",
        "11,3", "9,3", "8,3", "4,3", "3,3", "1,3",
        "1,4", "11,4", "12,4", "13,4",
        "13,5", "1,5",
        "1,6", "6,6", "7,6", "8,6", "9,6", "10,6", "11,6", "12,6",
        "1,7", "5,7", "6,7",
        "0,8", "2,8", "3,8", "4,8", "5,8", "6,8",
        "1,9",
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
  study: {
    id: "study",
    lowerSrc: "./images/maps/study-lower.png",
    upperSrc: "./images/maps/study-upper.png",
    configObjects: {
      hero: {
        type: "Person",
        isPlayerControlled: true,
        x: utils.withGrid(3),
        y: utils.withGrid(5),
        useShadow: true,
      },
      key_to_basement: {
        type: "Person",
        x: utils.withGrid(1),
        y: utils.withGrid(7),
        src: "./images/characters/empty.png",
        talking: [
          {
            events: [
              { type: "textMessage", text: "你找到了通往地下室的钥匙。" },
              { type: "textMessage", text: "如果你想去地下室，还需要解除地下室警报，去哈里森夫妇的卧室看看吧。如果你还想再搜索一下这个房间，有惊喜等着你哦。" },
              { type: "addStoryFlag", flag: "key-to-basement" },
            ]
          }
        ],
      },
      tabel1: {
        type: "Person",
        x: utils.withGrid(3),
        y: utils.withGrid(3),
        src: "./images/characters/empty.png",
        talking: [
          {
            events: [
              { who: "interact", type: "textMessage", text: "桌子上摆着哈里森先生的工作文稿。似乎是有关互联网应用开发的内容，如果你的web开发技术再好一点或许能看得懂，虽然这并不能帮你找到钥匙在哪里。" },
            ]
          }
        ],
      },
      tabel2: {
        type: "Person",
        x: utils.withGrid(2),
        y: utils.withGrid(3),
        src: "./images/characters/empty.png",
        talking: [
          {
            events: [
              { who: "interact", type: "textMessage", text: "几本厚厚的工作个人日志。每一本的扉页上都有“光宗耀组”几个字，图文并茂，看得出工作内容十分之充实。" },
              { who:'hero', type: "textMessage", text: "【克莱尔】：......虽然不知道“光宗耀组”是什么，不过工作还真是辛苦呢......" },
            ]
          }
        ],
      },
      nothing2: {
        type: "Person",
        x: utils.withGrid(6),
        y: utils.withGrid(2),
        src: "./images/characters/empty.png",
        talking: [
          {
            events: [
              { who: "interact", type: "textMessage", text: "上面摆着的相框里是一家人幸福的合影，可里面并不是你和你的爸爸妈妈，而是你见到的这对装成你父母的男女和一个和你差不多大的女孩。照片的一角写着：瑞雯，我们永远爱你！" },
              { who:'hero', type: "textMessage", text: "【克莱尔】：瑞雯？瑞雯是谁？看起来是这个女孩的名字。" },
              { type: "textMessage", text: "或许这正和你想找的真相有关。" },
            ]
          }
        ],
      },
      document: {
        type: "Person",
        x: utils.withGrid(7),
        y: utils.withGrid(6),
        src: "./images/characters/empty.png",
        talking: [
          {
            events: [
              { who: "interact", type: "textMessage", text: "你找到了一份档案袋" },
              { type: "addStoryFlag", flag:"document-get" },
              { type: "textMessage", text: "达成成就：敏锐的搜查者" },
              { who: "interact", type: "textMessage", text: "【2××7年10月4日】××公路特大交通事故仍在持续调查，遇难者中前哈里森集团科研人员丹尼尔.布兰德一家仍处于失踪状态。警方建议哈里森集团启用全域DNA追踪，但集团董事路易斯.哈里森有意回避此事，称因技术问题两个月内无法启动该追踪系统……" },
              { who: "interact", type: "textMessage", text: "【2××5年6月17日】亨特一家机器人非法收养一案开庭审理，最终生化人保罗.亨特被强制格式化程序。外界舆论对此反应强烈，多名参议员向国会递交机器人户籍合法化的提案，但支持率仍旧低迷。这是自十三年前机器人入世以来在此问题上影响最大的一起案件……" },
            ]
          }
        ],
      },
    },

    cutsceneSpaces: {
      [utils.asGridCoord(0, 9)]: [
        {
          events: [
            {
              type: "changeMap",
              map: "livingroom",
              x: utils.withGrid(13),
              y: utils.withGrid(5),
              direction: "left"
            }
          ]
        }
      ],
      [utils.asGridCoord(1, 9)]: [
        {
          disqualify:["inform9","key-to-basement"],
          required:["not-found"],
          events: [
            { type: "textMessage", text: "旁边的绿植似乎被翻新过？" },
            { type: "addStoryFlag", flag:"inform9" },
          ]
        }
      ],
      [utils.asGridCoord(3, 6)]: [
        {
          events: [
            { type: "addStoryFlag", flag:"not-found" },
          ]
        }
      ],
      [utils.asGridCoord(2, 6)]: [
        {
          events: [
            { type: "addStoryFlag", flag:"not-found" },
          ]
        }
      ],
      [utils.asGridCoord(4, 6)]: [
        {
          events: [
            { type: "addStoryFlag", flag:"not-found" },
          ]
        }
      ],
    },
    walls: function () {
      let walls = {};
      ["0,8", "-1,9", "0,10", "1,10", "2,10", "3,10", "4,10", "5,10", "6,10", "7,10", "8,10", "9,10",
        "9,9", "8,9",
        "8,8",
        "8,7", "1,7","2,7","4,7",
        "1,6", "2,6","4,6","5,6", "6,6", "7,6", "8,6",
        "9,5", "1,5",
        "1,4", "8,4", "9,4",
        "8,3", "7,3", "1,3", "2,3", "3,3", "4,3",
        "1,2", "2,2", "3,2", "4,2", "5,2", "6,2", "7,2", "8,2",
        "1,1", "2,1", "3,1", "4,1", "5,1", "6,1", "7,1", "8,1",
      ].forEach(coord => {
        let [x, y] = coord.split(",");
        walls[utils.asGridCoord(x, y)] = true;
      })
      return walls;
    }(),
  },
  garden: {
    id: "garden",
    lowerSrc: "./images/maps/garden-lower.png",
    upperSrc: "./images/maps/garden-upper.png",
    configObjects: {
      hero: {
        type: "Person",
        isPlayerControlled: true,
        x: utils.withGrid(5),
        y: utils.withGrid(3),
        useShadow: true,
      },
      enginere: {
        type: "Person",
        x: utils.withGrid(10),
        y: utils.withGrid(6),
        src: "./images/characters/empty.png",
        talking: [
          {
            disqualify: ["inform8"],
            events: [
              { type: "addStoryFlag", flag:"inform8" },
              { who: "kp", type: "textMessage", text: "【威尔】：克莱尔...（叹息）...克莱尔.布兰德，我知道你会来，我等你很久了。" },
              { who: "kp", type: "textMessage", text: "【威尔】：可你明白，既然你到了这，就没有回头路了。" },
              { who: "hero", type: "textMessage", text: "【克莱尔】：威尔叔叔，这一切究竟是怎么回事？我只想知道真相......" },
              { who: "kp", type: "textMessage", text: "【威尔】：真相...向来都不是让人开心的东西。" },
              { who: "hero", type: "textMessage", text: "【克莱尔】：我不在乎它有多残酷，我只怕埋葬我父母的时候哭的不明不白。" },
              { who: "hero", type: "textMessage", text: "【克莱尔】：威尔叔叔，请你告诉我，哈里森夫妇到底是谁？为什么要装作我的爸爸妈妈？我的眼睛又是怎么回事？" },
              { who: "kp", type: "textMessage", text: "【威尔】：好吧..." },
              { who: "kp", type: "textMessage", text: "【威尔】：我想你已经知道了，你不是人类。在机器人入世之前，你是我设计的拥有成熟智慧系统的生化人之一，但因为视觉代码极不稳定，被机械生命研究协会抛弃了。" },
              { who: "kp", type: "textMessage", text: "【威尔】：我想，本来你作为生化人的、浑浑沌沌的一生应该会到此为止，惨淡落幕。但也许是命运眷顾你，孩子，事情又有了转机。" },
              { who: "kp", type: "textMessage", text: "【威尔】：布兰德夫妇发现了你，并且决定收养你。" },
              { who: "kp", type: "textMessage", text: "【威尔】：你的爸爸妈妈...他们很爱你，他们完完全全把你当作人类来抚养，因此你拥有几乎和正常人类一般无二的情感。" },
              { who: "hero", type: "textMessage", text: "【克莱尔】：爸爸...妈妈......" },
              { who: "hero", type: "textMessage", text: "【克莱尔】：...所以爸爸妈妈是怎么...是那场事故？" },
              { who: "kp", type: "textMessage", text: "【威尔】：是的。很遗憾，你的父母在三个月前的那场事故中就已经遇难了，而你当时重伤昏迷。" },
              { who: "kp", type: "textMessage", text: "【威尔】：研究会处理不了你身上棘手的损伤，如果没有意外，你会治疗无效，就此离世。" },
              { who: "kp", type: "textMessage", text: "【威尔】：虽然，作为一个机械生命，你身体的某些部分能够留存下来...但你的记忆、你的情感、你的意识都会消失，作为真真正正的“人”，那是彻底的死亡。" },
              { who: "hero", type: "textMessage", text: "【克莱尔】：可是...我还活着。" },
              { who: "kp", type: "textMessage", text: "【威尔】：...这是另一个转折点。这一切源于哈里森夫妇对这场事故少有的关注。这实在是个小概率事件，毕竟事故规模不大，而哈里森夫妇事业有成，管理着偌大的哈里森集团实在很忙。" },
              { who: "kp", type: "textMessage", text: "【威尔】：唯一引人注意的地方...布兰德夫妇曾为哈里森集团研究员的身份？或者更有可能......是听说了关于你的消息，又得知你丢失了视觉代码。" },
              { who: "hero", type: "textMessage", text: "【克莱尔】：丢失的视觉代码......对...事故后我确实失明了，可是这有什么特别引人注意的？" },
              { who: "kp", type: "textMessage", text: "【威尔】：“失明的十来岁女孩，身遭变故，需要陪伴”，这个形象太过特殊，让他们想到一个人，一个他们投注了爱与悔恨的，特殊的人。" },
              { who: "hero", type: "textMessage", text: "【克莱尔】：...我想，我知道这个人是谁。她叫瑞雯，是哈里森夫妇的亲生女儿，对吗？" },
              { who: "kp", type: "textMessage", text: "【威尔】：聪明的孩子。（叹息）" },
              { who: "kp", type: "textMessage", text: "【威尔】：瑞雯.哈里森，她是哈里森夫妇死去的女儿。和你一样，多年前在一场事故中失明。" },
              { who: "kp", type: "textMessage", text: "【威尔】：哈里森夫妇无疑为瑞雯提供了最好的医疗条件，但也许是因为忙于工作的他们没有意识到，缺少了父母的陪伴和关怀，骤然失去光明对于敏感的瑞雯来说是多么大的打击。" },
              { who: "kp", type: "textMessage", text: "【威尔】：总之，我所知道的是，事故几个月后，瑞雯确诊了抑郁症，身体明明恢复得越来越好，精神状态却每况愈下。" },
              { who: "kp", type: "textMessage", text: "【威尔】：最终，瑞雯用一瓶毒药结束了自己的生命。" },
              { who: "hero", type: "textMessage", text: "【克莱尔】：...原来是这样，所以哈里森夫妇是一对失去了孩子的父母..." },
              { who: "kp", type: "textMessage", text: "【威尔】：他们也曾有过自己的所爱，但没能竭尽全力守护她。你失去了父母，他们失去了孩子，同为痛苦中煎熬的灵魂，你们寻找着一样的救赎。" },
              { who: "kp", type: "textMessage", text: "【威尔】：所以当哈里森夫妇见到了你，他们立刻有了一些......大胆的想法。" },
              { who: "kp", type: "textMessage", text: "【威尔】：研究会的人告诉哈里森，他们对你的损伤无能为力，但也许...我有救你的能力。" },
              { who: "kp", type: "textMessage", text: "【威尔】：于是这对夫妇找到我，不惜一切代价求我治好你，但是不能找回你丢失的视觉代码。" },
              { who: "kp", type: "textMessage", text: "【威尔】：我最终同意了。毕竟我不可能看着你死去。" },
              { who: "hero", type: "textMessage", text: "【克莱尔】：所以我不能恢复视觉，是因为他们..." },
              { who: "kp", type: "textMessage", text: "【威尔】：他们选择了向你隐瞒事实，取走了布兰德夫妇的尸体，录取声纹和记忆，想要以你父母的身份继续照顾你，补偿他们愧对瑞雯的心理创伤。" },
              { who: "hero", type: "textMessage", text: "【克莱尔】：所以，这大概不能算是一场绑架..." },
              { who: "hero", type: "textMessage", text: "【克莱尔】：可为什么我的视觉恢复了？还有床头柜上的纸条..." },
              { who: "kp", type: "textMessage", text: "【威尔】：是我。" },
              { who: "kp", type: "textMessage", text: "【威尔】：我同情他们的遭遇，但不能认同他们的做法。" },
              { who: "kp", type: "textMessage", text: "【威尔】：你一直被蒙在鼓里，甚至没有参与切身决策的权利，而这对你并不公平。" },
              { who: "kp", type: "textMessage", text: "【威尔】：所以我最终还是找回了你的视觉代码，设定在几个月后启动。" },
              { who: "kp", type: "textMessage", text: "【威尔】：在房间里，一切电子信息都会被察觉，我留下了纸条，把选择的权利交还给你。" },
              { who: "hero", type: "textMessage", text: "【克莱尔】：他们为什么不直接清除我的记忆？" },
              { who: "hero", type: "textMessage", text: "【克莱尔】：到现在，我还有什么选择呢……" },
              { who: "kp", type: "textMessage", text: "【威尔】：孩子，你的情感系统是和记忆直接关联的，如果清除记忆，你就真的变成了一堆冷漠的机器，不用说共情，你连家人的概念都不再能理解了。救赎总是有代价的。" },
              { who: "kp", type: "textMessage", text: "【威尔】：我可以抹去你的部分记忆，那样你就能回到哈里森夫妇身边，做他们的女儿，他们一定会竭尽所能去给你幸福。" },
              { who: "kp", type: "textMessage", text: "【威尔】：如果你选择离开，就得拼命地跑，在走出他们的领地之前，一直会有人到处找你。" },
              {
                type: "choose",
                choices: [
                  {
                    label: "接受现实，抹去记忆",
                    description: "就这样吧，寡人倦了。",
                    storyflag: "over3",
                  },
                  {
                    label: "接受命运，选择出逃",
                    description: "总有地上的生灵敢于直面雷霆的微光。",
                    storyflag: "over4",
                  }
                ],
              },
            ]
          }
        ],
      },
    },
    cutsceneSpaces: {
      [utils.asGridCoord(7, 11)]: [
        {
          events: [
            {
              type: "changeMap",
              map: "livingroom",
              x: utils.withGrid(4),
              y: utils.withGrid(2),
              direction: "down"
            }
          ]
        }
      ],
      [utils.asGridCoord(9, 5)]: [
        {
          required: ["over3"],
          events: [//结局3
            { type: "gameOver", path: "./gameover/over3.html" },//相对game.html的文件路径，而不是相对OverworldMap.js!!!
          ]
        },
        {
          required: ["over4"],
          events: [//结局4
            { type: "gameOver", path: "./gameover/over4.html" },//相对game.html的文件路径，而不是相对OverworldMap.js!!!
          ]
        }
      ],
      [utils.asGridCoord(11, 5)]: [
        {
          required: ["over3"],
          events: [//结局3
            { type: "gameOver", path: "./gameover/over3.html" },//相对game.html的文件路径，而不是相对OverworldMap.js!!!
          ]
        },
        {
          required: ["over4"],
          events: [//结局4
            { type: "gameOver", path: "./gameover/over4.html" },//相对game.html的文件路径，而不是相对OverworldMap.js!!!
          ]
        }
      ],
      [utils.asGridCoord(10, 4)]: [
        {
          required: ["over3"],
          events: [//结局3
            { type: "gameOver", path: "./gameover/over3.html" },//相对game.html的文件路径，而不是相对OverworldMap.js!!!
          ]
        },
        {
          required: ["over4"],
          events: [//结局4
            { type: "gameOver", path: "./gameover/over4.html" },//相对game.html的文件路径，而不是相对OverworldMap.js!!!
          ]
        }
      ],
      [utils.asGridCoord(12, 6)]: [
        {
          required: ["over3"],
          events: [//结局3
            { type: "gameOver", path: "./gameover/over3.html" },//相对game.html的文件路径，而不是相对OverworldMap.js!!!
          ]
        },
        {
          required: ["over4"],
          events: [//结局4
            { type: "gameOver", path: "./gameover/over4.html" },//相对game.html的文件路径，而不是相对OverworldMap.js!!!
          ]
        }
      ],
      [utils.asGridCoord(11, 7)]: [
        {
          required: ["over3"],
          events: [//结局3
            { type: "gameOver", path: "./gameover/over3.html" },//相对game.html的文件路径，而不是相对OverworldMap.js!!!
          ]
        },
        {
          required: ["over4"],
          events: [//结局4
            { type: "gameOver", path: "./gameover/over4.html" },//相对game.html的文件路径，而不是相对OverworldMap.js!!!
          ]
        }
      ],
      [utils.asGridCoord(9, 7)]: [
        {
          required: ["over3"],
          events: [//结局3
            { type: "gameOver", path: "./gameover/over3.html" },//相对game.html的文件路径，而不是相对OverworldMap.js!!!
          ]
        },
        {
          required: ["over4"],
          events: [//结局4
            { type: "gameOver", path: "./gameover/over4.html" },//相对game.html的文件路径，而不是相对OverworldMap.js!!!
          ]
        }
      ],
      [utils.asGridCoord(8, 6)]: [
        {
          required: ["over3"],
          events: [//结局3
            { type: "gameOver", path: "./gameover/over3.html" },//相对game.html的文件路径，而不是相对OverworldMap.js!!!
          ]
        },
        {
          required: ["over4"],
          events: [//结局4
            { type: "gameOver", path: "./gameover/over4.html" },//相对game.html的文件路径，而不是相对OverworldMap.js!!!
          ]
        }
      ],
    },
    walls: function () {
      let walls = {};
      ["7,12",
        "6,11", "5,11", "4,11", "8,11", "9,11", "10,11", "11,11", "12,11",
        "13,10", "3,10",
        "2,9", "10,9", "11,9", "12,9",
        "13,8", "10,8", "9,8", "8,8", "6,8", "1,8",
        "1,7", "4,7", "5,7", "6,7", "12,7", "8,7",
        "13,6", "10,6", "6,6", "5,6", "4,6", "2,6", "1,6",
        "1,5", "2,5", "3,5", "4,5", "5,5", "6,5", "13,5",
        "13,4", "6,4", "5,4", "4,4", "3,4", "2,4", "1,4",
        "5,3", "8,3", "13,3", "9,3",
        "13,2", "12,2", "11,2", "10,2", "9,2", "8,2", "7,2", "6,2", "5,2",
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
