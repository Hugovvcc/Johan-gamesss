// games/ball-escape/ball-escape.js
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let gameActive = false;
let multiplier = 1.0;
let bet = 1;
let animationFrameId;

let ball = {
    x: 250,
    y: 250,
    radius: 25,
    vx: 0,
    vy: 0,
    color: '#ff6bb5'
};

const centerX = 250;
const centerY = 250;
const circleRadius = 175;        // радиус внутренней зоны отскока
const rotationSpeed = 0.008;     // скорость вращения круга (радианы за кадр)

let angle = 0;                   // текущий угол вращения

function drawCircle() {
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(angle);
    
    // основной круг (пунктирный)
    ctx.beginPath();
    ctx.arc(0, 0, circleRadius, 0, Math.PI * 2);
    ctx.lineWidth = 4;
    ctx.setLineDash([10, 15]);
    ctx.strokeStyle = 'rgba(255, 155, 205, 0.6)';
    ctx.stroke();
    
    // дырка (сектор)
    ctx.beginPath();
    ctx.arc(0, 0, circleRadius + 30, -0.4, 0.4); // примерно 45-50° дырка внизу
    ctx.lineTo(0, 0);
    ctx.fillStyle = 'rgba(10, 0, 21, 0.9)';
    ctx.fill();
    
    ctx.restore();
}

function drawZones() {
    // Зеленая и красная зона под дыркой (можно нарисовать статично или тоже вращать)
    // для простоты пока оставим статично под дыркой
}

function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = ball.color;
    ctx.shadowColor = '#ff0080';
    ctx.shadowBlur = 20;
    ctx.fill();
    ctx.shadowBlur = 0;
}

function updatePhysics() {
    if (!gameActive) return;

    // простое ускорение (можно сделать более хаотичным)
    ball.vx += (Math.random() - 0.5) * 0.4;
    ball.vy += (Math.random() - 0.5) * 0.4;

    ball.x += ball.vx;
    ball.y += ball.vy;

    // отскок от круга
    const dx = ball.x - centerX;
    const dy = ball.y - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance + ball.radius > circleRadius) {
        // нормаль
        const nx = dx / distance;
        const ny = dy / distance;

        // проекция скорости на нормаль
        const dot = ball.vx * nx + ball.vy * ny;

        // отражение
        ball.vx -= 2 * dot * nx;
        ball.vy -= 2 * dot * ny;

        // чуть уменьшаем скорость (энергия теряется)
        ball.vx *= 0.98;
        ball.vy *= 0.98;

        // возвращаем мяч внутрь
        const overlap = (distance + ball.radius) - circleRadius;
        ball.x -= nx * overlap;
        ball.y -= ny * overlap;
    }

    // рост множителя
    multiplier += 0.008 + Math.random() * 0.006;
    document.getElementById('bigMultiplier').textContent = multiplier.toFixed(2) + 'x';
    document.getElementById('currentMultiplier').textContent = multiplier.toFixed(2) + 'x';
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    angle += rotationSpeed; // вращаем круг

    drawCircle();
    // drawZones(); // если нужно

    if (gameActive) {
        updatePhysics();
        drawBall();
    } else {
        // шарик в центре когда игра не активна
        ball.x = centerX;
        ball.y = centerY;
        ball.vx = 0;
        ball.vy = 0;
        drawBall();
    }

    animationFrameId = requestAnimationFrame(animate);
}

// ---------------------- Управление игрой ----------------------

function initGame() {
    // ... твоя текущая инициализация кнопок ставок ...
    animate(); // запускаем анимацию один раз на всю страницу
}

function startGame() {
    if (gameActive) return;

    if (window.gameAPI?.getBalance?.() < bet) {
        alert("Недостаточно баланса!");
        return;
    }

    window.gameAPI.updateBalance(-bet);

    gameActive = true;
    multiplier = 1.0;

    // даём начальный импульс шарику
    const startAngle = Math.random() * Math.PI * 2;
    ball.vx = Math.cos(startAngle) * 5;
    ball.vy = Math.sin(startAngle) * 5;

    document.getElementById('startBtn').disabled = true;
    document.getElementById('startBtn').textContent = "ШАРИК ПРЫГАЕТ...";

    // время падения (3–8 сек)
    const fallTime = 3000 + Math.random() * 5000;

    setTimeout(() => {
        if (!gameActive) return;
        endGame();
    }, fallTime);
}

function endGame() {
    gameActive = false;

    // Определяем, куда упал (пока просто рандом 60/40)
    const win = Math.random() < 0.6;

    if (win) {
        const winAmount = bet * multiplier;
        window.gameAPI.updateBalance(winAmount);
        alert(`ПОБЕДА! +${winAmount.toFixed(2)} TON`);
    } else {
        alert(`ПРОИГРЫШ! -${bet.toFixed(2)} TON`);
    }

    document.getElementById('startBtn').disabled = false;
    document.getElementById('startBtn').textContent = "🎱 СЫГРАТЬ";
}

// Запуск
window.addEventListener('load', initGame);
