const Store = (() => {
  const DB_NAME = 'novasphere-db';
  const DB_VERSION = 1;
  const TX_STORE = 'transactions';
  const CHAT_STORE = 'chatLog';
  let db;

  function openDB() {
    return new Promise((resolve, reject) => {
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
    });
  }

  async function ensureDB() {
    if (db) return db;
    return openDB();
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
    const database = await ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(TX_STORE, 'readwrite');
      transaction.oncomplete = () => resolve(true);
      transaction.onerror = () => reject(transaction.error);
      transaction.objectStore(TX_STORE).put(tx);
    });
  }

  async function getTransactions(limit = 200) {
    const database = await ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(TX_STORE, 'readonly');
      const request = transaction.objectStore(TX_STORE).getAll();
      request.onsuccess = () => {
        const list = request.result.sort((a, b) => b.ts - a.ts).slice(0, limit);
        resolve(list);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async function putChat(entry) {
    const database = await ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(CHAT_STORE, 'readwrite');
      transaction.oncomplete = () => resolve(true);
      transaction.onerror = () => reject(transaction.error);
      transaction.objectStore(CHAT_STORE).put(entry);
    });
  }

  async function getChat(limit = 500) {
    const database = await ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(CHAT_STORE, 'readonly');
      const request = transaction.objectStore(CHAT_STORE).getAll();
      request.onsuccess = () => {
        const list = request.result.sort((a, b) => a.ts - b.ts).slice(-limit);
        resolve(list);
      };
      request.onerror = () => reject(request.error);
    });
  }

  function seedIfEmpty() {
    const seeded = localStorage.getItem('novasphere-seeded');
    if (seeded) return;
    const seed = DemoSeed.getSeed();
    Object.entries(seed.state).forEach(([key, value]) => saveState(key, value));
    localStorage.setItem('novasphere-seeded', '1');
    ensureDB().then(() => {
      seed.transactions.forEach((tx) => putTx(tx));
      seed.chat.forEach((msg) => putChat(msg));
    });
  }

  return {
    ensureDB,
    loadState,
    saveState,
    putTx,
    getTransactions,
    putChat,
    getChat,
    seedIfEmpty
  };
})();
