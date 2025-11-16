class InputHandler {
    constructor() {
        this.keys = {};
        this.keyDownCallbacks = [];
        this.keyUpCallbacks = [];
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.addEventListener('keydown', (event) => {
            const key = event.key.toLowerCase();
            this.keys[key] = true;
            
            this.keyDownCallbacks.forEach(callback => callback(key));
        });

        document.addEventListener('keyup', (event) => {
            const key = event.key.toLowerCase();
            this.keys[key] = false;
            
            this.keyUpCallbacks.forEach(callback => callback(key));
        });

        // Предотвращаем прокрутку страницы при использовании пробела
        document.addEventListener('keydown', (event) => {
            if (event.key === ' ') {
                event.preventDefault();
            }
        });
    }

    isKeyPressed(key) {
        return this.keys[key.toLowerCase()] || false;
    }

    onKeyDown(callback) {
        this.keyDownCallbacks.push(callback);
    }

    onKeyUp(callback) {
        this.keyUpCallbacks.push(callback);
    }
}