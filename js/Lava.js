class Lava {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = '#e74c3c';
        this.animationOffset = Math.random() * 100;
    }

    update() {
        this.animationOffset += 0.1;
    }
}