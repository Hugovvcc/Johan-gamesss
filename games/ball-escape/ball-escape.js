const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const dpr = window.devicePixelRatio || 1;

// High DPI scaling
const rect = canvas.getBoundingClientRect();
canvas.width = rect.width * dpr;
canvas.height = rect.height * dpr;
ctx.scale(dpr, dpr);

// UI Elements
const multEl = document.getElementById("multValue");
const btn = document.getElementById("startBtn");
const statusEl = document.getElementById("statusMessage");

// Config
const CONFIG = {
    centerX: rect.width / 2,
    centerY: 260,
    radius: 140,
    ballRadius: 10,
    gapSize: 0.65, // Radians
    gravity: 0.25,
    rotationSpeed: 0.02,
    bounceDamping: 1.02, // Add energy on bounce
    maxSpeed: 18,
    trailLength: 12
};

// State
let state = {
    running: false,
    falling: false,
    finished: false,
    rotation: 0,
    multiplier: 1.00,
    particles: []
};

// Ball Object
let ball = {
    x: CONFIG.centerX,
    y: CONFIG.centerY,
    vx: 0,
    vy: 0,
    history: [] // For trail
};

// Audio (Optional Placeholder)
const playSound = (type) => {
    // Implement sound effects here if needed
};

// Utils
const randomRange = (min, max) => Math.random() * (max - min) + min;
const distance = (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1);

function initGame() {
    state.multiplier = 1.00;
    state.running = true;
    state.falling = false;
    state.finished = false;
    state.rotation = 0;
    state.particles = [];
    
    multEl.textContent = "1.00";
    statusEl.className = "status hidden";
    btn.style.display = "none";

    // Randomize start
    const angle = Math.random() * Math.PI * 2;
    const speed = randomRange(6, 9);
    
    ball.x = CONFIG.centerX;
    ball.y = CONFIG.centerY;
    ball.vx = Math.cos(angle) * speed;
    ball.vy = Math.sin(angle) * speed;
    ball.history = [];
}

function spawnParticles(x, y, color) {
    for (let i = 0; i < 8; i++) {
        state.particles.push({
            x, y,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            life: 1.0,
            color
        });
    }
}

function updatePhysics() {
    if (!state.running) return;

    // Rotate ring
    state.rotation += CONFIG.rotationSpeed;

    // Update Particles
    for (let i = state.particles.length - 1; i >= 0; i--) {
        let p = state.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.05;
        if (p.life <= 0) state.particles.splice(i, 1);
    }

    // Ball Trail
    ball.history.push({ x: ball.x, y: ball.y });
    if (ball.history.length > CONFIG.trailLength) ball.history.shift();

    if (state.falling) {
        // GRAVITY MODE
        ball.vy += CONFIG.gravity;
        ball.x += ball.vx;
        ball.y += ball.vy;

        // Bounce off walls (optional, creates chaos)
        if (ball.x < ball.radius || ball.x > rect.width - ball.radius) {
            ball.vx *= -0.6;
            ball.x = ball.x < ball.radius ? ball.radius : rect.width - ball.radius;
        }

        // Check ground/zones
        const zoneHeight = 120;
        if (ball.y > rect.height - zoneHeight - CONFIG.ballRadius) {
            finishGame();
        }
        return;
    }

    // INSIDE RING MODE
    ball.x += ball.vx;
    ball.y += ball.vy;

    const dx = ball.x - CONFIG.centerX;
    const dy = ball.y - CONFIG.centerY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Collision Check
    if (dist + CONFIG.ballRadius >= CONFIG.radius) {
        const angleToBall = Math.atan2(dy, dx);
        
        // Normalize angles to 0 - 2PI for easy comparison
        const normalizedBallAngle = (angleToBall - state.rotation + Math.PI * 4) % (Math.PI * 2);
        // The gap is visually at the "bottom" relative to rotation frame? 
        // In drawTrack, the arc is drawn from (gap/2 + PI/2) to (-gap/2 + PI/2).
        // This means the gap IS the segment between -gap/2+PI/2 and gap/2+PI/2.
        // Wait, start angle: gap/2 + PI/2 (approx 100 deg)
        // End angle: -gap/2 + PI/2 (approx 80 deg)
        // Canvas arcs are clockwise. So it draws from 100 deg all the way around to 80 deg.
        // The GAP is between 80 deg and 100 deg (around 90 deg / PI/2).
        
        const gapCenter = Math.PI / 2;
        const distFromGap = Math.abs(normalizedBallAngle - gapCenter);
        
        // Check if ball is within the gap
        if (distFromGap < CONFIG.gapSize / 2) {
            // ESCAPE!
            state.falling = true;
            spawnParticles(ball.x, ball.y, "#ffffff");
            // Add a little kick outwards based on current velocity to ensure it clears visual rim
            ball.x += ball.vx * 2; 
            ball.y += ball.vy * 2;
        } else {
            // BOUNCE
            // Normal vector at collision point
            const nx = dx / dist;
            const ny = dy / dist;
            
            // Reflect velocity: v' = v - 2(v·n)n
            const dot = ball.vx * nx + ball.vy * ny;
            ball.vx = ball.vx - 2 * dot * nx;
            ball.vy = ball.vy - 2 * dot * ny;

            // Add energy (gameplay mechanic)
            ball.vx *= CONFIG.bounceDamping;
            ball.vy *= CONFIG.bounceDamping;

            // Cap speed
            const speed = Math.hypot(ball.vx, ball.vy);
            if (speed > CONFIG.maxSpeed) {
                const scale = CONFIG.maxSpeed / speed;
                ball.vx *= scale;
                ball.vy *= scale;
            }

            // Push ball out of wall to prevent sticking
            ball.x = CONFIG.centerX + nx * (CONFIG.radius - CONFIG.ballRadius - 1);
            ball.y = CONFIG.centerY + ny * (CONFIG.radius - CONFIG.ballRadius - 1);

            // Chaos factor (user requested "different trajectories")
            ball.vx += (Math.random() - 0.5) * 0.5;
            ball.vy += (Math.random() - 0.5) * 0.5;

            // Gameplay updates
            state.multiplier += 0.15; // Faster progression
            multEl.textContent = state.multiplier.toFixed(2);
            spawnParticles(ball.x, ball.y, "#00d2ff");
            
            // Slight screen shake or visual impact could go here
        }
    }
}

