let mines = [], opened = 0, multi = 1, mbet = 0;
let currentBalance, updateGlobalBalance;

function initMines(balance, updateBalanceFunc) {
    currentBalance = balance;
    updateGlobalBalance = updateBalanceFunc;
}

function startMines() {
    mbet = parseFloat(document.getElementById('mbet').value);
    if (isNaN(mbet) || mbet < 0.1 || mbet > 10) {
        document.getElementById('minesMsg').textContent = "Bet 0.1-10 TON";
        return;
    }
    if (currentBalance < mbet) {
        document.getElementById('minesMsg').textContent = "No balance";
        return;
    }
    
    // Используем API для обновления баланса
    window.gameAPI.updateBalance(-mbet);
    
    opened = 0; multi = 1;
    document.getElementById('opened').textContent = 0;
    document.getElementById('mm').textContent = "1.00";
    document.getElementById('cashM').disabled = false;
    document.getElementById('minesMsg').textContent = '';
    document.getElementById('minesMsg').className = 'message';
    
    // Генерация мин...
    // ... остальная логика без изменений
}
