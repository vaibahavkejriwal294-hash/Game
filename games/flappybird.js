// Flappy Bird Game
class FlappyBirdGame {
    constructor(container) {
        this.container = container;
        this.width = 400;
        this.height = 500;
        this.bird = { x: 80, y: 250, velocity: 0, size: 30 };
        this.gravity = 0.5;
        this.jumpStrength = -8;
        this.pipes = [];
        this.pipeWidth = 60;
        this.pipeGap = 150;
        this.pipeSpeed = 3;
        this.score = 0;
        this.bestScore = parseInt(localStorage.getItem('flappyBest')) || 0;
        this.gameOver = false;
        this.gameStarted = false;

        this.init();
    }

    init() {
        // Calculate responsive canvas size
        const maxWidth = Math.min(400, window.innerWidth - 40);
        const maxHeight = Math.min(500, window.innerHeight - 250);
        this.width = maxWidth;
        this.height = maxHeight;

        this.container.innerHTML = `
            <div class="flappy-game">
                <h2>🐦 Flappy Bird</h2>
                <div class="game-info">
                    <span>Score: <strong id="flappy-score">0</strong></span>
                    <span>Best: <strong id="flappy-best">${this.bestScore}</strong></span>
                </div>
                <div class="canvas-wrapper">
                    <canvas id="flappy-canvas" class="game-canvas" width="${this.width}" height="${this.height}"></canvas>
                </div>
                <p class="game-instructions">Tap or Space to flap!</p>
                <button class="reset-btn" id="flappy-reset">New Game</button>
            </div>
        `;

        this.canvas = document.getElementById('flappy-canvas');
        this.ctx = this.canvas.getContext('2d');

        this.bird.y = this.height / 2;

        this.bindEvents();
        this.gameLoop();
    }

    reset() {
        this.bird = { x: 80, y: this.height / 2, velocity: 0, size: 30 };
        this.pipes = [];
        this.score = 0;
        this.gameOver = false;
        this.gameStarted = false;
        document.getElementById('flappy-score').textContent = '0';
    }

    jump() {
        if (this.gameOver) {
            this.reset();
            return;
        }

        if (!this.gameStarted) {
            this.gameStarted = true;
        }

        this.bird.velocity = this.jumpStrength;
    }

    update() {
        if (!this.gameStarted || this.gameOver) return;

        // Bird physics
        this.bird.velocity += this.gravity;
        this.bird.y += this.bird.velocity;

        // Ground and ceiling collision
        if (this.bird.y + this.bird.size > this.height || this.bird.y < 0) {
            this.endGame();
            return;
        }

        // Pipe management
        if (this.pipes.length === 0 || this.pipes[this.pipes.length - 1].x < this.width - 200) {
            this.addPipe();
        }

        // Update pipes
        for (let i = this.pipes.length - 1; i >= 0; i--) {
            this.pipes[i].x -= this.pipeSpeed;

            // Check collision
            if (this.checkCollision(this.pipes[i])) {
                this.endGame();
                return;
            }

            // Score
            if (!this.pipes[i].scored && this.pipes[i].x + this.pipeWidth < this.bird.x) {
                this.pipes[i].scored = true;
                this.score++;
                document.getElementById('flappy-score').textContent = this.score;
            }

            // Remove off-screen pipes
            if (this.pipes[i].x + this.pipeWidth < 0) {
                this.pipes.splice(i, 1);
            }
        }
    }

    addPipe() {
        const gapY = Math.random() * (this.height - this.pipeGap - 100) + 50;
        this.pipes.push({
            x: this.width,
            gapY: gapY,
            scored: false
        });
    }

    checkCollision(pipe) {
        const birdRight = this.bird.x + this.bird.size;
        const birdBottom = this.bird.y + this.bird.size;
        const pipeRight = pipe.x + this.pipeWidth;

        if (birdRight > pipe.x && this.bird.x < pipeRight) {
            if (this.bird.y < pipe.gapY || birdBottom > pipe.gapY + this.pipeGap) {
                return true;
            }
        }
        return false;
    }

