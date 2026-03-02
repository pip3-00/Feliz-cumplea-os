// Elementos del DOM
const inputScreen = document.getElementById('input-screen');
const celebrationScreen = document.getElementById('celebration-screen');
const nameForm = document.getElementById('name-form');
const nameInput = document.getElementById('name-input');
const restartBtn = document.getElementById('restart-btn');
const fireworksCanvas = document.getElementById('fireworks');
const birthdayNameSpan = document.getElementById('birthday-name');

const openGiftBtn = document.getElementById('open-gift-btn');
const stepJoke = document.getElementById('step-joke');
const giftContent = document.getElementById('gift-content');

// Hacer clickeable el botón de abrir regalo
if (openGiftBtn) {
    openGiftBtn.addEventListener('click', () => {
        openGiftBtn.style.display = 'none';
        giftContent.classList.remove('hidden');
        // Mostrar botón de reiniciar cuando se abre el regalo
        restartBtn.classList.add('visible');
    });
}

// Configuración del canvas
let ctx;
let animationId;
let particles = [];
let fireworks = [];
let sequenceTimeout = null;

// Colores estilo hacker (verde, rojo, blanco)
const colors = [
    '#00ff00', // Verde hacker
    '#ff0000', // Rojo alerta
    '#ffffff', // Blanco
    '#00ffff', // Cyan
    '#ffff00', // Amarillo warning
];

// Inicializar canvas
function initCanvas() {
    fireworksCanvas.width = window.innerWidth;
    fireworksCanvas.height = window.innerHeight;
    ctx = fireworksCanvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
}

// Manejar envío del formulario
nameForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = nameInput.value.trim();
    
    if (name) {
        // Mostrar el nombre en el mensaje de feliz cumpleaños
        birthdayNameSpan.textContent = name;
        showCelebration();
    }
});

// Mostrar pantalla de celebración
function showCelebration() {
    // Resetear pasos
    stepJoke.classList.remove('hidden');
    
    inputScreen.classList.remove('active');
    celebrationScreen.classList.add('active');
    
    initCanvas();
    startFireworks();
}

// Reiniciar celebración
restartBtn.addEventListener('click', () => {
    // Limpiar timeouts
    if (sequenceTimeout) {
        clearTimeout(sequenceTimeout);
    }
    
    stopFireworks();
    celebrationScreen.classList.remove('active');
    inputScreen.classList.add('active');
    nameInput.value = '';
    
    // Resetear pasos
    stepJoke.classList.add('hidden');
    
    // Resetear regalo
    if (openGiftBtn && giftContent) {
        openGiftBtn.style.display = 'block';
        giftContent.classList.add('hidden');
    }
});

// Manejar redimensionamiento de ventana
window.addEventListener('resize', () => {
    if (fireworksCanvas) {
        initCanvas();
    }
});

// === CLASE PARTÍCULA (Estilo Pixel) ===
class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.velocity = {
            x: (Math.random() - 0.5) * 12,
            y: (Math.random() - 0.5) * 12
        };
        this.alpha = 1;
        this.friction = 0.94;
        this.gravity = 0.12;
        this.decay = Math.random() * 0.015 + 0.015;
        this.size = Math.random() > 0.5 ? 4 : 5;
    }

    draw() {
        if (this.alpha <= 0) return;
        
        ctx.save();
        ctx.globalAlpha = this.alpha;
        
        // Dibujar cuadrado pixel
        ctx.fillStyle = this.color;
        ctx.fillRect(Math.floor(this.x), Math.floor(this.y), this.size, this.size);
        
        // Brillo
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.alpha * 0.4;
        ctx.fillRect(Math.floor(this.x) - 1, Math.floor(this.y) - 1, this.size + 2, this.size + 2);
        
        ctx.restore();
    }

    update() {
        this.velocity.x *= this.friction;
        this.velocity.y *= this.friction;
        this.velocity.y += this.gravity;
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.alpha -= this.decay;
    }
}

// === CLASE FUEGO ARTIFICIAL ===
class Firework {
    constructor() {
        this.x = Math.random() * fireworksCanvas.width * 0.8 + fireworksCanvas.width * 0.1;
        this.y = fireworksCanvas.height;
        this.targetY = Math.random() * (fireworksCanvas.height * 0.5) + 100;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.velocity = {
            x: 0,
            y: -12 - Math.random() * 6
        };
        this.exploded = false;
        this.trail = [];
        this.width = 3;
    }

    draw() {
        // Dibujar estela
        ctx.save();
        this.trail.forEach((point, i) => {
            const alpha = i / this.trail.length;
            ctx.globalAlpha = alpha * 0.8;
            ctx.fillStyle = this.color;
            const trailSize = 2 + (i / this.trail.length) * 2;
            ctx.fillRect(Math.floor(point.x), Math.floor(point.y), trailSize, trailSize);
        });
        ctx.restore();

        if (!this.exploded) {
            // Dibujar cohete
            ctx.save();
            ctx.fillStyle = this.color;
            ctx.fillRect(Math.floor(this.x), Math.floor(this.y), this.width, this.width + 6);
            
            // Brillo del cohete
            ctx.fillStyle = '#ffffff';
            ctx.globalAlpha = 0.8;
            ctx.fillRect(Math.floor(this.x) + 1, Math.floor(this.y) + 1, 1, 3);
            ctx.restore();
        }
    }

    update() {
        if (!this.exploded) {
            this.trail.push({ x: this.x, y: this.y });
            if (this.trail.length > 10) {
                this.trail.shift();
            }
            
            this.y += this.velocity.y;
            
            if (this.y <= this.targetY) {
                this.explode();
            }
        }
    }

    explode() {
        this.exploded = true;
        const particleCount = 40;
        
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle(this.x, this.y, this.color));
        }
    }
}

// Crear fuego artificial
function createFirework() {
    fireworks.push(new Firework());
}

// Animación principal
function animate() {
    // Fondo negro
    ctx.fillStyle = 'rgba(0, 0, 0, 1)';
    ctx.fillRect(0, 0, fireworksCanvas.width, fireworksCanvas.height);

    // Actualizar y dibujar fireworks
    for (let i = fireworks.length - 1; i >= 0; i--) {
        const firework = fireworks[i];
        firework.update();
        firework.draw();
        
        if (firework.exploded) {
            fireworks.splice(i, 1);
        }
    }

    // Actualizar y dibujar partículas
    for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];
        particle.update();
        particle.draw();
        
        if (particle.alpha <= 0) {
            particles.splice(i, 1);
        }
    }

    animationId = requestAnimationFrame(animate);
}

// Iniciar fuegos artificiales
function startFireworks() {
    let fireworkInterval;
    
    // Crear fuegos cada 500ms
    fireworkInterval = setInterval(() => {
        if (celebrationScreen.classList.contains('active')) {
            createFirework();
            if (Math.random() > 0.6) {
                setTimeout(createFirework, 100);
            }
        }
    }, 500);

    animate();

    restartBtn.addEventListener('click', () => {
        clearInterval(fireworkInterval);
    }, { once: true });
}

// Detener fuegos artificiales
function stopFireworks() {
    cancelAnimationFrame(animationId);
    particles = [];
    fireworks = [];
    if (ctx) {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, fireworksCanvas.width, fireworksCanvas.height);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // El canvas se inicializa cuando se muestra la pantalla de celebración
});

