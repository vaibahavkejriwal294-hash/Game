// Minesweeper Game
class MinesweeperGame {
    constructor(container) {
        this.container = container;
        this.rows = 9;
        this.cols = 9;
        this.mines = 10;
        this.board = [];
        this.revealed = [];
        this.flagged = [];
        this.gameOver = false;
        this.firstClick = true;
        this.timer = 0;
        this.timerInterval = null;
        this.longPressTimer = null;
        this.longPressDelay = 500;

        this.init();
    }

    init() {
        // Calculate responsive cell size
        const maxWidth = Math.min(350, window.innerWidth - 60);
        const cellSize = Math.floor(maxWidth / this.cols);

        this.container.innerHTML = `
            <div class="minesweeper-game">
                <h2>💣 Minesweeper</h2>
                <div class="game-info">
                    <span>💣 <strong id="mine-count">${this.mines}</strong></span>
                    <span>⏱️ <strong id="mine-timer">0</strong></span>
                </div>
                <div class="minesweeper-grid" id="mine-grid" style="grid-template-columns: repeat(${this.cols}, ${cellSize}px);"></div>
                <p class="game-instructions">Tap to reveal, Long-press to flag 🚩</p>
                <button class="reset-btn" id="mine-reset">New Game</button>
            </div>
        `;

        this.gridElement = document.getElementById('mine-grid');
        this.cellSize = cellSize;
        this.reset();

        document.getElementById('mine-reset').addEventListener('click', () => this.reset());
    }

    reset() {
        this.board = Array(this.rows).fill().map(() => Array(this.cols).fill(0));
        this.revealed = Array(this.rows).fill().map(() => Array(this.cols).fill(false));
        this.flagged = Array(this.rows).fill().map(() => Array(this.cols).fill(false));
        this.gameOver = false;
        this.firstClick = true;
        this.timer = 0;

        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }

        document.getElementById('mine-timer').textContent = '0';
        document.getElementById('mine-count').textContent = this.mines;

        this.render();
    }

    placeMines(excludeRow, excludeCol) {
        let placed = 0;
        while (placed < this.mines) {
            const row = Math.floor(Math.random() * this.rows);
            const col = Math.floor(Math.random() * this.cols);

            // Don't place mine on first click or adjacent cells
            const isNearFirstClick = Math.abs(row - excludeRow) <= 1 && Math.abs(col - excludeCol) <= 1;

            if (this.board[row][col] !== -1 && !isNearFirstClick) {
                this.board[row][col] = -1;
                placed++;
            }
        }

        // Calculate numbers
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                if (this.board[r][c] !== -1) {
                    this.board[r][c] = this.countAdjacentMines(r, c);
                }
            }
        }
    }

    countAdjacentMines(row, col) {
        let count = 0;
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                const r = row + dr;
                const c = col + dc;
                if (r >= 0 && r < this.rows && c >= 0 && c < this.cols && this.board[r][c] === -1) {
                    count++;
                }
            }
        }
        return count;
    }

    reveal(row, col) {
        if (this.gameOver || this.flagged[row][col] || this.revealed[row][col]) return;

        if (this.firstClick) {
            this.firstClick = false;
            this.placeMines(row, col);
            this.startTimer();
        }

        this.revealed[row][col] = true;

        if (this.board[row][col] === -1) {
            this.gameOver = true;
            this.revealAll();
            clearInterval(this.timerInterval);
            return;
        }

        if (this.board[row][col] === 0) {
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    const r = row + dr;
                    const c = col + dc;
                    if (r >= 0 && r < this.rows && c >= 0 && c < this.cols) {
                        this.reveal(r, c);
                    }
                }
            }
        }

        this.checkWin();
        this.render();
    }

    toggleFlag(row, col) {
        if (this.gameOver || this.revealed[row][col]) return;

        this.flagged[row][col] = !this.flagged[row][col];
        const flagCount = this.flagged.flat().filter(x => x).length;
        document.getElementById('mine-count').textContent = this.mines - flagCount;
        this.render();
    }

    revealAll() {
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                this.revealed[r][c] = true;
            }
        }
        this.render();
    }

    checkWin() {
        let unrevealed = 0;
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                if (!this.revealed[r][c] && this.board[r][c] !== -1) {
                    unrevealed++;
                }
            }
        }

        if (unrevealed === 0) {
            this.gameOver = true;
            clearInterval(this.timerInterval);
            setTimeout(() => alert('You Win! 🎉'), 100);
        }
    }

    startTimer() {
        this.timerInterval = setInterval(() => {
            this.timer++;
            document.getElementById('mine-timer').textContent = this.timer;
        }, 1000);
    }

    render() {
        this.gridElement.innerHTML = '';

        const colors = ['', '#3b82f6', '#22c55e', '#ef4444', '#8b5cf6', '#dc2626', '#06b6d4', '#000', '#6b7280'];

        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const cell = document.createElement('button');
                cell.className = 'mine-cell';
                cell.style.width = this.cellSize + 'px';
                cell.style.height = this.cellSize + 'px';

                if (this.revealed[r][c]) {
                    cell.classList.add('revealed');
                    if (this.board[r][c] === -1) {
                        cell.classList.add('mine');
                        cell.textContent = '💣';
                    } else if (this.board[r][c] > 0) {
                        cell.textContent = this.board[r][c];
                        cell.style.color = colors[this.board[r][c]];
                    }
                } else if (this.flagged[r][c]) {
                    cell.classList.add('flagged');
                    cell.textContent = '🚩';
                }

                // Click to reveal
                cell.addEventListener('click', (e) => {
                    if (!cell.classList.contains('pressing')) {
                        this.reveal(r, c);
                    }
                });

                // Right-click to flag (desktop)
                cell.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    this.toggleFlag(r, c);
                });

                // Long-press to flag (mobile)
                let longPressTriggered = false;

                cell.addEventListener('touchstart', (e) => {
                    longPressTriggered = false;
                    cell.classList.add('pressing');
                    this.longPressTimer = setTimeout(() => {
                        longPressTriggered = true;
                        cell.classList.remove('pressing');
                        this.toggleFlag(r, c);
                    }, this.longPressDelay);
                });

                cell.addEventListener('touchend', (e) => {
                    cell.classList.remove('pressing');
                    if (this.longPressTimer) {
                        clearTimeout(this.longPressTimer);
                        this.longPressTimer = null;
                    }
                    if (!longPressTriggered && !this.flagged[r][c]) {
                        this.reveal(r, c);
                    }
                    e.preventDefault();
                });

                cell.addEventListener('touchmove', () => {
                    cell.classList.remove('pressing');
                    if (this.longPressTimer) {
                        clearTimeout(this.longPressTimer);
                        this.longPressTimer = null;
                    }
                });

                this.gridElement.appendChild(cell);
            }
        }
    }

    stop() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        if (this.longPressTimer) {
            clearTimeout(this.longPressTimer);
        }
    }
}
