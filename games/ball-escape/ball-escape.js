// ========== BALL ESCAPE GAME LOGIC ==========

let beGameActive = false;
let beTimer = 0;
let beTimerInterval = null;
let beBallInterval = null;
let beBet = 0;
let beMultiplier = 1.0;
let beCurrentCell = 0;
let beTimeLimit = 4; // секунд по умолчанию
let beTotalCells = 25;
let beScore = 0;

function initGame() {
    console.log('✅ Ball Escape game initialized');
    createGrid();
}

function createGrid() {
    const gridContainer = document.getElementById('gridContainer');
    if (!gridContainer) return;
    
    gridContainer.innerHTML = '';
    
    for (let i = 0; i < beTotalCells; i++) {
        const cell = document.createElement('div');
        cell.className = 'be-cell';
        cell.dataset.index = i;
        cell.style.aspectRatio = '1';
        gridContainer.appendChild(cell);
    }
}

function startBallEscape() {
    const betInput = document.getElementById('bebet');
    if (!betInput) {
        alert('Bet input not found!');
        return;
    }
    
    beBet = parseFloat(betInput.value);
    if (isNaN(beBet) || beBet < 0.1 || beBet > 10) {
        showMessage('Bet 0.1-10 TON', 'lose');
        return;
    }
    
    const currentBalance = window.gameAPI.getBalance();
    if (currentBalance < beBet) {
        showMessage('Not enough balance!', 'lose');
        return;
    }
    
    // Deduct bet
    window.gameAPI.updateBalance(-beBet);
    
    // Reset game
    beGameActive = true;
    beScore = 0;
    beMultiplier = 1.0;
    
    // Set difficulty
    const difficulty = document.getElementById('bedifficulty').value;
    switch(difficulty) {
        case 'easy': beTimeLimit = 5; break;
        case 'medium': beTimeLimit = 4; break;
        case 'hard': beTimeLimit = 3; break;
        case 'extreme': beTimeLimit = 2; break;
    }
    
    beTimer = beTimeLimit;
    
    // Update UI
    document.getElementById('startBE').disabled = true;
    document.getElementById('catchBE').disabled = false;
    document.getElementById('bemultiplier').textContent = beMultiplier.toFixed(2) + 'x';
    
    showMessage(`Catch the ball in ${beTimeLimit} seconds!`, 'win');
    
    // Create grid
    createGrid();
    
    // Show ball in random position
    moveBallToRandomCell();
    
    // Start timer
    startTimer();
    
    // Start ball movement
    startBallMovement();
    
    // Update countdown display
    updateCountdownDisplay();
}

function moveBallToRandomCell() {
    const oldCell = document.querySelector('.be-cell.active');
    if (oldCell) {
        oldCell.classList.remove('active');
    }
    
    // Выбираем новую случайную ячейку
    let newCellIndex;
    do {
        newCellIndex = Math.floor(Math.random() * beTotalCells);
    } while (newCellIndex === beCurrentCell);
    
    beCurrentCell = newCellIndex;
    
    const cells = document.querySelectorAll('.be-cell');
    const newCell = cells[beCurrentCell];
    newCell.classList.add('active');
    
    // Move the ball element
    const ball = document.getElementById('ball');
    if (ball) {
        const cellRect = newCell.getBoundingClientRect();
        const containerRect = document.getElementById('beGameArea').getBoundingClientRect();
        
        ball.style.display = 'block';
        ball.style.left = (cellRect.left - containerRect.left + cellRect.width / 2 - 40) + 'px';
        ball.style.top = (cellRect.top - containerRect.top + cellRect.height / 2 - 40) + 'px';
    }
}

function startBallMovement() {
    if (beBallInterval) clearInterval(beBallInterval);
    
    // Ball moves every 0.8-1.2 seconds randomly
    beBallInterval = setInterval(() => {
        if (!beGameActive) return;
        moveBallToRandomCell();
        beMultiplier += 0.05; // Multiplier increases as ball moves
        document.getElementById('bemultiplier').textContent = beMultiplier.toFixed(2) + 'x';
    }, 800 + Math.random() * 400);
}

