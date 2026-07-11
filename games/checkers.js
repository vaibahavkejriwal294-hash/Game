// Checkers Game
class CheckersGame {
    constructor(container) {
        this.container = container;
        this.board = [];
        this.selected = null;
        this.currentPlayer = 'red';
        this.validMoves = [];
        this.gameOver = false;
        this.init();
    }

    init() {
        this.container.innerHTML = `
            <div class="checkers-game">
                <h2>♟️ Checkers</h2>
                <p class="status" id="checkers-status">🔴 Red's turn</p>
                <div class="checkers-board" id="checkers-board"></div>
                <button class="reset-btn" id="checkers-reset">New Game</button>
            </div>
        `;
        this.reset();
        document.getElementById('checkers-reset').addEventListener('click', () => this.reset());
    }

    reset() {
        this.board = Array(8).fill(null).map(() => Array(8).fill(null));
        this.currentPlayer = 'red';
        this.selected = null;
        this.validMoves = [];
        this.gameOver = false;

        // Place pieces
        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 8; c++) {
                if ((r + c) % 2 === 1) this.board[r][c] = { color: 'black', king: false };
            }
        }
        for (let r = 5; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                if ((r + c) % 2 === 1) this.board[r][c] = { color: 'red', king: false };
            }
        }
        this.updateStatus();
        this.render();
    }

    updateStatus() {
        const el = document.getElementById('checkers-status');
        if (!el) return;
        if (this.gameOver) {
            el.textContent = `${this.currentPlayer === 'red' ? '⚫ Black' : '🔴 Red'} wins! 🎉`;
        } else {
            el.textContent = `${this.currentPlayer === 'red' ? '🔴 Red' : '⚫ Black'}'s turn`;
        }
    }

    render() {
        const boardEl = document.getElementById('checkers-board');
        if (!boardEl) return;
        boardEl.innerHTML = '';
        const cellSize = Math.min(50, (Math.min(450, window.innerWidth - 80)) / 8);

        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const cell = document.createElement('div');
                cell.className = 'checkers-cell';
                cell.style.width = cellSize + 'px';
                cell.style.height = cellSize + 'px';
                cell.classList.add((r + c) % 2 === 0 ? 'light' : 'dark');

                if (this.selected && this.selected.r === r && this.selected.c === c) {
                    cell.classList.add('selected');
                }
                if (this.validMoves.some(m => m.r === r && m.c === c)) {
                    cell.classList.add('valid-move');
                }

                const piece = this.board[r][c];
                if (piece) {
                    const pieceEl = document.createElement('div');
                    pieceEl.className = `checker-piece ${piece.color}`;
                    pieceEl.style.width = (cellSize * 0.75) + 'px';
                    pieceEl.style.height = (cellSize * 0.75) + 'px';
                    pieceEl.style.fontSize = (cellSize * 0.35) + 'px';
                    if (piece.king) pieceEl.textContent = '👑';
                    cell.appendChild(pieceEl);
                }

                cell.addEventListener('click', () => this.handleClick(r, c));
                boardEl.appendChild(cell);
            }
        }
        boardEl.style.gridTemplateColumns = `repeat(8, ${cellSize}px)`;
    }

    handleClick(r, c) {
        if (this.gameOver) return;

        const piece = this.board[r][c];

        // If clicking a valid move destination
        if (this.selected && this.validMoves.some(m => m.r === r && m.c === c)) {
            this.movePiece(this.selected.r, this.selected.c, r, c);
            return;
        }

        // If clicking own piece
        if (piece && piece.color === this.currentPlayer) {
            this.selected = { r, c };
            this.validMoves = this.getValidMoves(r, c);
            this.render();
        }
    }

    getValidMoves(r, c) {
        const piece = this.board[r][c];
        if (!piece) return [];
        const moves = [];
        const dirs = piece.color === 'red' ? [[-1, -1], [-1, 1]] : [[1, -1], [1, 1]];
        if (piece.king) {
            dirs.push(...(piece.color === 'red' ? [[1, -1], [1, 1]] : [[-1, -1], [-1, 1]]));
        }

        for (const [dr, dc] of dirs) {
            const nr = r + dr, nc = c + dc;
            if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
                if (!this.board[nr][nc]) {
                    moves.push({ r: nr, c: nc, jump: false });
                } else if (this.board[nr][nc].color !== piece.color) {
                    const jr = nr + dr, jc = nc + dc;
                    if (jr >= 0 && jr < 8 && jc >= 0 && jc < 8 && !this.board[jr][jc]) {
                        moves.push({ r: jr, c: jc, jump: true, capturedR: nr, capturedC: nc });
                    }
                }
            }
        }
        return moves;
    }

    movePiece(fromR, fromC, toR, toC) {
        const move = this.validMoves.find(m => m.r === toR && m.c === toC);
        this.board[toR][toC] = this.board[fromR][fromC];
        this.board[fromR][fromC] = null;

        if (move && move.jump) {
            this.board[move.capturedR][move.capturedC] = null;
        }

        // King promotion
        if (toR === 0 && this.board[toR][toC].color === 'red') this.board[toR][toC].king = true;
        if (toR === 7 && this.board[toR][toC].color === 'black') this.board[toR][toC].king = true;

        this.selected = null;
        this.validMoves = [];
        this.currentPlayer = this.currentPlayer === 'red' ? 'black' : 'red';

        // Check win
        const hasOppPieces = this.board.some(row =>
            row.some(cell => cell && cell.color === this.currentPlayer)
        );
        if (!hasOppPieces) {
            this.gameOver = true;
        }

        this.updateStatus();
        this.render();
    }

    stop() {}
}
