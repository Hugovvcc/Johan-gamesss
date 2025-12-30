// ========== MINES GAME LOGIC ==========

let mines = [];
let opened = 0;
let multi = 1;
let mbet = 0;
let gameActive = false;

function initGame() {
    console.log('✅ Mines game initialized');
    createGrid();
}

function createGrid() {
    const grid = document.getElementById('grid');
    if (!grid) {
        console.error('Grid element not found!');
        return;
    }
    
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
            background: rgba(255, 255, 255, 0.12);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2rem;
            cursor: pointer;
            transition: all 0.3s;
            border: 2px solid rgba(255, 150, 200, 0.3);
            user-select: none;
        `;
        
        cell.onmouseover = () => {
            if (!cell.dataset.open && gameActive) {
                cell.style.background = 'rgba(255, 150, 200, 0.25)';
                cell.style.transform = 'scale(1.05)';
            }
        };
        
        cell.onmouseout = () => {
            if (!cell.dataset.open) {
                cell.style.background = 'rgba(255, 255, 255, 0.12)';
                cell.style.transform = 'scale(1)';
            }
        };
        
        cell.onclick = () => clickCell(cell, i);
        grid.appendChild(cell);
    }
}

function startMines() {
    const betInput = document.getElementById('mbet');
    if (!betInput) {
        alert('Bet input not found!');
        return;
    }
    
    mbet = parseFloat(betInput.value);
    if (isNaN(mbet) || mbet < 0.1 || mbet > 10) {
        showMessage('Bet 0.1-10 TON', 'lose');
        return;
    }
    
    const currentBalance = window.gameAPI.getBalance();
    if (currentBalance < mbet) {
        showMessage('Not enough balance!', 'lose');
        return;
    }
    
    // Deduct bet
    window.gameAPI.updateBalance(-mbet);
    
    // Reset game
    opened = 0;
    multi = 1;
    gameActive = true;
    
    document.getElementById('opened').textContent = '0';
    document.getElementById('mm').textContent = '1.00';
    document.getElementById('cashM').disabled = false;
    showMessage('Game started! Find diamonds! 💎', 'win');
    
    // Generate mines
    mines = [];
    const mcountSelect = document.getElementById('mcount');
    const mc = parseInt(mcountSelect ? mcountSelect.value : 5);
    
    while (mines.length < mc) {
        let r = Math.floor(Math.random() * 25);
        if (!mines.includes(r)) mines.push(r);
    }
    
    console.log(`Mines at positions: ${mines}`);
    
    // Reset grid
    createGrid();
}

function clickCell(cell, index) {
    if (!gameActive || cell.dataset.open) return;
    
    cell.dataset.open = 'true';
    cell.style.cursor = 'default';
    cell.style.transform = 'scale(1)';
    cell.style.border = '3px solid';
    
    if (mines.includes(index)) {
        // MINE HIT
        cell.textContent = '💣';
        cell.style.background = 'rgba(255, 68, 102, 0.3)';
        cell.style.borderColor = '#ff4466';
        cell.style.animation = 'shake 0.5s';
        
        gameActive = false;
        document.getElementById('cashM').disabled = true;
        showMessage(`BOOM! Lost ${mbet.toFixed(1)} TON`, 'lose');
        
        // Show all mines
        setTimeout(() => revealAllMines(), 500);
    } else {
        // SAFE CELL
        cell.textContent = '💎';
        cell.style.background = 'rgba(0, 255, 157, 0.2)';
        cell.style.borderColor = '#00ff9d';
        cell.style.animation = 'pop 0.3s';
        
        opened++;
        multi *= 1.02;
        document.getElementById('opened').textContent = opened;
        document.getElementById('mm').textContent = multi.toFixed(2);
    }
}

function revealAllMines() {
    const cells = document.querySelectorAll('.mine-cell');
    cells.forEach(cell => {
        const index = parseInt(cell.dataset.index);
        if (mines.includes(index) && !cell.dataset.open) {
            cell.textContent = '💣';
            cell.style.background = 'rgba(255, 68, 102, 0.5)';
            cell.style.borderColor = '#ff4466';
        }
    });
}

function cashMines() {
    if (!gameActive || multi === 1) {
        showMessage('Open at least 1 cell first!', 'lose');
        return;
    }
    
    const win = mbet * (multi - 1);
    window.gameAPI.updateBalance(win);
    gameActive = false;
    document.getElementById('cashM').disabled = true;
    showMessage(`Cashed out! +${win.toFixed(2)} TON 🎉`, 'win');
}

function showMessage(text, type) {
    const msg = document.getElementById('minesMsg');
    if (msg) {
        msg.textContent = text;
        msg.className = `message ${type}`;
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
    
    @keyframes pop {
        0% { transform: scale(0.8); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
    }
`;
document.head.appendChild(style);

console.log('Mines game script loaded');
