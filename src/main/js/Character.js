class character extends Objects
{
    constructor(config)
    {
        super(config);
        this.step = 20;
        this.actions=
        {
            "Stayedup":  [[0,0]],
            "Stayeddown":[[0,3]],
            "Stayedleft":[[0,1]],
            "Stayedright":  [[0,2]],
            "Moveup": [[0,0],[1,0],[2,0],[3,0],[4,0],[5,0],[6,0],[7,0],[8,0],],
            "Moveleft": [[0,1],[1,1],[2,1],[3,1],[4,1],[5,1],[6,1],[7,1],[8,1],],
            "Moveright": [[0,2],[1,2],[2,2],[3,2],[4,2],[5,2],[6,2],[7,2],[8,2],],
            "Movedown": [[0,3],[1,3],[2,3],[3,3],[4,3],[5,3],[6,3],[7,3],[8,3],],
        }
        this.state = config.state;
        this.FrameNum = 8;
        this.CurrentPos = 0;
    }
    get pos()
    {
        return this.actions[this.state][this.CurrentPos];
    }

    update(direction)
    {
        if("Move" + direction == this.state) 
        {
            this.FrameNum -= 1;
            if(this.FrameNum == 0)
            {
                this.FrameNum = 8;
                this.CurrentPos += 1;
                if(this.CurrentPos > 8)
                    this.CurrentPos = 0;
            }
        }
        else
        {
            this.state = "Move"+direction;
            this.CurrentPos = 0;
            this.FrameNum = 8;
        }
    }

    move(direction,step)
    {
        if(direction=="up") this.y -= step;
        if(direction=="down") this.x += step;
        if(direction=="left") this.x -= step;
        if(direction=="right") this.y += step;
    }

    ticking(state)
    {
        this.update(state.direction);
        this.move(state.direction,this.step);
    }
}