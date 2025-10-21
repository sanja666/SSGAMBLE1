const Wallet = (() => {
  let nova;
  let cachedTransactions = [];

  function init(app) {
    nova = app;
    refreshTransactions();
    nova.bus.on('txn:new', () => refreshTransactions());
    nova.bus.on('settings:ready', () => renderTransactions());
  }

  async function refreshTransactions() {
    try {
      cachedTransactions = await Store.getTransactions();
      renderTransactions();
    } catch (error) {
      console.error('Txn load failed', error);
    }
  }

  function renderTransactions() {
    const view = document.getElementById('view-settings');
    if (!view) return;
    let txHtml = '<div class="section-card"><div class="section-header"><h3>Darījumi</h3></div>';
    txHtml += '<div class="history-list">';
    cachedTransactions.slice(0, 12).forEach((tx) => {
      const label = tx.type === 'deposit' ? 'Iemaksa' : tx.type === 'buy' ? `Pirkums: ${tx.title || ''}` : tx.type === 'win' ? `Laimests: ${tx.game}` : tx.type;
      txHtml += `<div class="history-row"><span>${label}</span><span>${nova.formatCurrency(tx.amount)}</span></div>`;
    });
    txHtml += '</div></div>';
    const placeholder = view.querySelector('[data-wallet-history]');
    if (placeholder) {
      placeholder.innerHTML = txHtml;
    }
  }

  function openDepositModal() {
    const content = `
      <h3>Mock Bankas karte</h3>
      <p>Šī ir simulācija mācību nolūkiem. Kartes dati netiek sūtīti vai glabāti ārpus šīs ierīces. Nelietot reālus datus.</p>
      <form id="depositForm" class="flex-grid">
        <label>Kartes numurs<input name="card" inputmode="numeric" required pattern="[0-9\s]{12,19}"></label>
        <label>Derīguma termiņš (MM/YY)<input name="expiry" required pattern="[0-9]{2}/[0-9]{2}"></label>
        <label>CVC<input name="cvc" inputmode="numeric" required pattern="[0-9]{3,4}"></label>
        <fieldset class="flex-grid" style="grid-template-columns:repeat(auto-fit,minmax(120px,1fr));">
          <legend>Summa</legend>
          <label><input type="radio" name="amount" value="5" required> 5 €</label>
          <label><input type="radio" name="amount" value="10"> 10 €</label>
          <label><input type="radio" name="amount" value="20"> 20 €</label>
          <label><input type="radio" name="amount" value="custom"> Custom</label>
          <input type="number" step="0.01" min="1" name="customAmount" placeholder="€" style="display:none;">
        </fieldset>
        <button type="submit">Procesēt</button>
      </form>
    `;
    UI.openModal(content);
    const form = document.getElementById('depositForm');
    const customField = form.querySelector('[name="customAmount"]');
    form.addEventListener('change', (event) => {
      if (event.target.name === 'amount') {
        customField.style.display = event.target.value === 'custom' ? 'block' : 'none';
      }
    });
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const data = new FormData(form);
      let amount = Number(data.get('amount'));
      if (data.get('amount') === 'custom') {
        amount = Number(data.get('customAmount'));
      }
      if (!amount || amount <= 0) {
        UI.showToast('Ievadi derīgu summu', 'error');
        return;
      }
      simulateDeposit(amount, data.get('card'));
    });
  }

  function simulateDeposit(amount, cardNumber) {
    const modal = document.querySelector('.modal');
    if (!modal) return;
    modal.innerHTML = `
      <h3 data-i18n="processing">${I18n.t('processing')}</h3>
      <div class="processing"><div class="spinner" aria-hidden="true"></div><span>Mock apstrāde...</span></div>
    `;
    setTimeout(() => {
      const digits = (cardNumber || '').replace(/\D/g, '');
      const masked = digits ? `**** ${digits.slice(-4)} (mock)` : '**** 0000 (mock)';
      nova.adjustWallet(amount, { type: 'deposit', method: 'card', meta: masked });
      UI.showToast(`${I18n.t('depositSuccess')}: +${amount.toFixed(2)} € (mock karte)`, 'success');
      UI.spawnConfetti('#4de2ff', '#5df5ff');
      UI.closeModal();
    }, 2200);
  }

  function render() {
    renderTransactions();
  }

  Nova.registerModule('wallet', { init, render, openDepositModal });

  return {
    openDepositModal
  };
})();
