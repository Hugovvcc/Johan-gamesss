// Ball Escape - простая рабочая версия

let gameActive = false;
let multiplier = 1.0;
let bet = 1;
let ballMoving = false;

function initGame() {
    console.log("Ball Escape loaded");
    
    // Кнопки ставок
    document.querySelectorAll(".bet-btn").forEach(btn => {
        btn.onclick = () => {
            bet = parseFloat(btn.getAttribute("data-bet"));
            document.getElementById("betAmount").value = bet;
            
            // Подсветка кнопки
            document.querySelectorAll(".bet-btn").forEach(b => {
                b.style.background = "rgba(255,255,255,0.1)";
            });
            btn.style.background = "linear-gradient(45deg,#ff6bb5,#ff9ccd)";
        };
    });
    
    // Кнопка OK
    document.querySelector("button[onclick*='updateBet']").onclick = function() {
        let value = parseFloat(document.getElementById("betAmount").value);
        if (value >= 0.1 && value <= 50) {
            bet = value;
            document.querySelectorAll(".bet-btn").forEach(b => {
                b.style.background = "rgba(255,255,255,0.1)";
            });
        }
    };
}

// Старт игры (вызывается из HTML)
function startGame() {
    if (gameActive) return;
    
    if (window.gameAPI.getBalance() < bet) {
        alert("Недостаточно баланса!");
        return;
    }
    
    window.gameAPI.updateBalance(-bet);
    gameActive = true;
    multiplier = 1.0;
    ballMoving = true;
    
    document.getElementById("startBtn").disabled = true;
    document.getElementById("startBtn").innerHTML = "🎱 ШАРИК ПРЫГАЕТ";
    
    // Анимация шарика
    moveBall();
    
    // Через 3-5 секунд падение
    setTimeout(() => {
        if (gameActive) {
            ballFall();
        }
    }, 3000 + Math.random() * 2000);
}

function moveBall() {
    if (!ballMoving) return;
    
    const ball = document.getElementById("ball");
    let x = 175, y = 175;
    let vx = (Math.random() - 0.5) * 8;
    let vy = (Math.random() - 0.5) * 8;
    
    function animate() {
        if (!ballMoving) return;
        
        x += vx;
        y += vy;
        
        // Отскок от круга
        let dx = x - 175;
        let dy = y - 175;
        let dist = Math.sqrt(dx*dx + dy*dy);
        
        if (dist > 150) {
            let angle = Math.atan2(dy, dx);
            x = 175 + 145 * Math.cos(angle);
            y = 175 + 145 * Math.sin(angle);
            
            let nx = dx/dist;
            let ny = dy/dist;
            let dot = vx*nx + vy*ny;
            vx = vx - 2*dot*nx;
            vy = vy - 2*dot*ny;
            
            // Эффект удара
            ball.style.transform = "scale(1.1)";
            setTimeout(() => ball.style.transform = "scale(1)", 100);
        }
        
        ball.style.left = x + "px";
        ball.style.top = y + "px";
        
        // Увеличиваем множитель
        multiplier += 0.02;
        document.getElementById("bigMultiplier").textContent = multiplier.toFixed(2) + "x";
        
        requestAnimationFrame(animate);
    }
    
    animate();
}

function ballFall() {
    ballMoving = false;
    const ball = document.getElementById("ball");
    
    // Падение к дырке
    ball.style.transition = "all 1s ease";
    ball.style.left = "200px";
    ball.style.top = "420px";
    
    setTimeout(() => {
        // Падение на поле (60% шанс на победу)
        let win = Math.random() < 0.6;
        let finalX = win ? 100 : 300;
        
        ball.style.transition = "all 0.5s ease";
        ball.style.left = finalX + "px";
        ball.style.top = "460px";
        
        if (win) {
            ball.style.background = "radial-gradient(circle at 30% 30%,#00ff9d,#00cc7a)";
        } else {
            ball.style.background = "radial-gradient(circle at 30% 30%,#ff4466,#cc0033)";
        }
        
        // Завершение игры
        setTimeout(() => finishGame(win), 1000);
    }, 1000);
}

function finishGame(win) {
    if (win) {
        let winAmount = bet * (multiplier - 1);
        window.gameAPI.updateBalance(winAmount);
        alert(`ПОБЕДА! +${winAmount.toFixed(2)} TON`);
    } else {
        alert(`ПРОИГРЫШ! -${bet.toFixed(2)} TON`);
    }
    
    // Сброс
    gameActive = false;
    const ball = document.getElementById("ball");
    ball.style.transition = "all 0.5s ease";
    ball.style.left = "175px";
    ball.style.top = "175px";
    ball.style.background = "radial-gradient(circle at 30% 30%,#ff9ccd,#ff6bb5,#ff0080)";
    
    document.getElementById("startBtn").disabled = false;
    document.getElementById("startBtn").innerHTML = "🎱 СЫГРАТЬ";
}
