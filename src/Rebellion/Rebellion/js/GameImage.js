class GameImage
{
    constructor(config)
    {
        this.image = new Image();
        this.image.src = config.src;
        this.IsOnload = false;
        this.image.onload = ()=>
        {
            this.IsOnload = true;
            console.log("Successfully Loaded");
        }
        this.image.onerror = ()=>
        {
            this.IsOnload = false;
            console.log("Something error has happened");
        }
    }
}