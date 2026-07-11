// Sudoku Game
class SudokuGame {
    constructor(container) {
        this.container = container;
        this.solution = [];
        this.puzzle = [];
        this.selected = null;
        this.mistakes = 0;
        this.maxMistakes = 3;
        this.timer = null;
        this.seconds = 0;
        this.init();
    }

    init() {
        this.container.innerHTML = `
            <div class="sudoku-game">
                <h2>🔢 Sudoku</h2>
                <div class="game-info">
                    <span>Mistakes: <strong id="sudoku-mistakes">0/3</strong></span>
                    <span>Time: <strong id="sudoku-timer">0:00</strong></span>
                </div>
                <div class="sudoku-board" id="sudoku-board"></div>
                <div class="sudoku-numpad" id="sudoku-numpad"></div>
                <button class="reset-btn" id="sudoku-reset">New Game</button>
            </div>
        `;
        this.generatePuzzle();
        this.render();
        this.createNumpad();
        this.startTimer();
        document.getElementById('sudoku-reset').addEventListener('click', () => {
            this.seconds = 0;
            this.mistakes = 0;
            this.generatePuzzle();
            this.render();
            document.getElementById('sudoku-mistakes').textContent = '0/3';
        });
    }

    generatePuzzle() {
        // Generate a valid solved board
        this.solution = Array(9).fill(null).map(() => Array(9).fill(0));
        this.fillBoard(this.solution);
        // Create puzzle by removing cells
        this.puzzle = this.solution.map(row => [...row]);
        let cellsToRemove = 40;
        while (cellsToRemove > 0) {
            const r = Math.floor(Math.random() * 9);
            const c = Math.floor(Math.random() * 9);
            if (this.puzzle[r][c] !== 0) {
                this.puzzle[r][c] = 0;
                cellsToRemove--;
            }
        }
        this.userBoard = this.puzzle.map(row => [...row]);
    }

    fillBoard(board) {
        const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (board[row][col] === 0) {
                    const shuffled = [...nums].sort(() => Math.random() - 0.5);
                    for (const num of shuffled) {
                        if (this.isValid(board, row, col, num)) {
                            board[row][col] = num;
                            if (this.fillBoard(board)) return true;
                            board[row][col] = 0;
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }

    isValid(board, row, col, num) {
        for (let i = 0; i < 9; i++) {
            if (board[row][i] === num || board[i][col] === num) return false;
        }
        const boxR = Math.floor(row / 3) * 3;
        const boxC = Math.floor(col / 3) * 3;
        for (let r = boxR; r < boxR + 3; r++) {
            for (let c = boxC; c < boxC + 3; c++) {
                if (board[r][c] === num) return false;
            }
        }
        return true;
    }

    render() {
        const board = document.getElementById('sudoku-board');
        board.innerHTML = '';
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                const cell = document.createElement('div');
                cell.className = 'sudoku-cell';
                if (this.puzzle[r][c] !== 0) {
                    cell.textContent = this.puzzle[r][c];
                    cell.classList.add('given');
                } else if (this.userBoard[r][c] !== 0) {
                    cell.textContent = this.userBoard[r][c];
                    if (this.userBoard[r][c] !== this.solution[r][c]) {
                        cell.classList.add('wrong');
                    }
                }
                if (this.selected && this.selected.r === r && this.selected.c === c) {
                    cell.classList.add('selected');
                }
                // Box borders
                if (c % 3 === 0 && c !== 0) cell.style.borderLeft = '2px solid rgba(139,92,246,0.6)';
                if (r % 3 === 0 && r !== 0) cell.style.borderTop = '2px solid rgba(139,92,246,0.6)';

                cell.addEventListener('click', () => {
                    if (this.puzzle[r][c] === 0) {
                        this.selected = { r, c };
                        this.render();
                    }
                });
                board.appendChild(cell);
            }
        }
    }

    createNumpad() {
        const pad = document.getElementById('sudoku-numpad');
        pad.innerHTML = '';
        for (let i = 1; i <= 9; i++) {
            const btn = document.createElement('button');
            btn.className = 'sudoku-num-btn';
            btn.textContent = i;
            btn.addEventListener('click', () => this.placeNumber(i));
            pad.appendChild(btn);
        }
        const clearBtn = document.createElement('button');
        clearBtn.className = 'sudoku-num-btn';
        clearBtn.textContent = '✕';
        clearBtn.addEventListener('click', () => {
            if (this.selected && this.puzzle[this.selected.r][this.selected.c] === 0) {
                this.userBoard[this.selected.r][this.selected.c] = 0;
                this.render();
            }
        });
        pad.appendChild(clearBtn);
    }

    placeNumber(num) {
        if (!this.selected) return;
        const { r, c } = this.selected;
        if (this.puzzle[r][c] !== 0) return;

        this.userBoard[r][c] = num;
        if (num !== this.solution[r][c]) {
            this.mistakes++;
            document.getElementById('sudoku-mistakes').textContent = `${this.mistakes}/${this.maxMistakes}`;
            if (this.mistakes >= this.maxMistakes) {
                this.render();
                setTimeout(() => alert('Game Over! Too many mistakes.'), 100);
                return;
            }
        }
        this.render();

        // Check if completed
        if (this.userBoard.every((row, ri) => row.every((cell, ci) => cell === this.solution[ri][ci]))) {
            clearInterval(this.timer);
            setTimeout(() => alert('🎉 Congratulations! Puzzle solved!'), 100);
        }
    }

    startTimer() {
        if (this.timer) clearInterval(this.timer);
        this.timer = setInterval(() => {
            this.seconds++;
            const m = Math.floor(this.seconds / 60);
            const s = this.seconds % 60;
            const el = document.getElementById('sudoku-timer');
            if (el) el.textContent = `${m}:${s.toString().padStart(2, '0')}`;
        }, 1000);
    }

    stop() {
        if (this.timer) clearInterval(this.timer);
    }
}
