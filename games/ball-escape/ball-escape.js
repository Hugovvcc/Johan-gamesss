const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('startButton');
const scoreElement = document.getElementById('score');

// Устанавливаем размер холста
canvas.width = window.innerWidth > 600 ? 600 : window.innerWidth;
canvas.height = window.innerHeight > 800 ? 800 : window.innerHeight;

let gameRunning = false;
let score = 0;

function startGame() {
    gameRunning = true;
    startButton.style.display = 'none';
    gameLoop();
}

function gameLoop() {
    if (!gameRunning) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height); // Очистка холста

    // Здесь будет код для рисования круговой трассы и шариков

    // Пример рисования розовой окружности (трассы)
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 200, 0, Math.PI * 2);
    ctx.strokeStyle = '#ff00ff';
    ctx.lineWidth = 10;
    ctx.stroke();

    score += 1;
    scoreElement.textContent = score;

    requestAnimationFrame(gameLoop); // Запуск следующего кадра
}

startButton.addEventListener('click', startGame);

// Обработка кликов по canvas для управления (пока пустая)
canvas.addEventListener('click', () => {
    if (gameRunning) {
        // Здесь будет логика смены направления движения
    }
});
