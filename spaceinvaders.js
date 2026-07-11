// Space Invaders Game
class SpaceInvadersGame {
    constructor(container) {
        this.container = container;
        this.width = 500;
        this.height = 400;
        this.player = { x: 225, y: 360, width: 50, height: 20, speed: 8 };
        this.bullets = [];
        this.enemyBullets = [];
        this.enemies = [];
        this.enemyDirection = 1;
        this.enemySpeed = 1;
        this.score = 0;
        this.lives = 3;
        this.gameOver = false;
        this.keys = {};

        this.init();
    }

    init() {
        // Calculate responsive canvas size
        const maxWidth = Math.min(500, window.innerWidth - 40);
        this.width = maxWidth;
        this.height = Math.min(400, window.innerHeight - 300);

        this.container.innerHTML = `
            <div class="space-invaders-game">
                <h2>👾 Space Invaders</h2>
                <div class="game-info">
                    <span>Score: <strong id="space-score">0</strong></span>
                    <span>Lives: <strong id="space-lives">❤️❤️❤️</strong></span>
                </div>
                <div class="canvas-wrapper">
                    <canvas id="space-canvas" class="game-canvas" width="${this.width}" height="${this.height}"></canvas>
                </div>
                <div class="mobile-controls">
                    <button class="touch-btn large" id="space-left">◀</button>
                    <button class="touch-btn large" id="space-shoot" style="background: linear-gradient(145deg, rgba(239, 68, 68, 0.8), rgba(220, 38, 38, 0.8));">🔫</button>
                    <button class="touch-btn large" id="space-right">▶</button>
                </div>
                <p class="game-instructions">Arrows to move, Space/Tap to shoot</p>
                <button class="reset-btn" id="space-reset">New Game</button>
            </div>
        `;

        this.canvas = document.getElementById('space-canvas');
        this.ctx = this.canvas.getContext('2d');

        // Adjust player position for canvas size
        this.player.x = this.width / 2 - this.player.width / 2;
        this.player.y = this.height - 40;

        this.spawnEnemies();
        this.bindEvents();
        this.gameLoop();
    }

    reset() {
        this.player = { x: this.width / 2 - 25, y: this.height - 40, width: 50, height: 20, speed: 8 };
        this.bullets = [];
        this.enemyBullets = [];
        this.enemies = [];
        this.enemyDirection = 1;
        this.score = 0;
        this.lives = 3;
        this.gameOver = false;
        this.spawnEnemies();
        this.updateUI();
    }

