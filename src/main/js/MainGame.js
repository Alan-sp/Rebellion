class MainGame
{
    constructor(config)
    {
        this.canvas = document.getElementById("GameCanvas");
        this.ctx = this.canvas.getContext("2d");
        this.map = new Image();
        this.map.src = './images/Map_test.png'
        // this.wall = config.wall;
        this.Obj = new character(
            {
                x: 300,
                y: 400,
                direction: "up",
                src: "./images/Rebellion.png",
                ctx: this.ctx,
                state: "Stayedup",
            })
        this.WListener = new KeyboardListener(87,()=>
        {
            this.Obj.direction = "up";
            this.Refresh();
        });
        this.AListener = new KeyboardListener(65,()=>
        {
            this.Obj.direction = "left";
            this.Refresh();
        });
        this.SListener = new KeyboardListener(83,()=>
        {
            this.Obj.direction = "down";
            this.Refresh();
        });
        this.DListener = new KeyboardListener(68,()=>
        {
            this.Obj.direction = "right";
            this.Refresh();
        });
        this.WListener = new KeyboardListener(38,()=>
        {
            this.Obj.direction = "up";
            this.Refresh();
        });
        this.AListener = new KeyboardListener(37,()=>
        {
            this.Obj.direction = "left";
            this.Refresh();
        });
        this.SListener = new KeyboardListener(40,()=>
        {
            this.Obj.direction = "down";
            this.Refresh();
        });
        this.DListener = new KeyboardListener(39,()=>
        {
            this.Obj.direction = "right";
            this.Refresh();
        });
    }
    Refresh()
    {
        this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
        // this.ctx.fillStyle = "#3d3d3d";
        // this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height);
        this.ctx.drawImage(
            this.map,
            0,0,
            this.canvas.width,this.canvas.height,
        );  
        this.Obj.ticking
        ({
            direction:this.Obj.direction,
            step:this.Obj.step,
        });
        const [X,Y] = this.Obj.pos;
        this.ctx.drawImage(
            this.Obj.Image.image,
            X*65,Y*65,
            70,70,
            this.Obj.x,this.Obj.y,
            70,70
            )
        this.state = "Move"+this.Obj.direction;
    }
}

var test = new MainGame();
test.Refresh();

var testtext = new Dialogue({
    text: "Just for test.",
    osComplete: ()=>{},
});
testtext.NewTalk(document.querySelector('.game'));