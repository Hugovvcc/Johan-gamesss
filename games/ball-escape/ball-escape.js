const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const multEl = document.getElementById("mult");
const btn = document.getElementById("startBtn");

const center = { x: 200, y: 260 };
const radius = 135;
const gap = 0.55;

let rotation = 0;
let running = false;
let falling = false;
let multiplier = 1;

const ball = {
    x: center.x,
    y: center.y,
    r: 9,
    vx: 0,
    vy: 0
};

function startGame() {
    multiplier = 1;
    multEl.textContent = multiplier.toFixed(2);

    const angle = Math.random() * Math.PI * 2;
    const speed = 2 + Math.random() * 3;

    ball.x = center.x;
    ball.y = center.y;
    ball.vx = Math.cos(angle) * speed;
    ball.vy = Math.sin(angle) * speed;

    rotation = 0;
    falling = false;
    running = true;

    btn.style.display = "none";
}

btn.onclick = startGame;

function drawZones() {
    const h = 120;

    // 🟢 LEFT (WIN)
    let g = ctx.createLinearGradient(0, canvas.height - h, 0, canvas.height);
    g.addColorStop(0, "#2cff7a");
    g.addColorStop(1, "#0a6b36");
    ctx.fillStyle = g;
    ctx.fillRect(0, canvas.height - h, canvas.width / 2, h);

    // 🔴 RIGHT (LOSE)
    let r = ctx.createLinearGradient(0, canvas.height - h, 0, canvas.height);
    r.addColorStop(0, "#ff4040");
    r.addColorStop(1, "#6b0a0a");
    ctx.fillStyle = r;
    ctx.fillRect(canvas.width / 2, canvas.height - h, canvas.width / 2, h);

    ctx.font = "42px Arial";
    ctx.textAlign = "center";
    ctx.shadowBlur = 10;

    ctx.shadowColor = "#00ff88";
    ctx.fillStyle = "white";
    ctx.fillText("🤑", canvas.width / 4, canvas.height - 38);

    ctx.shadowColor = "#ff3333";
    ctx.fillText("💀", canvas.width * 0.75, canvas.height - 38);

    ctx.shadowBlur = 0;
}

function update() {
    if (!running) return;

    rotation += 0.018;

    if (falling) {
        ball.y += 7;
        if (ball.y > canvas.height - 120) {
            running = false;
            btn.textContent = "ЕЩЁ РАЗ";
            btn.style.display = "block";
        }
        return; // ❗ ВАЖНО: никакой физики круга
    }

    ball.x += ball.vx;
    ball.y += ball.vy;

    const dx = ball.x - center.x;
    const dy = ball.y - center.y;
    const dist = Math.hypot(dx, dy);

    if (dist + ball.r >= radius) {
        const angle = Math.atan2(dy, dx);
        const rel = (angle - rotation + Math.PI * 2) % (Math.PI * 2);
        const hole = Math.PI / 2;

        if (Math.abs(rel - hole) < gap / 2) {
            falling = true;
            return;
        }

        const nx = dx / dist;
        const ny = dy / dist;
        const dot = ball.vx * nx + ball.vy * ny;

        ball.vx -= 2 * dot * nx;
        ball.vy -= 2 * dot * ny;

        // 🎯 микро-рандом
        ball.vx += (Math.random() - 0.5) * 0.4;
        ball.vy += (Math.random() - 0.5) * 0.4;

        ball.x = center.x + nx * (radius - ball.r - 1);
        ball.y = center.y + ny * (radius - ball.r - 1);

        multiplier += 0.07;
        multEl.textContent = multiplier.toFixed(2);
    }
}

function drawTrack() {
    ctx.save();
    ctx.translate(center.x, center.y);
    ctx.rotate(rotation);

    ctx.beginPath();
    ctx.arc(0, 0, radius, gap / 2 + Math.PI / 2, -gap / 2 + Math.PI / 2);
    ctx.strokeStyle = "#ff00ff";
    ctx.lineWidth = 10;
    ctx.lineCap = "round";
    ctx.shadowBlur = 18;
    ctx.shadowColor = "#ff00ff";
    ctx.stroke();

    ctx.restore();
    ctx.shadowBlur = 0;
}

function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
    ctx.fillStyle = "#00d2ff";
    ctx.shadowBlur = 14;
    ctx.shadowColor = "#00d2ff";
    ctx.fill();
    ctx.shadowBlur = 0;
}

function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawZones();
    drawTrack();
    drawBall();
    update();
    requestAnimationFrame(loop);
}

loop();
