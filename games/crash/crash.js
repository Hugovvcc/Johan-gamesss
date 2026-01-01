function drawRocket(x, y, power) {
    ctx.save();
    ctx.translate(x, y);

    // плавное покачивание
    const tilt = Math.sin(Date.now() * 0.0015) * 0.08;
    ctx.rotate(tilt);

    // === НЕОНОВОЕ СВЕЧЕНИЕ ===
    ctx.shadowColor = "#ff7ac8";
    ctx.shadowBlur = 30;

    // === ОГОНЬ ===
    const flameLen = 60 + Math.sin(Date.now() * 0.01) * 15;

    const flameGrad = ctx.createLinearGradient(0, 20, 0, flameLen + 40);
    flameGrad.addColorStop(0, "#fff6a0");
    flameGrad.addColorStop(0.3, "#ff9f43");
    flameGrad.addColorStop(0.6, "#ff4d6d");
    flameGrad.addColorStop(1, "rgba(255,77,109,0)");

    ctx.fillStyle = flameGrad;
    ctx.beginPath();
    ctx.moveTo(-14, 20);
    ctx.quadraticCurveTo(-28, flameLen, 0, flameLen + 35);
    ctx.quadraticCurveTo(28, flameLen, 14, 20);
    ctx.fill();

    // === КОРПУС (МЕТАЛЛ) ===
    const bodyGrad = ctx.createLinearGradient(0, -100, 0, 40);
    bodyGrad.addColorStop(0, "#ffd1e8");
    bodyGrad.addColorStop(0.5, "#ff6bb5");
    bodyGrad.addColorStop(1, "#c94a8c");

    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.moveTo(0, -110);
    ctx.quadraticCurveTo(-26, -40, -20, 40);
    ctx.lineTo(20, 40);
    ctx.quadraticCurveTo(26, -40, 0, -110);
    ctx.fill();

    // === НОС ===
    ctx.fillStyle = "#ffe6f3";
    ctx.beginPath();
    ctx.moveTo(-18, -60);
    ctx.lineTo(0, -110);
    ctx.lineTo(18, -60);
    ctx.closePath();
    ctx.fill();

    // === ИЛЛЮМИНАТОР ===
    ctx.shadowBlur = 15;
    ctx.fillStyle = "#7df9ff";
    ctx.beginPath();
    ctx.arc(0, -30, 10, 0, Math.PI * 2);
    ctx.fill();

    // === БОКОВЫЕ КРЫЛЬЯ ===
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#ff6bb5";

    ctx.beginPath();
    ctx.moveTo(-20, 20);
    ctx.lineTo(-38, 40);
    ctx.lineTo(-20, 40);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(20, 20);
    ctx.lineTo(38, 40);
    ctx.lineTo(20, 40);
    ctx.fill();

    ctx.restore();
}
