const Nova = (() => {
  class PubSub {
    constructor() {
      this.listeners = {};
    }
    on(event, handler) {
      if (!this.listeners[event]) this.listeners[event] = new Set();
      this.listeners[event].add(handler);
      return () => this.off(event, handler);
    }
    off(event, handler) {
      if (this.listeners[event]) {
        this.listeners[event].delete(handler);
      }
    }
    emit(event, payload) {
      if (!this.listeners[event]) return;
      this.listeners[event].forEach((handler) => {
        try {
          handler(payload);
        } catch (error) {
          console.error('Event handler failed', event, error);
        }
      });
    }
  }

  const bus = new PubSub();
  const modules = new Map();

  const demoUsers = {
    pardavejs: { password: 'Nova-Admin-123', role: 'pārdevējs', name: 'Nova Pārdevējs', avatar: 'assets/img/avatar/avatar2.svg' },
    pircejs: { password: 'Nova-User-123', role: 'pircējs', name: 'Demo Lietotājs', avatar: 'assets/img/avatar/avatar1.svg' }
  };

  const state = {
    walletBalance: 0,
    userProfile: null,
    inventory: [],
    offers: [],
    adsMine: [],
    gameHistory: [],
    chatLog: [],
    settings: {},
    achievements: [],
    promoCodes: [],
    announcements: []
  };

  const elements = {};
  let currentView = 'kazino';
  let ready = false;

  function registerModule(name, mod) {
    modules.set(name, mod);
    if (ready && typeof mod.init === 'function') {
      mod.init(Nova);
    }
  }

  function formatCurrency(amount) {
    return new Intl.NumberFormat(I18n.lang === 'en' ? 'en-GB' : 'lv-LV', { style: 'currency', currency: 'EUR' }).format(amount);
  }

  function loadState() {
    state.walletBalance = Store.loadState('walletBalance', 100);
    state.userProfile = Store.loadState('userProfile', null);
    state.inventory = Store.loadState('inventory', []);
    state.offers = Store.loadState('offers', []);
    state.adsMine = Store.loadState('adsMine', []);
    state.gameHistory = Store.loadState('gameHistory', []);
    state.chatLog = Store.loadState('chatLog', []);
    state.settings = Store.loadState('settings', { sfx: true, music: false, theme: 'dark', lang: I18n.lang, muteBot: false, taxRate: 0.05 });
    state.achievements = Store.loadState('achievements', []);
    state.promoCodes = Store.loadState('promoCodes', []);
    state.announcements = Store.loadState('announcements', []);
    if (state.settings.lang) {
      I18n.setLanguage(state.settings.lang);
    }
    applyTheme(state.settings.theme || 'dark');
  }

  function persist(key) {
    Store.saveState(key, state[key]);
  }

  function setWallet(amount) {
    state.walletBalance = Number(amount.toFixed(2));
    persist('walletBalance');
    updateWalletBadge();
    bus.emit('wallet:update', { balance: state.walletBalance });
  }

  function adjustWallet(delta, meta = {}) {
    setWallet(Math.max(0, state.walletBalance + delta));
    const tx = Object.assign({ ts: Date.now(), amount: Number(delta.toFixed(2)) }, meta);
    Store.putTx(tx);
    bus.emit('txn:new', tx);
  }

  function updateWalletBadge() {
    if (!elements.walletBadge) return;
    elements.walletBadge.textContent = `${I18n.t('wallet')} : ${formatCurrency(state.walletBalance)}`;
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
  }

  function showView(view) {
    currentView = view;
    document.querySelectorAll('.side-nav button').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.view === view);
    });
    document.querySelectorAll('.view').forEach((section) => {
      section.classList.toggle('active', section.id === `view-${view}`);
    });
    bus.emit('view:change', view);
  }

  function login(username, password) {
    const user = demoUsers[username];
    if (!user || user.password !== password) {
      UI.showToast('Nepareizi dati', 'error');
      return false;
    }
    const storedProfile = state.userProfile || {};
    const profile = {
      ...storedProfile,
      role: user.role,
      name: user.name,
      avatar: user.avatar
    };
    state.userProfile = profile;
    persist('userProfile');
    localStorage.setItem('novasphere-current-user', JSON.stringify({ username }));
    updateHeaderProfile();
    document.body.classList.remove('show-login');
    elements.appShell.classList.remove('hidden');
    elements.appShell.setAttribute('aria-hidden', 'false');
    elements.loginPanel.classList.add('hidden');
    elements.loginPanel.setAttribute('aria-hidden', 'true');
    updateAdminVisibility();
    bus.emit('profile:update', profile);
    Nova.renderAll();
    return true;
  }

  function logout() {
    localStorage.removeItem('novasphere-current-user');
    document.body.classList.add('show-login');
    elements.appShell.classList.add('hidden');
    elements.loginPanel.classList.remove('hidden');
    elements.appShell.setAttribute('aria-hidden', 'true');
    elements.loginPanel.setAttribute('aria-hidden', 'false');
  }

  function updateAdminVisibility() {
    if (!elements.adminNav) return;
    const role = state.userProfile?.role;
    elements.adminNav.classList.toggle('hidden', role !== 'pārdevējs');
  }

  function updateHeaderProfile() {
    if (!state.userProfile) return;
    elements.headerName.textContent = state.userProfile.name;
    elements.headerRole.textContent = state.userProfile.role;
    elements.headerAvatar.src = state.userProfile.avatar;
    elements.headerAvatar.alt = state.userProfile.name;
    updateAvatarAura();
  }

  function updateAvatarAura() {
    if (!elements.headerAvatar) return;
    const equipped = state.inventory.filter((item) => item.equipped);
    elements.headerAvatar.classList.toggle('aura', equipped.length > 0);
  }

  function bindUI() {
    elements.loginForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const username = elements.loginUser.value.trim();
      const password = elements.loginPass.value.trim();
      if (login(username, password)) {
        UI.showToast(`Sveiks, ${state.userProfile.name}!`, 'success');
      }
    });

    elements.logoutBtn.addEventListener('click', () => {
      logout();
    });

    document.querySelectorAll('.side-nav button').forEach((button) => {
      button.addEventListener('click', () => {
        showView(button.dataset.view);
      });
    });

    elements.inventoryShortcut.addEventListener('click', () => {
      showView('inventory');
    });

    elements.addFundsBtn.addEventListener('click', () => {
      Wallet.openDepositModal();
    });

    elements.languageSelect.addEventListener('change', (event) => {
      I18n.setLanguage(event.target.value);
      state.settings.lang = I18n.lang;
      persist('settings');
      updateWalletBadge();
      Nova.renderAll();
    });

    elements.sidebarCollapse.addEventListener('click', () => {
      elements.sidebar.classList.toggle('open');
      const open = elements.sidebar.classList.contains('open');
      elements.sidebarCollapse.textContent = open ? '➖' : '➕';
      elements.sidebarCollapse.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    elements.muteBot.addEventListener('change', () => {
      state.settings.muteBot = elements.muteBot.checked;
      persist('settings');
      Chat.setNovaBotMuted(state.settings.muteBot);
    });
  }

  function renderAnnouncements() {
    if (!elements.announcementLine || !elements.announcementTicker) return;
    if (state.announcements.length === 0) {
      elements.announcementLine.textContent = 'Sveicināti NovaSphere!';
      elements.announcementTicker.textContent = 'Aktīvi: 0';
      return;
    }
    const ticker = state.announcements.map((ann) => ann.text).join(' • ');
    elements.announcementLine.textContent = ticker;
    elements.announcementTicker.textContent = `Aktīvi: ${state.announcements.length}`;
  }

  function renderAll() {
    modules.forEach((mod) => {
      if (typeof mod.render === 'function') {
        mod.render(Nova);
      }
    });
    renderAnnouncements();
  }

  function boot() {
    elements.appShell = document.getElementById('appShell');
    elements.loginPanel = document.getElementById('loginPanel');
    elements.loginForm = document.getElementById('loginForm');
    elements.loginUser = document.getElementById('loginUser');
    elements.loginPass = document.getElementById('loginPass');
    elements.walletBadge = document.getElementById('walletBadge');
    elements.addFundsBtn = document.getElementById('addFundsBtn');
    elements.inventoryShortcut = document.getElementById('inventoryShortcut');
    elements.languageSelect = document.getElementById('languageSelect');
    elements.logoutBtn = document.getElementById('logoutBtn');
    elements.headerAvatar = document.getElementById('headerAvatar');
    elements.headerName = document.getElementById('headerName');
    elements.headerRole = document.getElementById('headerRole');
    elements.sidebar = document.getElementById('sidebar');
    elements.sidebarCollapse = document.getElementById('sidebarCollapse');
    elements.adminNav = document.getElementById('adminNav');
    elements.announcementTicker = document.getElementById('announcementTicker');
    elements.announcementLine = document.getElementById('announcementLine');
    elements.muteBot = document.getElementById('muteBot');

    bindUI();
    const storedLang = localStorage.getItem('novasphere-lang');
    if (storedLang) {
      elements.languageSelect.value = storedLang;
    }
    loadState();
    updateWalletBadge();
    elements.muteBot.checked = state.settings.muteBot;
    updateAvatarAura();

    const persistedUser = localStorage.getItem('novasphere-current-user');
    if (persistedUser) {
      const { username } = JSON.parse(persistedUser);
      const demo = demoUsers[username];
      if (demo) {
        login(username, demo.password);
      }
    }

    ready = true;
    modules.forEach((mod) => {
      if (typeof mod.init === 'function') {
        mod.init(Nova);
      }
    });
    renderAll();
    bus.on('inventory:change', updateAvatarAura);
  }

  function init() {
    Store.seedIfEmpty();
    document.addEventListener('DOMContentLoaded', boot);
  }

  function addToHistory(entry) {
    state.gameHistory.unshift(entry);
    state.gameHistory = state.gameHistory.slice(0, 120);
    persist('gameHistory');
    bus.emit('game:result', entry);
  }

  function addChatMessage(entry) {
    state.chatLog.push(entry);
    state.chatLog = state.chatLog.slice(-500);
    persist('chatLog');
    Store.putChat(entry);
    bus.emit('chat:post', entry);
  }

  function updateSettings(partial) {
    state.settings = { ...state.settings, ...partial };
    persist('settings');
    if (partial.theme) applyTheme(partial.theme);
    if (partial.lang) I18n.setLanguage(partial.lang);
  }

  function upsertAnnouncement(text) {
    const ann = { id: `ann-${Date.now()}`, text };
    state.announcements.push(ann);
    persist('announcements');
    renderAnnouncements();
    UI.showToast('Jauns paziņojums aktīvs', 'info');
  }

  function resetDemo() {
    localStorage.removeItem('novasphere-seeded');
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('novasphere')) return;
    });
    Store.seedIfEmpty();
    loadState();
    renderAll();
  }

  init();

  return {
    bus,
    state,
    registerModule,
    setWallet,
    adjustWallet,
    addToHistory,
    addChatMessage,
    renderAll,
    formatCurrency,
    showView,
    updateSettings,
    upsertAnnouncement,
    resetDemo
  };
})();
