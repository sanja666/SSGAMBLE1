(function () {
  window.NS = window.NS || {};

  const STORAGE_KEY = "novasphere-state";
  const DB_NAME = "novasphere-db";
  const DB_STORE = "state";

  const clone = (value) => {
    if (typeof structuredClone === "function") return structuredClone(value);
    return JSON.parse(JSON.stringify(value));
  };

  const defaultState = () => ({
    walletBalance: 100,
    userProfile: {
      id: "u1",
      role: "pircējs",
      name: "Demo Lietotājs",
      avatar: "assets/img/avatars/avatar1.svg",
      level: 1,
      xp: 0,
      luckIndex: 0,
      language: "lv"
    },
    inventory: [
      { id: "it1", title: "Zelta Kauliņš", rarity: "Epic", img: "assets/img/items/gold-dice.svg", value: 50, equipped: false, tags: ["boost:dice:+5%"] },
      { id: "it2", title: "Veiksmīgā Monēta", rarity: "Rare", img: "assets/img/items/lucky-coin.svg", value: 30, equipped: true, tags: ["boost:roulette:+1%"] }
    ],
    offers: getSeedOffers(),
    adsMine: [
      { id: "ad1", title: "Monitors 27”", price: 25, img: "assets/img/market/monitor.svg", desc: "144Hz, kā jauns", status: "active", cat: "Tehnika" },
      { id: "ad2", title: "Neona plāksne", price: 18, img: "assets/img/market/neon.svg", desc: "Spilgta gaisma", status: "paused", cat: "Birojs" }
    ],
    transactions: [
      { ts: Date.now() - 86400000, type: "deposit", amount: 20, method: "card", meta: "**** 0000 (mock)" },
      { ts: Date.now() - 84200000, type: "buy", amount: -48, title: "Velosipēds Gravel", counterparty: "City Ride" },
      { ts: Date.now() - 80000000, type: "win", amount: 30, game: "roulette", meta: "red" }
    ],
    gameHistory: [
      { ts: Date.now() - 79000000, game: "roulette", bet: 5, result: "17", payout: 0 },
      { ts: Date.now() - 78000000, game: "coinflip", bet: 2, result: "HEADS", payout: 4 }
    ],
    chatLog: [
      { ts: Date.now() - 3600000, user: "Sistēma", text: "Milena uzvarēja 120 €!" },
      { ts: Date.now() - 3000000, user: "NovaBot", text: "Vai zināji, ka neons nekad neizdziest?!" },
      { ts: Date.now() - 1800000, user: "Armands", text: "Sveiciens no tirgus malas." },
      { ts: Date.now() - 600000, user: "NovaBot", text: "Ja redzi īpašu piedāvājumu, satver to pirms tas izgaist!" }
    ],
    settings: { sfx: true, music: false, theme: "dark", lang: "lv", muteBot: false },
    achievements: [
      { id: "ach1", name: "Pirmais Pirkums", earned: true },
      { id: "ach2", name: "Sarkanā Sērija", earned: false },
      { id: "ach3", name: "High Roller", earned: false }
    ],
    promos: [],
    tax: 1,
    economy: {
      totalDeposits: 120,
      totalWins: 180,
      totalLosses: 150,
      totalSales: 5,
      activeUsers: 42
    },
    announcements: "Sveicināts NovaSphere!"
  });

  function getSeedOffers() {
    return [
      { id: "of1", cat: "Tehnika", title: "Spēļu Klēpjdators", price: 65, img: "assets/img/market/laptop.svg", desc: "RTX, 16GB, SSD", seller: "NovaStore", rarity: "Epic", featured: true, qty: 3 },
      { id: "of2", cat: "Auto", title: "Velosipēds Gravel", price: 48, img: "assets/img/market/bike.svg", desc: "Ātrs un ērts", seller: "City Ride", rarity: "Rare", featured: false, qty: 5 },
      { id: "of3", cat: "Nekustamie īpašumi", title: "Mini Birojs", price: 120, img: "assets/img/market/office.svg", desc: "Prestige + XP bonuss", seller: "NovaEstate", rarity: "Legendary", featured: true, qty: 1 },
      { id: "of4", cat: "Tehnika", title: "VR Komplektācija", price: 85, img: "assets/img/market/vr.svg", desc: "Pilna immersija", seller: "NovaTech", rarity: "Epic", featured: true, qty: 2 },
      { id: "of5", cat: "Tehnika", title: "Studijas Kamera", price: 52, img: "assets/img/market/camera.svg", desc: "4K kadri", seller: "VisionLab", rarity: "Rare", featured: false, qty: 4 },
      { id: "of6", cat: "Tehnika", title: "Audio komplekts", price: 42, img: "assets/img/market/headset.svg", desc: "360° skaņa", seller: "SoundWay", rarity: "Rare", featured: false, qty: 6 },
      { id: "of7", cat: "Tehnika", title: "Drone Explorer", price: 95, img: "assets/img/market/drone.svg", desc: "4k debesis", seller: "AirNova", rarity: "Epic", featured: false, qty: 2 },
      { id: "of8", cat: "Birojs", title: "Ergonomiskā Krēsls", price: 58, img: "assets/img/market/chair.svg", desc: "Atbalsts mugurai", seller: "NovaOffice", rarity: "Rare", featured: false, qty: 5 },
      { id: "of9", cat: "Tehnika", title: "Neona Tastatūra", price: 28, img: "assets/img/market/keyboard.svg", desc: "RGB gaismas", seller: "KeySphere", rarity: "Common", featured: false, qty: 8 },
      { id: "of10", cat: "Kolekcijas", title: "Neona Plāksne", price: 30, img: "assets/img/market/neon.svg", desc: "Mirdzošs dekors", seller: "Gaismu Klubs", rarity: "Rare", featured: true, qty: 7 }
    ];
  }

  let db;

  function openDb() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1);
      req.onerror = () => reject(req.error);
      req.onupgradeneeded = () => {
        const database = req.result;
        if (!database.objectStoreNames.contains(DB_STORE)) {
          database.createObjectStore(DB_STORE);
        }
      };
      req.onsuccess = () => {
        db = req.result;
        resolve(db);
      };
    });
  }

  function saveToDb(state) {
    if (!db) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(DB_STORE, "readwrite");
      tx.objectStore(DB_STORE).put(state, "snapshot");
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async function loadFromDb() {
    if (!db) return null;
    return new Promise((resolve, reject) => {
      const tx = db.transaction(DB_STORE, "readonly");
      const req = tx.objectStore(DB_STORE).get("snapshot");
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  const events = (() => {
    const listeners = new Map();
    return {
      on(event, handler) {
        if (!listeners.has(event)) listeners.set(event, new Set());
        listeners.get(event).add(handler);
      },
      off(event, handler) {
        listeners.get(event)?.delete(handler);
      },
      emit(event, payload) {
        listeners.get(event)?.forEach((handler) => {
          try { handler(payload); } catch (err) { console.error(err); }
        });
      }
    };
  })();

  NS.events = events;

  let state = null;

  NS.store = {
    async init() {
      await openDb().catch(() => {});
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          state = JSON.parse(saved);
        } catch (err) {
          console.warn("Invalid saved state, resetting", err);
        }
      }
      if (!state) {
        const dbState = await loadFromDb().catch(() => null);
        state = dbState || defaultState();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        saveToDb(state);
      }
      NS.events.emit("store:ready", state);
      return state;
    },
    getState() {
      if (!state) state = defaultState();
      return state;
    },
    setState(nextState) {
      state = clone(nextState);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      saveToDb(state);
      NS.events.emit("state:update", state);
    },
    reset() {
      state = defaultState();
      this.setState(state);
      NS.events.emit("state:reset", state);
    },
    getProfile() {
      return this.getState().userProfile;
    },
    setProfile(profile) {
      const current = this.getState();
      current.userProfile = profile;
      this.setState(current);
      NS.events.emit("profile:update", profile);
    },
    getSettings() {
      return this.getState().settings;
    },
    setSettings(settings) {
      const current = this.getState();
      current.settings = settings;
      this.setState(current);
    },
    getWallet() {
      return this.getState().walletBalance;
    },
    setWallet(balance) {
      const current = this.getState();
      current.walletBalance = Number(balance.toFixed(2));
      this.setState(current);
      NS.events.emit("wallet:update", { balance: current.walletBalance });
    },
    pushTransaction(txn) {
      const current = this.getState();
      current.transactions.unshift(txn);
      this.setState(current);
      NS.events.emit("txn:new", txn);
    },
    pushGameHistory(entry) {
      const current = this.getState();
      current.gameHistory.unshift(entry);
      current.gameHistory = current.gameHistory.slice(0, 200);
      this.setState(current);
      NS.events.emit("game:result", entry);
    },
    getGameHistory() {
      return this.getState().gameHistory;
    },
    getTransactions() {
      return this.getState().transactions;
    },
    getInventory() {
      return this.getState().inventory;
    },
    setInventory(items) {
      const current = this.getState();
      current.inventory = items;
      this.setState(current);
      NS.events.emit("inventory:update", items);
    },
    getOffers() {
      return this.getState().offers;
    },
    setOffers(offers) {
      const current = this.getState();
      current.offers = offers;
      this.setState(current);
      NS.events.emit("offers:update", offers);
    },
    getAds() {
      return this.getState().adsMine;
    },
    setAds(ads) {
      const current = this.getState();
      current.adsMine = ads;
      this.setState(current);
      NS.events.emit("ads:update", ads);
    },
    getChat() {
      return this.getState().chatLog;
    },
    pushChat(entry) {
      const current = this.getState();
      current.chatLog.push(entry);
      if (current.chatLog.length > 500) current.chatLog.shift();
      this.setState(current);
      NS.events.emit("chat:post", entry);
    },
    getAchievements() {
      return this.getState().achievements;
    },
    setAchievements(list) {
      const current = this.getState();
      current.achievements = list;
      this.setState(current);
      NS.events.emit("achievements:update", list);
    },
    getPromos() {
      return this.getState().promos || [];
    },
    setPromos(promos) {
      const current = this.getState();
      current.promos = promos;
      this.setState(current);
      NS.events.emit("promo:update", promos);
    },
    getTax() {
      return this.getState().tax || 0;
    },
    setTax(tax) {
      const current = this.getState();
      current.tax = tax;
      this.setState(current);
      NS.events.emit("tax:update", tax);
    },
    getEconomy() {
      return this.getState().economy;
    },
    setEconomy(economy) {
      const current = this.getState();
      current.economy = economy;
      this.setState(current);
      NS.events.emit("economy:update", economy);
    },
    getAnnouncements() {
      return this.getState().announcements;
    },
    setAnnouncement(text) {
      const current = this.getState();
      current.announcements = text;
      this.setState(current);
      NS.events.emit("announcement:update", text);
    }
  };
})();
