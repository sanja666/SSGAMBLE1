const Settings = (() => {
  let nova;
  let view;

  function init(app) {
    nova = app;
    view = document.getElementById('view-settings');
    render();
  }

  function render() {
    if (!view) return;
    view.innerHTML = `
      <div class="section-card">
        <div class="section-header"><h2>Iestatījumi</h2></div>
        <div class="settings-grid">
          <div class="settings-card">
            <label><input type="checkbox" id="settingSfx" ${nova.state.settings.sfx ? 'checked' : ''}> SFX</label>
            <label><input type="checkbox" id="settingMusic" ${nova.state.settings.music ? 'checked' : ''}> Mūzika</label>
            <label>Valoda
              <select id="settingLang">
                <option value="lv" ${I18n.lang === 'lv' ? 'selected' : ''}>Latviešu</option>
                <option value="en" ${I18n.lang === 'en' ? 'selected' : ''}>English</option>
              </select>
            </label>
            <label>Tēma
              <select id="settingTheme">
                <option value="dark" ${document.documentElement.dataset.theme === 'dark' ? 'selected' : ''}>Tumša</option>
                <option value="neon" ${document.documentElement.dataset.theme === 'neon' ? 'selected' : ''}>Neona</option>
                <option value="gold" ${document.documentElement.dataset.theme === 'gold' ? 'selected' : ''}>Zelta</option>
              </select>
            </label>
            <button id="resetDemo">Reset demo</button>
          </div>
          <div class="settings-card" data-wallet-history>
            <h3>Darījumu vēsture</h3>
          </div>
        </div>
      </div>
    `;
    bind();
    nova.bus.emit('settings:ready');
  }

  function bind() {
    document.getElementById('settingSfx').addEventListener('change', (event) => updateSettings({ sfx: event.target.checked }));
    document.getElementById('settingMusic').addEventListener('change', (event) => updateSettings({ music: event.target.checked }));
    document.getElementById('settingLang').addEventListener('change', (event) => {
      nova.updateSettings({ lang: event.target.value });
      render();
    });
    document.getElementById('settingTheme').addEventListener('change', (event) => {
      nova.updateSettings({ theme: event.target.value });
    });
    document.getElementById('resetDemo').addEventListener('click', confirmReset);
  }

  function updateSettings(partial) {
    nova.updateSettings(partial);
  }

  function confirmReset() {
    if (confirm('Vai tiešām vēlies atiestatīt datus?') && confirm('Pēdējā iespēja!')) {
      localStorage.clear();
      Store.seedIfEmpty();
      location.reload();
    }
  }

  Nova.registerModule('settings', { init, render });
})();
