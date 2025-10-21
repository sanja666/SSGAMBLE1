(function () {
  window.NS = window.NS || {};

  const gameContainer = document.getElementById("casino-game");
  const historyList = document.getElementById("game-history");
  const tabs = document.querySelectorAll(".casino-tab");

  const rouletteNumbers = Array.from({ length: 37 }, (_, i) => i);
  const rouletteColors = {
    0: "green",
    reds: [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]
  };

  const games = {
    roulette: createRoulette(),
    coinflip: createCoinflip(),
    dice: createDice(),
    crash: createCrash(),
    plinko: createPlinko()
  };

  function activateGame(name) {
    gameContainer.innerHTML = "";
    games[name].render(gameContainer);
    tabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.game === name));
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => activateGame(tab.dataset.game));
  });

  function renderHistory() {
    const items = NS.store.getGameHistory();
    historyList.innerHTML = "";
    items.slice(0, 20).forEach((entry) => {
      const li = document.createElement("li");
      li.innerHTML = `<strong>${entry.game}</strong> — likme ${NS.ui.formatEUR(entry.bet)} → rezultāts ${entry.result} (${NS.ui.formatEUR(entry.payout)})`;
      historyList.appendChild(li);
    });
  }

  NS.events.on("game:result", renderHistory);

  function createRoulette() {
    let canvas, ctx, spinning = false;
    let currentAngle = 0;

    function render(container) {
      container.innerHTML = "";
      const layout = document.createElement("div");
      layout.className = "roulette-layout";
      canvas = document.createElement("canvas");
      canvas.width = 360;
      canvas.height = 360;
      ctx = canvas.getContext("2d");
      const controls = document.createElement("form");
      controls.className = "stack";
      controls.innerHTML = `
        <label>Likmes summa
          <input type="number" name="bet" min="1" value="5" />
        </label>
        <label>Likmes veids
          <select name="type">
            <option value="red">Sarkans</option>
            <option value="black">Melns</option>
            <option value="even">Pāra</option>
            <option value="odd">Nepāra</option>
            <option value="dozen1">1-12</option>
            <option value="dozen2">13-24</option>
            <option value="dozen3">25-36</option>
            <option value="column1">Kolonna 1</option>
            <option value="column2">Kolonna 2</option>
            <option value="column3">Kolonna 3</option>
            <option value="straight">Precīzs skaitlis</option>
          </select>
        </label>
        <label>Skaitlis (ja nepieciešams)
          <input type="number" name="number" min="0" max="36" value="17" />
        </label>
        <button class="btn primary" type="submit">Griezt</button>
      `;
      controls.addEventListener("submit", (e) => {
        e.preventDefault();
        if (spinning) return;
        const data = new FormData(controls);
        const bet = Number(data.get("bet"));
        if (!bet || bet <= 0) return;
        if (!NS.wallet.spend(bet)) {
          NS.ui.toast(NS.i18n.t("insufficient"));
          return;
        }
        const type = data.get("type");
        const number = Number(data.get("number"));
        spin(type, bet, number);
      });
      layout.append(canvas, controls);
      container.appendChild(layout);
      drawWheel();
    }

    function drawWheel() {
      const radius = canvas.width / 2 - 20;
      const center = canvas.width / 2;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(currentAngle);
      const slice = (Math.PI * 2) / rouletteNumbers.length;
      rouletteNumbers.forEach((num, index) => {
        const start = index * slice;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, radius, start, start + slice);
        ctx.fillStyle = getColor(num);
        ctx.fill();
        ctx.save();
        ctx.rotate(start + slice / 2);
        ctx.fillStyle = "white";
        ctx.font = "16px system-ui";
        ctx.textAlign = "center";
        ctx.fillText(String(num), radius * 0.75, 6);
        ctx.restore();
      });
      ctx.restore();
      ctx.strokeStyle = "rgba(255,255,255,0.3)";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(center, center, radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.beginPath();
      ctx.moveTo(center, 10);
      ctx.lineTo(center - 12, 40);
      ctx.lineTo(center + 12, 40);
      ctx.closePath();
      ctx.fill();
    }

    function getColor(num) {
      if (num === 0) return "#0f7";
      return rouletteColors.reds.includes(num) ? "#f44336" : "#111";
    }

    function spin(type, bet, number) {
      const outcome = rouletteNumbers[Math.floor(Math.random() * rouletteNumbers.length)];
      const targetIndex = rouletteNumbers.indexOf(outcome);
      const slice = (Math.PI * 2) / rouletteNumbers.length;
      const targetAngle = -(targetIndex * slice + slice / 2);
      const startAngle = currentAngle;
      const tau = Math.PI * 2;
      const base = ((startAngle % tau) + tau) % tau;
      let delta = targetAngle - base;
      if (delta <= 0) delta += tau;
      const totalRotation = Math.PI * 6 + delta;
      const duration = 5200;
      const start = performance.now();
      spinning = true;

      function animate(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        currentAngle = startAngle + totalRotation * ease;
        drawWheel();
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          spinning = false;
          resolveBet(type, bet, number, outcome);
        }
      }
      requestAnimationFrame(animate);
    }

    function resolveBet(type, bet, number, outcome) {
      let win = false;
      let multiplier = 0;
      const color = getColor(outcome);
      const column = ((outcome - 1) % 3) + 1;
      if (type === "red" && color === "#f44336") {
        win = true;
        multiplier = 2;
      } else if (type === "black" && color === "#111") {
        win = true;
        multiplier = 2;
      } else if (type === "even" && outcome !== 0 && outcome % 2 === 0) {
        win = true;
        multiplier = 2;
      } else if (type === "odd" && outcome % 2 === 1) {
        win = true;
        multiplier = 2;
      } else if (type === "dozen1" && outcome >= 1 && outcome <= 12) {
        win = true;
        multiplier = 3;
      } else if (type === "dozen2" && outcome >= 13 && outcome <= 24) {
        win = true;
        multiplier = 3;
      } else if (type === "dozen3" && outcome >= 25 && outcome <= 36) {
        win = true;
        multiplier = 3;
      } else if (type === "column" + column) {
        win = true;
        multiplier = 3;
      } else if (type === "straight" && number === outcome) {
        win = true;
        multiplier = 36;
      }
      const boosts = NS.inventory.getBoostsFor("roulette");
      let boostFactor = 1;
      boosts.forEach((b) => {
        const value = parseFloat(b.replace("%", ""));
        if (!Number.isNaN(value)) boostFactor += value / 100;
      });
      let payout = 0;
      if (win) {
        payout = bet * multiplier * boostFactor;
        NS.wallet.credit(payout);
        NS.store.pushTransaction({ ts: Date.now(), type: "win", amount: payout - bet, game: "roulette", meta: outcome });
        NS.ui.particleBurst(canvas, "#64d9ff");
      }
      const entry = { ts: Date.now(), game: "roulette", bet, result: outcome, payout };
      NS.store.pushGameHistory(entry);
    }

    return { render };
  }

  function createCoinflip() {
    function render(container) {
      container.innerHTML = "";
      const card = document.createElement("div");
      card.className = "stack";
      card.innerHTML = `
        <canvas width="240" height="240" class="coin-canvas"></canvas>
        <label>Likme <input type="number" min="1" value="2" /></label>
        <div class="coin-buttons">
          <button class="btn ghost" data-side="HEADS">Galvas</button>
          <button class="btn ghost" data-side="TAILS">Astes</button>
        </div>
      `;
      const canvas = card.querySelector("canvas");
      const ctx = canvas.getContext("2d");
      drawCoin(ctx, "HEADS");

      card.querySelectorAll("button[data-side]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const bet = Number(card.querySelector("input").value);
          if (!NS.wallet.spend(bet)) {
            NS.ui.toast(NS.i18n.t("insufficient"));
            return;
          }
          const choice = btn.dataset.side;
          animateFlip(ctx, () => {
            const outcome = Math.random() > 0.5 ? "HEADS" : "TAILS";
            drawCoin(ctx, outcome);
            let payout = 0;
            let resultText = outcome;
            if (choice === outcome) {
              const boosts = NS.inventory.getBoostsFor("coinflip");
              const boost = boosts.reduce((sum, tag) => sum + parseFloat(tag) || 0, 0);
              const factor = 2 + boost;
              payout = bet * factor;
              NS.wallet.credit(payout);
              NS.store.pushTransaction({ ts: Date.now(), type: "win", amount: payout - bet, game: "coinflip", meta: outcome });
            }
            const entry = { ts: Date.now(), game: "coinflip", bet, result: resultText, payout };
            NS.store.pushGameHistory(entry);
          });
        });
      });
      container.appendChild(card);
    }

    function drawCoin(ctx, face) {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.fillStyle = "#1f2640";
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.fillStyle = "#f8d25a";
      ctx.beginPath();
      ctx.arc(120, 120, 80, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#1f2640";
      ctx.font = "bold 28px system-ui";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const label = face ? face[0] : "";
      ctx.fillText(label, 120, 120);
    }

    function animateFlip(ctx, done) {
      const start = performance.now();
      const duration = 1600;
      function frame(now) {
        const progress = Math.min((now - start) / duration, 1);
        const scale = Math.abs(Math.cos(progress * Math.PI * 2)) * 0.8 + 0.2;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.translate(120, 120);
        ctx.scale(1, scale);
        ctx.translate(-120, -120);
        drawCoin(ctx, "");
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        if (progress < 1) {
          requestAnimationFrame(frame);
        } else {
          done();
        }
      }
      requestAnimationFrame(frame);
    }

    return { render };
  }

  function createDice() {
    function render(container) {
      container.innerHTML = "";
      const layout = document.createElement("div");
      layout.className = "stack";
      layout.innerHTML = `
        <div class="dice-area">
          <canvas width="280" height="140"></canvas>
        </div>
        <label>Likme <input type="number" min="1" value="3" /></label>
        <button class="btn primary">Met</button>
        <p id="dice-streak">Streak: 0</p>
      `;
      const canvas = layout.querySelector("canvas");
      const ctx = canvas.getContext("2d");
      drawDice(ctx, 3, 4);
      let streak = 0;
      layout.querySelector("button").addEventListener("click", () => {
        const bet = Number(layout.querySelector("input").value);
        if (!NS.wallet.spend(bet)) {
          NS.ui.toast(NS.i18n.t("insufficient"));
          return;
        }
        animateDice(ctx, () => {
          const player = 1 + Math.floor(Math.random() * 6);
          const dealer = 1 + Math.floor(Math.random() * 6);
          drawDice(ctx, player, dealer);
          let payout = 0;
          if (player > dealer) {
            const boosts = NS.inventory.getBoostsFor("dice");
            let bonus = 0;
            boosts.forEach((tag) => {
              const val = parseFloat(tag.replace("%", ""));
              if (!Number.isNaN(val)) bonus += val;
            });
            const factor = 2 + bonus / 10;
            payout = bet * factor;
            NS.wallet.credit(payout);
            NS.store.pushTransaction({ ts: Date.now(), type: "win", amount: payout - bet, game: "dice" });
            streak += 1;
          } else {
            streak = 0;
          }
          layout.querySelector("#dice-streak").textContent = `Streak: ${streak}`;
          const entry = { ts: Date.now(), game: "dice", bet, result: `${player}-${dealer}`, payout };
          NS.store.pushGameHistory(entry);
        });
      });
      container.appendChild(layout);
    }

    function drawDice(ctx, a, b) {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      drawDie(ctx, 40, 20, a);
      drawDie(ctx, 160, 20, b, "#ff7597");
    }

    function drawDie(ctx, x, y, value, color = "#64d9ff") {
      ctx.fillStyle = color;
      ctx.beginPath();
      const r = 14;
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + 80 - r, y);
      ctx.quadraticCurveTo(x + 80, y, x + 80, y + r);
      ctx.lineTo(x + 80, y + 80 - r);
      ctx.quadraticCurveTo(x + 80, y + 80, x + 80 - r, y + 80);
      ctx.lineTo(x + r, y + 80);
      ctx.quadraticCurveTo(x, y + 80, x, y + 80 - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.fill();
      ctx.fillStyle = "#111";
      const pips = {
        1: [[40, 40]],
        2: [[20, 20], [60, 60]],
        3: [[20, 20], [40, 40], [60, 60]],
        4: [[20, 20], [60, 20], [20, 60], [60, 60]],
        5: [[20, 20], [60, 20], [40, 40], [20, 60], [60, 60]],
        6: [[20, 20], [20, 40], [20, 60], [60, 20], [60, 40], [60, 60]]
      };
      pips[value].forEach(([px, py]) => {
        ctx.beginPath();
        ctx.arc(x + px, y + py, 6, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    function animateDice(ctx, done) {
      const start = performance.now();
      const duration = 900;
      function frame(now) {
        const progress = Math.min((now - start) / duration, 1);
        ctx.save();
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.translate(140, 70);
        ctx.rotate(progress * Math.PI * 4);
        ctx.translate(-140, -70);
        drawDice(ctx, 1 + Math.floor(Math.random() * 6), 1 + Math.floor(Math.random() * 6));
        ctx.restore();
        if (progress < 1) requestAnimationFrame(frame);
        else done();
      }
      requestAnimationFrame(frame);
    }

    return { render };
  }

  function createCrash() {
    function render(container) {
      container.innerHTML = "";
      const layout = document.createElement("div");
      layout.className = "stack";
      layout.innerHTML = `
        <canvas width="360" height="200"></canvas>
        <label>Likme <input type="number" min="1" value="3" /></label>
        <button class="btn primary" id="crash-start">Sākt</button>
        <button class="btn ghost" id="crash-cash" disabled>Cash out</button>
        <p id="crash-status">Gaidām startu</p>
      `;
      container.appendChild(layout);
      const canvas = layout.querySelector("canvas");
      const ctx = canvas.getContext("2d");
      let running = false;
      let crashed = false;
      let multiplier = 1;
      let bet = 0;
      let raf;

      function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "rgba(255,255,255,0.05)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = "#64d9ff";
        ctx.beginPath();
        ctx.moveTo(10, canvas.height - 20);
        ctx.lineTo(10 + multiplier * 40, canvas.height - 20 - multiplier * 30);
        ctx.stroke();
        ctx.fillStyle = "#64d9ff";
        ctx.fillText(multiplier.toFixed(2) + "x", 20, 30);
      }

      function loop() {
        multiplier += 0.01 + multiplier * 0.01;
        draw();
        if (!crashed && multiplier < crashPoint) {
          raf = requestAnimationFrame(loop);
        } else {
          crashed = true;
          layout.querySelector("#crash-status").textContent = `Crash pie ${multiplier.toFixed(2)}x`;
          layout.querySelector("#crash-cash").disabled = true;
          running = false;
          if (bet > 0) {
            NS.store.pushGameHistory({ ts: Date.now(), game: "crash", bet, result: multiplier.toFixed(2) + "x", payout: 0 });
          }
        }
      }

      let crashPoint = 0;

      layout.querySelector("#crash-start").addEventListener("click", () => {
        if (running) return;
        bet = Number(layout.querySelector("input").value);
        if (!NS.wallet.spend(bet)) {
          NS.ui.toast(NS.i18n.t("insufficient"));
          return;
        }
        multiplier = 1;
        crashPoint = 1.5 + Math.random() * 5;
        running = true;
        crashed = false;
        layout.querySelector("#crash-status").textContent = "Skrien augšup...";
        layout.querySelector("#crash-cash").disabled = false;
        draw();
        cancelAnimationFrame(raf);
        loop();
      });

      layout.querySelector("#crash-cash").addEventListener("click", () => {
        if (!running || crashed) return;
        running = false;
        cancelAnimationFrame(raf);
        const payout = bet * multiplier;
        NS.wallet.credit(payout);
        layout.querySelector("#crash-status").textContent = `Izņemts pie ${multiplier.toFixed(2)}x`;
        layout.querySelector("#crash-cash").disabled = true;
        NS.store.pushTransaction({ ts: Date.now(), type: "win", amount: payout - bet, game: "crash", meta: multiplier.toFixed(2) });
        NS.store.pushGameHistory({ ts: Date.now(), game: "crash", bet, result: multiplier.toFixed(2) + "x", payout });
      });
    }

    return { render };
  }

  function createPlinko() {
    function render(container) {
      container.innerHTML = "";
      const layout = document.createElement("div");
      layout.className = "stack";
      layout.innerHTML = `
        <canvas width="320" height="320"></canvas>
        <label>Likme <input type="number" min="1" value="2" /></label>
        <button class="btn primary">Nomest bumbiņu</button>
      `;
      const canvas = layout.querySelector("canvas");
      const ctx = canvas.getContext("2d");
      drawBoard(ctx);
      layout.querySelector("button").addEventListener("click", () => {
        const bet = Number(layout.querySelector("input").value);
        if (!NS.wallet.spend(bet)) {
          NS.ui.toast(NS.i18n.t("insufficient"));
          return;
        }
        animateDrop(ctx, (slot) => {
          const multipliers = [0, 0.5, 1, 2, 5, 2, 1, 0.5, 0];
          const multiplier = multipliers[slot] || 0;
          const payout = bet * multiplier;
          if (payout > 0) {
            NS.wallet.credit(payout);
            NS.store.pushTransaction({ ts: Date.now(), type: "win", amount: payout - bet, game: "plinko", meta: `${multiplier.toFixed(1)}x` });
          }
          NS.store.pushGameHistory({ ts: Date.now(), game: "plinko", bet, result: `${multiplier.toFixed(1)}x`, payout });
        });
      });
      container.appendChild(layout);
    }

    function drawBoard(ctx) {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.fillStyle = "rgba(255,255,255,0.1)";
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col <= row; col++) {
          const x = 160 + (col - row / 2) * 30;
          const y = 40 + row * 30;
          ctx.beginPath();
          ctx.arc(x, y, 5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      const slots = [0, 0.5, 1, 2, 5, 2, 1, 0.5, 0];
      slots.forEach((multi, index) => {
        const x = 40 + index * 32;
        ctx.fillStyle = "rgba(100,217,255,0.2)";
        ctx.fillRect(x, 260, 28, 40);
        ctx.fillStyle = "#64d9ff";
        ctx.fillText(`${multi}x`, x + 14, 280);
      });
    }

    function animateDrop(ctx, done) {
      const path = [];
      let slotIndex = 4;
      for (let row = 0; row < 8; row++) {
        const dir = Math.random() > 0.5 ? 1 : -1;
        slotIndex += dir;
        slotIndex = Math.max(0, Math.min(8, slotIndex));
        path.push(slotIndex);
      }
      let step = 0;
      function frame() {
        drawBoard(ctx);
        const x = 40 + (path[step] ?? 4) * 32;
        const y = 40 + step * 28;
        ctx.fillStyle = "#8f6dff";
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, Math.PI * 2);
        ctx.fill();
        if (step < path.length) {
          step += 1;
          requestAnimationFrame(frame);
        } else {
          done(path[path.length - 1]);
        }
      }
      frame();
    }

    return { render };
  }

  NS.casino = {
    init() {
      activateGame("roulette");
      renderHistory();
    }
  };
})();
