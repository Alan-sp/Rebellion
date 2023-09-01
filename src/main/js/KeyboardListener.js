class KeyboardListener
{
    constructor(keycode,reaction)
    {
        this.IsKeydown = false;
        this.CheckKeydown = (event) =>
        {
            if(event.keyCode == keycode)
            {
                this.IsKeydown = true;
                reaction();
            }
        };
        this.CheckKeyup = (event) =>
        {
            if(event.keyCode == keycode)
            {
                this.IsKeydown = false;
            }
        };
        document.addEventListener("keydown",this.CheckKeydown);
        document.addEventListener("keyup",this.CheckKeyup);
    }
    unbind() 
    { 
        document.removeEventListener("keydown", this.CheckKeydown);
        document.removeEventListener("keyup", this.CheckKeyup);
    }
}