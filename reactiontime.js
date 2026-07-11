// Reaction Time Game
class ReactionTimeGame {
    constructor(container) {
        this.container = container;
        this.state = 'waiting'; // waiting, ready, go, result
        this.startTime = 0;
        this.timeout = null;
        this.results = [];
        this.bestTime = parseInt(localStorage.getItem('reactionBest')) || 999;
        this.init();
    }

    init() {
        this.container.innerHTML = `
            <div class="reaction-game">
                <h2>⚡ Reaction Time</h2>
                <div class="game-info">
                    <span>Best: <strong id="reaction-best">${this.bestTime === 999 ? '--' : this.bestTime + 'ms'}</strong></span>
                    <span>Avg: <strong id="reaction-avg">--</strong></span>
                    <span>Round: <strong id="reaction-round">0/5</strong></span>
                </div>
                <div class="reaction-area" id="reaction-area">
                    <div class="reaction-text" id="reaction-text">Click to Start!</div>
                </div>
                <div class="reaction-results" id="reaction-results"></div>
                <button class="reset-btn" id="reaction-reset">Reset</button>
            </div>
        `;
        const area = document.getElementById('reaction-area');
        area.addEventListener('click', () => this.handleClick());
        area.addEventListener('touchstart', (e) => { e.preventDefault(); this.handleClick(); });
        document.getElementById('reaction-reset').addEventListener('click', () => {
            this.results = [];
            this.state = 'waiting';
            this.updateUI();
        });
        this.updateUI();
    }

    handleClick() {
        switch (this.state) {
            case 'waiting':
                this.state = 'ready';
                this.updateUI();
                // Random delay between 1.5 - 5 seconds
                const delay = 1500 + Math.random() * 3500;
                this.timeout = setTimeout(() => {
                    this.state = 'go';
                    this.startTime = Date.now();
                    this.updateUI();
                }, delay);
                break;

            case 'ready':
                // Too early!
                clearTimeout(this.timeout);
                this.state = 'waiting';
                document.getElementById('reaction-text').textContent = '⚠️ Too early! Click to try again.';
                document.getElementById('reaction-area').style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
                break;

            case 'go':
                const reactionTime = Date.now() - this.startTime;
                this.results.push(reactionTime);
                if (reactionTime < this.bestTime) {
                    this.bestTime = reactionTime;
                    localStorage.setItem('reactionBest', this.bestTime);
                }
                this.state = this.results.length >= 5 ? 'done' : 'waiting';
                this.updateUI();
                document.getElementById('reaction-text').textContent = `⚡ ${reactionTime}ms!` +
                    (this.results.length < 5 ? ' Click to continue.' : '');
                document.getElementById('reaction-area').style.background =
                    reactionTime < 200 ? 'linear-gradient(135deg, #10b981, #059669)' :
                    reactionTime < 350 ? 'linear-gradient(135deg, #f59e0b, #d97706)' :
                    'linear-gradient(135deg, #ef4444, #dc2626)';
                break;

            case 'done':
                this.results = [];
                this.state = 'waiting';
                this.updateUI();
                break;
        }
    }

    updateUI() {
        const area = document.getElementById('reaction-area');
        const text = document.getElementById('reaction-text');
        const best = document.getElementById('reaction-best');
        const avg = document.getElementById('reaction-avg');
        const round = document.getElementById('reaction-round');
        const results = document.getElementById('reaction-results');

        best.textContent = this.bestTime === 999 ? '--' : this.bestTime + 'ms';
        round.textContent = `${this.results.length}/5`;

        if (this.results.length > 0) {
            const avgTime = Math.round(this.results.reduce((a, b) => a + b, 0) / this.results.length);
            avg.textContent = avgTime + 'ms';
        } else {
            avg.textContent = '--';
        }

        // Show results list
        results.innerHTML = this.results.map((r, i) =>
            `<span class="reaction-result">R${i + 1}: ${r}ms</span>`
        ).join('');

        switch (this.state) {
            case 'waiting':
                area.style.background = 'linear-gradient(135deg, #6366f1, #8b5cf6)';
                text.textContent = this.results.length > 0 ? `${this.results[this.results.length - 1]}ms - Click for next round` : 'Click to Start!';
                break;
            case 'ready':
                area.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
                text.textContent = 'Wait for GREEN...';
                break;
            case 'go':
                area.style.background = 'linear-gradient(135deg, #10b981, #059669)';
                text.textContent = 'CLICK NOW!';
                break;
            case 'done':
                const avgTime = Math.round(this.results.reduce((a, b) => a + b, 0) / this.results.length);
                area.style.background = 'linear-gradient(135deg, #8b5cf6, #6366f1)';
                text.textContent = `Done! Average: ${avgTime}ms - Click to restart`;
                break;
        }
    }

    stop() {
        if (this.timeout) clearTimeout(this.timeout);
    }
}
