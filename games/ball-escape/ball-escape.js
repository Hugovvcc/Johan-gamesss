const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gameMsg = document.getElementById('gameMessage');
const playBtn = document.getElementById('playBtn');
const giftBtn = document.getElementById('giftBtn');
const currentBetDisplay = document.getElementById('currentBetDisplay');
const gameHash = document.getElementById('gameHash');
const balanceDisplay = document.getElementById('globalBalance');

// Игровые переменные
let bet = 1;
let isPlaying = false;
let ball, ring, gameResult, animationId;
let bounceCount = 0;
const MAX_BOUNCES = 6;

// Оригинальная функция init (как у вас была)
function init() {
    ball = { 
        x: canvas.width / 2, 
        y: canvas.height / 2 - 120, 
        vx: 2.5, 
        vy: 2, 
        r: 8 
    };
    ring = { 
        x: canvas.width / 2, 
        y: canvas.height / 2, 
        r: 100, 
        gap: 0.3, 
        rot: Math.random() * Math.PI, 
        speed: 0.02 
    };
    gameResult = null;
    bounceCount = 0;
    
    // Устанавливаем начальное направление
    const angle = Math.PI / 4 + (Math.random() - 0.5) * 0.5;
    const speed = 4.5;
    ball.vx = Math.cos(angle) * speed;
    ball.vy = Math.sin(angle) * speed;
}

// Установка ставки
window.setBet = (amount) => {
    if (isPlaying) return;
    bet = amount;
    currentBetDisplay.textContent = amount;
    
    // Обновляем активную кнопку
    document.querySelectorAll('.bet-btn').forEach(b => {
        b.classList.toggle('active', parseInt(b.innerText) === amount);
    });
};

// Кнопка подарка
if (giftBtn) {
    giftBtn.onclick = () => {
        showMessage('🎁 Функция "Добавить гифт" в разработке!', 'info');
    };
}

// Отрисовка игры
function draw() {
    if (!isPlaying) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Отрисовка зон
    ctx.fillStyle = 'rgba(0, 255, 136, 0.15)'; 
    ctx.fillRect(0, 380, 180, 40);
    ctx.fillStyle = 'rgba(255, 68, 68, 0.15)'; 
    ctx.fillRect(180, 380, 180, 40);

    // Кольцо с дыркой
    ctx.beginPath();
    ctx.lineWidth = 12;
    ctx.strokeStyle = '#ff69b4';
    ctx.arc(ring.x, ring.y, ring.r, ring.rot + ring.gap, ring.rot - ring.gap + Math.PI * 2);
    ctx.stroke();

    // Движение шарика
    ball.x += ball.vx;
    ball.y += ball.vy;

    // Гравитация после вылета
    if (gameResult === 'escaped') {
        ball.vy += 0.15;
        ball.vx += 0.02;
    }

    // Стенки
    if (ball.x + ball.r > canvas.width || ball.x - ball.r < 0) ball.vx *= -1;
    if (ball.y - ball.r < 0) ball.vy *= -1;

    // Проверка столкновения с кольцом
    const dx = ball.x - ring.x;
    const dy = ball.y - ring.y;
    const dist = Math.sqrt(dx*dx + dy*dy);

    let angle = Math.atan2(dy, dx);
    if (angle < 0) angle += Math.PI * 2;
    let currentRot = ring.rot % (Math.PI * 2);
    if (currentRot < 0) currentRot += Math.PI * 2;
    
    const inGap = Math.abs(angle - currentRot) < ring.gap || 
                  Math.abs(angle - currentRot) > (Math.PI * 2 - ring.gap);

    if (!inGap) {
        if (gameResult !== 'escaped' && dist + ball.r >= ring.r) {
            bounceCount++;
            if (bounceCount <= MAX_BOUNCES) {
                reflectBall(dx, dy, dist);
            } else {
                // После 6 отскоков - вылет
                gameResult = 'escaped';
            }
        } else if (gameResult === 'escaped' && dist - ball.r <= ring.r && dist > ring.r - 20) {
            reflectBall(dx, dy, dist);
        }
    } else if (gameResult !== 'escaped' && dist > ring.r) {
        gameResult = 'escaped';
        ball.vy += 2;
    }

    // Проверка завершения игры
    if (ball.y + ball.r > 380) {
        finish(ball.x < 180);
        return;
    }

    // Отрисовка шарика
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI*2);
    ctx.fillStyle = gameResult === 'escaped' ? '#fff' : '#00ff88';
    ctx.shadowBlur = gameResult === 'escaped' ? 5 : 15;
    ctx.shadowColor = ctx.fillStyle;
    ctx.fill();
    ctx.shadowBlur = 0;

    ring.rot += ring.speed;
    animationId = requestAnimationFrame(draw);
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
    cancelAnimationFrame(animationId);
    gameMsg.classList.remove('hidden');
    
    const winMultiplier = 2.98;
    
    if (win) {
        const profit = bet * winMultiplier;
        
        // Используем глобальную функцию для начисления выигрыша
        if (typeof window.processBallEscapeWin === 'function') {
            window.processBallEscapeWin(profit);
        }
        
        gameMsg.innerHTML = `<h2 style="color:#00ff88">ВЫИГРЫШ 🤑</h2><p>+${profit.toFixed(2)} TON</p>`;
    } else {
        gameMsg.innerHTML = `<h2 style="color:#ff4444">ПРОИГРЫШ 💀</h2><p>-${bet} TON</p>`;
    }
    
    setTimeout(() => {
        gameMsg.classList.add('hidden');
        playBtn.disabled = false;
    }, 2500);
}

// Оригинальный обработчик кнопки "Играть" 
playBtn.onclick = () => {
    // Баланс проверяется в основном скрипте
    init();
    isPlaying = true;
    playBtn.disabled = true;
    draw();
};

// Вспомогательная функция
function showMessage(text, type) {
    gameMsg.innerHTML = text;
    gameMsg.className = `game-notification ${type}`;
    gameMsg.classList.remove('hidden');
    
    setTimeout(() => {
        gameMsg.classList.add('hidden');
    }, 3000);
}

// Инициализация при загрузке
window.addEventListener('DOMContentLoaded', () => {
    init();
    
    // Инициализируем холст
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(0, 255, 136, 0.15)'; 
    ctx.fillRect(0, 380, 180, 40);
    ctx.fillStyle = 'rgba(255, 68, 68, 0.15)'; 
    ctx.fillRect(180, 380, 180, 40);
    
    // Хэш игры
    if (gameHash) {
        gameHash.textContent = 'c1eaf...a0cd3';
    }
});
