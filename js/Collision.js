class Collision {
    static checkRectRect(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }

    static checkPointRect(pointX, pointY, rect) {
        return pointX >= rect.x &&
               pointX <= rect.x + rect.width &&
               pointY >= rect.y &&
               pointY <= rect.y + rect.height;
    }

    // Более точная проверка коллизий с учетом проникновения
    static getCollisionDirection(rect1, rect2) {
        const dx = (rect1.x + rect1.width / 2) - (rect2.x + rect2.width / 2);
        const dy = (rect1.y + rect1.height / 2) - (rect2.y + rect2.height / 2);
        const width = (rect1.width + rect2.width) / 2;
        const height = (rect1.height + rect2.height) / 2;
        const crossWidth = width * dy;
        const crossHeight = height * dx;
        
        if (Math.abs(dx) <= width && Math.abs(dy) <= height) {
            if (crossWidth > crossHeight) {
                return crossWidth > -crossHeight ? 'bottom' : 'left';
            } else {
                return crossWidth > -crossHeight ? 'right' : 'top';
            }
        }
        return null;
    }
}