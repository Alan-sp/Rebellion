class Objects
{
    constructor(config)
    {
        this.x = config.x;
        this.y = config.y;
        this.direction = config.direction;
        this.Image = new GameImage(config);
        this.talking = config.talking;
    }
    update(){}
    ticking(){} 
};