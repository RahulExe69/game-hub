# 🎮 Game Hub

A complete browser-based **Game Hub** featuring **10 fully playable classic games** built with pure HTML5, CSS3, and JavaScript — zero dependencies, zero frameworks.

## Screenshots

### Hub Launcher
![Game Hub - Launcher](https://github.com/user-attachments/assets/717915ed-f6e1-4459-bd58-5ca7554c4803)

### Snake Game
![Game Hub - Snake](https://github.com/user-attachments/assets/90094fa5-41e7-449b-8b4f-91c7ccd1588f)

## 🚀 Live Demo

Open `index.html` in any modern browser, or serve the folder with any static file server:

```bash
# Python
python3 -m http.server 8080

# Node.js (npx)
npx serve .
```

Then visit `http://localhost:8080`.

---

## 🕹️ Games

| # | Game | Controls | Description |
|---|------|----------|-------------|
| 🐍 | **Snake** | Arrow Keys / Swipe | Classic snake — eat food, grow, avoid walls and yourself |
| ❌ | **Tic-Tac-Toe** | Click / Tap | 3×3 battle against a Minimax AI |
| 🃏 | **Memory Match** | Click / Tap | Flip cards to find all 8 matching pairs |
| 🔢 | **2048** | Arrow Keys / Swipe | Slide and merge tiles to reach 2048 |
| 🐦 | **Flappy Bird** | Click / Tap / Space | Tap to flap through randomly generated pipes |
| 🧱 | **Brick Breaker** | Mouse / Touch | Bounce ball off paddle to break all bricks |
| 🔨 | **Whack-a-Mole** | Click / Tap | Hit moles as they pop up — 30 second timer |
| 🟦 | **Tetris** | Arrow Keys | Stack tetrominoes, clear lines, beat your score |
| 🏓 | **Pong** | W/S or Arrow Keys | Player vs AI — first to 7 points wins |
| 💣 | **Minesweeper** | Click / Right-click | Reveal safe cells, flag mines, 3 difficulty levels |

---

## 🎨 Features

- **Dark gaming UI** with neon accent colors (purple, cyan, pink, green)
- **Fully mobile responsive** — 1 column on phones, 2 on tablets, 4 on desktop
- **Touch controls** — swipe gestures, on-screen d-pads, tap targets ≥ 44px
- **Local storage high scores** — Snake, Flappy Bird, Tetris, Memory Match, Minesweeper
- **Smooth CSS animations** — card entry effects, hover glow, game transitions
- **"How to Play"** instructions built into every game page
- **Canvas API** games — Snake, Flappy Bird, Brick Breaker, Tetris, Pong

---

## 📁 Project Structure

```
index.html              ← Hub / launcher page
css/
  style.css             ← All styles (hub + shared game styles)
js/
  app.js                ← Hub launcher logic
games/
  snake/
    index.html
    game.js
  tictactoe/
    index.html
    game.js
  memory/
    index.html
    game.js
  2048/
    index.html
    game.js
  flappy/
    index.html
    game.js
  breakout/
    index.html
    game.js
  whackamole/
    index.html
    game.js
  tetris/
    index.html
    game.js
  pong/
    index.html
    game.js
  minesweeper/
    index.html
    game.js
```

---

## 🛠️ Tech Stack

- **HTML5** — semantic markup, Canvas API
- **CSS3** — Grid, Flexbox, custom properties (variables), keyframe animations
- **JavaScript ES6+** — modules, arrow functions, destructuring, `requestAnimationFrame`
- **No external dependencies** — no npm, no frameworks, no CDN links

---

## 📱 Mobile Support

All games are playable on mobile devices:

| Game | Mobile Control |
|------|---------------|
| Snake | Swipe in any direction |
| 2048 | Swipe to slide tiles |
| Flappy Bird | Tap anywhere to flap |
| Brick Breaker | Touch-drag to move paddle |
| Pong | Touch-drag to move paddle |
| Tetris | On-screen rotate / left / down / right buttons |
| Tic-Tac-Toe | Tap any cell |
| Memory Match | Tap cards to flip |
| Whack-a-Mole | Tap moles |
| Minesweeper | Tap to reveal · Long-press to flag |

---

## 🏆 High Scores

The following games save your best score to `localStorage`:

| Game | Key |
|------|-----|
| Snake | `snake_best` |
| Flappy Bird | `flappy_best` |
| Tetris | `tetris_best` |
| Memory Match | `memory_best` |
| Minesweeper | `ms_best_9` / `ms_best_12` / `ms_best_16` |

---

## License

MIT — free to use and modify.
