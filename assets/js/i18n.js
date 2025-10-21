const I18n = (() => {
  const dictionary = {
    lv: {
      loginTitle: 'NovaSphere portāls',
      username: 'Lietotājvārds',
      password: 'Parole',
      login: 'Pieteikties',
      logout: 'Izrakstīties',
      casino: 'Kazino',
      marketplace: 'Tirgus',
      myAds: 'Sludinājumi',
      inventory: 'Inventārs',
      chat: 'Čats',
      admin: 'Pārdevējs',
      settings: 'Iestatījumi',
      addFunds: 'Pievienot līdzekļus',
      processing: 'Apstrāde...',
      depositSuccess: 'Iemaksa veiksmīga',
      buyConfirm: 'Apstiprināt pirkumu',
      cancel: 'Atcelt',
      confirm: 'Apstiprināt',
      save: 'Saglabāt',
      language: 'Valoda',
      theme: 'Tēma',
      sound: 'Skaņas',
      music: 'Mūzika',
      resetDemo: 'Atiestatīt datus',
      achievements: 'Sasniegumi',
      wallet: 'Maks',
      balance: 'Bilance'
    },
    en: {
      loginTitle: 'NovaSphere portal',
      username: 'Username',
      password: 'Password',
      login: 'Sign in',
      logout: 'Log out',
      casino: 'Casino',
      marketplace: 'Marketplace',
      myAds: 'My Ads',
      inventory: 'Inventory',
      chat: 'Chat',
      admin: 'Admin',
      settings: 'Settings',
      addFunds: 'Add funds',
      processing: 'Processing...',
      depositSuccess: 'Deposit successful',
      buyConfirm: 'Confirm purchase',
      cancel: 'Cancel',
      confirm: 'Confirm',
      save: 'Save',
      language: 'Language',
      theme: 'Theme',
      sound: 'Sound effects',
      music: 'Music',
      resetDemo: 'Reset demo data',
      achievements: 'Achievements',
      wallet: 'Wallet',
      balance: 'Balance'
    }
  };

  let currentLang = 'lv';

  function setLanguage(lang) {
    currentLang = dictionary[lang] ? lang : 'lv';
    document.documentElement.setAttribute('lang', currentLang);
    localStorage.setItem('novasphere-lang', currentLang);
    applyTranslations();
  }

  function applyTranslations() {
    const nodes = document.querySelectorAll('[data-i18n]');
    nodes.forEach((node) => {
      const key = node.getAttribute('data-i18n');
      const text = t(key);
      if (!text) return;
      if (node.hasAttribute('data-i18n-placeholder')) {
        node.setAttribute('placeholder', text);
      } else {
        node.textContent = text;
      }
    });
  }

  function t(key) {
    return dictionary[currentLang][key] || dictionary.lv[key] || key;
  }

  function init() {
    const stored = localStorage.getItem('novasphere-lang');
    if (stored) {
      currentLang = stored;
    }
    document.addEventListener('DOMContentLoaded', applyTranslations);
  }

  return { t, setLanguage, init, get lang() { return currentLang; } };
})();

I18n.init();
