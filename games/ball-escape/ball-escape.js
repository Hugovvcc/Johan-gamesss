const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const playBtn = document.getElementById('playBtn');
const cashoutBtn = document.getElementById('cashoutBtn');

// Пытаемся найти ваш существующий элемент множителя (зеленый 1.00x)
// Если у него нет ID, ищем по иерархии или создаем привязку
const multiplierDisplay = document.querySelector('span[style*="color: rgb(0, 255, 136)"]') || 
                          document.querySelector('.multiplier-text') || 
                          document.getElementById('multiplier');

let ball, ring, multiplier, isPlaying = false;
let animationId;

function initParams() {
    ball = { x: 175, y: 175, vx: 3, vy: 2, radius: 8 };
    ring = { radius: 130, gapAngle: 0.5, rotation: 0, speed: 0.04 };
    multiplier = 1.0;
}

function updateMultiplierUI() {
    if (multiplierDisplay) {
        multiplierDisplay.innerText = multiplier.toFixed(2) + 'x';
    }
}

function draw() {
    if (!isPlaying) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    // Рисуем кольцо
    ctx.beginPath();
    ctx.lineWidth = 8;
    ctx.strokeStyle = '#ff69b4';
    ctx.arc(cx, cy, ring.radius, ring.rotation + ring.gapAngle, ring.rotation - ring.gapAngle + Math.PI * 2);
    ctx.stroke();

    // Физика движения
    ball.x += ball.vx;
    ball.y += ball.vy;

    const dx = ball.x - cx;
    const dy = ball.y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist + ball.radius >= ring.radius) {
        let angle = Math.atan2(dy, dx);
        if (angle < 0) angle += Math.PI * 2;

        let normRot = ring.rotation % (Math.PI * 2);
        if (normRot < 0) normRot += Math.PI * 2;

        const diff = Math.abs(angle - normRot);
        
        if (diff < ring.gapAngle || diff > (Math.PI * 2 - ring.gapAngle)) {
            endGame(false);
            return;
        } else {
            // Отскок
            const nx = dx / dist;
            const ny = dy / dist;
            const dot = ball.vx * nx + ball.vy * ny;
            ball.vx -= 2 * dot * nx;
            ball.vy -= 2 * dot * ny;
            
            // Эффект ускорения и множитель
            multiplier += 0.12;
            updateMultiplierUI();
        }
    }

    // Рисуем шарик
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#00ff88';
    ctx.fill();

    ring.rotation += ring.speed;
    animationId = requestAnimationFrame(draw);
}

function startGame() {
    initParams();
    isPlaying = true;
    playBtn.classList.add('hidden');
    cashoutBtn.classList.remove('hidden');
    updateMultiplierUI();
    draw();
}

function endGame(isWin) {
    isPlaying = false;
    cancelAnimationFrame(animationId);
    alert(isWin ? `Вы забрали ${multiplier.toFixed(2)}x!` : "Шарик вылетел! Ставка сгорела.");
    
    playBtn.classList.remove('hidden');
    cashoutBtn.classList.add('hidden');
    if (!isWin) {
        multiplier = 1.0;
        updateMultiplierUI();
    }
}

playBtn.onclick = startGame;
cashoutBtn.onclick = () => endGame(true);
