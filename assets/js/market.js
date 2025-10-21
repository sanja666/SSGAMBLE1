(function () {
  window.NS = window.NS || {};

  const featuredEl = document.getElementById("market-featured");
  const filtersForm = document.getElementById("market-filters");
  const gridEl = document.getElementById("market-grid");

  let inflation = 1;

  function renderCategories() {
    const select = filtersForm.querySelector('select[name="category"]');
    const offers = NS.store.getOffers();
    const cats = Array.from(new Set(offers.map((o) => o.cat)));
    select.innerHTML = '<option value="">Visas kategorijas</option>' + cats.map((cat) => `<option value="${cat}">${cat}</option>`).join("");
  }

  function applyFilters() {
    const data = new FormData(filtersForm);
    const query = String(data.get("search") || "").toLowerCase();
    const cat = data.get("category");
    const rarity = data.get("rarity");
    const min = Number(data.get("priceMin")) || 0;
    const max = Number(data.get("priceMax")) || Infinity;
    const offers = NS.store.getOffers().filter((offer) => {
      const price = offer.price * inflation;
      return (
        (!query || offer.title.toLowerCase().includes(query) || offer.desc.toLowerCase().includes(query)) &&
        (!cat || offer.cat === cat) &&
        (!rarity || offer.rarity === rarity) &&
        price >= min &&
        price <= max
      );
    });
    renderFeatured(offers.filter((o) => o.featured));
    renderGrid(offers);
  }

  function renderFeatured(offers) {
    featuredEl.innerHTML = "";
    if (!offers.length) {
      featuredEl.innerHTML = "<p>Nav izceltu piedāvājumu.</p>";
      return;
    }
    offers.forEach((offer) => {
      const card = createOfferCard(offer, true);
      featuredEl.appendChild(card);
    });
  }

  function renderGrid(offers) {
    gridEl.innerHTML = "";
    offers.forEach((offer) => {
      gridEl.appendChild(createOfferCard(offer));
    });
  }

  function createOfferCard(offer, compact = false) {
    const card = document.createElement("article");
    card.className = "market-card card";
    card.innerHTML = `
      <img src="${offer.img}" alt="${offer.title}" loading="lazy" />
      <div class="tag">${offer.rarity}</div>
      <h3>${offer.title}</h3>
      <p>${offer.desc}</p>
      <p class="price">${NS.ui.formatEUR(offer.price * inflation)}</p>
      <small>Pārdevējs: ${offer.seller}</small>
      <small>Pieejams: ${offer.qty}</small>
    `;
    const buy = document.createElement("button");
    buy.className = "btn primary";
    buy.textContent = "Pirkt";
    buy.disabled = offer.qty <= 0;
    buy.addEventListener("click", () => confirmPurchase(offer));
    card.appendChild(buy);
    return card;
  }

  function confirmPurchase(offer) {
    const price = Number((offer.price * inflation).toFixed(2));
    const balance = NS.store.getWallet();
    if (balance < price) {
      NS.ui.toast(NS.i18n.t("insufficient"));
      document.getElementById("btn-add-funds").click();
      return;
    }
    const body = document.createElement("div");
    body.innerHTML = `<p>Apstiprināt pirkumu: <strong>${offer.title}</strong> par ${NS.ui.formatEUR(price)}?</p>`;
    const confirm = document.createElement("button");
    confirm.className = "btn primary";
    confirm.textContent = "Pirkt";
    confirm.addEventListener("click", () => {
      NS.ui.closeModal();
      completePurchase(offer, price);
    });
    NS.ui.openModal({ title: "Pirkuma apstiprinājums", body, actions: [confirm] });
  }

  function completePurchase(offer, price) {
    if (!NS.wallet.spend(price)) {
      NS.ui.toast(NS.i18n.t("insufficient"));
      return;
    }
    const offers = NS.store.getOffers().map((item) =>
      item.id === offer.id ? { ...item, qty: Math.max(item.qty - 1, 0) } : item
    );
    NS.store.setOffers(offers);
    const inventory = NS.store.getInventory();
    const newItem = {
      id: `inv-${Date.now()}`,
      title: offer.title,
      rarity: offer.rarity,
      img: offer.img,
      value: price,
      equipped: false,
      tags: [`boost:roulette:+${Math.min(2, Math.random() * 2).toFixed(1)}%`]
    };
    NS.store.setInventory([...inventory, newItem]);
    NS.store.pushTransaction({ ts: Date.now(), type: "buy", amount: -price, title: offer.title, counterparty: offer.seller });
    NS.events.emit("market:buy", offer);
    NS.ui.toast(NS.i18n.t("purchaseSuccess", offer.title));
    NS.ui.particleBurst(gridEl, "#8f6dff");
    inflation = Math.min(inflation + 0.02, 1.2);
  }

  NS.market = {
    init() {
      renderCategories();
      applyFilters();
      const trigger = () => applyFilters();
      filtersForm.addEventListener("input", trigger);
      filtersForm.addEventListener("change", trigger);
      NS.events.on("offers:update", () => {
        renderCategories();
        applyFilters();
      });
      NS.events.on("wallet:update", ({ balance }) => {
        if (balance < 20) botReminder();
      });
    }
  };

  function botReminder() {
    NS.chat.botMessage("Atlikums sarūk! Varbūt laiks pārdot kādu priekšmetu?");
  }
})();
