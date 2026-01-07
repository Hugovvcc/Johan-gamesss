const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const dpr = window.devicePixelRatio || 1;

// Элементы интерфейса
const multEl = document.getElementById("multValue");
const btn = document.getElementById("startBtn");
const statusEl = document.getElementById("statusMessage");

// Настройка размеров под контейнер
function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    return rect;
}

let rect = resize();

const CONFIG = {
    get centerX() { return canvas.width / (2 * dpr); },
    centerY: 240, // Позиция круга
    radius: 120,
    ballRadius: 10,
    gapSize: 0.7, 
    gravity: 0.25,
    rotationSpeed: 0.02,
    bounceDamping: 1.05, // Немного увеличил для динамики
    maxSpeed: 18
};

let state = {
    running: false,
    falling: false,
    finished: false,
    rotation: 0,
    multiplier: 1.00,
    particles: [],
    currentBet: 1
};

let ball = {
    x: 0,
    y: 0,
    vx: 0,
    vy: 0
};

// Получение ставки из активной кнопки
function getSelectedBet() {
    const activeBtn = document.querySelector('.bet-btn.active');
    return activeBtn ? parseFloat(activeBtn.getAttribute('data-amount')) : 1;
}

function initGame() {
    if (state.running) return;

    rect = resize(); 
    const betAmount = getSelectedBet();

    // Проверка баланса (заглушка 100, если нет API)
    const currentGlobalBalance = typeof window.gameAPI !== 'undefined' ? window.gameAPI.getBalance() : 100;

    if (betAmount > currentGlobalBalance) {
        alert("Недостаточно средств!");
        return;
    }

    if (typeof window.gameAPI !== 'undefined') {
        window.gameAPI.updateBalance(-betAmount);
    }

    state.currentBet = betAmount;
    state.multiplier = 1.00;
    state.running = true;
    state.falling = false;
    state.finished = false;
    state.rotation = 0;
    state.particles = [];
    
    multEl.textContent = "1.00";
    statusEl.classList.add("hidden");
    btn.disabled = true;
    btn.style.opacity = "0.5";

    // Начальный толчок
    const angle = Math.random() * Math.PI * 2;
    const speed = 5;
    ball.x = CONFIG.centerX;
    ball.y = CONFIG.centerY;
    ball.vx = Math.cos(angle) * speed;
    ball.vy = Math.sin(angle) * speed;
}

function updatePhysics() {
    if (!state.running) return;

    state.rotation += CONFIG.rotationSpeed;

    // Частицы
    for (let i = state.particles.length - 1; i >= 0; i--) {
        let p = state.particles[i];
        p.x += p.vx; p.y += p.vy;
        p.life -= 0.03;
        if (p.life <= 0) state.particles.splice(i, 1);
    }

    if (state.falling) {
        ball.vy += CONFIG.gravity;
        ball.x += ball.vx;
        ball.y += ball.vy;

        // Отскок от боковых стенок при падении
        if (ball.x < 15 || ball.x > rect.width - 15) {
            ball.vx *= -0.7;
            ball.x = ball.x < 15 ? 15 : rect.width - 15;
        }
        
        // ПРОВЕРКА ПОПАДАНИЯ В ЗОНЫ (Нижняя граница)
        if (ball.y > rect.height - 50) {
            finishGame();
        }
        return;
    }

    ball.x += ball.vx;
    ball.y += ball.vy;

    const dx = ball.x - CONFIG.centerX;
    const dy = ball.y - CONFIG.centerY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist + CONFIG.ballRadius >= CONFIG.radius) {
        const angleToBall = Math.atan2(dy, dx);
        const normalizedBallAngle = (angleToBall - state.rotation + Math.PI * 10) % (Math.PI * 2);
        const gapCenter = Math.PI / 2; 
        
        if (Math.abs(normalizedBallAngle - gapCenter) < CONFIG.gapSize / 2) {
            state.falling = true;
        } else {
            const nx = dx / dist;
            const ny = dy / dist;
            const dot = ball.vx * nx + ball.vy * ny;
            
            ball.vx = (ball.vx - 2 * dot * nx) * CONFIG.bounceDamping;
            ball.vy = (ball.vy - 2 * dot * ny) * CONFIG.bounceDamping;
            
            ball.x = CONFIG.centerX + nx * (CONFIG.radius - CONFIG.ballRadius - 1);
            ball.y = CONFIG.centerY + ny * (CONFIG.radius - CONFIG.ballRadius - 1);

            state.multiplier += 0.20;
            multEl.textContent = state.multiplier.toFixed(2);
            spawnParticles(ball.x, ball.y, "#ff00ff");
        }
    }
}

