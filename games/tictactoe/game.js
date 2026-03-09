// Tic-Tac-Toe with Minimax AI
(function () {
  const boardEl = document.getElementById('board');
  const statusMsg = document.getElementById('statusMsg');
  const restartBtn = document.getElementById('restartBtn');
  const playerScoreEl = document.getElementById('playerScore');
  const drawScoreEl = document.getElementById('drawScore');
  const aiScoreEl = document.getElementById('aiScore');

  let board, playerTurn, gameOver, scores;

  const WINS = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

  function init() {
    board = Array(9).fill('');
    playerTurn = true;
    gameOver = false;
    scores = scores || { player: 0, ai: 0, draw: 0 };
    statusMsg.textContent = 'Your turn (X)';
    renderBoard();
  }

  function renderBoard() {
    boardEl.innerHTML = '';
    board.forEach((val, i) => {
      const cell = document.createElement('div');
      cell.className = 'ttt-cell' + (val ? ' filled ' + val : '');
      cell.textContent = val;
      cell.addEventListener('click', () => playerMove(i));
      boardEl.appendChild(cell);
    });
  }

  function playerMove(idx) {
    if (!playerTurn || board[idx] || gameOver) return;
    board[idx] = 'X';
    renderBoard();
    const result = checkWinner(board);
    if (result) { endGame(result); return; }
    playerTurn = false;
    statusMsg.textContent = 'AI thinking…';
    setTimeout(aiMove, 400);
  }

  function aiMove() {
    const best = minimax(board, false);
    board[best.index] = 'O';
    renderBoard();
    const result = checkWinner(board);
    if (result) { endGame(result); return; }
    playerTurn = true;
    statusMsg.textContent = 'Your turn (X)';
  }

  function minimax(b, isMax, depth = 0) {
    const result = checkWinner(b);
    if (result === 'O') return { score: 10 - depth };
    if (result === 'X') return { score: depth - 10 };
    if (result === 'draw') return { score: 0 };

    const moves = [];
    b.forEach((v, i) => {
      if (!v) {
        const nb = [...b];
        nb[i] = isMax ? 'O' : 'X';
        const res = minimax(nb, !isMax, depth + 1);
        moves.push({ index: i, score: res.score });
      }
    });

    moves.sort((a, b) => isMax ? b.score - a.score : a.score - b.score);
    return moves[0];
  }

  function checkWinner(b) {
    for (const [a, c, d] of WINS) {
      if (b[a] && b[a] === b[c] && b[a] === b[d]) return b[a];
    }
    if (b.every(v => v)) return 'draw';
    return null;
  }

  function endGame(result) {
    gameOver = true;
    highlightWin(result);
    if (result === 'X') {
      statusMsg.textContent = '🎉 You win!';
      statusMsg.style.color = 'var(--neon-green)';
      scores.player++;
      playerScoreEl.textContent = scores.player;
    } else if (result === 'O') {
      statusMsg.textContent = '🤖 AI wins!';
      statusMsg.style.color = 'var(--neon-pink)';
      scores.ai++;
      aiScoreEl.textContent = scores.ai;
    } else {
      statusMsg.textContent = "🤝 It's a draw!";
      statusMsg.style.color = 'var(--neon-yellow)';
      scores.draw++;
      drawScoreEl.textContent = scores.draw;
    }
  }

  function highlightWin(result) {
    if (result === 'draw') return;
    for (const [a, c, d] of WINS) {
      if (board[a] && board[a] === board[c] && board[a] === board[d]) {
        const cells = boardEl.children;
        [a, c, d].forEach(i => cells[i].classList.add('win'));
      }
    }
  }

  restartBtn.addEventListener('click', () => {
    statusMsg.style.color = '';
    init();
  });

  init();
})();
