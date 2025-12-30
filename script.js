let bal = 100;
const balEl = document.getElementById('bal');
const gameContainer = document.getElementById('game-container');

function updateBalance() {
    balEl.textContent = bal.toFixed(1);
}

function loadGame(gameName) {
    // Загружаем HTML игры
    fetch(`games/${gameName}/${gameName}.html`)
        .then(response => response.text())
        .then(html => {
            gameContainer.innerHTML = html;
            
            // Загружаем CSS игры
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = `games/${gameName}/${gameName}.css`;
            document.head.appendChild(link);
            
            // Загружаем JS игры
            const script = document.createElement('script');
            script.src = `games/${gameName}/${gameName}.js`;
            script.onload = function() {
                // Инициализируем игру с передачей баланса
                if (window[`init${gameName.charAt(0).toUpperCase() + gameName.slice(1)}`]) {
                    window[`init${gameName.charAt(0).toUpperCase() + gameName.slice(1)}`](bal, updateBalance);
                }
            };
            document.body.appendChild(script);
        })
        .catch(error => console.error('Error loading game:', error));
}

// Экспортируем функции для использования в играх
window.gameAPI = {
    getBalance: () => bal,
    updateBalance: (amount) => {
        bal += amount;
        updateBalance();
    }
};
