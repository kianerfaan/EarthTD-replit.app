class Alien {
    constructor(path, type = 'basic') {
        this.path = path;
        this.pathIndex = 0;
        this.x = path[0].x * 40;
        this.y = path[0].y * 40;
        this.type = type;
        this.reachedEnd = false;

        // Base attributes modified by type and wave
        this.setAttributes(type);
    }

    setAttributes(type) {
        // Base stats with reduced rewards
        const baseStats = {
            basic: {
                speed: 0.5,
                health: 80,
                reward: 8, // Reduced from 15
                color: '#FF5722'
            },
            fast: {
                speed: 1.0,
                health: 50,
                reward: 12, // Reduced from 20
                color: '#FFC107'
            },
            tank: {
                speed: 0.3,
                health: 150,
                reward: 15, // Reduced from 25
                color: '#795548'
            },
            boss: {
                speed: 0.4,
                health: 300,
                reward: 30, // Reduced from 50
                color: '#F44336'
            }
        };

        const stats = baseStats[type];
        this.speed = stats.speed;
        this.health = stats.health;
        this.maxHealth = stats.health;
        this.reward = stats.reward;
        this.color = stats.color;
    }

    update() {
        if (this.pathIndex >= this.path.length - 1) {
            this.reachedEnd = true;
            return;
        }

        const targetX = this.path[this.pathIndex + 1].x * 40;
        const targetY = this.path[this.pathIndex + 1].y * 40;

        const dx = targetX - this.x;
        const dy = targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.speed) {
            this.pathIndex++;
        } else {
            this.x += (dx / distance) * this.speed;
            this.y += (dy / distance) * this.speed;
        }
    }

    takeDamage(amount) {
        this.health -= amount;
    }

    draw(ctx, gridSize) {
        const x = this.x + gridSize/2;
        const y = this.y + gridSize/2;

        // Draw alien with size based on type
        const size = this.type === 'boss' ? gridSize/2 : 
                    this.type === 'tank' ? gridSize/2.5 : gridSize/3;

        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();

        // Draw health bar
        const healthBarWidth = gridSize;
        const healthBarHeight = 5;
        const healthPercentage = this.health / this.maxHealth;

        ctx.fillStyle = '#FF0000';
        ctx.fillRect(
            this.x,
            this.y - 10,
            healthBarWidth,
            healthBarHeight
        );

        ctx.fillStyle = '#00FF00';
        ctx.fillRect(
            this.x,
            this.y - 10,
            healthBarWidth * healthPercentage,
            healthBarHeight
        );
    }
}