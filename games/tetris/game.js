// Tetris
(function () {
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const nextCanvas = document.getElementById('nextCanvas');
  const nCtx = nextCanvas.getContext('2d');
  const overlay = document.getElementById('overlay');
  const overlayMsg = document.getElementById('overlayMsg');
  const startBtn = document.getElementById('startBtn');
  const scoreEl = document.getElementById('score');
  const linesEl = document.getElementById('lines');
  const levelEl = document.getElementById('level');

  const COLS = 10, ROWS = 20;
  let CELL = 20;

  const SHAPES = [
    [[1,1,1,1]],                          // I
    [[1,1],[1,1]],                         // O
    [[0,1,0],[1,1,1]],                     // T
    [[1,0,0],[1,1,1]],                     // J
    [[0,0,1],[1,1,1]],                     // L
    [[0,1,1],[1,1,0]],                     // S
    [[1,1,0],[0,1,1]],                     // Z
  ];
  const COLORS = ['#00f5ff','#ffd60a','#9d4edd','#00aaff','#ff8c00','#39ff14','#ff2d78'];

  let board, cur, curX, curY, next, score, lines, level, dropInterval, raf, running, lastTime;

  function resize() {
    CELL = Math.floor(Math.min(window.innerWidth - 200, 360) / COLS);
    CELL = Math.max(18, Math.min(CELL, 32));
    canvas.width = COLS * CELL;
    canvas.height = ROWS * CELL;
  }

  function newBoard() { return Array.from({ length: ROWS }, () => Array(COLS).fill(0)); }

  function randPiece() {
    const i = Math.floor(Math.random() * SHAPES.length);
    return { shape: SHAPES[i], color: COLORS[i] };
  }

  function startGame() {
    overlay.style.display = 'none';
    resize();
    board = newBoard();
    score = 0; lines = 0; level = 1;
    scoreEl.textContent = 0; linesEl.textContent = 0; levelEl.textContent = 1;
    next = randPiece();
    spawnPiece();
    running = true;
    lastTime = 0;
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(gameLoop);
  }

  function spawnPiece() {
    cur = next;
    next = randPiece();
    curX = Math.floor((COLS - cur.shape[0].length) / 2);
    curY = 0;
    drawNext();
    if (!isValid(cur.shape, curX, curY)) { gameOver(); }
  }

  function drawNext() {
    nCtx.fillStyle = '#06060f';
    nCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);
    const cs = 16;
    const ox = (nextCanvas.width - next.shape[0].length * cs) / 2;
    const oy = (nextCanvas.height - next.shape.length * cs) / 2;
    next.shape.forEach((row, r) => {
      row.forEach((v, c) => {
        if (!v) return;
        nCtx.fillStyle = next.color;
        nCtx.fillRect(ox + c * cs, oy + r * cs, cs - 1, cs - 1);
        nCtx.fillStyle = 'rgba(255,255,255,0.2)';
        nCtx.fillRect(ox + c * cs, oy + r * cs, cs - 1, cs / 3);
      });
    });
  }

  function isValid(shape, ox, oy) {
    return shape.every((row, r) =>
      row.every((v, c) => {
        if (!v) return true;
        const nx = ox + c, ny = oy + r;
        return nx >= 0 && nx < COLS && ny < ROWS && (ny < 0 || !board[ny][nx]);
      })
    );
  }

  function lock() {
    cur.shape.forEach((row, r) => {
      row.forEach((v, c) => {
        if (v) board[curY + r][curX + c] = cur.color;
      });
    });
    clearLines();
    spawnPiece();
  }

  function clearLines() {
    let cleared = 0;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (board[r].every(v => v)) {
        board.splice(r, 1);
        board.unshift(Array(COLS).fill(0));
        cleared++;
        r++;
      }
    }
    if (cleared) {
      const pts = [0, 100, 300, 500, 800][cleared] * level;
      score += pts;
      lines += cleared;
      level = Math.floor(lines / 10) + 1;
      scoreEl.textContent = score;
      linesEl.textContent = lines;
      levelEl.textContent = level;
    }
  }

  function getDropInterval() { return Math.max(80, 1000 - (level - 1) * 90); }

  function gameLoop(ts) {
    if (!running) return;
    if (ts - lastTime > getDropInterval()) {
      drop();
      lastTime = ts;
    }
    draw();
    raf = requestAnimationFrame(gameLoop);
  }

  function drop() {
    if (isValid(cur.shape, curX, curY + 1)) curY++;
    else lock();
  }

  function hardDrop() {
    while (isValid(cur.shape, curX, curY + 1)) curY++;
    lock();
  }

  function ghostY() {
    let gy = curY;
    while (isValid(cur.shape, curX, gy + 1)) gy++;
    return gy;
  }

  function rotate(shape) {
    return shape[0].map((_, c) => shape.map(row => row[c]).reverse());
  }

  function draw() {
    ctx.fillStyle = '#06060f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 0.5;
    for (let r = 0; r < ROWS; r++) {
      ctx.beginPath(); ctx.moveTo(0, r * CELL); ctx.lineTo(canvas.width, r * CELL); ctx.stroke();
    }
    for (let c = 0; c < COLS; c++) {
      ctx.beginPath(); ctx.moveTo(c * CELL, 0); ctx.lineTo(c * CELL, canvas.height); ctx.stroke();
    }

    // Board
    board.forEach((row, r) => {
      row.forEach((v, c) => {
        if (!v) return;
        drawCell(ctx, c * CELL, r * CELL, v);
      });
    });

    // Ghost piece
    const gy = ghostY();
    cur.shape.forEach((row, r) => {
      row.forEach((v, c) => {
        if (!v) return;
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.fillRect((curX + c) * CELL, (gy + r) * CELL, CELL - 1, CELL - 1);
      });
    });

    // Current piece
    cur.shape.forEach((row, r) => {
      row.forEach((v, c) => {
        if (!v) return;
        drawCell(ctx, (curX + c) * CELL, (curY + r) * CELL, cur.color);
      });
    });
  }

  function drawCell(c, x, y, color) {
    c.fillStyle = color;
    c.fillRect(x, y, CELL - 1, CELL - 1);
    c.fillStyle = 'rgba(255,255,255,0.25)';
    c.fillRect(x, y, CELL - 1, CELL / 3);
    c.fillStyle = 'rgba(0,0,0,0.2)';
    c.fillRect(x, y + CELL - CELL / 3, CELL - 1, CELL / 3 - 1);
  }

  function gameOver() {
    running = false;
    cancelAnimationFrame(raf);
    const best = parseInt(localStorage.getItem('tetris_best') || '0');
    if (score > best) localStorage.setItem('tetris_best', score);
    overlayMsg.textContent = `Score: ${score} | Lines: ${lines}`;
    startBtn.textContent = 'Play Again';
    overlay.style.display = 'flex';
  }

  // Keyboard
  document.addEventListener('keydown', e => {
    if (!running) return;
    switch (e.key) {
      case 'ArrowLeft':  e.preventDefault(); if (isValid(cur.shape, curX-1, curY)) curX--; draw(); break;
      case 'ArrowRight': e.preventDefault(); if (isValid(cur.shape, curX+1, curY)) curX++; draw(); break;
      case 'ArrowDown':  e.preventDefault(); drop(); draw(); break;
      case 'ArrowUp':    e.preventDefault(); { const r = rotate(cur.shape); if (isValid(r, curX, curY)) cur.shape = r; draw(); } break;
      case ' ':          e.preventDefault(); hardDrop(); draw(); break;
    }
  });

  // Mobile controls
  document.getElementById('cLeft').addEventListener('click', () => { if (running && isValid(cur.shape, curX-1, curY)) { curX--; draw(); } });
  document.getElementById('cRight').addEventListener('click', () => { if (running && isValid(cur.shape, curX+1, curY)) { curX++; draw(); } });
  document.getElementById('cDown').addEventListener('click', () => { if (running) { drop(); draw(); } });
  document.getElementById('cRotate').addEventListener('click', () => {
    if (!running) return;
    const r = rotate(cur.shape);
    if (isValid(r, curX, curY)) { cur.shape = r; draw(); }
  });

  startBtn.addEventListener('click', startGame);
})();
