(function () {
  window.NS = window.NS || {};

  const chatLogEl = document.getElementById("chat-log");
  const sidebarLogEl = document.getElementById("sidebar-chat-log");
  const botFeedEl = document.getElementById("novabot-feed");
  const notificationsEl = document.getElementById("notifications");
  const form = document.getElementById("chat-form");
  const input = document.getElementById("chat-input");

  const BOT_NAME = "NovaBot";

  function renderChat() {
    const entries = NS.store.getChat();
    const make = (container) => {
      container.innerHTML = "";
      entries.slice(-80).forEach((entry) => {
        const item = document.createElement("div");
        item.className = "msg";
        item.innerHTML = `<strong>${entry.user}</strong><span>${entry.text}</span><small>${new Date(entry.ts).toLocaleTimeString()}</small>`;
        container.appendChild(item);
      });
      container.scrollTop = container.scrollHeight;
    };
    make(chatLogEl);
    make(sidebarLogEl);
  }

  function pushNotification(text) {
    const li = document.createElement("li");
    li.textContent = text;
    notificationsEl.prepend(li);
    if (notificationsEl.children.length > 10) {
      notificationsEl.removeChild(notificationsEl.lastChild);
    }
  }

  function botMessage(text) {
    const settings = NS.store.getSettings();
    if (settings.muteBot) return;
    const entry = { ts: Date.now(), user: BOT_NAME, text };
    NS.store.pushChat(entry);
    if (botFeedEl) {
      const item = document.createElement("div");
      item.className = "msg";
      item.innerHTML = `<strong>${BOT_NAME}</strong><span>${text}</span>`;
      botFeedEl.prepend(item);
      while (botFeedEl.children.length > 12) botFeedEl.removeChild(botFeedEl.lastChild);
    }
  }

  const commandHandlers = {
    help() {
      return "Komandas: /help, /joke, /status, /balance";
    },
    joke() {
      const jokes = [
        "Kāpēc rulete tik klusa? Jo visi tur elpu!",
        "Crash līkne saka: turies cieši!",
        "Monēta šodien spīd kā neons."
      ];
      return jokes[Math.floor(Math.random() * jokes.length)];
    },
    status() {
      const balance = NS.store.getWallet();
      const items = NS.store.getInventory().length;
      return `Tavs atlikums ir ${NS.ui.formatEUR(balance)} un tev ir ${items} priekšmeti.`;
    },
    balance() {
      const balance = NS.store.getWallet();
      return `Pašreizējais atlikums: ${NS.ui.formatEUR(balance)}`;
    }
  };

  function handleMessage(text, user) {
    if (!text.trim()) return;
    if (text.startsWith("/")) {
      const cmd = text.slice(1).split(" ")[0];
      const handler = commandHandlers[cmd];
      if (handler) {
        botMessage(handler());
        return;
      }
      botMessage(`Nezināma komanda: ${cmd}`);
      return;
    }
    NS.store.pushChat({ ts: Date.now(), user, text });
  }

  function initListeners() {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const profile = NS.store.getProfile();
      handleMessage(input.value, profile.name || profile.role);
      input.value = "";
    });

    NS.events.on("chat:post", (entry) => {
      renderChat();
      pushNotification(`${entry.user}: ${entry.text}`);
    });

    NS.events.on("market:buy", (payload) => {
      botMessage(`Woo! ${payload.title} nu atrodas tavā inventārā.`);
    });

    NS.events.on("game:result", (result) => {
      if (result.payout > result.bet) {
        botMessage(`Veiksme! ${result.game} atnesa ${NS.ui.formatEUR(result.payout - result.bet)}.`);
      }
    });

    NS.events.on("wallet:update", ({ balance }) => {
      pushNotification(`Jauns atlikums: ${NS.ui.formatEUR(balance)}`);
    });
  }

  NS.chat = {
    init() {
      renderChat();
      initListeners();
    },
    botMessage
  };
})();
