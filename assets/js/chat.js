const Chat = (() => {
  let nova;
  let sidebarLog;
  let botFeed;
  let input;
  let sendBtn;
  let chatView;
  let chatListView;
  let muteBot = false;
  let novaBotTimer;
  const BOT_NAME = 'NovaBot';
  const BOT_AVATAR = 'assets/img/avatar/novabot.svg';
  const jokes = [
    'NovaBot nespēlē craps – viņš spēlē konfeti.',
    'Vai zināji? Neona gaisma dedzina kalorijas ar skatienu.',
    'Es aprēķināju tavu veiksmi: rezultāts = wow!'
  ];

  function init(app) {
    nova = app;
    sidebarLog = document.getElementById('sidebarChatLog');
    botFeed = document.getElementById('botFeed');
    input = document.getElementById('sidebarChatInput');
    sendBtn = document.getElementById('sidebarChatSend');
    chatView = document.getElementById('view-chat');
    muteBot = nova.state.settings?.muteBot;
    buildChatView();
    attachListeners();
    hydrateChat();
    scheduleBotPing();
    nova.bus.on('chat:post', () => renderLogs());
    nova.bus.on('game:result', (entry) => reactToGame(entry));
    nova.bus.on('wallet:update', (payload) => {
      if (payload.balance % 25 === 0) {
        sendBot(`Bilance sasniedza ${nova.formatCurrency(payload.balance)}. Lieliski!`);
      }
    });
  }

  function buildChatView() {
    chatView.innerHTML = `
      <div class="section-card">
        <div class="section-header"><h2>City Čats</h2></div>
        <div class="chat-log" style="max-height:380px" id="mainChatLog"></div>
        <div class="chat-input">
          <input type="text" id="mainChatInput" placeholder="Ieraksti ziņu...">
          <button id="mainChatSend">▶</button>
        </div>
        <div class="achievement-list" id="chatAchievements"></div>
      </div>
      <div class="section-card">
        <div class="section-header"><h3>Komandas</h3></div>
        <p>/help, /joke, /status, /balance</p>
      </div>
    `;
    chatListView = document.getElementById('mainChatLog');
    const mainInput = document.getElementById('mainChatInput');
    const mainSend = document.getElementById('mainChatSend');
    mainSend.addEventListener('click', () => handleUserMessage(mainInput.value));
    mainInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        handleUserMessage(mainInput.value);
      }
    });
  }

  async function hydrateChat() {
    try {
      const dbChat = await Store.getChat();
      if (dbChat.length) {
        const combined = [...dbChat];
        nova.state.chatLog = combined;
        Store.saveState('chatLog', combined);
      }
    } catch (error) {
      console.warn('Unable to load chat from db', error);
    }
    renderLogs();
  }

  function attachListeners() {
    if (sendBtn) sendBtn.addEventListener('click', () => handleUserMessage(input.value));
    if (input) input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') handleUserMessage(input.value);
    });
  }

  function handleUserMessage(text) {
    const value = text.trim();
    if (!value) return;
    postMessage({ user: nova.state.userProfile?.name || 'Viesis', avatar: nova.state.userProfile?.avatar, text: value });
    input.value = '';
    const mainInput = document.getElementById('mainChatInput');
    if (mainInput) mainInput.value = '';
    processCommands(value);
  }

  function postMessage({ user, avatar, text, system }) {
    const entry = { ts: Date.now(), user, avatar: avatar || 'assets/img/avatar/avatar1.svg', text, system: Boolean(system) };
    nova.addChatMessage(entry);
  }

  function renderLogs() {
    const logs = nova.state.chatLog;
    if (!sidebarLog || !chatListView) return;
    const latest = logs.slice(-30);
    sidebarLog.innerHTML = latest.map(renderMessage).join('');
    chatListView.innerHTML = logs.slice(-120).map(renderMessage).join('');
    if (botFeed) {
      const botMessages = logs.filter((msg) => msg.user === BOT_NAME).slice(-12);
      botFeed.innerHTML = botMessages.map(renderMessage).join('');
      botFeed.scrollTop = botFeed.scrollHeight;
    }
    sidebarLog.scrollTop = sidebarLog.scrollHeight;
    chatListView.scrollTop = chatListView.scrollHeight;
    renderAchievements();
  }

  function renderMessage(entry) {
    return `
      <div class="message">
        <img src="${entry.avatar}" alt="${entry.user}">
        <div class="bubble"><strong>${entry.user}:</strong> ${entry.text}</div>
      </div>
    `;
  }

  function renderAchievements() {
    const wrap = document.getElementById('chatAchievements');
    if (!wrap) return;
    wrap.innerHTML = nova.state.achievements.map((ach) => `<div class="achievement ${ach.earned ? 'earned' : ''}">${ach.name}</div>`).join('');
  }

  function processCommands(text) {
    if (!text.startsWith('/')) {
      sendBot(`Paldies par ziņu, ${nova.state.userProfile?.name || 'draugs'}!`);
      return;
    }
    const command = text.slice(1).toLowerCase();
    switch (command) {
      case 'help':
        sendBot('Komandas: /help, /joke, /status, /balance');
        break;
      case 'joke':
        sendBot(jokes[Math.floor(Math.random() * jokes.length)]);
        break;
      case 'status':
        sendBot(`Pašlaik aktīvie piedāvājumi tirgū: ${nova.state.offers.length}. Sasniegumi: ${nova.state.achievements.filter((a) => a.earned).length}`);
        break;
      case 'balance':
        sendBot(`Tava bilance ir ${nova.formatCurrency(nova.state.walletBalance)}`);
        break;
      default:
        sendBot('Hmm... to komandu nezinu.');
    }
  }

  function sendBot(text) {
    if (muteBot) return;
    postMessage({ user: BOT_NAME, avatar: BOT_AVATAR, text });
  }

  function reactToGame(entry) {
    if (entry.payout > entry.bet) {
      sendBot(`Wooo! ${entry.game} tev izmaksāja ${nova.formatCurrency(entry.payout)}.`);
      UI.spawnConfetti();
    } else if (entry.payout === 0) {
      sendBot(`Nākamreiz izdosies! ${entry.game} šoreiz bija grūts.`);
    }
  }

  function scheduleBotPing() {
    clearTimeout(novaBotTimer);
    if (muteBot) return;
    novaBotTimer = setTimeout(() => {
      sendBot('NovaBot te! Atceries, ka tirgus piedāvā XP bonusus.');
      scheduleBotPing();
    }, 45000);
  }

  function setNovaBotMuted(value) {
    muteBot = value;
    clearTimeout(novaBotTimer);
    if (!muteBot) {
      scheduleBotPing();
    }
  }

  function render() {
    renderLogs();
  }

  Nova.registerModule('chat', { init, render });

  return { setNovaBotMuted };
})();
