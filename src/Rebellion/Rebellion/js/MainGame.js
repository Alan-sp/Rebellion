class MainGame
{
    constructor()
    {
        this.canvas = document.getElementById("GameCanvas");
        this.ctx = this.canvas.getContext("2d");
        this.map = null;
        this.Obj = new character(
            {
                x: 300,
                y: 400,
                direction: "up",
                src: "./images/wall.png",
                ctx: this.ctx,
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
        this.SListener = new KeyboardListener(68,()=>
        {
            this.Obj.direction = "down";
            this.Refresh();
        });
        this.DListener = new KeyboardListener(83,()=>
        {
            this.Obj.direction = "right";
            this.Refresh();
        });
    }
    Refresh()
    {
        this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
        this.ctx.fillStyle = "#3d3d3d";
        this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height);
        this.Obj.move(this.Obj.direction,this.Obj.step);
        this.ctx.drawImage(
            this.Obj.Image.image,
            this.Obj.x,
            this.Obj.y
            )
    }
}

var test = new MainGame();
test.Refresh();