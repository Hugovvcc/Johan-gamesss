// Поиск элементов интерфейса Johan Game
const balanceDisplay = document.querySelector('.balance-container') || document.body; // Подставьте ваш селектор баланса
const multiplierDisplay = document.getElementById('multiplierValue');
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let userBalance = 99.0; // Инициализация (в идеале должна браться из глобального состояния)
let bet = 1;
let isPlaying = false;
let ball, ring, multiplier, escaped;

// Функция для обновления текста баланса на экране
function syncBalanceUI() {
    const el = document.querySelector('div[style*="background: rgba(255, 255, 255, 0.05)"]') || document.body;
    if (el.innerText.includes('Balance')) {
        el.innerText = `Balance: ${userBalance.toFixed(1)} TON`;
    }
}

function init() {
    // Центрируем строго по холсту 360x420
    ball = { x: 180, y: 180, vx: 2.5, vy: 1.8, r: 8 };
    ring = { x: 180, y: 180, r: 100, gap: 0.3, rot: Math.random() * 5, speed: 0.02 };
    multiplier = 1.0;
    escaped = false;
    if (multiplierDisplay) multiplierDisplay.innerText = "1.00x";
}

function draw() {
    if (!isPlaying) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Рисуем зоны внизу
    ctx.fillStyle = 'rgba(0, 255, 136, 0.2)'; ctx.fillRect(0, 380, 180, 40);
    ctx.fillStyle = 'rgba(255, 68, 68, 0.2)'; ctx.fillRect(180, 380, 180, 40);

    // Кольцо
    ctx.beginPath();
    ctx.lineWidth = 12;
    ctx.strokeStyle = '#ff69b4';
    ctx.arc(ring.x, ring.y, ring.r, ring.rot + ring.gap, ring.rot - ring.gap + Math.PI * 2);
    ctx.stroke();

    // Физика шарика
    ball.x += ball.vx;
    ball.y += ball.vy;

    if (escaped) {
        ball.vy += 0.12; // Гравитация
        ball.vx += 0.015; // Легкий наклон вправо к черепу
    }

    // Отскок от краев холста
    if (ball.x + ball.r > canvas.width || ball.x - ball.r < 0) ball.vx *= -1;
    if (ball.y - ball.r < 0) ball.vy *= -1;

    const dx = ball.x - ring.x;
    const dy = ball.y - ring.y;
    const dist = Math.sqrt(dx*dx + dy*dy);

    // Проверка угла дырки
    let angle = Math.atan2(dy, dx);
    if (angle < 0) angle += Math.PI * 2;
    let normRot = ring.rot % (Math.PI * 2);
    if (normRot < 0) normRot += Math.PI * 2;
    const inGap = Math.abs(angle - normRot) < ring.gap || Math.abs(angle - normRot) > (Math.PI * 2 - ring.gap);

    // ИСПРАВЛЕНИЕ: Предотвращение застревания
    if (!inGap) {
        if (!escaped && dist + ball.r >= ring.r) {
            // Если шар "ушел" в текстуру, выталкиваем его назад
            const overlap = (dist + ball.r) - ring.r;
            ball.x -= (dx / dist) * (overlap + 2);
            ball.y -= (dy / dist) * (overlap + 2);

            reflect(dx, dy, dist);
            multiplier += 0.18;
            if (multiplierDisplay) multiplierDisplay.innerText = multiplier.toFixed(2) + "x";
        } else if (escaped && dist - ball.r <= ring.r && dist > ring.r - 15) {
            // Отскок снаружи
            const overlap = ring.r - (dist - ball.r);
            ball.x += (dx / dist) * (overlap + 2);
            ball.y += (dy / dist) * (overlap + 2);
            reflect(dx, dy, dist);
        }
    } else if (!escaped && dist > ring.r) {
        escaped = true;
        ball.vy += 1.5; // Ускоряем вылет
    }

    // Проверка зон
    if (ball.y + ball.r > 380) {
        finishGame(ball.x < 180);
        return;
    }

    // Рендер шарика
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI*2);
    ctx.fillStyle = escaped ? '#fff' : '#00ff88';
    ctx.shadowBlur = 15;
    ctx.shadowColor = ctx.fillStyle;
    ctx.fill();
    ctx.shadowBlur = 0;

    ring.rot += ring.speed;
    requestAnimationFrame(draw);
}

function reflect(dx, dy, dist) {
    const nx = dx / dist;
    const ny = dy / dist;
    const dot = ball.vx * nx + ball.vy * ny;
    ball.vx = (ball.vx - 2 * dot * nx) * 0.98;
    ball.vy = (ball.vy - 2 * dot * ny) * 0.98;
}

function finishGame(isWin) {
    isPlaying = false;
    if (isWin) {
        const winAmount = bet * multiplier;
        userBalance += winAmount;
        showStatus(`ВЫИГРЫШ 🤑\n+${winAmount.toFixed(2)} TON`, "#00ff88");
    } else {
        showStatus(`ПРОИГРЫШ 💀\n-${bet} TON`, "#ff4444");
    }
    syncBalanceUI();
    document.getElementById('playBtn').disabled = false;
}

function showStatus(txt, col) {
    gameMsg.innerText = txt;
    gameMsg.style.color = col;
    gameMsg.style.borderColor = col;
    gameMsg.classList.remove('hidden');
    setTimeout(() => gameMsg.classList.add('hidden'), 3000);
}

// Кнопка ИГРАТЬ
document.getElementById('playBtn').onclick = function() {
    if (userBalance < bet) return alert("Недостаточно средств");
    
    userBalance -= bet; // Списание
    syncBalanceUI();
    
    this.disabled = true;
    init();
    isPlaying = true;
    draw();
};
