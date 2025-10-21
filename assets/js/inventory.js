(function () {
  window.NS = window.NS || {};

  const grid = document.getElementById("inventory-grid");

  function renderInventory() {
    const items = NS.store.getInventory();
    grid.innerHTML = "";
    items.forEach((item) => {
      const card = document.createElement("div");
      card.className = "inventory-card card";
      card.innerHTML = `
        <img src="${item.img}" alt="${item.title}" loading="lazy" />
        <div class="tag">${item.rarity}</div>
        <h3>${item.title}</h3>
        <p>${item.tags.join(", ")}</p>
        <div class="price">${NS.ui.formatEUR(item.value)}</div>
      `;
      const actions = document.createElement("div");
      actions.className = "stack";
      const equip = document.createElement("button");
      equip.className = "btn ghost";
      equip.textContent = item.equipped ? "Noņemt" : "Aprīkot";
      equip.addEventListener("click", () => toggleEquip(item.id));
      const sell = document.createElement("button");
      sell.className = "btn ghost";
      sell.textContent = "Pārdot";
      sell.addEventListener("click", () => sellItem(item.id));
      actions.append(equip, sell);
      card.appendChild(actions);
      grid.appendChild(card);
    });
  }

  function toggleEquip(id) {
    const items = NS.store.getInventory().map((item) =>
      item.id === id ? { ...item, equipped: !item.equipped } : item
    );
    NS.store.setInventory(items);
    const profile = { ...NS.store.getProfile(), luckIndex: calcLuck(items) };
    NS.store.setProfile(profile);
  }

  function calcLuck(items) {
    return items.filter((i) => i.equipped).length * 0.5;
  }

  function sellItem(id) {
    const items = NS.store.getInventory();
    const target = items.find((it) => it.id === id);
    if (!target) return;
    const taxRate = NS.store.getTax() / 100;
    const payout = target.value * (1 - taxRate);
    NS.wallet.credit(payout);
    NS.store.setInventory(items.filter((it) => it.id !== id));
    NS.store.pushTransaction({ ts: Date.now(), type: "sell", amount: payout, title: target.title });
    NS.ui.toast(`Saņemti ${NS.ui.formatEUR(payout)} par ${target.title}`);
  }

  NS.inventory = {
    init() {
      renderInventory();
      NS.events.on("inventory:update", renderInventory);
    },
    getBoostsFor(game) {
      return NS.store
        .getInventory()
        .filter((item) => item.equipped)
        .flatMap((item) => item.tags)
        .map((tag) => tag.split(":"))
        .filter(([type, target]) => type === "boost" && target === game)
        .map((parts) => parts[2]);
    }
  };
})();
