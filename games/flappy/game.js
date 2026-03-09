// Flappy Bird Clone
(function () {
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const overlay = document.getElementById('overlay');
  const overlayMsg = document.getElementById('overlayMsg');
  const startBtn = document.getElementById('startBtn');
  const scoreEl = document.getElementById('score');
  const bestEl = document.getElementById('best');

  let bird, pipes, score, best, raf, running, frameCount;

  const W = canvas.width, H = canvas.height;
  const PIPE_W = 52, GAP = 145, PIPE_SPEED = 2.5;
  const GRAV = 0.38, FLAP = -7, MAX_FALL = 10;

  best = parseInt(localStorage.getItem('flappy_best') || '0');
  bestEl.textContent = best;

  function startGame() {
    overlay.style.display = 'none';
    bird = { x: 80, y: H / 2 - 10, vy: 0, r: 15 };
    pipes = [];
    score = 0;
    frameCount = 0;
    running = true;
    scoreEl.textContent = 0;
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(loop);
  }

  function flap() {
    if (running) bird.vy = FLAP;
  }

  function spawnPipe() {
    const top = 80 + Math.random() * (H - 80 - GAP - 80);
    pipes.push({ x: W, top, scored: false });
  }

  function loop() {
    if (!running) return;
    update();
    draw();
    raf = requestAnimationFrame(loop);
  }

  function update() {
    frameCount++;
    if (frameCount % 90 === 0) spawnPipe();

    bird.vy = Math.min(bird.vy + GRAV, MAX_FALL);
    bird.y += bird.vy;

    // Ground / ceiling
    if (bird.y - bird.r < 0 || bird.y + bird.r > H - 30) { gameOver(); return; }

    pipes.forEach(p => {
      p.x -= PIPE_SPEED;

      // Score
      if (!p.scored && p.x + PIPE_W < bird.x) {
        p.scored = true;
        score++;
        scoreEl.textContent = score;
        if (score > best) { best = score; bestEl.textContent = best; localStorage.setItem('flappy_best', best); }
      }

      // Collision
      if (bird.x + bird.r > p.x && bird.x - bird.r < p.x + PIPE_W) {
        if (bird.y - bird.r < p.top || bird.y + bird.r > p.top + GAP) {
          gameOver(); return;
        }
      }
    });

    pipes = pipes.filter(p => p.x > -PIPE_W);
  }

  function draw() {
    // Sky gradient
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#0a0a2a');
    sky.addColorStop(1, '#1a2a4a');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    // Stars
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    for (let i = 0; i < 30; i++) {
      // deterministic stars using simple hash
      const sx = (i * 137 + 50) % W;
      const sy = (i * 97 + 20) % (H - 60);
      ctx.fillRect(sx, sy, 1.5, 1.5);
    }

    // Pipes
    pipes.forEach(p => {
      // Top pipe
      const tg = ctx.createLinearGradient(p.x, 0, p.x + PIPE_W, 0);
      tg.addColorStop(0, '#1a6b1a');
      tg.addColorStop(0.5, '#39ff14');
      tg.addColorStop(1, '#0d3d0d');
      ctx.fillStyle = tg;
      ctx.fillRect(p.x, 0, PIPE_W, p.top);
      ctx.fillRect(p.x - 5, p.top - 20, PIPE_W + 10, 22); // cap

      // Bottom pipe
      const bg2 = ctx.createLinearGradient(p.x, 0, p.x + PIPE_W, 0);
      bg2.addColorStop(0, '#1a6b1a');
      bg2.addColorStop(0.5, '#39ff14');
      bg2.addColorStop(1, '#0d3d0d');
      ctx.fillStyle = bg2;
      const bY = p.top + GAP;
      ctx.fillRect(p.x, bY, PIPE_W, H - bY);
      ctx.fillRect(p.x - 5, bY, PIPE_W + 10, 22); // cap

      // Pipe border
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.lineWidth = 1;
      ctx.strokeRect(p.x, 0, PIPE_W, p.top);
      ctx.strokeRect(p.x, bY, PIPE_W, H - bY);
    });

    // Ground
    ctx.fillStyle = '#1a3a1a';
    ctx.fillRect(0, H - 30, W, 30);
    ctx.fillStyle = '#39ff14';
    ctx.fillRect(0, H - 30, W, 3);

    // Bird (circle with gradient)
    const angle = Math.atan2(bird.vy, 5);
    ctx.save();
    ctx.translate(bird.x, bird.y);
    ctx.rotate(Math.min(Math.PI / 4, Math.max(-Math.PI / 4, angle)));
    const bg = ctx.createRadialGradient(-3, -3, 2, 0, 0, bird.r);
    bg.addColorStop(0, '#fff176');
    bg.addColorStop(0.6, '#ffd600');
    bg.addColorStop(1, '#ff8f00');
    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.arc(0, 0, bird.r, 0, Math.PI * 2);
    ctx.fill();
    // Wing
    ctx.fillStyle = '#ff8f00';
    ctx.beginPath();
    ctx.ellipse(-4, 4, 8, 5, -0.4, 0, Math.PI * 2);
    ctx.fill();
    // Eye
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(7, -4, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#222';
    ctx.beginPath(); ctx.arc(8, -4, 2.5, 0, Math.PI * 2); ctx.fill();
    // Beak
    ctx.fillStyle = '#ff6d00';
    ctx.beginPath();
    ctx.moveTo(13, -1); ctx.lineTo(20, 2); ctx.lineTo(13, 4);
    ctx.closePath(); ctx.fill();
    ctx.restore();

    // Score overlay
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = 'bold 28px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(score, W / 2, 50);
  }

  function gameOver() {
    running = false;
    overlayMsg.textContent = `Score: ${score}  •  Best: ${best}`;
    startBtn.textContent = 'Play Again';
    overlay.style.display = 'flex';
    draw();
  }

  // Controls
  canvas.addEventListener('click', flap);
  canvas.addEventListener('touchstart', e => { e.preventDefault(); flap(); }, { passive: false });
  document.addEventListener('keydown', e => { if (e.code === 'Space') { e.preventDefault(); flap(); } });
  startBtn.addEventListener('click', startGame);
})();
