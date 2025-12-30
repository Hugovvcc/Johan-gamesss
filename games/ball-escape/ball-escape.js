const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const multDisplay = document.getElementById('multiplierValue');
const gameMsg = document.getElementById('gameMessage');
const playBtn = document.getElementById('playBtn');

let bet = 1;
let isPlaying = false;
let ball, ring, multiplier, escaped;

// Эмуляция баланса (замените на вашу глобальную переменную)
let userBalance = 99.0; 

window.setBet = (val) => {
    if (isPlaying) return;
    bet = val;
    document.querySelectorAll('.bet-btn').forEach(b => b.classList.toggle('active', parseInt(b.innerText) === val));
};

function updateBalanceUI() {
    const balanceElement = document.querySelector('.balance-text') || { innerText: '' };
    balanceElement.innerText = `Balance: ${userBalance.toFixed(1)} TON`;
}

function init() {
    ball = { x: 180, y: 160, vx: 2.5, vy: 2, r: 8 };
    // Скорость вращения уменьшена (было 0.035 стало 0.02)
    ring = { x: 180, y: 180, r: 100, gap: 0.3, rot: Math.random() * Math.PI, speed: 0.02 };
    multiplier = 1.0;
    escaped = false;
    multDisplay.innerText = "1.00x";
}

function draw() {
    if (!isPlaying) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Отрисовка зон
    ctx.fillStyle = 'rgba(0, 255, 136, 0.15)'; ctx.fillRect(0, 380, 180, 40);
    ctx.fillStyle = 'rgba(255, 68, 68, 0.15)'; ctx.fillRect(180, 380, 180, 40);

    // Кольцо
    ctx.beginPath();
    ctx.lineWidth = 12;
    ctx.strokeStyle = '#ff69b4';
    ctx.arc(ring.x, ring.y, ring.r, ring.rot + ring.gap, ring.rot - ring.gap + Math.PI * 2);
    ctx.stroke();

    ball.x += ball.vx;
    ball.y += ball.vy;

    // Гравитация для ускорения падения после вылета
    if (escaped) {
        ball.vy += 0.15; // Тянет шар вниз
        ball.vx += 0.02; // Смещение в сторону красного
    }

    // Стенки
    if (ball.x + ball.r > canvas.width || ball.x - ball.r < 0) ball.vx *= -1;
    if (ball.y - ball.r < 0) ball.vy *= -1;

    const dx = ball.x - ring.x;
    const dy = ball.y - ring.y;
    const dist = Math.sqrt(dx*dx + dy*dy);

    let angle = Math.atan2(dy, dx);
    if (angle < 0) angle += Math.PI * 2;
    let currentRot = ring.rot % (Math.PI * 2);
    if (currentRot < 0) currentRot += Math.PI * 2;
    
    const inGap = Math.abs(angle - currentRot) < ring.gap || Math.abs(angle - currentRot) > (Math.PI * 2 - ring.gap);

    if (!inGap) {
        if (!escaped && dist + ball.r >= ring.r) {
            reflectBall(dx, dy, dist);
            multiplier += 0.20;
            multDisplay.innerText = multiplier.toFixed(2) + "x";
        } else if (escaped && dist - ball.r <= ring.r && dist > ring.r - 20) {
            reflectBall(dx, dy, dist);
        }
    } else if (!escaped && dist > ring.r) {
        escaped = true;
        ball.vy += 2; // Импульс при вылете, чтобы шар "выстреливал" вниз
    }

    if (ball.y + ball.r > 380) {
        finish(ball.x < 180);
        return;
    }

    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI*2);
    ctx.fillStyle = escaped ? '#fff' : '#00ff88';
    ctx.shadowBlur = escaped ? 5 : 15;
    ctx.shadowColor = ctx.fillStyle;
    ctx.fill();
    ctx.shadowBlur = 0;

    ring.rot += ring.speed;
    requestAnimationFrame(draw);
}

function reflectBall(dx, dy, dist) {
    const nx = dx / dist;
    const ny = dy / dist;
    const dot = ball.vx * nx + ball.vy * ny;
    ball.vx = (ball.vx - 2 * dot * nx) * 0.95;
    ball.vy = (ball.vy - 2 * dot * ny) * 0.95;
}

function finish(win) {
    isPlaying = false;
    gameMsg.classList.remove('hidden');
    
    if (win) {
        const profit = bet * multiplier;
        userBalance += profit;
        gameMsg.innerHTML = `<h2 style="color:#00ff88">ВЫИГРЫШ 🤑</h2><p>+${profit.toFixed(2)} TON</p>`;
    } else {
        // Ставка уже списана при нажатии "Играть", здесь ничего не вычитаем
        gameMsg.innerHTML = `<h2 style="color:#ff4444">ПРОИГРЫШ 💀</h2><p>-${bet} TON</p>`;
        multDisplay.innerText = "1.00x";
    }
    
    updateBalanceUI();
    setTimeout(() => {
        gameMsg.classList.add('hidden');
        playBtn.disabled = false;
    }, 2500);
}

playBtn.onclick = () => {
    if (userBalance < bet) return alert("Недостаточно баланса!");
    
    userBalance -= bet; // Списание сразу
    updateBalanceUI();
    
    init();
    isPlaying = true;
    playBtn.disabled = true;
    draw();
};
