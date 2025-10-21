(function () {
  window.NS = window.NS || {};

  function updateWalletDisplay(balance) {
    const el = document.getElementById("wallet-balance");
    if (el) {
      el.textContent = NS.ui.formatEUR(balance);
    }
  }

  function addFundsModal() {
    const body = document.createElement("div");
    body.className = "stack";
    body.innerHTML = `
      <p>Šī ir simulācija mācību nolūkiem. Kartes dati netiek sūtīti vai glabāti ārpus šīs ierīces.</p>
      <label>Summa
        <div class="stack options">
          <div class="amount-options">
            <button type="button" data-amount="5" class="btn ghost">5 €</button>
            <button type="button" data-amount="10" class="btn ghost">10 €</button>
            <button type="button" data-amount="20" class="btn ghost">20 €</button>
          </div>
          <input type="number" min="1" step="1" placeholder="Custom" id="deposit-custom" />
        </div>
      </label>
      <label>Kartes numurs
        <input type="text" inputmode="numeric" maxlength="19" placeholder="0000 0000 0000 0000" />
      </label>
      <div class="form-inline">
        <label>Derīguma termiņš
          <input type="text" inputmode="numeric" maxlength="5" placeholder="MM/YY" />
        </label>
        <label>CVC
          <input type="text" inputmode="numeric" maxlength="3" placeholder="000" />
        </label>
      </div>
    `;
    let selectedAmount = 10;
    body.querySelectorAll("button[data-amount]").forEach((btn) => {
      btn.addEventListener("click", () => {
        selectedAmount = Number(btn.dataset.amount);
        body.querySelectorAll("button[data-amount]").forEach((other) => other.classList.remove("active"));
        btn.classList.add("active");
      });
    });
    const customInput = body.querySelector("#deposit-custom");
    customInput.addEventListener("input", () => {
      selectedAmount = Number(customInput.value) || selectedAmount;
    });

    const submit = document.createElement("button");
    submit.className = "btn primary";
    submit.textContent = "Apstiprināt";
    submit.addEventListener("click", () => processDeposit(selectedAmount));

    NS.ui.openModal({
      title: "Mock Bankas Karte",
      body,
      actions: [submit]
    });
  }

  function processDeposit(amount) {
    amount = Number(amount) || 0;
    if (amount <= 0) {
      NS.ui.toast("Izvēlies summu", { timeout: 2000 });
      return;
    }
    const notice = document.createElement("div");
    notice.textContent = NS.i18n.t("processing");
    NS.ui.openModal({
      title: "Mock Bankas Karte",
      body: notice,
      actions: []
    });
    setTimeout(() => {
      const balance = NS.store.getWallet();
      const next = balance + amount;
      NS.store.setWallet(next);
      NS.store.pushTransaction({ ts: Date.now(), type: "deposit", amount, method: "card", meta: "**** 0000 (mock)" });
      NS.ui.toast(NS.i18n.t("depositSuccess", amount));
      NS.ui.closeModal();
    }, 2000 + Math.random() * 800);
  }

  NS.wallet = {
    init() {
      updateWalletDisplay(NS.store.getWallet());
      document.getElementById("btn-add-funds").addEventListener("click", addFundsModal);
      NS.events.on("wallet:update", ({ balance }) => updateWalletDisplay(balance));
      document.getElementById("btn-inventory").addEventListener("click", () => {
        NS.events.emit("view:change", { view: "inventory" });
      });
    },
    spend(amount) {
      const current = NS.store.getWallet();
      if (current < amount) return false;
      NS.store.setWallet(current - amount);
      return true;
    },
    credit(amount) {
      const current = NS.store.getWallet();
      NS.store.setWallet(current + amount);
    }
  };
})();
