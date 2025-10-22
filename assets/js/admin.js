const Admin = (() => {
  let nova;
  let view;
  let taxRate = 0.05;

  function init(app) {
    nova = app;
    view = document.getElementById('view-admin');
    taxRate = nova.state.settings?.taxRate || 0.05;
    render();
    nova.bus.on('profile:update', () => render());
  }

  function render() {
    if (!view) return;
    const isAdmin = nova.state.userProfile?.role === 'pārdevējs';
    view.innerHTML = isAdmin ? adminTemplate() : '<div class="section-card"><p>Tikai pārdevējiem.</p></div>';
    if (isAdmin) {
      bindAdminUI();
      populateLists();
    }
  }

  function adminTemplate() {
    return `
      <div class="section-card">
        <div class="section-header"><h2>Administrācijas panelis</h2></div>
        <div class="settings-grid">
          <div class="settings-card">
            <h3>Featured piedāvājumi</h3>
            <div id="adminFeatured"></div>
          </div>
          <div class="settings-card">
            <h3>Paziņojumi</h3>
            <textarea id="adminAnnouncement" rows="3" placeholder="Jauns paziņojums"></textarea>
            <button id="adminAddAnnouncement">Pievienot</button>
          </div>
          <div class="settings-card">
            <h3>Promo kodi</h3>
            <input id="promoCode" placeholder="Kodā"> 
            <select id="promoType">
              <option value="credit">+€</option>
              <option value="discount">Atlaide %</option>
            </select>
            <input id="promoValue" type="number" min="1" step="1" placeholder="Vērtība">
            <button id="promoAdd">Saglabāt</button>
            <div id="promoList"></div>
          </div>
          <div class="settings-card">
            <h3>Ekonomika</h3>
            <label>Nodoklis (%)<input type="range" id="taxSlider" min="0" max="3" step="0.5" value="${taxRate * 100}"></label>
            <div class="badge" id="taxValue">${(taxRate * 100).toFixed(1)}%</div>
            <div id="adminStats">Ielādē...</div>
          </div>
        </div>
      </div>
    `;
  }

  function bindAdminUI() {
    document.getElementById('adminAddAnnouncement').addEventListener('click', () => {
      const text = document.getElementById('adminAnnouncement').value.trim();
      if (!text) return;
      nova.upsertAnnouncement(text);
      document.getElementById('adminAnnouncement').value = '';
      Store.saveState('announcements', nova.state.announcements);
      UI.showToast('Paziņojums izveidots', 'success');
      render();
    });
    document.getElementById('promoAdd').addEventListener('click', addPromoCode);
    const slider = document.getElementById('taxSlider');
    slider.addEventListener('input', () => {
      taxRate = slider.value / 100;
      document.getElementById('taxValue').textContent = `${(taxRate * 100).toFixed(1)}%`;
    });
    slider.addEventListener('change', () => {
      nova.state.settings.taxRate = taxRate;
      Store.saveState('settings', nova.state.settings);
      UI.showToast('Nodoklis atjaunots', 'info');
    });
  }

  async function populateLists() {
    const featuredWrap = document.getElementById('adminFeatured');
    featuredWrap.innerHTML = nova.state.offers.map((offer) => `
      <label style="display:block;margin-bottom:0.4rem;">
        <input type="checkbox" data-offer="${offer.id}" ${offer.featured ? 'checked' : ''}> ${offer.title}
      </label>
    `).join('');
    featuredWrap.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
      checkbox.addEventListener('change', () => {
        const id = checkbox.dataset.offer;
        nova.state.offers = nova.state.offers.map((offer) => offer.id === id ? { ...offer, featured: checkbox.checked } : offer);
        Store.saveState('offers', nova.state.offers);
        UI.showToast('Featured status atjaunots', 'info');
        nova.renderAll();
      });
    });
    const promoList = document.getElementById('promoList');
    promoList.innerHTML = nova.state.promoCodes.map((promo) => {
      const label = promo.type === 'credit' ? `+${nova.formatCurrency(promo.value)}` : `-${Math.round(promo.value * 100)}%`;
      return `<div class="badge">${promo.code} (${label})</div>`;
    }).join('');
    const statsWrap = document.getElementById('adminStats');
    const tx = await Store.getTransactions();
    const deposits = tx.filter((item) => item.type === 'deposit').reduce((sum, item) => sum + item.amount, 0);
    const wins = tx.filter((item) => item.type === 'win').reduce((sum, item) => sum + item.amount, 0);
    const purchases = tx.filter((item) => item.type === 'buy').reduce((sum, item) => sum + Math.abs(item.amount), 0);
    statsWrap.innerHTML = `
      <p>Kopā iemaksas: ${nova.formatCurrency(deposits)}</p>
      <p>Kopā laimesti: ${nova.formatCurrency(wins)}</p>
      <p>Tirgus tēriņi: ${nova.formatCurrency(purchases)}</p>
      <p>Aktīvi piedāvājumi: ${nova.state.offers.length}</p>
    `;
  }

  function addPromoCode() {
    const code = document.getElementById('promoCode').value.trim().toUpperCase();
    const type = document.getElementById('promoType').value;
    const value = Number(document.getElementById('promoValue').value);
    if (!code || !value) {
      UI.showToast('Aizpildi promo laukus', 'error');
      return;
    }
    const existing = nova.state.promoCodes.find((promo) => promo.code === code);
    if (existing) {
      UI.showToast('Kods jau eksistē', 'error');
      return;
    }
    nova.state.promoCodes.push({ code, type, value: type === 'discount' ? value / 100 : value, active: true });
    Store.saveState('promoCodes', nova.state.promoCodes);
    UI.showToast('Promo kods pievienots', 'success');
    render();
  }

  function getTaxRate() {
    return nova.state.settings?.taxRate || 0.05;
  }

  Nova.registerModule('admin', { init, render });

  return { getTaxRate };
})();
