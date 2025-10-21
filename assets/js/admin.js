(function () {
  window.NS = window.NS || {};

  const featuredList = document.getElementById("admin-featured");
  const announcementForm = document.getElementById("admin-announcement");
  const promoForm = document.getElementById("admin-promo");
  const promoList = document.getElementById("admin-promo-list");
  const taxSlider = document.getElementById("admin-tax");
  const statsGrid = document.getElementById("admin-stats");
  const announcementTicker = document.getElementById("announcement-ticker");

  function renderFeatured() {
    const offers = NS.store.getOffers();
    featuredList.innerHTML = "";
    offers.forEach((offer) => {
      const row = document.createElement("div");
      row.className = "stack";
      row.innerHTML = `
        <label style="display:flex;justify-content:space-between;align-items:center;">
          <span>${offer.title}</span>
          <input type="checkbox" ${offer.featured ? "checked" : ""} data-id="${offer.id}" />
        </label>
      `;
      row.querySelector("input").addEventListener("change", (e) => {
        const updated = offers.map((o) => (o.id === offer.id ? { ...o, featured: e.target.checked } : o));
        NS.store.setOffers(updated);
      });
      featuredList.appendChild(row);
    });
  }

  function renderPromos() {
    const promos = NS.store.getPromos();
    promoList.innerHTML = "";
    promos.forEach((promo) => {
      const div = document.createElement("div");
      div.textContent = `${promo.code} → ${promo.effect} ${promo.value}`;
      promoList.appendChild(div);
    });
  }

  function renderStats() {
    const econ = NS.store.getEconomy();
    statsGrid.innerHTML = `
      <span>Kopējās iemaksas: ${NS.ui.formatEUR(econ.totalDeposits)}</span>
      <span>Kazino uzvaras: ${NS.ui.formatEUR(econ.totalWins)}</span>
      <span>Kazino zaudējumi: ${NS.ui.formatEUR(econ.totalLosses)}</span>
      <span>Pārdošanas: ${econ.totalSales}</span>
      <span>Aktīvie lietotāji: ${econ.activeUsers}</span>
    `;
  }

  function initAnnouncement() {
    announcementTicker.textContent = NS.store.getAnnouncements();
    announcementForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const formData = new FormData(announcementForm);
      const text = formData.get("announcement");
      if (!text) return;
      NS.store.setAnnouncement(text);
      announcementTicker.textContent = text;
      announcementForm.reset();
      NS.ui.toast("Paziņojums publicēts");
    });
    NS.events.on("announcement:update", (text) => {
      announcementTicker.textContent = text;
    });
  }

  function initPromos() {
    promoForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const formData = new FormData(promoForm);
      const promo = {
        code: String(formData.get("code")).toUpperCase(),
        effect: formData.get("effect"),
        value: Number(formData.get("value"))
      };
      const list = NS.store.getPromos();
      const exists = list.find((p) => p.code === promo.code);
      let updated;
      if (exists) {
        updated = list.map((p) => (p.code === promo.code ? promo : p));
      } else {
        updated = [...list, promo];
      }
      NS.store.setPromos(updated);
      promoForm.reset();
    });
    NS.events.on("promo:update", renderPromos);
    renderPromos();
  }

  function initTax() {
    taxSlider.value = NS.store.getTax();
    taxSlider.addEventListener("input", () => {
      const value = Number(taxSlider.value);
      NS.store.setTax(value);
      NS.ui.toast(`Nodoklis ${value}%`);
    });
  }

  NS.events.on("tax:update", (value) => {
    taxSlider.value = value;
  });

  NS.events.on("economy:update", renderStats);

  NS.admin = {
    init() {
      renderFeatured();
      renderStats();
      initAnnouncement();
      initPromos();
      initTax();
      NS.events.on("offers:update", renderFeatured);
    }
  };
})();
