// ========== CRASH GAME LOGIC ==========

let cm = 1;
let cr = false;
let bet = 0;
let crashPoint = 0;
let countdownTimer = 0;
let animationId = null;
let ctx = null;
let canvas = null;
let gameStarted = false;

function initGame() {
    console.log('✅ Crash game initialized');
    
    canvas = document.getElementById('cv');
    if (canvas) {
        ctx = canvas.getContext("2d");
        drawInitialScreen();
    } else {
        console.error('Canvas not found!');
    }
}

function drawInitialScreen() {
    if (!ctx) return;
    
    ctx.fillStyle = "#080010";
    ctx.fillRect(0, 0, 400, 420);
    
    // Draw rocket
    ctx.save();
    ctx.translate(200, 300);
    
    // Flame
    const gr = ctx.createLinearGradient(0, 0, 0, 50);
    gr.addColorStop(0, "#ffff00");
    gr.addColorStop(0.4, "#ff8800");
    gr.addColorStop(1, "#ff0000");
    ctx.fillStyle = gr;
    ctx.beginPath();
    ctx.moveTo(0, 20);
    ctx.quadraticCurveTo(-25, 40, 0, 70);
    ctx.quadraticCurveTo(25, 40, 0, 20);
    ctx.fill();
    
    // Body
    ctx.fillStyle = "#ff6bb5";
    ctx.beginPath();
    ctx.moveTo(0, -40);
    ctx.quadraticCurveTo(-15, -10, -12, 20);
    ctx.lineTo(12, 20);
    ctx.quadraticCurveTo(15, -10, 0, -40);
    ctx.fill();
    
    // Window
    ctx.fillStyle = "#88ddff";
    ctx.beginPath();
    ctx.arc(0, -5, 8, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
    
    // Draw text
    ctx.fillStyle = "#ffffff";
    ctx.font = "20px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Click START to launch!", 200, 380);
}

function startCrash() {
    const betInput = document.getElementById('cbet');
    if (!betInput) {
        alert('Bet input not found!');
        return;
    }
    
    bet = parseFloat(betInput.value);
    if (isNaN(bet) || bet < 0.1 || bet > 10) {
        showMessage('Bet 0.1-10 TON', 'lose');
        return;
    }
    
    const currentBalance = window.gameAPI.getBalance();
    if (currentBalance < bet) {
        showMessage('Not enough balance!', 'lose');
        return;
    }
    
    // Deduct bet
    window.gameAPI.updateBalance(-bet);
    
    // Reset game
    cm = 1;
    cr = false;
    gameStarted = true;
    
    // Stop any existing animation
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
    
    // Clear canvas
    if (ctx) {
        ctx.fillStyle = "#080010";
        ctx.fillRect(0, 0, 400, 420);
    }
    
    // Set crash point
    crashPoint = 1 + Math.random() * 20;
    if (Math.random() < 0.1) crashPoint = 1 + Math.random() * 2; // 10% early crash
    
    document.getElementById('cm').textContent = "1.00x";
    document.getElementById('cashC').disabled = true;
    showMessage('Countdown started...', 'win');
    
    // Start countdown
    countdownTimer = 5;
    const countdownEl = document.getElementById('countdown');
    
    const cdInterval = setInterval(() => {
        countdownTimer--;
        if (countdownEl) {
            countdownEl.textContent = `Launch in: ${countdownTimer}s`;
            countdownEl.style.color = countdownTimer <= 3 ? '#ff4466' : '#ff6bb5';
        }
        
        if (countdownTimer <= 0) {
            clearInterval(cdInterval);
            if (countdownEl) {
                countdownEl.textContent = "🚀 ROCKET LAUNCHED! 🚀";
                countdownEl.style.color = '#00ff9d';
            }
            document.getElementById('cashC').disabled = false;
            showMessage('Rocket launched! Cash out before crash!', 'win');
            animate();
        }
    }, 1000);
}

