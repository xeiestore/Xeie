/* ============================================
   XÉIE — Main JavaScript
   Header · Drawer · Search · i18n · FAQ
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  // ---------- Elements ----------
  const announceBar = document.querySelector('.announce-bar');
  const siteHeader = document.querySelector('.site-header');
  const hamburger = document.querySelector('.hamburger');
  const drawer = document.querySelector('.drawer');
  const drawerOverlay = document.querySelector('.drawer-overlay');
  const drawerClose = document.querySelector('.drawer-close');
  const searchToggle = document.querySelector('.search-toggle');
  const searchOverlay = document.querySelector('.search-overlay');
  const searchClose = document.querySelector('.search-close');
  const searchInput = document.querySelector('.search-input');
  const langToggle = document.querySelectorAll('.lang-toggle');
  const faqItems = document.querySelectorAll('.faq-item');

  // ---------- Announcement bar + Header scroll ----------
  let lastScroll = 0;
  const announceHeight = 36;
  const heroEl = document.querySelector('.hero');
  const hasDarkHero = heroEl && !heroEl.classList.contains('hero-logo-only');

  // On pages without a dark hero, keep header solid from the start
  if (!hasDarkHero) {
    siteHeader?.classList.add('scrolled');
  }

  function handleScroll() {
    const scrollY = window.scrollY;

    // Header solid state — only toggle on pages with a dark hero
    if (hasDarkHero) {
      if (scrollY > 40) {
        siteHeader?.classList.add('scrolled');
      } else {
        siteHeader?.classList.remove('scrolled');
      }
    }

    // Announce bar hide on scroll down, show near top
    if (scrollY > lastScroll && scrollY > 80) {
      announceBar?.classList.add('hidden');
      if (siteHeader) siteHeader.style.top = '0';
    } else {
      announceBar?.classList.remove('hidden');
      if (siteHeader) siteHeader.style.top = `${announceHeight}px`;
    }

    lastScroll = scrollY;
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // ---------- Mobile Drawer ----------
  function openDrawer() {
    drawer?.classList.add('open');
    drawerOverlay?.classList.add('open');
    hamburger?.classList.add('open');
    document.body.classList.add('drawer-open');
  }

  function closeDrawer() {
    drawer?.classList.remove('open');
    drawerOverlay?.classList.remove('open');
    hamburger?.classList.remove('open');
    document.body.classList.remove('drawer-open');
  }

  hamburger?.addEventListener('click', openDrawer);
  drawerClose?.addEventListener('click', closeDrawer);
  drawerOverlay?.addEventListener('click', closeDrawer);

  // Close drawer on link click
  document.querySelectorAll('.drawer-nav a').forEach(link => {
    link.addEventListener('click', closeDrawer);
  });

  // ---------- Search Overlay ----------
  function openSearch() {
    searchOverlay?.classList.add('open');
    setTimeout(() => searchInput?.focus(), 100);
  }

  function closeSearch() {
    searchOverlay?.classList.remove('open');
    if (searchInput) searchInput.value = '';
    renderSearchResults([]);
  }

  searchToggle?.addEventListener('click', openSearch);
  searchClose?.addEventListener('click', closeSearch);

  // Close search on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeSearch();
      closeDrawer();
    }
  });

  // ---------- Simple Search ----------
  const searchData = window.XEIE_SEARCH_DATA || [];

  function renderSearchResults(results) {
    const container = document.querySelector('.search-results');
    if (!container) return;

    if (results.length === 0) {
      container.innerHTML = searchInput?.value.trim()
        ? `<div class="empty-state"><p data-i18n="search_no_results">Nenhum resultado encontrado</p></div>`
        : '';
      return;
    }

    container.innerHTML = results.map(item => `
      <a href="${item.url}" class="search-result-item">
        <div class="search-result-thumb"></div>
        <div class="search-result-info">
          <h4>${item.title}</h4>
          <span>${item.category} · ${item.type}</span>
        </div>
      </a>
    `).join('');
  }

  searchInput?.addEventListener('input', (e) => {
    const q = e.target.value.trim().toLowerCase();
    if (!q) {
      renderSearchResults([]);
      return;
    }
    const results = searchData.filter(item =>
      item.title.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      (item.tags && item.tags.some(t => t.toLowerCase().includes(q)))
    ).slice(0, 8);
    renderSearchResults(results);
  });

  // ---------- Language Toggle ----------
  const savedLang = localStorage.getItem('xeie-lang') || 'pt';
  setLanguage(savedLang);

  langToggle.forEach(btn => {
    btn.addEventListener('click', () => {
      const current = document.documentElement.lang || 'pt';
      const next = current === 'pt' ? 'en' : 'pt';
      setLanguage(next);
      localStorage.setItem('xeie-lang', next);
    });
  });

  function setLanguage(lang) {
    document.documentElement.lang = lang;

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (window.XEIE_I18N && window.XEIE_I18N[lang] && window.XEIE_I18N[lang][key]) {
        el.textContent = window.XEIE_I18N[lang][key];
      }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (window.XEIE_I18N && window.XEIE_I18N[lang] && window.XEIE_I18N[lang][key]) {
        el.placeholder = window.XEIE_I18N[lang][key];
      }
    });

    // Update toggle labels
    document.querySelectorAll('.lang-toggle').forEach(btn => {
      const pt = btn.querySelector('[data-lang="pt"]');
      const en = btn.querySelector('[data-lang="en"]');
      if (pt && en) {
        pt.classList.toggle('active', lang === 'pt');
        en.classList.toggle('active', lang === 'en');
      }
    });
  }

  // ---------- FAQ Accordion ----------
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    question?.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      faqItems.forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });

  // ---------- Form submission (Cloudflare Workers ready) ----------
  const pedidoForm = document.getElementById('pedido-form');
  if (pedidoForm) {
    pedidoForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = pedidoForm.querySelector('[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = document.documentElement.lang === 'pt' ? 'A enviar...' : 'Sending...';

      const formData = new FormData(pedidoForm);
      const data = Object.fromEntries(formData.entries());

      try {
        // Cloudflare Worker endpoint — change to your worker URL
        const response = await fetch('/api/pedido', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        if (response.ok) {
          pedidoForm.reset();
          alert(document.documentElement.lang === 'pt'
            ? 'Pedido enviado com sucesso! Receberá um email com a referência bancária em breve.'
            : 'Request sent successfully! You will receive an email with the bank reference shortly.');
        } else {
          throw new Error('Server error');
        }
      } catch (err) {
        // Fallback for development
        console.log('Form data:', data);
        alert(document.documentElement.lang === 'pt'
          ? 'Pedido registado (modo de teste). Em produção será enviado via Cloudflare Worker.'
          : 'Request recorded (test mode). In production it will be sent via Cloudflare Worker.');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    });
  }
});
