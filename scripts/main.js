"use strict";
var w = 400, h = 600, ballSize = 8, brickW = 30, brickH = 20, batW = 100, batH = 10;
var ballX, ballY, dx, dy, bricks = [], batX = w / 2, batY = (h - batH);
var c = document.getElementById("canvas");
var ctx = c.getContext("2d");
const colors = ["#ff4342", "#fe8d41", "#a987de", "#2bd500", "#eee744", "#62c2da", "#b5b4b6"];
c.width = w;
c.height = h;
// ball trail
var motionTrailLength = 100 ;
var positions = [];
function storeLastPosition(xPos, yPos) {
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
var Keyboard;
(function (Keyboard) {
    Keyboard[Keyboard["idle"] = 0] = "idle";
    Keyboard[Keyboard["left"] = -1] = "left";
    Keyboard[Keyboard["right"] = 1] = "right";
})(Keyboard || (Keyboard = {}));
var d = 0;
function init() {
    bricks = [], ballX = w / 2, ballY = h - 100, dx = .5, dy = -.5;
    for (var y = 0; y < 10; y++) {
        for (var x = y / 2; x < 13 - y / 2; x++) {
            bricks.push({
                x: x * brickW,
                y: y * brickH,
                active: true,
                color: colors[Math.floor(Math.random() * colors.length)]
            });
        }
    }
}
function drawRect(color, x, y, w, h) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.fill();
    ctx.lineWidth = .5;
    ctx.stroke();
}
function drawCircle(color, x, y, r) {
    ctx.fillStyle = color,
        ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI, false);
    ctx.fill();
}
function draw() {
    drawRect("#eee", 0, 0, w, h);
    for (var i = 0; i < positions.length; i++) {
        drawCircle(`rgb(255, 107, 107, ${1/(positions.length - i)})`, positions[i].x, positions[i].y, ballSize - ballSize/(2 * (i + 1)));
    }
    drawCircle("#f00", ballX, ballY, ballSize);
    for (var i = 0; i < bricks.length; i++) {
        var b = bricks[i];
        if (!b.active)
            continue;
        drawRect(b.color, b.x, b.y, brickW, brickH);
    }
    drawRect("#00f", batX - batW / 2, batY, batW, batH);
}
function move() {
    storeLastPosition(ballX, ballY);
    // wall redirection
    if (ballX - ballSize + dx < 0 || ballX + ballSize + dx > w)
        dx = -dx;
    if (ballY - ballSize + dy < 0)
        dy = -dy;
    // paddle redirection
    if (ballY - ballSize > batY)
        return false;
    if (ballY + ballSize >= batY && ballX + ballSize >= batX - batW / 2 && ballX - ballSize <= batX + batW / 2) {
        if (ballY + ballSize > batY) {
            dx = -dx;
        }
        else {
            console.log(ballX - batX);
            dx = (0.5 * 4) * ((ballX - batX) / (batW));
            dy = -dy;
        }
    }
    ballX += dx;
    ballY += dy;
    for (var i = 0; i < bricks.length; i++) {
        var b = bricks[i];
        if (!b.active)
            continue;
        if (b.x <= ballX + ballSize && ballX - ballSize <= b.x + brickW && b.y <= ballY + ballSize && ballY - ballSize <= b.y + brickH) {
            b.active = false;
            if (ballX < b.x || ballX > b.x + brickW) {
                dx = -dx;
            }
            else {
                dy = -dy;
            }
            break;
        }
    }
    return true;
}
function game() {
    console.log(positions);
    if (!move()) {
        // GAME OVER
        clearInterval(running);
    }
    move();
    moveBar();
    draw();
}
function moveBar() {
    switch (d) {
        case Keyboard.left:
            if (batX > batW / 2)
                batX -= Math.min(1, batX);
            break;
        case Keyboard.right:
            if (batX < w - (batW / 2))
                batX += Math.min(1, w - batX);
            break;
    }
}
document.addEventListener("keydown", (ev) => {
    switch (ev.key) {
        case "ArrowLeft":
            d = Keyboard.left;
            break;
        case "ArrowRight":
            d = Keyboard.right;
            break;
    }
});
document.addEventListener("keyup", (ev) => {
    console.log();
    if (["ArrowLeft", "ArrowRight"].indexOf(ev.key) !== -1) {
        d = Keyboard.idle;
    }
});
init();
window.requestAnimFrame = (function (callback) {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (callback) {
        window.setTimeout(callback, 100);
    };
}());
//setInterval(game, 1)
let running = setInterval(function () {
    window.requestAnimFrame(game);
}, 1);
