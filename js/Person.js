class Person extends GameObject {
  constructor(config) {
    super(config);
    this.movingProgressRemaining = 0;
    this.isStanding = false;
    this.intentPosition = null; // [x,y]

    this.isPlayerControlled = config.isPlayerControlled || false;

    this.directionUpdate = {
      "up": ["y", -2],//modify walking speed
      "down": ["y", 2],
      "left": ["x", -2],
      "right": ["x", 2],
    }
    this.standBehaviorTimeout;
  }

  update(state) {
    if (this.movingProgressRemaining > 0) {
      this.updatePosition();
    } else {
      //We're keyboard ready and have an arrow pressed
      if (!state.map.isCutscenePlaying && this.isPlayerControlled && state.arrow) {
        this.startBehavior(state, {
          type: "walk",
          direction: state.arrow
        })
      }
      this.updateSprite(state);
    }
  }
  
  startBehavior(state, behavior) {
    
    if (!this.isMounted) {
      return;
    }
    
    //Set character direction to whatever behavior has
    this.direction = behavior.direction;
    
    if (behavior.type === "walk") {
      //Stop here if space is not free
      if (state.map.isSpaceTaken(this.x, this.y, this.direction)) {
        
        
        behavior.retry && setTimeout(() => {
          this.startBehavior(state, behavior)
        }, 10);
          return;
          
        }
        
        //Ready to walk!
        this.movingProgressRemaining = 64;//modify walking speed
        
        //Add next position intent
        const intentPosition = utils.nextPosition(this.x,this.y, this.direction)
        this.intentPosition = [
          intentPosition.x,
          intentPosition.y,
        ]
        
        this.updateSprite(state);
      }
      
      if (behavior.type === "stand") {
        this.isStanding = true;
        
        if (this.standBehaviorTimeout) {
          clearTimeout(this.standBehaviorTimeout);
          console.log("xlear")
        }
        this.standBehaviorTimeout = setTimeout(() => {
          utils.emitEvent("PersonStandComplete", {
            whoId: this.id
          })
          this.isStanding = false;
        }, behavior.time)
      }

    }
    
    updatePosition() {
      const [property, change] = this.directionUpdate[this.direction];
      this[property] += change;
      this.movingProgressRemaining -= 2;
      
      if (this.movingProgressRemaining === 0) {
        //We finished the walk!
        this.intentPosition = null;
        utils.emitEvent("PersonWalkingComplete", {
          whoId: this.id
        })
        console.log(this.x/64,this.y/64);
        
      }
    }
    
    updateSprite() {
      if (this.movingProgressRemaining > 0) {
        this.sprite.setAnimation("walk-"+this.direction);
        return;
    }
    this.sprite.setAnimation("idle-"+this.direction);    
  }

  showLihui() {
    this.hideLihui();
    document.getElementById(`${this.id}`).style.display = "block";
  }

  hideLihui() {
    document.querySelectorAll(".lihui").forEach(item =>{
      item.style.display = "none";
    })
  }
}