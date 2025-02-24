class UI {
    constructor(game) {
        this.game = game;
        this.selectedTower = null;
        this.towerTypes = {
            'basic': { cost: 40, type: 'basic' }, // Reduced costs
            'sniper': { cost: 80, type: 'sniper' },
            'splash': { cost: 120, type: 'splash' }
        };

        this.setupTowerButtons();
        this.updateResources();
    }

    setupTowerButtons() {
        const buttons = document.querySelectorAll('.tower-btn');
        buttons.forEach(button => {
            button.addEventListener('click', () => {
                const towerType = button.dataset.tower;
                this.selectedTower = this.towerTypes[towerType];
                
                // Update button states
                buttons.forEach(btn => btn.style.opacity = '1');
                button.style.opacity = '0.7';
            });
        });
    }

    updateResources() {
        document.getElementById('gold').textContent = `Gold: ${this.game.gold}`;
        document.getElementById('wave').textContent = `Wave: ${this.game.wave}`;
        document.getElementById('lives').textContent = `Lives: ${this.game.lives}`;
        
        // Update tower buttons based on available gold
        const buttons = document.querySelectorAll('.tower-btn');
        buttons.forEach(button => {
            const cost = parseInt(button.dataset.cost);
            button.disabled = this.game.gold < cost;
            button.style.opacity = button.disabled ? '0.5' : '1';
        });
    }
}