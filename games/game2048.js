// 2048 Game
class Game2048 {
    constructor(container) {
        this.container = container;
        this.size = 4;
        this.grid = [];
        this.score = 0;
        this.bestScore = parseInt(localStorage.getItem('best2048')) || 0;
        this.gameOver = false;
        this.won = false;
        this.tileSize = 80;

        this.init();
    }

    init() {
        // Calculate responsive tile size
        const maxWidth = Math.min(360, window.innerWidth - 60);
        this.tileSize = Math.floor((maxWidth - 50) / this.size);

        this.container.innerHTML = `
            <div class="game-2048">
                <h2>🔢 2048</h2>
                <div class="game-info">
                    <span>Score: <strong id="score-2048">0</strong></span>
                    <span>Best: <strong id="best-2048">${this.bestScore}</strong></span>
                </div>
                <div class="grid-2048" id="grid-2048" style="grid-template-columns: repeat(4, ${this.tileSize}px); grid-template-rows: repeat(4, ${this.tileSize}px);"></div>
                <p class="game-instructions">Swipe or use arrow keys to move tiles</p>
                <button class="reset-btn" id="reset-2048">New Game</button>
            </div>
        `;

        this.gridElement = document.getElementById('grid-2048');
        this.reset();
        this.bindEvents();
    }

    reset() {
        this.grid = Array(this.size).fill().map(() => Array(this.size).fill(0));
        this.score = 0;
        this.gameOver = false;
        this.won = false;
        this.addRandomTile();
        this.addRandomTile();
        this.updateUI();
    }

    addRandomTile() {
        const emptyCells = [];
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] === 0) {
                    emptyCells.push({ x: i, y: j });
                }
            }
        }

        if (emptyCells.length > 0) {
            const { x, y } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            this.grid[x][y] = Math.random() < 0.9 ? 2 : 4;
        }
    }

    move(direction) {
        if (this.gameOver) return false;

        let moved = false;
        const oldGrid = JSON.stringify(this.grid);

        switch (direction) {
            case 'up':
                this.moveUp();
                break;
            case 'down':
                this.moveDown();
                break;
            case 'left':
                this.moveLeft();
                break;
            case 'right':
                this.moveRight();
                break;
        }

        moved = oldGrid !== JSON.stringify(this.grid);

        if (moved) {
            this.addRandomTile();
            this.updateUI();

            if (this.score > this.bestScore) {
                this.bestScore = this.score;
                localStorage.setItem('best2048', this.bestScore);
            }

            if (!this.canMove()) {
                this.gameOver = true;
            }
        }

        return moved;
    }

    moveLeft() {
        for (let i = 0; i < this.size; i++) {
            let row = this.grid[i].filter(x => x !== 0);
            for (let j = 0; j < row.length - 1; j++) {
                if (row[j] === row[j + 1]) {
                    row[j] *= 2;
                    this.score += row[j];
                    if (row[j] === 2048) this.won = true;
                    row.splice(j + 1, 1);
                }
            }
            while (row.length < this.size) row.push(0);
            this.grid[i] = row;
        }
    }

    moveRight() {
        for (let i = 0; i < this.size; i++) {
            let row = this.grid[i].filter(x => x !== 0);
            for (let j = row.length - 1; j > 0; j--) {
                if (row[j] === row[j - 1]) {
                    row[j] *= 2;
                    this.score += row[j];
                    if (row[j] === 2048) this.won = true;
                    row.splice(j - 1, 1);
                }
            }
            while (row.length < this.size) row.unshift(0);
            this.grid[i] = row;
        }
    }

    moveUp() {
        this.transpose();
        this.moveLeft();
        this.transpose();
    }

    moveDown() {
        this.transpose();
        this.moveRight();
        this.transpose();
    }

    transpose() {
        this.grid = this.grid[0].map((_, i) => this.grid.map(row => row[i]));
    }

    canMove() {
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] === 0) return true;
                if (i < this.size - 1 && this.grid[i][j] === this.grid[i + 1][j]) return true;
                if (j < this.size - 1 && this.grid[i][j] === this.grid[i][j + 1]) return true;
            }
        }
        return false;
    }

    updateUI() {
        document.getElementById('score-2048').textContent = this.score;
        document.getElementById('best-2048').textContent = this.bestScore;

        this.gridElement.innerHTML = '';

        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const tile = document.createElement('div');
                tile.className = `tile ${this.grid[i][j] ? 'tile-' + this.grid[i][j] : ''}`;
                tile.textContent = this.grid[i][j] || '';
                tile.style.width = this.tileSize + 'px';
                tile.style.height = this.tileSize + 'px';
                tile.style.fontSize = this.grid[i][j] >= 1000 ? '1.2em' : '1.6em';
                this.gridElement.appendChild(tile);
            }
        }

        if (this.gameOver) {
            const overlay = document.createElement('div');
            overlay.style.cssText = 'position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; border-radius: 12px;';
            overlay.innerHTML = `<span style="color: white; font-size: 1.8em; font-weight: bold;">${this.won ? 'You Win!' : 'Game Over!'}</span>`;
            this.gridElement.style.position = 'relative';
            this.gridElement.appendChild(overlay);
        }
    }

    bindEvents() {
        this.keyHandler = (e) => {
            switch (e.key) {
                case 'ArrowUp':
                    e.preventDefault();
                    this.move('up');
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    this.move('down');
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    this.move('left');
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.move('right');
                    break;
            }
        };

        document.addEventListener('keydown', this.keyHandler);

        document.getElementById('reset-2048').addEventListener('click', () => {
            this.reset();
        });

        // Touch/swipe support
        let startX, startY;
        let isSwiping = false;

        this.gridElement.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            isSwiping = true;
        }, { passive: true });

        this.gridElement.addEventListener('touchmove', (e) => {
            if (!isSwiping) return;
            e.preventDefault();
        }, { passive: false });

        this.gridElement.addEventListener('touchend', (e) => {
            if (!isSwiping) return;
            isSwiping = false;

            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            const diffX = endX - startX;
            const diffY = endY - startY;

            const minSwipeDistance = 30;

            if (Math.abs(diffX) < minSwipeDistance && Math.abs(diffY) < minSwipeDistance) {
                return; // Not a valid swipe
            }

            if (Math.abs(diffX) > Math.abs(diffY)) {
                this.move(diffX > 0 ? 'right' : 'left');
            } else {
                this.move(diffY > 0 ? 'down' : 'up');
            }
        });

        // Also allow swiping on the entire game container
        this.container.addEventListener('touchstart', (e) => {
            if (e.target.closest('.grid-2048')) return;
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            isSwiping = true;
        }, { passive: true });

        this.container.addEventListener('touchend', (e) => {
            if (!isSwiping || e.target.closest('.grid-2048')) return;
            isSwiping = false;

            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            const diffX = endX - startX;
            const diffY = endY - startY;

            const minSwipeDistance = 50;

            if (Math.abs(diffX) < minSwipeDistance && Math.abs(diffY) < minSwipeDistance) {
                return;
            }

            if (Math.abs(diffX) > Math.abs(diffY)) {
                this.move(diffX > 0 ? 'right' : 'left');
            } else {
                this.move(diffY > 0 ? 'down' : 'up');
            }
        });
    }

    stop() {
        if (this.keyHandler) {
            document.removeEventListener('keydown', this.keyHandler);
        }
    }
}
