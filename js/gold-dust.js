class GoldDust {
    constructor() {
        this.canvas = document.getElementById('gold-dust');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.resize();

        window.addEventListener('resize', () => this.resize());
        this.initParticles();
        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    initParticles() {
        // Create 250 particles
        for (let i = 0; i < 250; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 2 + 0.5,
                speedY: Math.random() * 0.5 + 0.1,
                speedX: (Math.random() - 0.5) * 0.5,
                opacity: Math.random() * 0.5 + 0.1
            });
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.particles.forEach(p => {
            // Update position
            p.y -= p.speedY;
            p.x += p.speedX;

            // Reset if out of bounds
            if (p.y < 0) {
                p.y = this.canvas.height;
                p.x = Math.random() * this.canvas.width;
            }
            if (p.x < 0) p.x = this.canvas.width;
            if (p.x > this.canvas.width) p.x = 0;

            // Draw
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(212, 175, 55, ${p.opacity})`; // Gold color
            this.ctx.fill();
        });

        requestAnimationFrame(() => this.animate());
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new GoldDust();
});
