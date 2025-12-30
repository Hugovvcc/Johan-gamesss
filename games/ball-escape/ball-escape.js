// ========== BALL ESCAPE (исправленная версия) ==========

let gameActive = false;
let currentMultiplier = 1.00;
let currentBet = 1;
let ballPosition = { x: 50, y: 50 };
let ballVelocity = { x: 0, y: 0 };
let gameInterval = null;
let gameHash = generateHash();
let gameHistory = ['2.1x', '0.8x', '3.5x'];
let isFalling = false;
let fallDestination = ''; // 'win' или 'lose'
let animationFrameId = null;
let circleRadius = 175; // Радиус круга в пикселях
let circleCenter = { x: 200, y: 225 }; // Центр круга

function initGame() {
    console.log('✅ Ball Escape initialized');
    
    // Обновляем хэш
    document.getElementById('gameHash').textContent = gameHash;
    
    // Назначаем обработчики для кнопок ставок
    document.querySelectorAll('.bet-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            setBet(parseFloat(this.dataset.bet));
        });
    });
    
    // Назначаем обработчик для поля ввода
    document.getElementById('betAmount').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            updateBetFromInput();
        }
    });
    
    // Инициализируем ставку
    setBet(1);
    
    // Запускаем фоновую анимацию шарика
    startIdleAnimation();
}

function generateHash() {
    const chars = '0123456789abcdef';
    let hash = '';
    for (let i = 0; i < 10; i++) {
        hash += chars[Math.floor(Math.random() * chars.length)];
    }
    return hash + '...' + hash.split('').reverse().join('').substring(0, 5);
}

function setBet(amount) {
    currentBet = amount;
    
    // Обновляем отображение
    document.getElementById('currentBet').textContent = amount;
    document.getElementById('betAmount').value = amount;
    
    // Подсвечиваем активную кнопку
    document.querySelectorAll('.bet-btn').forEach(btn => {
        if (parseFloat(btn.dataset.bet) === amount) {
            btn.classList.add('active');
            btn.style.background = 'linear-gradient(45deg,#ff6bb5,#ff9ccd)';
        } else {
            btn.classList.remove('active');
            btn.style.background = 'rgba(255,255,255,0.1)';
        }
    });
}

function updateBetFromInput() {
    const input = document.getElementById('betAmount');
    const value = parseFloat(input.value);
    if (!isNaN(value) && value >= 0.1 && value <= 50) {
        setBet(value);
    } else {
        showMessage('Введите ставку от 0.1 до 50 TON', 'lose');
        input.value = currentBet;
    }
}

function startIdleAnimation() {
    // Начальная скорость шарика
    ballVelocity = {
        x: (Math.random() - 0.5) * 4,
        y: (Math.random() - 0.5) * 4
    };
    
    // Запускаем анимацию
    animateIdleBall();
}

function animateIdleBall() {
    if (gameActive || isFalling) return;
    
    // Обновляем позицию
    ballPosition.x += ballVelocity.x;
    ballPosition.y += ballVelocity.y;
    
    // Проверяем столкновение с границей круга
    const dx = ballPosition.x - circleCenter.x;
    const dy = ballPosition.y - circleCenter.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const ballRadius = 25; // Радиус шарика
    
    if (distance + ballRadius > circleRadius) {
        // Столкновение с границей
        const normalX = dx / distance;
        const normalY = dy / distance;
        
        // Отражение скорости
        const dot = ballVelocity.x * normalX + ballVelocity.y * normalY;
        ballVelocity.x = ballVelocity.x - 2 * dot * normalX;
        ballVelocity.y = ballVelocity.y - 2 * dot * normalY;
        
        // Немного теряем скорость при ударе
        ballVelocity.x *= 0.95;
        ballVelocity.y *= 0.95;
        
        // Возвращаем шарик внутрь круга
        const overlap = (distance + ballRadius) - circleRadius;
        ballPosition.x -= overlap * normalX;
        ballPosition.y -= overlap * normalY;
    }
    
    // Небольшое случайное изменение скорости (как броуновское движение)
    ballVelocity.x += (Math.random() - 0.5) * 0.2;
    ballVelocity.y += (Math.random() - 0.5) * 0.2;
    
    // Ограничение максимальной скорости
    const speed = Math.sqrt(ballVelocity.x * ballVelocity.x + ballVelocity.y * ballVelocity.y);
    if (speed > 8) {
        ballVelocity.x = ballVelocity.x * 8 / speed;
        ballVelocity.y = ballVelocity.y * 8 / speed;
    }
    
    // Обновление позиции шарика на экране
    const ball = document.getElementById('ball');
    if (ball) {
        ball.style.left = (ballPosition.x - ballRadius) + 'px';
        ball.style.top = (ballPosition.y - ballRadius) + 'px';
    }
    
    // Продолжаем анимацию
    animationFrameId = requestAnimationFrame(animateIdleBall);
}

