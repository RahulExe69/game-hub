// Game Hub – app.js
// Handles any hub-level interactivity (card hover effects, etc.)

document.addEventListener('DOMContentLoaded', () => {
  // Add ripple effect to play buttons
  document.querySelectorAll('.btn-play').forEach(btn => {
    btn.addEventListener('click', function (e) {
      const ripple = document.createElement('span');
      ripple.style.cssText = `
        position:absolute; border-radius:50%; background:rgba(255,255,255,0.3);
        width:10px; height:10px; top:50%; left:50%; transform:translate(-50%,-50%) scale(0);
        animation: rippleAnim 0.4s ease-out forwards; pointer-events:none;
      `;
      this.style.position = 'relative';
      this.style.overflow = 'hidden';
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 400);
    });
  });

  // Inject ripple keyframes
  const style = document.createElement('style');
  style.textContent = '@keyframes rippleAnim { to { transform: translate(-50%,-50%) scale(20); opacity:0; } }';
  document.head.appendChild(style);
});
