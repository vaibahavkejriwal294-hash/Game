class CarGame {
    constructor(container) {
        this.container = container;
        this.canvas = null;
        this.ctx = null;
        this.car = { x: 200, y: 350, width: 50, height: 80 };
        this.obstacles = [];
        this.score = 0;
        this.gameLoop = null;
        this.obstacleTimer = null;
        this.keys = {};
        this.render();
    }

    render() {
        // Calculate responsive canvas size
        const maxWidth = Math.min(450, window.innerWidth - 40);
        const canvasWidth = maxWidth;
        const canvasHeight = Math.min(500, window.innerHeight - 250);

        this.container.innerHTML = `
            <div class="car-game">
                <h2>Car Racing</h2>
                <div class="status">Score: <span id="score">0</span></div>
                <div class="canvas-wrapper">
                    <canvas class="car-canvas" id="carCanvas" width="${canvasWidth}" height="${canvasHeight}"></canvas>
                </div>
                <div class="mobile-controls">
                    <button class="touch-btn large" id="btn-left">◀</button>
                    <button class="touch-btn large" id="btn-right">▶</button>
                </div>
                <div class="car-instructions">
                    <p>Use A/D, arrows, or touch buttons to move</p>
                    <button class="reset-btn" id="reset">Restart</button>
                </div>
            </div>
        `;

        this.canvas = document.getElementById('carCanvas');
        this.ctx = this.canvas.getContext('2d');

        // Adjust car position for canvas size
        this.car.x = canvasWidth / 2 - this.car.width / 2;
        this.car.y = canvasHeight - 130;

        const resetButton = document.getElementById('reset');

        // Keyboard controls
        this.keyDownHandler = (e) => { this.keys[e.key] = true; };
        this.keyUpHandler = (e) => { this.keys[e.key] = false; };
        document.addEventListener('keydown', this.keyDownHandler);
        document.addEventListener('keyup', this.keyUpHandler);

        resetButton.addEventListener('click', () => this.reset());

        // Touch controls
        this.setupTouchControls();

        this.gameLoop = setInterval(() => this.update(), 16);
        this.obstacleTimer = setInterval(() => this.addObstacle(), 2000);
        this.draw();
    }

    setupTouchControls() {
        const btnLeft = document.getElementById('btn-left');
        const btnRight = document.getElementById('btn-right');

        // Touch start/end for continuous movement
        btnLeft.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.keys['ArrowLeft'] = true;
        });
        btnLeft.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.keys['ArrowLeft'] = false;
        });

        btnRight.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.keys['ArrowRight'] = true;
        });
        btnRight.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.keys['ArrowRight'] = false;
        });

        // Mouse for desktop testing
        btnLeft.addEventListener('mousedown', () => { this.keys['ArrowLeft'] = true; });
        btnLeft.addEventListener('mouseup', () => { this.keys['ArrowLeft'] = false; });
        btnLeft.addEventListener('mouseleave', () => { this.keys['ArrowLeft'] = false; });

        btnRight.addEventListener('mousedown', () => { this.keys['ArrowRight'] = true; });
        btnRight.addEventListener('mouseup', () => { this.keys['ArrowRight'] = false; });
        btnRight.addEventListener('mouseleave', () => { this.keys['ArrowRight'] = false; });
    }

    update() {
        // Move car
        if ((this.keys['a'] || this.keys['A'] || this.keys['ArrowLeft']) && this.car.x > 0) {
            this.car.x -= 5;
        }
        if ((this.keys['d'] || this.keys['D'] || this.keys['ArrowRight']) && this.car.x < this.canvas.width - this.car.width) {
            this.car.x += 5;
        }

        // Move obstacles
        this.obstacles.forEach((obstacle, index) => {
            obstacle.y += 3;
            if (obstacle.y > this.canvas.height) {
                this.obstacles.splice(index, 1);
                this.score++;
                document.getElementById('score').textContent = this.score;
            }
        });

        // Check collisions
        this.obstacles.forEach(obstacle => {
            if (this.checkCollision(this.car, obstacle)) {
                this.gameOver();
            }
        });

        this.draw();
    }

    addObstacle() {
        const laneWidth = this.canvas.width / 3;
        const lanes = [laneWidth / 2 - 25, laneWidth + laneWidth / 2 - 25, laneWidth * 2 + laneWidth / 2 - 25];
        this.obstacles.push({
            x: lanes[Math.floor(Math.random() * lanes.length)],
            y: -50,
            width: 50,
            height: 80
        });
    }

    checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.y + rect1.height > rect2.y;
    }

    draw() {
        // Draw road
        this.ctx.fillStyle = '#2a2a2a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw road lines
        this.ctx.strokeStyle = '#ffff00';
        this.ctx.lineWidth = 3;
        this.ctx.setLineDash([20, 20]);
        for (let i = 0; i < this.canvas.width; i += 150) {
            this.ctx.beginPath();
            this.ctx.moveTo(i, 0);
            this.ctx.lineTo(i, this.canvas.height);
            this.ctx.stroke();
        }
        this.ctx.setLineDash([]);

        // Draw car
        this.ctx.fillStyle = '#3b82f6';
        this.ctx.fillRect(this.car.x, this.car.y, this.car.width, this.car.height);
        this.ctx.fillStyle = '#1e40af';
        this.ctx.fillRect(this.car.x + 5, this.car.y + 10, this.car.width - 10, 20);
        this.ctx.fillRect(this.car.x + 5, this.car.y + 50, this.car.width - 10, 20);

        // Draw obstacles
        this.ctx.fillStyle = '#ef4444';
        this.obstacles.forEach(obstacle => {
            this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        });
    }

    gameOver() {
        clearInterval(this.gameLoop);
        clearInterval(this.obstacleTimer);
        alert(`Game Over! Your score: ${this.score}`);
        this.reset();
    }

    reset() {
        clearInterval(this.gameLoop);
        clearInterval(this.obstacleTimer);
        this.car = { x: this.canvas.width / 2 - 25, y: this.canvas.height - 130, width: 50, height: 80 };
        this.obstacles = [];
        this.score = 0;
        document.getElementById('score').textContent = '0';
        this.gameLoop = setInterval(() => this.update(), 16);
        this.obstacleTimer = setInterval(() => this.addObstacle(), 2000);
        this.draw();
    }

    stop() {
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
        }
        if (this.obstacleTimer) {
            clearInterval(this.obstacleTimer);
        }
        if (this.keyDownHandler) {
            document.removeEventListener('keydown', this.keyDownHandler);
        }
        if (this.keyUpHandler) {
            document.removeEventListener('keyup', this.keyUpHandler);
        }
    }
}
