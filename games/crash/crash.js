// ========== CRASH GAME LOGIC (SLOW MULTIPLIER, NORMAL ROCKET) ==========

let cm = 1;
let crashed = false;
let bet = 0;
let crashPoint = 0;
let ctx, canvas;
let gameStarted = false;

// ⭐ stars
let stars = Array.from({ length: 60 }, () => ({
    x: Math.random() * 400,
    y: Math.random() * 420,
    s: Math.random() * 2 + 0.5
}));

function initGame() {
    canvas = document.getElementById('cv');
    ctx = canvas.getContext('2d');
    drawInitialScreen();
    console.log('✅ Crash initialized (slow x)');
}

function drawInitialScreen() {
    ctx.fillStyle = "#080010";
    ctx.fillRect(0, 0, 400, 420);

    ctx.fillStyle = "#fff";
    ctx.font = "20px Arial";
    ctx.textAlign = "center";
    ctx.fillText("🚀 Ready for launch", 200, 380);

    drawRocket(200, 300);
}

function startCrash() {
    const betInput = document.getElementById('cbet');
    bet = parseFloat(betInput.value);

    if (isNaN(bet) || bet < 0.1 || bet > 10) {
        showMessage('Bet 0.1–10 TON', 'lose');
        return;
    }

    if (window.gameAPI.getBalance() < bet) {
        showMessage('Not enough balance!', 'lose');
        return;
    }

    window.gameAPI.updateBalance(-bet);

    cm = 1;
    crashed = false;
    gameStarted = true;

    crashPoint = generateCrashPoint();

    document.getElementById('cm').textContent = "1.00x";
    document.getElementById('cashC').disabled = false;
    document.getElementById('countdown').textContent = "🚀 LAUNCHED";
    document.getElementById('countdown').style.color = "#00ff9d";

    animate();
}

// 🎯 НОРМАЛЬНОЕ распределение (без жёсткого обмана)
function generateCrashPoint() {
    const r = Math.random();
    if (r < 0.7) return 1 + Math.random() * 4;   // 1–5x
    if (r < 0.93) return 5 + Math.random() * 8;  // 5–13x
    return 13 + Math.random() * 20;              // редкие высокие
}

function animate() {
    if (crashed || !gameStarted) return;

    ctx.fillStyle = "rgba(8,0,16,0.22)";
    ctx.fillRect(0, 0, 400, 420);

    // 🐢 МЕДЛЕННЫЙ РОСТ ИКСОВ (ГЛАВНОЕ)
    cm *= 1.003;   // ← если надо ещё медленнее: 1.0025
    document.getElementById('cm').textContent = cm.toFixed(2) + "x";

    const y = 420 - cm * 22;

    drawStars();
    drawRocket(200, y);

    if (cm >= crashPoint) {
        crash();
        return;
    }

    requestAnimationFrame(animate);
}

// 🚀 NORMAL BEAUTIFUL ROCKET
function drawRocket(x, y) {
    ctx.save();
    ctx.translate(x, y);

    const tilt = Math.sin(Date.now() * 0.002) * 0.06;
    ctx.rotate(tilt);

    // glow
    ctx.shadowColor = "#ff6bb5";
    ctx.shadowBlur = 20;

    // flame
    const flameLen = 50 + Math.sin(Date.now() * 0.015) * 15;
    const grad = ctx.createLinearGradient(0, 40, 0, 40 + flameLen);
    grad.addColorStop(0, "#fff6a0");
    grad.addColorStop(0.4, "#ff9f1c");
    grad.addColorStop(0.8, "#ff4500");
    grad.addColorStop(1, "rgba(255,69,0,0)");

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(-14, 40);
    ctx.quadraticCurveTo(0, 40 + flameLen + 10, 14, 40);
    ctx.fill();

    ctx.shadowBlur = 0;

    // body
    ctx.fillStyle = "#d94fff";
    ctx.beginPath();
    ctx.moveTo(0, -95);
    ctx.quadraticCurveTo(-28, -30, -24, 45);
    ctx.lineTo(24, 45);
    ctx.quadraticCurveTo(28, -30, 0, -95);
    ctx.fill();

    // window
    ctx.fillStyle = "#6cf3ff";
    ctx.beginPath();
    ctx.arc(0, -35, 12, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#ffffff88";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();
}

// 🌌 stars
function drawStars() {
    ctx.fillStyle = "#ffffffcc";
    stars.forEach(s => {
        s.y += 0.5;
        if (s.y > 420) s.y = 0;
        ctx.fillRect(s.x, s.y, s.s, s.s);
    });
}

function crash() {
    crashed = true;
    gameStarted = false;
    document.getElementById('cashC').disabled = true;

    showMessage(`💥 CRASH! Lost ${bet.toFixed(1)} TON`, 'lose');
    document.getElementById('countdown').textContent = "💥 ROCKET DESTROYED";
    document.getElementById('countdown').style.color = "#ff4466";
}

function cashCrash() {
    if (crashed || !gameStarted) return;

    const win = bet * (cm - 1);
    window.gameAPI.updateBalance(bet + win);

    crashed = true;
    gameStarted = false;
    document.getElementById('cashC').disabled = true;

    showMessage(`💰 Cashed out ${(bet + win).toFixed(2)} TON`, 'win');
}

function showMessage(text, type) {
    const msg = document.getElementById('crashMsg');
    msg.textContent = text;
    msg.className = `message ${type}`;
}

window.onload = initGame;

console.log('🚀 Crash loaded (slow multipliers)');
