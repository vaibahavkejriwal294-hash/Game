class SnakeGame {
    constructor(container) {
        this.container = container;
        this.canvas = null;
        this.ctx = null;
        this.gridSize = 20;
        this.tileCount = 20;
        this.snake = [{ x: 10, y: 10 }];
        this.food = { x: 15, y: 15 };
        this.dx = 0;
        this.dy = 0;
        this.score = 0;
        this.gameLoop = null;
        this.render();
    }

    render() {
        // Calculate responsive canvas size
        const maxWidth = Math.min(400, window.innerWidth - 40);
        const canvasSize = Math.floor(maxWidth / this.tileCount) * this.tileCount;
        this.gridSize = canvasSize / this.tileCount;

        this.container.innerHTML = `
            <div class="snake-game">
                <h2>Snake Game</h2>
                <div class="status">Score: <span id="score">0</span></div>
                <div class="canvas-wrapper">
                    <canvas class="snake-canvas" id="snakeCanvas" width="${canvasSize}" height="${canvasSize}"></canvas>
                </div>
                <div class="mobile-controls">
                    <div class="dpad-container">
                        <button class="touch-btn up" id="btn-up">▲</button>
                        <button class="touch-btn left" id="btn-left">◀</button>
                        <button class="touch-btn right" id="btn-right">▶</button>
                        <button class="touch-btn down" id="btn-down">▼</button>
                    </div>
                </div>
                <div class="snake-controls">
                    <p>Use arrow keys or touch controls to move</p>
                    <button class="reset-btn" id="reset">Restart</button>
                </div>
            </div>
        `;

        this.canvas = document.getElementById('snakeCanvas');
        this.ctx = this.canvas.getContext('2d');
        const resetButton = document.getElementById('reset');

        // Keyboard controls
        this.keyHandler = (e) => this.handleKeyPress(e);
        document.addEventListener('keydown', this.keyHandler);
        resetButton.addEventListener('click', () => this.reset());

        // Touch controls
        this.setupTouchControls();

        this.gameLoop = setInterval(() => this.update(), 150);
    }

    setupTouchControls() {
        const btnUp = document.getElementById('btn-up');
        const btnDown = document.getElementById('btn-down');
        const btnLeft = document.getElementById('btn-left');
        const btnRight = document.getElementById('btn-right');

        const handleTouch = (direction) => {
            switch (direction) {
                case 'up':
                    if (this.dy !== 1) { this.dx = 0; this.dy = -1; }
                    break;
                case 'down':
                    if (this.dy !== -1) { this.dx = 0; this.dy = 1; }
                    break;
                case 'left':
                    if (this.dx !== 1) { this.dx = -1; this.dy = 0; }
                    break;
                case 'right':
                    if (this.dx !== -1) { this.dx = 1; this.dy = 0; }
                    break;
            }
        };

        // Use touchstart for better mobile response
        btnUp.addEventListener('touchstart', (e) => { e.preventDefault(); handleTouch('up'); });
        btnDown.addEventListener('touchstart', (e) => { e.preventDefault(); handleTouch('down'); });
        btnLeft.addEventListener('touchstart', (e) => { e.preventDefault(); handleTouch('left'); });
        btnRight.addEventListener('touchstart', (e) => { e.preventDefault(); handleTouch('right'); });

        // Also add click for desktop testing
        btnUp.addEventListener('click', () => handleTouch('up'));
        btnDown.addEventListener('click', () => handleTouch('down'));
        btnLeft.addEventListener('click', () => handleTouch('left'));
        btnRight.addEventListener('click', () => handleTouch('right'));

        // Swipe gestures on canvas
        let touchStartX, touchStartY;
        this.canvas.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        });

        this.canvas.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            const diffX = touchEndX - touchStartX;
            const diffY = touchEndY - touchStartY;

            if (Math.abs(diffX) > Math.abs(diffY)) {
                if (diffX > 30) handleTouch('right');
                else if (diffX < -30) handleTouch('left');
            } else {
                if (diffY > 30) handleTouch('down');
                else if (diffY < -30) handleTouch('up');
            }
        });
    }

    handleKeyPress(e) {
        if (e.key === 'ArrowUp' && this.dy !== 1) {
            this.dx = 0;
            this.dy = -1;
        } else if (e.key === 'ArrowDown' && this.dy !== -1) {
            this.dx = 0;
            this.dy = 1;
        } else if (e.key === 'ArrowLeft' && this.dx !== 1) {
            this.dx = -1;
            this.dy = 0;
        } else if (e.key === 'ArrowRight' && this.dx !== -1) {
            this.dx = 1;
            this.dy = 0;
        }
    }

    update() {
        if (this.dx === 0 && this.dy === 0) return;

        const head = { x: this.snake[0].x + this.dx, y: this.snake[0].y + this.dy };

        // Check wall collision
        if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount) {
            this.gameOver();
            return;
        }

        // Check self collision
        if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            this.gameOver();
            return;
        }

        this.snake.unshift(head);

        // Check food collision
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score++;
            document.getElementById('score').textContent = this.score;
            this.generateFood();
        } else {
            this.snake.pop();
        }

        this.draw();
    }

    generateFood() {
        do {
            this.food = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCount)
            };
        } while (this.snake.some(segment => segment.x === this.food.x && segment.y === this.food.y));
    }

    draw() {
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw snake
        this.ctx.fillStyle = '#4ade80';
        this.snake.forEach((segment, index) => {
            if (index === 0) {
                this.ctx.fillStyle = '#22c55e';
            } else {
                this.ctx.fillStyle = '#4ade80';
            }
            this.ctx.fillRect(segment.x * this.gridSize, segment.y * this.gridSize, this.gridSize - 2, this.gridSize - 2);
        });

        // Draw food
        this.ctx.fillStyle = '#ef4444';
        this.ctx.fillRect(this.food.x * this.gridSize, this.food.y * this.gridSize, this.gridSize - 2, this.gridSize - 2);
    }

    gameOver() {
        clearInterval(this.gameLoop);
        alert(`Game Over! Your score: ${this.score}`);
        this.reset();
    }

    reset() {
        clearInterval(this.gameLoop);
        this.snake = [{ x: 10, y: 10 }];
        this.dx = 0;
        this.dy = 0;
        this.score = 0;
        this.generateFood();
        document.getElementById('score').textContent = '0';
        this.gameLoop = setInterval(() => this.update(), 150);
        this.draw();
    }

    stop() {
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
        }
        if (this.keyHandler) {
            document.removeEventListener('keydown', this.keyHandler);
        }
    }
}
