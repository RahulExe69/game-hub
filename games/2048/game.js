// 2048 Game
(function () {
  const boardEl = document.getElementById('board');
  const scoreEl = document.getElementById('score');
  const bestEl = document.getElementById('best');
  const newGameBtn = document.getElementById('newGameBtn');

  let grid, score, best, moved;
  let touchStartX, touchStartY;

  function init() {
    grid = Array.from({ length: 4 }, () => Array(4).fill(0));
    score = 0;
    best = parseInt(localStorage.getItem('2048_best') || '0');
    bestEl.textContent = best;
    scoreEl.textContent = 0;
    addTile(); addTile();
    render();
  }

  function addTile() {
    const empty = [];
    grid.forEach((row, r) => row.forEach((v, c) => { if (!v) empty.push([r, c]); }));
    if (!empty.length) return;
    const [r, c] = empty[Math.floor(Math.random() * empty.length)];
    grid[r][c] = Math.random() < 0.9 ? 2 : 4;
  }

  function render() {
    boardEl.innerHTML = '';
    grid.forEach(row => {
      row.forEach(val => {
        const tile = document.createElement('div');
        tile.className = 'tile' + (val ? ` t-${val} new` : '');
        tile.textContent = val || '';
        boardEl.appendChild(tile);
      });
    });
    scoreEl.textContent = score;
    if (score > best) { best = score; bestEl.textContent = best; localStorage.setItem('2048_best', best); }
  }

  function slide(row) {
    let arr = row.filter(v => v);
    for (let i = 0; i < arr.length - 1; i++) {
      if (arr[i] === arr[i + 1]) {
        arr[i] *= 2;
        score += arr[i];
        arr.splice(i + 1, 1);
        moved = true;
      }
    }
    while (arr.length < 4) arr.push(0);
    return arr;
  }

  function move(dir) {
    moved = false;
    const G = JSON.parse(JSON.stringify(grid));

    if (dir === 'left') {
      for (let r = 0; r < 4; r++) {
        const n = slide(grid[r]);
        if (n.join() !== grid[r].join()) moved = true;
        grid[r] = n;
      }
    } else if (dir === 'right') {
      for (let r = 0; r < 4; r++) {
        const n = slide([...grid[r]].reverse()).reverse();
        if (n.join() !== grid[r].join()) moved = true;
        grid[r] = n;
      }
    } else if (dir === 'up') {
      for (let c = 0; c < 4; c++) {
        const col = grid.map(row => row[c]);
        const n = slide(col);
        n.forEach((v, r) => { if (v !== grid[r][c]) moved = true; grid[r][c] = v; });
      }
    } else if (dir === 'down') {
      for (let c = 0; c < 4; c++) {
        const col = grid.map(row => row[c]).reverse();
        const n = slide(col).reverse();
        n.forEach((v, r) => { if (v !== grid[r][c]) moved = true; grid[r][c] = v; });
      }
    }

    if (moved) {
      addTile();
      render();
      if (grid.flat().includes(2048)) {
        setTimeout(() => alert('🎉 You reached 2048! Keep going!'), 100);
      }
      if (isGameOver()) {
        setTimeout(() => alert(`💀 Game Over!\nScore: ${score}`), 100);
      }
    }
  }

  function isGameOver() {
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (!grid[r][c]) return false;
        if (c < 3 && grid[r][c] === grid[r][c + 1]) return false;
        if (r < 3 && grid[r][c] === grid[r + 1][c]) return false;
      }
    }
    return true;
  }

  // Keyboard
  document.addEventListener('keydown', e => {
    const map = { ArrowLeft:'left', ArrowRight:'right', ArrowUp:'up', ArrowDown:'down' };
    if (map[e.key]) { e.preventDefault(); move(map[e.key]); }
  });

  // Touch / swipe
  boardEl.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  boardEl.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    if (Math.abs(dx) > Math.abs(dy)) {
      move(dx > 20 ? 'right' : 'left');
    } else {
      if (Math.abs(dy) > 20) move(dy > 0 ? 'down' : 'up');
    }
  }, { passive: true });

  newGameBtn.addEventListener('click', init);
  init();
})();
