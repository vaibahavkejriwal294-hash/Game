// Color Match Game
class ColorMatchGame {
    constructor(container) {
        this.container = container;
        this.score = 0;
        this.timeLeft = 30;
        this.timer = null;
        this.gameActive = false;
        this.currentColor = '';
        this.currentText = '';
        this.highScore = parseInt(localStorage.getItem('colorMatchHigh')) || 0;
        this.colors = ['Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Orange'];
        this.colorMap = {
            'Red': '#ef4444', 'Blue': '#3b82f6', 'Green': '#10b981',
            'Yellow': '#eab308', 'Purple': '#8b5cf6', 'Orange': '#f97316'
        };
        this.init();
    }

    init() {
        this.container.innerHTML = `
            <div class="colormatch-game">
                <h2>🎨 Color Match</h2>
                <div class="game-info">
                    <span>Score: <strong id="cm-score">0</strong></span>
                    <span>Time: <strong id="cm-time">30</strong>s</span>
                    <span>Best: <strong id="cm-best">${this.highScore}</strong></span>
                </div>
                <p class="game-instructions">Does the text COLOR match the WORD meaning?</p>
                <div class="color-display" id="cm-display" style="font-size:3em;font-weight:800;margin:30px 0;min-height:60px;"></div>
                <div class="color-buttons" id="cm-buttons">
                    <button class="cm-btn yes-btn" id="cm-yes">✅  YES</button>
                    <button class="cm-btn no-btn" id="cm-no">❌  NO</button>
                </div>
                <button class="reset-btn" id="cm-start">Start Game</button>
            </div>
        `;
        document.getElementById('cm-start').addEventListener('click', () => this.startGame());
        document.getElementById('cm-yes').addEventListener('click', () => this.answer(true));
        document.getElementById('cm-no').addEventListener('click', () => this.answer(false));
    }

    startGame() {
        this.score = 0;
        this.timeLeft = 30;
        this.gameActive = true;
        document.getElementById('cm-score').textContent = '0';
        document.getElementById('cm-time').textContent = '30';
        document.getElementById('cm-start').textContent = 'Playing...';
        document.getElementById('cm-start').disabled = true;
        this.nextRound();
        this.timer = setInterval(() => {
            this.timeLeft--;
            document.getElementById('cm-time').textContent = this.timeLeft;
            if (this.timeLeft <= 0) this.endGame();
        }, 1000);
    }

    nextRound() {
        if (!this.gameActive) return;
        // Pick a random text word and display color
        this.currentText = this.colors[Math.floor(Math.random() * this.colors.length)];
        this.currentColor = this.colors[Math.floor(Math.random() * this.colors.length)];

        const display = document.getElementById('cm-display');
        display.textContent = this.currentText;
        display.style.color = this.colorMap[this.currentColor];
        display.style.animation = 'none';
        display.offsetHeight; // trigger reflow
        display.style.animation = 'cardAppear 0.3s ease-out';
    }

    answer(isYes) {
        if (!this.gameActive) return;
        const isMatch = this.currentText === this.currentColor;
        if (isYes === isMatch) {
            this.score += 10;
            const display = document.getElementById('cm-display');
            display.style.textShadow = '0 0 30px rgba(16,185,129,0.8)';
            setTimeout(() => { display.style.textShadow = ''; }, 200);
        } else {
            this.score = Math.max(0, this.score - 5);
            const display = document.getElementById('cm-display');
            display.style.textShadow = '0 0 30px rgba(239,68,68,0.8)';
            setTimeout(() => { display.style.textShadow = ''; }, 200);
        }
        document.getElementById('cm-score').textContent = this.score;
        this.nextRound();
    }

    endGame() {
        this.gameActive = false;
        clearInterval(this.timer);
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('colorMatchHigh', this.highScore);
            document.getElementById('cm-best').textContent = this.highScore;
        }
        document.getElementById('cm-display').textContent = `Game Over! Score: ${this.score}`;
        document.getElementById('cm-display').style.color = '#fff';
        document.getElementById('cm-start').textContent = 'Play Again';
        document.getElementById('cm-start').disabled = false;
    }

    stop() {
        this.gameActive = false;
        if (this.timer) clearInterval(this.timer);
    }
}
