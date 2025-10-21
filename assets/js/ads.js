const Ads = (() => {
  let nova;
  let view;

  function init(app) {
    nova = app;
    view = document.getElementById('view-ads');
    render();
  }

  function render() {
    if (!view) return;
    const cards = nova.state.adsMine.map((ad) => `
      <div class="market-card" data-ad="${ad.id}">
        <img src="${ad.img}" alt="${ad.title}" loading="lazy">
        <strong>${ad.title}</strong>
        <span>${ad.desc}</span>
        <span class="price">${nova.formatCurrency(ad.price)}</span>
        <div class="badge">${ad.status}</div>
        <div class="actions" style="display:flex;gap:0.5rem;">
          <button data-action="status" data-id="${ad.id}" data-status="active">Aktīvs</button>
          <button data-action="status" data-id="${ad.id}" data-status="paused">Pauze</button>
          <button data-action="sell" data-id="${ad.id}">Pārdot</button>
          <button data-action="delete" data-id="${ad.id}">Dzēst</button>
        </div>
      </div>
    `).join('');
    view.innerHTML = `
      <div class="section-card">
        <div class="section-header"><h2>Mani sludinājumi</h2></div>
        <div class="market-grid">${cards}</div>
      </div>
      <div class="section-card">
        <div class="section-header"><h3>Pievienot jaunu</h3></div>
        <form id="adsForm" class="flex-grid" style="grid-template-columns:repeat(auto-fit,minmax(200px,1fr));">
          <input name="title" placeholder="Nosaukums" required>
          <input name="price" type="number" placeholder="Cena" required min="1">
          <input name="img" placeholder="Attēla ceļš" value="assets/img/market/art.svg" required>
          <textarea name="desc" rows="2" placeholder="Apraksts"></textarea>
          <select name="cat">
            <option value="Tehnika">Tehnika</option>
            <option value="Auto">Auto</option>
            <option value="Birojs">Birojs</option>
          </select>
          <button type="submit">Saglabāt</button>
        </form>
      </div>
    `;
    view.querySelectorAll('button[data-action]').forEach((btn) => btn.addEventListener('click', handleAction));
    view.querySelector('#adsForm').addEventListener('submit', createAd);
  }

  function handleAction(event) {
    const id = event.currentTarget.dataset.id;
    const action = event.currentTarget.dataset.action;
    if (action === 'status') {
      updateStatus(id, event.currentTarget.dataset.status);
    } else if (action === 'delete') {
      deleteAd(id);
    } else if (action === 'sell') {
      sellAd(id);
    }
  }

  function createAd(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const ad = {
      id: `ad-${Date.now()}`,
      title: data.get('title'),
      price: Number(data.get('price')),
      img: data.get('img'),
      desc: data.get('desc'),
      status: 'active',
      cat: data.get('cat')
    };
    nova.state.adsMine.push(ad);
    Store.saveState('adsMine', nova.state.adsMine);
    UI.showToast('Sludinājums pievienots', 'success');
    render();
  }

  function updateStatus(id, status) {
    nova.state.adsMine = nova.state.adsMine.map((ad) => ad.id === id ? { ...ad, status } : ad);
    Store.saveState('adsMine', nova.state.adsMine);
    render();
  }

  function deleteAd(id) {
    nova.state.adsMine = nova.state.adsMine.filter((ad) => ad.id !== id);
    Store.saveState('adsMine', nova.state.adsMine);
    render();
  }

  function sellAd(id) {
    const ad = nova.state.adsMine.find((item) => item.id === id);
    if (!ad || ad.status === 'sold') return;
    const tax = Admin.getTaxRate ? Admin.getTaxRate() : 0.05;
    const net = ad.price * (1 - tax);
    ad.status = 'sold';
    Store.saveState('adsMine', nova.state.adsMine);
    nova.adjustWallet(net, { type: 'sell', title: ad.title });
    UI.showToast(`Pārdots par ${nova.formatCurrency(net)}`, 'success');
    render();
  }

  Nova.registerModule('ads', { init, render });
})();
