interface Window {
    requestAnimFrame: (callback: () => void) => any
    [key: string]: any
}

var w = 400, h = 600, ballSize = 8, brickW = 30, brickH = 20, batW = 100, batH = 10
var ballX: number, ballY: number, dx: number, dy: number, bricks: Brick[] = [], batX = w/2, batY = (h - batH)
var c = document.getElementById("canvas") as HTMLCanvasElement
var ctx = c.getContext("2d") as CanvasRenderingContext2D
const colors = ["#ff4342", "#fe8d41", "#a987de", "#2bd500", "#eee744", "#62c2da", "#b5b4b6"]
c.width = w; c.height = h

// ball trail
var motionTrailLength = 100;
var positions: {x: number, y: number}[] = [];
function storeLastPosition(xPos: number, yPos: number) {
    // push an item
    positions.push({
      x: xPos,
      y: yPos
    });
   
    //get rid of first item
    if (positions.length > motionTrailLength) {
      positions.shift();
    }
  }
enum Keyboard {
    idle = 0,
    left = -1,
    right = 1
}

var d: Keyboard = 0

interface Brick {
    x: number,
    y: number,
    active: boolean,
    color: string
}

function init() {
    bricks = [], ballX=w/2, ballY = h - 100, dx = .5, dy = -.5
    for (var y = 0; y < 10; y++) {
        for (var x = y/2; x < 13 - y/2; x++) {
            bricks.push({
                x:  x * brickW,
                y: y * brickH,
                active: true,
                color: colors[Math.floor(Math.random() * colors.length)]
            })
        }
    }
}

function drawRect(color: string | CanvasGradient | CanvasPattern, x: number, y: number, w: number, h: number) {
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.rect(x, y, w, h)
    ctx.fill()
    ctx.lineWidth = .5;
    ctx.stroke()
}

function drawCircle(color: string | CanvasGradient | CanvasPattern, x: number, y: number, r: number) {
    ctx.fillStyle = color,
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI, false)
    ctx.fill()
}

function draw() {
    drawRect("#eee", 0, 0, w, h)
    for (var i = 0; i < positions.length; i++) {
        drawCircle("#FF6A6A", positions[i].x, positions[i].y, ballSize)
    }
    drawCircle("#f00", ballX, ballY, ballSize)
    for (var i = 0; i < bricks.length; i++) {
        var b = bricks[i]
        if (!b.active) continue
        drawRect(b.color, b.x, b.y, brickW, brickH)
    }
    drawRect("#00f", batX - batW/2, batY, batW, batH)
} 

function move() {
    storeLastPosition(ballX, ballY)
    // wall redirection
    if (ballX - ballSize + dx < 0 || ballX + ballSize + dx > w) dx = -dx
    if (ballY - ballSize + dy < 0) dy = -dy

    // paddle redirection
    if (ballY - ballSize > batY) return false
    if (ballY + ballSize >= batY && ballX + ballSize >= batX - batW/2 && ballX - ballSize <= batX + batW/2) {
        if (ballY + ballSize > batY) {
            dx = -dx
        }
        else {
            console.log(ballX - batX)
            dx = (0.5 * 2) * ((ballX - batX)/(batW))
            dy = -dy
        }
    }
    ballX += dx
    ballY += dy

    for (var i = 0; i < bricks.length; i++) {
        var b = bricks[i]
        if (!b.active) continue
        if (b.x <= ballX + ballSize && ballX - ballSize <= b.x + brickW && b.y <= ballY + ballSize && ballY - ballSize <= b.y + brickH) {
            b.active = false
            if (ballX < b.x || ballX > b.x + brickW) {
                dx = -dx
            }
            else {
                dy = -dy
            }
            break
        }
    }
    return true
}

function game() {
    console.log(positions)
    if (!move()) {
        // GAME OVER
        clearInterval(running)
    }
    move()
    moveBar()
    draw()
}
function moveBar() {
    switch (d) {
        case Keyboard.left: if (batX > batW / 2) batX -= Math.min(1, batX); break
        case Keyboard.right: if (batX < w - (batW / 2)) batX += Math.min(1, w - batX); break
    }
}

document.addEventListener("keydown", (ev: KeyboardEvent) => {
    switch (ev.key) {
        case "ArrowLeft": d = Keyboard.left; break
        case "ArrowRight": d = Keyboard.right; break
    }
})

document.addEventListener("keyup", (ev: KeyboardEvent) => {
    console.log()
    if (["ArrowLeft", "ArrowRight"].indexOf(ev.key) !== -1) {
        d = Keyboard.idle;
    }
})

init()

window.requestAnimFrame = (function (callback) {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (callback) {
        window.setTimeout(callback, 100);
    };
}());

//setInterval(game, 1)
let running = setInterval(function () {
    window.requestAnimFrame(game);
}, 1);

