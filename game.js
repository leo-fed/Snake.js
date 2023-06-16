let score = 0;
let bestScore = 0;


const scoreNode = document.getElementById("score");
const bestScoreNode = document.getElementById("best-score");
const restartBtn = document.getElementById("restart");

document.addEventListener("DOMContentLoaded", () => {
    bestScore = localStorage.getItem("bestScore");
    if (bestScore) { 
        bestScore = JSON.parse(bestScore);
        bestScoreNode.textContent = bestScore;
    }
});

restartBtn.addEventListener("click", restart)


let biteStatus = 0

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
        this.foodPosition = {};

        this.position = [
            {x: 9, y:9},
            {x: 9, y:10}
        ];
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
    }

    _biteSelf() {
        let snakeHead = this.position[0];
        for (let i = 1; i < this.position.length; i++) {
            if (JSON.stringify(this.position[i]) === JSON.stringify(snakeHead)) {
                clearInterval(gameLoop);
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
        this.canvas.fillStyle = "#5d9700";
        let snakeBox = this.box - 2; //уменьшить размер на 1 с каждой стороны, для красивой рамки
        this.position.forEach( ( el ) => {
            let x = el["x"] * this.box + 1; // +1, чтобы 
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
            scoreNode.textContent = score;
            this.canvas.clearRect(this.position["x"], this.position["y"], this.fieldSize, this.fieldSize);
            biteStatus = 1;
        }
    }

    draw() {
        this._isBite();
        this._randomPosition();
        this.canvas.fillStyle = "#d2374a";
        let foodBox = this.box - 2;
        if (this._verifyPosition() === true) {
            let x = this.position["x"] * this.box + 1; // +1, чтобы 
            let y = this.position["y"] * this.box + 1;
            this.canvas.fillRect(x, y, foodBox, foodBox);
        }
    }
}

document.addEventListener("keydown", direction);

let dir;

function direction(event) {
	if(event.keyCode == 37 && dir != "right") {
		dir = "left";
	}
	else if(event.keyCode == 38 && dir != "down") {
		dir = "up";
	}
    else if(event.keyCode == 39 && dir != "left") {
		dir = "right";
    }
	else if(event.keyCode == 40 && dir != "up") {
		dir = "down";
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
    }
}

let game = new Game();

let gameLoop = setInterval(game.draw, 200);

function restart() {
    location.reload()
}

