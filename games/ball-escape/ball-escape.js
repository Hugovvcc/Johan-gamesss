const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

canvas.width = 400;
canvas.height = 500; // Добавляем место для зон выигрыша/проигрыша

let gameRunning = false;
let score = 0;
const center = { x: canvas.width / 2, y: canvas.height / 2 - 50 }; // Центр выше для зон внизу
const radius = 120; // Радиус трека
const trackWidth = 15;
const gapAngle = Math.PI / 4; // Размер щели (45 градусов)

let trackRotation = 0;
const rotationSpeed = 0.01;

const player = {
    // Шар изначально привязан к верхней части трека
    angle: -Math.PI / 2, 
    isInside: true,
    x: 0,
    y: 0,
    size: 10
};

// Зоны выигрыша/проигрыша (зеленая/красная)
const zoneHeight = 100;

function startGame() {
    gameRunning = true;
    score = 0;
    player.isInside = true;
    trackRotation = 0;
    gameLoop();
}

function updateGame() {
    if (!player.isInside) return;

    // Вращаем трек
    trackRotation += rotationSpeed;
    
    // Позиция шара относительно центра трека
    // Шар не двигается сам, он привязан к вращающемуся треку
    const currentAngle = player.angle + trackRotation;
    player.x = center.x + Math.cos(currentAngle) * radius;
    player.y = center.y + Math.sin(currentAngle) * radius;

    score++;
    scoreElement.textContent = Math.floor(score / 50);
}

function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Рисуем нижние зоны (красная и зеленая)
    ctx.fillStyle = '#ff5555'; // Красная
    ctx.fillRect(0, canvas.height - zoneHeight, canvas.width / 2, zoneHeight);
    ctx.fillStyle = '#55ff55'; // Зеленая
    ctx.fillRect(canvas.width / 2, canvas.height - zoneHeight, canvas.width / 2, zoneHeight);
    
    // Рисуем вращающийся трек
    ctx.save();
    ctx.translate(center.x, center.y);
    ctx.rotate(trackRotation);
    
    // Рисуем дугу трека (от 0 до 2*PI минус размер щели)
    ctx.beginPath();
    // Вырезаем "дыру" в дуге
    ctx.arc(0, 0, radius, gapAngle / 2, Math.PI * 2 - gapAngle / 2);
    ctx.strokeStyle = '#ff00ff'; // Неоновый розовый
    ctx.lineWidth = trackWidth;
    ctx.stroke();

    ctx.restore(); // Восстанавливаем систему координат

    // Рисуем шар
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.size, 0, Math.PI * 2);
    ctx.fillStyle = '#0066ff';
    ctx.fill();
}

function gameLoop() {
    if (!gameRunning) return;

    updateGame();
    drawGame();
    
    // Базовая проверка "выпадения" шара - нужно будет доработать логику
    // Пока просто останавливаем игру, если игрок "выпал"
    if (!player.isInside) {
        console.log("Шар выпал!");
        // Здесь должна быть логика проверки на зеленую/красную зону
        gameRunning = false; 
    }

    requestAnimationFrame(gameLoop);
}

// При клике игрок "отпускает" шар, и он перестает следовать за вращением
canvas.addEventListener('click', () => {
    if (gameRunning && player.isInside) {
        // Чтобы шар выпал, мы просто перестаем обновлять его позицию относительно трека
        player.isInside = false;
        // В этот момент шар начинает двигаться по прямой вниз (нужно добавить логику физики)
    } else if (!gameRunning) {
        startGame();
    }
});

// Запускаем игру при первой загрузке, чтобы показать интерфейс
startGame();
