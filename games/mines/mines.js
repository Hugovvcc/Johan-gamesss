// ========== MINES GAME LOGIC (BET RETURNED +0.1) ==========

let mines = [];
let opened = 0;
let mbet = 0;
let gameActive = false;

function initGame() {
    createGrid();
    console.log('✅ Mines game initialized');
}

function createGrid() {
    const grid = document.getElementById('grid');
    if (!grid) return;

    grid.innerHTML = '';
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = 'repeat(5, 1fr)';
    grid.style.gap = '12px';
    grid.style.margin = '25px auto';
    grid.style.maxWidth = '400px';

    for (let i = 0; i < 25; i++) {
        const cell = document.createElement('div');
        cell.className = 'mine-cell';
        cell.textContent = '?';
        cell.dataset.index = i;

        cell.style.cssText = `
            aspect-ratio: 1;
            background: rgba(255,255,255,0.12);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2rem;
            cursor: pointer;
            transition: all 0.25s;
            border: 2px solid rgba(255,150,200,0.3);
            user-select: none;
        `;

        cell.onclick = () => clickCell(cell, i);
        grid.appendChild(cell);
    }
}

function startMines() {
    const betInput = document.getElementById('mbet');
    if (!betInput) return;

    mbet = parseInt(betInput.value);

    if (isNaN(mbet) || mbet < 1) {
        showMessage('Bet must be at least 1 TON', 'lose');
        return;
    }

    if (window.gameAPI.getBalance() < mbet) {
        showMessage('Not enough balance!', 'lose');
        return;
    }

    // снимаем ставку
    window.gameAPI.updateBalance(-mbet);

    opened = 0;
    gameActive = true;

    document.getElementById('opened').textContent = '0';
    document.getElementById('mm').textContent = 'x1.0';
    document.getElementById('cashM').disabled = false;

    // генерация мин
    mines = [];
    const mc = parseInt(document.getElementById('mcount')?.value || 5);

    while (mines.length < mc) {
        const r = Math.floor(Math.random() * 25);
        if (!mines.includes(r)) mines.push(r);
    }

    createGrid();
    showMessage('Game started! 💎', 'win');
}

function clickCell(cell, index) {
    if (!gameActive || cell.dataset.open) return;

    cell.dataset.open = 'true';
    cell.style.cursor = 'default';

    if (mines.includes(index)) {
        // 💣 МИНА
        cell.textContent = '💣';
        cell.style.background = 'rgba(255,68,102,0.35)';
        cell.style.borderColor = '#ff4466';

        gameActive = false;
        document.getElementById('cashM').disabled = true;
        showMessage(`BOOM! Lost ${mbet} TON`, 'lose');

        revealAllMines();
    } else {
        // 💎 АЛМАЗ
        cell.textContent = '💎';
        cell.style.background = 'rgba(0,255,157,0.25)';
        cell.style.borderColor = '#00ff9d';

        opened++;
        document.getElementById('opened').textContent = opened;

        const multiplier = 1 + opened * 0.1;
        document.getElementById('mm').textContent = `x${multiplier.toFixed(1)}`;
    }
}

function cashMines() {
    if (!gameActive || opened === 0) {
        showMessage('Open at least 1 cell!', 'lose');
        return;
    }

    const profit = opened * 0.1;      // +0.1 за ячейку
    const totalWin = mbet + profit;   // депозит + выигрыш

    window.gameAPI.updateBalance(totalWin);

    gameActive = false;
    document.getElementById('cashM').disabled = true;

    showMessage(
        `Cashed out! ${totalWin.toFixed(1)} TON 💰`,
        'win'
    );
}

function revealAllMines() {
    document.querySelectorAll('.mine-cell').forEach(cell => {
        const i = parseInt(cell.dataset.index);
        if (mines.includes(i) && !cell.dataset.open) {
            cell.textContent = '💣';
            cell.style.background = 'rgba(255,68,102,0.5)';
            cell.style.borderColor = '#ff4466';
        }
    });
}

function showMessage(text, type) {
    const msg = document.getElementById('minesMsg');
    if (!msg) return;
    msg.textContent = text;
    msg.className = `message ${type}`;
}

console.log('Mines script loaded (bet returned system)');
