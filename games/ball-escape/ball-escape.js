const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const dpr = window.devicePixelRatio || 1;

// UI
const multEl = document.getElementById("multValue");
const btn = document.getElementById("startBtn");
const statusEl = document.getElementById("statusMessage");

// Resize
function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return rect;
}

let rect = resize();

const CONFIG = {
    get centerX() { return canvas.width / (2 * dpr); },
    centerY: 240,
    radius: 120,
    ballRadius: 10,
    gapSize: 0.7,
    gravity: 0.25,
    rotationSpeed: 0.02,
    fixedSpeed: 5 // ❗ ПОСТОЯННАЯ СКОРОСТЬ
};

let state = {
    running: false,
    falling: false,
    rotation: 0,
    multiplier: 1.0,
    particles: [],
    currentBet: 1
};

let ball = { x: 0, y: 0, vx: 0, vy: 0 };

// ===== HELPERS =====
function normalizeBallSpeed() {
    const speed = Math.hypot(ball.vx, ball.vy);
    if (speed === 0) return;
    const k = CONFIG.fixedSpeed / speed;
    ball.vx *= k;
    ball.vy *= k;
}

function getSelectedBet() {
    const btn = document.querySelector(".bet-btn.active");
    return btn ? parseFloat(btn.dataset.amount) : 1;
}

// ===== GAME START =====
function initGame() {
    if (state.running) return;

    rect = resize();
    const bet = getSelectedBet();
    const balance = window.gameAPI ? window.gameAPI.getBalance() : 100;

    if (bet > balance) {
        alert("Недостаточно средств");
        return;
    }

    window.gameAPI?.updateBalance(-bet);

    state.running = true;
    state.falling = false;
    state.rotation = 0;
    state.multiplier = 1.0;
    state.currentBet = bet;
    state.particles = [];

    multEl.textContent = "1.00";
    statusEl.classList.add("hidden");

    btn.disabled = true;
    btn.style.opacity = "0.5";

    const angle = Math.random() * Math.PI * 2;
    ball.x = CONFIG.centerX;
    ball.y = CONFIG.centerY;
    ball.vx = Math.cos(angle) * CONFIG.fixedSpeed;
    ball.vy = Math.sin(angle) * CONFIG.fixedSpeed;
}

// ===== PHYSICS =====
function updatePhysics() {
    if (!state.running) return;

    state.rotation += CONFIG.rotationSpeed;

    // particles
    state.particles = state.particles.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.03;
        return p.life > 0;
    });

    if (state.falling) {
        ball.vy += CONFIG.gravity;
        ball.x += ball.vx;
        ball.y += ball.vy;

        if (ball.x < 15 || ball.x > rect.width - 15) {
            ball.vx *= -1;
        }

        if (ball.y > rect.height - 50) finishGame();
        return;
    }

    ball.x += ball.vx;
    ball.y += ball.vy;
    normalizeBallSpeed();

    const dx = ball.x - CONFIG.centerX;
    const dy = ball.y - CONFIG.centerY;
    const dist = Math.hypot(dx, dy);

    if (dist + CONFIG.ballRadius >= CONFIG.radius) {
        const angle = Math.atan2(dy, dx);
        const normAngle = (angle - state.rotation + Math.PI * 10) % (Math.PI * 2);
        const gapCenter = Math.PI / 2;

        if (Math.abs(normAngle - gapCenter) < CONFIG.gapSize / 2) {
            state.falling = true;
        } else {
            const nx = dx / dist;
            const ny = dy / dist;
            const dot = ball.vx * nx + ball.vy * ny;

            ball.vx -= 2 * dot * nx;
            ball.vy -= 2 * dot * ny;
            normalizeBallSpeed();

            ball.x = CONFIG.centerX + nx * (CONFIG.radius - CONFIG.ballRadius - 1);
            ball.y = CONFIG.centerY + ny * (CONFIG.radius - CONFIG.ballRadius - 1);

            state.multiplier += 0.2;
            multEl.textContent = state.multiplier.toFixed(2);
            spawnParticles(ball.x, ball.y, "#ff00ff");
        }
    }
}

// ===== FINISH =====
function finishGame() {
    state.running = false;

    const isWin = Math.random() < 0.3; // ❗ 30% WIN / 70% LOSE

    statusEl.classList.remove("hidden");

    if (isWin) {
        const win = state.currentBet * state.multiplier;
        window.gameAPI?.updateBalance(win);
        statusEl.textContent = `WIN +${win.toFixed(2)} TON`;
        statusEl.className = "status win";
    } else {
        statusEl.textContent = `LOSE -${state.currentBet.toFixed(2)} TON`;
        statusEl.className = "status lose";
    }

    btn.disabled = false;
    btn.style.opacity = "1";
    btn.textContent = "PLAY AGAIN";
}

// ===== DRAW =====
function spawnParticles(x, y, color) {
    for (let i = 0; i < 5; i++) {
        state.particles.push({
            x, y,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            life: 1,
            color
        });
    }
}

function drawZones() {
    const h = 80;
    const y = rect.height - h;

    ctx.fillStyle = "rgba(0,255,136,0.15)";
    ctx.fillRect(0, y, rect.width / 2, h);

    ctx.fillStyle = "rgba(255,51,51,0.15)";
    ctx.fillRect(rect.width / 2, y, rect.width / 2, h);

    ctx.font = "bold 20px Arial";
    ctx.textAlign = "center";
    ctx.fillStyle = "#00ff88";
    ctx.fillText("WIN", rect.width / 4, y + 45);
    ctx.fillStyle = "#ff3333";
    ctx.fillText("LOSE", rect.width * 0.75, y + 45);
}

function drawTrack() {
    ctx.save();
    ctx.translate(CONFIG.centerX, CONFIG.centerY);
    ctx.rotate(state.rotation);
    ctx.beginPath();
    ctx.arc(0, 0, CONFIG.radius,
        Math.PI / 2 + CONFIG.gapSize / 2,
        Math.PI / 2 - CONFIG.gapSize / 2
    );
    ctx.strokeStyle = "#ff00ff";
    ctx.lineWidth = 10;
    ctx.stroke();
    ctx.restore();
}

function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawZones();
    drawTrack();

    state.particles.forEach(p => {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.globalAlpha = 1;

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

// ===== EVENTS =====
document.querySelectorAll(".bet-btn").forEach(b => {
    b.onclick = () => {
        if (state.running) return;
        document.querySelectorAll(".bet-btn").forEach(x => x.classList.remove("active"));
        b.classList.add("active");
    };
});

btn.onclick = initGame;
window.addEventListener("resize", () => rect = resize());
loop();
