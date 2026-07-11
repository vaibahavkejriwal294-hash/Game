// Quiz Master Game
class QuizMasterGame {
    constructor(container) {
        this.container = container;
        this.questions = [
            { q: "What does HTML stand for?", a: ["HyperText Markup Language", "High Tech Modern Language", "Home Tool Markup Language", "HyperTransfer Markup Language"], correct: 0 },
            { q: "Which planet is known as the Red Planet?", a: ["Venus", "Mars", "Jupiter", "Saturn"], correct: 1 },
            { q: "What is the largest ocean?", a: ["Atlantic", "Indian", "Pacific", "Arctic"], correct: 2 },
            { q: "Who painted the Mona Lisa?", a: ["Michelangelo", "Picasso", "Da Vinci", "Van Gogh"], correct: 2 },
            { q: "What is the chemical symbol for Gold?", a: ["Go", "Gd", "Au", "Ag"], correct: 2 },
            { q: "How many continents are there?", a: ["5", "6", "7", "8"], correct: 2 },
            { q: "What is the fastest land animal?", a: ["Lion", "Cheetah", "Horse", "Gazelle"], correct: 1 },
            { q: "Which language runs in a web browser?", a: ["Java", "C++", "Python", "JavaScript"], correct: 3 },
            { q: "What year did the Titanic sink?", a: ["1910", "1912", "1914", "1920"], correct: 1 },
            { q: "What is the smallest prime number?", a: ["0", "1", "2", "3"], correct: 2 },
            { q: "Which gas do plants absorb?", a: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"], correct: 2 },
            { q: "What is the hardest natural substance?", a: ["Gold", "Iron", "Diamond", "Titanium"], correct: 2 },
            { q: "How many legs does a spider have?", a: ["6", "8", "10", "12"], correct: 1 },
            { q: "Which country has the most people?", a: ["USA", "India", "China", "Russia"], correct: 1 },
            { q: "What is the boiling point of water in °C?", a: ["90", "95", "100", "110"], correct: 2 }
        ];
        this.currentQuestion = 0;
        this.score = 0;
        this.shuffledQuestions = [];
        this.init();
    }

    init() {
        this.container.innerHTML = `
            <div class="quiz-game">
                <h2>🧠 Quiz Master</h2>
                <div class="game-info">
                    <span>Score: <strong id="quiz-score">0</strong></span>
                    <span>Question: <strong id="quiz-progress">1/10</strong></span>
                </div>
                <div class="quiz-question" id="quiz-question"></div>
                <div class="quiz-answers" id="quiz-answers"></div>
                <button class="reset-btn" id="quiz-reset" style="display:none;">Play Again</button>
            </div>
        `;
        this.startQuiz();
        document.getElementById('quiz-reset').addEventListener('click', () => this.startQuiz());
    }

    startQuiz() {
        this.currentQuestion = 0;
        this.score = 0;
        this.shuffledQuestions = [...this.questions].sort(() => Math.random() - 0.5).slice(0, 10);
        document.getElementById('quiz-score').textContent = '0';
        document.getElementById('quiz-reset').style.display = 'none';
        this.showQuestion();
    }

    showQuestion() {
        if (this.currentQuestion >= this.shuffledQuestions.length) {
            this.endQuiz();
            return;
        }
        const q = this.shuffledQuestions[this.currentQuestion];
        document.getElementById('quiz-progress').textContent = `${this.currentQuestion + 1}/${this.shuffledQuestions.length}`;
        document.getElementById('quiz-question').textContent = q.q;

        const answersEl = document.getElementById('quiz-answers');
        answersEl.innerHTML = '';
        q.a.forEach((answer, i) => {
            const btn = document.createElement('button');
            btn.className = 'quiz-answer-btn';
            btn.textContent = answer;
            btn.addEventListener('click', () => this.selectAnswer(i, btn));
            answersEl.appendChild(btn);
        });
    }

    selectAnswer(index, btn) {
        const q = this.shuffledQuestions[this.currentQuestion];
        const allBtns = document.querySelectorAll('.quiz-answer-btn');
        allBtns.forEach(b => b.disabled = true);

        if (index === q.correct) {
            btn.classList.add('correct');
            this.score += 10;
            document.getElementById('quiz-score').textContent = this.score;
        } else {
            btn.classList.add('wrong');
            allBtns[q.correct].classList.add('correct');
        }

        setTimeout(() => {
            this.currentQuestion++;
            this.showQuestion();
        }, 1200);
    }

    endQuiz() {
        document.getElementById('quiz-question').textContent = `Quiz Complete! Score: ${this.score}/${this.shuffledQuestions.length * 10}`;
        document.getElementById('quiz-answers').innerHTML = '';
        const msg = this.score >= 80 ? '🏆 Excellent!' : this.score >= 50 ? '👍 Good job!' : '📚 Keep learning!';
        document.getElementById('quiz-question').textContent += ` ${msg}`;
        document.getElementById('quiz-reset').style.display = 'inline-block';
    }

    stop() {}
}
