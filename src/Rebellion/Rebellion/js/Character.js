class character extends Objects
{
    constructor(config)
    {
        super(config);
        this.step = 20;
    }

    ticking(state)
    {
        move(state.direction,this.step);
    }

    move(direction,step)
    {
        if(direction=="up") this.y -= step;
        if(direction=="down") this.x += step;
        if(direction=="left") this.x -= step;
        if(direction=="right") this.y += step;
    }
}