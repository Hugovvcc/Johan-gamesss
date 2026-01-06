const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const dpr = window.devicePixelRatio || 1;

const rect = canvas.getBoundingClientRect();
canvas.width = rect.width * dpr;
canvas.height = rect.height * dpr;
ctx.scale(dpr, dpr);

const multEl = document.getElementById("multValue");
const btn = document.getElementById("startBtn");
const statusEl = document.getElementById("statusMessage");
const betInput = document.getElementById("mbet"); 
const diffSelect = document.getElementById("mcount");

const CONFIG = {
    centerX: rect.width / 2,
    centerY: 260,
    radius: 140,
    ballRadius: 10,
    gapSize: 0.65, 
    gravity: 0.25,
    rotationSpeed: 0.02,
    bounceDamping: 1.02, 
    maxSpeed: 18,
    trailLength: 12
};

let state = {
    running: false,
    falling: false,
    finished: false,
    rotation: 0,
    multiplier: 1.00,
    particles: [],
    currentBet: 0
};

let ball = {
    x: CONFIG.centerX,
    y: CONFIG.centerY,
    vx: 0,
    vy: 0,
    history: []
};

// Функция инициализации игры
function initGame() {
    if (state.running) return;

    const betAmount = parseFloat(betInput.value);

    // 1. Проверка через ГЛОБАЛЬНЫЙ API баланса
    const currentGlobalBalance = typeof window.gameAPI !== 'undefined' ? window.gameAPI.getBalance() : 100;

    if (isNaN(betAmount) || betAmount < 1 || betAmount > 10) {
        alert("Ставка должна быть от 1 до 10 TON");
        return;
    }

    if (betAmount > currentGlobalBalance) {
        alert("Недостаточно средств на общем балансе!");
        return;
    }

    // 2. Списание ставки через ГЛОБАЛЬНЫЙ API
    if (typeof window.gameAPI !== 'undefined') {
        window.gameAPI.updateBalance(-betAmount);
    }

    state.currentBet = betAmount;

    // Настройка сложности
    const difficulty = parseInt(diffSelect.value) || 5;
    CONFIG.rotationSpeed = 0.005 * difficulty;

    state.multiplier = 1.00;
    state.running = true;
    state.falling = false;
    state.finished = false;
    state.rotation = 0;
    state.particles = [];
    
    multEl.textContent = "1.00";
    statusEl.className = "status hidden";
    btn.style.visibility = "hidden";

    const angle = Math.random() * Math.PI * 2;
    const speed = 7;
    
    ball.x = CONFIG.centerX;
    ball.y = CONFIG.centerY;
    ball.vx = Math.cos(angle) * speed;
    ball.vy = Math.sin(angle) * speed;
    ball.history = [];
}

function updatePhysics() {
    if (!state.running) return;

    state.rotation += CONFIG.rotationSpeed;

    // Частицы
    for (let i = state.particles.length - 1; i >= 0; i--) {
        let p = state.particles[i];
        p.x += p.vx; p.y += p.vy;
        p.life -= 0.05;
        if (p.life <= 0) state.particles.splice(i, 1);
    }

    if (state.falling) {
        ball.vy += CONFIG.gravity;
        ball.x += ball.vx;
        ball.y += ball.vy;
        if (ball.x < 10 || ball.x > rect.width - 10) ball.vx *= -0.6;
        if (ball.y > rect.height - 120 - CONFIG.ballRadius) finishGame();
        return;
    }

    ball.x += ball.vx;
    ball.y += ball.vy;

    const dx = ball.x - CONFIG.centerX;
    const dy = ball.y - CONFIG.centerY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist + CONFIG.ballRadius >= CONFIG.radius) {
        const angleToBall = Math.atan2(dy, dx);
        const normalizedBallAngle = (angleToBall - state.rotation + Math.PI * 4) % (Math.PI * 2);
        const gapCenter = Math.PI / 2;
        
        if (Math.abs(normalizedBallAngle - gapCenter) < CONFIG.gapSize / 2) {
            state.falling = true;
            ball.y += 10; 
        } else {
            const nx = dx / dist;
            const ny = dy / dist;
            const dot = ball.vx * nx + ball.vy * ny;
            ball.vx = (ball.vx - 2 * dot * nx) * CONFIG.bounceDamping;
            ball.vy = (ball.vy - 2 * dot * ny) * CONFIG.bounceDamping;
            ball.x = CONFIG.centerX + nx * (CONFIG.radius - CONFIG.ballRadius - 1);
            ball.y = CONFIG.centerY + ny * (CONFIG.radius - CONFIG.ballRadius - 1);

            // УВЕЛИЧЕНИЕ ИКСОВ ПРИ УДАРЕ
            state.multiplier += 0.20; 
            multEl.textContent = state.multiplier.toFixed(2);
            spawnParticles(ball.x, ball.y, "#00d2ff");
        }
    }
}

function finishGame() {
    state.running = false;
    state.finished = true;
    
    const isWin = ball.x < rect.width / 2;
    statusEl.classList.remove("hidden");
    
    if (isWin) {
        // РАСЧЕТ ВЫИГРЫША: Ставка * Накопленные Иксы
        const winAmount = state.currentBet * state.multiplier;
        
        // Пополнение ГЛОБАЛЬНОГО баланса
        if (typeof window.gameAPI !== 'undefined') {
            window.gameAPI.updateBalance(winAmount);
        }
        
        statusEl.textContent = `WIN: +${winAmount.toFixed(2)} TON`;
        statusEl.style.color = "#00ff88";
    } else {
        statusEl.textContent = `LOSS: -${state.currentBet.toFixed(2)} TON`;
        statusEl.style.color = "#ff3333";
    }

    btn.textContent = "PLAY AGAIN";
    btn.style.visibility = "visible";
}

// Рисование и прочее...
function spawnParticles(x, y, color) {
    for (let i = 0; i < 6; i++) {
        state.particles.push({
            x, y,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            life: 1.0,
            color
        });
    }
}

function drawZones() {
    const h = 120;
    const y = rect.height - h;
    ctx.fillStyle = "rgba(0, 255, 136, 0.1)";
    ctx.fillRect(0, y, rect.width / 2, h);
    ctx.fillStyle = "rgba(255, 51, 51, 0.1)";
    ctx.fillRect(rect.width / 2, y, rect.width / 2, h);
    ctx.font = "bold 24px Arial";
    ctx.textAlign = "center";
    ctx.fillStyle = "#00ff88"; ctx.fillText("WIN", rect.width / 4, y + 60);
    ctx.fillStyle = "#ff3333"; ctx.fillText("LOSE", rect.width * 0.75, y + 60);
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

function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, CONFIG.ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#00d2ff";
    ctx.fill();
}

function drawParticles() {
    for (let p of state.particles) {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;
}

function loop() {
    ctx.clearRect(0, 0, rect.width, rect.height);
    drawZones();
    drawTrack();
    drawParticles();
    drawBall();
    updatePhysics();
    requestAnimationFrame(loop);
}

btn.onclick = initGame;
loop();
