// Whack-a-Mole
(function () {
  const grid = document.getElementById('moleGrid');
  const scoreEl = document.getElementById('score');
  const timerEl = document.getElementById('timer');
  const timerFill = document.getElementById('timerFill');
  const startBtn = document.getElementById('startBtn');
  const gameOverMsg = document.getElementById('gameOverMsg');

  const HOLES = 9;
  const GAME_TIME = 30;
  const MOLES = ['🐭','🐹','🐻','🦫','🐾'];

  let holes, score, timeLeft, moleTimer, countdownTimer, running;

  function init() {
    grid.innerHTML = '';
    holes = [];
    for (let i = 0; i < HOLES; i++) {
      const hole = document.createElement('div');
      hole.className = 'hole';
      const mole = document.createElement('div');
      mole.className = 'mole';
      mole.textContent = MOLES[i % MOLES.length];
      hole.appendChild(mole);
      hole.addEventListener('click', () => whack(i));
      hole.addEventListener('touchstart', e => { e.preventDefault(); whack(i); }, { passive: false });
      grid.appendChild(hole);
      holes.push({ el: hole, moleEl: mole, active: false, timer: null });
    }
  }

  function startGame() {
    if (running) return;
    init();
    score = 0; timeLeft = GAME_TIME; running = true;
    scoreEl.textContent = 0;
    timerEl.textContent = GAME_TIME;
    timerFill.style.width = '100%';
    timerFill.classList.remove('low');
    gameOverMsg.style.display = 'none';
    startBtn.textContent = 'Restart';

    // Countdown
    countdownTimer = setInterval(() => {
      timeLeft--;
      timerEl.textContent = timeLeft;
      timerFill.style.width = (timeLeft / GAME_TIME * 100) + '%';
      if (timeLeft <= 8) timerFill.classList.add('low');
      if (timeLeft <= 0) endGame();
    }, 1000);

    // Mole spawning
    scheduleMole();
  }

  function scheduleMole() {
    if (!running) return;
    const idx = Math.floor(Math.random() * HOLES);
    const h = holes[idx];
    if (!h.active) {
      h.active = true;
      h.el.classList.add('active');
      h.timer = setTimeout(() => hideMole(idx), 900 + Math.random() * 700);
    }
    const delay = Math.max(300, 700 - (GAME_TIME - timeLeft) * 10);
    moleTimer = setTimeout(scheduleMole, delay);
  }

  function hideMole(idx) {
    const h = holes[idx];
    h.active = false;
    h.el.classList.remove('active', 'whacked');
    clearTimeout(h.timer);
  }

  function whack(idx) {
    if (!running) return;
    const h = holes[idx];
    if (!h.active || h.el.classList.contains('whacked')) return;
    h.el.classList.add('whacked');
    score++;
    scoreEl.textContent = score;
    clearTimeout(h.timer);
    setTimeout(() => hideMole(idx), 300);
  }

  function endGame() {
    running = false;
    clearInterval(countdownTimer);
    clearTimeout(moleTimer);
    holes.forEach((h, i) => { clearTimeout(h.timer); hideMole(i); });

    const best = parseInt(localStorage.getItem('wam_best') || '0');
    let msg = `⏰ Time's up! Score: ${score}`;
    if (score > best) { localStorage.setItem('wam_best', score); msg += ' 🏆 New Best!'; }
    else if (best) { msg += ` (Best: ${best})`; }
    gameOverMsg.textContent = msg;
    gameOverMsg.style.display = 'block';
    startBtn.textContent = 'Play Again';
  }

  startBtn.addEventListener('click', () => {
    if (running) {
      clearInterval(countdownTimer);
      clearTimeout(moleTimer);
      running = false;
    }
    startGame();
  });

  init();
})();
