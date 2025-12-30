// ========== BALL ESCAPE (НОВАЯ ВЕРСИЯ) ==========

let gameActive = false;
let currentMultiplier = 1.00;
let targetMultiplier = 1.00;
let currentBet = 1;
let ballPosition = { x: 50, y: 50 };
let ballVelocity = { x: 0, y: 0 };
let gameInterval = null;
let cashOutMultiplier = 0;
let gameHash = generateHash();
let gameHistory = ['2.1x', '0.8x', '3.5x', '1.2x', '4.0x'];
let isFalling = false;
let fallDestination = ''; // 'win' или 'lose'
let autoCashAt = 2.0;

function initGame() {
    console.log('✅ Ball Escape (новая версия) initialized');
    
    // Обновляем хэш
    document.getElementById('gameHash').textContent = gameHash;
    
    // Назначаем обработчики для кнопок ставок
    document.querySelectorAll('.bet-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            setBet(parseFloat(this.dataset.bet));
        });
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
    document.getElementById('betDisplay').textContent = amount;
    document.getElementById('betAmount').value = amount;
    
    // Подсвечиваем активную кнопку
    document.querySelectorAll('.bet-btn').forEach(btn => {
        if (parseFloat(btn.dataset.bet) === amount) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    updateCashOutAmount();
}

function updateBetFromInput() {
    const input = document.getElementById('betAmount');
    const value = parseFloat(input.value);
    if (!isNaN(value) && value >= 0.1 && value <= 50) {
        setBet(value);
    } else {
        alert('Введите ставку от 0.1 до 50 TON');
    }
}

function startIdleAnimation() {
    const ball = document.getElementById('ball');
    if (!ball) return;
    
    // Мягкая анимация шарика в режиме ожидания
    let x = 50;
    let y = 50;
    let vx = 0.3;
    let vy = 0.2;
    
    function idleAnimate() {
        if (gameActive || isFalling) return;
        
        // Отскок от границ круга
        if (x < 10 || x > 90) vx = -vx;
        if (y < 10 || y > 90) vy = -vy;
        
        x += vx;
        y += vy;
        
        // Плавное изменение скорости
        vx += (Math.random() - 0.5) * 0.05;
        vy += (Math.random() - 0.5) * 0.05;
        
        // Ограничение скорости
        const speed = Math.sqrt(vx * vx + vy * vy);
        if (speed > 0.8) {
            vx *= 0.8 / speed;
            vy *= 0.8 / speed;
        }
        
        // Обновление позиции
        ball.style.left = `calc(${x}% - 25px)`;
        ball.style.top = `calc(${y}% - 25px)`;
        
        requestAnimationFrame(idleAnimate);
    }
    
    idleAnimate();
}

function startGame() {
    if (gameActive) return;
    
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
    cashOutMultiplier = 0;
    
    // Генерируем целевой множитель (1x - 20x)
    targetMultiplier = 1 + Math.random() * 19;
    // С шансом 30% сделать краш раньше
    if (Math.random() < 0.3) {
        targetMultiplier = 1 + Math.random() * 3;
    }
    
    // Определяем куда упадет шарик (60% шанс на победу)
    fallDestination = Math.random() < 0.6 ? 'win' : 'lose';
    
    // Обновляем UI
    document.getElementById('startBtn').disabled = true;
    document.getElementById('cashOutBtn').disabled = false;
    showMessage('Игра началась! Заберите до падения шарика!', 'win');
    
    // Анимация круга
    const circle = document.getElementById('circle');
    circle.style.animation = 'circlePulse 1s infinite';
    
    // Стартуем игровой цикл
    startGameLoop();
    
    // Обновляем хэш
    gameHash = generateHash();
    document.getElementById('gameHash').textContent = gameHash;
}

function startGameLoop() {
    if (gameInterval) clearInterval(gameInterval);
    
    let speed = 1.0;
    let time = 0;
    
    gameInterval = setInterval(() => {
        if (!gameActive || isFalling) return;
        
        time += 0.1;
        
        // Увеличиваем множитель (быстрее в начале, медленнее потом)
        let increaseRate = 0.05 * Math.exp(-time * 0.1);
        currentMultiplier += increaseRate;
        
        // Если достигли целевого множителя - начинаем падение
        if (currentMultiplier >= targetMultiplier && !isFalling) {
            startBallFall();
            return;
        }
        
        // Авто-вывод при достижении 2x
        if (currentMultiplier >= autoCashAt && cashOutMultiplier === 0) {
            cashOutMultiplier = currentMultiplier;
            showMessage(`Авто-вывод при ${autoCashAt.toFixed(2)}x!`, 'win');
        }
        
        // Обновляем отображение
        updateDisplay();
        
        // Анимация шарика
        animateBall();
        
        // Постепенно ускоряемся
        speed += 0.002;
        
    }, 100);
}

function animateBall() {
    const ball = document.getElementById('ball');
    if (!ball) return;
    
    // Случайное движение шарика
    ballPosition.x += (Math.random() - 0.5) * 4;
    ballPosition.y += (Math.random() - 0.5) * 3;
    
    // Ограничиваем в пределах круга
    ballPosition.x = Math.max(15, Math.min(85, ballPosition.x));
    ballPosition.y = Math.max(15, Math.min(85, ballPosition.y));
    
    ball.style.left = `calc(${ballPosition.x}% - 25px)`;
    ball.style.top = `calc(${ballPosition.y}% - 25px)`;
    
    // Пульсация в зависимости от множителя
    const pulse = 1 + (currentMultiplier - 1) * 0.05;
    ball.style.transform = `translate(-50%, -50%) scale(${pulse})`;
}

function updateDisplay() {
    // Текущий множитель
    document.getElementById('currentMultiplier').textContent = currentMultiplier.toFixed(2) + 'x';
    document.getElementById('bigMultiplier').textContent = currentMultiplier.toFixed(2) + 'x';
    
    // Цвет множителя в зависимости от значения
    const multElement = document.getElementById('bigMultiplier');
    if (currentMultiplier >= 3) {
        multElement.style.color = '#ff6600';
    } else if (currentMultiplier >= 2) {
        multElement.style.color = '#ffcc00';
    } else {
        multElement.style.color = '#ff9ccd';
    }
    
    // Сумма для вывода
    updateCashOutAmount();
}

function updateCashOutAmount() {
    const winAmount = currentBet * (currentMultiplier - 1);
    document.getElementById('cashAmount').textContent = winAmount.toFixed(2);
}

function cashOut() {
    if (!gameActive || isFalling) return;
    
    cashOutMultiplier = currentMultiplier;
    endGame(true);
}

function startBallFall() {
    if (isFalling) return;
    
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
    ball.style.left = '50%';
    ball.style.top = 'calc(100% - 80px)';
    
    // Подсветка дырки
    hole.style.animation = 'holePulse 0.5s infinite';
    
    // Через 1.5 секунды - падение через дырку
    setTimeout(() => {
        ball.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
        
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
        ball.style.animation = `${animationName} 1s forwards`;
        
        // Завершаем игру через секунду
        setTimeout(() => {
            endGame(false);
        }, 1000);
        
    }, 1500);
}

function endGame(wasCashedOut) {
    gameActive = false;
    isFalling = false;
    
    // Останавливаем анимации
    const circle = document.getElementById('circle');
    const hole = document.getElementById('hole');
    circle.style.animation = '';
    hole.style.animation = '';
    
    // Активируем кнопку старта
    document.getElementById('startBtn').disabled = false;
    document.getElementById('cashOutBtn').disabled = true;
    
    let winAmount = 0;
    let finalMultiplier = wasCashedOut ? cashOutMultiplier : (fallDestination === 'win' ? currentMultiplier : 0);
    
    if (wasCashedOut) {
        // Игрок забрал деньги
        winAmount = currentBet * (cashOutMultiplier - 1);
        window.gameAPI.updateBalance(winAmount);
        showMessage(`Успешно! +${winAmount.toFixed(2)} TON (${cashOutMultiplier.toFixed(2)}x)`, 'win');
        
        // Конфетти
        createConfetti();
    } else if (fallDestination === 'win') {
        // Шарик упал в зеленую зону
        winAmount = currentBet * (currentMultiplier - 1);
        window.gameAPI.updateBalance(winAmount);
        showMessage(`Выигрыш! +${winAmount.toFixed(2)} TON (${currentMultiplier.toFixed(2)}x)`, 'win');
        
        // Подсветка зеленой зоны
        document.getElementById('winZone').classList.add('zone-highlight');
        setTimeout(() => {
            document.getElementById('winZone').classList.remove('zone-highlight');
        }, 2000);
        
        createConfetti();
    } else {
        // Шарик упал в красную зону
        showMessage(`Проигрыш! -${currentBet.toFixed(2)} TON`, 'lose');
        
        // Подсветка красной зоны
        document.getElementById('loseZone').classList.add('zone-highlight');
        setTimeout(() => {
            document.getElementById('loseZone').classList.remove('zone-highlight');
        }, 2000);
    }
    
    // Добавляем в историю
    if (finalMultiplier > 0) {
        const historyItem = `<span style="color:${finalMultiplier >= 1 ? '#00ff9d' : '#ff4466'}">${finalMultiplier.toFixed(2)}x</span>`;
        gameHistory.unshift(historyItem);
        if (gameHistory.length > 5) gameHistory.pop();
        
        document.getElementById('historyList').innerHTML = gameHistory.join(' ');
    }
    
    // Сбрасываем шарик
    setTimeout(() => {
        const ball = document.getElementById('ball');
        ball.style.transition = '';
        ball.style.animation = '';
        ball.style.left = '50%';
        ball.style.top = '50%';
        ball.style.background = 'radial-gradient(circle at 30% 30%,#ff9ccd,#ff6bb5,#ff0080)';
        ball.style.transform = 'translate(-50%, -50%) scale(1)';
        
        // Возвращаем к фоновой анимации
        startIdleAnimation();
    }, 2000);
}

function createConfetti() {
    const gameField = document.getElementById('gameField');
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti-piece';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.top = '0';
        confetti.style.background = i % 3 === 0 ? '#00ff9d' : (i % 3 === 1 ? '#ff9ccd' : '#ffcc00');
        confetti.style.width = Math.random() * 10 + 5 + 'px';
        confetti.style.height = Math.random() * 10 + 5 + 'px';
        confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
        
        gameField.appendChild(confetti);
        
        // Удаляем через 2 секунды
        setTimeout(() => {
            confetti.remove();
        }, 2000);
    }
}

function showMessage(text, type) {
    const msg = document.getElementById('gameMessage');
    if (msg) {
        msg.textContent = text;
        msg.className = `message ${type}`;
    }
}

console.log('Ball Escape (новая версия) загружена');
