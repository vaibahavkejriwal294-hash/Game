// Bubble Pop Game
class BubblePopGame {
    constructor(container) {
        this.container = container;
        this.canvas = null;
        this.ctx = null;
        this.bubbles = [];
        this.score = 0;
        this.timeLeft = 30;
        this.timer = null;
        this.spawnTimer = null;
        this.gameActive = false;
        this.highScore = parseInt(localStorage.getItem('bubblePopHigh')) || 0;
        this.colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#f472b6', '#06b6d4'];
        this.init();
    }

    init() {
        const canvasSize = Math.min(400, window.innerWidth - 80);
        this.container.innerHTML = `
            <div class="bubble-game">
                <h2>🫧 Bubble Pop</h2>
                <div class="game-info">
                    <span>Score: <strong id="bubble-score">0</strong></span>
                    <span>Time: <strong id="bubble-time">30</strong>s</span>
                    <span>Best: <strong id="bubble-best">${this.highScore}</strong></span>
                </div>
                <canvas class="game-canvas" id="bubble-canvas" width="${canvasSize}" height="${canvasSize}"></canvas>
                <button class="reset-btn" id="bubble-start">Start Game</button>
            </div>
        `;
        this.canvas = document.getElementById('bubble-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.drawIdle();

        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            this.popBubble(touch.clientX - rect.left, touch.clientY - rect.top);
        });
        document.getElementById('bubble-start').addEventListener('click', () => this.startGame());
    }

    drawIdle() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = 'rgba(255,255,255,0.3)';
        this.ctx.font = '20px Outfit';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Click Start to Play!', this.canvas.width / 2, this.canvas.height / 2);
    }

    startGame() {
        this.score = 0;
        this.timeLeft = 30;
        this.bubbles = [];
        this.gameActive = true;
        document.getElementById('bubble-score').textContent = '0';
        document.getElementById('bubble-time').textContent = '30';
        document.getElementById('bubble-start').textContent = 'Playing...';
        document.getElementById('bubble-start').disabled = true;

        this.spawnTimer = setInterval(() => this.spawnBubble(), 400);
        this.timer = setInterval(() => {
            this.timeLeft--;
            document.getElementById('bubble-time').textContent = this.timeLeft;
            if (this.timeLeft <= 0) this.endGame();
        }, 1000);

        this.animate();
    }

    spawnBubble() {
        if (!this.gameActive) return;
        const radius = 15 + Math.random() * 25;
        this.bubbles.push({
            x: radius + Math.random() * (this.canvas.width - radius * 2),
            y: this.canvas.height + radius,
            radius: radius,
            speed: 1 + Math.random() * 2,
            color: this.colors[Math.floor(Math.random() * this.colors.length)],
            opacity: 1,
            popping: false,
            points: Math.round(50 / radius * 10)
        });
    }

    animate() {
        if (!this.gameActive) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.bubbles = this.bubbles.filter(b => {
            if (b.popping) {
                b.opacity -= 0.1;
                b.radius += 2;
                if (b.opacity <= 0) return false;
            } else {
                b.y -= b.speed;
                if (b.y + b.radius < 0) return false;
            }

            // Draw bubble
            this.ctx.beginPath();
            this.ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = b.color + Math.floor(b.opacity * 255).toString(16).padStart(2, '0');
            this.ctx.fill();

            // Shine effect
            this.ctx.beginPath();
            this.ctx.arc(b.x - b.radius * 0.3, b.y - b.radius * 0.3, b.radius * 0.2, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(255,255,255,${b.opacity * 0.6})`;
            this.ctx.fill();

            // Points text for popping bubbles
            if (b.popping) {
                this.ctx.font = 'bold 16px Outfit';
                this.ctx.fillStyle = `rgba(255,255,255,${b.opacity})`;
                this.ctx.textAlign = 'center';
                this.ctx.fillText(`+${b.points}`, b.x, b.y - b.radius - 5);
            }

            return true;
        });

        requestAnimationFrame(() => this.animate());
    }

    handleClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.popBubble(e.clientX - rect.left, e.clientY - rect.top);
    }

    popBubble(x, y) {
        if (!this.gameActive) return;
        // Find clicked bubble (check from top/front)
        for (let i = this.bubbles.length - 1; i >= 0; i--) {
            const b = this.bubbles[i];
            if (b.popping) continue;
            const dist = Math.sqrt((x - b.x) ** 2 + (y - b.y) ** 2);
            if (dist <= b.radius) {
                b.popping = true;
                this.score += b.points;
                document.getElementById('bubble-score').textContent = this.score;
                break;
            }
        }
    }

    endGame() {
        this.gameActive = false;
        clearInterval(this.timer);
        clearInterval(this.spawnTimer);
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('bubblePopHigh', this.highScore);
            document.getElementById('bubble-best').textContent = this.highScore;
        }
        document.getElementById('bubble-start').textContent = `Score: ${this.score} - Play Again`;
        document.getElementById('bubble-start').disabled = false;
    }

    stop() {
        this.gameActive = false;
        if (this.timer) clearInterval(this.timer);
        if (this.spawnTimer) clearInterval(this.spawnTimer);
    }
}