function finishGame() {
    state.running = false;
    state.finished = true;
    
    // ЛОГИКА: Левая сторона (0 - 50%) = WIN, Правая (50% - 100%) = LOSE
    const isWin = ball.x < (rect.width / 2);
    
    statusEl.classList.remove("hidden");
    
    if (isWin) {
        const winAmount = state.currentBet * state.multiplier;
        if (typeof window.gameAPI !== 'undefined') {
            window.gameAPI.updateBalance(winAmount);
        }
        statusEl.textContent = `WIN: +${winAmount.toFixed(2)} TON`;
        statusEl.className = "status win"; // Используем класс для цвета
        statusEl.style.color = "#00ff88";
    } else {
        statusEl.textContent = `LOSE: -${state.currentBet.toFixed(2)} TON`;
        statusEl.className = "status lose";
        statusEl.style.color = "#ff3333";
    }

    btn.disabled = false;
    btn.style.opacity = "1";
    btn.textContent = "PLAY AGAIN";
}

function spawnParticles(x, y, color) {
    for (let i = 0; i < 5; i++) {
        state.particles.push({
            x, y,
            vx: (Math.random() - 0.5) * 5,
            vy: (Math.random() - 0.5) * 5,
            life: 1.0,
            color
        });
    }
}

function drawZones() {
    const h = 80; // Высота полей
    const y = rect.height - h;
    
    // Зеленая зона
    ctx.fillStyle = "rgba(0, 255, 136, 0.15)";
    ctx.fillRect(0, y, rect.width / 2, h);
    
    // Красная зона
    ctx.fillStyle = "rgba(255, 51, 51, 0.15)";
    ctx.fillRect(rect.width / 2, y, rect.width / 2, h);

    // Подписи
    ctx.font = "bold 20px Arial";
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(0, 255, 136, 0.5)";
    ctx.fillText("WIN", rect.width / 4, y + 45);
    ctx.fillStyle = "rgba(255, 51, 51, 0.5)";
    ctx.fillText("LOSE", rect.width * 0.75, y + 45);
}

function drawTrack() {
    ctx.save();
    ctx.translate(CONFIG.centerX, CONFIG.centerY);
    ctx.rotate(state.rotation);
    ctx.beginPath();
    ctx.arc(0, 0, CONFIG.radius, Math.PI/2 + CONFIG.gapSize/2, Math.PI/2 - CONFIG.gapSize/2);
    ctx.strokeStyle = "#ff00ff";
    ctx.lineWidth = 10;
    ctx.lineCap = "round";
    ctx.stroke();
    ctx.restore();
}

function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawZones();
    drawTrack();
    
    // Рисуем частицы
    for (let p of state.particles) {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Рисуем шарик
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, CONFIG.ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#00d2ff";
    ctx.shadowBlur = 15;
    ctx.shadowColor = "#00d2ff";
    ctx.fill();
    ctx.shadowBlur = 0;

    updatePhysics();
    requestAnimationFrame(loop);
}

// Переключение кнопок ставок
document.querySelectorAll('.bet-btn').forEach(button => {
    button.addEventListener('click', () => {
        if (state.running) return;
        document.querySelectorAll('.bet-btn').forEach(b => b.classList.remove('active'));
        button.classList.add('active');
    });
});

btn.onclick = initGame;
window.addEventListener('resize', () => { rect = resize(); });
loop();
