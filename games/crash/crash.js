// ========== CRASH GAME LOGIC (HIDDEN CRASH + NEW ROCKET) ==========

let cm = 1;
let crashed = false;
let bet = 0;
let crashPoint = 0;
let animationId = null;
let ctx, canvas;
let gameStarted = false;

function initGame() {
    canvas = document.getElementById('cv');
    ctx = canvas.getContext('2d');
    drawInitialScreen();
    console.log('✅ Crash initialized');
}

function drawInitialScreen() {
    ctx.fillStyle = "#080010";
    ctx.fillRect(0, 0, 400, 420);

    ctx.fillStyle = "#fff";
    ctx.font = "20px Arial";
    ctx.textAlign = "center";
    ctx.fillText("🚀 Ready for launch", 200, 380);

    drawRocket(200, 300, 0);
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

    if (r < 0.65) return 1 + Math.random() * 3;      // 1–4x (часто)
    if (r < 0.9)  return 4 + Math.random() * 6;      // 4–10x
    return 10 + Math.random() * 25;                  // редкие полёты 🚀
}

function animate() {
    if (crashed || !gameStarted) return;

    ctx.fillStyle = "rgba(8,0,16,0.18)";
    ctx.fillRect(0, 0, 400, 420);

    cm *= 1.006;
    document.getElementById('cm').textContent = cm.toFixed(2) + "x";

    const y = 420 - cm * 22;

    drawStars();
    drawRocket(200, y, cm);

    if (cm >= crashPoint) {
        crash();
        return;
    }

    animationId = requestAnimationFrame(animate);
}

function drawRocket(x, y, power) {
    ctx.save();
    ctx.translate(x, y);

    const tilt = Math.sin(Date.now() * 0.002) * 0.05;
    ctx.rotate(tilt);

    // 🔥 flame
    const flame = 50 + Math.sin(Date.now() * 0.01) * 15;
    const gr = ctx.createLinearGradient(0, 0, 0, flame);
    gr.addColorStop(0, "#fff700");
    gr.addColorStop(0.4, "#ff8c00");
    gr.addColorStop(1, "rgba(255,0,0,0)");

    ctx.fillStyle = gr;
    ctx.beginPath();
    ctx.moveTo(0, 40);
    ctx.quadraticCurveTo(-22, flame, 0, flame + 25);
    ctx.quadraticCurveTo(22, flame, 0, 40);
    ctx.fill();

    // 🚀 body
    ctx.fillStyle = "#ff6bb5";
    ctx.beginPath();
    ctx.moveTo(0, -90);
    ctx.quadraticCurveTo(-28, -20, -22, 40);
    ctx.lineTo(22, 40);
    ctx.quadraticCurveTo(28, -20, 0, -90);
    ctx.fill();

    // glow
    ctx.shadowColor = "#ff6bb5";
    ctx.shadowBlur = 20;

    // window
    ctx.fillStyle = "#7df9ff";
    ctx.beginPath();
    ctx.arc(0, -35, 12, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

function drawStars() {
    ctx.fillStyle = "#fff";
    for (let i = 0; i < 35; i++) {
        const x = Math.random() * 400;
        const y = Math.random() * 420;
        ctx.fillRect(x, y, 1.5, 1.5);
    }
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

    showMessage(`💰 Cashed out ${ (bet + win).toFixed(2) } TON`, 'win');
}

function showMessage(text, type) {
    const msg = document.getElementById('crashMsg');
    msg.textContent = text;
    msg.className = `message ${type}`;
}

console.log('🚀 Crash loaded (hidden crash, new rocket)');
