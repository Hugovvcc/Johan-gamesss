const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const btn = document.getElementById('actionBtn');

const center = { x: 200, y: 260 };
const radius = 135;
const gapAngle = 0.55;

let rotation = 0;
let multiplier = 1;
let running = false;
let falling = false;

const ball = {
    x: center.x,
    y: center.y,
    vx: 0,
    vy: 0,
    r: 9
};

function resetBall() {
    ball.x = center.x;
    ball.y = center.y;
    const angle = Math.random() * Math.PI * 2;
    const speed = 2 + Math.random() * 2;
    ball.vx = Math.cos(angle) * speed;
    ball.vy = Math.sin(angle) * speed;
    falling = false;
    multiplier = 1;
    scoreEl.textContent = multiplier.toFixed(2);
}

btn.onclick = () => {
    running = true;
    btn.style.display = "none";
    resetBall();
};

function drawZones() {
    const h = 120;

    ctx.fillStyle = "#ff3b3b";
    ctx.fillRect(0, canvas.height - h, canvas.width / 2, h);

    ctx.fillStyle = "#4cff4c";
    ctx.fillRect(canvas.width / 2, canvas.height - h, canvas.width / 2, h);

    ctx.font = "46px Arial";
    ctx.textAlign = "center";
    ctx.fillText("💀", canvas.width / 4, canvas.height - 40);
    ctx.fillText("🤑", canvas.width * 0.75, canvas.height - 40);
}

function update() {
    if (!running) return;

    rotation += 0.018;

    if (!falling) {
        ball.x += ball.vx;
        ball.y += ball.vy;

        const dx = ball.x - center.x;
        const dy = ball.y - center.y;
        const dist = Math.hypot(dx, dy);

        if (dist + ball.r >= radius) {
            const angle = Math.atan2(dy, dx);
            const rel = (angle - rotation + Math.PI * 2) % (Math.PI * 2);
            const holeCenter = Math.PI / 2;

            if (Math.abs(rel - holeCenter) < gapAngle / 2) {
                falling = true;
            } else {
                const nx = dx / dist;
                const ny = dy / dist;
                const dot = ball.vx * nx + ball.vy * ny;
                ball.vx -= 2 * dot * nx;
                ball.vy -= 2 * dot * ny;

                ball.x = center.x + nx * (radius - ball.r - 1);
                ball.y = center.y + ny * (radius - ball.r - 1);

                multiplier += 0.08;
                scoreEl.textContent = multiplier.toFixed(2);
            }
        }
    } else {
        ball.y += 7;

        if (ball.y > canvas.height - 120) {
            running = false;
            btn.style.display = "block";
            btn.textContent = "СЫГРАТЬ ЕЩЁ";
        }
    }
}

function drawTrack() {
    ctx.save();
    ctx.translate(center.x, center.y);
    ctx.rotate(rotation);
    ctx.beginPath();
    ctx.arc(0, 0, radius, gapAngle / 2 + Math.PI / 2, -gapAngle / 2 + Math.PI / 2);
    ctx.strokeStyle = "#ff00ff";
    ctx.lineWidth = 10;
    ctx.shadowBlur = 15;
    ctx.shadowColor = "#ff00ff";
    ctx.stroke();
    ctx.restore();
}

function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
    ctx.fillStyle = "#00d2ff";
    ctx.shadowBlur = 15;
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
