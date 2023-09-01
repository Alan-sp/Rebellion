class Dialogue
{
    constructor(config)
    {
        this.text = config.text;
        this.isComplete = false;
        this.speed = 60;
        this.element = null;
        this.talk = null;
        this.Listener1 = null;
        this.Listener2 = null;
        this.delay = null;
    }

    reveal(Textlist)
    {
        const next = Textlist.splice(0,1)[0];
        next.classList.add("revealed");

        if (Textlist.length > 0) 
        {
            this.timeout = setTimeout(() => 
            {
            this.reveal(Textlist)
            }, this.speed)
        } 
        else 
        {
            this.isDone = true;
        }
    }

    ShowText()
    {
        var Textlist = [];
        // Textlist.length
        this.text.split("").forEach( character => {
            var span = document.createElement("span");
            span.textContent = character;
            this.talk.appendChild(span);
            Textlist.push(span);
        });
        this.reveal(Textlist);
    }

    NewTalk(Contains)
    {
        this.element = document.createElement('div');
        this.element.classList.add("NowTalk");

        this.element.innerHTML = (`
            <p class="NowTalk_p"></p>
            <button class="Talkbutton">Next</button>
        `)
        
        this.element.querySelector("button").addEventListener("click",()=>{this.end()});
        this.Listener1 = new KeyboardListener(32,()=>{this.end()});
        this.Listener2 = new KeyboardListener(13,()=>{this.end()});
        
        Contains.appendChild(this.element);
        this.talk = this.element.querySelector(".NowTalk_p");
        this.ShowText();
    }
    
    end()
    {
        if(this.isComplete)
        {
            this.element.remove();
            // this.Listener1.unbind();
            // this.Listener2.unbind();
            // this.config.onComplete();
        }
        else 
        {
            clearTimeout(this.delay);
            this.isComplete = true;
            this.element.querySelectorAll("span").forEach(s => 
            {
                s.classList.add("revealed");
            })
        }
    }
}