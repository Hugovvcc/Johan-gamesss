// Интеграция с основной системой баланса
if (typeof window.getGameBalance === 'function') {
    // Используем баланс из основной системы
    var userBalance = window.getGameBalance();
} else {
    // Запасной вариант
    var userBalance = 1000;
}

// Функция для обновления баланса через основную систему
function updateGameBalance(amount) {
    if (typeof window.processGameWin === 'function' && amount > 0) {
        return window.processGameWin(amount);
    } else if (typeof window.placeGameBet === 'function' && amount < 0) {
        return window.placeGameBet(-amount);
    }
    return false;
}

// Функция для получения текущего баланса
function getCurrentBalance() {
    if (typeof window.getGameBalance === 'function') {
        return window.getGameBalance();
    }
    return userBalance;
}

// Обновляем все вызовы обновления баланса в игре:
// Вместо: userBalance += amount
// Используйте: if (updateGameBalance(amount)) { /* успех */ }

// Вместо: userBalance -= bet
// Используйте: if (updateGameBalance(-bet)) { /* успех */ }

// Для отображения баланса всегда используйте:
// balanceDisplay.textContent = getCurrentBalance().toFixed(2);
