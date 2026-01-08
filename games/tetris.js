// Tetris Game
class TetrisGame {
    constructor(container) {
        this.container = container;
        this.cols = 10;
        this.rows = 20;
        this.blockSize = 25;
        this.board = Array(this.rows).fill().map(() => Array(this.cols).fill(0));
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.gameOver = false;
        this.isPaused = false;
        this.currentPiece = null;
        this.nextPiece = null;

        this.pieces = [
            { shape: [[1, 1, 1, 1]], color: '#00f5ff' }, // I
            { shape: [[1, 1], [1, 1]], color: '#ffeb3b' }, // O
            { shape: [[0, 1, 0], [1, 1, 1]], color: '#9c27b0' }, // T
            { shape: [[1, 0, 0], [1, 1, 1]], color: '#ff9800' }, // L
            { shape: [[0, 0, 1], [1, 1, 1]], color: '#2196f3' }, // J
            { shape: [[0, 1, 1], [1, 1, 0]], color: '#4caf50' }, // S
            { shape: [[1, 1, 0], [0, 1, 1]], color: '#f44336' }  // Z
        ];

        this.init();
    }

    init() {
        // Calculate responsive block size
        const maxWidth = Math.min(250, window.innerWidth - 150);
        this.blockSize = Math.floor(maxWidth / this.cols);

        this.container.innerHTML = `
            <div class="tetris-game">
                <h2>🧱 Tetris</h2>
                <div class="game-info">
                    <span>Score: <strong id="tetris-score">0</strong></span>
                    <span>Level: <strong id="tetris-level">1</strong></span>
                    <span>Lines: <strong id="tetris-lines">0</strong></span>
                </div>
                <div style="display: flex; gap: 20px; justify-content: center; align-items: flex-start; flex-wrap: wrap;">
                    <div class="canvas-wrapper">
                        <canvas id="tetris-canvas" class="game-canvas" width="${this.cols * this.blockSize}" height="${this.rows * this.blockSize}"></canvas>
                    </div>
                    <div style="text-align: center;">
                        <p style="color: rgba(255,255,255,0.7); margin-bottom: 10px;">Next:</p>
                        <canvas id="next-piece" class="game-canvas" width="100" height="100"></canvas>
                    </div>
                </div>
                <div class="mobile-controls">
                    <div class="control-group">
                        <button class="touch-btn" id="tetris-left">◀</button>
                        <button class="touch-btn" id="tetris-right">▶</button>
                    </div>
                    <div class="control-group">
                        <button class="touch-btn" id="tetris-rotate">↻</button>
                        <button class="touch-btn" id="tetris-down">▼</button>
                        <button class="touch-btn large" id="tetris-drop">⬇</button>
                    </div>
                </div>
                <p class="game-instructions">Arrows to move, Up to rotate, Space to drop</p>
                <button class="reset-btn" id="tetris-reset">New Game</button>
            </div>
        `;

        this.canvas = document.getElementById('tetris-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.nextCanvas = document.getElementById('next-piece');
        this.nextCtx = this.nextCanvas.getContext('2d');

        this.spawnPiece();
        this.bindEvents();
        this.gameLoop();
    }

    spawnPiece() {
        if (this.nextPiece) {
            this.currentPiece = this.nextPiece;
        } else {
            const piece = this.pieces[Math.floor(Math.random() * this.pieces.length)];
            this.currentPiece = {
                shape: piece.shape.map(row => [...row]),
                color: piece.color,
                x: Math.floor(this.cols / 2) - 1,
                y: 0
            };
        }

        const nextPieceData = this.pieces[Math.floor(Math.random() * this.pieces.length)];
        this.nextPiece = {
            shape: nextPieceData.shape.map(row => [...row]),
            color: nextPieceData.color,
            x: Math.floor(this.cols / 2) - 1,
            y: 0
        };

        this.drawNextPiece();

        if (this.collision()) {
            this.gameOver = true;
        }
    }

    drawNextPiece() {
        this.nextCtx.fillStyle = '#0a0a0a';
        this.nextCtx.fillRect(0, 0, 100, 100);

        const piece = this.nextPiece;
        const blockSize = 20;
        const offsetX = (100 - piece.shape[0].length * blockSize) / 2;
        const offsetY = (100 - piece.shape.length * blockSize) / 2;

        piece.shape.forEach((row, y) => {
            row.forEach((cell, x) => {
                if (cell) {
                    this.nextCtx.fillStyle = piece.color;
                    this.nextCtx.fillRect(offsetX + x * blockSize, offsetY + y * blockSize, blockSize - 1, blockSize - 1);
                }
            });
        });
    }

    collision(offsetX = 0, offsetY = 0, shape = this.currentPiece.shape) {
        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (shape[y][x]) {
                    const newX = this.currentPiece.x + x + offsetX;
                    const newY = this.currentPiece.y + y + offsetY;

                    if (newX < 0 || newX >= this.cols || newY >= this.rows) {
                        return true;
                    }
                    if (newY >= 0 && this.board[newY][newX]) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    merge() {
        this.currentPiece.shape.forEach((row, y) => {
            row.forEach((cell, x) => {
                if (cell && this.currentPiece.y + y >= 0) {
                    this.board[this.currentPiece.y + y][this.currentPiece.x + x] = this.currentPiece.color;
                }
            });
        });
    }

    rotate() {
        const rotated = this.currentPiece.shape[0].map((_, i) =>
            this.currentPiece.shape.map(row => row[i]).reverse()
        );
        if (!this.collision(0, 0, rotated)) {
            this.currentPiece.shape = rotated;
        }
    }

    clearLines() {
        let linesCleared = 0;
        for (let y = this.rows - 1; y >= 0; y--) {
            if (this.board[y].every(cell => cell)) {
                this.board.splice(y, 1);
                this.board.unshift(Array(this.cols).fill(0));
                linesCleared++;
                y++;
            }
        }
        if (linesCleared) {
            this.lines += linesCleared;
            this.score += linesCleared * 100 * this.level;
            this.level = Math.floor(this.lines / 10) + 1;
            this.updateUI();
        }
    }

    updateUI() {
        document.getElementById('tetris-score').textContent = this.score;
        document.getElementById('tetris-level').textContent = this.level;
        document.getElementById('tetris-lines').textContent = this.lines;
    }

    draw() {
        this.ctx.fillStyle = '#0a0a0a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw grid
        this.ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        for (let x = 0; x <= this.cols; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * this.blockSize, 0);
            this.ctx.lineTo(x * this.blockSize, this.canvas.height);
            this.ctx.stroke();
        }
        for (let y = 0; y <= this.rows; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * this.blockSize);
            this.ctx.lineTo(this.canvas.width, y * this.blockSize);
            this.ctx.stroke();
        }

        // Draw board
        this.board.forEach((row, y) => {
            row.forEach((cell, x) => {
                if (cell) {
                    this.ctx.fillStyle = cell;
                    this.ctx.fillRect(x * this.blockSize, y * this.blockSize, this.blockSize - 1, this.blockSize - 1);
                }
            });
        });

        // Draw current piece
        if (this.currentPiece) {
            this.currentPiece.shape.forEach((row, y) => {
                row.forEach((cell, x) => {
                    if (cell) {
                        this.ctx.fillStyle = this.currentPiece.color;
                        this.ctx.fillRect(
                            (this.currentPiece.x + x) * this.blockSize,
                            (this.currentPiece.y + y) * this.blockSize,
                            this.blockSize - 1,
                            this.blockSize - 1
                        );
                    }
                });
            });
        }

        if (this.gameOver) {
            this.ctx.fillStyle = 'rgba(0,0,0,0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 24px Outfit';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2);
        }
    }

