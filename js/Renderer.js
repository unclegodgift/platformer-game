class Renderer {
    constructor(ctx, width, height) {
        this.ctx = ctx;
        this.width = width;
        this.height = height;
    }

    render(game) {
        // Очистка canvas
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Рендер фона
        this.renderBackground(game.level);
        
        // Рендер платформ
        game.platforms.forEach(platform => this.renderPlatform(platform));
        
        // Рендер шипов
        game.spikes.forEach(spike => this.renderSpike(spike));
        
        // Рендер лавы
        game.lava.forEach(lava => this.renderLava(lava));
        
        // Рендер монет
        game.coins.forEach(coin => this.renderCoin(coin));
        
        // Рендер цели
        this.renderGoal(game.goal);
        
        // Рендер игрока
        this.renderPlayer(game.player);
        
        // Рендер UI
        this.renderUI(game);
        
        // Рендер сообщений
        this.renderMessages(game);
    }

    renderBackground(level) {
        // Разные фоны для разных уровней
        const gradients = [
            ['#87CEEB', '#98FB98'], // Уровень 1 - небо/трава
            ['#4682B4', '#32CD32'], // Уровень 2 - океан/зелень
            ['#2F4F4F', '#8FBC8F'], // Уровень 3 - темный/светлый лес
            ['#4B0082', '#FF4500']  // Уровень 4 - фиолетовый/оранжевый
        ];
        
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
        const colors = gradients[(level - 1) % gradients.length];
        gradient.addColorStop(0, colors[0]);
        gradient.addColorStop(1, colors[1]);
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Облака
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.drawCloud(100, 50, 60, 30);
        this.drawCloud(300, 80, 80, 35);
        this.drawCloud(600, 60, 70, 32);
    }

    drawCloud(x, y, width, height) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, height * 0.5, 0, Math.PI * 2);
        this.ctx.arc(x + width * 0.3, y - height * 0.1, height * 0.4, 0, Math.PI * 2);
        this.ctx.arc(x + width * 0.6, y, height * 0.5, 0, Math.PI * 2);
        this.ctx.closePath();
        this.ctx.fill();
    }

    renderPlatform(platform) {
        this.ctx.fillStyle = platform.color;
        this.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        
        // Текстура платформы
        this.ctx.strokeStyle = '#27ae60';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);
    }

    renderSpike(spike) {
        this.ctx.fillStyle = spike.color;
        
        // Рисуем треугольные шипы
        const spikeCount = Math.ceil(spike.width / 20);
        const spikeWidth = spike.width / spikeCount;
        
        for (let i = 0; i < spikeCount; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(spike.x + i * spikeWidth, spike.y + spike.height);
            this.ctx.lineTo(spike.x + (i + 0.5) * spikeWidth, spike.y);
            this.ctx.lineTo(spike.x + (i + 1) * spikeWidth, spike.y + spike.height);
            this.ctx.closePath();
            this.ctx.fill();
        }
    }

    renderLava(lava) {
        // Анимированная лава
        const time = Date.now() * 0.002 + lava.animationOffset;
        const wave = Math.sin(time) * 5;
        
        this.ctx.fillStyle = '#e74c3c';
        this.ctx.fillRect(lava.x, lava.y + wave, lava.width, lava.height - wave);
        
        // Эффект пузырей
        this.ctx.fillStyle = '#ff6b6b';
        for (let i = 0; i < 3; i++) {
            const bubbleX = lava.x + Math.sin(time + i * 2) * 10 + i * 30;
            const bubbleY = lava.y + Math.cos(time + i) * 5;
            const bubbleSize = Math.sin(time + i) * 2 + 3;
            
            this.ctx.beginPath();
            this.ctx.arc(bubbleX, bubbleY, bubbleSize, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    renderPlayer(player) {
        if (player.invulnerable && Math.floor(player.invulnerableTimer / 3) % 2 === 0) {
            return; // Мигание при неуязвимости
        }

        const ctx = this.ctx;
        const x = player.x;
        const y = player.y;
        const width = player.width;
        const height = player.height;
        
        ctx.save();
        
        // Отражение спрайта при движении влево
        if (!player.facingRight) {
            ctx.scale(-1, 1);
            ctx.translate(-width - 2 * x, 0);
        }

        // Основной цвет тела
        const bodyColor = player.color;
        const darkColor = this.darkenColor(bodyColor, 0.3);
        const lightColor = this.lightenColor(bodyColor, 0.2);

        if (player.isOnGround) {
            if (player.isMovingLeft || player.isMovingRight) {
                this.drawWalkingPlayer(x, y, width, height, bodyColor, darkColor, lightColor, player.walkAnimationFrame);
            } else {
                this.drawIdlePlayer(x, y, width, height, bodyColor, darkColor, lightColor);
            }
        } else {
            this.drawJumpingPlayer(x, y, width, height, bodyColor, darkColor, lightColor, player.jumpAnimationFrame);
        }

        ctx.restore();
        
        // Отладочная отрисовка хитбокса (можно убрать)
        // this.drawHitbox(player.hitbox);
    }

    drawHitbox(hitbox) {
        this.ctx.strokeStyle = 'red';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(hitbox.x, hitbox.y, hitbox.width, hitbox.height);
    }

    drawIdlePlayer(x, y, width, height, bodyColor, darkColor, lightColor) {
        const ctx = this.ctx;
        const pixelSize = 5; // Размер "пикселя" для pixel art стиля
        
        // Тело (основной прямоугольник)
        ctx.fillStyle = bodyColor;
        ctx.fillRect(x + pixelSize, y, width - 2 * pixelSize, height);
        
        // Голова
        ctx.fillStyle = lightColor;
        ctx.fillRect(x + pixelSize * 2, y + pixelSize, width - 4 * pixelSize, pixelSize * 3);
        
        // Глаза
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(x + pixelSize * 3, y + pixelSize * 2, pixelSize, pixelSize);
        ctx.fillRect(x + width - pixelSize * 4, y + pixelSize * 2, pixelSize, pixelSize);
        
        // Руки
        ctx.fillStyle = darkColor;
        ctx.fillRect(x, y + pixelSize * 3, pixelSize, pixelSize * 3);
        ctx.fillRect(x + width - pixelSize, y + pixelSize * 3, pixelSize, pixelSize * 3);
        
        // Ноги
        ctx.fillStyle = darkColor;
        ctx.fillRect(x + pixelSize * 2, y + height - pixelSize * 2, pixelSize * 2, pixelSize * 2);
        ctx.fillRect(x + width - pixelSize * 4, y + height - pixelSize * 2, pixelSize * 2, pixelSize * 2);
        
        // Улыбка
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(x + pixelSize * 4, y + pixelSize * 4, pixelSize * 2, pixelSize);
    }

    drawWalkingPlayer(x, y, width, height, bodyColor, darkColor, lightColor, frame) {
        const ctx = this.ctx;
        const pixelSize = 5;
        const walkOffset = Math.sin(frame * Math.PI) * 2; // Анимация ходьбы
        
        // Тело
        ctx.fillStyle = bodyColor;
        ctx.fillRect(x + pixelSize, y, width - 2 * pixelSize, height);
        
        // Голова
        ctx.fillStyle = lightColor;
        ctx.fillRect(x + pixelSize * 2, y + pixelSize, width - 4 * pixelSize, pixelSize * 3);
        
        // Глаза
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(x + pixelSize * 3, y + pixelSize * 2, pixelSize, pixelSize);
        ctx.fillRect(x + width - pixelSize * 4, y + pixelSize * 2, pixelSize, pixelSize);
        
        // Руки (анимированные)
        ctx.fillStyle = darkColor;
        ctx.fillRect(x, y + pixelSize * 3 + walkOffset, pixelSize, pixelSize * 3);
        ctx.fillRect(x + width - pixelSize, y + pixelSize * 3 - walkOffset, pixelSize, pixelSize * 3);
        
        // Ноги (анимированные)
        ctx.fillStyle = darkColor;
        ctx.fillRect(x + pixelSize * 2, y + height - pixelSize * 2 + walkOffset, pixelSize * 2, pixelSize * 2);
        ctx.fillRect(x + width - pixelSize * 4, y + height - pixelSize * 2 - walkOffset, pixelSize * 2, pixelSize * 2);
        
        // Улыбка
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(x + pixelSize * 4, y + pixelSize * 4, pixelSize * 2, pixelSize);
    }

    drawJumpingPlayer(x, y, width, height, bodyColor, darkColor, lightColor, frame) {
        const ctx = this.ctx;
        const pixelSize = 5;
        const jumpStretch = Math.min(frame * 0.5, 1.5); // Растяжение при прыжке
        
        // Тело (немного растянутое)
        ctx.fillStyle = bodyColor;
        ctx.fillRect(x + pixelSize, y - jumpStretch, width - 2 * pixelSize, height + jumpStretch);
        
        // Голова
        ctx.fillStyle = lightColor;
        ctx.fillRect(x + pixelSize * 2, y + pixelSize - jumpStretch, width - 4 * pixelSize, pixelSize * 3);
        
        // Глаза (широко открытые)
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(x + pixelSize * 3, y + pixelSize * 2 - jumpStretch, pixelSize, pixelSize);
        ctx.fillRect(x + width - pixelSize * 4, y + pixelSize * 2 - jumpStretch, pixelSize, pixelSize);
        
        // Руки (подняты)
        ctx.fillStyle = darkColor;
        ctx.fillRect(x, y + pixelSize * 2 - jumpStretch, pixelSize, pixelSize * 3);
        ctx.fillRect(x + width - pixelSize, y + pixelSize * 2 - jumpStretch, pixelSize, pixelSize * 3);
        
        // Ноги (сжаты)
        ctx.fillStyle = darkColor;
        ctx.fillRect(x + pixelSize * 2, y + height - pixelSize, pixelSize * 2, pixelSize * 2);
        ctx.fillRect(x + width - pixelSize * 4, y + height - pixelSize, pixelSize * 2, pixelSize * 2);
        
        // Рот (открыт от удивления)
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(x + pixelSize * 4, y + pixelSize * 4 - jumpStretch, pixelSize * 2, pixelSize);
    }

    darkenColor(color, amount) {
        // Упрощенное затемнение цвета для pixel art
        const colors = {
            '#e74c3c': '#c0392b', // Красный
            '#3498db': '#2980b9', // Синий
            '#2ecc71': '#27ae60', // Зеленый
            '#f1c40f': '#f39c12'  // Желтый
        };
        return colors[color] || color;
    }

    lightenColor(color, amount) {
        // Упрощенное осветление цвета для pixel art
        const colors = {
            '#e74c3c': '#ec7063', // Красный
            '#3498db': '#5dade2', // Синий
            '#2ecc71': '#58d68d', // Зеленый
            '#f1c40f': '#f7dc6f'  // Желтый
        };
        return colors[color] || color;
    }

    renderCoin(coin) {
        if (coin.collected) return;
        
        this.ctx.fillStyle = '#f1c40f';
        this.ctx.beginPath();
        this.ctx.arc(coin.x + coin.width / 2, coin.y + coin.height / 2, coin.width / 2, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.strokeStyle = '#f39c12';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // Блики на монете
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.beginPath();
        this.ctx.arc(coin.x + coin.width / 3, coin.y + coin.height / 3, coin.width / 6, 0, Math.PI * 2);
        this.ctx.fill();
    }

    renderGoal(goal) {
        // Флаг цели
        this.ctx.fillStyle = '#9b59b6';
        this.ctx.fillRect(goal.x, goal.y, 5, goal.height);
        
        this.ctx.fillStyle = '#8e44ad';
        this.ctx.beginPath();
        this.ctx.moveTo(goal.x + 5, goal.y);
        this.ctx.lineTo(goal.x + 5, goal.y + 15);
        this.ctx.lineTo(goal.x + 25, goal.y + 7.5);
        this.ctx.closePath();
        this.ctx.fill();
    }

    renderUI(game) {
        const ctx = this.ctx;
        
        // Стилизованный UI панель
        ctx.save();
        
        // Фон панели
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.roundRect = function(x, y, width, height, radius) {
            this.beginPath();
            this.moveTo(x + radius, y);
            this.lineTo(x + width - radius, y);
            this.quadraticCurveTo(x + width, y, x + width, y + radius);
            this.lineTo(x + width, y + height - radius);
            this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
            this.lineTo(x + radius, y + height);
            this.quadraticCurveTo(x, y + height, x, y + height - radius);
            this.lineTo(x, y + radius);
            this.quadraticCurveTo(x, y, x + radius, y);
            this.closePath();
            return this;
        };
        
        ctx.roundRect(15, 15, 250, 100, 15).fill();
        
        // Текст статистики
        ctx.fillStyle = 'white';
        ctx.font = '600 16px "Segoe UI", sans-serif';
        ctx.textAlign = 'left';
        
        // Очки
        ctx.fillStyle = '#feca57';
        ctx.font = '700 20px "Segoe UI", sans-serif';
        ctx.fillText('ОЧКИ', 35, 45);
        ctx.fillStyle = 'white';
        ctx.fillText(game.score.toString(), 35, 70);
        
        // Уровень
        ctx.fillStyle = '#54a0ff';
        ctx.fillText('УРОВЕНЬ', 125, 45);
        ctx.fillStyle = 'white';
        ctx.fillText(game.level.toString(), 125, 70);
        
        // Жизни
        ctx.fillStyle = '#ff6b6b';
        ctx.fillText('ЖИЗНИ', 215, 45);
        ctx.fillStyle = 'white';
        ctx.fillText(game.lives.toString(), 215, 70);
        
        // Прогресс монет в игре
        const collectedCoins = game.coins.filter(coin => coin.collected).length;
        const totalCoins = game.coins.length;
        
        if (totalCoins > 0) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.roundRect(15, this.height - 40, 200, 20, 10).fill();
            
            ctx.fillStyle = '#feca57';
            const progressWidth = (collectedCoins / totalCoins) * 200;
            ctx.roundRect(15, this.height - 40, progressWidth, 20, 10).fill();
            
            ctx.fillStyle = 'white';
            ctx.font = '600 12px "Segoe UI", sans-serif';
            ctx.fillText(`Монеты: ${collectedCoins}/${totalCoins}`, 25, this.height - 25);
        }
        
        ctx.restore();
        
        // Сообщения о паузе и завершении уровня
        this.renderMessages(game);
    }

    renderMessages(game) {
        if (game.isPaused) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            this.ctx.fillRect(0, 0, this.width, this.height);
            
            this.ctx.fillStyle = 'white';
            this.ctx.font = '48px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('ПАУЗА', this.width / 2, this.height / 2);
            this.ctx.textAlign = 'left';
        }
        
        if (game.levelCompleted) {
            this.ctx.fillStyle = 'rgba(46, 204, 113, 0.9)';
            this.ctx.fillRect(0, 0, this.width, this.height);
            
            this.ctx.fillStyle = 'white';
            this.ctx.font = '48px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('УРОВЕНЬ ПРОЙДЕН!', this.width / 2, this.height / 2);
            this.ctx.font = '24px Arial';
            this.ctx.fillText('Переход на следующий уровень...', this.width / 2, this.height / 2 + 50);
            this.ctx.textAlign = 'left';
        }
        
        if (game.isGameOver && game.lives <= 0) {
            this.ctx.fillStyle = 'rgba(231, 76, 60, 0.9)';
            this.ctx.fillRect(0, 0, this.width, this.height);
            
            this.ctx.fillStyle = 'white';
            this.ctx.font = '48px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('ИГРА ОКОНЧЕНА', this.width / 2, this.height / 2 - 50);
            this.ctx.font = '24px Arial';
            this.ctx.fillText(`Финальный счет: ${game.score}`, this.width / 2, this.height / 2);
            this.ctx.fillText('Нажмите "Рестарт" для новой игры', this.width / 2, this.height / 2 + 50);
            this.ctx.textAlign = 'left';
        }
        
        if (game.isGameOver && game.level > game.levels.length) {
            this.ctx.fillStyle = 'rgba(241, 196, 15, 0.9)';
            this.ctx.fillRect(0, 0, this.width, this.height);
            
            this.ctx.fillStyle = 'white';
            this.ctx.font = '48px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('ПОБЕДА!', this.width / 2, this.height / 2 - 50);
            this.ctx.font = '24px Arial';
            this.ctx.fillText(`Вы прошли все уровни!`, this.width / 2, this.height / 2);
            this.ctx.fillText(`Финальный счет: ${game.score}`, this.width / 2, this.height / 2 + 50);
            this.ctx.textAlign = 'left';
        }
    }
}