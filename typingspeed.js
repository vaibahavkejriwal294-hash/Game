// Typing Speed Game
class TypingSpeedGame {
    constructor(container) {
        this.container = container;
        this.words = [
            'the', 'be', 'to', 'of', 'and', 'in', 'that', 'have', 'it', 'for',
            'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this', 'but',
            'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or', 'an',
            'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what', 'so', 'up',
            'code', 'game', 'play', 'fast', 'type', 'word', 'time', 'best', 'good', 'work',
            'make', 'life', 'love', 'just', 'know', 'take', 'come', 'think', 'look', 'want',
            'java', 'html', 'loop', 'data', 'node', 'file', 'push', 'pull', 'sort', 'find',
            'grid', 'flex', 'page', 'link', 'form', 'view', 'edit', 'save', 'load', 'open'
        ];
        this.currentWords = [];
        this.typedIndex = 0;
        this.score = 0;
        this.timeLeft = 60;
        this.timer = null;
        this.gameActive = false;
        this.correctChars = 0;
        this.totalChars = 0;
        this.highWPM = parseInt(localStorage.getItem('typingHighWPM')) || 0;
        this.init();
    }

    init() {
        this.container.innerHTML = `
            <div class="typing-game">
                <h2>⌨️ Typing Speed</h2>
                <div class="game-info">
                    <span>WPM: <strong id="typing-wpm">0</strong></span>
                    <span>Time: <strong id="typing-time">60</strong>s</span>
                    <span>Accuracy: <strong id="typing-acc">100%</strong></span>
                    <span>Best: <strong id="typing-best">${this.highWPM} WPM</strong></span>
                </div>
                <div class="typing-words" id="typing-words"></div>
                <input type="text" id="typing-input" class="typing-input" placeholder="Type here to start..." autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false">
                <button class="reset-btn" id="typing-reset">Restart</button>
            </div>
        `;
        this.generateWords();
        this.renderWords();

        const input = document.getElementById('typing-input');
        input.addEventListener('input', (e) => this.handleInput(e));
        input.addEventListener('keydown', (e) => {
            if (e.key === ' ') {
                e.preventDefault();
                this.checkWord();
            }
        });
        document.getElementById('typing-reset').addEventListener('click', () => this.reset());
    }

    generateWords() {
        this.currentWords = [];
        for (let i = 0; i < 50; i++) {
            this.currentWords.push(this.words[Math.floor(Math.random() * this.words.length)]);
        }
    }

    renderWords() {
        const container = document.getElementById('typing-words');
        if (!container) return;
        container.innerHTML = '';
        this.currentWords.forEach((word, i) => {
            const span = document.createElement('span');
            span.className = 'typing-word';
            span.textContent = word;
            if (i < this.typedIndex) span.classList.add('completed');
            if (i === this.typedIndex) span.classList.add('current');
            container.appendChild(span);
        });
    }

    handleInput(e) {
        if (!this.gameActive && this.timeLeft === 60) {
            this.startGame();
        }
    }

    startGame() {
        this.gameActive = true;
        this.timer = setInterval(() => {
            this.timeLeft--;
            document.getElementById('typing-time').textContent = this.timeLeft;
            this.updateWPM();
            if (this.timeLeft <= 0) this.endGame();
        }, 1000);
    }

    checkWord() {
        if (!this.gameActive) return;
        const input = document.getElementById('typing-input');
        const typed = input.value.trim();
        const expected = this.currentWords[this.typedIndex];

        this.totalChars += expected.length;
        if (typed === expected) {
            this.correctChars += expected.length;
            this.score++;
        }

        this.typedIndex++;
        input.value = '';
        this.renderWords();
        this.updateWPM();

        // Update accuracy
        const acc = this.totalChars > 0 ? Math.round((this.correctChars / this.totalChars) * 100) : 100;
        document.getElementById('typing-acc').textContent = acc + '%';

        if (this.typedIndex >= this.currentWords.length) {
            this.generateWords();
            this.typedIndex = 0;
            this.renderWords();
        }
    }

    updateWPM() {
        const elapsed = 60 - this.timeLeft;
        if (elapsed > 0) {
            const wpm = Math.round((this.score / elapsed) * 60);
            document.getElementById('typing-wpm').textContent = wpm;
        }
    }

    endGame() {
        this.gameActive = false;
        clearInterval(this.timer);
        const wpm = Math.round(this.score);
        if (wpm > this.highWPM) {
            this.highWPM = wpm;
            localStorage.setItem('typingHighWPM', this.highWPM);
            document.getElementById('typing-best').textContent = this.highWPM + ' WPM';
        }
        document.getElementById('typing-input').disabled = true;
        document.getElementById('typing-input').placeholder = `Done! ${wpm} WPM`;
    }

    reset() {
        this.gameActive = false;
        if (this.timer) clearInterval(this.timer);
        this.typedIndex = 0;
        this.score = 0;
        this.timeLeft = 60;
        this.correctChars = 0;
        this.totalChars = 0;
        this.generateWords();
        this.renderWords();
        document.getElementById('typing-wpm').textContent = '0';
        document.getElementById('typing-time').textContent = '60';
        document.getElementById('typing-acc').textContent = '100%';
        const input = document.getElementById('typing-input');
        input.disabled = false;
        input.value = '';
        input.placeholder = 'Type here to start...';
        input.focus();
    }

    stop() {
        this.gameActive = false;
        if (this.timer) clearInterval(this.timer);
    }
}
