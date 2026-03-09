// Brick Breaker / Breakout
(function () {
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const overlay = document.getElementById('overlay');
  const overlayMsg = document.getElementById('overlayMsg');
  const startBtn = document.getElementById('startBtn');
  const scoreEl = document.getElementById('score');
  const livesEl = document.getElementById('lives');

  const W = canvas.width, H = canvas.height;
  const PAD_H = 14, PAD_W = 80;
  const BALL_R = 9;
  const ROWS = 5, COLS = 8;
  const BRICK_W = (W - 20) / COLS;
  const BRICK_H = 22;
  const BRICK_PAD = 4;
  const BRICK_OFF_Y = 60;

  const ROW_COLORS = [
    ['#ff2d78','#cc0055'],['#ff8c00','#cc5500'],['#ffd60a','#aa8800'],
    ['#39ff14','#1a8a00'],['#00f5ff','#0088aa']
  ];

  let ball, paddle, bricks, score, lives, raf, running;

  function resize() {
    const size = Math.min(400, window.innerWidth - 16);
    canvas.width = size;
    canvas.height = Math.round(size * 1.25);
  }

  function makeBricks() {
    bricks = [];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        bricks.push({ r, c, alive: true, color: ROW_COLORS[r][0], shadow: ROW_COLORS[r][1] });
      }
    }
  }

  function startGame() {
    overlay.style.display = 'none';
    resize();
    const cW = canvas.width, cH = canvas.height;
    paddle = { x: cW / 2 - PAD_W / 2, y: cH - 40, w: PAD_W, h: PAD_H };
    ball = { x: cW / 2, y: cH / 2, vx: 3, vy: -3.5, r: BALL_R };
    makeBricks();
    score = 0; lives = 3;
    running = true;
    scoreEl.textContent = 0;
    livesEl.textContent = '❤️❤️❤️';
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(loop);
  }

  function loop() {
    if (!running) return;
    update();
    draw();
    raf = requestAnimationFrame(loop);
  }

  function brickRect(b) {
    const bw = (canvas.width - 20) / COLS;
    const x = 10 + b.c * bw + BRICK_PAD / 2;
    const y = BRICK_OFF_Y + b.r * (BRICK_H + BRICK_PAD);
    return { x, y, w: bw - BRICK_PAD, h: BRICK_H };
  }

  function update() {
    const cW = canvas.width, cH = canvas.height;
    ball.x += ball.vx;
    ball.y += ball.vy;

    // Wall bounce
    if (ball.x - ball.r < 0) { ball.vx = Math.abs(ball.vx); ball.x = ball.r; }
    if (ball.x + ball.r > cW) { ball.vx = -Math.abs(ball.vx); ball.x = cW - ball.r; }
    if (ball.y - ball.r < 0) { ball.vy = Math.abs(ball.vy); ball.y = ball.r; }

    // Paddle bounce
    if (ball.y + ball.r > paddle.y && ball.y - ball.r < paddle.y + paddle.h &&
        ball.x > paddle.x && ball.x < paddle.x + paddle.w) {
      ball.vy = -Math.abs(ball.vy);
      const hit = (ball.x - (paddle.x + paddle.w / 2)) / (paddle.w / 2);
      ball.vx = hit * 5;
      ball.y = paddle.y - ball.r;
    }

    // Fall off
    if (ball.y - ball.r > cH) {
      lives--;
      livesEl.textContent = ['','❤️','❤️❤️','❤️❤️❤️'][lives] || '';
      if (lives <= 0) { gameOver(false); return; }
      ball.x = cW / 2; ball.y = cH / 2; ball.vx = 3; ball.vy = -3.5;
    }

    // Brick collision
    bricks.forEach(b => {
      if (!b.alive) return;
      const { x, y, w, h } = brickRect(b);
      if (ball.x + ball.r > x && ball.x - ball.r < x + w &&
          ball.y + ball.r > y && ball.y - ball.r < y + h) {
        b.alive = false;
        score += 10;
        scoreEl.textContent = score;
        // Which face?
        const prevY = ball.y - ball.vy;
        if (prevY + ball.r <= y || prevY - ball.r >= y + h) ball.vy = -ball.vy;
        else ball.vx = -ball.vx;
      }
    });

    if (bricks.every(b => !b.alive)) { gameOver(true); }
  }

  function draw() {
    const cW = canvas.width, cH = canvas.height;
    ctx.fillStyle = '#06060f';
    ctx.fillRect(0, 0, cW, cH);

    // Bricks
    bricks.forEach(b => {
      if (!b.alive) return;
      const { x, y, w, h } = brickRect(b);
      ctx.fillStyle = b.color;
      ctx.beginPath(); ctx.roundRect(x, y, w, h, 4); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      ctx.beginPath(); ctx.roundRect(x + 2, y + 2, w - 4, h / 2 - 2, 3); ctx.fill();
      ctx.strokeStyle = b.shadow;
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.roundRect(x, y, w, h, 4); ctx.stroke();
    });

    // Paddle
    const pg = ctx.createLinearGradient(paddle.x, paddle.y, paddle.x, paddle.y + paddle.h);
    pg.addColorStop(0, '#9d4edd');
    pg.addColorStop(1, '#6a00f4');
    ctx.fillStyle = pg;
    ctx.beginPath(); ctx.roundRect(paddle.x, paddle.y, paddle.w, paddle.h, 7); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.roundRect(paddle.x, paddle.y, paddle.w, paddle.h, 7); ctx.stroke();

    // Ball
    const bg = ctx.createRadialGradient(ball.x - 2, ball.y - 2, 1, ball.x, ball.y, ball.r);
    bg.addColorStop(0, '#fff');
    bg.addColorStop(0.5, '#00f5ff');
    bg.addColorStop(1, '#0088aa');
    ctx.fillStyle = bg;
    ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2); ctx.fill();

    // Glow
    ctx.shadowBlur = 15; ctx.shadowColor = '#00f5ff';
    ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
  }

  function gameOver(win) {
    running = false;
    overlayMsg.textContent = win ? `🏆 You Win! Score: ${score}` : `💀 Game Over! Score: ${score}`;
    startBtn.textContent = 'Play Again';
    overlay.style.display = 'flex';
  }

  // Mouse
  canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    paddle.x = Math.max(0, Math.min(canvas.width - paddle.w, mx - paddle.w / 2));
  });

  // Touch
  canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const tx = (e.touches[0].clientX - rect.left) * (canvas.width / rect.width);
    paddle.x = Math.max(0, Math.min(canvas.width - paddle.w, tx - paddle.w / 2));
  }, { passive: false });

  startBtn.addEventListener('click', startGame);
  window.addEventListener('resize', () => { if (!running) resize(); });
})();