    moveDown() {
        if (!this.collision(0, 1)) {
            this.currentPiece.y++;
        } else {
            this.merge();
            this.clearLines();
            this.spawnPiece();
        }
    }

    moveLeft() {
        if (!this.collision(-1, 0)) {
            this.currentPiece.x--;
        }
    }

    moveRight() {
        if (!this.collision(1, 0)) {
            this.currentPiece.x++;
        }
    }

    hardDrop() {
        while (!this.collision(0, 1)) {
            this.currentPiece.y++;
            this.score += 2;
        }
        this.merge();
        this.clearLines();
        this.spawnPiece();
    }

    bindEvents() {
        this.keyHandler = (e) => {
            if (this.gameOver) return;

            switch (e.key) {
                case 'ArrowLeft':
                    this.moveLeft();
                    break;
                case 'ArrowRight':
                    this.moveRight();
                    break;
                case 'ArrowDown':
                    this.moveDown();
                    this.score++;
                    break;
                case 'ArrowUp':
                    this.rotate();
                    break;
                case ' ':
                    e.preventDefault();
                    this.hardDrop();
                    break;
            }
            this.updateUI();
            this.draw();
        };

        document.addEventListener('keydown', this.keyHandler);

        // Touch controls
        const btnLeft = document.getElementById('tetris-left');
        const btnRight = document.getElementById('tetris-right');
        const btnRotate = document.getElementById('tetris-rotate');
        const btnDown = document.getElementById('tetris-down');
        const btnDrop = document.getElementById('tetris-drop');

        const touchAction = (action) => {
            if (this.gameOver) return;
            action();
            this.updateUI();
            this.draw();
        };

        btnLeft.addEventListener('touchstart', (e) => { e.preventDefault(); touchAction(() => this.moveLeft()); });
        btnRight.addEventListener('touchstart', (e) => { e.preventDefault(); touchAction(() => this.moveRight()); });
        btnRotate.addEventListener('touchstart', (e) => { e.preventDefault(); touchAction(() => this.rotate()); });
        btnDown.addEventListener('touchstart', (e) => { e.preventDefault(); touchAction(() => { this.moveDown(); this.score++; }); });
        btnDrop.addEventListener('touchstart', (e) => { e.preventDefault(); touchAction(() => this.hardDrop()); });

        // Click for desktop
        btnLeft.addEventListener('click', () => touchAction(() => this.moveLeft()));
        btnRight.addEventListener('click', () => touchAction(() => this.moveRight()));
        btnRotate.addEventListener('click', () => touchAction(() => this.rotate()));
        btnDown.addEventListener('click', () => touchAction(() => { this.moveDown(); this.score++; }));
        btnDrop.addEventListener('click', () => touchAction(() => this.hardDrop()));

        document.getElementById('tetris-reset').addEventListener('click', () => {
            this.reset();
        });
    }

    reset() {
        this.board = Array(this.rows).fill().map(() => Array(this.cols).fill(0));
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.gameOver = false;
        this.currentPiece = null;
        this.nextPiece = null;
        this.spawnPiece();
        this.updateUI();
    }

    gameLoop() {
        this.dropCounter = 0;
        this.dropInterval = 1000;
        this.lastTime = 0;

        const update = (time = 0) => {
            if (!this.gameOver) {
                const deltaTime = time - this.lastTime;
                this.lastTime = time;

                this.dropCounter += deltaTime;
                if (this.dropCounter > this.dropInterval / this.level) {
                    this.moveDown();
                    this.dropCounter = 0;
                }
            }

            this.draw();
            this.animationId = requestAnimationFrame(update);
        };

        update();
    }

    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        if (this.keyHandler) {
            document.removeEventListener('keydown', this.keyHandler);
        }
    }
}
