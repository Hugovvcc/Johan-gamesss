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

// НОВОЕ: Логика выбора ставки кнопками
let selectedBet = 1; // По умолчанию 1 TON
const betButtons = document.querySelectorAll('.bet-btn');

betButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Сбрасываем стиль у всех кнопок
        betButtons.forEach(b => b.style.background = 'none');
        // Подсвечиваем выбранную
        button.style.background = 'rgba(0,255,157,0.4)';
        // Сохраняем значение
        selectedBet = parseFloat(button.getAttribute('data-amount'));
    });
});

const CONFIG = {
    centerX: rect.width / 2,
    centerY: 260,
    radius: 140,
    ballRadius: 10,
    gapSize: 0.65, 
    gravity: 0.35,        
    rotationSpeed: 0.02,
    bounceDamping: 1.0,   
    maxSpeed: 8,          
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
    x: CONFIG.centerX, y: CONFIG.centerY,
    vx: 0, vy: 0,
    history: []
};

function initGame() {
    // Используем значение из выбранной кнопки
    const betValue = selectedBet; 

    if (typeof window.gameAPI !== 'undefined') {
        const currentBal = window.gameAPI.getBalance();
        if (betValue > currentBal) {
            alert("Недостаточно средств!");
            return;
        }
        window.gameAPI.updateBalance(-betValue);
    }

    state.currentBet = betValue;
    state.multiplier = 1.00;
    state.running = true;
    state.falling = false;
    state.finished = false;
    state.rotation = 0;
    state.particles = [];
    
    multEl.textContent = "1.00";
    statusEl.className = "status hidden";
    statusEl.classList.remove("win", "lose");
    btn.style.display = "none";

    const angle = Math.random() * Math.PI * 2;
    const speed = 6;
    
    ball.x = CONFIG.centerX;
    ball.y = CONFIG.centerY;
    ball.vx = Math.cos(angle) * speed;
    ball.vy = Math.sin(angle) * speed;
    ball.history = [];
}

// ... остальной код (updatePhysics, finishGame, draw-функции) остается без изменений ...

function updatePhysics() {
    if (!state.running) return;
    state.rotation += CONFIG.rotationSpeed;
    if (state.falling) {
        ball.vy += CONFIG.gravity;
        ball.x += ball.vx;
        ball.y += ball.vy;
        if (ball.x < 10 || ball.x > rect.width - 10) ball.vx *= -0.5;
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
            ball.vx += 1.8; // Твоя подкрутка в сторону LOSE
            ball.y += 5; 
        } else {
            const nx = dx / dist;
            const ny = dy / dist;
            const dot = ball.vx * nx + ball.vy * ny;
            ball.vx = (ball.vx - 2 * dot * nx) * CONFIG.bounceDamping;
            ball.vy = (ball.vy - 2 * dot * ny) * CONFIG.bounceDamping;
            state.multiplier += 0.01;
            multEl.textContent = state.multiplier.toFixed(2);
            ball.x = CONFIG.centerX + nx * (CONFIG.radius - CONFIG.ballRadius - 1);
            ball.y = CONFIG.centerY + ny * (CONFIG.radius - CONFIG.ballRadius - 1);
        }
    }
}

function finishGame() {
    state.running = false;
    state.finished = true;
    const isWin = ball.x < rect.width / 2;
    statusEl.classList.remove("hidden");
    if (isWin) {
        const winAmount = state.currentBet * state.multiplier;
        if (typeof window.gameAPI !== 'undefined') window.gameAPI.updateBalance(winAmount);
        statusEl.textContent = `YOU WON ${winAmount.toFixed(1)} TON`;
        statusEl.classList.add("win");
    } else {
        statusEl.textContent = "LOSS";
        statusEl.classList.add("lose");
    }
    btn.textContent = "PLAY AGAIN";
    btn.style.display = "block";
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

function loop() {
    ctx.clearRect(0, 0, rect.width, rect.height);
    drawZones(); drawTrack(); drawBall();
    updatePhysics();
    requestAnimationFrame(loop);
}

btn.onclick = initGame;
loop();
