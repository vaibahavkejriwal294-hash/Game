class TicTacToe {
    constructor(container) {
        this.container = container;
        this.board = Array(9).fill(null);
        this.currentPlayer = 'X';
        this.gameOver = false;
        this.isSinglePlayer = false;
        this.playerSymbol = 'X';
        this.aiSymbol = 'O';
        this.render();
    }

    render() {
        this.container.innerHTML = `
            <div class="tic-tac-toe">
                <h2>Tic-Tac-Toe</h2>
                <div class="mode-selector">
                    <button class="mode-btn ${!this.isSinglePlayer ? 'active' : ''}" id="two-player">👥 2 Players</button>
                    <button class="mode-btn ${this.isSinglePlayer ? 'active' : ''}" id="single-player">🤖 vs Computer</button>
                </div>
                <div class="status" id="status">${this.isSinglePlayer ? 'Your turn (X)' : "Player X's turn"}</div>
                <div class="board" id="board"></div>
                <button class="reset-btn" id="reset">New Game</button>
            </div>
        `;

        const boardElement = document.getElementById('board');
        const statusElement = document.getElementById('status');
        const resetButton = document.getElementById('reset');
        const twoPlayerBtn = document.getElementById('two-player');
        const singlePlayerBtn = document.getElementById('single-player');

        this.board.forEach((cell, index) => {
            const cellElement = document.createElement('button');
            cellElement.className = 'cell';
            cellElement.textContent = cell || '';
            cellElement.disabled = cell !== null || this.gameOver;
            cellElement.addEventListener('click', () => this.makeMove(index, cellElement, statusElement));
            boardElement.appendChild(cellElement);
        });

        resetButton.addEventListener('click', () => this.reset());
        twoPlayerBtn.addEventListener('click', () => this.setMode(false));
        singlePlayerBtn.addEventListener('click', () => this.setMode(true));
    }

    setMode(isSingle) {
        this.isSinglePlayer = isSingle;
        this.reset();
    }

    makeMove(index, cellElement, statusElement) {
        if (this.board[index] || this.gameOver) return;

        // In single player, only allow moves when it's player's turn
        if (this.isSinglePlayer && this.currentPlayer !== this.playerSymbol) return;

        this.board[index] = this.currentPlayer;
        cellElement.textContent = this.currentPlayer;
        cellElement.disabled = true;

        if (this.checkWinner()) {
            if (this.isSinglePlayer) {
                statusElement.textContent = this.currentPlayer === this.playerSymbol
                    ? 'You win! 🎉'
                    : 'Computer wins! 🤖';
            } else {
                statusElement.textContent = `Player ${this.currentPlayer} wins! 🎉`;
            }
            this.gameOver = true;
            this.disableAllCells();
            return;
        }

        if (this.board.every(cell => cell !== null)) {
            statusElement.textContent = "It's a draw!";
            this.gameOver = true;
            return;
        }

        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';

        if (this.isSinglePlayer) {
            if (this.currentPlayer === this.aiSymbol) {
                statusElement.textContent = 'Computer thinking... 🤔';
                this.disableAllCells();
                // Small delay for AI move to feel more natural
                setTimeout(() => this.makeAIMove(statusElement), 500);
            } else {
                statusElement.textContent = 'Your turn (X)';
            }
        } else {
            statusElement.textContent = `Player ${this.currentPlayer}'s turn`;
        }
    }

    makeAIMove(statusElement) {
        if (this.gameOver) return;

        const bestMove = this.getBestMove();
        if (bestMove === -1) return;

        this.board[bestMove] = this.aiSymbol;
        const cells = document.querySelectorAll('.cell');
        cells[bestMove].textContent = this.aiSymbol;
        cells[bestMove].disabled = true;

        if (this.checkWinner()) {
            statusElement.textContent = 'Computer wins! 🤖';
            this.gameOver = true;
            this.disableAllCells();
            return;
        }

        if (this.board.every(cell => cell !== null)) {
            statusElement.textContent = "It's a draw!";
            this.gameOver = true;
            return;
        }

        this.currentPlayer = this.playerSymbol;
        statusElement.textContent = 'Your turn (X)';
        this.enableEmptyCells();
    }

    getBestMove() {
        // Use minimax algorithm for optimal AI play
        let bestScore = -Infinity;
        let bestMove = -1;

        for (let i = 0; i < 9; i++) {
            if (this.board[i] === null) {
                this.board[i] = this.aiSymbol;
                const score = this.minimax(this.board, 0, false);
                this.board[i] = null;

                if (score > bestScore) {
                    bestScore = score;
                    bestMove = i;
                }
            }
        }

        return bestMove;
    }

    minimax(board, depth, isMaximizing) {
        // Check terminal states
        if (this.checkWinnerFor(this.aiSymbol)) return 10 - depth;
        if (this.checkWinnerFor(this.playerSymbol)) return depth - 10;
        if (board.every(cell => cell !== null)) return 0;

        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === null) {
                    board[i] = this.aiSymbol;
                    const score = this.minimax(board, depth + 1, false);
                    board[i] = null;
                    bestScore = Math.max(score, bestScore);
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === null) {
                    board[i] = this.playerSymbol;
                    const score = this.minimax(board, depth + 1, true);
                    board[i] = null;
                    bestScore = Math.min(score, bestScore);
                }
            }
            return bestScore;
        }
    }

    checkWinnerFor(player) {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];

        return winPatterns.some(pattern => {
            const [a, b, c] = pattern;
            return this.board[a] === player &&
                this.board[b] === player &&
                this.board[c] === player;
        });
    }

    checkWinner() {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
            [0, 4, 8], [2, 4, 6] // diagonals
        ];

        return winPatterns.some(pattern => {
            const [a, b, c] = pattern;
            return this.board[a] &&
                this.board[a] === this.board[b] &&
                this.board[a] === this.board[c];
        });
    }

    disableAllCells() {
        document.querySelectorAll('.cell').forEach(cell => {
            cell.disabled = true;
        });
    }

    enableEmptyCells() {
        const cells = document.querySelectorAll('.cell');
        cells.forEach((cell, index) => {
            if (this.board[index] === null && !this.gameOver) {
                cell.disabled = false;
            }
        });
    }

    reset() {
        this.board = Array(9).fill(null);
        this.currentPlayer = 'X';
        this.gameOver = false;
        this.render();
    }

    stop() {
        // Cleanup if needed
    }
}
