class Player {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        
        // Улучшенная физика
        this.velocityX = 0;
        this.velocityY = 0;
        
        this.speed = 0.5; // Уменьшено для плавности
        this.maxSpeed = 6; // Максимальная скорость
        this.jumpPower = 14;
        this.gravity = 0.6;
        this.friction = 0.85; // Увеличено для лучшего контроля
        
        this.acceleration = 0.8; // Ускорение для плавного разгона
        this.deceleration = 0.9; // Замедление
        
        this.isOnGround = false;
        this.isMovingLeft = false;
        this.isMovingRight = false;
        
        // Анимация и графика
        this.color = '#e74c3c';
        this.invulnerable = false;
        this.invulnerableTimer = 0;
        this.facingRight = true;
        this.walkAnimationFrame = 0;
        this.jumpAnimationFrame = 0;
        
        // Хитбокс (может быть меньше визуального представления)
        this.hitbox = {
            x: x + 5,
            y: y + 5,
            width: width - 10,
            height: height - 5
        };
    }

    moveLeft() {
        this.isMovingLeft = true;
        this.facingRight = false;
    }

    moveRight() {
        this.isMovingRight = true;
        this.facingRight = true;
    }

    stopMoving() {
        this.isMovingLeft = false;
        this.isMovingRight = false;
    }

    jump() {
        if (this.isOnGround) {
            this.velocityY = -this.jumpPower;
            this.isOnGround = false;
            this.jumpAnimationFrame = 0;
        }
    }

    update(platforms, gameWidth, gameHeight) {
        // Обновление неуязвимости
        if (this.invulnerable) {
            this.invulnerableTimer--;
            if (this.invulnerableTimer <= 0) {
                this.invulnerable = false;
            }
        }

        // Плавное ускорение при движении
        if (this.isMovingLeft) {
            this.velocityX = Math.max(this.velocityX - this.acceleration, -this.maxSpeed);
        } else if (this.isMovingRight) {
            this.velocityX = Math.min(this.velocityX + this.acceleration, this.maxSpeed);
        } else {
            // Плавное замедление при отпускании клавиш
            this.velocityX *= this.deceleration;
            if (Math.abs(this.velocityX) < 0.1) this.velocityX = 0;
        }
        
        // Применение гравитации
        this.velocityY += this.gravity;
        
        // Обновление позиции
        this.x += this.velocityX;
        this.y += this.velocityY;
        
        // Обновление хитбокса
        this.hitbox.x = this.x + 5;
        this.hitbox.y = this.y + 5;
        
        // Ограничения по краям
        if (this.x < 0) {
            this.x = 0;
            this.velocityX = 0;
        }
        if (this.x + this.width > gameWidth) {
            this.x = gameWidth - this.width;
            this.velocityX = 0;
        }
        
        // Сброс состояния на земле
        this.isOnGround = false;
        
        // Обновление анимации
        if (this.isOnGround) {
            if (this.isMovingLeft || this.isMovingRight) {
                this.walkAnimationFrame = (this.walkAnimationFrame + 0.2) % 4;
            } else {
                this.walkAnimationFrame = 0;
            }
        } else {
            this.walkAnimationFrame = 0;
            this.jumpAnimationFrame += 0.1;
        }
        
        // Проверка коллизий с платформами
        platforms.forEach(platform => {
            if (Collision.checkRectRect(this.hitbox, platform)) {
                this.handlePlatformCollision(platform);
            }
        });
    }

    handlePlatformCollision(platform) {
        // Определяем направление коллизии
        const playerBottom = this.hitbox.y + this.hitbox.height;
        const playerTop = this.hitbox.y;
        const platformBottom = platform.y + platform.height;
        const platformTop = platform.y;

        // Коллизия сверху (игрок падает на платформу)
        if (this.velocityY > 0 && playerBottom > platformTop && playerTop < platformTop) {
            this.y = platform.y - this.height + 5; // +5 из-за хитбокса
            this.velocityY = 0;
            this.isOnGround = true;
            this.jumpAnimationFrame = 0;
        }
        // Коллизия снизу (игрок ударяется головой)
        else if (this.velocityY < 0 && playerTop < platformBottom && playerBottom > platformBottom) {
            this.y = platform.y + platform.height - 5;
            this.velocityY = 0;
        }
        // Коллизия с боков
        else if (this.velocityX !== 0) {
            if (this.hitbox.x + this.hitbox.width > platform.x && this.hitbox.x < platform.x) {
                this.x = platform.x - this.width + 5;
                this.velocityX = 0;
            } else if (this.hitbox.x < platform.x + platform.width && this.hitbox.x + this.hitbox.width > platform.x + platform.width) {
                this.x = platform.x + platform.width - 5;
                this.velocityX = 0;
            }
        }
    }

    reset(x, y) {
        this.x = x;
        this.y = y;
        this.velocityX = 0;
        this.velocityY = 0;
        this.isOnGround = false;
        this.walkAnimationFrame = 0;
        this.jumpAnimationFrame = 0;
        this.makeInvulnerable(60);
        
        // Обновление хитбокса
        this.hitbox.x = x + 5;
        this.hitbox.y = y + 5;
    }

    makeInvulnerable(duration) {
        this.invulnerable = true;
        this.invulnerableTimer = duration;
    }
}
