// Main app navigation
const mainMenu = document.getElementById('main-menu');
const gameContainer = document.getElementById('game-container');
const gameArea = document.getElementById('game-area');
const backButton = document.getElementById('back-button');

let currentGame = null;

// Create floating particles
function createParticles() {
    const particlesContainer = document.getElementById('particles');
    const colors = ['#6366f1', '#8b5cf6', '#f472b6', '#a78bfa', '#c084fc'];

    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.width = Math.random() * 10 + 5 + 'px';
        particle.style.height = particle.style.width;
        particle.style.animationDuration = Math.random() * 20 + 10 + 's';
        particle.style.animationDelay = Math.random() * 10 + 's';
        particle.style.background = `radial-gradient(circle, ${colors[Math.floor(Math.random() * colors.length)]}80 0%, transparent 70%)`;
        particlesContainer.appendChild(particle);
    }
}

// Initialize particles
createParticles();

// Category Filter
const filterButtons = document.querySelectorAll('.filter-btn');
const gameCards = document.querySelectorAll('.game-card');

filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        // Update active button
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.getAttribute('data-filter');

        // Filter cards with animation
        gameCards.forEach(card => {
            const category = card.getAttribute('data-category');
            if (filter === 'all' || category === filter) {
                card.style.display = 'block';
                card.style.animation = 'cardAppear 0.5s ease-out';
            } else {
                card.style.display = 'none';
            }
        });
    });
});

// Game card click handlers
document.querySelectorAll('.game-card').forEach(card => {
    card.addEventListener('click', () => {
        const gameName = card.getAttribute('data-game');
        startGame(gameName);
    });
});

// Back button handler
backButton.addEventListener('click', () => {
    stopCurrentGame();
    showMenu();
});

function startGame(gameName) {
    mainMenu.classList.add('hidden');
    gameContainer.classList.remove('hidden');
    gameArea.innerHTML = '';

    switch (gameName) {
        case 'tictactoe':
            currentGame = new TicTacToe(gameArea);
            break;
        case 'snake':
            currentGame = new SnakeGame(gameArea);
            break;
        case 'car':
            currentGame = new CarGame(gameArea);
            break;
        case 'pong':
            currentGame = new PongGame(gameArea);
            break;
        case 'memory':
            currentGame = new MemoryGame(gameArea);
            break;
        case 'breakout':
            currentGame = new BreakoutGame(gameArea);
            break;
        case 'tetris':
            currentGame = new TetrisGame(gameArea);
            break;
        case 'minesweeper':
            currentGame = new MinesweeperGame(gameArea);
            break;
        case '2048':
            currentGame = new Game2048(gameArea);
            break;
        case 'flappybird':
            currentGame = new FlappyBirdGame(gameArea);
            break;
        case 'spaceinvaders':
            currentGame = new SpaceInvadersGame(gameArea);
            break;
        case 'wordle':
            currentGame = new WordleGame(gameArea);
            break;
        case 'dino':
            currentGame = new DinoGame(gameArea);
            break;
        case 'connect4':
            currentGame = new Connect4Game(gameArea);
            break;
        case 'simon':
            currentGame = new SimonGame(gameArea);
            break;
        case 'whackamole':
            currentGame = new WhackAMoleGame(gameArea);
            break;
    }
}

function stopCurrentGame() {
    if (currentGame && currentGame.stop) {
        currentGame.stop();
    }
    currentGame = null;
}

function showMenu() {
    gameContainer.classList.add('hidden');
    mainMenu.classList.remove('hidden');
}
