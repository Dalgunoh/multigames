const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const box = 20; // tamaño de cada celda
const canvasSize = 400;
const rows = canvasSize / box;
const cols = canvasSize / box;

// Estado del juego
let snake, direction, food, score, gameLoop, alive;

function initGame() {
    snake = [
        { x: 8, y: 10 },
        { x: 7, y: 10 }
    ];
    direction = "RIGHT";
    food = randomFood();
    score = 0;
    alive = true;
    document.getElementById("score").textContent = "Puntaje: 0";
    document.getElementById("gameOver").style.display = "none";
    document.getElementById("restartBtn").style.display = "none";
    clearInterval(gameLoop);
    gameLoop = setInterval(draw, 110);
}

function randomFood() {
    let pos;
    do {
        pos = {
            x: Math.floor(Math.random() * cols),
            y: Math.floor(Math.random() * rows)
        };
    } while (snake && snake.some(seg => seg.x === pos.x && seg.y === pos.y));
    return pos;
}

function drawCell(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * box, y * box, box - 1, box - 1);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dibuja la serpiente
    for (let i = 0; i < snake.length; i++) {
        drawCell(snake[i].x, snake[i].y, i === 0 ? "#00e676" : "#388e3c");
    }

    // Dibuja la comida
    drawCell(food.x, food.y, "#ffeb3b");

    // Mueve la serpiente
    let head = { ...snake[0] };
    switch (direction) {
        case "LEFT": head.x--; break;
        case "UP": head.y--; break;
        case "RIGHT": head.x++; break;
        case "DOWN": head.y++; break;
    }

    // Colisión con pared
    if (
        head.x < 0 || head.x >= cols ||
        head.y < 0 || head.y >= rows ||
        snake.some(seg => seg.x === head.x && seg.y === head.y)
    ) {
        gameOver();
        return;
    }

    snake.unshift(head);

    // Comer comida
    if (head.x === food.x && head.y === food.y) {
        score++;
        document.getElementById("score").textContent = "Puntaje: " + score;
        food = randomFood();
    } else {
        snake.pop();
    }
}

function gameOver() {
    alive = false;
    clearInterval(gameLoop);
    document.getElementById("gameOver").style.display = "block";
    document.getElementById("restartBtn").style.display = "inline-block";
}

window.addEventListener("keydown", e => {
    if (!alive) return;
    switch (e.key) {
        case "ArrowLeft":
        case "a":
            if (direction !== "RIGHT") direction = "LEFT";
            break;
        case "ArrowUp":
        case "w":
            if (direction !== "DOWN") direction = "UP";
            break;
        case "ArrowRight":
        case "d":
            if (direction !== "LEFT") direction = "RIGHT";
            break;
        case "ArrowDown":
        case "s":
            if (direction !== "UP") direction = "DOWN";
            break;
    }
});

document.getElementById("restartBtn").addEventListener("click", initGame);

initGame();