function startTimer() {
    if (beTimerInterval) clearInterval(beTimerInterval);
    
    beTimerInterval = setInterval(() => {
        if (!beGameActive) return;
        
        beTimer--;
        updateCountdownDisplay();
        
        if (beTimer <= 0) {
            gameOver(false); // Time's up
        }
    }, 1000);
}

function updateCountdownDisplay() {
    const countdownEl = document.getElementById('becountdown');
    const timerCircle = document.getElementById('timerCircle');
    
    if (countdownEl) {
        countdownEl.textContent = `Time: ${beTimer}s`;
        
        if (beTimer <= 3) {
            countdownEl.classList.add('timer-warning');
            if (beTimer <= 1) {
                countdownEl.classList.remove('timer-warning');
                countdownEl.classList.add('timer-danger');
            }
        } else {
            countdownEl.classList.remove('timer-warning', 'timer-danger');
        }
    }
    
    if (timerCircle) {
        timerCircle.textContent = beTimer;
        timerCircle.style.color = beTimer > 3 ? '#ff6bb5' : (beTimer > 1 ? '#ff9900' : '#ff4466');
    }
}

function catchBall() {
    if (!beGameActive) return;
    
    // Calculate win
    const winAmount = beBet * (beMultiplier - 1);
    window.gameAPI.updateBalance(winAmount);
    
    // Visual feedback
    const ball = document.getElementById('ball');
    if (ball) {
        ball.classList.add('caught');
    }
    
    // Show success
    showMessage(`SUCCESS! +${winAmount.toFixed(2)} TON (${beMultiplier.toFixed(2)}x)`, 'win');
    
    // End game
    gameOver(true);
}

function gameOver(success) {
    beGameActive = false;
    
    // Clear intervals
    if (beTimerInterval) {
        clearInterval(beTimerInterval);
        beTimerInterval = null;
    }
    
    if (beBallInterval) {
        clearInterval(beBallInterval);
        beBallInterval = null;
    }
    
    // Update UI
    document.getElementById('startBE').disabled = false;
    document.getElementById('catchBE').disabled = true;
    
    const countdownEl = document.getElementById('becountdown');
    const timerCircle = document.getElementById('timerCircle');
    
    if (success) {
        if (countdownEl) countdownEl.textContent = '🎉 BALL CAUGHT! 🎉';
        if (timerCircle) timerCircle.textContent = 'WIN';
        
        // Victory animation
        const cells = document.querySelectorAll('.be-cell');
        cells.forEach((cell, index) => {
            setTimeout(() => {
                cell.style.background = 'rgba(0, 255, 157, 0.3)';
                cell.style.transform = 'scale(1.05)';
                
                setTimeout(() => {
                    cell.style.background = '';
                    cell.style.transform = '';
                }, 300);
            }, index * 50);
        });
    } else {
        if (countdownEl) countdownEl.textContent = '💥 TIME IS UP! 💥';
        if (timerCircle) timerCircle.textContent = 'LOST';
        
        showMessage(`Too slow! Lost ${beBet.toFixed(2)} TON`, 'lose');
        
        // Failure animation
        const ball = document.getElementById('ball');
        if (ball) {
            ball.style.display = 'none';
        }
    }
    
    // Reset after 3 seconds
    setTimeout(() => {
        if (countdownEl) {
            countdownEl.textContent = 'Click START to play again!';
            countdownEl.classList.remove('timer-warning', 'timer-danger');
        }
        if (timerCircle) timerCircle.textContent = '';
    }, 3000);
}

function showMessage(text, type) {
    const msg = document.getElementById('beMsg');
    if (msg) {
        msg.textContent = text;
        msg.className = `message ${type}`;
    }
}

// Add event listeners for clicking directly on ball
document.addEventListener('click', function(e) {
    if (!beGameActive) return;
    
    if (e.target.id === 'ball' || e.target.closest('#ball')) {
        catchBall();
    }
});

console.log('Ball Escape game script loaded');