    spawnEnemies() {
        const rows = 4;
        const cols = Math.floor(this.width / 60);
        const types = ['👾', '👽', '🛸', '👻'];
        const points = [40, 30, 20, 10];

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                this.enemies.push({
                    x: col * 55 + 40,
                    y: row * 40 + 40,
                    width: 35,
                    height: 35,
                    type: types[row],
                    points: points[row]
                });
            }
        }
    }

    updateUI() {
        document.getElementById('space-score').textContent = this.score;
        document.getElementById('space-lives').textContent = '❤️'.repeat(this.lives);
    }

    update() {
        if (this.gameOver) return;

        // Player movement
        if (this.keys['ArrowLeft'] && this.player.x > 0) {
            this.player.x -= this.player.speed;
        }
        if (this.keys['ArrowRight'] && this.player.x + this.player.width < this.width) {
            this.player.x += this.player.speed;
        }

        // Update bullets
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            this.bullets[i].y -= 8;
            if (this.bullets[i].y < 0) {
                this.bullets.splice(i, 1);
            }
        }

        // Update enemy bullets
        for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
            this.enemyBullets[i].y += 5;

            // Check player collision
            if (this.checkCollision(this.enemyBullets[i], {
                x: this.player.x,
                y: this.player.y,
                width: this.player.width,
                height: this.player.height
            })) {
                this.enemyBullets.splice(i, 1);
                this.lives--;
                this.updateUI();
                if (this.lives <= 0) {
                    this.gameOver = true;
                }
                continue;
            }

            if (this.enemyBullets[i] && this.enemyBullets[i].y > this.height) {
                this.enemyBullets.splice(i, 1);
            }
        }

        // Update enemies
        let shouldDrop = false;
        for (const enemy of this.enemies) {
            enemy.x += this.enemySpeed * this.enemyDirection;
            if (enemy.x <= 0 || enemy.x + enemy.width >= this.width) {
                shouldDrop = true;
            }
        }

        if (shouldDrop) {
            this.enemyDirection *= -1;
            for (const enemy of this.enemies) {
                enemy.y += 20;
                if (enemy.y + enemy.height >= this.player.y) {
                    this.gameOver = true;
                }
            }
        }

        // Enemy shooting
        if (Math.random() < 0.02 && this.enemies.length > 0) {
            const shooter = this.enemies[Math.floor(Math.random() * this.enemies.length)];
            this.enemyBullets.push({
                x: shooter.x + shooter.width / 2,
                y: shooter.y + shooter.height,
                width: 4,
                height: 10
            });
        }

        // Bullet-enemy collision
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            for (let j = this.enemies.length - 1; j >= 0; j--) {
                if (this.checkCollision(this.bullets[i], this.enemies[j])) {
                    this.score += this.enemies[j].points;
                    this.bullets.splice(i, 1);
                    this.enemies.splice(j, 1);
                    this.updateUI();
                    break;
                }
            }
        }

        // Win condition
        if (this.enemies.length === 0) {
            this.spawnEnemies();
            this.enemySpeed += 0.5;
        }
    }

    checkCollision(a, b) {
        return a.x < b.x + b.width &&
            a.x + (a.width || 4) > b.x &&
            a.y < b.y + b.height &&
            a.y + (a.height || 8) > b.y;
    }

    draw() {
        // Background
        this.ctx.fillStyle = '#0a0a0a';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Stars
        this.ctx.fillStyle = 'white';
        for (let i = 0; i < 50; i++) {
            const x = (i * 73) % this.width;
            const y = (i * 47) % this.height;
            this.ctx.fillRect(x, y, 2, 2);
        }

        // Player (spaceship)
        this.ctx.fillStyle = '#00ff00';
        this.ctx.beginPath();
        this.ctx.moveTo(this.player.x + this.player.width / 2, this.player.y);
        this.ctx.lineTo(this.player.x, this.player.y + this.player.height);
        this.ctx.lineTo(this.player.x + this.player.width, this.player.y + this.player.height);
        this.ctx.closePath();
        this.ctx.fill();

        // Bullets
        this.ctx.fillStyle = '#00ff00';
        for (const bullet of this.bullets) {
            this.ctx.fillRect(bullet.x - 2, bullet.y, 4, 10);
        }

        // Enemy bullets
        this.ctx.fillStyle = '#ff0000';
        for (const bullet of this.enemyBullets) {
            this.ctx.fillRect(bullet.x - 2, bullet.y, 4, 10);
        }

        // Enemies
        this.ctx.font = '30px Arial';
        this.ctx.textAlign = 'center';
        for (const enemy of this.enemies) {
            this.ctx.fillText(enemy.type, enemy.x + enemy.width / 2, enemy.y + enemy.height - 5);
        }

        // Game over
        if (this.gameOver) {
            this.ctx.fillStyle = 'rgba(0,0,0,0.7)';
            this.ctx.fillRect(0, 0, this.width, this.height);
            this.ctx.fillStyle = 'white';
            this.ctx.font = 'bold 32px Outfit';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('GAME OVER', this.width / 2, this.height / 2);
            this.ctx.font = '20px Outfit';
            this.ctx.fillText(`Final Score: ${this.score}`, this.width / 2, this.height / 2 + 40);
        }
    }

    shoot() {
        if (this.gameOver) return;
        this.bullets.push({
            x: this.player.x + this.player.width / 2,
            y: this.player.y
        });
    }

    bindEvents() {
        this.keyDownHandler = (e) => {
            this.keys[e.key] = true;
            if (e.code === 'Space') {
                e.preventDefault();
                this.shoot();
            }
        };

        this.keyUpHandler = (e) => {
            this.keys[e.key] = false;
        };

        document.addEventListener('keydown', this.keyDownHandler);
        document.addEventListener('keyup', this.keyUpHandler);
        document.getElementById('space-reset').addEventListener('click', () => this.reset());

        // Touch controls
        const btnLeft = document.getElementById('space-left');
        const btnRight = document.getElementById('space-right');
        const btnShoot = document.getElementById('space-shoot');

        btnLeft.addEventListener('touchstart', (e) => { e.preventDefault(); this.keys['ArrowLeft'] = true; });
        btnLeft.addEventListener('touchend', (e) => { e.preventDefault(); this.keys['ArrowLeft'] = false; });
        btnRight.addEventListener('touchstart', (e) => { e.preventDefault(); this.keys['ArrowRight'] = true; });
        btnRight.addEventListener('touchend', (e) => { e.preventDefault(); this.keys['ArrowRight'] = false; });
        btnShoot.addEventListener('touchstart', (e) => { e.preventDefault(); this.shoot(); });

        // Mouse for desktop testing
        btnLeft.addEventListener('mousedown', () => { this.keys['ArrowLeft'] = true; });
        btnLeft.addEventListener('mouseup', () => { this.keys['ArrowLeft'] = false; });
        btnLeft.addEventListener('mouseleave', () => { this.keys['ArrowLeft'] = false; });
        btnRight.addEventListener('mousedown', () => { this.keys['ArrowRight'] = true; });
        btnRight.addEventListener('mouseup', () => { this.keys['ArrowRight'] = false; });
        btnRight.addEventListener('mouseleave', () => { this.keys['ArrowRight'] = false; });
        btnShoot.addEventListener('click', () => this.shoot());

        // Tap on canvas to shoot
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.shoot();
        });
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
        document.removeEventListener('keydown', this.keyDownHandler);
        document.removeEventListener('keyup', this.keyUpHandler);
    }
}
