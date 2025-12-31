const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gameMsg = document.getElementById('gameMessage');
const playBtn = document.getElementById('playBtn');
const giftBtn = document.getElementById('giftBtn');
const currentBetDisplay = document.getElementById('currentBetDisplay');
const gameHash = document.getElementById('gameHash');
const balanceDisplay = document.getElementById('globalBalance');
const depositBtn = document.getElementById('depositBtn');
const withdrawBtn = document.getElementById('withdrawBtn');
const depositModal = document.getElementById('depositModal');
const withdrawModal = document.getElementById('withdrawModal');
const closeModalButtons = document.querySelectorAll('.close-modal');

// Глобальный баланс (интеграция с вашей системой)
let globalBalance = 1000; // Начальный баланс

// Игровые переменные
let bet = 1;
let isPlaying = false;
let ball, ring, gameResult, animationId;
let bounceCount = 0; // Счетчик отскоков
const MAX_BOUNCES = 6; // Максимум 6 отскоков

// Инициализация
function initGame() {
    // Сброс переменных
    ball = {
        x: canvas.width / 2,
        y: canvas.height / 2 - 120,
        radius: 10,
        vx: 0,
        vy: 0,
        color: '#00ff88',
        friction: 0.985 // Легкое трение для реалистичности
    };
    
    ring = {
        x: canvas.width / 2,
        y: canvas.height / 2,
        radius: 140,
        gapAngle: 0.5, // Характерная дырка как на фото (немного больше)
        rotation: 0,
        rotationSpeed: 0.025, // Скорость вращения
        color: '#ff69b4',
        lineWidth: 15
    };
    
    gameResult = null;
    bounceCount = 0;
    
    // Устанавливаем начальное направление (немного случайное)
    const angle = Math.PI / 4 + (Math.random() - 0.5) * 0.5;
    const speed = 4.5;
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
    if (globalBalance < bet) {
        showMessage('Недостаточно баланса!', 'error');
        return;
    }
    
    // Списание со счета
    updateBalance(-bet);
    
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

// Обновление состояния с реалистичной физикой
function updateGame() {
    // Вращение кольца
    ring.rotation += ring.rotationSpeed;
    
    // Применение трения
    ball.vx *= ball.friction;
    ball.vy *= ball.friction;
    
    // Обновление позиции шарика
    ball.x += ball.vx;
    ball.y += ball.vy;
    
    // Проверка границ холста (мягкие отскоки)
    if (ball.x + ball.radius > canvas.width) {
        ball.x = canvas.width - ball.radius;
        ball.vx = -Math.abs(ball.vx) * 0.85;
    }
    if (ball.x - ball.radius < 0) {
        ball.x = ball.radius;
        ball.vx = Math.abs(ball.vx) * 0.85;
    }
    if (ball.y - ball.radius < 0) {
        ball.y = ball.radius;
        ball.vy = Math.abs(ball.vy) * 0.85;
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
    
    // Если шарик близко к кольцу
    if (distance + ball.radius > ring.radius - 5 && distance - ball.radius < ring.radius + 5) {
        // Угол шарика относительно центра
        let ballAngle = Math.atan2(dy, dx);
        if (ballAngle < 0) ballAngle += Math.PI * 2;
        
        // Текущий угол отверстия
        let holeAngle = ring.rotation % (Math.PI * 2);
        if (holeAngle < 0) holeAngle += Math.PI * 2;
        
        // Проверка, находится ли шарик в отверстии
        const angleDiff = Math.abs(ballAngle - holeAngle);
        const normalizedDiff = Math.min(angleDiff, Math.PI * 2 - angleDiff);
        const isInHole = normalizedDiff < ring.gapAngle / 2;
        
        if (isInHole) {
            // Шарик проходит через отверстие
            finishGame(true);
            return;
        } else {
            // Реалистичный отскок от кольца
            if (bounceCount < MAX_BOUNCES) {
                bounceCount++;
                
                // Нормаль к поверхности кольца
                const normalX = dx / distance;
                const normalY = dy / distance;
                
                // Скалярное произведение
                const dot = ball.vx * normalX + ball.vy * normalY;
                
                // Отражение с потерей энергии
                const restitution = 0.82; // Коэффициент восстановления
                ball.vx = (ball.vx - 2 * dot * normalX) * restitution;
                ball.vy = (ball.vy - 2 * dot * normalY) * restitution;
                
                // Корректировка позиции (чтобы не застрять)
                const overlap = (ball.radius + ring.radius) - distance;
                ball.x += normalX * overlap * 1.1;
                ball.y += normalY * overlap * 1.1;
                
                // Легкое случайное изменение траектории для реалистичности
                ball.vx += (Math.random() - 0.5) * 0.3;
                ball.vy += (Math.random() - 0.5) * 0.3;
            } else {
                // После 6 отскоков - шарик проходит
                finishGame(true);
                return;
            }
        }
    }
}

// Отрисовка игры с характерной дыркой
function drawGame() {
    // Очистка холста
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Градиентный фон
    const gradient = ctx.createRadialGradient(
        canvas.width/2, canvas.height/2, 50,
        canvas.width/2, canvas.height/2, 200
    );
    gradient.addColorStop(0, '#1a0b35');
    gradient.addColorStop(1, '#0b011d');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Зоны выигрыша/проигрыша (подсветка)
    ctx.fillStyle = 'rgba(0, 255, 136, 0.15)';
    ctx.fillRect(0, canvas.height - 40, canvas.width/2, 40);
    
    ctx.fillStyle = 'rgba(255, 68, 68, 0.15)';
    ctx.fillRect(canvas.width/2, canvas.height - 40, canvas.width/2, 40);
    
    // Кольцо с характерной дыркой
    ctx.beginPath();
    
    // Рисуем круг с разрывом (дыркой)
    const startAngle = ring.rotation + ring.gapAngle/2;
    const endAngle = ring.rotation + Math.PI * 2 - ring.gapAngle/2;
    
    ctx.arc(ring.x, ring.y, ring.radius, startAngle, endAngle);
    
    // Стиль кольца
    ctx.lineWidth = ring.lineWidth;
    ctx.strokeStyle = ring.color;
    ctx.lineCap = 'round';
    ctx.shadowColor = ring.color;
    ctx.shadowBlur = 15;
    ctx.stroke();
    ctx.shadowBlur = 0;
    
    // Подсветка дырки
    const holeX = ring.x + Math.cos(ring.rotation) * ring.radius;
    const holeY = ring.y + Math.sin(ring.rotation) * ring.radius;
    
    ctx.beginPath();
    ctx.arc(holeX, holeY, 20, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fill();
    
    // Контур дырки
    ctx.beginPath();
    ctx.arc(holeX, holeY, 18, 0, Math.PI * 2);
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.stroke();
    
    // Шарик
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    
    // Градиент для шарика
    const ballGradient = ctx.createRadialGradient(
        ball.x - ball.radius/3, ball.y - ball.radius/3, 1,
        ball.x, ball.y, ball.radius
    );
    
    if (gameResult === null) {
        ballGradient.addColorStop(0, '#ffffff');
        ballGradient.addColorStop(0.5, ball.color);
        ballGradient.addColorStop(1, '#006644');
    } else if (gameResult === 'win') {
        ballGradient.addColorStop(0, '#ffff00');
        ballGradient.addColorStop(1, '#ff9900');
    } else {
        ballGradient.addColorStop(0, '#ff6666');
        ballGradient.addColorStop(1, '#cc0000');
    }
    
    ctx.fillStyle = ballGradient;
    ctx.shadowColor = ball.color;
    ctx.shadowBlur = 20;
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // Центр кольца
    ctx.beginPath();
    ctx.arc(ring.x, ring.y, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#ffcc00';
    ctx.fill();
    
    // Отображение счетчика отскоков
    ctx.font = '14px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'right';
    ctx.fillText(`Отскоки: ${bounceCount}/6`, canvas.width - 15, 25);
}

// Завершение игры
function finishGame(isWin) {
    isPlaying = false;
    gameResult = isWin ? 'win' : 'loss';
    cancelAnimationFrame(animationId);
    
    const winMultiplier = 2.98;
    
    if (isWin) {
        const winAmount = bet * winMultiplier;
        updateBalance(winAmount);
        
        showMessage(
            `🎉 ПОБЕДА!<br>+${winAmount.toFixed(2)} TON<br>Множитель: ${winMultiplier}x`,
            'win'
        );
        
        // Анимация победы
        ball.color = '#ffff00';
        startWinAnimation();
    } else {
        showMessage(
            `💀 ПРОИГРЫШ<br>-${bet} TON`,
            'loss'
        );
        
        // Анимация проигрыша
        ball.color = '#ff4444';
        startLossAnimation();
    }
    
    // Разблокировка кнопки через 2 секунды
    setTimeout(() => {
        playBtn.disabled = false;
        gameResult = null;
    }, 2000);
}

// Анимация победы
function startWinAnimation() {
    let particles = [];
    
    // Создаем частицы для эффекта
    for (let i = 0; i < 30; i++) {
        particles.push({
            x: ball.x,
            y: ball.y,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8,
            radius: Math.random() * 4 + 2,
            color: ['#ffcc00', '#ff9900', '#ffff00'][Math.floor(Math.random() * 3)],
            life: 60
        });
    }
    
    const animateParticles = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawGame();
        
        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.1; // Гравитация
            p.life--;
            
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.life / 60;
            ctx.fill();
        });
        
        ctx.globalAlpha = 1;
        
        particles = particles.filter(p => p.life > 0);
        
        if (particles.length > 0) {
            requestAnimationFrame(animateParticles);
        }
    };
    
    animateParticles();
}

// Анимация проигрыша
function startLossAnimation() {
    let opacity = 1;
    
    const fadeOut = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawGame();
        
        // Красная вспышка
        ctx.fillStyle = `rgba(255, 0, 0, ${opacity * 0.2})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        opacity -= 0.05;
        
        if (opacity > 0) {
            requestAnimationFrame(fadeOut);
        }
    };
    
    fadeOut();
}

// Управление балансом
function updateBalance(amount) {
    globalBalance += amount;
    balanceDisplay.textContent = globalBalance.toFixed(2);
    
    // Сохраняем в localStorage (для демо)
    localStorage.setItem('ballEscapeBalance', globalBalance);
    
    // Здесь можно добавить запрос к вашему бэкенду
    console.log(`Баланс обновлен: ${amount > 0 ? '+' : ''}${amount}, Новый баланс: ${globalBalance}`);
}

// Загрузка баланса из localStorage
function loadBalance() {
    const savedBalance = localStorage.getItem('ballEscapeBalance');
    if (savedBalance) {
        globalBalance = parseFloat(savedBalance);
        balanceDisplay.textContent = globalBalance.toFixed(2);
    }
}

// Функции пополнения/вывода
depositBtn.onclick = () => {
    depositModal.style.display = 'flex';
};

withdrawBtn.onclick = () => {
    document.getElementById('availableBalance').textContent = globalBalance.toFixed(2);
    withdrawModal.style.display = 'flex';
};

closeModalButtons.forEach(btn => {
    btn.onclick = () => {
        depositModal.style.display = 'none';
        withdrawModal.style.display = 'none';
    };
});

window.deposit = (amount) => {
    updateBalance(amount);
    depositModal.style.display = 'none';
    showMessage(`✅ Пополнено ${amount} TON`, 'info');
};

window.depositCustom = () => {
    const input = document.getElementById('customAmount');
    const amount = parseInt(input.value);
    
    if (amount && amount > 0 && amount <= 10000) {
        updateBalance(amount);
        depositModal.style.display = 'none';
        input.value = '';
        showMessage(`✅ Пополнено ${amount} TON`, 'info');
    } else {
        showMessage('Введите корректную сумму (1-10000)', 'error');
    }
};

window.processWithdrawal = () => {
    const amount = parseFloat(document.getElementById('withdrawAmount').value);
    const wallet = document.getElementById('walletAddress').value;
    
    if (!amount || amount <= 0) {
        showMessage('Введите корректную сумму', 'error');
        return;
    }
    
    if (amount > globalBalance) {
        showMessage('Недостаточно средств', 'error');
        return;
    }
    
    if (!wallet || wallet.length < 10) {
        showMessage('Введите корректный адрес кошелька', 'error');
        return;
    }
    
    updateBalance(-amount);
    withdrawModal.style.display = 'none';
    showMessage(`✅ Заявка на вывод ${amount} TON отправлена`, 'info');
    
    // Здесь обычно отправляется запрос на бэкенд
    console.log(`Вывод ${amount} TON на кошелек: ${wallet}`);
};

// Вспомогательные функции
function showMessage(text, type) {
    gameMsg.innerHTML = text;
    gameMsg.className = `game-notification ${type}`;
    gameMsg.classList.remove('hidden');
    
    setTimeout(() => {
        gameMsg.classList.add('hidden');
    }, 3000);
}

// Закрытие модальных окон при клике вне
window.onclick = (event) => {
    if (event.target === depositModal) depositModal.style.display = 'none';
    if (event.target === withdrawModal) withdrawModal.style.display = 'none';
};

// Инициализация при загрузке
window.addEventListener('DOMContentLoaded', () => {
    loadBalance();
    initGame();
    drawGame();
    
    // Хэш игры
    gameHash.textContent = 'c1eaf...a0cd3';
});
