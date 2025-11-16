class Game {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.isRunning = false;
        this.isPaused = false;
        this.isGameOver = false;
        
        this.score = 0;
        this.level = 1;
        this.lives = 3;
        this.maxLives = 3;
        
        // Улучшенный игрок с новой физикой
        this.player = new Player(width / 2, height - 100, 30, 50);
        this.platforms = [];
        this.coins = [];
        this.spikes = [];
        this.lava = [];
        this.levelCompleted = false;
        
        this.levels = this.createLevels();
        this.loadLevel(this.level - 1);
    }

    update() {
        if (this.isGameOver || this.levelCompleted) return;

        // Обновление лавы (анимация)
        this.lava.forEach(lava => lava.update());

        this.player.update(this.platforms, this.width, this.height);
        
        // Проверка сбора монет
        this.coins.forEach(coin => {
            if (!coin.collected && Collision.checkRectRect(this.player.hitbox, coin)) {
                coin.collected = true;
                this.score += 100;
            }
        });

        // Проверка столкновения с шипами
        this.spikes.forEach(spike => {
            if (Collision.checkRectRect(this.player.hitbox, spike)) {
                this.takeDamage();
            }
        });

        // Проверка столкновения с лавой
        this.lava.forEach(lava => {
            if (Collision.checkRectRect(this.player.hitbox, lava)) {
                this.takeDamage();
            }
        });

        // Проверка достижения цели
        if (Collision.checkRectRect(this.player.hitbox, this.goal)) {
            this.completeLevel();
        }

        // Проверка падения в пропасть
        if (this.player.y > this.height + 100) {
            this.takeDamage();
        }
    }

    createLevels() {
        return [
            // Уровень 1 - обучающий
            {
                platforms: [
                    {x: 0, y: this.height - 50, width: this.width, height: 50},
                    {x: 100, y: 350, width: 200, height: 20},
                    {x: 350, y: 250, width: 150, height: 20},
                    {x: 600, y: 300, width: 180, height: 20},
                    {x: 200, y: 150, width: 120, height: 20},
                    {x: 500, y: 100, width: 200, height: 20}
                ],
                coins: [
                    {x: 150, y: 300, width: 15, height: 15, collected: false},
                    {x: 400, y: 200, width: 15, height: 15, collected: false},
                    {x: 650, y: 250, width: 15, height: 15, collected: false},
                    {x: 250, y: 100, width: 15, height: 15, collected: false},
                    {x: 550, y: 50, width: 15, height: 15, collected: false}
                ],
                spikes: [],
                lava: [],
                goal: {x: 750, y: 50, width: 30, height: 30}
            },
            // Уровень 2 - с шипами
            {
                platforms: [
                    {x: 0, y: this.height - 50, width: 300, height: 50},
                    {x: 400, y: this.height - 50, width: 400, height: 50},
                    {x: 100, y: 350, width: 150, height: 20},
                    {x: 300, y: 280, width: 200, height: 20},
                    {x: 550, y: 220, width: 150, height: 20},
                    {x: 200, y: 150, width: 100, height: 20},
                    {x: 450, y: 120, width: 120, height: 20},
                    {x: 650, y: 80, width: 100, height: 20}
                ],
                coins: [
                    {x: 150, y: 300, width: 15, height: 15, collected: false},
                    {x: 350, y: 230, width: 15, height: 15, collected: false},
                    {x: 600, y: 170, width: 15, height: 15, collected: false},
                    {x: 250, y: 100, width: 15, height: 15, collected: false},
                    {x: 500, y: 70, width: 15, height: 15, collected: false}
                ],
                spikes: [
                    {x: 300, y: this.height - 70, width: 100, height: 20},
                    {x: 650, y: 250, width: 40, height: 20},
                    {x: 200, y: 130, width: 60, height: 20}
                ],
                lava: [],
                goal: {x: 700, y: 30, width: 30, height: 30}
            },
            // Уровень 3 - с лавой
            {
                platforms: [
                    {x: 0, y: this.height - 50, width: 200, height: 50},
                    {x: 300, y: this.height - 50, width: 200, height: 50},
                    {x: 600, y: this.height - 50, width: 200, height: 50},
                    {x: 150, y: 320, width: 100, height: 20},
                    {x: 350, y: 270, width: 120, height: 20},
                    {x: 550, y: 220, width: 100, height: 20},
                    {x: 200, y: 170, width: 80, height: 20},
                    {x: 400, y: 120, width: 150, height: 20},
                    {x: 650, y: 70, width: 100, height: 20}
                ],
                coins: [
                    {x: 180, y: 270, width: 15, height: 15, collected: false},
                    {x: 380, y: 220, width: 15, height: 15, collected: false},
                    {x: 580, y: 170, width: 15, height: 15, collected: false},
                    {x: 230, y: 120, width: 15, height: 15, collected: false},
                    {x: 450, y: 70, width: 15, height: 15, collected: false}
                ],
                spikes: [
                    {x: 250, y: 320, width: 50, height: 20},
                    {x: 500, y: 220, width: 50, height: 20}
                ],
                lava: [
                    {x: 200, y: this.height - 30, width: 100, height: 30},
                    {x: 500, y: this.height - 30, width: 100, height: 30}
                ],
                goal: {x: 680, y: 20, width: 30, height: 30}
            },
            // Уровень 4 - сложный
            {
                platforms: [
                    {x: 0, y: this.height - 50, width: 150, height: 50},
                    {x: 250, y: this.height - 50, width: 150, height: 50},
                    {x: 500, y: this.height - 50, width: 150, height: 50},
                    {x: 100, y: 350, width: 80, height: 20},
                    {x: 250, y: 300, width: 100, height: 20},
                    {x: 450, y: 250, width: 80, height: 20},
                    {x: 600, y: 200, width: 120, height: 20},
                    {x: 150, y: 180, width: 70, height: 20},
                    {x: 350, y: 130, width: 90, height: 20},
                    {x: 550, y: 80, width: 110, height: 20}
                ],
                coins: [
                    {x: 130, y: 300, width: 15, height: 15, collected: false},
                    {x: 280, y: 250, width: 15, height: 15, collected: false},
                    {x: 480, y: 200, width: 15, height: 15, collected: false},
                    {x: 630, y: 150, width: 15, height: 15, collected: false},
                    {x: 180, y: 130, width: 15, height: 15, collected: false},
                    {x: 380, y: 80, width: 15, height: 15, collected: false},
                    {x: 580, y: 30, width: 15, height: 15, collected: false}
                ],
                spikes: [
                    {x: 150, y: this.height - 70, width: 100, height: 20},
                    {x: 400, y: this.height - 70, width: 100, height: 20},
                    {x: 300, y: 280, width: 40, height: 20},
                    {x: 500, y: 230, width: 40, height: 20},
                    {x: 200, y: 160, width: 40, height: 20}
                ],
                lava: [
                    {x: 650, y: this.height - 30, width: 150, height: 30},
                    {x: 400, y: 110, width: 80, height: 20}
                ],
                goal: {x: 620, y: 30, width: 30, height: 30}
            }
        ];
    }

    loadLevel(levelIndex) {
        const level = this.levels[levelIndex];
        
        this.platforms = level.platforms.map(p => new Platform(p.x, p.y, p.width, p.height));
        this.coins = level.coins;
        this.spikes = level.spikes.map(s => new Spike(s.x, s.y, s.width, s.height));
        this.lava = level.lava.map(l => new Lava(l.x, l.y, l.width, l.height));
        this.goal = level.goal;
        this.levelCompleted = false;
        
        // Сброс позиции игрока
        this.player.reset(50, this.height - 100);
    }

    start() {
        this.isRunning = true;
        this.isPaused = false;
    }

    togglePause() {
        this.isPaused = !this.isPaused;
    }

    restart() {
        this.isRunning = true;
        this.isPaused = false;
        this.isGameOver = false;
        this.score = 0;
        this.level = 1;
        this.lives = this.maxLives;
        this.loadLevel(this.level - 1);
    }

    update() {
        if (this.isGameOver || this.levelCompleted) return;

        // Обновление лавы (анимация)
        this.lava.forEach(lava => lava.update());

        this.player.update(this.platforms, this.width, this.height);
        
        // Проверка сбора монет
        this.coins.forEach(coin => {
            if (!coin.collected && Collision.checkRectRect(this.player, coin)) {
                coin.collected = true;
                this.score += 100;
            }
        });

        // Проверка столкновения с шипами
        this.spikes.forEach(spike => {
            if (Collision.checkRectRect(this.player, spike)) {
                this.takeDamage();
            }
        });

        // Проверка столкновения с лавой
        this.lava.forEach(lava => {
            if (Collision.checkRectRect(this.player, lava)) {
                this.takeDamage();
            }
        });

        // Проверка достижения цели
        if (Collision.checkRectRect(this.player, this.goal)) {
            this.completeLevel();
        }

        // Проверка падения в пропасть
        if (this.player.y > this.height) {
            this.takeDamage();
        }
    }

    takeDamage() {
        this.lives--;
        if (this.lives <= 0) {
            this.gameOver();
        } else {
            // Респавн игрока
            this.player.reset(50, this.height - 100);
            this.player.velocityY = 0;
        }
    }

    completeLevel() {
        this.levelCompleted = true;
        this.score += this.level * 1000;
        
        setTimeout(() => {
            if (this.level < this.levels.length) {
                this.level++;
                this.loadLevel(this.level - 1);
                // Восстановление одной жизни за уровень, но не больше максимума
                if (this.lives < this.maxLives) {
                    this.lives++;
                }
            } else {
                this.winGame();
            }
        }, 1000);
    }

    gameOver() {
        this.isGameOver = true;
        this.isRunning = false;
    }

    winGame() {
        this.isGameOver = true;
        this.isRunning = false;
        this.score += 5000; // Бонус за прохождение всех уровней
    }
}
