let bal = 100;
const balEl = document.getElementById('bal');
const gameContainer = document.getElementById('game-container');
let loadedGame = null;

function updateBalance() {
    balEl.textContent = bal.toFixed(1);
}

// Глобальный API для игр (оставляем как было для Mines и Crash)
window.gameAPI = {
    getBalance: () => bal,
    updateBalance: (amount) => {
        bal += amount;
        updateBalance();
        return bal;
    }
};

// Загрузка игры
function loadGame(gameName) {
    console.log(`🔄 Загружаем игру: ${gameName}`);
    
    // Очищаем контейнер
    gameContainer.innerHTML = '<div class="card" style="text-align:center;padding:40px">Загрузка игры...</div>';
    
    // Формируем пути к файлам
    const htmlPath = `games/${gameName}/${gameName}.html`;
    const cssPath = `games/${gameName}/${gameName}.css`;
    const jsPath = `games/${gameName}/${gameName}.js`;
    
    console.log(`📁 Пути: HTML=${htmlPath}, CSS=${cssPath}, JS=${jsPath}`);
    
    // 1. Загружаем HTML
    fetch(htmlPath)
        .then(response => {
            if (!response.ok) throw new Error(`Ошибка ${response.status}: ${response.statusText}`);
            return response.text();
        })
        .then(html => {
            gameContainer.innerHTML = html;
            loadedGame = gameName;
            console.log(`✅ HTML загружен: ${gameName}`);
            
            // Специальная инициализация для Ball Escape
            if (gameName === 'ball-escape') {
                // Добавляем интеграцию баланса
                const balanceIntegration = `
                    <script>
                        // Глобальная функция для получения баланса
                        window.getGameBalance = function() {
                            return ${bal};
                        };
                    </script>
                `;
                
                // Вставляем интеграцию
                const scriptEl = document.createElement('div');
                scriptEl.innerHTML = balanceIntegration;
                gameContainer.appendChild(scriptEl);
            }
            
            // 2. Загружаем CSS
            return new Promise((resolve) => {
                // Удаляем старые стили игры
                document.querySelectorAll('link[data-game-css]').forEach(link => link.remove());
                
                const cssLink = document.createElement('link');
                cssLink.rel = 'stylesheet';
                cssLink.href = cssPath;
                cssLink.setAttribute('data-game-css', gameName);
                
                cssLink.onload = () => {
                    console.log(`✅ CSS загружен: ${gameName}`);
                    resolve();
                };
                
                cssLink.onerror = () => {
                    console.warn(`⚠️ CSS не загружен: ${cssPath}`);
                    resolve(); // Продолжаем без CSS
                };
                
                document.head.appendChild(cssLink);
            });
        })
        .then(() => {
            // 3. Загружаем JS
            return new Promise((resolve) => {
                // Удаляем старые скрипты игры
                document.querySelectorAll('script[data-game-js]').forEach(script => script.remove());
                
                const jsScript = document.createElement('script');
                jsScript.src = jsPath;
                jsScript.setAttribute('data-game-js', gameName);
                
                jsScript.onload = () => {
                    console.log(`✅ JS загружен: ${gameName}`);
                    
                    // Для Ball Escape вызываем специальную инициализацию
                    if (gameName === 'ball-escape') {
                        // Даем время для загрузки DOM
                        setTimeout(() => {
                            initBallEscapeGame();
                        }, 100);
                    } else if (typeof initGame === 'function') {
                        // Для других игр как обычно
                        console.log(`🎮 Инициализируем игру: ${gameName}`);
                        initGame();
                    }
                    
                    resolve();
                };
                
                jsScript.onerror = (error) => {
                    console.error(`❌ Ошибка загрузки JS: ${jsPath}`, error);
                    gameContainer.innerHTML += `
                        <div class="card" style="color:red;margin-top:20px">
                            <h3>Ошибка загрузки игры</h3>
                            <p>Файл ${jsPath} не найден</p>
                            <p>Проверьте что файл существует</p>
                        </div>
                    `;
                    resolve();
                };
                
                document.body.appendChild(jsScript);
            });
        })
        .catch(error => {
            console.error('❌ Ошибка загрузки игры:', error);
            gameContainer.innerHTML = `
                <div class="card" style="color:red">
                    <h3>Не могу загрузить игру: ${gameName}</h3>
                    <p>Ошибка: ${error.message}</p>
                    <p>Проверьте что папка 'games/${gameName}/' существует</p>
                    <button onclick="loadGame('mines')" style="margin-top:20px">
                        Вернуться к Mines
                    </button>
                </div>
            `;
        });
}

// Специальная функция для инициализации Ball Escape
function initBallEscapeGame() {
    console.log('🎮 Инициализируем Ball Escape');
    
    // Получаем элементы Ball Escape
    const playBtn = document.getElementById('playBtn');
    const balanceDisplay = document.getElementById('globalBalance');
    const currentBetDisplay = document.getElementById('currentBetDisplay');
    
    if (playBtn && balanceDisplay) {
        // Обновляем отображение баланса
        balanceDisplay.textContent = bal.toFixed(2);
        
        // Сохраняем оригинальный обработчик
        const originalOnClick = playBtn.onclick;
        
        // Обновляем обработчик кнопки "Играть"
        playBtn.onclick = function() {
            // Получаем текущую ставку
            let betAmount = 1;
            if (currentBetDisplay) {
                betAmount = parseInt(currentBetDisplay.textContent) || 1;
            }
            
            // Проверяем баланс
            if (bal < betAmount) {
                showBallEscapeMessage('Недостаточно баланса!', 'error');
                return false;
            }
            
            // Списание ставки
            bal -= betAmount;
            updateBalance();
            balanceDisplay.textContent = bal.toFixed(2);
            console.log(`🎲 Ball Escape: списано ${betAmount}, новый баланс: ${bal}`);
            
            // Запускаем оригинальную игру
            if (originalOnClick) {
                return originalOnClick.call(this);
            }
            
            return true;
        };
        
        console.log('✅ Ball Escape инициализирован с интеграцией баланса');
    }
    
    // Инициализируем функцию для обработки выигрыша
    window.processBallEscapeWin = function(winAmount) {
        if (winAmount > 0) {
            bal += winAmount;
            updateBalance();
            
            const balanceDisplay = document.getElementById('globalBalance');
            if (balanceDisplay) {
                balanceDisplay.textContent = bal.toFixed(2);
            }
            
            console.log(`💰 Ball Escape: выигрыш ${winAmount}, новый баланс: ${bal}`);
        }
    };
}

// Вспомогательная функция для сообщений Ball Escape
function showBallEscapeMessage(text, type) {
    const gameMsg = document.getElementById('gameMessage');
    if (gameMsg) {
        gameMsg.innerHTML = text;
        gameMsg.className = `game-notification ${type}`;
        gameMsg.classList.remove('hidden');
        
        setTimeout(() => {
            gameMsg.classList.add('hidden');
        }, 3000);
    }
}

// Инициализация
updateBalance();
console.log('🎯 Главный скрипт загружен');
