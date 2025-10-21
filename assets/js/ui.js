(function () {
  window.NS = window.NS || {};

  const toastHost = document.getElementById("toast-host");
  const modalHost = document.getElementById("modal-host");

  const currency = new Intl.NumberFormat("lv-LV", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2
  });

  function formatEUR(value) {
    return currency.format(value).replace("€", "€");
  }

  function createToast(message, opts = {}) {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.setAttribute("role", "status");
    toast.textContent = message;
    toastHost.appendChild(toast);
    const timeout = opts.timeout ?? 4000;
    setTimeout(() => {
      toast.classList.add("fade-out");
      setTimeout(() => toast.remove(), 280);
    }, timeout);
  }

  function openModal({ title, body, actions = [] }) {
    closeModal();
    const overlay = document.createElement("div");
    overlay.className = "modal";
    overlay.innerHTML = `
      <header>
        <h2>${title}</h2>
        <button class="modal-close" aria-label="Aizvērt">×</button>
      </header>
      <div class="modal-body"></div>
      <footer class="modal-footer"></footer>
    `;
    const bodyEl = overlay.querySelector(".modal-body");
    bodyEl.appendChild(body);
    const footer = overlay.querySelector(".modal-footer");
    actions.forEach((action) => footer.appendChild(action));
    overlay.querySelector(".modal-close").addEventListener("click", closeModal);
    modalHost.appendChild(overlay);
  }

  function closeModal() {
    while (modalHost.firstChild) modalHost.removeChild(modalHost.firstChild);
  }

  function particleBurst(element, color = "#64d9ff") {
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    const rect = element.getBoundingClientRect();
    const canvas = document.createElement("canvas");
    canvas.width = rect.width;
    canvas.height = rect.height;
    canvas.style.position = "absolute";
    canvas.style.left = `${rect.left + window.scrollX}px`;
    canvas.style.top = `${rect.top + window.scrollY}px`;
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = 50;
    document.body.appendChild(canvas);
    const ctx = canvas.getContext("2d");
    const particles = Array.from({ length: 50 }, () => ({
      x: canvas.width / 2,
      y: canvas.height / 2,
      vx: (Math.random() - 0.5) * 6,
      vy: (Math.random() - 0.5) * 6,
      life: Math.random() * 30 + 20,
      size: Math.random() * 3 + 2
    }));
    let frame = 0;
    function tick() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.08;
        p.life -= 1;
        ctx.fillStyle = color;
        ctx.globalAlpha = Math.max(p.life / 40, 0);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      frame += 1;
      if (frame < 50) {
        requestAnimationFrame(tick);
      } else {
        canvas.remove();
      }
    }
    tick();
  }

  NS.ui = {
    formatEUR,
    toast: createToast,
    openModal,
    closeModal,
    particleBurst
  };
})();
