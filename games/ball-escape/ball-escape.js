const canvas = document.getElementById('ballGame');
const ctx = canvas.getContext('2d');
const btn = document.getElementById('actionBtn');

let state = 'ROTATE'; // Состояния: ROTATE (вращение), FALL (падение)
let angle = 0;
let ballY = 0;
let ballX = 0;
let dropSpeed = 0;
const radius = 100;
const centerX = canvas.width / 2;
const centerY = canvas.height / 2;

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Рисуем нижние поля (Зеленое и Красное)
    ctx.lineWidth = 25;
    ctx.lineCap = 'butt';
    
    // Зеленое (слева снизу)
    ctx.beginPath();
    ctx.strokeStyle = '#2ecc71';
    ctx.arc(centerX, centerY, radius + 10, 0.6 * Math.PI, 0.95 * Math.PI);
    ctx.stroke();

    // Красное (справа снизу)
    ctx.beginPath();
    ctx.strokeStyle = '#e74c3c';
    ctx.arc(centerX, centerY, radius + 10, 0.05 * Math.PI, 0.4 * Math.PI);
    ctx.stroke();

    // 2. Рисуем кольцо с дыркой снизу
    ctx.lineWidth = 8;
    ctx.strokeStyle = '#ff00ff';
    ctx.beginPath();
    // Дырка находится в диапазоне от 0.4*PI до 0.6*PI (самый низ)
    ctx.arc(centerX, centerY, radius, 0.6 * Math.PI, 0.4 * Math.PI);
    ctx.stroke();

    // 3. Логика движения шарика
    if (state === 'ROTATE') {
        angle += 0.06;
        ballX = centerX + Math.cos(angle) * radius;
        ballY = centerY + Math.sin(angle) * radius;
    } else if (state === 'FALL') {
        ballY += dropSpeed;
        dropSpeed += 0.5; // Гравитация
        
        // Проверка столкновения с нижними полями
        if (ballY > centerY + radius + 10) {
            resetGame();
        }
    }

    // 4. Отрисовка шарика
    ctx.beginPath();
    ctx.fillStyle = '#00d2ff';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#00d2ff';
    ctx.arc(ballX, ballY, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    requestAnimationFrame(draw);
}

function resetGame() {
    state = 'ROTATE';
    dropSpeed = 0;
}

btn.addEventListener('click', () => {
    // Если шарик находится над дыркой (внизу), он выпадает
    // Угол в радианах для низа примерно 1.57 (PI/2)
    const currentAngle = angle % (Math.PI * 2);
    
    if (state === 'ROTATE') {
        state = 'FALL';
        btn.innerText = "Ждем...";
        setTimeout(() => { btn.innerText = "Сыграть | 1"; }, 2000);
    }
});

draw();
