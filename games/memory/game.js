// Memory Match Game
(function () {
  const EMOJIS = ['🎮','🕹️','🎯','🎲','🃏','🎰','🏆','🎪'];
  const grid = document.getElementById('memoryGrid');
  const movesEl = document.getElementById('moves');
  const pairsEl = document.getElementById('pairs');
  const timerEl = document.getElementById('timer');
  const newGameBtn = document.getElementById('newGameBtn');

  let cards, flipped, matched, moves, timerInt, seconds, locked;

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function startGame() {
    clearInterval(timerInt);
    cards = shuffle([...EMOJIS, ...EMOJIS]);
    flipped = [];
    matched = 0;
    moves = 0;
    seconds = 0;
    locked = false;
    movesEl.textContent = 0;
    pairsEl.textContent = '0/8';
    timerEl.textContent = '0s';
    renderGrid();
    timerInt = setInterval(() => {
      seconds++;
      timerEl.textContent = seconds + 's';
    }, 1000);
  }

  function renderGrid() {
    grid.innerHTML = '';
    cards.forEach((emoji, idx) => {
      const card = document.createElement('div');
      card.className = 'mem-card';
      card.innerHTML = `
        <div class="mem-card-inner">
          <div class="mem-card-front">❓</div>
          <div class="mem-card-back">${emoji}</div>
        </div>`;
      card.dataset.emoji = emoji;
      card.dataset.idx = idx;
      card.addEventListener('click', () => flipCard(card, idx));
      grid.appendChild(card);
    });
  }

  function flipCard(card, idx) {
    if (locked || card.classList.contains('flipped') || card.classList.contains('matched')) return;
    card.classList.add('flipped');
    flipped.push({ card, idx });

    if (flipped.length === 2) {
      moves++;
      movesEl.textContent = moves;
      locked = true;
      const [a, b] = flipped;
      if (cards[a.idx] === cards[b.idx]) {
        // Match!
        setTimeout(() => {
          a.card.classList.replace('flipped', 'matched');
          b.card.classList.replace('flipped', 'matched');
          matched++;
          pairsEl.textContent = `${matched}/8`;
          flipped = [];
          locked = false;
          if (matched === 8) endGame();
        }, 400);
      } else {
        setTimeout(() => {
          a.card.classList.remove('flipped');
          b.card.classList.remove('flipped');
          flipped = [];
          locked = false;
        }, 900);
      }
    }
  }

  function endGame() {
    clearInterval(timerInt);
    const best = localStorage.getItem('memory_best');
    const current = moves;
    let bestText = '';
    if (!best || current < parseInt(best)) {
      localStorage.setItem('memory_best', current);
      bestText = ' 🏆 New Best!';
    } else {
      bestText = ` (Best: ${best} moves)`;
    }
    setTimeout(() => {
      alert(`🎉 You won!\n\n⏱ Time: ${seconds}s\n🃏 Moves: ${moves}${bestText}`);
    }, 300);
  }

  newGameBtn.addEventListener('click', startGame);
  startGame();
})();
