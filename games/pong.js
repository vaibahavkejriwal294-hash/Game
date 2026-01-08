class PongGame {
    constructor(container) {
        this.container = container;
        this.canvas = null;
        this.ctx = null;
        this.paddle = { x: 200, y: 450, width: 100, height: 15 };
        this.ball = { x: 225, y: 225, dx: 3, dy: 3, radius: 10 };
        this.score = 0;
        this.gameLoop = null;
        this.keys = {};
        this.render();
    }

    render() {
        // Calculate responsive canvas size
        const maxWidth = Math.min(450, window.innerWidth - 40);
        const canvasWidth = maxWidth;
        const canvasHeight = Math.min(500, window.innerHeight - 250);

        this.container.innerHTML = `
            <div class="pong-game">
                <h2>Pong</h2>
                <div class="status">Score: <span id="score">0</span></div>
                <div class="canvas-wrapper">
                    <canvas class="pong-canvas" id="pongCanvas" width="${canvasWidth}" height="${canvasHeight}"></canvas>
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

        this.canvas = document.getElementById('pongCanvas');
        this.ctx = this.canvas.getContext('2d');

        // Adjust positions for canvas size
        this.paddle.x = canvasWidth / 2 - this.paddle.width / 2;
        this.paddle.y = canvasHeight - 50;
        this.ball.x = canvasWidth / 2;
        this.ball.y = canvasHeight / 2;

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
            this.ball.dy = -this.ball.dy;
            this.score++;
            document.getElementById('score').textContent = this.score;
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

        // Draw center line
        this.ctx.strokeStyle = '#fff';
        this.ctx.setLineDash([10, 10]);
        this.ctx.beginPath();
        this.ctx.moveTo(this.canvas.width / 2, 0);
        this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
        this.ctx.stroke();
        this.ctx.setLineDash([]);

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

    reset() {
        clearInterval(this.gameLoop);
        this.paddle.x = this.canvas.width / 2 - this.paddle.width / 2;
        this.ball = { x: this.canvas.width / 2, y: this.canvas.height / 2, dx: 3, dy: 3, radius: 10 };
        this.score = 0;
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
