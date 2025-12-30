const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const playBtn = document.getElementById('playBtn');
const cashoutBtn = document.getElementById('cashoutBtn');
const gameMessage = document.getElementById('gameMessage');

let currentBet = 1;
let ball, ring, multiplier, isPlaying = false;
let isEscaped = false;
let animationId;

// Настройка ставки
window.setBet = (amount) => {
    currentBet = amount;
    document.querySelectorAll('.bet-btn').forEach(btn => {
        btn.classList.toggle('active', parseInt(btn.innerText) === amount);
    });
};

function initParams() {
    // Скорость уменьшена для плавности (было 3.5/2.5 стало 2.2/1.5)
    ball = { x: 175, y: 150, vx: 2.2, vy: 1.5, radius: 8 };
    ring = { radius: 100, gapAngle: 0.25, rotation: Math.random() * Math.PI, speed: 0.03 };
    multiplier = 1.0;
    isEscaped = false;
    updateMultiplierUI();
}

function updateMultiplierUI() {
    const display = document.querySelector('.multiplier-text') || document.getElementById('multiplier');
    if (display) display.innerText = multiplier.toFixed(2) + 'x';
}

function draw() {
    if (!isPlaying) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const cx = canvas.width / 2;
    const cy = 180;

    // Отрисовка зон
    const zoneH = 40;
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = '#00ff00'; ctx.fillRect(0, canvas.height - zoneH, canvas.width/2, zoneH);
    ctx.fillStyle = '#ff0000'; ctx.fillRect(canvas.width/2, canvas.height - zoneH, canvas.width/2, zoneH);
    ctx.globalAlpha = 1.0;

    // Отрисовка кольца
    ctx.beginPath();
    ctx.lineWidth = 10;
    ctx.strokeStyle = '#ff69b4';
    ctx.arc(cx, cy, ring.radius, ring.rotation + ring.gapAngle, ring.rotation - ring.gapAngle + Math.PI * 2);
    ctx.stroke();

    // Движение
    ball.x += ball.vx;
    ball.y += ball.vy;

    // Рандомное смещение в сторону КРАСНОГО (когда мяч вылетел)
    if (isEscaped && ball.y > cy) {
        // Мягко подталкиваем вправо (к красной зоне)
        ball.vx += 0.02; 
    }

    // Стенки экрана
    if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) ball.vx *= -1;
    if (ball.y - ball.radius < 0) ball.vy *= -1;

    // Проверка падения в зоны
    if (ball.y + ball.radius > canvas.height - zoneH) {
        ball.x < canvas.width / 2 ? endGame(true) : endGame(false);
        return;
    }

    // Физика кольца
    const dx = ball.x - cx;
    const dy = ball.y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (!isEscaped && dist + ball.radius >= ring.radius) {
        let angle = Math.atan2(dy, dx);
        if (angle < 0) angle += Math.PI * 2;
        let normRot = ring.rotation % (Math.PI * 2);
        if (normRot < 0) normRot += Math.PI * 2;

        const diff = Math.abs(angle - normRot);
        if (diff < ring.gapAngle || diff > (Math.PI * 2 - ring.gapAngle)) {
            isEscaped = true; // Вылет
        } else {
            // Отскок
            const nx = dx / dist;
            const ny = dy / dist;
            const dot = ball.vx * nx + ball.vy * ny;
            ball.vx = (ball.vx - 2 * dot * nx) * 0.99; // Небольшое замедление при ударе
            ball.vy = (ball.vy - 2 * dot * ny) * 0.99;
            
            multiplier += 0.15;
            updateMultiplierUI();
        }
    }

    // Шарик
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = isEscaped ? '#ffcc00' : '#00ff88';
    ctx.fill();

    ring.rotation += ring.speed;
    animationId = requestAnimationFrame(draw);
}

function startGame() {
    initParams();
    isPlaying = true;
    playBtn.classList.add('hidden');
    cashoutBtn.classList.remove('hidden');
    gameMessage.classList.add('hidden');
    draw();
}

function endGame(isWin) {
    isPlaying = false;
    cancelAnimationFrame(animationId);
    
    if (isWin) {
        const winAmount = (currentBet * multiplier).toFixed(2);
        showGameMessage(`ВЫИГРЫШ!\n+${winAmount} TON`, "#00ff88");
    } else {
        showGameMessage(`ПРОИГРЫШ\n-${currentBet} TON`, "#ff4444");
        multiplier = 1.0;
        updateMultiplierUI();
    }
    
    playBtn.classList.remove('hidden');
    cashoutBtn.classList.add('hidden');
}

function showGameMessage(text, color) {
    gameMessage.innerText = text;
    gameMessage.style.color = color;
    gameMessage.style.borderColor = color;
    gameMessage.classList.remove('hidden');
}

playBtn.onclick = startGame;
cashoutBtn.onclick = () => endGame(true);
