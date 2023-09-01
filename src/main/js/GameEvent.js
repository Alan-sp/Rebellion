class GameEvent
{
    constructor(config)
    {
        this.type = config.type;
        this.event = config.event;
    }

    Message()
    {
        const newMessage = new Dialogue
        ({
            text: this.event.text,
            onComplete:() => {},
        })
        newMessage.NewTalk(document.querySelector('.game'));
    }
}