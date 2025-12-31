const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const btn = document.getElementById('mainActionBtn');

let angle = 0;
let isPlaying = false;
let ballRadius = 80; // Радиус орбиты шарика

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // 1. Рисуем нижние зоны (Зеленая и Красная)
    ctx.lineWidth = 20;
    ctx.lineCap = 'round';

    // Зеленая (слева снизу)
    ctx.beginPath();
    ctx.strokeStyle = '#27ae60';
    ctx.arc(centerX, centerY, ballRadius, 0.6 * Math.PI, 1.0 * Math.PI);
    ctx.stroke();

    // Красная (справа снизу)
    ctx.beginPath();
    ctx.strokeStyle = '#c0392b';
    ctx.arc(centerX, centerY, ballRadius, 0 * Math.PI, 0.4 * Math.PI);
    ctx.stroke();

    // 2. Розовое кольцо с "дыркой" сверху
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#ff2df7';
    ctx.beginPath();
    // Рисуем почти полный круг, оставляя разрыв вверху
    ctx.arc(centerX, centerY, ballRadius, 1.4 * Math.PI, 1.6 * Math.PI, true);
    ctx.stroke();

    // 3. Рисуем шарик
    const ballX = centerX + Math.cos(angle) * ballRadius;
    const ballY = centerY + Math.sin(angle) * ballRadius;

    ctx.shadowBlur = 15;
    ctx.shadowColor = '#00d2ff';
    ctx.fillStyle = '#00d2ff';
    ctx.beginPath();
    ctx.arc(ballX, ballY, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0; // Сбрасываем тень

    // Анимация вращения
    if (isPlaying) {
        angle += 0.05;
    }

    requestAnimationFrame(draw);
}

btn.addEventListener('click', () => {
    isPlaying = !isPlaying;
    btn.innerText = isPlaying ? "Остановить" : "Сыграть | 1";
});

function updateBet(amount) {
    document.getElementById('bet-display').innerText = amount;
}

// Запускаем цикл отрисовки
draw();
