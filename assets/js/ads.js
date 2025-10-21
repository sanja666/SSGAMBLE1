(function () {
  window.NS = window.NS || {};

  const listEl = document.getElementById("ads-list");
  const btnNew = document.getElementById("btn-new-ad");

  function renderAds() {
    const ads = NS.store.getAds();
    listEl.innerHTML = "";
    if (!ads.length) {
      listEl.innerHTML = "<p>Nav sludinājumu. Izveido jaunu!</p>";
      return;
    }
    ads.forEach((ad) => {
      const card = document.createElement("div");
      card.className = "ad-card card";
      card.innerHTML = `
        <div class="row">
          <img src="${ad.img}" alt="${ad.title}" style="width:120px;border-radius:14px;object-fit:cover;" />
          <div class="stack">
            <h3>${ad.title}</h3>
            <p>${ad.desc}</p>
            <span class="price">${NS.ui.formatEUR(ad.price)}</span>
            <span class="tag">${ad.status}</span>
          </div>
        </div>
      `;
      const actions = document.createElement("div");
      actions.className = "stack";
      const toggle = document.createElement("button");
      toggle.className = "btn ghost";
      toggle.textContent = ad.status === "active" ? "Pauzēt" : "Aktivizēt";
      toggle.addEventListener("click", () => updateAd(ad.id, { status: ad.status === "active" ? "paused" : "active" }));
      const edit = document.createElement("button");
      edit.className = "btn ghost";
      edit.textContent = "Labot";
      edit.addEventListener("click", () => openAdModal(ad));
      const remove = document.createElement("button");
      remove.className = "btn ghost";
      remove.textContent = "Dzēst";
      remove.addEventListener("click", () => deleteAd(ad.id));
      actions.append(toggle, edit, remove);
      card.appendChild(actions);
      listEl.appendChild(card);
    });
  }

  function updateAd(id, fields) {
    const ads = NS.store.getAds().map((ad) => (ad.id === id ? { ...ad, ...fields } : ad));
    NS.store.setAds(ads);
  }

  function deleteAd(id) {
    const ads = NS.store.getAds().filter((ad) => ad.id !== id);
    NS.store.setAds(ads);
    NS.ui.toast("Sludinājums dzēsts");
  }

  function openAdModal(ad = null) {
    const body = document.createElement("form");
    body.className = "stack";
    body.innerHTML = `
      <label>Nosaukums
        <input name="title" required value="${ad ? ad.title : ""}" />
      </label>
      <label>Apraksts
        <textarea name="desc" rows="3">${ad ? ad.desc : ""}</textarea>
      </label>
      <label>Cena
        <input type="number" name="price" min="1" value="${ad ? ad.price : 10}" />
      </label>
      <label>Kategorija
        <input name="cat" value="${ad ? ad.cat || "" : "Tehnika"}" />
      </label>
      <label>Attēls
        <input type="file" name="img" accept="image/*" ${ad ? "" : "required"} />
      </label>
    `;
    const saveBtn = document.createElement("button");
    saveBtn.type = "submit";
    saveBtn.className = "btn primary";
    saveBtn.textContent = "Saglabāt";
    body.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(body);
      const payload = {
        id: ad?.id || `ad-${Date.now()}`,
        title: formData.get("title"),
        desc: formData.get("desc"),
        price: Number(formData.get("price")),
        cat: formData.get("cat"),
        status: ad?.status || "active",
        img: ad?.img
      };
      const file = formData.get("img");
      if (file && file.size) {
        payload.img = await fileToDataUrl(file);
      }
      if (!payload.img) {
        NS.ui.toast("Nepieciešams attēls");
        return;
      }
      if (ad) {
        updateAd(ad.id, payload);
      } else {
        const ads = NS.store.getAds();
        NS.store.setAds([...ads, payload]);
      }
      NS.ui.closeModal();
    });
    NS.ui.openModal({ title: ad ? "Labot sludinājumu" : "Jauns sludinājums", body, actions: [saveBtn] });
  }

  function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

  NS.ads = {
    init() {
      renderAds();
      btnNew.addEventListener("click", () => openAdModal());
      NS.events.on("ads:update", renderAds);
    }
  };
})();
