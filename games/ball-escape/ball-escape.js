const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const btn = document.getElementById('actionBtn');

canvas.width = 400;
canvas.height = 600;

const center = { x: canvas.width / 2, y: canvas.height / 2 - 50 };
const radius = 130;
const gapAngle = 0.6; // Размер дырки в радианах

let gameRunning = true;
let multiplier = 1.0;
let isFalling = false;
let trackRotation = 0;

const player = {
    x: center.x,
    y: center.y,
    vx: 3, // Скорость по X
    vy: 2, // Скорость по Y
    size: 10
};

function drawZones() {
    const zh = 120;
    // Красная зона
    ctx.fillStyle = '#ff4444';
    ctx.fillRect(0, canvas.height - zh, canvas.width / 2, zh);
    ctx.font = '50px Arial';
    ctx.fillText('💀', canvas.width / 4 - 25, canvas.height - 50);

    // Зеленая зона
    ctx.fillStyle = '#44ff44';
    ctx.fillRect(canvas.width / 2, canvas.height - zh, canvas.width / 2, zh);
    ctx.fillText('🤑', (canvas.width * 0.75) - 25, canvas.height - 50);
}

function update() {
    if (!gameRunning) return;

    trackRotation += 0.015;

    if (!isFalling) {
        // Физика прыжков внутри
        player.x += player.vx;
        player.y += player.vy;

        // Расстояние от центра
        const dx = player.x - center.x;
        const dy = player.y - center.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Если коснулся стенки круга
        if (dist + player.size > radius) {
            // Находим угол шара относительно центра
            const angle = Math.atan2(dy, dx);
            
            // Проверка: находится ли шар в зоне дырки?
            // Нормализуем углы для сравнения
            const normAngle = (angle - trackRotation + Math.PI * 2) % (Math.PI * 2);
            
            // Дырка находится внизу (около 1.57 рад или PI/2)
            if (normAngle > 1.57 - gapAngle/2 && normAngle < 1.57 + gapAngle/2) {
                // Ничего не делаем, шар пролетит в дырку
            } else {
                // ОТСКОК
                const normalX = dx / dist;
                const normalY = dy / dist;
                const dot = player.vx * normalX + player.vy * normalY;
                
                player.vx -= 2 * dot * normalX;
                player.vy -= 2 * dot * normalY;

                // Выталкиваем шарик немного внутрь, чтобы не застрял
                player.x = center.x + normalX * (radius - player.size - 1);
                player.y = center.y + normalY * (radius - player.size - 1);

                // Увеличиваем множитель при отскоке
                multiplier += 0.05;
                scoreElement.textContent = multiplier.toFixed(2);
            }
        }
    } else {
        // Физика падения
        player.y += 7;
        
        // Проверка зон
        if (player.y > canvas.height - 100) {
            gameRunning = false;
            alert(player.x > canvas.width / 2 ? "ВЫИГРЫШ! 🤑" : "ПРОИГРЫШ! 💀");
            location.reload();
        }
    }
    
    // Если шар вылетел за пределы круга
    const finalDist = Math.sqrt((player.x - center.x)**2 + (player.y - center.y)**2);
    if (finalDist > radius + 20) isFalling = true;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawZones();

    // Трек
    ctx.save();
    ctx.translate(center.x, center.y);
    ctx.rotate(trackRotation);
    ctx.beginPath();
    ctx.arc(0, 0, radius, gapAngle/2 + 1.57, -gapAngle/2 + 1.57);
    ctx.strokeStyle = '#ff00ff';
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.restore();

    // Шар
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.size, 0, Math.PI * 2);
    ctx.fillStyle = '#00d2ff';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#00d2ff';
    ctx.fill();
    ctx.shadowBlur = 0;
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

btn.addEventListener('click', () => {
    // В этой версии шар всегда прыгает, а кнопка может, например, замедлять вращение
    // Или можно сделать, чтобы изначально шар был зафиксирован
});

loop();
