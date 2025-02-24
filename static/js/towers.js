class Tower {
    constructor(gridX, gridY, type) {
        this.gridX = gridX;
        this.gridY = gridY;
        this.type = type;
        this.target = null;
        this.lastShot = 0;

        switch(type) {
            case 'basic':
                this.range = 4;
                this.damage = 15;
                this.fireRate = 800;
                this.color = '#2196F3';
                break;
            case 'sniper':
                this.range = 6;
                this.damage = 40;
                this.fireRate = 1500;
                this.color = '#9C27B0';
                break;
            case 'splash':
                this.range = 3;
                this.damage = 20;
                this.fireRate = 1200;
                this.splashRadius = 1.5;
                this.color = '#FF5722';
                break;
        }
    }

    update(aliens) {
        const now = Date.now();
        if (now - this.lastShot >= this.fireRate) {
            this.findTarget(aliens);
            if (this.target) {
                this.shoot(aliens);
                this.lastShot = now;
            }
        }
    }

    findTarget(aliens) {
        this.target = aliens.find(alien => {
            const dx = (alien.x / 40) - this.gridX;
            const dy = (alien.y / 40) - this.gridY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            return distance <= this.range;
        });
    }

    shoot(aliens) {
        if (this.type === 'splash') {
            const targetX = this.target.x / 40;
            const targetY = this.target.y / 40;

            aliens.forEach(alien => {
                const alienX = alien.x / 40;
                const alienY = alien.y / 40;

                const dx = alienX - targetX;
                const dy = alienY - targetY;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance <= this.splashRadius) {
                    const damageMultiplier = 1 - (distance / this.splashRadius);
                    const actualDamage = Math.floor(this.damage * damageMultiplier);
                    alien.takeDamage(actualDamage);
                }
            });
        } else {
            this.target.takeDamage(this.damage);
        }
    }

    draw(ctx, gridSize) {
        const x = this.gridX * gridSize + gridSize / 2;
        const y = this.gridY * gridSize + gridSize / 2;

        ctx.beginPath();
        ctx.arc(x, y, this.range * gridSize, 0, Math.PI * 2);
        ctx.fillStyle = `${this.color}44`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(x, y, gridSize / 3, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();

        if (this.target) {
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(this.target.x + gridSize/2, this.target.y + gridSize/2);
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 2;
            ctx.stroke();

            if (this.type === 'splash') {
                ctx.beginPath();
                ctx.arc(this.target.x + gridSize/2, this.target.y + gridSize/2, 
                    this.splashRadius * gridSize, 0, Math.PI * 2);
                ctx.strokeStyle = `${this.color}88`;
                ctx.stroke();
            }
        }
    }
}