const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const playBtn = document.getElementById('playBtn');
const cashoutBtn = document.getElementById('cashoutBtn');
const gameMessage = document.getElementById('gameMessage');

const multiplierDisplay = document.querySelector('span[style*="color: rgb(0, 255, 136)"]') || 
                          document.getElementById('multiplier');

let ball, ring, multiplier, isPlaying = false;
let isEscaped = false; // Состояние, когда шарик вылетел из круга

function initParams() {
    ball = { x: 175, y: 150, vx: 3.5, vy: 2.5, radius: 8 };
    // gapAngle: 0.3 делает дырку значительно меньше
    ring = { radius: 100, gapAngle: 0.3, rotation: 0, speed: 0.04 };
    multiplier = 1.0;
    isEscaped = false;
}

function showMessage(text, color = "#fff") {
    gameMessage.innerText = text;
    gameMessage.style.borderColor = color;
    gameMessage.classList.remove('hidden');
    setTimeout(() => gameMessage.classList.add('hidden'), 3000);
}

function draw() {
    if (!isPlaying) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const cx = canvas.width / 2;
    const cy = 180; // Смещаем центр круга чуть выше

    // 1. Рисуем нижние зоны (Зеленая и Красная)
    const zoneHeight = 40;
    ctx.fillStyle = '#00ff0033'; // Зеленая (лево)
    ctx.fillRect(0, canvas.height - zoneHeight, canvas.width / 2, zoneHeight);
    ctx.fillStyle = '#ff000033'; // Красная (право)
    ctx.fillRect(canvas.width / 2, canvas.height - zoneHeight, canvas.width / 2, zoneHeight);
    
    // Граница зон
    ctx.strokeStyle = '#00ff00'; ctx.strokeRect(0, canvas.height - zoneHeight, canvas.width/2, zoneHeight);
    ctx.strokeStyle = '#ff0000'; ctx.strokeRect(canvas.width/2, canvas.height - zoneHeight, canvas.width/2, zoneHeight);

    // 2. Рисуем основное кольцо
    ctx.beginPath();
    ctx.lineWidth = 8;
    ctx.strokeStyle = '#ff69b4';
    ctx.arc(cx, cy, ring.radius, ring.rotation + ring.gapAngle, ring.rotation - ring.gapAngle + Math.PI * 2);
    ctx.stroke();

    // 3. Логика движения шарика
    ball.x += ball.vx;
    ball.y += ball.vy;

    // Физика внешних границ холста (отскок от стенок)
    if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) ball.vx *= -1;
    if (ball.y - ball.radius < 0) ball.vy *= -1;

    // Проверка попадания в зоны внизу
    if (ball.y + ball.radius > canvas.height - zoneHeight) {
        if (ball.x < canvas.width / 2) {
            endGame(true); // Выигрыш
        } else {
            endGame(false); // Проигрыш
        }
        return;
    }

    // Взаимодействие с кольцом
    const dx = ball.x - cx;
    const dy = ball.y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Если шарик внутри или касается кольца
    if (!isEscaped && dist + ball.radius >= ring.radius) {
        let angle = Math.atan2(dy, dx);
        if (angle < 0) angle += Math.PI * 2;
        let normRot = ring.rotation % (Math.PI * 2);
        if (normRot < 0) normRot += Math.PI * 2;

        const diff = Math.abs(angle - normRot);
        
        if (diff < ring.gapAngle || diff > (Math.PI * 2 - ring.gapAngle)) {
            // ШАРИК ВЫЛЕТЕЛ
            isEscaped = true; 
            // Теперь он просто летит к зонам, отскакивая от стен
        } else {
            // ОТСКОК ВНУТРИ (дает иксы)
            const nx = dx / dist;
            const ny = dy / dist;
            const dot = ball.vx * nx + ball.vy * ny;
            ball.vx -= 2 * dot * nx;
            ball.vy -= 2 * dot * ny;
            
            multiplier += 0.10;
            if (multiplierDisplay) multiplierDisplay.innerText = multiplier.toFixed(2) + 'x';
        }
    }

    // 4. Отрисовка шарика
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = isEscaped ? '#fff' : '#00ff88';
    ctx.shadowBlur = 15;
    ctx.shadowColor = ctx.fillStyle;
    ctx.fill();
    ctx.shadowBlur = 0;

    ring.rotation += ring.speed;
    requestAnimationFrame(draw);
}

function startGame() {
    initParams();
    isPlaying = true;
    playBtn.classList.add('hidden');
    cashoutBtn.classList.remove('hidden');
    gameMessage.classList.add('hidden');
    draw();
}

function endGame(isWin) {
    isPlaying = false;
    if (isWin) {
        showMessage(`ПОБЕДА!\nВыигрыш: ${multiplier.toFixed(2)}x`, "#00ff88");
    } else {
        showMessage("ПРОИГРЫШ!\nПопали в красную зону", "#ff0000");
        if (multiplierDisplay) multiplierDisplay.innerText = '1.00x';
    }
    
    playBtn.classList.remove('hidden');
    cashoutBtn.classList.add('hidden');
}

playBtn.onclick = startGame;
cashoutBtn.onclick = () => endGame(true);
