// Minesweeper
(function () {
  const gridEl = document.getElementById('mineGrid');
  const mineCountEl = document.getElementById('mineCount');
  const timerEl = document.getElementById('timer');
  const newGameBtn = document.getElementById('newGameBtn');
  const statusBanner = document.getElementById('statusBanner');

  const DIFFS = {
    easy:   { rows: 9,  cols: 9,  mines: 10 },
    medium: { rows: 12, cols: 12, mines: 25 },
    hard:   { rows: 16, cols: 16, mines: 40 },
  };

  let cfg, board, revealed, flagged, gameState, timerInt, seconds, firstClick;

  document.querySelectorAll('.diff-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      cfg = DIFFS[btn.dataset.diff];
      newGame();
    });
  });

  function newGame() {
    clearInterval(timerInt);
    if (!cfg) cfg = DIFFS.easy;
    const { rows, cols, mines } = cfg;
    board = Array.from({ length: rows }, () => Array(cols).fill(0));
    revealed = Array.from({ length: rows }, () => Array(cols).fill(false));
    flagged = Array.from({ length: rows }, () => Array(cols).fill(false));
    gameState = 'idle'; // idle | playing | won | lost
    firstClick = true;
    seconds = 0;
    timerEl.textContent = '0';
    mineCountEl.textContent = mines;
    statusBanner.textContent = '';
    statusBanner.style.color = '';
    renderGrid();
  }

  function placeMines(safeR, safeC) {
    const { rows, cols, mines } = cfg;
    let placed = 0;
    while (placed < mines) {
      const r = Math.floor(Math.random() * rows);
      const c = Math.floor(Math.random() * cols);
      if (board[r][c] === 'M') continue;
      if (Math.abs(r - safeR) <= 1 && Math.abs(c - safeC) <= 1) continue;
      board[r][c] = 'M';
      placed++;
    }
    // Numbers
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (board[r][c] === 'M') continue;
        board[r][c] = countAdj(r, c, 'M');
      }
    }
  }

  function countAdj(r, c, val) {
    let count = 0;
    for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < cfg.rows && nc >= 0 && nc < cfg.cols && board[nr][nc] === val) count++;
    }
    return count;
  }

  function renderGrid() {
    const { rows, cols } = cfg;
    const cellSize = Math.min(36, Math.floor((Math.min(window.innerWidth - 32, 540)) / cols));
    gridEl.style.gridTemplateColumns = `repeat(${cols}, ${cellSize}px)`;
    gridEl.innerHTML = '';

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = document.createElement('div');
        cell.className = 'mine-cell';
        cell.style.width = cell.style.height = cellSize + 'px';
        cell.style.fontSize = Math.floor(cellSize * 0.55) + 'px';
        cell.dataset.r = r; cell.dataset.c = c;

        if (revealed[r][c]) {
          cell.classList.add('revealed');
          if (board[r][c] === 'M') {
            cell.classList.add('mine-shown');
            cell.textContent = '💣';
          } else if (board[r][c] > 0) {
            cell.textContent = board[r][c];
            cell.classList.add('n' + board[r][c]);
          }
        } else if (flagged[r][c]) {
          cell.classList.add('flagged');
          cell.textContent = '🚩';
        }

        cell.addEventListener('click', () => handleClick(r, c));
        cell.addEventListener('contextmenu', e => { e.preventDefault(); handleFlag(r, c); });

        // Long press for mobile flag
        let pressTimer;
        cell.addEventListener('touchstart', () => {
          pressTimer = setTimeout(() => handleFlag(r, c), 500);
        }, { passive: true });
        cell.addEventListener('touchend', () => clearTimeout(pressTimer), { passive: true });
        cell.addEventListener('touchmove', () => clearTimeout(pressTimer), { passive: true });

        gridEl.appendChild(cell);
      }
    }
  }

  function handleClick(r, c) {
    if (gameState === 'won' || gameState === 'lost') return;
    if (flagged[r][c] || revealed[r][c]) return;

    if (firstClick) {
      firstClick = false;
      gameState = 'playing';
      placeMines(r, c);
      timerInt = setInterval(() => { seconds++; timerEl.textContent = seconds; }, 1000);
    }

    if (board[r][c] === 'M') {
      revealed[r][c] = true;
      gameState = 'lost';
      clearInterval(timerInt);
      revealAllMines(r, c);
      renderGrid();
      // Highlight the hit cell
      const cellEl = gridEl.querySelector(`[data-r="${r}"][data-c="${c}"]`);
      if (cellEl) cellEl.classList.add('mine-hit');
      statusBanner.textContent = '💥 Boom! Game Over!';
      statusBanner.style.color = 'var(--neon-pink)';
      return;
    }

    floodReveal(r, c);
    renderGrid();
    checkWin();
  }

  function handleFlag(r, c) {
    if (gameState === 'won' || gameState === 'lost') return;
    if (revealed[r][c]) return;
    flagged[r][c] = !flagged[r][c];
    const remaining = cfg.mines - flagged.flat().filter(Boolean).length;
    mineCountEl.textContent = remaining;
    renderGrid();
  }

  function floodReveal(r, c) {
    if (r < 0 || r >= cfg.rows || c < 0 || c >= cfg.cols) return;
    if (revealed[r][c] || flagged[r][c]) return;
    revealed[r][c] = true;
    if (board[r][c] === 0) {
      for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) floodReveal(r + dr, c + dc);
    }
  }

  function revealAllMines(hitR, hitC) {
    for (let r = 0; r < cfg.rows; r++) {
      for (let c = 0; c < cfg.cols; c++) {
        if (board[r][c] === 'M' && !(r === hitR && c === hitC)) revealed[r][c] = true;
      }
    }
  }

  function checkWin() {
    const { rows, cols, mines } = cfg;
    let safe = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (revealed[r][c] && board[r][c] !== 'M') safe++;
      }
    }
    if (safe === rows * cols - mines) {
      gameState = 'won';
      clearInterval(timerInt);
      const best = parseInt(localStorage.getItem(`ms_best_${cfg.rows}`) || '9999');
      let txt = `🎉 You Win! Time: ${seconds}s`;
      if (seconds < best) { localStorage.setItem(`ms_best_${cfg.rows}`, seconds); txt += ' 🏆 Best!'; }
      statusBanner.textContent = txt;
      statusBanner.style.color = 'var(--neon-green)';
    }
  }

  newGameBtn.addEventListener('click', newGame);
  window.addEventListener('resize', renderGrid);

  cfg = DIFFS.easy;
  newGame();
})();
