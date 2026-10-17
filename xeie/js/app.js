/**
 * Xéie – public catalog loader
 * Fetches live catalog.json from Cloudinary; falls back to products.js defaults.
 * Re-renders any .products-grid on the page.
 */
(function () {
  "use strict";

  const CATALOG_URL =
    "https://res.cloudinary.com/efvlvhce/raw/upload/xeie/catalog.json";

  function formatKz(n) {
    return Number(n || 0).toLocaleString("pt-AO") + " Kz";
  }

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function placeholderSvg() {
    return `<div class="img-placeholder"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg><span data-i18n="product_placeholder">Imagem em breve</span></div>`;
  }

  function cardHtml(p) {
    const href = "produto.html?id=" + encodeURIComponent(p.id);
    const img = p.image
      ? `<img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.name)}" loading="lazy" />`
      : placeholderSvg();
    const badge = p.image
      ? ""
      : `<span class="product-card-badge" data-i18n="coming_soon">Em breve</span>`;
    const cat = escapeHtml(p.category || "");
    return `
      <a href="${href}" class="product-card" data-cat="${cat.toLowerCase()}">
        <div class="product-card-img">
          ${img}
          ${badge}
        </div>
        <div class="product-card-body">
          <p class="product-card-category">${cat}</p>
          <h3 class="product-card-title">${escapeHtml(p.name)}</h3>
          <p class="product-card-price"><span class="from" data-i18n="product_from">desde</span> ${formatKz(p.price)}</p>
        </div>
      </a>`;
  }

  function getCategoryFilter() {
    const params = new URLSearchParams(window.location.search);
    return (params.get("cat") || "").toLowerCase().trim();
  }

  function renderGrids(products) {
    const grids = document.querySelectorAll(".products-grid");
    if (!grids.length) return;

    const cat = getCategoryFilter();
    let list = products.filter((p) => p.active !== false);
    if (cat) {
      list = list.filter((p) =>
        String(p.category || "")
          .toLowerCase()
          .includes(cat)
      );
    }

    grids.forEach((grid) => {
      if (!list.length) {
        grid.innerHTML =
          '<p class="empty-state" style="grid-column:1/-1;padding:2rem;text-align:center">Nenhum produto disponível.</p>';
        return;
      }
      grid.innerHTML = list.map(cardHtml).join("");
    });
  }

  async function loadCatalog() {
    try {
      const res = await fetch(CATALOG_URL + "?t=" + Date.now(), {
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.products) && data.products.length) {
          return data.products;
        }
      }
    } catch (e) {
      console.warn("Catalog fetch failed, using defaults", e);
    }
    return window.XEIE_DEFAULT_PRODUCTS || [];
  }

  async function boot() {
    const products = await loadCatalog();
    window.XEIE_LIVE_PRODUCTS = products;
    renderGrids(products);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
