(function () {
  const KEY = "tm_communities";

  function load() {
    try {
      return JSON.parse(localStorage.getItem(KEY) || "null");
    } catch (e) {
      return null;
    }
  }
  function save(v) {
    localStorage.setItem(KEY, JSON.stringify(v));
  }

  function ensureDefaults() {
    let list = load();
    if (!list) {
      list = [
        {
          id: "c_prod",
          name: "Product Design",
          members: 12,
          active: 4,
          joined: false,
        },
        {
          id: "c_dev",
          name: "Dev Chat",
          members: 28,
          active: 9,
          joined: false,
        },
      ];
      save(list);
    }
    return list;
  }

  function render() {
    const wrap = document.querySelector(".community-cards");
    if (!wrap) return;
    const list = ensureDefaults();
    wrap.innerHTML = "";

    list.forEach((c) => {
      const card = document.createElement("div");
      card.className = "community-card";
      const avatar = document.createElement("div");
      avatar.className = "community-avatar";
      avatar.textContent = (c.name || "")[0] || "?";
      const info = document.createElement("div");
      info.className = "community-info";
      const title = document.createElement("div");
      title.className = "community-name";
      title.textContent = c.name;
      const meta = document.createElement("div");
      meta.className = "community-meta";
      meta.textContent = `${c.members} members · ${c.active} active`;
      info.appendChild(title);
      info.appendChild(meta);

      const btn = document.createElement("button");
      btn.className = c.joined ? "btn primary" : "btn ghost";
      btn.textContent = c.joined ? "Joined" : "Join";
      btn.addEventListener("click", () => toggleJoin(c.id));

      card.appendChild(avatar);
      card.appendChild(info);
      card.appendChild(btn);
      wrap.appendChild(card);
    });

    // add create card
    const create = document.createElement("div");
    create.className = "community-card empty";
    const av2 = document.createElement("div");
    av2.className = "community-avatar";
    av2.textContent = "+";
    const info2 = document.createElement("div");
    info2.className = "community-info";
    const name2 = document.createElement("div");
    name2.className = "community-name";
    name2.textContent = "Create community";
    const meta2 = document.createElement("div");
    meta2.className = "community-meta";
    meta2.textContent = "Start a new space";
    info2.appendChild(name2);
    info2.appendChild(meta2);
    const createBtn = document.createElement("button");
    createBtn.className = "btn primary";
    createBtn.textContent = "Create";
    createBtn.addEventListener("click", openCreateModal);
    create.appendChild(av2);
    create.appendChild(info2);
    create.appendChild(createBtn);
    wrap.appendChild(create);
  }

  function toggleJoin(id) {
    const list = ensureDefaults();
    const i = list.findIndex((x) => x.id === id);
    if (i === -1) return;
    const c = list[i];
    if (c.joined) {
      c.joined = false;
      c.members = Math.max(0, (c.members || 1) - 1);
    } else {
      c.joined = true;
      c.members = (c.members || 0) + 1;
    }
    save(list);
    render();
  }

  // create modal
  function ensureModal() {
    if (document.getElementById("community_createModal")) return;
    const modal = document.createElement("div");
    modal.id = "community_createModal";
    modal.className = "modal";
    modal.innerHTML = `
      <div class="modal-backdrop"></div>
      <div class="modal-panel">
        <h3>Create Community</h3>
        <label>Name</label>
        <input id="community_name" type="text" placeholder="Community name" />
        <div class="modal-actions"><button id="community_cancel" class="btn ghost">Cancel</button><button id="community_save" class="btn primary">Create</button></div>
      </div>`;
    document.body.appendChild(modal);
    modal
      .querySelector(".modal-backdrop")
      .addEventListener("click", closeCreateModal);
    modal
      .querySelector("#community_cancel")
      .addEventListener("click", closeCreateModal);
    modal
      .querySelector("#community_save")
      .addEventListener("click", function () {
        const v = document.getElementById("community_name").value.trim();
        if (!v) {
          alert("Please enter a name");
          return;
        }
        createCommunity(v);
        document.getElementById("community_name").value = "";
        closeCreateModal();
      });
  }
  function openCreateModal() {
    ensureModal();
    document.getElementById("community_createModal").style.display = "block";
    document.getElementById("community_name").focus();
  }
  function closeCreateModal() {
    const m = document.getElementById("community_createModal");
    if (m) m.style.display = "none";
  }

  function createCommunity(name) {
    const list = ensureDefaults();
    const id = "c_" + Date.now();
    list.push({ id, name, members: 1, active: 0, joined: true });
    save(list);
    render();
  }

  document.addEventListener("DOMContentLoaded", function () {
    ensureDefaults();
    render();
    ensureModal();
  });
})();
