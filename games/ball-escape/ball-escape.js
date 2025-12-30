const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const multText = document.getElementById('multiplier');
const playBtn = document.getElementById('playBtn');
const cashoutBtn = document.getElementById('cashoutBtn');

// Настройки игры
let ball = { x: 200, y: 200, vx: 2, vy: 2, radius: 8 };
let ring = { radius: 120, gapAngle: 0.6, rotation: 0, speed: 0.03 };
let multiplier = 1.0;
let isPlaying = false;

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // 1. Рисуем кольцо с дыркой
    ctx.beginPath();
    ctx.lineWidth = 10;
    ctx.strokeStyle = '#ff00cc';
    // Рисуем дугу (всё кольцо минус дырка)
    ctx.arc(centerX, centerY, ring.radius, ring.rotation + ring.gapAngle, ring.rotation - ring.gapAngle + Math.PI * 2);
    ctx.stroke();

    if (isPlaying) {
        updatePhysics(centerX, centerY);
        // 2. Рисуем шарик
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#00f2ff';
        ctx.fill();
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#00f2ff';

        ring.rotation += ring.speed;
        requestAnimationFrame(draw);
    }
}

function updatePhysics(cx, cy) {
    ball.x += ball.vx;
    ball.y += ball.vy;

    const dx = ball.x - cx;
    const dy = ball.y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Проверка столкновения с границей кольца
    if (dist + ball.radius >= ring.radius) {
        // Вычисляем угол шарика относительно центра
        let angle = Math.atan2(dy, dx);
        if (angle < 0) angle += Math.PI * 2;

        // Текущее положение дырки (нормализованный угол)
        let normRotation = ring.rotation % (Math.PI * 2);
        if (normRotation < 0) normRotation += Math.PI * 2;

        // Проверка: попал ли шарик в дырку
        const diff = Math.abs(angle - normRotation);
        if (diff < ring.gapAngle || diff > (Math.PI * 2 - ring.gapAngle)) {
            gameOver();
        } else {
            // Отскок
            const normalX = dx / dist;
            const normalY = dy / dist;
            const dot = ball.vx * normalX + ball.vy * normalY;
            
            ball.vx -= 2 * dot * normalX;
            ball.vy -= 2 * dot * normalY;

            // Чуть-чуть выталкиваем шарик внутрь, чтобы не застрял
            ball.x = cx + (ring.radius - ball.radius - 2) * Math.cos(angle);
            ball.y = cy + (ring.radius - ball.radius - 2) * Math.sin(angle);

            // Увеличиваем множитель за удар
            multiplier += 0.15;
            multText.innerText = multiplier.toFixed(2) + 'x';
        }
    }
}

function startGame() {
    isPlaying = true;
    multiplier = 1.0;
    ball = { x: 200, y: 200, vx: 3, vy: 2, radius: 8 };
    playBtn.classList.add('hidden');
    cashoutBtn.classList.remove('hidden');
    draw();
}

function gameOver() {
    isPlaying = false;
    alert("Проигрыш! Шарик вылетел.");
    resetUI();
}

function resetUI() {
    playBtn.classList.remove('hidden');
    cashoutBtn.classList.add('hidden');
    multText.innerText = '1.00x';
}

playBtn.addEventListener('click', startGame);
cashoutBtn.addEventListener('click', () => {
    isPlaying = false;
    alert(`Выигрыш: ${multiplier.toFixed(2)}x`);
    resetUI();
});

draw(); // Первый запуск отрисовки
