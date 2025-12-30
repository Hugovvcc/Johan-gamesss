let bal = 100;
const balEl = document.getElementById('bal');
const gameContainer = document.getElementById('game-container');

function updateBalance() {
    balEl.textContent = bal.toFixed(1);
}

// Глобальный API для игр
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
    console.log(`Loading game: ${gameName}`);
    
    // Очищаем контейнер
    gameContainer.innerHTML = '<div class="card" style="text-align:center;padding:40px">Loading game...</div>';
    
    // Загружаем HTML
    fetch(`games/${gameName}/${gameName}.html`)
        .then(response => {
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return response.text();
        })
        .then(html => {
            gameContainer.innerHTML = html;
            
            // Загружаем CSS
            const cssLink = document.createElement('link');
            cssLink.rel = 'stylesheet';
            cssLink.href = `games/${gameName}/${gameName}.css`;
            document.head.appendChild(cssLink);
            
            // Загружаем JS
            const script = document.createElement('script');
            script.src = `games/${gameName}/${gameName}.js`;
            
            script.onload = () => {
                console.log(`${gameName} script loaded`);
                if (typeof initGame === 'function') {
                    initGame();
                }
            };
            
            script.onerror = () => {
                console.error(`Failed to load ${gameName}.js`);
                gameContainer.innerHTML = `
                    <div class="card" style="color:red">
                        <h3>Error loading ${gameName}</h3>
                        <p>Check console for details</p>
                    </div>
                `;
            };
            
            document.body.appendChild(script);
        })
        .catch(error => {
            console.error('Fetch error:', error);
            gameContainer.innerHTML = `
                <div class="card" style="color:red">
                    <h3>Cannot load ${gameName}</h3>
                    <p>Make sure folder 'games/${gameName}/' exists</p>
                    <p>Error: ${error.message}</p>
                </div>
            `;
        });
}

// Инициализация
updateBalance();
console.log('Main script loaded');
