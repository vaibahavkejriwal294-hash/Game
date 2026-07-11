// Hangman Game
class HangmanGame {
    constructor(container) {
        this.container = container;
        this.words = [
            'JAVASCRIPT', 'PYTHON', 'DEVELOPER', 'COMPUTER', 'ALGORITHM',
            'FUNCTION', 'DATABASE', 'VARIABLE', 'KEYBOARD', 'INTERNET',
            'SOFTWARE', 'HARDWARE', 'NETWORK', 'BROWSER', 'PROGRAM',
            'CONSOLE', 'LIBRARY', 'OBJECT', 'STRING', 'BOOLEAN',
            'ELEMENT', 'DIGITAL', 'WEBSITE', 'SERVER', 'MOBILE'
        ];
        this.word = '';
        this.guessedLetters = new Set();
        this.wrongGuesses = 0;
        this.maxWrong = 6;
        this.gameOver = false;
        this.init();
    }

    init() {
        this.container.innerHTML = `
            <div class="hangman-game">
                <h2>💀 Hangman</h2>
                <div class="game-info">
                    <span>Wrong: <strong id="hangman-wrong">0/6</strong></span>
                </div>
                <div class="hangman-drawing" id="hangman-drawing"></div>
                <div class="hangman-word" id="hangman-word"></div>
                <div class="hangman-keyboard" id="hangman-keyboard"></div>
                <button class="reset-btn" id="hangman-reset">New Word</button>
            </div>
        `;
        this.reset();
        document.getElementById('hangman-reset').addEventListener('click', () => this.reset());
    }

    reset() {
        this.word = this.words[Math.floor(Math.random() * this.words.length)];
        this.guessedLetters = new Set();
        this.wrongGuesses = 0;
        this.gameOver = false;
        document.getElementById('hangman-wrong').textContent = '0/6';
        this.drawHangman();
        this.renderWord();
        this.renderKeyboard();
    }

    drawHangman() {
        const canvas = document.getElementById('hangman-drawing');
        canvas.innerHTML = '';
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 200 200');
        svg.setAttribute('width', '200');
        svg.setAttribute('height', '200');
        svg.style.display = 'block';
        svg.style.margin = '0 auto';

        const parts = [
            `<circle cx="130" cy="50" r="18" stroke="#f472b6" stroke-width="3" fill="none"/>`,
            `<line x1="130" y1="68" x2="130" y2="120" stroke="#f472b6" stroke-width="3"/>`,
            `<line x1="130" y1="85" x2="105" y2="105" stroke="#f472b6" stroke-width="3"/>`,
            `<line x1="130" y1="85" x2="155" y2="105" stroke="#f472b6" stroke-width="3"/>`,
            `<line x1="130" y1="120" x2="110" y2="155" stroke="#f472b6" stroke-width="3"/>`,
            `<line x1="130" y1="120" x2="150" y2="155" stroke="#f472b6" stroke-width="3"/>`
        ];

        // Base structure (always shown)
        let html = `
            <line x1="30" y1="180" x2="100" y2="180" stroke="rgba(255,255,255,0.3)" stroke-width="3"/>
            <line x1="65" y1="180" x2="65" y2="20" stroke="rgba(255,255,255,0.3)" stroke-width="3"/>
            <line x1="65" y1="20" x2="130" y2="20" stroke="rgba(255,255,255,0.3)" stroke-width="3"/>
            <line x1="130" y1="20" x2="130" y2="32" stroke="rgba(255,255,255,0.3)" stroke-width="3"/>
        `;

        for (let i = 0; i < this.wrongGuesses; i++) {
            html += parts[i];
        }

        svg.innerHTML = html;
        canvas.appendChild(svg);
    }

    renderWord() {
        const wordEl = document.getElementById('hangman-word');
        wordEl.innerHTML = '';
        for (const letter of this.word) {
            const span = document.createElement('span');
            span.className = 'hangman-letter';
            span.textContent = this.guessedLetters.has(letter) ? letter : '_';
            wordEl.appendChild(span);
        }
    }

    renderKeyboard() {
        const keyboard = document.getElementById('hangman-keyboard');
        keyboard.innerHTML = '';
        for (let i = 65; i <= 90; i++) {
            const letter = String.fromCharCode(i);
            const btn = document.createElement('button');
            btn.className = 'hangman-key';
            btn.textContent = letter;
            if (this.guessedLetters.has(letter)) {
                btn.disabled = true;
                btn.classList.add(this.word.includes(letter) ? 'correct' : 'wrong');
            }
            btn.addEventListener('click', () => this.guess(letter));
            keyboard.appendChild(btn);
        }
    }

    guess(letter) {
        if (this.gameOver || this.guessedLetters.has(letter)) return;
        this.guessedLetters.add(letter);

        if (!this.word.includes(letter)) {
            this.wrongGuesses++;
            document.getElementById('hangman-wrong').textContent = `${this.wrongGuesses}/${this.maxWrong}`;
            this.drawHangman();
        }

        this.renderWord();
        this.renderKeyboard();

        // Check win/lose
        const won = [...this.word].every(l => this.guessedLetters.has(l));
        if (won) {
            this.gameOver = true;
            document.getElementById('hangman-wrong').textContent = '🎉 You Won!';
        } else if (this.wrongGuesses >= this.maxWrong) {
            this.gameOver = true;
            document.getElementById('hangman-wrong').textContent = `💀 The word was: ${this.word}`;
            // Reveal word
            const wordEl = document.getElementById('hangman-word');
            wordEl.innerHTML = '';
            for (const letter of this.word) {
                const span = document.createElement('span');
                span.className = 'hangman-letter';
                span.textContent = letter;
                span.style.color = this.guessedLetters.has(letter) ? '#10b981' : '#ef4444';
                wordEl.appendChild(span);
            }
        }
    }

    stop() {}
}
