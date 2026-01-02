window.onload = function() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreElement = document.getElementById('score');
    const startBtn = document.getElementById('startBtn');

    console.log("Игра загружена. Кнопка найдена:", !!startBtn);

    canvas.width = 400;
    canvas.height = 600;

    const center = { x: canvas.width / 2, y: canvas.height / 2 - 50 };
    const radius = 130;
    const gapAngle = 0.7; 

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

    function launchBall() {
        console.log("Кнопка нажата, запуск!");
        ball.x = center.x;
        ball.y = center.y;
        
        // Рандомный запуск
        const randomAngle = Math.random() * Math.PI * 2;
        const speed = 5; 
        ball.vx = Math.cos(randomAngle) * speed;
        ball.vy = Math.sin(randomAngle) * speed;
        
        multiplier = 1.00;
        scoreElement.textContent = "1.00";
        isFalling = false;
        gameActive = true;
        startBtn.style.display = 'none'; 
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 1. Рисуем зоны
        const zh = 120;
        ctx.font = '50px Arial';
        ctx.textAlign = 'center';
        
        ctx.fillStyle = '#ff4444';
        ctx.fillRect(0, canvas.height - zh, canvas.width/2, zh);
        ctx.fillStyle = 'white';
        ctx.fillText('💀', canvas.width/4, canvas.height - 50);

        ctx.fillStyle = '#44ff44';
        ctx.fillRect(canvas.width/2, canvas.height - zh, canvas.width/2, zh);
        ctx.fillStyle = 'white';
        ctx.fillText('🤑', canvas.width * 0.75, canvas.height - 50);

        // 2. Вращаем кольцо (всегда, даже если не играем)
        trackRotation += 0.02;
        ctx.save();
        ctx.translate(center.x, center.y);
        ctx.rotate(trackRotation);
        ctx.beginPath();
        ctx.arc(0, 0, radius, gapAngle/2 + 1.57, -gapAngle/2 + 1.57);
        ctx.strokeStyle = '#ff00ff';
        ctx.lineWidth = 12;
        ctx.lineCap = 'round';
        ctx.stroke();
        ctx.restore();

        // 3. Логика игры
        if (gameActive) {
            if (!isFalling) {
                ball.x += ball.vx;
                ball.y += ball.vy;

                const dx = ball.x - center.x;
                const dy = ball.y - center.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist + ball.size > radius) {
                    const angle = Math.atan2(dy, dx);
                    const normAngle = (angle - trackRotation + Math.PI * 10) % (Math.PI * 2);
                    
                    if (normAngle > 1.57 - gapAngle/2 && normAngle < 1.57 + gapAngle/2) {
                        isFalling = true;
                    } else {
                        const normalX = dx / dist;
                        const normalY = dy / dist;
                        const dot = ball.vx * normalX + ball.vy * normalY;
                        
                        ball.vx = (ball.vx - 2 * dot * normalX) + (Math.random() - 0.5);
                        ball.vy = (ball.vy - 2 * dot * normalY) + (Math.random() - 0.5);

                        ball.x = center.x + normalX * (radius - ball.size - 1);
                        ball.y = center.y + normalY * (radius - ball.size - 1);

                        multiplier += 0.15;
                        scoreElement.textContent = multiplier.toFixed(2);
                    }
                }
            } else {
                ball.vy += 0.4;
                ball.x += ball.vx * 0.3;
                ball.y += ball.vy;

                if (ball.y > canvas.height - 50) {
                    gameActive = false;
                    startBtn.style.display = 'inline-block';
                    startBtn.textContent = "ЕЩЕ РАЗ";
                }
            }

            // Рисуем шар
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2);
            ctx.fillStyle = '#00d2ff';
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#00d2ff';
            ctx.fill();
            ctx.shadowBlur = 0;
        }

        requestAnimationFrame(draw);
    }

    // Слушатель клика
    startBtn.onclick = launchBall;

    // Запуск цикла
    draw();
};
