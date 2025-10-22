const Market = (() => {
  let nova;
  let view;
  let filterState = { search: '', cat: 'all', rarity: 'all', min: 0, max: 999 };

  function init(app) {
    nova = app;
    view = document.getElementById('view-tirgus');
    render();
  }

  function render() {
    if (!view) return;
    view.innerHTML = `
      <div class="section-card">
        <div class="section-header"><h2>Tirgus</h2></div>
        ${featuredCarousel()}
        <div class="flex-grid" style="grid-template-columns:repeat(auto-fit,minmax(200px,1fr));">
          <input id="marketSearch" placeholder="Meklēt">
          <select id="marketCat">
            <option value="all">Visas kategorijas</option>
            <option value="Auto">Auto</option>
            <option value="Tehnika">Tehnika</option>
            <option value="Nekustamie īpašumi">Nekustamie īpašumi</option>
            <option value="Kolekcijas">Kolekcijas</option>
            <option value="Birojs">Birojs</option>
          </select>
          <select id="marketRarity">
            <option value="all">Visi retumi</option>
            <option value="Common">Common</option>
            <option value="Rare">Rare</option>
            <option value="Epic">Epic</option>
            <option value="Legendary">Legendary</option>
          </select>
          <div class="flex-grid" style="grid-template-columns:1fr 1fr;">
            <input id="marketMin" type="number" placeholder="Min €" min="0">
            <input id="marketMax" type="number" placeholder="Max €" min="0">
          </div>
        </div>
        <div class="flex-grid" style="grid-template-columns:1fr auto;margin-top:0.75rem;">
          <input id="promoInput" placeholder="Promo kods">
          <button id="promoApply" type="button">Aktivēt</button>
        </div>
        <div class="market-grid" id="marketGrid"></div>
      </div>
    `;
    bindFilters();
    renderGrid();
  }

  function featuredCarousel() {
    const featured = nova.state.offers.filter((offer) => offer.featured);
    if (!featured.length) return '';
    const slides = featured.map((offer) => `
      <div class="market-card">
        <img src="${offer.img}" alt="${offer.title}" loading="lazy">
        <div class="rarity">${offer.rarity}</div>
        <strong>${offer.title}</strong>
        <span>${offer.desc}</span>
        <span class="price">${nova.formatCurrency(offer.price)}</span>
      </div>
    `).join('');
    return `<div class="market-grid" style="grid-template-columns:repeat(auto-fit,minmax(180px,1fr));margin-bottom:1rem;">${slides}</div>`;
  }

  function bindFilters() {
    document.getElementById('marketSearch').addEventListener('input', (event) => {
      filterState.search = event.target.value.toLowerCase();
      renderGrid();
    });
    document.getElementById('marketCat').addEventListener('change', (event) => {
      filterState.cat = event.target.value;
      renderGrid();
    });
    document.getElementById('marketRarity').addEventListener('change', (event) => {
      filterState.rarity = event.target.value;
      renderGrid();
    });
    document.getElementById('marketMin').addEventListener('change', (event) => {
      filterState.min = Number(event.target.value) || 0;
      renderGrid();
    });
    document.getElementById('marketMax').addEventListener('change', (event) => {
      filterState.max = Number(event.target.value) || 999;
      renderGrid();
    });
    document.getElementById('promoApply').addEventListener('click', applyPromo);
  }

  function renderGrid() {
    const grid = document.getElementById('marketGrid');
    const filtered = nova.state.offers.filter((offer) => {
      if (filterState.cat !== 'all' && offer.cat !== filterState.cat) return false;
      if (filterState.rarity !== 'all' && offer.rarity !== filterState.rarity) return false;
      if (offer.price < filterState.min || offer.price > filterState.max) return false;
      if (filterState.search && !`${offer.title} ${offer.desc}`.toLowerCase().includes(filterState.search)) return false;
      return offer.qty > 0;
    });
    grid.innerHTML = filtered.map((offer) => `
      <div class="market-card" data-offer="${offer.id}">
        <img src="${offer.img}" alt="${offer.title}" loading="lazy">
        <div class="rarity">${offer.rarity}</div>
        <strong>${offer.title}</strong>
        <small>${offer.desc}</small>
        <span>${offer.seller}</span>
        <span class="price">${nova.formatCurrency(offer.price)}</span>
        <button data-buy="${offer.id}">Pirkt</button>
      </div>
    `).join('');
    grid.querySelectorAll('button[data-buy]').forEach((btn) => btn.addEventListener('click', () => buyOffer(btn.dataset.buy)));
  }

  function buyOffer(id) {
    const offer = nova.state.offers.find((o) => o.id === id);
    if (!offer || offer.qty <= 0) {
      UI.showToast('Piedāvājums vairs nav pieejams', 'error');
      return;
    }
    const discount = activeDiscount();
    const price = offer.price * (1 - discount);
    if (nova.state.walletBalance < price) {
      UI.showToast('Nepietiek līdzekļu, mēģini pievienot!', 'error');
      Wallet.openDepositModal();
      return;
    }
    UI.openModal(`
      <h3>${offer.title}</h3>
      <p>Vai tiešām pirkt par ${nova.formatCurrency(price)}?</p>
      <div style="display:flex;gap:0.5rem;">
        <button id="confirmBuy">Apstiprināt</button>
        <button id="cancelBuy">Atcelt</button>
      </div>
    `);
    document.getElementById('cancelBuy').addEventListener('click', UI.closeModal);
    document.getElementById('confirmBuy').addEventListener('click', () => {
      completePurchase(offer, price);
      UI.closeModal();
    });
  }

  function activeDiscount() {
    const code = nova.state.promoCodes.find((promo) => promo.type === 'discount' && promo.active);
    return code ? Math.min(0.5, code.value) : 0;
  }

  function completePurchase(offer, price) {
    nova.adjustWallet(-price, { type: 'buy', title: offer.title, counterparty: offer.seller });
    offer.qty -= 1;
    Store.saveState('offers', nova.state.offers);
    nova.state.inventory.push({ id: `${offer.id}-${Date.now()}`, title: offer.title, rarity: offer.rarity, img: offer.img, value: offer.price, equipped: false, tags: ['boost:roulette:+1'] });
    Store.saveState('inventory', nova.state.inventory);
    nova.bus.emit('inventory:change', nova.state.inventory);
    nova.state.promoCodes = nova.state.promoCodes.map((promo) => promo.type === 'discount' ? { ...promo, active: false } : promo);
    Store.saveState('promoCodes', nova.state.promoCodes);
    UI.showToast('Pirkums veiksmīgs', 'success');
    UI.spawnConfetti('#4de2ff', '#a66bff');
    nova.renderAll();
    render();
  }

  function applyPromo() {
    const input = document.getElementById('promoInput');
    const codeText = input.value.trim().toUpperCase();
    if (!codeText) return;
    const promo = nova.state.promoCodes.find((p) => p.code === codeText && p.active !== false);
    if (!promo) {
      UI.showToast('Kods nav derīgs', 'error');
      return;
    }
    if (promo.type === 'credit') {
      nova.adjustWallet(promo.value, { type: 'promo', code: promo.code });
      promo.active = false;
      UI.showToast(`Promo +${nova.formatCurrency(promo.value)}`, 'success');
    } else if (promo.type === 'discount') {
      if (promo.active === true) {
        UI.showToast('Atlaide jau ir aktīva', 'info');
        return;
      }
      promo.active = true;
      UI.showToast('Atlaide piemērota nākamajam pirkumam', 'info');
    }
    Store.saveState('promoCodes', nova.state.promoCodes);
    input.value = '';
  }

  Nova.registerModule('market', { init, render });
})();
