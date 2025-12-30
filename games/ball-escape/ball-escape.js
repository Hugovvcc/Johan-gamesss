const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const multDisplay = document.getElementById('multiplierValue');
const gameMsg = document.getElementById('gameMessage');

let bet = 1;
let isPlaying = false;
let ball, ring, multiplier, escaped;

window.setBet = (val) => {
    bet = val;
    document.querySelectorAll('.bet-btn').forEach(b => b.classList.toggle('active', parseInt(b.innerText) === val));
};

function init() {
    ball = { x: 180, y: 160, vx: 2, vy: 1.5, r: 7 };
    ring = { x: 180, y: 180, r: 100, gap: 0.28, rot: Math.random() * 6, speed: 0.035 };
    multiplier = 1.0;
    escaped = false;
    multDisplay.innerText = "1.00x";
}

function draw() {
    if (!isPlaying) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Зоны
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = '#00ff00'; ctx.fillRect(0, 380, 180, 40);
    ctx.fillStyle = '#ff0000'; ctx.fillRect(180, 380, 180, 40);
    ctx.globalAlpha = 1;

    // Кольцо
    ctx.beginPath();
    ctx.lineWidth = 10;
    ctx.strokeStyle = '#ff69b4';
    ctx.arc(ring.x, ring.y, ring.r, ring.rot + ring.gap, ring.rot - ring.gap + Math.PI * 2);
    ctx.stroke();

    // Логика шарика
    ball.x += ball.vx;
    ball.y += ball.vy;

    // Стенки канваса
    if (ball.x + ball.r > canvas.width || ball.x - ball.r < 0) ball.vx *= -1;
    if (ball.y - ball.r < 0) ball.vy *= -1;

    // Взаимодействие с кольцом
    const dx = ball.x - ring.x;
    const dy = ball.y - ring.y;
    const dist = Math.sqrt(dx*dx + dy*dy);

    // Проверка угла для дырки
    let angle = Math.atan2(dy, dx);
    if (angle < 0) angle += Math.PI * 2;
    let currentRot = ring.rot % (Math.PI * 2);
    if (currentRot < 0) currentRot += Math.PI * 2;
    const inGap = Math.abs(angle - currentRot) < ring.gap || Math.abs(angle - currentRot) > (Math.PI * 2 - ring.gap);

    // Физика столкновений (внутренняя и внешняя стороны)
    if (!inGap) {
        if (!escaped && dist + ball.r >= ring.r) { // Удар изнутри
            reflectBall(dx, dy, dist);
            multiplier += 0.12;
            multDisplay.innerText = multiplier.toFixed(2) + "x";
        } else if (escaped && dist - ball.r <= ring.r && dist > ring.r - 20) { // Удар снаружи
            reflectBall(dx, dy, dist);
            // Иксы не добавляем
        }
    } else if (!escaped && dist > ring.r) {
        escaped = true; // Вылетел через дырку
    }

    // Рандомный перекос в сторону проигрыша в свободном полете
    if (escaped && ball.y > ring.y) {
        ball.vx += 0.015; // Мягко тянет вправо (на красное)
    }

    // Конец игры (зоны)
    if (ball.y + ball.r > 380) {
        finish(ball.x < 180);
        return;
    }

    // Отрисовка шарика
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI*2);
    ctx.fillStyle = escaped ? '#fff' : '#00ff88';
    ctx.fill();

    ring.rot += ring.speed;
    requestAnimationFrame(draw);
}

function reflectBall(dx, dy, dist) {
    const nx = dx / dist;
    const ny = dy / dist;
    const dot = ball.vx * nx + ball.vy * ny;
    ball.vx = (ball.vx - 2 * dot * nx) * 0.98;
    ball.vy = (ball.vy - 2 * dot * ny) * 0.98;
}

function finish(win) {
    isPlaying = false;
    gameMsg.classList.remove('hidden');
    if (win) {
        gameMsg.innerHTML = `<h2 style="color:#00ff88">ПОБЕДА</h2><p>${(bet * multiplier).toFixed(2)} TON</p>`;
    } else {
        gameMsg.innerHTML = `<h2 style="color:#ff4444">ПРОИГРЫШ</h2><p>-${bet} TON</p>`;
        multDisplay.innerText = "1.00x";
    }
    setTimeout(() => gameMsg.classList.add('hidden'), 2500);
    document.getElementById('playBtn').classList.remove('hidden');
    document.getElementById('cashoutBtn').classList.add('hidden');
}

document.getElementById('playBtn').onclick = () => {
    init();
    isPlaying = true;
    document.getElementById('playBtn').classList.add('hidden');
    document.getElementById('cashoutBtn').classList.remove('hidden');
    draw();
};

document.getElementById('cashoutBtn').onclick = () => finish(true);