    endGame() {
        this.gameOver = true;
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            localStorage.setItem('flappyBest', this.bestScore);
            document.getElementById('flappy-best').textContent = this.bestScore;
        }
    }

    draw() {
        // Sky background
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#E0F6FF');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Ground
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(0, this.height - 20, this.width, 20);
        this.ctx.fillStyle = '#228B22';
        this.ctx.fillRect(0, this.height - 25, this.width, 5);

        // Pipes
        this.ctx.fillStyle = '#228B22';
        for (const pipe of this.pipes) {
            // Top pipe
            this.ctx.fillRect(pipe.x, 0, this.pipeWidth, pipe.gapY);
            this.ctx.fillStyle = '#32CD32';
            this.ctx.fillRect(pipe.x - 5, pipe.gapY - 20, this.pipeWidth + 10, 20);

            // Bottom pipe
            this.ctx.fillStyle = '#228B22';
            this.ctx.fillRect(pipe.x, pipe.gapY + this.pipeGap, this.pipeWidth, this.height - pipe.gapY - this.pipeGap);
            this.ctx.fillStyle = '#32CD32';
            this.ctx.fillRect(pipe.x - 5, pipe.gapY + this.pipeGap, this.pipeWidth + 10, 20);
            this.ctx.fillStyle = '#228B22';
        }

        // Bird
        this.ctx.save();
        this.ctx.translate(this.bird.x + this.bird.size / 2, this.bird.y + this.bird.size / 2);
        this.ctx.rotate(Math.min(Math.max(this.bird.velocity * 3, -30), 90) * Math.PI / 180);

        // Bird body
        this.ctx.fillStyle = '#FFD700';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, this.bird.size / 2, 0, Math.PI * 2);
        this.ctx.fill();

        // Wing
        this.ctx.fillStyle = '#FFA500';
        this.ctx.beginPath();
        this.ctx.ellipse(-5, 5, 8, 5, 0, 0, Math.PI * 2);
        this.ctx.fill();

        // Eye
        this.ctx.fillStyle = 'white';
        this.ctx.beginPath();
        this.ctx.arc(8, -5, 6, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.fillStyle = 'black';
        this.ctx.beginPath();
        this.ctx.arc(10, -5, 3, 0, Math.PI * 2);
        this.ctx.fill();

        // Beak
        this.ctx.fillStyle = '#FF6347';
        this.ctx.beginPath();
        this.ctx.moveTo(12, 0);
        this.ctx.lineTo(22, 3);
        this.ctx.lineTo(12, 6);
        this.ctx.closePath();
        this.ctx.fill();

        this.ctx.restore();

        // Start message
        if (!this.gameStarted) {
            this.ctx.fillStyle = 'rgba(0,0,0,0.5)';
            this.ctx.fillRect(0, 0, this.width, this.height);
            this.ctx.fillStyle = 'white';
            this.ctx.font = 'bold 24px Outfit';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Tap to Start!', this.width / 2, this.height / 2);
        }

        // Game over
        if (this.gameOver) {
            this.ctx.fillStyle = 'rgba(0,0,0,0.5)';
            this.ctx.fillRect(0, 0, this.width, this.height);
            this.ctx.fillStyle = 'white';
            this.ctx.font = 'bold 32px Outfit';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Game Over!', this.width / 2, this.height / 2 - 20);
            this.ctx.font = '20px Outfit';
            this.ctx.fillText(`Score: ${this.score}`, this.width / 2, this.height / 2 + 20);
            this.ctx.fillText('Tap to restart', this.width / 2, this.height / 2 + 50);
        }
    }

    bindEvents() {
        this.clickHandler = () => this.jump();
        this.keyHandler = (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.jump();
            }
        };
        this.touchHandler = (e) => {
            e.preventDefault();
            this.jump();
        };

        this.canvas.addEventListener('click', this.clickHandler);
        this.canvas.addEventListener('touchstart', this.touchHandler);
        document.addEventListener('keydown', this.keyHandler);
        document.getElementById('flappy-reset').addEventListener('click', () => this.reset());
    }

    gameLoop() {
        const update = () => {
            this.update();
            this.draw();
            this.animationId = requestAnimationFrame(update);
        };
        update();
    }

    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        if (this.clickHandler) {
            this.canvas.removeEventListener('click', this.clickHandler);
        }
        if (this.touchHandler) {
            this.canvas.removeEventListener('touchstart', this.touchHandler);
        }
        if (this.keyHandler) {
            document.removeEventListener('keydown', this.keyHandler);
        }
    }
}
