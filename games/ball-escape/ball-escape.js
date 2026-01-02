const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('startButton');
const scoreElement = document.getElementById('score');

// Устанавливаем размер холста
canvas.width = window.innerWidth > 600 ? 600 : window.innerWidth;
canvas.height = window.innerHeight > 800 ? 800 : window.innerHeight;

let gameRunning = false;
let score = 0;
const center = { x: canvas.width / 2, y: canvas.height / 2 };
const radius = 200; // Радіус кола, як на зображенні

// Параметри гравця
const player = {
    angle: Math.PI / 2, // Початкове положення (верх кола)
    speed: 0.03, // Швидкість руху по колу (радіани за кадр)
    direction: 1, // Напрямок руху: 1 = за годинниковою стрілкою, -1 = проти
    size: 15
};

function startGame() {
    gameRunning = true;
    startButton.style.display = 'none';
    score = 0;
    player.angle = Math.PI / 2;
    gameLoop();
}

function updateGame() {
    // Оновлюємо кут гравця залежно від швидкості та напрямку
    player.angle += player.speed * player.direction;
    
    // Обчислюємо нові координати гравця за допомогою тригонометрії
    const x = center.x + Math.cos(player.angle) * radius;
    const y = center.y + Math.sin(player.angle) * radius;
    
    player.x = x;
    player.y = y;

    score += 1;
    scoreElement.textContent = Math.floor(score / 10); // Рахунок зростає повільніше
}

function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Очистка холста
    
    // Малюємо рожеву трасу
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
    ctx.strokeStyle = '#ff00ff'; // Неоновий рожевий
    ctx.lineWidth = 10;
    ctx.stroke();

    // Малюємо гравця (синій шар)
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.size, 0, Math.PI * 2);
    ctx.fillStyle = '#0066ff'; // Яскраво-синій
    ctx.fill();
}

function gameLoop() {
    if (!gameRunning) return;

    updateGame();
    drawGame();

    requestAnimationFrame(gameLoop); // Запуск следующего кадра
}

startButton.addEventListener('click', startGame);

// Обробка кліків по canvas для зміни напрямку
canvas.addEventListener('click', () => {
    if (gameRunning) {
        player.direction *= -1; // Просто інвертуємо напрямок (1 стає -1, і навпаки)
    }
});
