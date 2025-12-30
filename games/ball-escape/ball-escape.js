const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gameMsg = document.getElementById('gameMessage');
const playBtn = document.getElementById('playBtn');
const giftBtn = document.getElementById('giftBtn');
const currentBetDisplay = document.getElementById('currentBetDisplay');
const gameHash = document.getElementById('gameHash');

// Игровые переменные
let bet = 1;
let isPlaying = false;
let ball, ring, gameResult, animationId;
let userBalance = 1000; // Стартовый баланс

// Звуковые эффекты
const sounds = {
    bounce: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-retro-game-emergency-alarm-1000.mp3'),
    win: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-winning-chimes-2015.mp3'),
    loss: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-wrong-answer-fail-notification-946.mp3')
};

// Настройка звуков
Object.values(sounds).forEach(sound => {
    sound.volume = 0.3;
    sound.preload = 'auto';
});

// Инициализация
function initGame() {
    // Сброс переменных
    ball = {
        x: canvas.width / 2,
        y: canvas.height / 2 - 120,
        radius: 10,
        vx: 0,
        vy: 0,
        color: '#00ff88'
    };
    
    ring = {
        x: canvas.width / 2,
        y: canvas.height / 2,
        radius: 140,
        gapAngle: 0.4, // Размер отверстия в радианах
        rotation: 0,
        rotationSpeed: 0.03,
        color: '#ff69b4',
        lineWidth: 12
    };
    
    gameResult = null;
    
    // Устанавливаем случайное начальное направление
    const angle = Math.random() * Math.PI * 2;
    const speed = 3 + Math.random() * 2;
    ball.vx = Math.cos(angle) * speed;
    ball.vy = Math.sin(angle) * speed;
    
    // Случайное положение отверстия
    ring.rotation = Math.random() * Math.PI * 2;
}

// Установка ставки
window.setBet = (amount) => {
    if (isPlaying) return;
    
    bet = amount;
    currentBetDisplay.textContent = amount;
    
    // Обновляем активную кнопку
    document.querySelectorAll('.bet-btn').forEach(btn => {
        const btnValue = parseInt(btn.textContent);
        btn.classList.toggle('active', btnValue === amount);
    });
};

// Запуск игры
playBtn.onclick = () => {
    if (isPlaying) return;
    if (userBalance < bet) {
        showMessage('Недостаточно баланса!', 'error');
        return;
    }
    
    // Списываем ставку
    userBalance -= bet;
    updateBalanceDisplay();
    
    // Настройка игры
    initGame();
    isPlaying = true;
    playBtn.disabled = true;
    
    // Запуск игрового цикла
    gameLoop();
};

// Кнопка подарка
giftBtn.onclick = () => {
    showMessage('🎁 Функция "Добавить гифт" в разработке!', 'info');
};

// Игровой цикл
function gameLoop() {
    if (!isPlaying) return;
    
    updateGame();
    drawGame();
    
    animationId = requestAnimationFrame(gameLoop);
}

// Обновление состояния
function updateGame() {
    // Вращение кольца
    ring.rotation += ring.rotationSpeed;
    
    // Обновление позиции шарика
    ball.x += ball.vx;
    ball.y += ball.vy;
    
    // Проверка границ холста
    if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
        ball.vx *= -0.95; // Отскок с затуханием
        playSound('bounce');
    }
    
    if (ball.y - ball.radius < 0) {
        ball.vy *= -0.95;
        playSound('bounce');
    }
    
    // Проверка выхода за нижнюю границу
    if (ball.y + ball.radius > canvas.height) {
        finishGame(false);
        return;
    }
    
    // Проверка столкновения с кольцом
    const dx = ball.x - ring.x;
    const dy = ball.y - ring.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Угол шарика относительно центра
    let ballAngle = Math.atan2(dy, dx);
    if (ballAngle < 0) ballAngle += Math.PI * 2;
    
    // Текущий угол отверстия
    let holeAngle = ring.rotation % (Math.PI * 2);
    if (holeAngle < 0) holeAngle += Math.PI * 2;
    
    // Проверка, находится ли шарик в отверстии
    const angleDiff = Math.abs(ballAngle - holeAngle);
    const isInHole = angleDiff < ring.gapAngle / 2 || 
                     angleDiff > (Math.PI * 2 - ring.gapAngle / 2);
    
    // Если шарик достигает внешнего края кольца
    if (distance + ball.radius >= ring.radius && distance - ball.radius <= ring.radius + 10) {
        if (isInHole) {
            // Шарик проходит через отверстие
            finishGame(true);
            return;
        } else {
            // Отскок от кольца
            const normalX = dx / distance;
            const normalY = dy / distance;
            const dot = ball.vx * normalX + ball.vy * normalY;
            
            ball.vx = (ball.vx - 2 * dot * normalX) * 0.9;
            ball.vy = (ball.vy - 2 * dot * normalY) * 0.9;
            
            playSound('bounce');
            
            // Небольшое увеличение скорости для динамики
            ball.vx *= 1.02;
            ball.vy *= 1.02;
        }
    }
}

