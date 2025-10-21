(function () {
  const loginScreen = document.getElementById("login-screen");
  const loginForm = document.getElementById("login-form");
  const usernameInput = document.getElementById("login-username");
  const passwordInput = document.getElementById("login-password");
  const navButtons = document.querySelectorAll(".side-nav .nav-item");
  const profileName = document.getElementById("profile-name");
  const profileRole = document.getElementById("profile-role");
  const profileAvatar = document.getElementById("profile-avatar");
  const logoutBtn = document.getElementById("btn-logout");
  const langSwitch = document.getElementById("lang-switch");
  const settingsForm = document.getElementById("settings-form");
  const rightPanel = document.getElementById("right-panel");
  const toggleSidebarBtn = document.getElementById("toggle-sidebar");

  const views = {
    casino: document.getElementById("view-casino"),
    market: document.getElementById("view-market"),
    ads: document.getElementById("view-ads"),
    inventory: document.getElementById("view-inventory"),
    chat: document.getElementById("view-chat"),
    admin: document.getElementById("view-admin"),
    settings: document.getElementById("view-settings")
  };

  const demoUsers = {
    pardavejs: {
      password: "Nova-Admin-123",
      profile: {
        id: "u-admin",
        role: "pārdevējs",
        name: "Nova Pārdevējs",
        avatar: "assets/img/avatars/avatar2.svg",
        level: 7,
        xp: 680,
        luckIndex: 2.1,
        language: "lv"
      }
    },
    pircejs: {
      password: "Nova-User-123",
      profile: {
        id: "u1",
        role: "pircējs",
        name: "Demo Lietotājs",
        avatar: "assets/img/avatars/avatar1.svg",
        level: 3,
        xp: 120,
        luckIndex: 1.1,
        language: "lv"
      }
    }
  };

  let activeView = "casino";

  function init() {
    NS.store.init().then(() => {
      setupLogin();
      setupNavigation();
      setupSettings();
      setupLangSwitch();
      NS.wallet.init();
      NS.chat.init();
      NS.inventory.init();
      NS.ads.init();
      NS.market.init();
      NS.casino.init();
      NS.admin.init();
      restoreSession();
      renderProfile(NS.store.getProfile());
      NS.events.on("profile:update", renderProfile);
      NS.events.on("view:change", ({ view }) => switchView(view));
      toggleSidebarBtn.addEventListener("click", () => {
        rightPanel.classList.toggle("open");
      });
    });
  }

  function setupLogin() {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const username = usernameInput.value.trim();
      const password = passwordInput.value.trim();
      const record = demoUsers[username];
      if (record && record.password === password) {
        NS.store.setProfile({ ...NS.store.getProfile(), ...record.profile });
        localStorage.setItem("novasphere-user", username);
        loginScreen.classList.add("hidden");
        NS.ui.toast(`Sveiks, ${record.profile.name}!`);
        updateAdminVisibility(record.profile.role === "pārdevējs");
        switchView("casino");
      } else {
        NS.ui.toast("Nepareizi dati", { timeout: 2000 });
      }
    });

    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("novasphere-user");
      loginScreen.classList.remove("hidden");
    });
  }

  function restoreSession() {
    const userKey = localStorage.getItem("novasphere-user");
    if (userKey && demoUsers[userKey]) {
      const profile = demoUsers[userKey].profile;
      NS.store.setProfile({ ...NS.store.getProfile(), ...profile });
      loginScreen.classList.add("hidden");
      updateAdminVisibility(profile.role === "pārdevējs");
    }
  }

  function renderProfile(profile) {
    profileName.textContent = profile.name;
    profileRole.textContent = profile.role;
    profileAvatar.src = profile.avatar;
    updateAdminVisibility(profile.role === "pārdevējs");
    langSwitch.textContent = (NS.store.getSettings().lang || "lv").toUpperCase();
  }

  function setupNavigation() {
    navButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const view = btn.dataset.view;
        if (view === "admin" && NS.store.getProfile().role !== "pārdevējs") return;
        switchView(view);
      });
    });
  }

  function switchView(view) {
    if (!views[view]) return;
    Object.entries(views).forEach(([name, section]) => {
      section.classList.toggle("active", name === view);
    });
    navButtons.forEach((btn) => btn.classList.toggle("active", btn.dataset.view === view));
    activeView = view;
  }

  function updateAdminVisibility(isAdmin) {
    document.querySelectorAll(".admin-only").forEach((el) => {
      el.style.display = isAdmin ? "grid" : "none";
    });
    if (!isAdmin && activeView === "admin") {
      switchView("casino");
    }
  }

  function setupLangSwitch() {
    langSwitch.addEventListener("click", () => {
      const settings = NS.store.getSettings();
      const next = settings.lang === "lv" ? "en" : "lv";
      settings.lang = next;
      NS.store.setSettings(settings);
      langSwitch.textContent = next.toUpperCase();
      document.documentElement.lang = next;
    });
    NS.events.on("i18n:change", ({ lang }) => {
      langSwitch.textContent = lang.toUpperCase();
    });
  }

  function setupSettings() {
    let settings = { ...NS.store.getSettings() };
    settingsForm.language.value = settings.lang;
    settingsForm.sfx.checked = settings.sfx;
    settingsForm.music.checked = settings.music;
    settingsForm.theme.value = settings.theme;
    settingsForm.muteBot.checked = settings.muteBot || false;
    applyTheme(settings.theme);

    settingsForm.addEventListener("input", () => {
      const formData = new FormData(settingsForm);
      const next = {
        ...settings,
        lang: formData.get("language"),
        sfx: settingsForm.sfx.checked,
        music: settingsForm.music.checked,
        theme: formData.get("theme"),
        muteBot: settingsForm.muteBot.checked
      };
      NS.store.setSettings(next);
      applyTheme(next.theme);
      if (next.lang !== document.documentElement.lang) {
        NS.i18n.setLanguage(next.lang);
      }
      settings = next;
    });

    document.getElementById("btn-reset").addEventListener("click", () => {
      if (confirm("Vai tiešām?") && confirm("Apstiprini atiestatīšanu")) {
        NS.store.reset();
        location.reload();
      }
    });
  }

  function applyTheme(theme) {
    const root = document.documentElement;
    if (theme === "neon") {
      root.style.setProperty("--bg", "#050713");
      root.style.setProperty("--accent", "#00f5ff");
      root.style.setProperty("--accent-2", "#ff00ff");
    } else if (theme === "gold") {
      root.style.setProperty("--bg", "#120c07");
      root.style.setProperty("--accent", "#ffd56f");
      root.style.setProperty("--accent-2", "#ff9b4e");
    } else {
      root.style.setProperty("--bg", "#0b0e1c");
      root.style.setProperty("--accent", "#64d9ff");
      root.style.setProperty("--accent-2", "#8f6dff");
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