function startGame() {
    if (gameActive) {
        showMessage('Игра уже идет!', 'lose');
        return;
    }
    
    const currentBalance = window.gameAPI.getBalance();
    if (currentBalance < currentBet) {
        showMessage('Недостаточно баланса!', 'lose');
        return;
    }
    
    // Снимаем ставку
    window.gameAPI.updateBalance(-currentBet);
    
    // Сброс игры
    gameActive = true;
    isFalling = false;
    currentMultiplier = 1.00;
    
    // Время до падения (3-6 секунд)
    const timeToFall = 3000 + Math.random() * 3000;
    
    // Определяем куда упадет шарик (60% шанс на победу)
    fallDestination = Math.random() < 0.6 ? 'win' : 'lose';
    
    // Обновляем UI
    const startBtn = document.getElementById('startBtn');
    startBtn.disabled = true;
    startBtn.textContent = '🎱 ИДЕТ ИГРА...';
    startBtn.style.background = 'linear-gradient(45deg,#ff9900,#ff6600)';
    
    showMessage('Шарик прыгает в круге...', 'win');
    
    // Анимация круга
    const circle = document.getElementById('circle');
    circle.style.animation = 'circlePulse 1s infinite';
    
    // Обновляем хэш
    gameHash = generateHash();
    document.getElementById('gameHash').textContent = gameHash;
    
    // Останавливаем фоновую анимацию
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
    
    // Запускаем игровой цикл с увеличенной скоростью
    startGameLoop();
    
    // Через случайное время шарик падает
    setTimeout(() => {
        if (gameActive && !isFalling) {
            startBallFall();
        }
    }, timeToFall);
}

function startGameLoop() {
    if (gameInterval) clearInterval(gameInterval);
    
    let time = 0;
    
    gameInterval = setInterval(() => {
        if (!gameActive || isFalling) return;
        
        time += 0.1;
        
        // Увеличиваем множитель (медленно в начале, быстрее потом)
        currentMultiplier += 0.02 + (time * 0.005);
        
        // Обновляем отображение множителя
        updateMultiplierDisplay();
        
        // Анимация шарика (более активное движение)
        if (!isFalling) {
            updateBallPhysics();
        }
        
    }, 100);
}

function updateBallPhysics() {
    // Увеличиваем скорость во время игры
    ballVelocity.x += (Math.random() - 0.5) * 0.5;
    ballVelocity.y += (Math.random() - 0.5) * 0.5;
    
    ballPosition.x += ballVelocity.x;
    ballPosition.y += ballVelocity.y;
    
    // Проверяем столкновение с границей круга
    const dx = ballPosition.x - circleCenter.x;
    const dy = ballPosition.y - circleCenter.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const ballRadius = 25;
    
    if (distance + ballRadius > circleRadius) {
        // Столкновение с границей
        const normalX = dx / distance;
        const normalY = dy / distance;
        
        // Отражение скорости
        const dot = ballVelocity.x * normalX + ballVelocity.y * normalY;
        ballVelocity.x = ballVelocity.x - 2 * dot * normalX;
        ballVelocity.y = ballVelocity.y - 2 * dot * normalY;
        
        // Возвращаем шарик внутрь круга
        const overlap = (distance + ballRadius) - circleRadius;
        ballPosition.x -= overlap * normalX;
        ballPosition.y -= overlap * normalY;
        
        // Эффект при ударе
        const ball = document.getElementById('ball');
        if (ball) {
            ball.style.transform = 'translate(-50%, -50%) scale(1.1)';
            setTimeout(() => {
                ball.style.transform = 'translate(-50%, -50%) scale(1)';
            }, 100);
        }
    }
    
    // Обновление позиции шарика
    const ball = document.getElementById('ball');
    if (ball) {
        ball.style.left = (ballPosition.x - 25) + 'px';
        ball.style.top = (ballPosition.y - 25) + 'px';
        
        // Пульсация в зависимости от множителя
        const pulse = 1 + (currentMultiplier - 1) * 0.05;
        ball.style.transform = `translate(-50%, -50%) scale(${pulse})`;
    }
}

