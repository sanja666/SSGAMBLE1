const Store = (() => {
  const DB_NAME = 'novasphere-db';
  const DB_VERSION = 1;
  const TX_STORE = 'transactions';
  const CHAT_STORE = 'chatLog';
  const FALLBACK_TX_KEY = 'novasphere-fallback-transactions';
  const FALLBACK_CHAT_KEY = 'novasphere-fallback-chat';
  const hasIndexedDB = (() => {
    try {
      return typeof indexedDB !== 'undefined';
    } catch (error) {
      console.warn('indexedDB pieejams nav, izmantojam localStorage', error);
      return false;
    }
  })();
  let db;

  function openDB() {
    if (!hasIndexedDB) return Promise.resolve(null);
    return new Promise((resolve, reject) => {
      try {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = (event) => {
          const database = event.target.result;
          if (!database.objectStoreNames.contains(TX_STORE)) {
            database.createObjectStore(TX_STORE, { keyPath: 'ts' });
          }
          if (!database.objectStoreNames.contains(CHAT_STORE)) {
            database.createObjectStore(CHAT_STORE, { keyPath: 'ts' });
          }
        };
        request.onsuccess = () => {
          db = request.result;
          resolve(db);
        };
        request.onerror = () => reject(request.error);
      } catch (error) {
        console.warn('Neizdevās inicializēt indexedDB, izmantojam localStorage', error);
        resolve(null);
      }
    });
  }

  async function ensureDB() {
    if (!hasIndexedDB) return null;
    if (db) return db;
    return openDB();
  }

  function loadFallback(key, fallback = []) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : fallback;
    } catch (error) {
      console.warn('Neizdevās nolasīt fallback datus', key, error);
      return fallback;
    }
  }

  function saveFallback(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function loadState(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch (error) {
      console.warn('Failed to parse state', key, error);
      return fallback;
    }
  }

  function saveState(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  async function putTx(tx) {
    if (!hasIndexedDB) {
      const list = loadFallback(FALLBACK_TX_KEY, []);
      const next = list.filter((item) => item.ts !== tx.ts).concat(tx);
      saveFallback(FALLBACK_TX_KEY, next);
      return true;
    }
    const database = await ensureDB();
    if (!database) return true;
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(TX_STORE, 'readwrite');
      transaction.oncomplete = () => resolve(true);
      transaction.onerror = () => reject(transaction.error);
      transaction.objectStore(TX_STORE).put(tx);
    }).catch((error) => {
      console.warn('indexedDB rakstīšanas kļūda, izmantojam fallback', error);
      const list = loadFallback(FALLBACK_TX_KEY, []);
      const next = list.filter((item) => item.ts !== tx.ts).concat(tx);
      saveFallback(FALLBACK_TX_KEY, next);
      return true;
    });
  }

  async function getTransactions(limit = 200) {
    if (!hasIndexedDB) {
      return loadFallback(FALLBACK_TX_KEY, [])
        .sort((a, b) => b.ts - a.ts)
        .slice(0, limit);
    }
    const database = await ensureDB();
    if (!database) {
      return loadFallback(FALLBACK_TX_KEY, [])
        .sort((a, b) => b.ts - a.ts)
        .slice(0, limit);
    }
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(TX_STORE, 'readonly');
      const request = transaction.objectStore(TX_STORE).getAll();
      request.onsuccess = () => {
        const list = request.result.sort((a, b) => b.ts - a.ts).slice(0, limit);
        resolve(list);
      };
      request.onerror = () => reject(request.error);
    }).catch((error) => {
      console.warn('indexedDB nolasīšana neizdevās, izmantojam fallback', error);
      return loadFallback(FALLBACK_TX_KEY, [])
        .sort((a, b) => b.ts - a.ts)
        .slice(0, limit);
    });
  }

  async function putChat(entry) {
    if (!hasIndexedDB) {
      const list = loadFallback(FALLBACK_CHAT_KEY, []);
      const next = list.filter((item) => item.ts !== entry.ts).concat(entry);
      saveFallback(FALLBACK_CHAT_KEY, next);
      return true;
    }
    const database = await ensureDB();
    if (!database) return true;
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(CHAT_STORE, 'readwrite');
      transaction.oncomplete = () => resolve(true);
      transaction.onerror = () => reject(transaction.error);
      transaction.objectStore(CHAT_STORE).put(entry);
    }).catch((error) => {
      console.warn('indexedDB čata saglabāšana neveiksmīga, izmantojam fallback', error);
      const list = loadFallback(FALLBACK_CHAT_KEY, []);
      const next = list.filter((item) => item.ts !== entry.ts).concat(entry);
      saveFallback(FALLBACK_CHAT_KEY, next);
      return true;
    });
  }

  async function getChat(limit = 500) {
    if (!hasIndexedDB) {
      return loadFallback(FALLBACK_CHAT_KEY, [])
        .sort((a, b) => a.ts - b.ts)
        .slice(-limit);
    }
    const database = await ensureDB();
    if (!database) {
      return loadFallback(FALLBACK_CHAT_KEY, [])
        .sort((a, b) => a.ts - b.ts)
        .slice(-limit);
    }
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(CHAT_STORE, 'readonly');
      const request = transaction.objectStore(CHAT_STORE).getAll();
      request.onsuccess = () => {
        const list = request.result.sort((a, b) => a.ts - b.ts).slice(-limit);
        resolve(list);
      };
      request.onerror = () => reject(request.error);
    }).catch((error) => {
      console.warn('indexedDB čata nolasīšana neveiksmīga, izmantojam fallback', error);
      return loadFallback(FALLBACK_CHAT_KEY, [])
        .sort((a, b) => a.ts - b.ts)
        .slice(-limit);
    });
  }

  function seedIfEmpty() {
    const seeded = localStorage.getItem('novasphere-seeded');
    if (seeded) return;
    const seed = DemoSeed.getSeed();
    Object.entries(seed.state).forEach(([key, value]) => saveState(key, value));
    localStorage.setItem('novasphere-seeded', '1');
    ensureDB()
      .then(() => {
        seed.transactions.forEach((tx) => putTx(tx));
        seed.chat.forEach((msg) => putChat(msg));
      })
      .catch((error) => {
        console.warn('Neizdevās inicializēt indexedDB sēklu, izmantojam fallback', error);
        saveFallback(FALLBACK_TX_KEY, seed.transactions);
        saveFallback(FALLBACK_CHAT_KEY, seed.chat);
      });
  }

  function resetStores() {
    try {
      localStorage.removeItem(FALLBACK_TX_KEY);
      localStorage.removeItem(FALLBACK_CHAT_KEY);
      if (hasIndexedDB) {
        indexedDB.deleteDatabase(DB_NAME);
        db = null;
      }
    } catch (error) {
      console.warn('Neizdevās dzēst datubāzi', error);
    }
  }

  return {
    ensureDB,
    loadState,
    saveState,
    putTx,
    getTransactions,
    putChat,
    getChat,
    seedIfEmpty,
    resetStores
  };
})();
