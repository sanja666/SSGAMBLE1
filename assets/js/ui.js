const UI = (() => {
  let toastContainer;
  let modalBackdrop;
  let confettiCanvas;
  let confettiCtx;
  let confettiPieces = [];
  let confettiActive = false;

  function init() {
    toastContainer = document.querySelector('.toast-container');
    confettiCanvas = document.querySelector('.confetti-canvas');
    if (confettiCanvas) {
      confettiCtx = confettiCanvas.getContext('2d');
      resizeCanvas();
      window.addEventListener('resize', debounce(resizeCanvas, 200));
    }
  }

  function debounce(fn, wait) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn.apply(null, args), wait);
    };
  }

  function showToast(message, variant = 'info', timeout = 4000) {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${variant}`;
    toast.setAttribute('role', 'status');
    toast.textContent = message;
    toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 280);
    }, timeout);
  }

  function openModal(content) {
    closeModal();
    modalBackdrop = document.createElement('div');
    modalBackdrop.className = 'modal-backdrop';
    modalBackdrop.innerHTML = `<div class="modal">${content}</div>`;
    document.body.appendChild(modalBackdrop);
    modalBackdrop.addEventListener('click', (event) => {
      if (event.target === modalBackdrop) closeModal();
    });
  }

  function closeModal() {
    if (modalBackdrop) {
      modalBackdrop.remove();
      modalBackdrop = null;
    }
  }

  function resizeCanvas() {
    if (!confettiCanvas) return;
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
  }

  function spawnConfetti(colorA = '#4de2ff', colorB = '#a66bff') {
    if (!confettiCtx || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    confettiPieces = Array.from({ length: 160 }, () => ({
      x: Math.random() * confettiCanvas.width,
      y: Math.random() * confettiCanvas.height - confettiCanvas.height,
      size: Math.random() * 8 + 4,
      speed: Math.random() * 4 + 2,
      color: Math.random() > 0.5 ? colorA : colorB,
      rotation: Math.random() * Math.PI
    }));
    if (!confettiActive) {
      confettiActive = true;
      requestAnimationFrame(stepConfetti);
      setTimeout(() => { confettiActive = false; }, 2200);
    }
  }

  function stepConfetti() {
    if (!confettiActive) {
      confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      return;
    }
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    confettiPieces.forEach((piece) => {
      confettiCtx.fillStyle = piece.color;
      confettiCtx.save();
      confettiCtx.translate(piece.x, piece.y);
      confettiCtx.rotate(piece.rotation);
      confettiCtx.fillRect(-piece.size / 2, -piece.size / 2, piece.size, piece.size / 2);
      confettiCtx.restore();
      piece.y += piece.speed;
      piece.rotation += 0.05;
      if (piece.y > confettiCanvas.height) {
        piece.y = -20;
        piece.x = Math.random() * confettiCanvas.width;
      }
    });
    requestAnimationFrame(stepConfetti);
  }

  document.addEventListener('DOMContentLoaded', init);

  return {
    showToast,
    openModal,
    closeModal,
    spawnConfetti
  };
})();
