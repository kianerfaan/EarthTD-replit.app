class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 800;
        this.canvas.height = 600;

        this.gridSize = 40;
        this.towers = [];
        this.aliens = []; // Renamed from enemies
        this.gold = 300;
        this.lives = 30;
        this.wave = 1;
        this.isWaveActive = false;

        // Multiple paths for aliens
        this.paths = {
            alaska: [
                {x: 3, y: 0},   // Alaska start
                {x: 3, y: 4},   // Down North America coast
                {x: 4, y: 8},   // South America
                {x: 6, y: 10},  // Around Cape Horn
                {x: 8, y: 12},  // Antarctica curve
                {x: 12, y: 10}, // Indian Ocean
                {x: 15, y: 8},  // Indonesia
                {x: 18, y: 9}   // Australia
            ],
            atlantic: [
                {x: 8, y: 0},   // North Atlantic start
                {x: 8, y: 4},   // Mid-Atlantic
                {x: 10, y: 6},  // Mediterranean entrance
                {x: 12, y: 6},  // Suez Canal
                {x: 14, y: 8},  // Arabian Sea
                {x: 16, y: 8},  // Bay of Bengal
                {x: 18, y: 9}   // Australia
            ],
            antarctica: [
                {x: 6, y: 14},  // Antarctica start
                {x: 8, y: 12},  // Southern Ocean
                {x: 10, y: 10}, // Indian Ocean
                {x: 12, y: 9},  // Indonesian waters
                {x: 15, y: 9},  // Timor Sea
                {x: 18, y: 9}   // Australia
            ]
        };

        this.loadWorldMap();
        this.setupEventListeners();
        this.ui = new UI(this);
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

        requestAnimationFrame(() => this.gameLoop());
    }

    loadWorldMap() {
        this.worldMap = new Image();
        this.worldMap.src = '/static/images/United_Nations_geographical_subregions.png';
    }

    setupEventListeners() {
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        document.getElementById('start-wave').addEventListener('click', () => this.startWave());
    }

    handleClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / this.gridSize);
        const y = Math.floor((e.clientY - rect.top) / this.gridSize);

        if (this.ui.selectedTower && this.canPlaceTower(x, y)) {
            this.placeTower(x, y);
        }
    }

    canPlaceTower(x, y) {
        // Check against all paths
        const isOnAnyPath = Object.values(this.paths).some(path =>
            path.some(point => point.x === x && point.y === y)
        );
        if (isOnAnyPath) return false;

        return !this.towers.some(tower => 
            tower.gridX === x && tower.gridY === y
        );
    }

    placeTower(x, y) {
        const towerCost = this.ui.selectedTower.cost;
        if (this.gold >= towerCost) {
            const tower = new Tower(x, y, this.ui.selectedTower.type);
            this.towers.push(tower);
            this.gold -= towerCost;
            this.ui.updateResources();
        }
    }

    startWave() {
        if (!this.isWaveActive) {
            this.isWaveActive = true;
            this.spawnAliens();
        }
    }

    getAlienType() {
        const wave = this.wave;
        if (wave % 10 === 0) return 'boss';

        const random = Math.random();
        if (wave < 3) return 'basic';
        else if (wave < 5) {
            return random < 0.7 ? 'basic' : 'fast';
        } else if (wave < 8) {
            if (random < 0.5) return 'basic';
            else if (random < 0.8) return 'fast';
            else return 'tank';
        } else {
            if (random < 0.4) return 'basic';
            else if (random < 0.7) return 'fast';
            else if (random < 0.9) return 'tank';
            else return 'boss';
        }
    }

    spawnAliens() {
        let aliensCount = Math.min(this.wave * 4, 40);
        let spawned = 0;

        const spawn = () => {
            if (spawned < aliensCount) {
                const alienType = this.getAlienType();
                // Randomly choose spawn path
                const pathKeys = Object.keys(this.paths);
                const selectedPath = this.paths[pathKeys[Math.floor(Math.random() * pathKeys.length)]];

                const alien = new Alien(selectedPath, alienType);

                // Scale alien stats with wave number
                const waveScaling = 1 + (this.wave - 1) * 0.1;
                alien.health *= waveScaling;
                alien.maxHealth = alien.health;
                alien.reward = Math.floor(alien.reward * waveScaling);

                this.aliens.push(alien);
                spawned++;
                setTimeout(spawn, 1500);
            }
        };

        spawn();
    }

    gameLoop() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.worldMap.complete) {
            this.ctx.globalAlpha = 0.6;
            this.ctx.drawImage(this.worldMap, 0, 0, this.canvas.width, this.canvas.height);
            this.ctx.globalAlpha = 1;
        }

        this.drawGrid();
        this.drawPaths();

        this.towers.forEach(tower => {
            tower.update(this.aliens);
            tower.draw(this.ctx, this.gridSize);
        });

        this.aliens = this.aliens.filter(alien => {
            alien.update();
            alien.draw(this.ctx, this.gridSize);

            if (alien.reachedEnd) {
                this.lives--;
                this.ui.updateResources();
                return false;
            }

            if (alien.health <= 0) {
                this.gold += alien.reward;
                this.ui.updateResources();
                return false;
            }

            return true;
        });

        if (this.isWaveActive && this.aliens.length === 0) {
            this.wave++;
            this.isWaveActive = false;
            this.gold += 50 + Math.floor(this.wave * 5); // Reduced wave completion bonus
            this.ui.updateResources();
        }

        requestAnimationFrame(() => this.gameLoop());
    }

    drawGrid() {
        this.ctx.strokeStyle = '#ddd';
        this.ctx.lineWidth = 1;

        for (let x = 0; x < this.canvas.width; x += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }

        for (let y = 0; y < this.canvas.height; y += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }

    drawPaths() {
        // Path visualization removed to hide paths from players
        // Paths are still used for alien movement but not shown visually
    }
}

window.addEventListener('load', () => {
    new Game();
});