function finishGame() {
    state.running = false;
    state.finished = true;
    
    // Determine Win/Lose based on X position
    // Center divider logic
    const isWin = ball.x < rect.width / 2;
    
    statusEl.classList.remove("hidden");
    if (isWin) {
        statusEl.textContent = `YOU WON $${(100 * state.multiplier).toFixed(0)}`;
        statusEl.classList.add("win");
        statusEl.classList.remove("lose");
        spawnParticles(ball.x, ball.y, "#00ff88");
    } else {
        statusEl.textContent = "LOSS";
        statusEl.classList.add("lose");
        statusEl.classList.remove("win");
        spawnParticles(ball.x, ball.y, "#ff3333");
    }

    btn.textContent = "PLAY AGAIN";
    btn.style.display = "block";
}

// Drawing Functions
function drawZones() {
    const h = 120;
    const y = rect.height - h;

    // Left Zone (Win)
    const gradWin = ctx.createLinearGradient(0, y, 0, rect.height);
    gradWin.addColorStop(0, "rgba(0, 255, 136, 0.2)");
    gradWin.addColorStop(1, "rgba(0, 255, 136, 0.05)");
    ctx.fillStyle = gradWin;
    ctx.fillRect(0, y, rect.width / 2, h);
    
    // Border Win
    ctx.strokeStyle = "#00ff88";
    ctx.lineWidth = 2;
    ctx.strokeRect(2, y, rect.width / 2 - 4, h - 2);

    // Right Zone (Lose)
    const gradLose = ctx.createLinearGradient(0, y, 0, rect.height);
    gradLose.addColorStop(0, "rgba(255, 51, 51, 0.2)");
    gradLose.addColorStop(1, "rgba(255, 51, 51, 0.05)");
    ctx.fillStyle = gradLose;
    ctx.fillRect(rect.width / 2, y, rect.width / 2, h);

    // Border Lose
    ctx.strokeStyle = "#ff3333";
    ctx.strokeRect(rect.width / 2 + 2, y, rect.width / 2 - 4, h - 2);

    // Icons/Text
    ctx.font = "bold 36px Segoe UI, Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    
    ctx.shadowBlur = 15;
    ctx.shadowColor = "#00ff88";
    ctx.fillStyle = "#fff";
    ctx.fillText("WIN", rect.width / 4, y + h/2);

    ctx.shadowColor = "#ff3333";
    ctx.fillText("LOSE", rect.width * 0.75, y + h/2);
    
    ctx.shadowBlur = 0;
}

function drawTrack() {
    ctx.save();
    ctx.translate(CONFIG.centerX, CONFIG.centerY);
    ctx.rotate(state.rotation);

    // Main Ring
    ctx.beginPath();
    // Arc: draws the LINE. We want a gap at bottom (PI/2).
    // So we draw from (PI/2 + gap/2) around to (PI/2 - gap/2)
    ctx.arc(0, 0, CONFIG.radius, Math.PI/2 + CONFIG.gapSize/2, Math.PI/2 - CONFIG.gapSize/2);
    
    ctx.strokeStyle = "#ff00ff";
    ctx.lineWidth = 12;
    ctx.lineCap = "round";
    ctx.shadowBlur = 20;
    ctx.shadowColor = "#ff00ff";
    ctx.stroke();

    // Inner Glow Ring (decoration)
    ctx.beginPath();
    ctx.arc(0, 0, CONFIG.radius - 20, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255, 0, 255, 0.1)";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();
}

function drawBall() {
    // Draw Trail
    if (state.running || state.falling) {
        ctx.beginPath();
        for (let i = 0; i < ball.history.length; i++) {
            const pos = ball.history[i];
            if (i === 0) ctx.moveTo(pos.x, pos.y);
            else ctx.lineTo(pos.x, pos.y);
        }
        ctx.lineCap = "round";
        ctx.lineWidth = CONFIG.ballRadius * 0.8;
        ctx.strokeStyle = "rgba(0, 210, 255, 0.3)";
        ctx.stroke();
    }

    // Draw Ball
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, CONFIG.ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#00d2ff";
    ctx.shadowBlur = 20;
    ctx.shadowColor = "#00d2ff";
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // Highlight
    ctx.fillStyle = "rgba(255,255,255,0.8)";
    ctx.beginPath();
    ctx.arc(ball.x - 3, ball.y - 3, 3, 0, Math.PI * 2);
    ctx.fill();
}

function drawParticles() {
    for (let p of state.particles) {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
    }
}

function loop() {
    // Clear with slight fade for trail effect (optional, but we use history array instead for cleaner look)
    ctx.clearRect(0, 0, rect.width, rect.height);
    
    drawZones();
    drawTrack();
    drawParticles();
    drawBall();
    
    updatePhysics();
    
    requestAnimationFrame(loop);
}

// Events
btn.onclick = initGame;

// Start Loop
loop();
