// Simon Says Game
class SimonGame {
    constructor(container) {
        this.container = container;
        this.colors = ['green', 'red', 'yellow', 'blue'];
        this.sequence = [];
        this.playerSequence = [];
        this.level = 0;
        this.playing = false;
        this.canClick = false;
        this.highScore = parseInt(localStorage.getItem('simonHigh')) || 0;
        this.buttonSize = 150;

        this.init();
    }

    init() {
        // Calculate responsive button size
        const maxWidth = Math.min(350, window.innerWidth - 60);
        this.buttonSize = Math.floor((maxWidth - 15) / 2);

        this.container.innerHTML = `
            <div class="simon-game">
                <h2>🎨 Simon Says</h2>
                <div class="game-info">
                    <span>Level: <strong id="simon-level">0</strong></span>
                    <span>Best: <strong id="simon-best">${this.highScore}</strong></span>
                </div>
                <div class="simon-board" id="simon-board" style="grid-template-columns: repeat(2, ${this.buttonSize}px);">
                    <button class="simon-btn green" data-color="green" style="width: ${this.buttonSize}px; height: ${this.buttonSize}px;"></button>
                    <button class="simon-btn red" data-color="red" style="width: ${this.buttonSize}px; height: ${this.buttonSize}px;"></button>
                    <button class="simon-btn yellow" data-color="yellow" style="width: ${this.buttonSize}px; height: ${this.buttonSize}px;"></button>
                    <button class="simon-btn blue" data-color="blue" style="width: ${this.buttonSize}px; height: ${this.buttonSize}px;"></button>
                </div>
                <p class="game-instructions" id="simon-message">Press Start to play!</p>
                <button class="reset-btn" id="simon-start">Start Game</button>
            </div>
        `;

        this.buttons = {};
        this.colors.forEach(color => {
            this.buttons[color] = document.querySelector(`[data-color="${color}"]`);

            // Click handler
            this.buttons[color].addEventListener('click', () => this.handleClick(color));

            // Touch handler for better mobile response
            this.buttons[color].addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.handleClick(color);
            });
        });

        document.getElementById('simon-start').addEventListener('click', () => this.startGame());
    }

    startGame() {
        this.sequence = [];
        this.level = 0;
        this.playing = true;
        document.getElementById('simon-start').textContent = 'Restart';
        this.nextLevel();
    }

    nextLevel() {
        this.level++;
        document.getElementById('simon-level').textContent = this.level;
        document.getElementById('simon-message').textContent = 'Watch the pattern...';

        this.playerSequence = [];
        this.canClick = false;

        // Add new color to sequence
        const randomColor = this.colors[Math.floor(Math.random() * this.colors.length)];
        this.sequence.push(randomColor);

        // Play sequence
        setTimeout(() => this.playSequence(), 500);
    }

    playSequence() {
        let i = 0;
        const playNext = () => {
            if (i >= this.sequence.length) {
                this.canClick = true;
                document.getElementById('simon-message').textContent = 'Your turn!';
                return;
            }

            this.flashButton(this.sequence[i]);
            i++;
            setTimeout(playNext, 600);
        };
        playNext();
    }

    flashButton(color, duration = 400) {
        const btn = this.buttons[color];
        btn.classList.add('active');

        // Play sound (optional - using Web Audio API)
        this.playTone(color);

        setTimeout(() => {
            btn.classList.remove('active');
        }, duration);
    }

    playTone(color) {
        const frequencies = {
            green: 392,
            red: 329.63,
            yellow: 261.63,
            blue: 220
        };

        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.type = 'sine';
            oscillator.frequency.value = frequencies[color];
            gainNode.gain.value = 0.3;

            oscillator.start();
            setTimeout(() => {
                oscillator.stop();
                audioContext.close();
            }, 200);
        } catch (e) {
            // Audio not supported
        }
    }

    handleClick(color) {
        if (!this.playing || !this.canClick) return;

        this.flashButton(color, 200);
        this.playerSequence.push(color);

        const currentIndex = this.playerSequence.length - 1;

        if (this.playerSequence[currentIndex] !== this.sequence[currentIndex]) {
            this.gameOver();
            return;
        }

        if (this.playerSequence.length === this.sequence.length) {
            this.canClick = false;
            document.getElementById('simon-message').textContent = 'Correct! 🎉';
            setTimeout(() => this.nextLevel(), 1000);
        }
    }

    gameOver() {
        this.playing = false;
        this.canClick = false;

        if (this.level > this.highScore) {
            this.highScore = this.level;
            localStorage.setItem('simonHigh', this.highScore);
            document.getElementById('simon-best').textContent = this.highScore;
        }

        document.getElementById('simon-message').textContent = `Game Over! You reached level ${this.level}`;
        document.getElementById('simon-start').textContent = 'Play Again';

        // Flash all buttons red
        this.colors.forEach(color => {
            this.buttons[color].style.opacity = '0.3';
        });

        setTimeout(() => {
            this.colors.forEach(color => {
                this.buttons[color].style.opacity = '';
            });
        }, 500);
    }

    stop() {
        this.playing = false;
    }
}
