class BreakoutGame {
    constructor(container) {
        this.container = container;
        this.canvas = null;
        this.ctx = null;
        this.paddle = { x: 200, y: 450, width: 100, height: 15 };
        this.ball = { x: 225, y: 300, dx: 4, dy: -4, radius: 8 };
        this.bricks = [];
        this.score = 0;
        this.gameLoop = null;
        this.keys = {};
        this.canvasWidth = 450;
        this.canvasHeight = 500;
        this.initializeBricks();
        this.render();
    }

    initializeBricks() {
        const rows = 5;
        const cols = 8;
        const brickWidth = 50;
        const brickHeight = 20;
        const padding = 5;
        const offsetTop = 50;
        const offsetLeft = 25;

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                this.bricks.push({
                    x: c * (brickWidth + padding) + offsetLeft,
                    y: r * (brickHeight + padding) + offsetTop,
                    width: brickWidth,
                    height: brickHeight,
                    visible: true
                });
            }
        }
    }

    render() {
        // Calculate responsive canvas size
        const maxWidth = Math.min(450, window.innerWidth - 40);
        this.canvasWidth = maxWidth;
        this.canvasHeight = Math.min(500, window.innerHeight - 250);

        this.container.innerHTML = `
            <div class="breakout-game">
                <h2>Breakout</h2>
                <div class="status">Score: <span id="score">0</span></div>
                <div class="canvas-wrapper">
                    <canvas class="breakout-canvas" id="breakoutCanvas" width="${this.canvasWidth}" height="${this.canvasHeight}"></canvas>
                </div>
                <div class="mobile-controls">
                    <button class="touch-btn large" id="btn-left">◀</button>
                    <button class="touch-btn large" id="btn-right">▶</button>
                </div>
                <div class="car-instructions">
                    <p>Use A/D, arrows, or touch buttons to move paddle</p>
                    <button class="reset-btn" id="reset">Restart</button>
                </div>
            </div>
        `;

        this.canvas = document.getElementById('breakoutCanvas');
        this.ctx = this.canvas.getContext('2d');

        // Adjust paddle position for canvas size
        this.paddle.x = this.canvasWidth / 2 - this.paddle.width / 2;
        this.paddle.y = this.canvasHeight - 50;
        this.ball.x = this.canvasWidth / 2;
        this.ball.y = this.canvasHeight - 200;

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

        // Touch drag on canvas
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            const x = touch.clientX - rect.left;
            this.paddle.x = Math.max(0, Math.min(x - this.paddle.width / 2, this.canvas.width - this.paddle.width));
        });
    }

    update() {
        // Move paddle
        if ((this.keys['a'] || this.keys['A'] || this.keys['ArrowLeft']) && this.paddle.x > 0) {
            this.paddle.x -= 7;
        }
        if ((this.keys['d'] || this.keys['D'] || this.keys['ArrowRight']) && this.paddle.x < this.canvas.width - this.paddle.width) {
            this.paddle.x += 7;
        }

        // Move ball
        this.ball.x += this.ball.dx;
        this.ball.y += this.ball.dy;

        // Ball collision with walls
        if (this.ball.x - this.ball.radius <= 0 || this.ball.x + this.ball.radius >= this.canvas.width) {
            this.ball.dx = -this.ball.dx;
        }
        if (this.ball.y - this.ball.radius <= 0) {
            this.ball.dy = -this.ball.dy;
        }

        // Ball collision with paddle
        if (this.ball.y + this.ball.radius >= this.paddle.y &&
            this.ball.x >= this.paddle.x &&
            this.ball.x <= this.paddle.x + this.paddle.width) {
            this.ball.dy = -Math.abs(this.ball.dy);
        }

        // Ball collision with bricks
        this.bricks.forEach(brick => {
            if (brick.visible &&
                this.ball.x + this.ball.radius >= brick.x &&
                this.ball.x - this.ball.radius <= brick.x + brick.width &&
                this.ball.y + this.ball.radius >= brick.y &&
                this.ball.y - this.ball.radius <= brick.y + brick.height) {
                brick.visible = false;
                this.ball.dy = -this.ball.dy;
                this.score += 10;
                document.getElementById('score').textContent = this.score;
            }
        });

        // Check win condition
        if (this.bricks.every(brick => !brick.visible)) {
            this.gameWon();
            return;
        }

        // Ball out of bounds
        if (this.ball.y > this.canvas.height) {
            this.gameOver();
            return;
        }

        this.draw();
    }

    draw() {
        // Draw background
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw bricks
        this.bricks.forEach(brick => {
            if (brick.visible) {
                this.ctx.fillStyle = '#ef4444';
                this.ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
                this.ctx.strokeStyle = '#fff';
                this.ctx.strokeRect(brick.x, brick.y, brick.width, brick.height);
            }
        });

        // Draw paddle
        this.ctx.fillStyle = '#3b82f6';
        this.ctx.fillRect(this.paddle.x, this.paddle.y, this.paddle.width, this.paddle.height);

        // Draw ball
        this.ctx.fillStyle = '#fff';
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        this.ctx.fill();
    }

    gameOver() {
        clearInterval(this.gameLoop);
        alert(`Game Over! Your score: ${this.score}`);
        this.reset();
    }

    gameWon() {
        clearInterval(this.gameLoop);
        alert(`Congratulations! You won! Final score: ${this.score}`);
        this.reset();
    }

    reset() {
        clearInterval(this.gameLoop);
        this.paddle = { x: this.canvasWidth / 2 - 50, y: this.canvasHeight - 50, width: 100, height: 15 };
        this.ball = { x: this.canvasWidth / 2, y: this.canvasHeight - 200, dx: 4, dy: -4, radius: 8 };
        this.bricks = [];
        this.score = 0;
        this.initializeBricks();
        document.getElementById('score').textContent = '0';
        this.gameLoop = setInterval(() => this.update(), 16);
        this.draw();
    }

    stop() {
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
        }
        if (this.keyDownHandler) {
            document.removeEventListener('keydown', this.keyDownHandler);
        }
        if (this.keyUpHandler) {
            document.removeEventListener('keyup', this.keyUpHandler);
        }
    }
}