function updateMultiplierDisplay() {
    // Текущий множитель
    const multiplierText = currentMultiplier.toFixed(2) + 'x';
    document.getElementById('currentMultiplier').textContent = multiplierText;
    document.getElementById('bigMultiplier').textContent = multiplierText;
    
    // Цвет множителя в зависимости от значения
    const multElement = document.getElementById('bigMultiplier');
    if (currentMultiplier >= 3) {
        multElement.style.color = '#ff6600';
    } else if (currentMultiplier >= 2) {
        multElement.style.color = '#ffcc00';
    } else if (currentMultiplier >= 1.5) {
        multElement.style.color = '#ff9900';
    } else {
        multElement.style.color = '#ff9ccd';
    }
}

function startBallFall() {
    if (!gameActive || isFalling) return;
    
    isFalling = true;
    
    // Останавливаем игровой цикл
    if (gameInterval) {
        clearInterval(gameInterval);
        gameInterval = null;
    }
    
    const ball = document.getElementById('ball');
    const hole = document.getElementById('hole');
    
    // Анимация падения к дырке
    ball.style.transition = 'all 1.5s cubic-bezier(0.4, 0, 0.2, 1)';
    
    // Позиция дырки
    const holeRect = hole.getBoundingClientRect();
    const gameFieldRect = document.getElementById('gameField').getBoundingClientRect();
    
    const holeX = holeRect.left - gameFieldRect.left + holeRect.width / 2;
    const holeY = holeRect.top - gameFieldRect.top + holeRect.height / 2;
    
    ball.style.left = (holeX - 25) + 'px';
    ball.style.top = (holeY - 25) + 'px';
    
    // Подсветка дырки
    hole.style.animation = 'holePulse 0.5s infinite';
    
    // Через 1.5 секунды - падение через дырку
    setTimeout(() => {
        ball.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
        
        // Определяем конечную позицию (зеленая или красная зона)
        let finalX;
        let animationName;
        let zoneColor;
        
        if (fallDestination === 'win') {
            finalX = gameFieldRect.width * 0.25; // Зеленая зона (25% слева)
            animationName = 'ballWin';
            zoneColor = '#00ff9d';
            ball.style.background = 'radial-gradient(circle at 30% 30%,#00ff9d,#00cc7a)';
        } else {
            finalX = gameFieldRect.width * 0.75; // Красная зона (75% слева)
            animationName = 'ballLose';
            zoneColor = '#ff4466';
            ball.style.background = 'radial-gradient(circle at 30% 30%,#ff4466,#cc0033)';
        }
        
        ball.style.left = (finalX - 25) + 'px';
        ball.style.top = (gameFieldRect.height - 60) + 'px';
        ball.style.animation = `${animationName} 1s forwards`;
        
        // Подсветка зоны
        const zone = document.getElementById(fallDestination === 'win' ? 'winZone' : 'loseZone');
        zone.style.boxShadow = `0 0 30px ${zoneColor}`;
        
        // Завершаем игру через секунду
        setTimeout(() => {
            endGame();
        }, 1000);
        
    }, 1500);
}

