// Ball Escape - исправленная версия с правильной физикой

let gameActive = false;
let multiplier = 1.0;
let bet = 1;
let ballMoving = false;
let ballX = 175, ballY = 175;
let velocityX = 2, velocityY = 1.5;
let gameInterval;
let circleAngle = 0;
let circleSpinSpeed = 0;
let circleSpinInterval;
let finalMultiplier = 1.0;
let isWin = false;

function initGame() {
    console.log("Ball Escape initialized");
    
    // Кнопки ставок
    document.querySelectorAll(".bet-btn").forEach(btn => {
        btn.onclick = () => {
            bet = parseFloat(btn.getAttribute("data-bet"));
            document.getElementById("betAmount").value = bet;
            
            // Подсветка активной кнопки
            document.querySelectorAll(".bet-btn").forEach(b => {
                b.classList.remove("active");
            });
            btn.classList.add("active");
        };
    });
    
    // Поле ввода ставки
    document.getElementById("betAmount").addEventListener("change", function() {
        let value = parseFloat(this.value);
        if (value >= 0.1 && value <= 50) {
            bet = value;
        }
    });
}

function startGame() {
    if (gameActive) return;
    
    // Проверка баланса
    if (window.gameAPI && window.gameAPI.getBalance() < bet) {
        alert("Недостаточно баланса!");
        return;
    }
    
    if (window.gameAPI) {
        window.gameAPI.updateBalance(-bet);
    }
    
    // Сброс состояния
    gameActive = true;
    multiplier = 1.0;
    ballMoving = true;
    ballX = 175;
    ballY = 175;
    velocityX = (Math.random() - 0.5) * 5;
    velocityY = (Math.random() - 0.5) * 5;
    circleAngle = 0;
    circleSpinSpeed = 0.5;
    
    // Обновление UI
    const startBtn = document.getElementById("startBtn");
    startBtn.disabled = true;
    startBtn.innerHTML = "🎱 ШАРИК ПРЫГАЕТ";
    startBtn.style.background = "linear-gradient(45deg, #ff9900, #ff6600)";
    
    const gameMessage = document.getElementById("gameMessage");
    gameMessage.textContent = "Шарик прыгает... множитель растёт!";
    gameMessage.style.color = "#ffcc00";
    
    // Запуск анимации круга
    startCircleSpin();
    
    // Запуск физики шарика
    clearInterval(gameInterval);
    gameInterval = setInterval(updateBallPhysics, 30);
    
    // Определение времени игры (3-8 секунд)
    const gameDuration = 3000 + Math.random() * 5000;
    
    // Таймер для завершения игры
    setTimeout(() => {
        if (gameActive) {
            endGame();
        }
    }, gameDuration);
}

function startCircleSpin() {
    const circle = document.getElementById("circle");
    clearInterval(circleSpinInterval);
    
    circleSpinInterval = setInterval(() => {
        circleAngle += circleSpinSpeed;
        circle.style.transform = `translateX(-50%) rotate(${circleAngle}deg)`;
        
        // Постепенное увеличение скорости вращения
        if (circleSpinSpeed < 3) {
            circleSpinSpeed += 0.02;
        }
    }, 16);
}

function updateBallPhysics() {
    if (!ballMoving) return;
    
    const ball = document.getElementById("ball");
    const circleRadius = 175; // Радиус круга
    const ballRadius = 25; // Радиус шарика
    
    // Движение шарика
    ballX += velocityX;
    ballY += velocityY;
    
    // Проверка столкновения со стенками круга
    const centerX = 175;
    const centerY = 175;
    const dx = ballX - centerX;
    const dy = ballY - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance + ballRadius > circleRadius) {
        // Отскок от стенки
        const normalX = dx / distance;
        const normalY = dy / distance;
        
        // Корректировка позиции
        ballX = centerX + (circleRadius - ballRadius) * normalX;
        ballY = centerY + (circleRadius - ballRadius) * normalY;
        
        // Отражение скорости
        const dot = velocityX * normalX + velocityY * normalY;
        velocityX = velocityX - 2 * dot * normalX;
        velocityY = velocityY - 2 * dot * normalY;
        
        // Эффект удара
        ball.style.transform = `translate(-50%, -50%) scale(1.15)`;
        setTimeout(() => {
            ball.style.transform = `translate(-50%, -50%) scale(1)`;
        }, 100);
        
        // Увеличение множителя при ударе
        multiplier += 0.05;
        updateMultiplierDisplay();
    }
    
    // Обновление позиции шарика
    ball.style.left = ballX + "px";
    ball.style.top = ballY + "px";
    
    // Небольшое замедление (трение)
    velocityX *= 0.995;
    velocityY *= 0.995;
}

