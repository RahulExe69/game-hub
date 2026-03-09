// Snake Game
(function () {
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const overlay = document.getElementById('overlay');
  const overlayTitle = document.getElementById('overlayTitle');
  const overlayScore = document.getElementById('overlayScore');
  const startBtn = document.getElementById('startBtn');
  const scoreEl = document.getElementById('score');
  const bestEl = document.getElementById('best');
  const dots = document.querySelectorAll('.dot');

  const COLS = 18, ROWS = 18;
  let CELL;
  let snake, dir, nextDir, food, score, best, gameLoop, running, touchStartX, touchStartY;

  function resize() {
    const size = Math.min(360, window.innerWidth - 32);
    canvas.width = size;
    canvas.height = size;
    CELL = size / COLS;
  }

  function init() {
    resize();
    best = parseInt(localStorage.getItem('snake_best') || '0');
    bestEl.textContent = best;
  }

  function startGame() {
    overlay.style.display = 'none';
    snake = [{ x: 9, y: 9 }, { x: 8, y: 9 }, { x: 7, y: 9 }];
    dir = { x: 1, y: 0 };
    nextDir = { x: 1, y: 0 };
    score = 0;
    scoreEl.textContent = 0;
    running = true;
    placeFood();
    clearInterval(gameLoop);
    gameLoop = setInterval(tick, 160);
  }

  function placeFood() {
    let pos;
    do {
      pos = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
    } while (snake.some(s => s.x === pos.x && s.y === pos.y));
    food = pos;
  }

  function tick() {
    dir = nextDir;
    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

    // Wall collision
    if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) return gameOver();
    // Self collision
    if (snake.some(s => s.x === head.x && s.y === head.y)) return gameOver();

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
      score++;
      scoreEl.textContent = score;
      updateSpeed();
      placeFood();
      if (score > best) { best = score; bestEl.textContent = best; localStorage.setItem('snake_best', best); }
    } else {
      snake.pop();
    }

    draw();
  }

  function updateSpeed() {
    const level = Math.min(4, Math.floor(score / 5));
    const speeds = [160, 130, 100, 75, 55];
    clearInterval(gameLoop);
    gameLoop = setInterval(tick, speeds[level]);
    dots.forEach((d, i) => d.classList.toggle('active', i <= level));
  }

  function draw() {
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.03)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= COLS; i++) {
      ctx.beginPath(); ctx.moveTo(i * CELL, 0); ctx.lineTo(i * CELL, canvas.height); ctx.stroke();
    }
    for (let j = 0; j <= ROWS; j++) {
      ctx.beginPath(); ctx.moveTo(0, j * CELL); ctx.lineTo(canvas.width, j * CELL); ctx.stroke();
    }

    if (!food || !snake) return; // not started yet

    // Food
    ctx.font = `${CELL * 0.8}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🍎', food.x * CELL + CELL / 2, food.y * CELL + CELL / 2);

    // Snake
    snake.forEach((seg, i) => {
      const t = i / snake.length;
      const g = ctx.createLinearGradient(seg.x * CELL, seg.y * CELL, (seg.x + 1) * CELL, (seg.y + 1) * CELL);
      if (i === 0) {
        g.addColorStop(0, '#39ff14');
        g.addColorStop(1, '#00cc0a');
      } else {
        const alpha = 1 - t * 0.5;
        g.addColorStop(0, `rgba(57,255,20,${alpha})`);
        g.addColorStop(1, `rgba(0,180,10,${alpha})`);
      }
      ctx.fillStyle = g;
      const pad = i === 0 ? 1 : 2;
      ctx.beginPath();
      ctx.roundRect(seg.x * CELL + pad, seg.y * CELL + pad, CELL - pad * 2, CELL - pad * 2, 3);
      ctx.fill();

      // Eyes on head
      if (i === 0) {
        ctx.fillStyle = '#fff';
        const ex = seg.x * CELL + CELL * 0.7;
        const ey = seg.y * CELL + CELL * 0.3;
        ctx.beginPath(); ctx.arc(ex, ey, CELL * 0.12, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#000';
        ctx.beginPath(); ctx.arc(ex + dir.x * 2, ey + dir.y * 2, CELL * 0.06, 0, Math.PI * 2); ctx.fill();
      }
    });
  }

  function gameOver() {
    running = false;
    clearInterval(gameLoop);
    overlayTitle.textContent = '💀 Game Over!';
    overlayScore.textContent = `Score: ${score}  •  Best: ${best}`;
    startBtn.textContent = 'Play Again';
    overlay.style.display = 'flex';
  }

  // Controls
  document.addEventListener('keydown', e => {
    if (!running) return;
    const map = {
      ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 },
      ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 },
      w: { x: 0, y: -1 }, s: { x: 0, y: 1 }, a: { x: -1, y: 0 }, d: { x: 1, y: 0 }
    };
    const d = map[e.key];
    if (d && !(d.x === -dir.x && d.y === -dir.y)) { nextDir = d; e.preventDefault(); }
  });

  // Touch / swipe
  canvas.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  canvas.addEventListener('touchend', e => {
    if (!running) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > 20 && dir.x !== -1) nextDir = { x: 1, y: 0 };
      else if (dx < -20 && dir.x !== 1) nextDir = { x: -1, y: 0 };
    } else {
      if (dy > 20 && dir.y !== -1) nextDir = { x: 0, y: 1 };
      else if (dy < -20 && dir.y !== 1) nextDir = { x: 0, y: -1 };
    }
  }, { passive: true });

  // D-pad
  document.getElementById('dUp').addEventListener('click', () => { if (dir.y !== 1) nextDir = { x: 0, y: -1 }; });
  document.getElementById('dDown').addEventListener('click', () => { if (dir.y !== -1) nextDir = { x: 0, y: 1 }; });
  document.getElementById('dLeft').addEventListener('click', () => { if (dir.x !== 1) nextDir = { x: -1, y: 0 }; });
  document.getElementById('dRight').addEventListener('click', () => { if (dir.x !== -1) nextDir = { x: 1, y: 0 }; });

  startBtn.addEventListener('click', startGame);
  window.addEventListener('resize', () => { resize(); if (!running) draw(); });

  init();
  draw();
})();
