// ========== CRASH GAME LOGIC (BEAUTIFUL ROCKET VERSION) ==========

let cm = 1;
let crashed = false;
let bet = 0;
let crashPoint = 0;
let animationId = null;
let ctx, canvas;
let gameStarted = false;

// ⭐ stars (persistent)
let stars = Array.from({ length: 60 }, () => ({
    x: Math.random() * 400,
    y: Math.random() * 420,
    s: Math.random() * 2 + 0.5
}));

function initGame() {
    canvas = document.getElementById('cv');
    ctx = canvas.getContext('2d');
    drawInitialScreen();
    console.log('✅ Crash initialized (beautiful rocket)');
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

function generateCrashPoint() {
    const r = Math.random();
    if (r < 0.65) return 1 + Math.random() * 3;
    if (r < 0.9) return 4 + Math.random() * 6;
    return 10 + Math.random() * 25;
}

function animate() {
    if (crashed || !gameStarted) return;

    ctx.fillStyle = "rgba(8,0,16,0.22)";
    ctx.fillRect(0, 0, 400, 420);

    cm *= 1.006;
    document.getElementById('cm').textContent = cm.toFixed(2) + "x";

    const y = 420 - cm * 22;

    drawStars();
    drawRocket(200, y);

    if (cm >= crashPoint) {
        crash();
        return;
    }

    animationId = requestAnimationFrame(animate);
}

// 🚀 BEAUTIFUL ROCKET
function drawRocket(x, y) {
    ctx.save();
    ctx.translate(x, y);

    const tilt = Math.sin(Date.now() * 0.002) * 0.08;
    ctx.rotate(tilt);

    // glow
    ctx.shadowColor = "#ff6bb5";
    ctx.shadowBlur = 25;

    // flame
    const flameLen = 55 + Math.sin(Date.now() * 0.015) * 20;
    const flameGrad = ctx.createLinearGradient(0, 40, 0, 40 + flameLen);
    flameGrad.addColorStop(0, "#fff6a0");
    flameGrad.addColorStop(0.4, "#ff9f1c");
    flameGrad.addColorStop(0.8, "#ff4500");
    flameGrad.addColorStop(1, "rgba(255,69,0,0)");

    ctx.fillStyle = flameGrad;
    ctx.beginPath();
    ctx.moveTo(-14, 40);
    ctx.quadraticCurveTo(0, 40 + flameLen + 15, 14, 40);
    ctx.fill();

    ctx.shadowBlur = 0;

    // body
    ctx.fillStyle = "#d94fff";
    ctx.beginPath();
    ctx.moveTo(0, -95);
    ctx.quadraticCurveTo(-30, -30, -26, 45);
    ctx.lineTo(26, 45);
    ctx.quadraticCurveTo(30, -30, 0, -95);
    ctx.closePath();
    ctx.fill();

    // nose
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.ellipse(0, -88, 10, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    // window
    ctx.fillStyle = "#6cf3ff";
    ctx.beginPath();
    ctx.arc(0, -35, 12, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#ffffff88";
    ctx.lineWidth = 2;
    ctx.stroke();

    // wings
    ctx.fillStyle = "#ff3f8e";
    ctx.beginPath();
    ctx.moveTo(-26, 10);
    ctx.lineTo(-48, 30);
    ctx.lineTo(-26, 30);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(26, 10);
    ctx.lineTo(48, 30);
    ctx.lineTo(26, 30);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
}

// 🌌 stars
function drawStars() {
    ctx.fillStyle = "#ffffffcc";
    stars.forEach(st => {
        st.y += 0.6;
        if (st.y > 420) st.y = 0;
        ctx.fillRect(st.x, st.y, st.s, st.s);
    });
}

function crash() {
    crashed = true;
    gameStarted = false;
    document.getElementById('cashC').disabled = true;

    explosion(200, 420 - cm * 22);

    showMessage(`💥 CRASH! Lost ${bet.toFixed(1)} TON`, 'lose');
    document.getElementById('countdown').textContent = "💥 ROCKET DESTROYED";
    document.getElementById('countdown').style.color = "#ff4466";
}

function explosion(x, y) {
    let r = 5;
    const boom = setInterval(() => {
        ctx.fillStyle = `rgba(255,80,0,0.35)`;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        r += 6;
        if (r > 70) clearInterval(boom);
    }, 30);
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

// автоинициализация
window.onload = initGame;

console.log('🚀 Crash loaded (beautiful rocket)');