function updateMultiplierDisplay() {
    const bigMultiplier = document.getElementById("bigMultiplier");
    const currentMultiplier = document.getElementById("currentMultiplier");
    
    bigMultiplier.textContent = multiplier.toFixed(2) + "x";
    currentMultiplier.textContent = multiplier.toFixed(2) + "x";
    
    // Изменение цвета в зависимости от множителя
    if (multiplier > 5) {
        bigMultiplier.style.color = "#ff3300";
    } else if (multiplier > 3) {
        bigMultiplier.style.color = "#ff6600";
    } else if (multiplier > 2) {
        bigMultiplier.style.color = "#ff9900";
    } else if (multiplier > 1.5) {
        bigMultiplier.style.color = "#ffcc00";
    }
}

function endGame() {
    if (!gameActive) return;
    
    ballMoving = false;
    clearInterval(gameInterval);
    clearInterval(circleSpinInterval);
    
    // Определяем результат (60% на победу)
    isWin = Math.random() < 0.6;
    finalMultiplier = isWin ? multiplier : 0;
    
    // Показываем направление падения
    showDirectionArrow();
    
    // Анимация падения шарика
    setTimeout(() => dropBall(), 1000);
}

function showDirectionArrow() {
    const arrow = document.getElementById("directionArrow");
    const indicator = document.getElementById("directionIndicator");
    
    arrow.style.display = "block";
    indicator.style.opacity = "1";
    
    // Позиционируем стрелку в зависимости от результата
    const offset = isWin ? -100 : 100;
    arrow.style.left = `calc(50% + ${offset}px)`;
    arrow.style.borderBottomColor = isWin ? "var(--win)" : "var(--lose)";
}

function dropBall() {
    const ball = document.getElementById("ball");
    const hole = document.getElementById("hole");
    
    // Анимация падения к дырке
    ball.style.transition = "all 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)";
    ball.style.left = "175px";
    ball.style.top = "420px";
    ball.style.transform = "translate(-50%, -50%) scale(0.8) rotate(180deg)";
    
    setTimeout(() => {
        // Падение через дырку на поле
        ball.style.transition = "all 0.5s ease";
        
        // Определяем финальную позицию
        let finalLeft = isWin ? 
            `calc(50% - 200px + ${Math.random() * 50}px)` : 
            `calc(50% + 200px - ${Math.random() * 50}px)`;
        
        ball.style.left = finalLeft;
        ball.style.top = "460px";
        ball.style.transform = "translate(-50%, -50%)";
        
        // Изменение цвета шарика
        if (isWin) {
            ball.style.background = "radial-gradient(circle at 30% 30%, #00ff9d, #00cc7a, #009966)";
            ball.style.boxShadow = "0 0 30px #00ff9d";
        } else {
            ball.style.background = "radial-gradient(circle at 30% 30%, #ff4466, #cc0033, #990022)";
            ball.style.boxShadow = "0 0 30px #ff4466";
        }
        
        // Подсветка зоны
        highlightZone(isWin);
        
        // Завершение игры
        setTimeout(() => finishGame(), 800);
    }, 800);
}

function highlightZone(win) {
    const zoneClass = win ? ".win-zone" : ".lose-zone";
    const zone = document.querySelector(zoneClass);
    
    zone.style.animation = "zonePulse 0.5s 3";
    setTimeout(() => {
        zone.style.animation = "";
    }, 1500);
}

