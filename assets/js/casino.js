const Casino = (() => {
  let nova;
  let view;
  let historyWrap;
  let activeGame = 'roulette';
  let rouletteCtx;
  let rouletteCanvas;
  let rouletteSpinning = false;
  const rouletteNumbers = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];
  const rouletteColors = { 0: 'green', 32: 'red', 15: 'black', 19: 'red', 4: 'black', 21: 'red', 2: 'black', 25: 'red', 17: 'black', 34: 'red', 6: 'black', 27: 'red', 13: 'black', 36: 'red', 11: 'black', 30: 'red', 8: 'black', 23: 'red', 10: 'black', 5: 'red', 24: 'black', 16: 'red', 33: 'black', 1: 'red', 20: 'black', 14: 'red', 31: 'black', 9: 'red', 22: 'black', 18: 'red', 29: 'black', 7: 'red', 28: 'black', 12: 'red', 35: 'black', 3: 'red', 26: 'black' };

  function init(app) {
    nova = app;
    view = document.getElementById('view-kazino');
    renderLayout();
    historyWrap = view.querySelector('[data-game-history]');
    drawRoulette(0);
    attachListeners();
    nova.bus.on('wallet:update', updateBetHints);
  }

  function renderLayout() {
    view.innerHTML = `
      <div class="section-card">
        <div class="section-header"><h2>Kazino</h2></div>
        <div class="game-tabs">
          <button data-game="roulette" class="active">Roulette</button>
          <button data-game="coinflip">Coin Flip</button>
          <button data-game="dice">Dice Duel</button>
          <button data-game="crash">Crash</button>
          <button data-game="plinko">Plinko</button>
        </div>
        <div id="casinoGameArea"></div>
      </div>
      <div class="section-card">
        <div class="section-header"><h3>Vēsture</h3></div>
        <div data-game-history class="history-list"></div>
      </div>
    `;
    view.querySelectorAll('.game-tabs button').forEach((btn) => {
      btn.addEventListener('click', () => switchGame(btn.dataset.game));
    });
    switchGame('roulette');
  }

  function switchGame(game) {
    activeGame = game;
    view.querySelectorAll('.game-tabs button').forEach((btn) => btn.classList.toggle('active', btn.dataset.game === game));
    const area = document.getElementById('casinoGameArea');
    area.innerHTML = '';
    if (game === 'roulette') {
      area.innerHTML = rouletteTemplate();
      rouletteCanvas = area.querySelector('canvas');
      rouletteCtx = rouletteCanvas.getContext('2d');
      drawRoulette(0);
    } else if (game === 'coinflip') {
      area.innerHTML = coinTemplate();
    } else if (game === 'dice') {
      area.innerHTML = diceTemplate();
    } else if (game === 'crash') {
      area.innerHTML = crashTemplate();
    } else if (game === 'plinko') {
      area.innerHTML = plinkoTemplate();
    }
    attachGameHandlers(game);
    renderHistory();
  }

  function attachListeners() {
    nova.bus.on('game:result', () => renderHistory());
  }

  function updateBetHints() {
    const hint = document.querySelector('[data-balance-hint]');
    if (hint) hint.textContent = `Bilance: ${nova.formatCurrency(nova.state.walletBalance)}`;
  }

  function rouletteTemplate() {
    return `
      <div class="canvas-shell">
        <canvas width="320" height="320" aria-label="Roulette"></canvas>
        <div>
          <label>Likme (€)<input type="number" min="1" step="1" id="rouletteBet" value="5"></label>
          <label>Likmes veids
            <select id="rouletteBetType">
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
              <option value="number">Precīzs skaitlis</option>
            </select>
          </label>
          <label id="rouletteNumberWrap" style="display:none;">Skaitlis 0-36<input type="number" min="0" max="36" id="rouletteNumber" value="17"></label>
          <div data-balance-hint></div>
          <button id="rouletteSpin">Griezt</button>
        </div>
      </div>
    `;
  }

  function coinTemplate() {
    return `
      <div class="canvas-shell">
        <div class="coin" id="coinDisplay" style="height:220px;display:flex;align-items:center;justify-content:center;font-size:2.2rem;">Galvas</div>
        <div>
          <label>Likme (€)<input type="number" min="1" step="1" id="coinBet" value="2"></label>
          <label>Izvēle
            <select id="coinChoice">
              <option value="HEADS">Galvas</option>
              <option value="TAILS">Astes</option>
            </select>
          </label>
          <div class="badge" id="coinWinRate">Uzvaru attiecība: 50%</div>
          <button id="coinFlip">Mest</button>
        </div>
      </div>
    `;
  }

  function diceTemplate() {
    return `
      <div class="canvas-shell">
        <div id="diceArea" style="display:flex;gap:2rem;align-items:center;justify-content:center;font-size:2.5rem;">⚀ ⚁</div>
        <div>
          <label>Likme (€)<input type="number" min="1" step="1" id="diceBet" value="3"></label>
          <button id="diceRoll">Duelis</button>
          <div class="badge" id="diceStreak">Streak: 0</div>
        </div>
      </div>
    `;
  }

  function crashTemplate() {
    return `
      <div class="canvas-shell">
        <canvas width="360" height="220" id="crashCanvas"></canvas>
        <div>
          <label>Likme (€)<input type="number" min="1" step="1" id="crashBet" value="5"></label>
          <button id="crashStart">Start</button>
          <button id="crashCashout" disabled>Cash out</button>
          <div class="badge" id="crashStatus">×1.00</div>
          <div class="badge" id="crashBest">Labākais ×1.00</div>
        </div>
      </div>
    `;
  }

  function plinkoTemplate() {
    return `
      <div class="canvas-shell">
        <canvas width="320" height="320" id="plinkoCanvas"></canvas>
        <div>
          <label>Likme (€)<input type="number" min="1" step="1" id="plinkoBet" value="4"></label>
          <button id="plinkoDrop">Nomest</button>
          <div class="badge" id="plinkoLast">Pēdējais ×1.00</div>
        </div>
      </div>
    `;
  }

  function attachGameHandlers(game) {
    if (game === 'roulette') {
      const typeSelect = document.getElementById('rouletteBetType');
      typeSelect.addEventListener('change', () => {
        document.getElementById('rouletteNumberWrap').style.display = typeSelect.value === 'number' ? 'block' : 'none';
      });
      document.getElementById('rouletteSpin').addEventListener('click', spinRoulette);
      updateBetHints();
    } else if (game === 'coinflip') {
      document.getElementById('coinFlip').addEventListener('click', flipCoin);
      updateCoinStats();
    } else if (game === 'dice') {
      document.getElementById('diceRoll').addEventListener('click', rollDice);
    } else if (game === 'crash') {
      const startBtn = document.getElementById('crashStart');
      const cashBtn = document.getElementById('crashCashout');
      startBtn.addEventListener('click', startCrash);
      cashBtn.addEventListener('click', cashOutCrash);
    } else if (game === 'plinko') {
      document.getElementById('plinkoDrop').addEventListener('click', dropPlinko);
      drawPlinkoBoard();
    }
  }

  function drawRoulette(rotation) {
    if (!rouletteCtx) return;
    const radius = rouletteCanvas.width / 2;
    rouletteCtx.clearRect(0, 0, rouletteCanvas.width, rouletteCanvas.height);
    rouletteCtx.save();
    rouletteCtx.translate(radius, radius);
    rouletteCtx.rotate(rotation);
    const slice = (2 * Math.PI) / rouletteNumbers.length;
    rouletteNumbers.forEach((num, idx) => {
      rouletteCtx.beginPath();
      rouletteCtx.fillStyle = rouletteColors[num] === 'red' ? '#ff4d88' : rouletteColors[num] === 'black' ? '#0a0d1f' : '#13d68b';
      rouletteCtx.moveTo(0, 0);
      rouletteCtx.arc(0, 0, radius, idx * slice, (idx + 1) * slice);
      rouletteCtx.fill();
      rouletteCtx.save();
      rouletteCtx.rotate(idx * slice + slice / 2);
      rouletteCtx.fillStyle = '#fff';
      rouletteCtx.font = '18px system-ui';
      rouletteCtx.textAlign = 'center';
      rouletteCtx.fillText(num, radius - 40, 8);
      rouletteCtx.restore();
    });
    rouletteCtx.restore();
    rouletteCtx.beginPath();
    rouletteCtx.arc(radius, radius, 12, 0, Math.PI * 2);
    rouletteCtx.fillStyle = '#fff';
    rouletteCtx.fill();
    rouletteCtx.fillStyle = '#ff4d88';
    rouletteCtx.beginPath();
    rouletteCtx.moveTo(radius, 0);
    rouletteCtx.lineTo(radius - 10, 30);
    rouletteCtx.lineTo(radius + 10, 30);
    rouletteCtx.closePath();
    rouletteCtx.fill();
  }

  function getRoulettePayout(betType, betValue, result) {
    if (betType === 'number') {
      return result === betValue ? 35 : 0;
    }
    if (betType === 'red' && rouletteColors[result] === 'red') return 1;
    if (betType === 'black' && rouletteColors[result] === 'black') return 1;
    if (betType === 'even' && result !== 0 && result % 2 === 0) return 1;
    if (betType === 'odd' && result % 2 === 1) return 1;
    if (betType === 'dozen1' && result >= 1 && result <= 12) return 2;
    if (betType === 'dozen2' && result >= 13 && result <= 24) return 2;
    if (betType === 'dozen3' && result >= 25 && result <= 36) return 2;
    if (betType === 'column1' && result !== 0 && result % 3 === 1) return 2;
    if (betType === 'column2' && result !== 0 && result % 3 === 2) return 2;
    if (betType === 'column3' && result !== 0 && result % 3 === 0) return 2;
    return 0;
  }

  function spinRoulette() {
    if (rouletteSpinning) return;
    const bet = Number(document.getElementById('rouletteBet').value);
    if (isNaN(bet) || bet <= 0) {
      UI.showToast('Ievadi derīgu likmi', 'error');
      return;
    }
    if (nova.state.walletBalance < bet) {
      UI.showToast('Nepietiek līdzekļu. Pievieno maku!', 'error');
      Wallet.openDepositModal();
      return;
    }
    const betType = document.getElementById('rouletteBetType').value;
    const betValue = Number(document.getElementById('rouletteNumber').value);
    nova.adjustWallet(-bet, { type: 'bet', game: 'roulette' });
    rouletteSpinning = true;
    const boost = Inventory.getBoost ? Math.min(10, Inventory.getBoost('roulette')) : 0;
    const result = weightedRouletteResult(boost);
    const slice = (2 * Math.PI) / rouletteNumbers.length;
    const targetIndex = rouletteNumbers.indexOf(result);
    const rotations = 8 + Math.random() * 2;
    const targetRotation = rotations * Math.PI * 2 - targetIndex * slice;
    const start = performance.now();
    const duration = 4500;
    function animate(now) {
      const progress = Math.min(1, (now - start) / duration);
      const eased = easeOutCubic(progress);
      drawRoulette(targetRotation * eased);
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        finalizeRoulette(result, bet, betType, betValue);
      }
    }
    requestAnimationFrame(animate);
  }

  function finalizeRoulette(result, bet, betType, betValue) {
    const multiplier = getRoulettePayout(betType, betValue, result);
    let payout = 0;
    if (multiplier > 0) {
    const boost = Inventory.getBoost ? Math.min(10, Inventory.getBoost('roulette')) : 0;
      payout = bet + bet * multiplier * (1 + boost / 100);
      nova.adjustWallet(payout, { type: 'win', game: 'roulette', meta: result });
      UI.showToast(`Roulette laimests: ${nova.formatCurrency(payout)}`, 'success');
      UI.spawnConfetti();
    } else {
      UI.showToast(`Roulette rezultāts: ${result}`, 'info');
    }
    nova.addToHistory({ ts: Date.now(), game: 'roulette', bet, result, payout });
    rouletteSpinning = false;
  }

  function weightedRouletteResult(boost) {
    const luck = (boost || 0) / 100;
    const rnd = Math.random();
    if (luck > 0 && rnd < luck) {
      return [0, 7, 17, 32, 26][Math.floor(Math.random() * 5)];
    }
    return rouletteNumbers[Math.floor(Math.random() * rouletteNumbers.length)];
  }

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function flipCoin() {
    const bet = Number(document.getElementById('coinBet').value);
    if (isNaN(bet) || bet <= 0) {
      UI.showToast('Ievadi likmi', 'error');
      return;
    }
    if (nova.state.walletBalance < bet) {
      UI.showToast('Nepietiek līdzekļu', 'error');
      return;
    }
    const choice = document.getElementById('coinChoice').value;
    nova.adjustWallet(-bet, { type: 'bet', game: 'coinflip' });
    const display = document.getElementById('coinDisplay');
    let progress = 0;
    const duration = 1200;
    const start = performance.now();
    const boost = Inventory.getBoost ? Math.min(10, Inventory.getBoost('coinflip')) : 0;
    const result = Math.random() < 0.5 + boost / 200 ? 'HEADS' : 'TAILS';
    function animate(now) {
      progress = Math.min(1, (now - start) / duration);
      const flip = Math.sin(progress * Math.PI * 4);
      display.style.transform = `perspective(600px) rotateX(${flip * 180}deg)`;
      display.textContent = progress > 0.5 ? result : choice;
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        let payout = 0;
        if (result === choice) {
          payout = bet * 2;
          nova.adjustWallet(payout, { type: 'win', game: 'coinflip', meta: result });
          UI.showToast(`Coin Flip laimests: ${nova.formatCurrency(payout)}`, 'success');
        } else {
          UI.showToast(`Coin Flip rezultāts: ${result}`, 'info');
        }
        nova.addToHistory({ ts: Date.now(), game: 'coinflip', bet, result, payout });
        updateCoinStats(result === choice);
      }
    }
    requestAnimationFrame(animate);
  }

  let coinWins = 1;
  let coinGames = 2;
  function updateCoinStats(won) {
    if (typeof won === 'boolean') {
      coinGames += 1;
      if (won) coinWins += 1;
    }
    const rate = Math.round((coinWins / coinGames) * 100);
    const badge = document.getElementById('coinWinRate');
    if (badge) badge.textContent = `Uzvaru attiecība: ${rate}%`;
  }

  let diceStreak = 0;
  function rollDice() {
    const bet = Number(document.getElementById('diceBet').value);
    if (isNaN(bet) || bet <= 0) {
      UI.showToast('Ievadi likmi', 'error');
      return;
    }
    if (nova.state.walletBalance < bet) {
      UI.showToast('Nepietiek līdzekļu', 'error');
      return;
    }
    const boost = Inventory.getBoost ? Math.min(10, Inventory.getBoost('dice')) : 0;
    nova.adjustWallet(-bet, { type: 'bet', game: 'dice' });
    const playerRoll = rollDieAnimation('diceArea', boost);
    setTimeout(() => {
      const dealer = Math.ceil(Math.random() * 6);
      const area = document.getElementById('diceArea');
      area.textContent = `${playerRoll} vs ${dealer}`;
      let payout = 0;
      if (playerRoll > dealer) {
        diceStreak += 1;
        payout = bet * (1.8 + Math.min(boost / 50, 0.2));
        nova.adjustWallet(payout, { type: 'win', game: 'dice', meta: `${playerRoll}-${dealer}` });
        UI.showToast(`Dice Duel uzvara! ${playerRoll} > ${dealer}`, 'success');
      } else {
        diceStreak = 0;
        UI.showToast(`Dice Duel zaudēts. ${playerRoll} vs ${dealer}`, 'info');
      }
      document.getElementById('diceStreak').textContent = `Streak: ${diceStreak}`;
      nova.addToHistory({ ts: Date.now(), game: 'dice', bet, result: `${playerRoll}-${dealer}`, payout });
    }, 600);
  }

  function rollDieAnimation(containerId, boost) {
    const area = document.getElementById(containerId);
    let idx = 0;
    const faces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
    const interval = setInterval(() => {
      area.textContent = `${faces[idx % faces.length]} ${faces[(idx + 3) % faces.length]}`;
      idx += 1;
    }, 60);
    const target = Math.min(6, Math.ceil(Math.random() * 6 + boost / 10));
    setTimeout(() => {
      clearInterval(interval);
      area.textContent = `${target}`;
    }, 500);
    return target;
  }

  let crashInterval;
  let crashMultiplier = 1;
  let crashActive = false;
  let crashBet = 0;
  let crashBest = 1;

  function startCrash() {
    if (crashActive) return;
    crashBet = Number(document.getElementById('crashBet').value);
    if (isNaN(crashBet) || crashBet <= 0) {
      UI.showToast('Likme nepieciešama', 'error');
      return;
    }
    if (nova.state.walletBalance < crashBet) {
      UI.showToast('Nepietiek līdzekļu', 'error');
      return;
    }
    nova.adjustWallet(-crashBet, { type: 'bet', game: 'crash' });
    crashMultiplier = 1;
    crashActive = true;
    document.getElementById('crashCashout').disabled = false;
    const canvas = document.getElementById('crashCanvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const boost = Inventory.getBoost ? Math.min(10, Inventory.getBoost('crash')) : 0;
    const crashPoint = 1.5 + Math.random() * (3 + boost / 10);
    crashInterval = setInterval(() => {
      crashMultiplier += 0.05 + Math.random() * 0.02;
      drawCrash(canvas, crashMultiplier);
      document.getElementById('crashStatus').textContent = `×${crashMultiplier.toFixed(2)}`;
      if (crashMultiplier >= crashPoint) {
        endCrash(false);
      }
    }, 180);
  }

  function drawCrash(canvas, multiplier) {
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0a1025';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#4de2ff';
    ctx.beginPath();
    ctx.moveTo(20, canvas.height - 20);
    const x = Math.min(canvas.width - 20, 20 + multiplier * 60);
    const y = Math.max(20, canvas.height - 20 - multiplier * 40);
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  function cashOutCrash() {
    if (!crashActive) return;
    endCrash(true);
  }

  function endCrash(cashedOut) {
    clearInterval(crashInterval);
    document.getElementById('crashCashout').disabled = true;
    crashActive = false;
    let payout = 0;
    if (cashedOut) {
      payout = crashBet * crashMultiplier;
      nova.adjustWallet(payout, { type: 'win', game: 'crash', meta: crashMultiplier.toFixed(2) });
      UI.showToast(`Crash cash out ×${crashMultiplier.toFixed(2)}`, 'success');
      crashBest = Math.max(crashBest, crashMultiplier);
      document.getElementById('crashBest').textContent = `Labākais ×${crashBest.toFixed(2)}`;
    } else {
      UI.showToast('Crash eksplodēja!', 'info');
    }
    nova.addToHistory({ ts: Date.now(), game: 'crash', bet: crashBet, result: crashMultiplier.toFixed(2), payout });
  }

  function drawPlinkoBoard() {
    const canvas = document.getElementById('plinkoCanvas');
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0a1025';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#4de2ff';
    for (let row = 0; row < 6; row += 1) {
      for (let col = 0; col <= row; col += 1) {
        const x = canvas.width / 2 + (col - row / 2) * 40;
        const y = 40 + row * 40;
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    const slots = [0.5, 1, 2, 3, 2, 1, 0.5];
    ctx.font = '12px system-ui';
    ctx.textBaseline = 'middle';
    slots.forEach((mult, index) => {
      const x = 40 + index * 40;
      const y = canvas.height - 30;
      ctx.fillStyle = mult >= 2 ? '#ff4d88' : '#51f5ff';
      ctx.fillRect(x - 18, y - 18, 36, 24);
      ctx.fillStyle = '#fff';
      ctx.fillText(`×${mult.toFixed(2)}`, x - 12, y);
    });
  }

  function dropPlinko() {
    const bet = Number(document.getElementById('plinkoBet').value);
    if (isNaN(bet) || bet <= 0) {
      UI.showToast('Likme nav derīga', 'error');
      return;
    }
    if (nova.state.walletBalance < bet) {
      UI.showToast('Nepietiek līdzekļu', 'error');
      return;
    }
    nova.adjustWallet(-bet, { type: 'bet', game: 'plinko' });
    const canvas = document.getElementById('plinkoCanvas');
    const ctx = canvas.getContext('2d');
    drawPlinkoBoard();
    let x = canvas.width / 2;
    let y = 20;
    const slots = [0.5, 1, 1.5, 2.5, 1.5, 1, 0.5];
    const boost = Inventory.getBoost ? Math.min(10, Inventory.getBoost('plinko')) : 0;
    const sway = () => (Math.random() - 0.5) * (12 - boost / 5);
    const interval = setInterval(() => {
      drawPlinkoBoard();
      ctx.fillStyle = '#ffd166';
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fill();
      x += sway();
      y += 18;
      if (y > canvas.height - 40) {
        clearInterval(interval);
        const slotIndex = Math.min(slots.length - 1, Math.max(0, Math.floor(x / (canvas.width / slots.length))));
        const mult = slots[slotIndex];
        const payout = bet * mult;
        if (payout > 0) {
          nova.adjustWallet(payout, { type: 'win', game: 'plinko', meta: mult });
          UI.showToast(`Plinko ×${mult.toFixed(2)}`, 'success');
        }
        document.getElementById('plinkoLast').textContent = `Pēdējais ×${mult.toFixed(2)}`;
        nova.addToHistory({ ts: Date.now(), game: 'plinko', bet, result: mult.toFixed(2), payout });
      }
    }, 120);
  }

  function renderHistory() {
    if (!historyWrap) return;
    historyWrap.innerHTML = nova.state.gameHistory.slice(0, 12).map((item) => `
      <div class="history-row"><span>${item.game}</span><span>${item.result}</span><span>${nova.formatCurrency(item.payout || 0)}</span></div>
    `).join('');
  }

  function render() {
    renderHistory();
  }

  Nova.registerModule('casino', { init, render });
})();
