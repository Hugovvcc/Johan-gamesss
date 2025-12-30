document.addEventListener('DOMContentLoaded', function() {
    // Получаем элементы
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const playBtn = document.getElementById('playBtn');
    const addGiftBtn = document.getElementById('addGiftBtn');
    const betButtons = document.querySelectorAll('.bet-btn');
    const balanceEl = document.getElementById('balance');
    const currentBetEl = document.getElementById('currentBet');
    const winAmountEl = document.getElementById('winAmount');
    const lastResultEl = document.getElementById('lastResult');
    const betHistoryEl = document.getElementById('betHistory');
    const helpBtn = document.getElementById('helpBtn');
    const settingsBtn = document.getElementById('settingsBtn');
    const helpModal = document.getElementById('helpModal');
    const settingsModal = document.getElementById('settingsModal');
    const closeModalButtons = document.querySelectorAll('.close-modal');
    const soundToggle = document.getElementById('soundToggle');
    const rotationSpeedControl = document.getElementById('rotationSpeed');
    const ballSpeedControl = document.getElementById('ballSpeed');
    
    // Игровые переменные
    let balance = 1000;
    let currentBet = 1;
    let winAmount = 0;
    let isPlaying = false;
    let gameHash = "c1eaf7b8a9d6c5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0cd3";
    let gameHistory = [];
    
    // Переменные для игры
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const circleRadius = 250;
    const holeSize = 60; // размер отверстия
    const ballRadius = 12;
    
    let circleRotation = 0;
    let holeAngle = Math.PI / 4; // начальный угол отверстия (45 градусов)
    let ballX = centerX;
    let ballY = centerY - 150;
    let ballSpeedX = 0;
    let ballSpeedY = 0;
    let ballLaunched = false;
    let gameResult = null;
    
    // Настройки игры
    let rotationSpeed = 0.005;
    let ballInitialSpeed = 5;
    let soundEnabled = true;
    
    // Инициализация игры
    function initGame() {
        updateDisplay();
        drawGame();
        
        // Установка обработчиков событий
        playBtn.addEventListener('click', startGame);
        addGiftBtn.addEventListener('click', addGift);
        
        betButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                setBet(parseInt(this.dataset.bet));
            });
        });
        
        helpBtn.addEventListener('click', () => showModal(helpModal));
        settingsBtn.addEventListener('click', () => showModal(settingsModal));
        
        closeModalButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                helpModal.style.display = 'none';
                settingsModal.style.display = 'none';
            });
        });
        
        soundToggle.addEventListener('change', function() {
            soundEnabled = this.checked;
        });
        
        rotationSpeedControl.addEventListener('input', function() {
            rotationSpeed = this.value * 0.001;
        });
        
        ballSpeedControl.addEventListener('input', function() {
            ballInitialSpeed = this.value;
        });
        
        // Закрытие модальных окон при клике вне их
        window.addEventListener('click', function(event) {
            if (event.target === helpModal) {
                helpModal.style.display = 'none';
            }
            if (event.target === settingsModal) {
                settingsModal.style.display = 'none';
            }
        });
        
        // Запуск игрового цикла
        gameLoop();
    }
    
    // Игровой цикл
    function gameLoop() {
        updateGame();
        drawGame();
        requestAnimationFrame(gameLoop);
    }
    
    // Обновление состояния игры
    function updateGame() {
        if (!isPlaying) return;
        
        // Вращение круга
        circleRotation += rotationSpeed;
        
        // Если шарик запущен
        if (ballLaunched) {
            // Обновление позиции шарика
            ballX += ballSpeedX;
            ballY += ballSpeedY;
            
            // Проверка столкновения с границами круга
            const dx = ballX - centerX;
            const dy = ballY - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Если шарик достиг границы круга
            if (distance > circleRadius - ballRadius) {
                // Проверяем, находится ли шарик в области отверстия
                const ballAngle = Math.atan2(dy, dx);
                const relativeAngle = (ballAngle - circleRotation) % (2 * Math.PI);
                const holeAngleRad = holeAngle;
                
                // Если шарик попадает в отверстие
                if (Math.abs(relativeAngle - holeAngleRad) < holeSize / (2 * circleRadius)) {
                    // Шарик выпадает - выигрыш
                    gameResult = 'win';
                    endGame();
                    return;
                }
                
                // Отскок от стенки
                const normalX = dx / distance;
                const normalY = dy / distance;
                
                // Скалярное произведение для отражения
                const dotProduct = ballSpeedX * normalX + ballSpeedY * normalY;
                ballSpeedX = ballSpeedX - 2 * dotProduct * normalX;
                ballSpeedY = ballSpeedY - 2 * dotProduct * normalY;
                
                // Добавляем немного трения
                ballSpeedX *= 0.98;
                ballSpeedY *= 0.98;
                
                // Корректируем позицию шарика, чтобы он не застрял в стене
                ballX = centerX + normalX * (circleRadius - ballRadius);
                ballY = centerY + normalY * (circleRadius - ballRadius);
                
                // Проигрываем звук отскока
                if (soundEnabled) playBounceSound();
            }
            
            // Проверяем, не остановился ли шарик
            const speed = Math.sqrt(ballSpeedX * ballSpeedX + ballSpeedY * ballSpeedY);
            if (speed < 0.1 && gameResult === null) {
                // Шарик остановился внутри круга - проигрыш
                gameResult = 'loss';
                endGame();
            }
        }
    }
    
    // Отрисовка игры
    function drawGame() {
        // Очистка холста
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Рисуем внешний круг
        ctx.beginPath();
        ctx.arc(centerX, centerY, circleRadius, 0, Math.PI * 2);
        ctx.fillStyle = '#0f3460';
        ctx.fill();
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#00b4db';
        ctx.stroke();
        
        // Рисуем отверстие
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(circleRotation);
        
        // Вырезаем отверстие
        ctx.beginPath();
        ctx.arc(
            Math.cos(holeAngle) * circleRadius,
            Math.sin(holeAngle) * circleRadius,
            holeSize / 2,
            0,
            Math.PI * 2
        );
        ctx.fillStyle = '#1a1a2e';
        ctx.fill();
        
        // Контур отверстия
        ctx.beginPath();
        ctx.arc(
            Math.cos(holeAngle) * circleRadius,
            Math.sin(holeAngle) * circleRadius,
            holeSize / 2,
            0,
            Math.PI * 2
        );
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#ff416c';
        ctx.stroke();
        
        ctx.restore();
        
        // Рисуем шарик
        ctx.beginPath();
        ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
        
        if (gameResult === 'win') {
            // Зеленый шарик при выигрыше
            const gradient = ctx.createRadialGradient(
                ballX, ballY, 0,
                ballX, ballY, ballRadius
            );
            gradient.addColorStop(0, '#4CAF50');
            gradient.addColorStop(1, '#2E7D32');
            ctx.fillStyle = gradient;
        } else if (gameResult === 'loss') {
            // Красный шарик при проигрыше
            const gradient = ctx.createRadialGradient(
                ballX, ballY, 0,
                ballX, ballY, ballRadius
            );
            gradient.addColorStop(0, '#f44336');
            gradient.addColorStop(1, '#c62828');
            ctx.fillStyle = gradient;
        } else {
            // Синий шарик во время игры
            const gradient = ctx.createRadialGradient(
                ballX, ballY, 0,
                ballX, ballY, ballRadius
            );
            gradient.addColorStop(0, '#00b4db');
            gradient.addColorStop(1, '#0083b0');
            ctx.fillStyle = gradient;
        }
        
        ctx.fill();
        
        // Тень шарика
        ctx.beginPath();
        ctx.arc(ballX + 2, ballY + 2, ballRadius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fill();
        
        // Рисуем центр
        ctx.beginPath();
        ctx.arc(centerX, centerY, 10, 0, Math.PI * 2);
        ctx.fillStyle = '#ffc107';
        ctx.fill();
        
        // Рисуем направляющую линию, если игра не началась
        if (!ballLaunched && !isPlaying) {
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(ballX, ballY);
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.setLineDash([5, 5]);
            ctx.stroke();
            ctx.setLineDash([]);
        }
        
        // Отображаем текущий множитель
        ctx.font = 'bold 24px Arial';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText('2.98x', centerX, centerY + 300);
    }
    
    // Начало игры
    function startGame() {
        if (isPlaying || balance < currentBet) return;
        
        // Сброс состояния игры
        resetGame();
        
        // Спишем ставку
        balance -= currentBet;
        isPlaying = true;
        playBtn.disabled = true;
        
        // Запускаем шарик
        setTimeout(() => {
            launchBall();
        }, 1000);
        
        updateDisplay();
    }
    
    // Запуск шарика
    function launchBall() {
        ballLaunched = true;
        
        // Направляем шарик в случайном направлении
        const angle = Math.random() * Math.PI * 2;
        ballSpeedX = Math.cos(angle) * ballInitialSpeed;
        ballSpeedY = Math.sin(angle) * ballInitialSpeed;
        
        // Случайное положение отверстия
        holeAngle = Math.random() * Math.PI * 2;
    }
    
    // Завершение игры
    function endGame() {
        isPlaying = false;
        ballLaunched = false;
        
        let winMultiplier = 2.98;
        let win = 0;
        
        if (gameResult === 'win') {
            win = currentBet * winMultiplier;
            balance += win;
            winAmount = win;
            
            if (soundEnabled) playWinSound();
        } else {
            winAmount = 0;
            if (soundEnabled) playLossSound();
        }
        
        // Добавляем в историю
        addToHistory(gameResult, win);
        
        // Обновляем отображение
        updateDisplay();
        
        // Разблокируем кнопку через 2 секунды
        setTimeout(() => {
            playBtn.disabled = false;
            gameResult = null;
        }, 2000);
    }
    
    // Сброс игры
    function resetGame() {
        ballX = centerX;
        ballY = centerY - 150;
        ballSpeedX = 0;
        ballSpeedY = 0;
        ballLaunched = false;
        gameResult = null;
        circleRotation = 0;
    }
    
    // Установка ставки
    function setBet(bet) {
        currentBet = bet;
        
        // Обновляем активную кнопку
        betButtons.forEach(btn => {
            if (parseInt(btn.dataset.bet) === bet) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        
        updateDisplay();
    }
    
    // Добавление гифта (демо-функция)
    function addGift() {
        if (soundEnabled) {
            const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-unlock-game-notification-253.mp3');
            audio.volume = 0.3;
            audio.play();
        }
        
        alert('Функция "Добавить гифт" в демо-режиме. В полной версии здесь можно будет добавить бонусы!');
    }
    
    // Обновление отображения
    function updateDisplay() {
        balanceEl.textContent = balance.toFixed(2);
        currentBetEl.textContent = currentBet;
        winAmountEl.textContent = winAmount.toFixed(2);
        
        if (gameResult === 'win') {
            lastResultEl.textContent = `Выигрыш ${(currentBet * 2.98).toFixed(2)}`;
            lastResultEl.style.color = '#4CAF50';
        } else if (gameResult === 'loss') {
            lastResultEl.textContent = 'Проигрыш';
            lastResultEl.style.color = '#f44336';
        } else {
            lastResultEl.textContent = '-';
            lastResultEl.style.color = '#e0e0ff';
        }
        
        document.getElementById('gameHash').textContent = gameHash;
    }
    
    // Добавление в историю
    function addToHistory(result, win) {
        const historyItem = {
            id: Date.now(),
            result: result,
            bet: currentBet,
            win: win,
            time: new Date().toLocaleTimeString()
        };
        
        gameHistory.unshift(historyItem);
        
        // Ограничиваем историю 10 последними записями
        if (gameHistory.length > 10) {
            gameHistory.pop();
        }
        
        updateHistoryDisplay();
    }
    
    // Обновление отображения истории
    function updateHistoryDisplay() {
        betHistoryEl.innerHTML = '';
        
        gameHistory.forEach(item => {
            const historyItemEl = document.createElement('div');
            historyItemEl.className = `history-item ${item.result}`;
            
            historyItemEl.innerHTML = `
                <span>${item.time}</span>
                <span>${item.bet}</span>
                <span>${item.result === 'win' ? '+' + item.win.toFixed(2) : '0'}</span>
            `;
            
            betHistoryEl.appendChild(historyItemEl);
        });
    }
    
    // Показать модальное окно
    function showModal(modal) {
        modal.style.display = 'flex';
    }
    
    // Воспроизведение звуков (используем базовые звуки)
    function playBounceSound() {
        if (!soundEnabled) return;
        
        // Создаем простой звук отскока
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 300 + Math.random() * 200;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    }
    
    function playWinSound() {
        if (!soundEnabled) return;
        
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
        oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
        oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
        
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    }
    
    function playLossSound() {
        if (!soundEnabled) return;
        
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.set
