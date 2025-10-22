const Inventory = (() => {
  let nova;
  let view;

  function init(app) {
    nova = app;
    view = document.getElementById('view-inventory');
    renderInventory();
  }

  function renderInventory() {
    if (!view) return;
    const grid = nova.state.inventory.map((item) => `
      <div class="inventory-card ${item.equipped ? 'equipped' : ''}">
        <img src="${item.img}" alt="${item.title}" loading="lazy">
        <h3>${item.title}</h3>
        <div class="badge rarity-${item.rarity.toLowerCase()}">${item.rarity}</div>
        <div class="tag">Vērtība: ${nova.formatCurrency(item.value)}</div>
        <div class="tag">${item.tags.join(', ')}</div>
        <div class="actions">
          <button data-action="equip" data-id="${item.id}">${item.equipped ? 'Noņemt' : 'Aprīkot'}</button>
          <button data-action="sell" data-id="${item.id}">Pārdot</button>
        </div>
      </div>
    `).join('');
    view.innerHTML = `
      <div class="section-card">
        <div class="section-header"><h2>Inventārs</h2><span class="badge">${nova.state.inventory.length} priekšmeti</span></div>
        <div class="inventory-grid">${grid}</div>
      </div>
    `;
    view.querySelectorAll('button[data-action]').forEach((btn) => btn.addEventListener('click', handleAction));
  }

  function handleAction(event) {
    const id = event.currentTarget.dataset.id;
    const action = event.currentTarget.dataset.action;
    if (action === 'equip') {
      toggleEquip(id);
    } else if (action === 'sell') {
      sellItem(id);
    }
  }

  function toggleEquip(id) {
    nova.state.inventory = nova.state.inventory.map((item) => item.id === id ? { ...item, equipped: !item.equipped } : item);
    Store.saveState('inventory', nova.state.inventory);
    renderInventory();
    Nova.bus.emit('inventory:change', nova.state.inventory);
    nova.renderAll();
    UI.showToast('Inventārs atjaunots', 'info');
  }

  function sellItem(id) {
    const item = nova.state.inventory.find((it) => it.id === id);
    if (!item) return;
    const taxRate = Admin.getTaxRate ? Admin.getTaxRate() : 0.05;
    const payout = item.value * (1 - taxRate);
    nova.state.inventory = nova.state.inventory.filter((it) => it.id !== id);
    Store.saveState('inventory', nova.state.inventory);
    nova.adjustWallet(payout, { type: 'sell', item: item.title });
    UI.showToast(`Pārdevām ${item.title} par ${nova.formatCurrency(payout)}`, 'success');
    nova.bus.emit('inventory:change', nova.state.inventory);
    nova.renderAll();
    renderInventory();
  }

  function getBoost(game) {
    const equipped = nova.state.inventory.filter((item) => item.equipped);
    return equipped.reduce((acc, item) => {
      const matches = item.tags
        .filter((tag) => tag.startsWith('boost:'))
        .map((tag) => {
          const [_, target, value] = tag.split(':');
          return { target, value: parseFloat(value.replace('+', '')) };
        });
      const bonus = matches.filter((m) => m.target === game).reduce((sum, m) => sum + m.value, 0);
      return acc + bonus;
    }, 0);
  }

  function render(app) {
    renderInventory();
  }

  Nova.registerModule('inventory', { init, render });

  return { getBoost, render: renderInventory };
})();