function endGame() {
    gameActive = false;
    isFalling = false;
    
    // Останавливаем анимации
    const circle = document.getElementById('circle');
    const hole = document.getElementById('hole');
    circle.style.animation = '';
    hole.style.animation = '';
    
    // Убираем подсветку зоны
    document.getElementById('winZone').style.boxShadow = '';
    document.getElementById('loseZone').style.boxShadow = '';
    
    // Восстанавливаем кнопку
    const startBtn = document.getElementById('startBtn');
    startBtn.disabled = false;
    startBtn.textContent = '🎱 СЫГРАТЬ';
    startBtn.style.background = 'linear-gradient(45deg,#00c3ff,#0099cc)';
    
    let winAmount = 0;
    
    if (fallDestination === 'win') {
        // Шарик упал в зеленую зону - ВЫИГРЫШ
        winAmount = currentBet * (currentMultiplier - 1);
        window.gameAPI.updateBalance(winAmount);
        showMessage(`ВЫИГРЫШ! +${winAmount.toFixed(2)} TON (${currentMultiplier.toFixed(2)}x)`, 'win');
        
        // Конфетти
        createConfetti();
        
        // Добавляем в историю (зеленый)
        addToHistory(currentMultiplier.toFixed(2) + 'x', true);
    } else {
        // Шарик упал в красную зону - ПРОИГРЫШ
        showMessage(`ПРОИГРЫШ! -${currentBet.toFixed(2)} TON`, 'lose');
        
        // Добавляем в историю (красный)
        addToHistory('0.0x', false);
    }
    
    // Сбрасываем шарик через 2 секунды
    setTimeout(() => {
        resetBall();
    }, 2000);
}

function resetBall() {
    const ball = document.getElementById('ball');
    const gameField = document.getElementById('gameField');
    const gameFieldRect = gameField.getBoundingClientRect();
    
    // Возвращаем шарик в центр круга
    ball.style.transition = 'all 1s ease';
    ball.style.animation = '';
    ball.style.left = (circleCenter.x - 25) + 'px';
    ball.style.top = (circleCenter.y - 25) + 'px';
    ball.style.background = 'radial-gradient(circle at 30% 30%,#ff9ccd,#ff6bb5,#ff0080)';
    ball.style.transform = 'translate(-50%, -50%) scale(1)';
    
    // Сброс позиции и скорости
    ballPosition = { x: circleCenter.x, y: circleCenter.y };
    ballVelocity = {
        x: (Math.random() - 0.5) * 4,
        y: (Math.random() - 0.5) * 4
    };
    
    // Возвращаем к фоновой анимации
    setTimeout(() => {
        ball.style.transition = '';
        if (!gameActive && !isFalling) {
            startIdleAnimation();
        }
    }, 1000);
}

function addToHistory(multiplier, isWin) {
    const color = isWin ? '#00ff9d' : '#ff4466';
    const historyItem = `<span style="color:${color}">${multiplier}</span>`;
    gameHistory.unshift(historyItem);
    if (gameHistory.length > 5) gameHistory.pop();
    
    document.getElementById('historyList').innerHTML = gameHistory.join(' ');
}

function createConfetti() {
    const gameField = document.getElementById('gameField');
    const confettiCount = 40;
    
    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti-piece';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.top = '0';
        confetti.style.background = i % 3 === 0 ? '#00ff9d' : (i % 3 === 1 ? '#ff9ccd' : '#ffcc00');
        confetti.style.width = Math.random() * 10 + 5 + 'px';
        confetti.style.height = Math.random() * 10 + 5 + 'px';
        confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
        confetti.style.opacity = '0.9';
        confetti.style.zIndex = '100';
        
        gameField.appendChild(confetti);
        
        // Анимация падения
        const animation = confetti.animate([
            { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
            { transform: `translateY(${500 + Math.random() * 100}px) rotate(${360 + Math.random() * 360}deg)`, opacity: 0 }
        ], {
            duration: 2000 + Math.random() * 1000,
            easing: 'cubic-bezier(0.215, 0.610, 0.355, 1)'
        });
        
        // Удаляем после анимации
        animation.onfinish = () => {
            if (confetti.parentNode) {
                confetti.remove();
            }
        };
    }
}

function showMessage(text, type) {
    const msg = document.getElementById('gameMessage');
    if (msg) {
        msg.textContent = text;
        msg.className = `message ${type}`;
        
        // Автоматическое скрытие через 3 секунды
        setTimeout(() => {
            if (msg.textContent === text && !gameActive) {
                msg.textContent = 'Выберите ставку и нажмите "СЫГРАТЬ"';
                msg.className = 'message';
            }
        }, 3000);
    }
}

console.log('🎱 Ball Escape загружена и готова!');
