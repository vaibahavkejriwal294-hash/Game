// Word Guess Game (Wordle-like)
class WordleGame {
    constructor(container) {
        this.container = container;
        this.words = ['APPLE', 'BRAIN', 'CRANE', 'DREAM', 'EARTH', 'FLAME', 'GRAPE', 'HOUSE', 'IVORY', 'JOLLY', 'KARMA', 'LEMON', 'MAGIC', 'NOBLE', 'OCEAN', 'PIANO', 'QUEST', 'ROVER', 'STORM', 'TIGER', 'UNITY', 'VIVID', 'WITCH', 'XENON', 'YOUTH', 'ZEBRA', 'BLOCK', 'CHASE', 'DANCE', 'EAGLE'];
        this.targetWord = '';
        this.guesses = [];
        this.currentGuess = '';
        this.maxGuesses = 6;
        this.gameOver = false;
        this.won = false;
        this.keyStates = {};
        this.cellSize = 60;

        this.init();
    }

    init() {
        // Calculate responsive cell size
        const maxWidth = Math.min(350, window.innerWidth - 40);
        this.cellSize = Math.floor((maxWidth - 40) / 5);

        this.container.innerHTML = `
            <div class="wordle-game">
                <h2>📝 Word Guess</h2>
                <div id="wordle-grid" class="wordle-grid"></div>
                <div id="wordle-keyboard" class="keyboard"></div>
                <p class="game-instructions" id="wordle-message">Guess the 5-letter word!</p>
                <button class="reset-btn" id="wordle-reset">New Game</button>
            </div>
        `;

        this.reset();
        this.renderGrid();
        this.renderKeyboard();
        this.bindEvents();
    }

    reset() {
        this.targetWord = this.words[Math.floor(Math.random() * this.words.length)];
        this.guesses = [];
        this.currentGuess = '';
        this.gameOver = false;
        this.won = false;
        this.keyStates = {};
        document.getElementById('wordle-message').textContent = 'Guess the 5-letter word!';
        this.renderGrid();
        this.renderKeyboard();
    }

    renderGrid() {
        const grid = document.getElementById('wordle-grid');
        grid.innerHTML = '';
        grid.style.gridTemplateRows = `repeat(6, ${this.cellSize}px)`;

        for (let i = 0; i < this.maxGuesses; i++) {
            const row = document.createElement('div');
            row.className = 'wordle-row';
            row.style.gridTemplateColumns = `repeat(5, ${this.cellSize}px)`;

            for (let j = 0; j < 5; j++) {
                const cell = document.createElement('div');
                cell.className = 'wordle-cell';
                cell.style.width = this.cellSize + 'px';
                cell.style.height = this.cellSize + 'px';
                cell.style.fontSize = (this.cellSize * 0.5) + 'px';

                if (i < this.guesses.length) {
                    const letter = this.guesses[i][j];
                    cell.textContent = letter;
                    cell.classList.add(this.getLetterState(letter, j, this.guesses[i]));
                } else if (i === this.guesses.length && j < this.currentGuess.length) {
                    cell.textContent = this.currentGuess[j];
                }

                row.appendChild(cell);
            }

            grid.appendChild(row);
        }
    }

    getLetterState(letter, index, guess) {
        if (this.targetWord[index] === letter) {
            return 'correct';
        }

        // Count occurrences in target
        let targetCount = 0;
        let correctCount = 0;
        let beforeCount = 0;

        for (let i = 0; i < 5; i++) {
            if (this.targetWord[i] === letter) targetCount++;
            if (guess[i] === letter && this.targetWord[i] === letter) correctCount++;
            if (i < index && guess[i] === letter && this.targetWord[i] !== letter) beforeCount++;
        }

        if (this.targetWord.includes(letter) && beforeCount + correctCount < targetCount) {
            return 'present';
        }

        return 'absent';
    }

    renderKeyboard() {
        const keyboard = document.getElementById('wordle-keyboard');
        keyboard.innerHTML = '';

        const rows = [
            ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
            ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
            ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '⌫']
        ];

        rows.forEach(row => {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'keyboard-row';

            row.forEach(key => {
                const button = document.createElement('button');
                button.className = 'key' + (key.length > 1 ? ' wide' : '');
                button.textContent = key;
                button.dataset.key = key;

                if (this.keyStates[key]) {
                    button.classList.add(this.keyStates[key]);
                }

                // Click handler
                button.addEventListener('click', () => this.handleKey(key));

                // Touch handler for better mobile response
                button.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    this.handleKey(key);
                });

                rowDiv.appendChild(button);
            });

            keyboard.appendChild(rowDiv);
        });
    }

    handleKey(key) {
        if (this.gameOver) return;

        if (key === 'ENTER') {
            this.submitGuess();
        } else if (key === '⌫') {
            this.currentGuess = this.currentGuess.slice(0, -1);
            this.renderGrid();
        } else if (this.currentGuess.length < 5) {
            this.currentGuess += key;
            this.renderGrid();
        }
    }

    submitGuess() {
        if (this.currentGuess.length !== 5) {
            this.showMessage('Word must be 5 letters!');
            return;
        }

        // Update key states
        for (let i = 0; i < 5; i++) {
            const letter = this.currentGuess[i];
            const state = this.getLetterState(letter, i, this.currentGuess);

            if (!this.keyStates[letter] ||
                state === 'correct' ||
                (state === 'present' && this.keyStates[letter] === 'absent')) {
                this.keyStates[letter] = state;
            }
        }

        this.guesses.push(this.currentGuess);

        if (this.currentGuess === this.targetWord) {
            this.won = true;
            this.gameOver = true;
            this.showMessage('🎉 Congratulations! You won!');
        } else if (this.guesses.length >= this.maxGuesses) {
            this.gameOver = true;
            this.showMessage(`Game Over! The word was ${this.targetWord}`);
        }

        this.currentGuess = '';
        this.renderGrid();
        this.renderKeyboard();
    }

    showMessage(msg) {
        document.getElementById('wordle-message').textContent = msg;
    }

    bindEvents() {
        this.keyHandler = (e) => {
            if (this.gameOver) return;

            if (e.key === 'Enter') {
                this.submitGuess();
            } else if (e.key === 'Backspace') {
                this.currentGuess = this.currentGuess.slice(0, -1);
                this.renderGrid();
            } else if (/^[a-zA-Z]$/.test(e.key) && this.currentGuess.length < 5) {
                this.currentGuess += e.key.toUpperCase();
                this.renderGrid();
            }
        };

        document.addEventListener('keydown', this.keyHandler);
        document.getElementById('wordle-reset').addEventListener('click', () => this.reset());
    }

    stop() {
        if (this.keyHandler) {
            document.removeEventListener('keydown', this.keyHandler);
        }
    }
}
