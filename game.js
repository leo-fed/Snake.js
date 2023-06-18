let score = 0;
let bestScore;

const scoreNode = document.getElementById("score");
const bestScoreNode = document.getElementById("best-score");
const restartBtn = document.getElementById("restart");

document.addEventListener("DOMContentLoaded", () => {
    bestScore = localStorage.getItem("bestScore");
    if (bestScore) { 
        bestScore = JSON.parse(bestScore);
        bestScoreNode.textContent = bestScore;
    } else {
        bestScore = 0;
    }
});
restartBtn.addEventListener("click", restart);

function restart() {
    location.reload()
}

let biteStatus = 0;

let dir; // направление движения змейки
let count = 0; // счётчик смены направления змейки (чтобы змейка не могла менять направление дважды за одну смену кадра)

document.addEventListener("keydown", direction);

function direction(event) {
	if (count === 0) { // если змейка не меняла направление
        if(event.keyCode == 37 && dir != "right") {
            dir = "left";
            count = 1; 
        }
        else if(event.keyCode == 38 && dir != "down") {
            dir = "up";
            count = 1; 
        }
        else if(event.keyCode == 39 && dir != "left") {
            dir = "right";
            count = 1; 
        }
        else if(event.keyCode == 40 && dir != "up") {
            dir = "down";
            count = 1; 
        }
    }
}

class Field {
    constructor() {
        this.element = document.getElementById('canvas');
        this.context = this.element.getContext('2d');

        this.box = 32;  // размер клетки
        this.size = 19; // размер поля в клетках
    }

    draw() {}
}

class Snake {
    constructor(canvas, box, fieldSize) {
        this.canvas = canvas;
        this.box = box;
        this.fieldSize = fieldSize;

        this.position = [
            {x: Math.floor(this.fieldSize / 2), y: Math.floor(this.fieldSize / 2)},
            {x: Math.floor(this.fieldSize / 2), y: Math.floor(this.fieldSize / 2) + 1}
        ];
        this.color = "#5d9700";
    }

    _delIf(snakePosition) {
        if (biteStatus !== 1) {
            snakePosition.pop()
        } else {
            biteStatus = 0
        }
    }

    _snakeMove() {
        let snakeHead = this.position[0];
        this.canvas.clearRect(0, 0, canvas.width, canvas.height);
        if (dir === "left") {
            this.position.unshift({
                x: (snakeHead["x"] - 1 + this.fieldSize) % this.fieldSize,
                y: snakeHead["y"]
            });
            this._delIf(this.position);
        } else if (dir === "up") {
            this.position.unshift({
                x: snakeHead["x"],
                y: (snakeHead["y"] - 1 + this.fieldSize) % this.fieldSize
            });
            this._delIf(this.position);
        } else if (dir === "right") {
            this.position.unshift({
                x: (snakeHead["x"] + 1) % this.fieldSize,
                y: snakeHead["y"]
            });
            this._delIf(this.position);
        } else if (dir === "down") {
            this.position.unshift({
                x: snakeHead["x"],
                y: (snakeHead["y"] + 1) % this.fieldSize
            });
            this._delIf(this.position);
        }
        count = 0;
    }

    _biteSelf() {
        let snakeHead = this.position[0];
        for (let i = 1; i < this.position.length; i++) {
            if (JSON.stringify(this.position[i]) === JSON.stringify(snakeHead)) {
                endGame = true;
                restartBtn.classList.add("visible")
                if (score > bestScore) {
                    bestScore = score;
                    bestScoreNode.textContent = bestScore;
                    localStorage.setItem("bestScore", JSON.stringify(bestScore));
                }
            }
        }
    }

    draw() {
        this._snakeMove();
        this._biteSelf();
        
        this.canvas.fillStyle = this.color;
        let snakeBox = this.box - 2; //уменьшить размер на 1 с каждой стороны, для красивой рамки
        this.position.forEach( ( el ) => {
            let x = el["x"] * this.box + 1; // +1 для рамки
            let y = el["y"] * this.box + 1;
            this.canvas.fillRect(x, y, snakeBox, snakeBox);
        })
    }
}

class Food {
    constructor(canvas, box, fieldSize, snakePosition) {
        this.position = {x: 9, y: 7};
        this.canvas = canvas;
        this.box = box;
        this.fieldSize = fieldSize;
        this.snakePosition = snakePosition;

        this.color = "#d2374a";
    }

    _randomPosition() {
        if (biteStatus == true) {
            this.position = {
                x: Math.floor(Math.random() * this.fieldSize),
                y: Math.floor(Math.random() * this.fieldSize),
            }
            this._verifyPosition()
        }
    }

    _verifyPosition() {
        this.snakePosition.forEach( (el) => {
            if (JSON.stringify(this.position) === JSON.stringify(el)) {
                this._randomPosition()
            }
            else { return }
        })
        return true
    }

    _isBite() {
        let snakeHead = this.snakePosition[0];
        if (JSON.stringify(this.position) === JSON.stringify(snakeHead)) {
            score++
            if (interval > 150) { interval -= 10 }
            scoreNode.textContent = score;
            this.canvas.clearRect(this.position["x"], this.position["y"], this.fieldSize, this.fieldSize);
            biteStatus = 1;
        }
    }

    draw() {
        this._isBite();
        this._randomPosition();
        this.canvas.fillStyle = this.color;
        let foodBox = this.box - 2;
        if (this._verifyPosition() === true) {
            let x = this.position["x"] * this.box + 1;
            let y = this.position["y"] * this.box + 1;
            this.canvas.fillRect(x, y, foodBox, foodBox);
        }
    }
}

let field = new Field();
let snake = new Snake(field.context, field.box, field.size);
let food = new Food(field.context, field.box, field.size, snake.position);

class Game {
    constructor() {
    }

    draw() {
        snake.draw();
        food.draw();
        if (endGame !== true) { 
            gameLoop = setTimeout(game.draw, interval) 
        }
    }
}

let game = new Game();
let endGame = false;

let interval = 500; // начальный интервал отрисовки
let gameLoop = setTimeout(game.draw, interval);