const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const dpr = window.devicePixelRatio || 1;

const multEl = document.getElementById("multValue");
const btn = document.getElementById("startBtn");
const statusEl = document.getElementById("statusMessage");

function resize() {
    const r = canvas.parentElement.getBoundingClientRect();
    canvas.width = r.width * dpr;
    canvas.height = r.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return r;
}
let rect = resize();

const CONFIG = {
    get cx() { return canvas.width / (2 * dpr); },
    cy: 240,
    radius: 120,
    ballR: 10,
    gap: 0.7,
    gravity: 0.25,
    rotSpeed: 0.02,
    speed: 5
};

let state = {
    running: false,
    falling: false,
    rotation: 0,
    multiplier: 1,
    bet: 1
};

let ball = { x: 0, y: 0, vx: 0, vy: 0 };

function normalize() {
    const s = Math.hypot(ball.vx, ball.vy);
    if (!s) return;
    ball.vx = ball.vx / s * CONFIG.speed;
    ball.vy = ball.vy / s * CONFIG.speed;
}

function getBet() {
    const b = document.querySelector(".bet-btn.active");
    return b ? +b.dataset.amount : 1;
}

function initGame() {
    if (state.running) return;

    rect = resize();
    state.bet = getBet();
    state.running = true;
    state.falling = false;
    state.rotation = 0;
    state.multiplier = 1;

    multEl.textContent = "1.00";
    statusEl.classList.add("hidden");
    btn.disabled = true;

    const a = Math.random() * Math.PI * 2;
    ball.x = CONFIG.cx;
    ball.y = CONFIG.cy;
    ball.vx = Math.cos(a) * CONFIG.speed;
    ball.vy = Math.sin(a) * CONFIG.speed;
}

function update() {
    if (!state.running) return;

    state.rotation += CONFIG.rotSpeed;

    if (state.falling) {
        ball.vy += CONFIG.gravity;
        ball.x += ball.vx;
        ball.y += ball.vy;

        if (ball.y > rect.height - 50) finish();
        return;
    }

    ball.x += ball.vx;
    ball.y += ball.vy;
    normalize();

    const dx = ball.x - CONFIG.cx;
    const dy = ball.y - CONFIG.cy;
    const dist = Math.hypot(dx, dy);

    if (dist + CONFIG.ballR >= CONFIG.radius) {
        const ang = Math.atan2(dy, dx);
        const a = (ang - state.rotation + Math.PI * 10) % (Math.PI * 2);
        const gapC = Math.PI / 2;

        if (Math.abs(a - gapC) < CONFIG.gap / 2) {
            state.falling = true;
        } else {
            const nx = dx / dist;
            const ny = dy / dist;
            const dot = ball.vx * nx + ball.vy * ny;
            ball.vx -= 2 * dot * nx;
            ball.vy -= 2 * dot * ny;
            normalize();

            ball.x = CONFIG.cx + nx * (CONFIG.radius - CONFIG.ballR - 1);
            ball.y = CONFIG.cy + ny * (CONFIG.radius - CONFIG.ballR - 1);

            state.multiplier += 0.2;
            multEl.textContent = state.multiplier.toFixed(2);
        }
    }
}

function finish() {
    state.running = false;

    const isWin = ball.x < rect.width / 2;

    statusEl.classList.remove("hidden");

    if (isWin) {
        const win = state.bet * state.multiplier;
        window.gameAPI?.updateBalance(win);
        statusEl.textContent = `WIN +${win.toFixed(2)} TON`;
        statusEl.className = "status win";
    } else {
        statusEl.textContent = `LOSE -${state.bet.toFixed(2)} TON`;
        statusEl.className = "status lose";
    }

    btn.disabled = false;
    btn.textContent = "PLAY AGAIN";
}

function drawZones() {
    const h = 80, y = rect.height - h;
    ctx.fillStyle = "rgba(0,255,136,.15)";
    ctx.fillRect(0, y, rect.width / 2, h);
    ctx.fillStyle = "rgba(255,51,51,.15)";
    ctx.fillRect(rect.width / 2, y, rect.width / 2, h);
}

function drawTrack() {
    ctx.save();
    ctx.translate(CONFIG.cx, CONFIG.cy);
    ctx.rotate(state.rotation);
    ctx.beginPath();
    ctx.arc(0, 0, CONFIG.radius,
        Math.PI / 2 + CONFIG.gap / 2,
        Math.PI / 2 - CONFIG.gap / 2
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

    ctx.beginPath();
    ctx.arc(ball.x, ball.y, CONFIG.ballR, 0, Math.PI * 2);
    ctx.fillStyle = "#00d2ff";
    ctx.shadowBlur = 15;
    ctx.shadowColor = "#00d2ff";
    ctx.fill();
    ctx.shadowBlur = 0;

    update();
    requestAnimationFrame(loop);
}

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
