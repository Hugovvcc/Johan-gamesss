const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const startBtn = document.getElementById('startBtn');

canvas.width = 400;
canvas.height = 600;

const center = { x: canvas.width / 2, y: canvas.height / 2 - 50 };
const radius = 130;
const gapAngle = 0.7; // Размер дырки

let gameActive = false;
let isFalling = false;
let multiplier = 1.00;
let trackRotation = 0;

const ball = {
    x: center.x,
    y: center.y,
    vx: 0,
    vy: 0,
    size: 10
};

function initBall() {
    ball.x = center.x;
    ball.y = center.y;
    // Рандомная начальная траектория
    const randomAngle = Math.random() * Math.PI * 2;
    const speed = 4 + Math.random() * 2; 
    ball.vx = Math.cos(randomAngle) * speed;
    ball.vy = Math.sin(randomAngle) * speed;
    multiplier = 1.00;
    scoreElement.textContent = "1.00";
    isFalling = false;
}

function drawZones() {
    const zh = 120;
    ctx.font = '50px Arial';
    
    // Красная зона 💀
    ctx.fillStyle = 'rgba(255, 68, 68, 0.8)';
    ctx.fillRect(0, canvas.height - zh, canvas.width / 2, zh);
    ctx.fillStyle = 'white';
    ctx.fillText('💀', canvas.width / 4 - 25, canvas.height - 50);

    // Зеленая зона 🤑
    ctx.fillStyle = 'rgba(68, 255, 68, 0.8)';
    ctx.fillRect(canvas.width / 2, canvas.height - zh, canvas.width / 2, zh);
    ctx.fillStyle = 'white';
    ctx.fillText('🤑', (canvas.width * 0.75) - 25, canvas.height - 50);
}

function update() {
    if (!gameActive) return;

    trackRotation += 0.02; // Вращение круга

    if (!isFalling) {
        ball.x += ball.vx;
        ball.y += ball.vy;

        const dx = ball.x - center.x;
        const dy = ball.y - center.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist + ball.size > radius) {
            const angle = Math.atan2(dy, dx);
            const normAngle = (angle - trackRotation + Math.PI * 4) % (Math.PI * 2);
            
            // Если попал в дырку (дырка внизу круга)
            if (normAngle > 1.57 - gapAngle/2 && normAngle < 1.57 + gapAngle/2) {
                isFalling = true;
            } else {
                // Отскок с небольшим рандомом для изменения траектории
                const normalX = dx / dist;
                const normalY = dy / dist;
                const dot = ball.vx * normalX + ball.vy * normalY;
                
                ball.vx = (ball.vx - 2 * dot * normalX) + (Math.random() - 0.5);
                ball.vy = (ball.vy - 2 * dot * normalY) + (Math.random() - 0.5);

                // Коррекция позиции
                ball.x = center.x + normalX * (radius - ball.size - 1);
                ball.y = center.y + normalY * (radius - ball.size - 1);

                multiplier += 0.12;
                scoreElement.textContent = multiplier.toFixed(2);
            }
        }
    } else {
        // Гравитация при падении
        ball.vy += 0.5;
        ball.x += ball.vx * 0.5;
        ball.y += ball.vy;

        if (ball.y > canvas.height - 60) {
            gameActive = false;
            const win = ball.x > canvas.width / 2;
            alert(win ? `ПОБЕДА! Множитель: ${multiplier.toFixed(2)}x 🤑` : "ПРОИГРЫШ! 💀");
            startBtn.style.display = 'inline-block';
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawZones();

    // Отрисовка круга с дыркой
    ctx.save();
    ctx.translate(center.x, center.y);
    ctx.rotate(trackRotation);
    ctx.beginPath();
    ctx.arc(0, 0, radius, gapAngle/2 + 1.57, -gapAngle/2 + 1.57);
    ctx.strokeStyle = '#ff00ff';
    ctx.lineWidth = 12;
    ctx.lineCap = 'round';
    ctx.stroke();
    
    // Эффект свечения круга
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#ff00ff';
    ctx.stroke();
    ctx.restore();

    // Отрисовка шара
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2);
    ctx.fillStyle = '#00d2ff';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#00d2ff';
    ctx.fill();
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

startBtn.addEventListener('click', () => {
    initBall();
    gameActive = true;
    startBtn.style.display = 'none';
});

// Запуск фоновой отрисовки (до нажатия Старт)
gameLoop();
