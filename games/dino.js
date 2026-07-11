// Dino Runner Game
class DinoGame {
    constructor(container) {
        this.container = container;
        this.width = 600;
        this.height = 200;
        this.dino = { x: 50, y: 150, width: 40, height: 50, velocity: 0, jumping: false };
        this.gravity = 0.8;
        this.jumpStrength = -15;
        this.obstacles = [];
        this.obstacleSpeed = 8;
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('dinoHigh')) || 0;
        this.gameOver = false;
        this.gameStarted = false;
        this.groundY = 160;

        this.init();
    }

    init() {
        // Calculate responsive canvas size
        const maxWidth = Math.min(600, window.innerWidth - 40);
        this.width = maxWidth;
        this.height = Math.min(200, window.innerHeight - 300);
        this.groundY = this.height - 40;
        this.dino.y = this.groundY;

        this.container.innerHTML = `
            <div class="dino-game">
                <h2>🦖 Dino Runner</h2>
                <div class="game-info">
                    <span>Score: <strong id="dino-score">0</strong></span>
                    <span>High: <strong id="dino-high">${this.highScore}</strong></span>
                </div>
                <div class="canvas-wrapper">
                    <canvas id="dino-canvas" class="game-canvas" width="${this.width}" height="${this.height}"></canvas>
                </div>
                <p class="game-instructions">Tap or Space to jump!</p>
                <button class="reset-btn" id="dino-reset">New Game</button>
            </div>
        `;

        this.canvas = document.getElementById('dino-canvas');
        this.ctx = this.canvas.getContext('2d');

        this.bindEvents();
        this.gameLoop();
    }

    reset() {
        this.dino = { x: 50, y: this.groundY, width: 40, height: 50, velocity: 0, jumping: false };
        this.obstacles = [];
        this.score = 0;
        this.gameOver = false;
        this.gameStarted = false;
        this.obstacleSpeed = 8;
        document.getElementById('dino-score').textContent = '0';
    }

    jump() {
        if (this.gameOver) {
            this.reset();
            return;
        }

        if (!this.gameStarted) {
            this.gameStarted = true;
        }

        if (!this.dino.jumping) {
            this.dino.velocity = this.jumpStrength;
            this.dino.jumping = true;
        }
    }

    update() {
        if (!this.gameStarted || this.gameOver) return;

        // Dino physics
        this.dino.velocity += this.gravity;
        this.dino.y += this.dino.velocity;

        if (this.dino.y >= this.groundY) {
            this.dino.y = this.groundY;
            this.dino.velocity = 0;
            this.dino.jumping = false;
        }

        // Spawn obstacles
        if (this.obstacles.length === 0 ||
            this.obstacles[this.obstacles.length - 1].x < this.width - 300 - Math.random() * 200) {
            const type = Math.random() > 0.7 ? 'bird' : 'cactus';
            this.obstacles.push({
                x: this.width,
                y: type === 'bird' ? this.groundY - 30 - Math.random() * 40 : this.groundY,
                width: type === 'cactus' ? 20 + Math.random() * 20 : 40,
                height: type === 'cactus' ? 40 + Math.random() * 20 : 30,
                type: type
            });
        }

        // Update obstacles
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            this.obstacles[i].x -= this.obstacleSpeed;

            // Collision detection
            if (this.checkCollision(this.dino, this.obstacles[i])) {
                this.gameOver = true;
                if (this.score > this.highScore) {
                    this.highScore = this.score;
                    localStorage.setItem('dinoHigh', this.highScore);
                    document.getElementById('dino-high').textContent = this.highScore;
                }
                return;
            }

            // Remove off-screen obstacles
            if (this.obstacles[i].x + this.obstacles[i].width < 0) {
                this.obstacles.splice(i, 1);
            }
        }

        // Score
        this.score++;
        document.getElementById('dino-score').textContent = Math.floor(this.score / 5);

        // Increase speed
        if (this.score % 500 === 0) {
            this.obstacleSpeed += 0.5;
        }
    }

    checkCollision(dino, obstacle) {
        const padding = 5;
        return dino.x + padding < obstacle.x + obstacle.width &&
            dino.x + dino.width - padding > obstacle.x &&
            dino.y + padding < obstacle.y + obstacle.height &&
            dino.y + dino.height - padding > obstacle.y;
    }

    draw() {
        // Sky
        this.ctx.fillStyle = '#f5f5f5';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Ground
        this.ctx.strokeStyle = '#535353';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.height - 30);
        this.ctx.lineTo(this.width, this.height - 30);
        this.ctx.stroke();

        // Ground details
        for (let i = 0; i < this.width; i += 20) {
            if (Math.random() > 0.8) {
                this.ctx.fillStyle = '#535353';
                this.ctx.fillRect(i, this.height - 28, 3, 3);
            }
        }

        // Draw dino as emoji
        this.ctx.font = '40px Arial';
        this.ctx.fillText('🦖', this.dino.x, this.dino.y + this.dino.height - 5);

        // Draw obstacles
        for (const obs of this.obstacles) {
            if (obs.type === 'cactus') {
                this.ctx.font = `${obs.height - 5}px Arial`;
                this.ctx.fillText('🌵', obs.x, obs.y + obs.height - 5);
            } else {
                this.ctx.font = '35px Arial';
                this.ctx.fillText('🦅', obs.x, obs.y + obs.height);
            }
        }

        // Start message
        if (!this.gameStarted) {
            this.ctx.fillStyle = 'rgba(0,0,0,0.5)';
            this.ctx.fillRect(0, 0, this.width, this.height);
            this.ctx.fillStyle = '#333';
            this.ctx.font = 'bold 24px Outfit';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Tap to Start!', this.width / 2, this.height / 2);
        }

        // Game over
        if (this.gameOver) {
            this.ctx.fillStyle = 'rgba(0,0,0,0.5)';
            this.ctx.fillRect(0, 0, this.width, this.height);
            this.ctx.fillStyle = 'white';
            this.ctx.font = 'bold 28px Outfit';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('GAME OVER', this.width / 2, this.height / 2 - 10);
            this.ctx.font = '18px Outfit';
            this.ctx.fillText(`Score: ${Math.floor(this.score / 5)}`, this.width / 2, this.height / 2 + 20);
            this.ctx.fillText('Tap to restart', this.width / 2, this.height / 2 + 45);
        }
    }

    bindEvents() {
        this.clickHandler = () => this.jump();
        this.keyHandler = (e) => {
            if (e.code === 'Space' || e.code === 'ArrowUp') {
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
        document.getElementById('dino-reset').addEventListener('click', () => this.reset());
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