function animate() {
    if (cr || !ctx || !gameStarted) return;
    
    // Clear with trail effect
    ctx.fillStyle = "rgba(8,0,16,0.15)";
    ctx.fillRect(0, 0, 400, 420);
    
    // Increase multiplier
    cm *= 1.006;
    document.getElementById('cm').textContent = cm.toFixed(2) + "x";
    
    // Check for crash
    if (cm >= crashPoint) {
        cr = true;
        document.getElementById('cashC').disabled = true;
        
        // Draw explosion
        drawExplosion(200, 420 - (cm * 20));
        
        showMessage(`CRASH at ${cm.toFixed(2)}x! Lost ${bet.toFixed(1)} TON`, 'lose');
        
        // Update countdown text
        const countdownEl = document.getElementById('countdown');
        if (countdownEl) {
            countdownEl.textContent = "💥 BOOM! CRASHED! 💥";
            countdownEl.style.color = '#ff4466';
        }
        
        return;
    }
    
    // Draw rocket
    const y = 420 - (cm * 20);
    drawRocket(200, y);
    
    // Draw stars
    drawStars();
    
    // Draw multiplier on canvas
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "center";
    ctx.fillText(`Current: ${cm.toFixed(2)}x`, 200, 30);
    ctx.fillText(`Crash Point: ${crashPoint.toFixed(2)}x`, 200, 50);
    
    // Continue animation
    animationId = requestAnimationFrame(animate);
}

function drawRocket(x, y) {
    ctx.save();
    ctx.translate(x, y);
    
    // Add subtle rotation
    const rotation = Math.sin(Date.now() * 0.001) * 0.03;
    ctx.rotate(rotation);
    
    // Flame with animation
    const flameHeight = 60 + Math.sin(Date.now() * 0.01) * 15;
    const gr = ctx.createLinearGradient(0, 0, 0, flameHeight);
    gr.addColorStop(0, "#ffff00");
    gr.addColorStop(0.3, "#ff8800");
    gr.addColorStop(0.7, "#ff4400");
    gr.addColorStop(1, "#ff0000");
    
    ctx.fillStyle = gr;
    ctx.beginPath();
    ctx.moveTo(0, 40);
    ctx.quadraticCurveTo(-30, flameHeight, 0, flameHeight + 30);
    ctx.quadraticCurveTo(30, flameHeight, 0, 40);
    ctx.fill();
    
    // Rocket body
    ctx.fillStyle = "#ff6bb5";
    ctx.beginPath();
    ctx.moveTo(0, -80);
    ctx.quadraticCurveTo(-25, -20, -20, 40);
    ctx.lineTo(20, 40);
    ctx.quadraticCurveTo(25, -20, 0, -80);
    ctx.fill();
    
    // Details
    ctx.fillStyle = "#ff9ccd";
    ctx.fillRect(-15, -60, 30, 10);
    ctx.fillRect(-10, -40, 20, 5);
    
    // Window
    ctx.fillStyle = "#88ddff";
    ctx.beginPath();
    ctx.arc(0, -30, 12, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
}

function drawStars() {
    ctx.fillStyle = "#ffffff";
    for (let i = 0; i < 50; i++) {
        const x = (i * 17) % 400;
        const y = (i * 11) % 420;
        const size = Math.sin(Date.now() * 0.001 + i) * 1 + 1;
        
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawExplosion(x, y) {
    // Explosion animation
    let radius = 5;
    const explosionInterval = setInterval(() => {
        ctx.fillStyle = `rgba(255, ${100 - radius * 2}, 0, 0.3)`;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        
        radius += 3;
        if (radius > 50) {
            clearInterval(explosionInterval);
        }
    }, 30);
}

function cashCrash() {
    if (cr || !gameStarted) return;
    
    const win = bet * (cm - 1);
    window.gameAPI.updateBalance(win);
    cr = true;
    gameStarted = false;
    document.getElementById('cashC').disabled = true;
    
    showMessage(`Cashed out at ${cm.toFixed(2)}x! +${win.toFixed(2)} TON 🎉`, 'win');
    
    // Stop animation
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
    
    // Update countdown text
    const countdownEl = document.getElementById('countdown');
    if (countdownEl) {
        countdownEl.textContent = "💰 CASHED OUT SUCCESSFULLY! 💰";
        countdownEl.style.color = '#00ff9d';
    }
}

function showMessage(text, type) {
    const msg = document.getElementById('crashMsg');
    if (msg) {
        msg.textContent = text;
        msg.className = `message ${type}`;
    }
}

console.log('Crash game script loaded');
