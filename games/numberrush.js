// Number Rush Game
class NumberRushGame {
    constructor(container) {
        this.container = container;
        this.score = 0;
        this.timeLeft = 60;
        this.timer = null;
        this.gameActive = false;
        this.currentProblem = null;
        this.streak = 0;
        this.highScore = parseInt(localStorage.getItem('numberRushHigh')) || 0;
        this.difficulty = 1;
        this.init();
    }

    init() {
        this.container.innerHTML = `
            <div class="numberrush-game">
                <h2>🔢 Number Rush</h2>
                <div class="game-info">
                    <span>Score: <strong id="nr-score">0</strong></span>
                    <span>Time: <strong id="nr-time">60</strong>s</span>
                    <span>Streak: <strong id="nr-streak">0</strong>🔥</span>
                    <span>Best: <strong id="nr-best">${this.highScore}</strong></span>
                </div>
                <div class="nr-problem" id="nr-problem"></div>
                <div class="nr-input-area">
                    <input type="number" id="nr-input" class="nr-input" placeholder="?" autocomplete="off" inputmode="numeric">
                </div>
                <div class="nr-feedback" id="nr-feedback"></div>
                <button class="reset-btn" id="nr-start">Start Game</button>
                <p class="game-instructions">Solve math problems as fast as you can!</p>
            </div>
        `;
        document.getElementById('nr-start').addEventListener('click', () => this.startGame());
        document.getElementById('nr-input').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this.checkAnswer();
        });
    }

    startGame() {
        this.score = 0;
        this.timeLeft = 60;
        this.streak = 0;
        this.difficulty = 1;
        this.gameActive = true;
        document.getElementById('nr-score').textContent = '0';
        document.getElementById('nr-time').textContent = '60';
        document.getElementById('nr-streak').textContent = '0';
        document.getElementById('nr-start').textContent = 'Playing...';
        document.getElementById('nr-start').disabled = true;
        document.getElementById('nr-input').focus();
        this.generateProblem();

        this.timer = setInterval(() => {
            this.timeLeft--;
            document.getElementById('nr-time').textContent = this.timeLeft;
            if (this.timeLeft <= 0) this.endGame();
        }, 1000);
    }

    generateProblem() {
        const ops = ['+', '-', '×'];
        const op = ops[Math.floor(Math.random() * Math.min(ops.length, this.difficulty + 1))];
        let a, b, answer;
        const max = 10 + this.difficulty * 5;

        switch (op) {
            case '+':
                a = Math.floor(Math.random() * max) + 1;
                b = Math.floor(Math.random() * max) + 1;
                answer = a + b;
                break;
            case '-':
                a = Math.floor(Math.random() * max) + 1;
                b = Math.floor(Math.random() * a) + 1;
                answer = a - b;
                break;
            case '×':
                a = Math.floor(Math.random() * 12) + 1;
                b = Math.floor(Math.random() * 12) + 1;
                answer = a * b;
                break;
        }

        this.currentProblem = { text: `${a} ${op} ${b}`, answer };
        document.getElementById('nr-problem').textContent = this.currentProblem.text;
        document.getElementById('nr-input').value = '';
        document.getElementById('nr-input').focus();
    }

    checkAnswer() {
        if (!this.gameActive) return;
        const input = document.getElementById('nr-input');
        const answer = parseInt(input.value);
        const feedback = document.getElementById('nr-feedback');

        if (isNaN(answer)) return;

        if (answer === this.currentProblem.answer) {
            this.streak++;
            const bonus = this.streak >= 5 ? 3 : this.streak >= 3 ? 2 : 1;
            const points = 10 * bonus;
            this.score += points;
            feedback.textContent = `✅ Correct! +${points} ${bonus > 1 ? `(${bonus}x combo!)` : ''}`;
            feedback.style.color = '#10b981';
            if (this.streak % 5 === 0) this.difficulty = Math.min(5, this.difficulty + 1);
        } else {
            this.streak = 0;
            feedback.textContent = `❌ ${this.currentProblem.text} = ${this.currentProblem.answer}`;
            feedback.style.color = '#ef4444';
        }

        document.getElementById('nr-score').textContent = this.score;
        document.getElementById('nr-streak').textContent = this.streak;
        this.generateProblem();
    }

    endGame() {
        this.gameActive = false;
        clearInterval(this.timer);
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('numberRushHigh', this.highScore);
            document.getElementById('nr-best').textContent = this.highScore;
        }
        document.getElementById('nr-problem').textContent = `Game Over! Score: ${this.score}`;
        document.getElementById('nr-feedback').textContent = '';
        document.getElementById('nr-input').disabled = true;
        document.getElementById('nr-start').textContent = 'Play Again';
        document.getElementById('nr-start').disabled = false;
    }

    stop() {
        this.gameActive = false;
        if (this.timer) clearInterval(this.timer);
    }
}