// Отрисовка игры
function drawGame() {
    // Очистка холста
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Фон
    const gradient = ctx.createRadialGradient(
        canvas.width/2, canvas.height/2, 0,
        canvas.width/2, canvas.height/2, canvas.width/2
    );
    gradient.addColorStop(0, '#1a0b35');
    gradient.addColorStop(1, '#0b011d');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Зоны выигрыша/проигрыша
    ctx.fillStyle = 'rgba(0, 255, 136, 0.1)';
    ctx.fillRect(0, canvas.height - 40, canvas.width/2, 40);
    
    ctx.fillStyle = 'rgba(255, 68, 68, 0.1)';
    ctx.fillRect(canvas.width/2, canvas.height - 40, canvas.width/2, 40);
    
    // Кольцо
    ctx.beginPath();
    ctx.arc(ring.x, ring.y, ring.radius, 
            ring.rotation + ring.gapAngle/2, 
            ring.rotation + Math.PI * 2 - ring.gapAngle/2);
    ctx.lineWidth = ring.lineWidth;
    ctx.strokeStyle = ring.color;
    ctx.lineCap = 'round';
    ctx.stroke();
    
    // Отверстие (подсветка)
    ctx.beginPath();
    ctx.arc(
        ring.x + Math.cos(ring.rotation) * ring.radius,
        ring.y + Math.sin(ring.rotation) * ring.radius,
        15, 0, Math.PI * 2
    );
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fill();
    
    // Шарик
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    
    // Градиент для шарика
    const ballGradient = ctx.createRadialGradient(
        ball.x - 3, ball.y - 3, 1,
        ball.x, ball.y, ball.radius
    );
    ballGradient.addColorStop(0, '#ffffff');
    ballGradient.addColorStop(0.5, ball.color);
    ballGradient.addColorStop(1, '#006644');
    
    ctx.fillStyle = ballGradient;
    ctx.fill();
    
    // Свечение шарика
    ctx.shadowColor = ball.color;
    ctx.shadowBlur = 15;
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // Центр кольца
    ctx.beginPath();
    ctx.arc(ring.x, ring.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#ffcc00';
    ctx.fill();
}

// Завершение игры
function finishGame(isWin) {
    isPlaying = false;
    gameResult = isWin ? 'win' : 'loss';
    cancelAnimationFrame(animationId);
    
    // Анимация падения шарика
    if (isWin) {
        ball.color = '#00ff88';
        ball.vy = 5; // Ускорение вниз
        ball.vx = (Math.random() - 0.5) * 2; // Случайное смещение
        
        const winAmount = bet * 2.98;
        userBalance += winAmount;
        
        showMessage(
            `ВЫИГРЫШ 🤑<br>+${winAmount.toFixed(2)}<br>Множитель: 2.98x`,
            'win'
        );
        playSound('win');
    } else {
        ball.color = '#ff4444';
        ball.vy = 3;
        ball.vx = 2; // Смещение в сторону проигрышной зоны
        
        showMessage(
            `ПРОИГРЫШ 💀<br>-${bet}`,
            'loss'
        );
        playSound('loss');
    }
    
    updateBalanceDisplay();
    
    // Анимация падения
    const fallInterval = setInterval(() => {
        ball.y += ball.vy;
        ball.vy += 0.2; // Гравитация
        ball.x += ball.vx;
        
        drawGame();
        
        if (ball.y > canvas.height + 50) {
            clearInterval(fallInterval);
            playBtn.disabled = false;
        }
    }, 16);
}

// Вспомогательные функции
function showMessage(text, type) {
    gameMsg.innerHTML = text;
    gameMsg.className = `game-notification ${type}`;
    gameMsg.classList.remove('hidden');
    
    setTimeout(() => {
        gameMsg.classList.add('hidden');
    }, 3000);
}

function updateBalanceDisplay() {
    // Обновите ваш элемент отображения баланса здесь
    console.log(`Баланс: ${userBalance.toFixed(2)}`);
}

function playSound(soundName) {
    if (sounds[soundName]) {
        sounds[soundName].currentTime = 0;
        sounds[soundName].play().catch(e => console.log("Ошибка воспроизведения звука:", e));
    }
}

// Хэш игры (для демонстрации)
gameHash.textContent = 'c1eaf...a0cd3';

// Инициализация при загрузке
window.addEventListener('DOMContentLoaded', () => {
    initGame();
    drawGame(); // Начальная отрисовка
});
