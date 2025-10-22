const DemoSeed = (() => {
  function nowOffset(offset) {
    return Date.now() - offset;
  }

  function getSeed() {
    const walletBalance = 100;
    const userProfile = {
      id: 'u1',
      role: 'pircējs',
      name: 'Demo Lietotājs',
      avatar: 'assets/img/avatar/avatar1.svg',
      level: 1,
      xp: 0,
      luckIndex: 0,
      language: 'lv'
    };

    const inventory = [
      { id: 'it1', title: 'Zelta Kauliņš', rarity: 'Epic', img: 'assets/img/items/gold-dice.svg', value: 50, equipped: false, tags: ['boost:dice:+5'] },
      { id: 'it2', title: 'Veiksmīgā Monēta', rarity: 'Rare', img: 'assets/img/items/lucky-coin.svg', value: 30, equipped: true, tags: ['boost:roulette:+1'] },
      { id: 'it3', title: 'Plazmas Karte', rarity: 'Common', img: 'assets/img/items/plasma-card.svg', value: 18, equipped: false, tags: ['boost:crash:+2'] }
    ];

    const offers = [
      { id: 'of1', cat: 'Tehnika', title: 'Spēļu Klēpjdators', price: 65, img: 'assets/img/market/laptop.svg', desc: 'RTX, 16GB, SSD', seller: 'NovaStore', rarity: 'Epic', featured: true, qty: 3 },
      { id: 'of2', cat: 'Auto', title: 'Velosipēds Gravel', price: 48, img: 'assets/img/market/bike.svg', desc: 'Ātrs un ērts', seller: 'City Ride', rarity: 'Rare', featured: false, qty: 5 },
      { id: 'of3', cat: 'Nekustamie īpašumi', title: 'Mini Birojs', price: 120, img: 'assets/img/market/office.svg', desc: 'Prestige + XP bonuss', seller: 'NovaEstate', rarity: 'Legendary', featured: true, qty: 1 },
      { id: 'of4', cat: 'Tehnika', title: 'Holosistēma', price: 85, img: 'assets/img/market/vr.svg', desc: 'Immersive komplekts', seller: 'HoloMax', rarity: 'Epic', featured: false, qty: 2 },
      { id: 'of5', cat: 'Tehnika', title: 'Pro Drona komplekts', price: 72, img: 'assets/img/market/drone.svg', desc: '4K stabilizācija', seller: 'SkyWave', rarity: 'Epic', featured: false, qty: 4 },
      { id: 'of6', cat: 'Tehnika', title: 'Studijas Monitors', price: 25, img: 'assets/img/market/monitor.svg', desc: '144Hz, kā jauns', seller: 'DisplayHub', rarity: 'Rare', featured: false, qty: 6 },
      { id: 'of7', cat: 'Birojs', title: 'Ergo Krēsls', price: 32, img: 'assets/img/market/chair.svg', desc: 'Mugurai draudzīgs', seller: 'NovaOffice', rarity: 'Common', featured: false, qty: 8 },
      { id: 'of8', cat: 'Kolekcijas', title: 'Neona Māksla', price: 44, img: 'assets/img/market/art.svg', desc: 'Digitāla glezna', seller: 'NovaArt', rarity: 'Rare', featured: false, qty: 5 },
      { id: 'of9', cat: 'Tehnika', title: 'Hroma Kolonna', price: 38, img: 'assets/img/market/speaker.svg', desc: '360° skaņa', seller: 'AudioLab', rarity: 'Rare', featured: true, qty: 4 },
      { id: 'of10', cat: 'Kolekcijas', title: 'Laika Skatītājs', price: 52, img: 'assets/img/market/watch.svg', desc: 'Hronogrāfs ar XP', seller: 'ChronoCore', rarity: 'Epic', featured: false, qty: 2 },
      { id: 'of11', cat: 'Auto', title: 'Nova Kartings', price: 110, img: 'assets/img/market/car.svg', desc: 'Elektrisks kartings', seller: 'NovaDrive', rarity: 'Legendary', featured: true, qty: 1 },
      { id: 'of12', cat: 'Tehnika', title: 'Mājas Konsole', price: 58, img: 'assets/img/market/console.svg', desc: 'Next-Gen spēles', seller: 'NovaPlay', rarity: 'Epic', featured: false, qty: 3 }
    ];

    const adsMine = [
      { id: 'ad1', title: 'Monitors 27"', price: 25, img: 'assets/img/market/monitor.svg', desc: '144Hz, kā jauns', status: 'active', cat: 'Tehnika' },
      { id: 'ad2', title: 'NovaSpeakers pāris', price: 34, img: 'assets/img/market/speaker.svg', desc: 'Kluba bass', status: 'paused', cat: 'Tehnika' }
    ];

    const transactions = [
      { ts: nowOffset(600000), type: 'deposit', amount: 20, method: 'card', meta: '**** 0000 (mock)' },
      { ts: nowOffset(420000), type: 'buy', amount: -48, title: 'Velosipēds Gravel', counterparty: 'City Ride' },
      { ts: nowOffset(360000), type: 'win', amount: 30, game: 'roulette', meta: 'sarkans' }
    ];

    const gameHistory = [
      { ts: nowOffset(300000), game: 'roulette', bet: 5, result: '17', payout: 0 },
      { ts: nowOffset(240000), game: 'coinflip', bet: 2, result: 'Galvas', payout: 4 }
    ];

    const chatLog = [
      { ts: nowOffset(180000), user: 'Sistēma', avatar: 'assets/img/avatar/avatar1.svg', text: 'Milena uzvarēja 120 €!' },
      { ts: nowOffset(140000), user: 'NovaBot', avatar: 'assets/img/avatar/novabot.svg', text: 'Vai zināji, ka neons nekad neizdziest?!' },
      { ts: nowOffset(120000), user: 'City Ride', avatar: 'assets/img/avatar/avatar2.svg', text: 'Sveiciens visiem no tirgus zonas.' },
      { ts: nowOffset(100000), user: 'NovaBot', avatar: 'assets/img/avatar/novabot.svg', text: 'Ja redzi crash līniju, uzticies intuīcijai!' }
    ];

    const settings = { sfx: true, music: false, theme: 'dark', lang: 'lv', muteBot: false, taxRate: 0.05 };

    const achievements = [
      { id: 'ach1', name: 'Pirmais Pirkums', earned: true },
      { id: 'ach2', name: 'Sarkanā Sērija', earned: false },
      { id: 'ach3', name: 'Coin Flip meistars', earned: false }
    ];

    return {
      state: {
        walletBalance,
        userProfile,
        inventory,
        offers,
        adsMine,
        gameHistory,
        chatLog,
        settings,
        achievements,
        promoCodes: [
          { code: 'NOVASPHERE10', type: 'credit', value: 10, active: true },
          { code: 'LUCKY5', type: 'discount', value: 0.1, active: true }
        ],
        announcements: [
          { id: 'ann1', text: 'Sveicināti NovaSphere! Neonīgās akcijas tikai šonedēļ.' }
        ]
      },
      transactions,
      chat: chatLog
    };
  }

  return { getSeed };
})();
