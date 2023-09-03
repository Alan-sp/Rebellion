let canvas = document.createElement("canvas")
canvas.width = window.innerWidth
canvas.height = window.innerHeight
canvas.style.zIndex = -1
canvas.style.position="fixed"
let ctx = canvas.getContext("2d")
document.body.appendChild(canvas)
let particles = []
let pcount = 1000
let actions = ["right", "up", "left", "down", "around"]
let action = 0
document.body.addEventListener("click", function() {
    action++
    action = action % actions.length
})
class particle {
    constructor() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.vx = Math.random()
    }
    update() {
        switch (actions[action]) {
            case "right":
                this.x += this.vx * 3
                if (this.x > canvas.width) {
                    this.x = 0
                }
                break
            case "left":
                this.x -= this.vx * 3
                if (this.x < 0) {
                    this.x = canvas.width
                }
                break
            case "up":
                this.y -= this.vx * 3
                if (this.y < 0) {
                    this.y = canvas.height
                }
                break
            case "down":
                this.y += this.vx * 3
                if (this.y > canvas.height) {
                    this.y = 0
                }
                break
            case "around":
                let deg = Math.atan2((this.y - canvas.height / 2), (this.x - canvas.width / 2))
                let r = Math.sqrt(Math.pow(this.x - canvas.width / 2, 2) + Math.pow(this.y - canvas.height / 2, 2))
                this.x = r * Math.cos(deg + this.vx / 200) + canvas.width / 2
                this.y = r * Math.sin(deg + this.vx / 200) + canvas.height / 2

                break
        }

    }
    draw() {
        ctx.beginPath()
        ctx.arc(this.x, this.y, 1 + this.vx, 0, Math.PI * 2)
        ctx.fillStyle = "rgba(255,255,255," + this.vx + ")"
        ctx.fill()
    }
}

function ani() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (particles.length < pcount) {
        particles.push(new particle)
    }
    for (let i in particles) {
        let p = particles[i]
        p.update()
        p.draw()
    }

}
setInterval(ani, 100 / 6)