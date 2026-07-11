// Connect Four Game
class Connect4Game {
    constructor(container) {
        this.container = container;
        this.rows = 6;
        this.cols = 7;
        this.board = [];
        this.currentPlayer = 'red';
        this.gameOver = false;
        this.winner = null;
        this.cellSize = 60;

        this.init();
    }

    init() {
        // Calculate responsive cell size
        const maxWidth = Math.min(450, window.innerWidth - 40);
        this.cellSize = Math.floor((maxWidth - 60) / this.cols);

        this.container.innerHTML = `
            <div class="connect4-game">
                <h2>🔴 Connect Four</h2>
                <p class="status" id="c4-status">🔴 Red's turn</p>
                <div class="connect4-board" id="c4-board" style="grid-template-columns: repeat(${this.cols}, ${this.cellSize}px);"></div>
                <button class="reset-btn" id="c4-reset">New Game</button>
            </div>
        `;

        this.reset();
        document.getElementById('c4-reset').addEventListener('click', () => this.reset());
    }

    reset() {
        this.board = Array(this.rows).fill().map(() => Array(this.cols).fill(null));
        this.currentPlayer = 'red';
        this.gameOver = false;
        this.winner = null;
        this.updateStatus();
        this.render();
    }

    updateStatus() {
        const statusEl = document.getElementById('c4-status');
        if (this.winner) {
            statusEl.textContent = `${this.winner === 'red' ? '🔴 Red' : '🟡 Yellow'} wins! 🎉`;
        } else if (this.isDraw()) {
            statusEl.textContent = "It's a draw!";
        } else {
            statusEl.textContent = `${this.currentPlayer === 'red' ? '🔴 Red' : '🟡 Yellow'}'s turn`;
        }
    }

    render() {
        const boardEl = document.getElementById('c4-board');
        boardEl.innerHTML = '';

        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const cell = document.createElement('div');
                cell.className = 'connect4-cell';
                cell.style.width = this.cellSize + 'px';
                cell.style.height = this.cellSize + 'px';

                if (this.board[row][col]) {
                    cell.classList.add(this.board[row][col]);
                }

                // Click for desktop and tap for mobile
                cell.addEventListener('click', () => this.dropPiece(col));
                cell.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    this.dropPiece(col);
                });

                cell.addEventListener('mouseenter', () => {
                    if (!this.gameOver && !this.board[row][col]) {
                        cell.style.boxShadow = `0 0 20px ${this.currentPlayer === 'red' ? '#ef4444' : '#eab308'}`;
                    }
                });
                cell.addEventListener('mouseleave', () => {
                    if (!this.board[row][col]) {
                        cell.style.boxShadow = '';
                    }
                });

                boardEl.appendChild(cell);
            }
        }
    }

    dropPiece(col) {
        if (this.gameOver) return;

        // Find lowest empty row
        let row = -1;
        for (let r = this.rows - 1; r >= 0; r--) {
            if (!this.board[r][col]) {
                row = r;
                break;
            }
        }

        if (row === -1) return; // Column full

        this.board[row][col] = this.currentPlayer;

        if (this.checkWin(row, col)) {
            this.winner = this.currentPlayer;
            this.gameOver = true;
        } else {
            this.currentPlayer = this.currentPlayer === 'red' ? 'yellow' : 'red';
        }

        this.updateStatus();
        this.render();
    }

    checkWin(row, col) {
        const directions = [
            [0, 1],   // Horizontal
            [1, 0],   // Vertical
            [1, 1],   // Diagonal /
            [1, -1]   // Diagonal \
        ];

        for (const [dr, dc] of directions) {
            let count = 1;

            // Check positive direction
            for (let i = 1; i < 4; i++) {
                const r = row + dr * i;
                const c = col + dc * i;
                if (r >= 0 && r < this.rows && c >= 0 && c < this.cols &&
                    this.board[r][c] === this.currentPlayer) {
                    count++;
                } else {
                    break;
                }
            }

            // Check negative direction
            for (let i = 1; i < 4; i++) {
                const r = row - dr * i;
                const c = col - dc * i;
                if (r >= 0 && r < this.rows && c >= 0 && c < this.cols &&
                    this.board[r][c] === this.currentPlayer) {
                    count++;
                } else {
                    break;
                }
            }

            if (count >= 4) return true;
        }

        return false;
    }

    isDraw() {
        return this.board[0].every(cell => cell !== null);
    }

    stop() {
        // No cleanup needed
    }
}
