// Maze Runner Game
class MazeRunnerGame {
    constructor(container) {
        this.container = container;
        this.rows = 15;
        this.cols = 15;
        this.maze = [];
        this.playerPos = { r: 1, c: 1 };
        this.endPos = { r: 13, c: 13 };
        this.moves = 0;
        this.timer = null;
        this.seconds = 0;
        this.gameOver = false;
        this.init();
    }

    init() {
        this.container.innerHTML = `
            <div class="maze-game">
                <h2>🏃 Maze Runner</h2>
                <div class="game-info">
                    <span>Moves: <strong id="maze-moves">0</strong></span>
                    <span>Time: <strong id="maze-timer">0:00</strong></span>
                </div>
                <div class="maze-board" id="maze-board"></div>
                <div class="maze-controls" id="maze-controls">
                    <div></div>
                    <button class="maze-ctrl-btn" data-dir="up">⬆️</button>
                    <div></div>
                    <button class="maze-ctrl-btn" data-dir="left">⬅️</button>
                    <button class="maze-ctrl-btn" data-dir="down">⬇️</button>
                    <button class="maze-ctrl-btn" data-dir="right">➡️</button>
                </div>
                <button class="reset-btn" id="maze-reset">New Maze</button>
                <p class="game-instructions">Use arrow keys or buttons to navigate</p>
            </div>
        `;
        this.generateMaze();
        this.render();
        this.startTimer();

        // Keyboard controls
        this.keyHandler = (e) => {
            if (this.gameOver) return;
            const dirs = { 'ArrowUp': [-1, 0], 'ArrowDown': [1, 0], 'ArrowLeft': [0, -1], 'ArrowRight': [0, 1] };
            if (dirs[e.key]) {
                e.preventDefault();
                this.move(dirs[e.key][0], dirs[e.key][1]);
            }
        };
        document.addEventListener('keydown', this.keyHandler);

        // Touch controls
        document.querySelectorAll('.maze-ctrl-btn').forEach(btn => {
            const dir = btn.dataset.dir;
            const dirs = { up: [-1, 0], down: [1, 0], left: [0, -1], right: [0, 1] };
            btn.addEventListener('click', () => {
                if (!this.gameOver) this.move(dirs[dir][0], dirs[dir][1]);
            });
        });

        document.getElementById('maze-reset').addEventListener('click', () => {
            this.moves = 0;
            this.seconds = 0;
            this.gameOver = false;
            this.playerPos = { r: 1, c: 1 };
            this.generateMaze();
            this.render();
        });
    }

    generateMaze() {
        // Initialize all walls
        this.maze = Array(this.rows).fill(null).map(() => Array(this.cols).fill(1));

        // Recursive backtracking
        const stack = [{ r: 1, c: 1 }];
        this.maze[1][1] = 0;

        while (stack.length > 0) {
            const current = stack[stack.length - 1];
            const neighbors = [];
            const dirs = [[-2, 0], [2, 0], [0, -2], [0, 2]];

            for (const [dr, dc] of dirs) {
                const nr = current.r + dr;
                const nc = current.c + dc;
                if (nr > 0 && nr < this.rows - 1 && nc > 0 && nc < this.cols - 1 && this.maze[nr][nc] === 1) {
                    neighbors.push({ r: nr, c: nc, wallR: current.r + dr / 2, wallC: current.c + dc / 2 });
                }
            }

            if (neighbors.length > 0) {
                const next = neighbors[Math.floor(Math.random() * neighbors.length)];
                this.maze[next.wallR][next.wallC] = 0;
                this.maze[next.r][next.c] = 0;
                stack.push({ r: next.r, c: next.c });
            } else {
                stack.pop();
            }
        }

        // Ensure end is reachable
        this.maze[this.endPos.r][this.endPos.c] = 0;
        this.maze[this.endPos.r - 1][this.endPos.c] = 0;
    }

    render() {
        const board = document.getElementById('maze-board');
        if (!board) return;
        const cellSize = Math.min(22, (Math.min(400, window.innerWidth - 80)) / this.cols);
        board.style.gridTemplateColumns = `repeat(${this.cols}, ${cellSize}px)`;
        board.innerHTML = '';

        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const cell = document.createElement('div');
                cell.className = 'maze-cell';
                cell.style.width = cellSize + 'px';
                cell.style.height = cellSize + 'px';

                if (this.maze[r][c] === 1) {
                    cell.classList.add('wall');
                } else if (r === this.playerPos.r && c === this.playerPos.c) {
                    cell.classList.add('player');
                    cell.textContent = '🏃';
                    cell.style.fontSize = (cellSize * 0.7) + 'px';
                } else if (r === this.endPos.r && c === this.endPos.c) {
                    cell.classList.add('exit');
                    cell.textContent = '🏁';
                    cell.style.fontSize = (cellSize * 0.7) + 'px';
                }

                board.appendChild(cell);
            }
        }
    }

    move(dr, dc) {
        const newR = this.playerPos.r + dr;
        const newC = this.playerPos.c + dc;

        if (newR >= 0 && newR < this.rows && newC >= 0 && newC < this.cols && this.maze[newR][newC] === 0) {
            this.playerPos = { r: newR, c: newC };
            this.moves++;
            document.getElementById('maze-moves').textContent = this.moves;
            this.render();

            if (newR === this.endPos.r && newC === this.endPos.c) {
                this.gameOver = true;
                clearInterval(this.timer);
                const m = Math.floor(this.seconds / 60);
                const s = this.seconds % 60;
                setTimeout(() => alert(`🎉 You escaped in ${this.moves} moves! Time: ${m}:${s.toString().padStart(2, '0')}`), 100);
            }
        }
    }

    startTimer() {
        if (this.timer) clearInterval(this.timer);
        this.timer = setInterval(() => {
            if (!this.gameOver) {
                this.seconds++;
                const m = Math.floor(this.seconds / 60);
                const s = this.seconds % 60;
                const el = document.getElementById('maze-timer');
                if (el) el.textContent = `${m}:${s.toString().padStart(2, '0')}`;
            }
        }, 1000);
    }

    stop() {
        if (this.timer) clearInterval(this.timer);
        if (this.keyHandler) document.removeEventListener('keydown', this.keyHandler);
    }
}
