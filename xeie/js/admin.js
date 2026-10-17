/**
 * Xéie Admin Panel
 * - Login (password → sessionStorage)
 * - Products / Zones / Texts / Site images / Media / Orders
 * - localStorage drafts + Publish via Worker
 */

(function () {
  "use strict";

  // ---------- Config ----------
  const PUBLISH_URL = "https://xeie-api.xeieloja.workers.dev/publish";
  const ORDERS_URL  = "https://xeie-api.xeieloja.workers.dev/orders";

  const CLOUD_NAME   = "efvlvhce";
  const UPLOAD_PRESET = "xeie_media";
  const FOLDER       = "xeie";
  const CATALOG_URL  = `https://res.cloudinary.com/${CLOUD_NAME}/raw/upload/${FOLDER}/catalog.json`;

  const LS = {
    products: "xeie_products_override",
    zones:    "xeie_zones_override",
    texts:    "xeie_texts_override",
    images:   "xeie_images_override",
    media:    "xeie_media_library",
    auth:     "xeie_admin_auth",
  };

  // ---------- State ----------
  let products = [];
  let zones = [];
  let texts = { pt: {}, en: {} };
  let images = {};
  let mediaLibrary = [];
  let editingProductId = null;
  let mediaPickerTarget = null;

  // ---------- Helpers ----------
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  function toast(msg, ms = 2600) {
    const el = $("#toast");
    if (!el) return;
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove("show"), ms);
  }

  function loadJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function saveJSON(key, val) {
    localStorage.setItem(key, JSON.stringify(val));
  }

  function formatKz(n) {
    return Number(n || 0).toLocaleString("pt-AO") + " Kz";
  }

  function isAuthed() {
    return sessionStorage.getItem(LS.auth) === "1" || localStorage.getItem(LS.auth) === "1";
  }

  function setAuth(remember) {
    sessionStorage.setItem(LS.auth, "1");
    if (remember) localStorage.setItem(LS.auth, "1");
  }

  function clearAuth() {
    sessionStorage.removeItem(LS.auth);
    localStorage.removeItem(LS.auth);
  }

  function showLogin() {
    $("#login-screen").style.display = "flex";
    $("#admin-shell").classList.remove("visible");
  }

  function showAdmin() {
    $("#login-screen").style.display = "none";
    $("#admin-shell").classList.add("visible");
    loadAll();
    renderAll();
    switchPanel("dashboard");
  }

  function loadAll() {
    products = loadJSON(LS.products, window.XEIE_DEFAULT_PRODUCTS || []);
    zones    = loadJSON(LS.zones,    window.XEIE_DEFAULT_ZONES || []);
    texts    = loadJSON(LS.texts,    window.XEIE_DEFAULT_TEXTS || { pt: {}, en: {} });
    images   = loadJSON(LS.images,   window.XEIE_DEFAULT_IMAGES || {});
    mediaLibrary = loadJSON(LS.media, []);
  }

  function saveDraft(silent = false) {
    saveJSON(LS.products, products);
    saveJSON(LS.zones, zones);
    saveJSON(LS.texts, texts);
    saveJSON(LS.images, images);
    saveJSON(LS.media, mediaLibrary);
    if (!silent) toast("Rascunho guardado neste dispositivo");
  }

  function renderAll() {
    renderDashboard();
    renderProducts();
    renderZones();
    renderTexts();
    renderSiteImages();
    renderMedia();
  }

  function renderDashboard() {
    $("#stat-products").textContent = products.filter((p) => p.active !== false).length;
    $("#stat-zones").textContent = zones.length;
    $("#stat-media").textContent = mediaLibrary.length;
    $("#stat-orders").textContent = "—";
  }

  function renderProducts() {
    const list = $("#product-list");
    if (!products.length) {
      list.innerHTML = `<div class="empty-state">Nenhum produto. Clique em “Adicionar produto”.</div>`;
      return;
    }
    list.innerHTML = products
      .map(
        (p) => `
      <div class="product-card" data-id="${p.id}">
        <img src="${p.image || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Crect fill='%23E7E5E4' width='64' height='64'/%3E%3C/svg%3E"}" alt="" />
        <div class="info">
          <p class="name">${escapeHtml(p.name)}</p>
          <p class="meta">${formatKz(p.price)} · ${escapeHtml(p.category || "")} · <span class="badge ${p.active !== false ? "active" : "inactive"}">${p.active !== false ? "Activo" : "Inactivo"}</span></p>
          <div class="actions">
            <button class="btn btn-secondary btn-sm" data-edit="${p.id}">Editar</button>
            <button class="btn btn-danger btn-sm" data-del="${p.id}">Remover</button>
          </div>
        </div>
      </div>`
      )
      .join("");
  }

  function renderZones() {
    const list = $("#zone-list");
    if (!zones.length) {
      list.innerHTML = `<div class="empty-state">Nenhuma zona. Adicione zonas de entrega.</div>`;
      return;
    }
    list.innerHTML = zones
      .map(
        (z, i) => `
      <div class="product-card">
        <div class="info" style="width:100%">
          <p class="name">${escapeHtml(z.name)}</p>
          <p class="meta">${formatKz(z.price)}</p>
          <div class="actions">
            <button class="btn btn-danger btn-sm" data-zone-del="${i}">Remover</button>
          </div>
        </div>
      </div>`
      )
      .join("");
  }

  function renderTexts() {
    $("#text-hero-pt").value = texts.pt?.heroTitle || "";
    $("#text-sub-pt").value = texts.pt?.heroSubtitle || "";
    $("#text-hero-en").value = texts.en?.heroTitle || "";
    $("#text-sub-en").value = texts.en?.heroSubtitle || "";
  }

  function renderSiteImages() {
    const slots = window.XEIE_SITE_IMAGE_SLOTS || [
      { key: "hero", label: "Hero" },
      { key: "promo", label: "Promo" },
    ];
    const container = $("#site-images-list");
    container.innerHTML = slots
      .map((s) => {
        const url = images[s.key] || "";
        return `
        <div class="slot-card" data-slot="${s.key}">
          <img class="preview" src="${url || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='56'%3E%3Crect fill='%23E7E5E4' width='80' height='56'/%3E%3C/svg%3E"}" alt="" />
          <div class="slot-info">
            <p class="slot-label">${escapeHtml(s.label)}</p>
            <div class="slot-actions">
              <button class="btn btn-secondary btn-sm" data-slot-upload="${s.key}">Carregar</button>
              <button class="btn btn-secondary btn-sm" data-slot-pick="${s.key}">Escolher da média</button>
              <button class="btn btn-danger btn-sm" data-slot-clear="${s.key}">Original</button>
            </div>
          </div>
        </div>`;
      })
      .join("");
  }

  function renderMedia() {
    const grid = $("#media-grid");
    if (!mediaLibrary.length) {
      grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">Nenhuma imagem na biblioteca. Faça upload.</div>`;
      return;
    }
    grid.innerHTML = mediaLibrary
      .map(
        (m, i) => `
      <div class="media-item" data-media-idx="${i}">
        <img src="${m.url}" alt="" loading="lazy" />
        <button class="remove" data-media-del="${i}" title="Remover da lista">✕</button>
      </div>`
      )
      .join("");
  }

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function switchPanel(id) {
    $$(".panel").forEach((p) => p.classList.remove("active"));
    $$(".admin-nav button").forEach((b) => b.classList.remove("active"));
    const panel = $(`#panel-${id}`);
    const btn = $(`.admin-nav button[data-panel="${id}"]`);
    if (panel) panel.classList.add("active");
    if (btn) btn.classList.add("active");
    if (id === "orders") loadOrders();
  }

  function openProductModal(product) {
    editingProductId = product ? product.id : null;
    $("#modal-product-title").textContent = product ? "Editar produto" : "Novo produto";
    $("#p-name").value = product?.name || "";
    $("#p-price").value = product?.price || "";
    $("#p-category").value = product?.category || "";
    $("#p-desc").value = product?.description || "";
    $("#p-image").value = product?.image || "";
    $("#p-active").checked = product ? product.active !== false : true;
    $("#p-image-preview").src = product?.image || "";
    $("#p-image-preview").style.display = product?.image ? "block" : "none";
    $("#modal-product").classList.add("open");
  }

  function closeProductModal() {
    $("#modal-product").classList.remove("open");
    editingProductId = null;
  }

  function saveProductFromModal() {
    const name = $("#p-name").value.trim();
    const price = parseFloat($("#p-price").value) || 0;
    if (!name) {
      toast("Nome é obrigatório");
      return;
    }
    const data = {
      id: editingProductId || "p-" + Date.now().toString(36),
      name,
      price,
      category: $("#p-category").value.trim(),
      description: $("#p-desc").value.trim(),
      image: $("#p-image").value.trim(),
      active: $("#p-active").checked,
    };
    if (editingProductId) {
      const idx = products.findIndex((p) => p.id === editingProductId);
      if (idx >= 0) products[idx] = data;
    } else {
      products.unshift(data);
    }
    renderProducts();
    renderDashboard();
    closeProductModal();
    toast("Produto guardado (rascunho)");
  }

  async function uploadToCloudinary(file) {
    const form = new FormData();
    form.append("file", file);
    form.append("upload_preset", UPLOAD_PRESET);
    form.append("folder", FOLDER);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: "POST",
      body: form,
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body.error?.message || "Upload failed");
    return body.secure_url || body.url;
  }

  async function handleFileUpload(file, onUrl) {
    if (!file || !file.type.startsWith("image/")) {
      toast("Escolha uma imagem");
      return;
    }
    toast("A carregar…");
    try {
      const url = await uploadToCloudinary(file);
      mediaLibrary.unshift({ url, name: file.name, addedAt: new Date().toISOString() });
      saveJSON(LS.media, mediaLibrary);
      renderMedia();
      onUrl(url);
      toast("Imagem carregada");
    } catch (e) {
      console.error(e);
      toast("Erro no upload: " + e.message);
    }
  }

  async function publish() {
    const pwd = prompt("Confirme a password de admin para publicar:");
    if (!pwd) return;

    if (!confirm(`Publicar agora?\n\n• ${products.length} produtos\n• ${zones.length} zonas\n• textos + imagens do site\n\nTodos os visitantes verão as alterações.`)) {
      return;
    }

    const catalog = { products, zones, texts, images };
    const btn = $("#btn-publish");
    btn.disabled = true;
    btn.textContent = "A publicar…";

    try {
      const res = await fetch(PUBLISH_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Password": pwd,
        },
        body: JSON.stringify({ catalog }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Falha na publicação");
      saveDraft(true); // keep local draft in sync without overwriting toast
      toast("Publicado com sucesso!", 4000);
    } catch (e) {
      console.error(e);
      toast("Erro ao publicar: " + e.message);
    } finally {
      btn.disabled = false;
      btn.textContent = "Publicar na loja";
    }
  }

  async function loadOrders() {
    const container = $("#orders-list");
    container.innerHTML = `<div class="empty-state">A carregar pedidos…</div>`;

    const pwd = sessionStorage.getItem("xeie_admin_pwd_cache") || prompt("Password de admin:");
    if (!pwd) {
      container.innerHTML = `<div class="empty-state">Password necessária para ver pedidos.</div>`;
      return;
    }
    sessionStorage.setItem("xeie_admin_pwd_cache", pwd);

    try {
      const res = await fetch(ORDERS_URL + "?limit=50", {
        headers: { "X-Admin-Password": pwd },
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Erro");

      $("#stat-orders").textContent = data.count || 0;

      if (!data.orders || !data.orders.length) {
        container.innerHTML = `<div class="empty-state">Nenhum pedido ainda.</div>`;
        return;
      }

      container.innerHTML = data.orders
        .map(
          (o) => `
        <div class="order-card">
          <div class="order-id">${escapeHtml(o.id)} · ${escapeHtml((o.createdAt || "").slice(0, 16).replace("T", " "))}</div>
          <p class="order-name">${escapeHtml(o.nome || "—")}</p>
          <p class="order-meta">${escapeHtml(o.telefone || "")} · ${escapeHtml(o.email || "")}</p>
          <div class="order-product">
            <strong>${escapeHtml(o.produto || "Pedido personalizado")}</strong>
            ${o.quantidade ? " × " + o.quantidade : ""}
            ${o.orcamento ? "<br>Orçamento: " + escapeHtml(o.orcamento) : ""}
            ${o.morada ? "<br>" + escapeHtml(o.morada) + (o.municipio ? ", " + escapeHtml(o.municipio) : "") : ""}
            ${o.observacoes ? "<br><em>" + escapeHtml(o.observacoes) + "</em>" : ""}
          </div>
        </div>`
        )
        .join("");
    } catch (e) {
      container.innerHTML = `<div class="empty-state">Erro: ${escapeHtml(e.message)}</div>`;
    }
  }

  function bindEvents() {
    $("#login-form")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const pwd = $("#login-password").value;
      if (pwd === "XNgola1648") {
        setAuth($("#login-remember")?.checked);
        sessionStorage.setItem("xeie_admin_pwd_cache", pwd);
        showAdmin();
      } else {
        $("#login-error").style.display = "block";
      }
    });

    $("#btn-logout")?.addEventListener("click", () => {
      clearAuth();
      sessionStorage.removeItem("xeie_admin_pwd_cache");
      showLogin();
    });

    $$(".admin-nav button").forEach((btn) => {
      btn.addEventListener("click", () => switchPanel(btn.dataset.panel));
    });

    $("#btn-save-draft")?.addEventListener("click", saveDraft);
    $("#btn-publish")?.addEventListener("click", publish);

    $("#btn-add-product")?.addEventListener("click", () => openProductModal(null));
    $("#product-list")?.addEventListener("click", (e) => {
      const editId = e.target.closest("[data-edit]")?.dataset.edit;
      const delId = e.target.closest("[data-del]")?.dataset.del;
      if (editId) {
        const p = products.find((x) => x.id === editId);
        if (p) openProductModal(p);
      }
      if (delId) {
        if (confirm("Remover este produto?")) {
          products = products.filter((x) => x.id !== delId);
          renderProducts();
          renderDashboard();
          toast("Produto removido (rascunho)");
        }
      }
    });

    $("#modal-product-close")?.addEventListener("click", closeProductModal);
    $("#modal-product-cancel")?.addEventListener("click", closeProductModal);
    $("#modal-product-save")?.addEventListener("click", saveProductFromModal);

    $("#p-upload-btn")?.addEventListener("click", () => $("#p-file-input").click());
    $("#p-file-input")?.addEventListener("change", async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      await handleFileUpload(file, (url) => {
        $("#p-image").value = url;
        $("#p-image-preview").src = url;
        $("#p-image-preview").style.display = "block";
      });
      e.target.value = "";
    });

    $("#p-pick-media")?.addEventListener("click", () => {
      mediaPickerTarget = "product";
      switchPanel("media");
      toast("Toque numa imagem da biblioteca para a usar no produto");
    });

    $("#btn-add-zone")?.addEventListener("click", () => {
      const name = prompt("Nome da zona (ex: Talatona):");
      if (!name) return;
      const price = parseFloat(prompt("Preço de entrega (Kz):", "2000")) || 0;
      zones.push({ name: name.trim(), price });
      renderZones();
      renderDashboard();
      toast("Zona adicionada (rascunho)");
    });
    $("#zone-list")?.addEventListener("click", (e) => {
      const idx = e.target.closest("[data-zone-del]")?.dataset.zoneDel;
      if (idx != null) {
        zones.splice(Number(idx), 1);
        renderZones();
        renderDashboard();
      }
    });

    $("#btn-save-texts")?.addEventListener("click", () => {
      texts.pt = {
        heroTitle: $("#text-hero-pt").value.trim(),
        heroSubtitle: $("#text-sub-pt").value.trim(),
      };
      texts.en = {
        heroTitle: $("#text-hero-en").value.trim(),
        heroSubtitle: $("#text-sub-en").value.trim(),
      };
      toast("Textos actualizados (rascunho)");
    });

    $("#site-images-list")?.addEventListener("click", (e) => {
      const uploadKey = e.target.closest("[data-slot-upload]")?.dataset.slotUpload;
      const pickKey = e.target.closest("[data-slot-pick]")?.dataset.slotPick;
      const clearKey = e.target.closest("[data-slot-clear]")?.dataset.slotClear;

      if (uploadKey) {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.onchange = async () => {
          const file = input.files?.[0];
          if (!file) return;
          await handleFileUpload(file, (url) => {
            images[uploadKey] = url;
            renderSiteImages();
          });
        };
        input.click();
      }
      if (pickKey) {
        mediaPickerTarget = pickKey;
        switchPanel("media");
        toast("Toque numa imagem para atribuir ao slot");
      }
      if (clearKey) {
        delete images[clearKey];
        renderSiteImages();
        toast("Slot reposto para original");
      }
    });

    $("#btn-upload-media")?.addEventListener("click", () => $("#media-file-input").click());
    $("#media-file-input")?.addEventListener("change", async (e) => {
      const files = [...(e.target.files || [])];
      for (const file of files) {
        await handleFileUpload(file, () => {});
      }
      e.target.value = "";
    });

    $("#media-grid")?.addEventListener("click", (e) => {
      const delIdx = e.target.closest("[data-media-del]")?.dataset.mediaDel;
      if (delIdx != null) {
        mediaLibrary.splice(Number(delIdx), 1);
        saveJSON(LS.media, mediaLibrary);
        renderMedia();
        renderDashboard();
        return;
      }
      const item = e.target.closest("[data-media-idx]");
      if (!item) return;
      const idx = Number(item.dataset.mediaIdx);
      const m = mediaLibrary[idx];
      if (!m) return;

      if (mediaPickerTarget === "product") {
        $("#p-image").value = m.url;
        $("#p-image-preview").src = m.url;
        $("#p-image-preview").style.display = "block";
        mediaPickerTarget = null;
        switchPanel("products");
        openProductModal(
          editingProductId
            ? products.find((p) => p.id === editingProductId)
            : { name: $("#p-name").value, price: $("#p-price").value, category: $("#p-category").value, description: $("#p-desc").value, image: m.url, active: $("#p-active").checked }
        );
        toast("Imagem atribuída ao produto");
      } else if (mediaPickerTarget) {
        images[mediaPickerTarget] = m.url;
        mediaPickerTarget = null;
        renderSiteImages();
        switchPanel("images");
        toast("Imagem atribuída ao slot");
      } else {
        navigator.clipboard?.writeText(m.url).then(() => toast("URL copiado"));
      }
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    bindEvents();
    if (isAuthed()) showAdmin();
    else showLogin();
  });
})();
