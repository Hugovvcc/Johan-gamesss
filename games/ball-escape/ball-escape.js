// ========== BALL ESCAPE (исправленная версия) ==========

let gameActive = false;
let currentMultiplier = 1.00;
let targetMultiplier = 1.00;
let currentBet = 1;
let ballPosition = { x: 50, y: 50 };
let gameInterval = null;
let gameHash = generateHash();
let gameHistory = ['2.1x', '0.8x', '3.5x', '1.2x', '4.0x'];
let isFalling = false;
let fallDestination = ''; // 'win' или 'lose'
let idleAnimationId = null;

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
    const ball = document.getElementById('ball');
    if (!ball) return;
    
    // Останавливаем предыдущую анимацию
    if (idleAnimationId) {
        cancelAnimationFrame(idleAnimationId);
    }
    
    // Мягкая анимация шарика в режиме ожидания
    let x = 50;
    let y = 50;
    let vx = 0.3;
    let vy = 0.2;
    
    function idleAnimate() {
        if (gameActive || isFalling) return;
        
        // Отскок от границ круга
        const radius = 40; // радиус круга в процентах
        const distance = Math.sqrt(Math.pow(x - 50, 2) + Math.pow(y - 50, 2));
        
        if (distance > radius) {
            // Отскок от края
            const angle = Math.atan2(y - 50, x - 50);
            x = 50 + radius * Math.cos(angle);
            y = 50 + radius * Math.sin(angle);
            
            // Отражаем скорость
            const normalX = (x - 50) / distance;
            const normalY = (y - 50) / distance;
            const dot = vx * normalX + vy * normalY;
            vx = vx - 2 * dot * normalX;
            vy = vy - 2 * dot * normalY;
        }
        
        x += vx;
        y += vy;
        
        // Плавное изменение скорости
        vx += (Math.random() - 0.5) * 0.03;
        vy += (Math.random() - 0.5) * 0.03;
        
        // Ограничение скорости
        const speed = Math.sqrt(vx * vx + vy * vy);
        if (speed > 0.5) {
            vx *= 0.5 / speed;
            vy *= 0.5 / speed;
        }
        
        // Обновление позиции
        ball.style.left = `calc(${x}% - 25px)`;
        ball.style.top = `calc(${y}% - 25px)`;
        
        idleAnimationId = requestAnimationFrame(idleAnimate);
    }
    
    idleAnimate();
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
    
    // Генерируем целевой множитель (1x - 10x)
    targetMultiplier = 1 + Math.random() * 9;
    // Время до падения (3-8 секунд)
    const timeToFall = 3000 + Math.random() * 5000;
    
    // Определяем куда упадет шарик (55% шанс на победу)
    fallDestination = Math.random() < 0.55 ? 'win' : 'lose';
    
    // Обновляем UI
    document.getElementById('startBtn').disabled = true;
    document.getElementById('startBtn').textContent = '🎱 ИДЕТ ИГРА...';
    document.getElementById('startBtn').style.background = 'linear-gradient(45deg,#ff9900,#ff6600)';
    
    showMessage('Шарик прыгает...', 'win');
    
    // Анимация круга
    const circle = document.getElementById('circle');
    circle.style.animation = 'circlePulse 1s infinite';
    
    // Обновляем хэш
    gameHash = generateHash();
    document.getElementById('gameHash').textContent = gameHash;
    
    // Запускаем игровой цикл
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
        
        // Увеличиваем множитель
        currentMultiplier += 0.03;
        
        // Обновляем отображение
        updateDisplay();
        
        // Анимация шарика
        animateBall();
        
    }, 100);
}

function animateBall() {
    const ball = document.getElementById('ball');
    if (!ball) return;
    
    // Случайное движение шарика
    ballPosition.x += (Math.random() - 0.5) * 3;
    ballPosition.y += (Math.random() - 0.5) * 2.5;
    
    // Ограничиваем в пределах круга
    const distance = Math.sqrt(
        Math.pow(ballPosition.x - 50, 2) + Math.pow(ballPosition.y - 50, 2)
    );
    
    if (distance > 40) {
        // Отодвигаем назад в круг
        const angle = Math.atan2(ballPosition.y - 50, ballPosition.x - 50);
        ballPosition.x = 50 + 38 * Math.cos(angle);
        ballPosition.y = 50 + 38 * Math.sin(angle);
    }
    
    ball.style.left = `calc(${ballPosition.x}% - 25px)`;
    ball.style.top = `calc(${ballPosition.y}% - 25px)`;
    
    // Пульсация в зависимости от множителя
    const pulse = 1 + (currentMultiplier - 1) * 0.03;
    ball.style.transform = `translate(-50%, -50%) scale(${pulse})`;
}