function finishGame() {
    // Расчет выигрыша
    if (isWin && window.gameAPI) {
        const winAmount = bet * finalMultiplier;
        window.gameAPI.updateBalance(winAmount);
        
        // Сообщение о победе
        const gameMessage = document.getElementById("gameMessage");
        gameMessage.innerHTML = `🎉 ПОБЕДА! +${winAmount.toFixed(2)} TON (×${finalMultiplier.toFixed(2)})`;
        gameMessage.style.color = "var(--win)";
        
        // Добавление в историю
        addToHistory(finalMultiplier.toFixed(2), true);
        
        // Эффект конфетти
        createConfetti();
    } else {
        const gameMessage = document.getElementById("gameMessage");
        gameMessage.innerHTML = `💔 ПРОИГРЫШ! -${bet.toFixed(2)} TON`;
        gameMessage.style.color = "var(--lose)";
        
        addToHistory("0", false);
    }
    
    // Сброс игры
    resetGame();
}

function resetGame() {
    gameActive = false;
    
    // Сброс шарика
    const ball = document.getElementById("ball");
    ball.style.transition = "all 0.8s ease";
    ball.style.left = "175px";
    ball.style.top = "175px";
    ball.style.transform = "translate(-50%, -50%)";
    ball.style.background = "radial-gradient(circle at 30% 30%,#ff9ccd,#ff6bb5,#ff0080)";
    ball.style.boxShadow = "0 0 25px #ff0080";
    
    // Сброс круга
    const circle = document.getElementById("circle");
    circle.style.transform = "translateX(-50%) rotate(0deg)";
    
    // Сброс стрелки
    document.getElementById("directionArrow").style.display = "none";
    document.getElementById("directionIndicator").style.opacity = "0.5";
    
    // Сброс кнопки
    const startBtn = document.getElementById("startBtn");
    startBtn.disabled = false;
    startBtn.innerHTML = "🎱 СЫГРАТЬ";
    startBtn.style.background = "linear-gradient(45deg,#00c3ff,#0099cc)";
    
    // Сброс множителя
    document.getElementById("bigMultiplier").textContent = "1.00x";
    document.getElementById("bigMultiplier").style.color = "#ff9ccd";
    document.getElementById("currentMultiplier").textContent = "1.00x";
}

function addToHistory(value, isWin) {
    const historyList = document.getElementById("historyList");
    const span = document.createElement("span");
    span.textContent = value + "x";
    span.style.color = isWin ? "var(--win)" : "var(--lose)";
    span.style.animation = "historyAppear 0.5s";
    
    historyList.insertBefore(span, historyList.firstChild);
    
    // Ограничиваем историю 10 элементами
    if (historyList.children.length > 10) {
        historyList.removeChild(historyList.lastChild);
    }
}

function createConfetti() {
    const gameField = document.getElementById("gameField");
    const colors = ['#00ff9d', '#00ff00', '#00cc7a', '#00ffcc'];
    
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement("div");
        confetti.className = "confetti-piece";
        confetti.style.left = Math.random() * 100 + "%";
        confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.width = Math.random() * 10 + 5 + "px";
        confetti.style.height = Math.random() * 10 + 5 + "px";
        
        gameField.appendChild(confetti);
        
        setTimeout(() => {
            confetti.remove();
        }, 2000);
    }
}

// Функция для обновления ставки из поля ввода
function updateBetFromInput() {
    const input = document.getElementById("betAmount");
    let value = parseFloat(input.value);
    
    if (isNaN(value) || value < 0.1 || value > 50) {
        input.value = bet;
        return;
    }
    
    bet = value;
    
    // Обновляем активную кнопку
    document.querySelectorAll(".bet-btn").forEach(btn => {
        const btnValue = parseFloat(btn.getAttribute("data-bet"));
        if (Math.abs(btnValue - bet) < 0.1) {
            btn.classList.add("active");
        } else {
            btn.classList.remove("active");
        }
    });
}

// Инициализация при загрузке
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGame);
} else {
    initGame();
}
