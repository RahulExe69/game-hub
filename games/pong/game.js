// Pong – Player vs AI
(function () {
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const overlay = document.getElementById('overlay');
  const overlayMsg = document.getElementById('overlayMsg');
  const startBtn = document.getElementById('startBtn');
  const playerScoreEl = document.getElementById('playerScore');
  const aiScoreEl = document.getElementById('aiScore');

  const WIN_SCORE = 7;
  const PAD_W = 12, PAD_H = 70;
  const BALL_R = 8;

  let ball, playerPad, aiPad, pScore, aScore, raf, running, keys;
  let touchY = null, prevTouchY = null;

  function resize() {
    const maxW = Math.min(480, window.innerWidth - 16);
    canvas.width = maxW;
    canvas.height = Math.round(maxW * 2 / 3);
  }

  function startGame() {
    overlay.style.display = 'none';
    resize();
    const cW = canvas.width, cH = canvas.height;
    playerPad = { x: 12, y: cH / 2 - PAD_H / 2, w: PAD_W, h: PAD_H, speed: 6 };
    aiPad     = { x: cW - 12 - PAD_W, y: cH / 2 - PAD_H / 2, w: PAD_W, h: PAD_H, speed: 4.2 };
    pScore = 0; aScore = 0;
    keys = {};
    playerScoreEl.textContent = 0;
    aiScoreEl.textContent = 0;
    running = true;
    resetBall(1);
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(loop);
  }

  function resetBall(dir) {
    const cW = canvas.width, cH = canvas.height;
    const angle = (Math.random() * 0.6 - 0.3);
    const speed = 4.5;
    ball = {
      x: cW / 2, y: cH / 2,
      vx: dir * speed * Math.cos(angle),
      vy: speed * Math.sin(angle),
      r: BALL_R, trail: []
    };
  }

  function loop() {
    if (!running) return;
    update();
    draw();
    raf = requestAnimationFrame(loop);
  }

  function update() {
    const cW = canvas.width, cH = canvas.height;

    // Player paddle
    const pSpeed = playerPad.speed;
    if ((keys['ArrowUp'] || keys['w']) && playerPad.y > 0) playerPad.y -= pSpeed;
    if ((keys['ArrowDown'] || keys['s']) && playerPad.y + playerPad.h < cH) playerPad.y += pSpeed;

    // AI paddle (simple tracking with speed limit)
    const aiCenter = aiPad.y + aiPad.h / 2;
    const ballCenter = ball.y;
    if (aiCenter < ballCenter - 5) aiPad.y = Math.min(aiPad.y + aiPad.speed, cH - aiPad.h);
    else if (aiCenter > ballCenter + 5) aiPad.y = Math.max(aiPad.y - aiPad.speed, 0);

    // Ball movement
    ball.trail.push({ x: ball.x, y: ball.y });
    if (ball.trail.length > 8) ball.trail.shift();
    ball.x += ball.vx;
    ball.y += ball.vy;

    // Top/bottom bounce
    if (ball.y - ball.r < 0) { ball.vy = Math.abs(ball.vy); ball.y = ball.r; }
    if (ball.y + ball.r > cH) { ball.vy = -Math.abs(ball.vy); ball.y = cH - ball.r; }

    // Paddle collision
    [playerPad, aiPad].forEach((pad, isAI) => {
      if (ball.x - ball.r < pad.x + pad.w &&
          ball.x + ball.r > pad.x &&
          ball.y > pad.y && ball.y < pad.y + pad.h) {
        const dir = isAI ? -1 : 1;
        ball.vx = dir * Math.abs(ball.vx) * 1.04; // speed up slightly
        const hit = (ball.y - (pad.y + pad.h / 2)) / (pad.h / 2);
        ball.vy = hit * 5;
      }
    });

    // Score
    if (ball.x - ball.r < 0) { aScore++; aiScoreEl.textContent = aScore; if (aScore >= WIN_SCORE) { endGame(false); return; } resetBall(1); }
    if (ball.x + ball.r > cW) { pScore++; playerScoreEl.textContent = pScore; if (pScore >= WIN_SCORE) { endGame(true); return; } resetBall(-1); }
  }

  function draw() {
    const cW = canvas.width, cH = canvas.height;
    ctx.fillStyle = '#06060f';
    ctx.fillRect(0, 0, cW, cH);

    // Center line
    ctx.setLineDash([8, 10]);
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cW / 2, 0); ctx.lineTo(cW / 2, cH); ctx.stroke();
    ctx.setLineDash([]);

    // Center circle
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.beginPath(); ctx.arc(cW / 2, cH / 2, 50, 0, Math.PI * 2); ctx.stroke();

    // Ball trail
    ball.trail.forEach((t, i) => {
      const a = (i / ball.trail.length) * 0.4;
      ctx.fillStyle = `rgba(0,245,255,${a})`;
      ctx.beginPath(); ctx.arc(t.x, t.y, ball.r * (i / ball.trail.length), 0, Math.PI * 2); ctx.fill();
    });

    // Ball
    const bg = ctx.createRadialGradient(ball.x - 2, ball.y - 2, 1, ball.x, ball.y, ball.r);
    bg.addColorStop(0, '#fff');
    bg.addColorStop(0.5, '#00f5ff');
    bg.addColorStop(1, '#0088aa');
    ctx.fillStyle = bg;
    ctx.shadowBlur = 15; ctx.shadowColor = '#00f5ff';
    ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;

    // Paddles
    function drawPad(pad, color) {
      const g = ctx.createLinearGradient(pad.x, pad.y, pad.x + pad.w, pad.y + pad.h);
      g.addColorStop(0, color);
      g.addColorStop(1, color + '88');
      ctx.fillStyle = g;
      ctx.shadowBlur = 10; ctx.shadowColor = color;
      ctx.beginPath(); ctx.roundRect(pad.x, pad.y, pad.w, pad.h, 4); ctx.fill();
      ctx.shadowBlur = 0;
    }
    drawPad(playerPad, '#00f5ff');
    drawPad(aiPad, '#ff2d78');

    // Score on canvas
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.font = `bold ${Math.floor(cH * 0.25)}px "Segoe UI",sans-serif`;
    ctx.textAlign = 'right'; ctx.textBaseline = 'top';
    ctx.fillText(pScore, cW / 2 - 20, 10);
    ctx.textAlign = 'left';
    ctx.fillText(aScore, cW / 2 + 20, 10);
  }

  function endGame(playerWon) {
    running = false;
    overlayMsg.textContent = playerWon ? '🎉 You Win!' : '🤖 AI Wins!';
    startBtn.textContent = 'Play Again';
    overlay.style.display = 'flex';
  }

  // Keyboard
  document.addEventListener('keydown', e => { keys[e.key] = true; if (['ArrowUp','ArrowDown',' '].includes(e.key)) e.preventDefault(); });
  document.addEventListener('keyup', e => { keys[e.key] = false; });

  // Touch (drag on canvas for player paddle)
  canvas.addEventListener('touchstart', e => {
    const rect = canvas.getBoundingClientRect();
    touchY = (e.touches[0].clientY - rect.top) * (canvas.height / rect.height);
    prevTouchY = touchY;
  }, { passive: true });

  canvas.addEventListener('touchmove', e => {
    if (!running) return;
    const rect = canvas.getBoundingClientRect();
    const ty = (e.touches[0].clientY - rect.top) * (canvas.height / rect.height);
    const delta = ty - (prevTouchY || ty);
    prevTouchY = ty;
    playerPad.y = Math.max(0, Math.min(canvas.height - playerPad.h, playerPad.y + delta));
    e.preventDefault();
  }, { passive: false });

  startBtn.addEventListener('click', startGame);
  window.addEventListener('resize', () => { if (!running) resize(); });
})();