function updateDisplay() {
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
    
    if (idleAnimationId) {
        cancelAnimationFrame(idleAnimationId);
        idleAnimationId = null;
    }
    
    const ball = document.getElementById('ball');
    const hole = document.getElementById('hole');
    
    // Анимация падения к дырке
    ball.style.transition = 'all 1.2s cubic-bezier(0.4, 0, 0.2, 1)';
    ball.style.left = '50%';
    ball.style.top = 'calc(100% - 80px)';
    
    // Подсветка дырки
    hole.style.animation = 'holePulse 0.5s infinite';
    
    // Через 1.2 секунды - падение через дырку
    setTimeout(() => {
        ball.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        
        // Определяем конечную позицию (зеленая или красная зона)
        let finalLeft;
        let animationName;
        
        if (fallDestination === 'win') {
            finalLeft = '25%'; // Зеленая зона
            animationName = 'ballWin';
            ball.style.background = 'radial-gradient(circle at 30% 30%,#00ff9d,#00cc7a)';
        } else {
            finalLeft = '75%'; // Красная зона
            animationName = 'ballLose';
            ball.style.background = 'radial-gradient(circle at 30% 30%,#ff4466,#cc0033)';
        }
        
        ball.style.left = finalLeft;
        ball.style.top = 'calc(100% - 40px)';
        ball.style.animation = `${animationName} 0.8s forwards`;
        
        // Завершаем игру через секунду
        setTimeout(() => {
            endGame();
        }, 800);
        
    }, 1200);
}

function endGame() {
    gameActive = false;
    isFalling = false;
    
    // Останавливаем анимации
    const circle = document.getElementById('circle');
    const hole = document.getElementById('hole');
    circle.style.animation = '';
    hole.style.animation = '';
    
    // Восстанавливаем кнопку
    document.getElementById('startBtn').disabled = false;
    document.getElementById('startBtn').textContent = '🎱 СЫГРАТЬ';
    document.getElementById('startBtn').style.background = 'linear-gradient(45deg,#00c3ff,#0099cc)';
    
    let winAmount = 0;
    
    if (fallDestination === 'win') {
        // Шарик упал в зеленую зону - ВЫИГРЫШ
        winAmount = currentBet * (currentMultiplier - 1);
        window.gameAPI.updateBalance(winAmount);
        showMessage(`ПОБЕДА! +${winAmount.toFixed(2)} TON (${currentMultiplier.toFixed(2)}x)`, 'win');
        
        // Подсветка зеленой зоны
        document.getElementById('winZone').classList.add('zone-highlight');
        setTimeout(() => {
            document.getElementById('winZone').classList.remove('zone-highlight');
        }, 2000);
        
        // Конфетти
        createConfetti();
        
        // Добавляем в историю (зеленый)
        addToHistory(currentMultiplier.toFixed(2) + 'x', true);
    } else {
        // Шарик упал в красную зону - ПРОИГРЫШ
        showMessage(`ПРОИГРЫШ! -${currentBet.toFixed(2)} TON`, 'lose');
        
        // Подсветка красной зоны
        document.getElementById('loseZone').classList.add('zone-highlight');
        setTimeout(() => {
            document.getElementById('loseZone').classList.remove('zone-highlight');
        }, 2000);
        
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
    ball.style.transition = 'all 0.5s ease';
    ball.style.animation = '';
    ball.style.left = '50%';
    ball.style.top = '50%';
    ball.style.background = 'radial-gradient(circle at 30% 30%,#ff9ccd,#ff6bb5,#ff0080)';
    ball.style.transform = 'translate(-50%, -50%) scale(1)';
    
    // Сброс позиции
    ballPosition = { x: 50, y: 50 };
    
    // Возвращаем к фоновой анимации
    setTimeout(() => {
        ball.style.transition = '';
        startIdleAnimation();
    }, 500);
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
    const confettiCount = 30;
    
    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti-piece';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.top = '0';
        confetti.style.background = i % 3 === 0 ? '#00ff9d' : (i % 3 === 1 ? '#ff9ccd' : '#ffcc00');
        confetti.style.width = Math.random() * 8 + 4 + 'px';
        confetti.style.height = Math.random() * 8 + 4 + 'px';
        confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
        confetti.style.opacity = '0.8';
        
        gameField.appendChild(confetti);
        
        // Анимация падения
        confetti.animate([
            { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
            { transform: `translateY(${400 + Math.random() * 100}px) rotate(${360 + Math.random() * 360}deg)`, opacity: 0 }
        ], {
            duration: 1500 + Math.random() * 1000,
            easing: 'cubic-bezier(0.215, 0.610, 0.355, 1)'
        });
        
        // Удаляем через 3 секунды
        setTimeout(() => {
            if (confetti.parentNode) {
                confetti.remove();
            }
        }, 3000);
    }
}

function showMessage(text, type) {
    const msg = document.getElementById('gameMessage');
    if (msg) {
        msg.textContent = text;
        msg.className = `message ${type}`;
        
        // Автоматическое скрытие через 3 секунды
        setTimeout(() => {
            if (msg.textContent === text) {
                msg.textContent = 'Выберите ставку и нажмите "СЫГРАТЬ"';
                msg.className = 'message';
            }
        }, 3000);
    }
}

console.log('Ball Escape загружена и готова!');
