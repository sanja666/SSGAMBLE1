(function () {
  const dictionaries = {
    lv: {
      loginTitle: "Pieslēgšanās",
      addFunds: "Pievienot līdzekļus",
      inventory: "Inventārs",
      logout: "Izrakstīties",
      processing: "Apstrāde...",
      depositSuccess: (amount) => `Iemaksa veiksmīga: +${amount.toFixed(2)} € (mock karte)`,
      purchaseSuccess: (title) => `Pirkums veiksmīgs: ${title}`,
      insufficient: "Nepietiek līdzekļu."
    },
    en: {
      loginTitle: "Login",
      addFunds: "Add Funds",
      inventory: "Inventory",
      logout: "Logout",
      processing: "Processing...",
      depositSuccess: (amount) => `Deposit successful: +${amount.toFixed(2)} € (mock card)`,
      purchaseSuccess: (title) => `Purchase complete: ${title}`,
      insufficient: "Insufficient balance."
    }
  };

  window.NS = window.NS || {};
  NS.i18n = {
    t(key, ...args) {
      const lang = NS.store?.getSettings().lang || "lv";
      const dict = dictionaries[lang] || dictionaries.lv;
      const value = dict[key];
      if (!value) return key;
      return typeof value === "function" ? value(...args) : value;
    },
    dictionaries,
    setLanguage(lang) {
      const settings = NS.store.getSettings();
      settings.lang = lang;
      NS.store.setSettings(settings);
      document.documentElement.lang = lang;
      NS.events.emit("i18n:change", { lang });
    }
  };
})();
