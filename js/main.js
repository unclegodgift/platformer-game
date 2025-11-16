class Main {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.game = new Game(this.canvas.width, this.canvas.height);
        this.renderer = new Renderer(this.ctx, this.canvas.width, this.canvas.height);
        this.inputHandler = new InputHandler();
        
        this.setupEventListeners();
        this.gameLoop();
    }

    setupEventListeners() {
        // Кнопки управления
        document.getElementById('startBtn').addEventListener('click', () => {
            this.game.start();
            this.animateButton('startBtn');
        });

        document.getElementById('pauseBtn').addEventListener('click', () => {
            this.game.togglePause();
            this.animateButton('pauseBtn');
        });

        document.getElementById('restartBtn').addEventListener('click', () => {
            this.game.restart();
            this.updateUI();
            this.animateButton('restartBtn');
        });

        document.getElementById('playAgainBtn').addEventListener('click', () => {
            this.game.restart();
            this.updateUI();
            this.animateButton('playAgainBtn');
        });

        // Обработка ввода
        this.inputHandler.onKeyDown((key) => {
            if (!this.game.isPaused && this.game.isRunning) {
                if (key === 'ArrowLeft' || key === 'a' || key === 'ф') this.game.player.moveLeft();
                if (key === 'ArrowRight' || key === 'd' || key === 'в') this.game.player.moveRight();
                if (key === ' ' || key === 'w' || key === 'ц') this.game.player.jump();
            }
        });

        this.inputHandler.onKeyUp((key) => {
            if (key === 'ArrowLeft' || key === 'a' || key === 'ф') this.game.player.stopMoving();
            if (key === 'ArrowRight' || key === 'd' || key === 'в') this.game.player.stopMoving();
        });

        // Пауза по клавише P
        document.addEventListener('keydown', (event) => {
            if (event.key.toLowerCase() === 'p') {
                this.game.togglePause();
                this.animateButton('pauseBtn');
            }
        });
    }

    animateButton(buttonId) {
        const button = document.getElementById(buttonId);
        button.classList.add('pulse');
        setTimeout(() => {
            button.classList.remove('pulse');
        }, 500);
    }

    updateUI() {
        // Обновление статистики
        document.querySelector('#score .stat-value').textContent = this.game.score;
        document.querySelector('#level .stat-value').textContent = this.game.level;
        document.querySelector('#lives .stat-value').textContent = this.game.lives;
        
        // Обновление прогресса монет
        const collectedCoins = this.game.coins.filter(coin => coin.collected).length;
        const totalCoins = this.game.coins.length;
        const progressPercent = totalCoins > 0 ? (collectedCoins / totalCoins) * 100 : 0;
        
        document.getElementById('coinsProgress').style.width = `${progressPercent}%`;
        document.getElementById('coinsText').textContent = `${collectedCoins}/${totalCoins}`;
        
        // Обработка окончания игры
        if (this.game.isGameOver) {
            document.getElementById('finalScore').textContent = this.game.score;
            document.getElementById('gameOver').classList.remove('hidden');
        } else {
            document.getElementById('gameOver').classList.add('hidden');
        }
    }

    gameLoop() {
        if (this.game.isRunning && !this.game.isPaused) {
            this.game.update();
            this.renderer.render(this.game);
            this.updateUI();
        }
        
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Запуск игры при загрузке страницы
window.addEventListener('load', () => {
    new Main();
});