/* ============================================================
   ZAD — shared shell
   Everything that belongs to every page rather than to one:
   the modal component, the light/dark theme, the command
   palette, keyboard shortcuts, the What is new panel and the
   service-worker registration.

   Load after ui.js and before the page controller.
   ============================================================ */
window.ZAD = window.ZAD || {};

(function () {
  const L = () => ZAD.lang;
  const pick = (ar, en) => (L() === 'ar' ? ar : en);

  /* ============================================================
     1. Modal
     ZAD.modal({ title, body, wide, onClose }) → { root, close, body }
     ============================================================ */
  let openModals = 0;

  ZAD.modal = function ({ title = '', body = '', wide = false, onClose = null } = {}) {
    const root = ZAD.el('div', 'zmodal');
    root.innerHTML = `
      <div class="zmodal-scrim" data-close></div>
      <div class="zmodal-card${wide ? ' wide' : ''}" role="dialog" aria-modal="true">
        <div class="zmodal-head">
          <h3>${title}</h3>
          <button type="button" class="icon-btn" data-close
                  aria-label="${ZAD.esc(ZAD.t('close'))}">&#10005;</button>
        </div>
        <div class="zmodal-body"></div>
      </div>`;

    const bodyEl = root.querySelector('.zmodal-body');
    if (typeof body === 'string') bodyEl.innerHTML = body;
    else if (body) bodyEl.appendChild(body);

    const previouslyFocused = document.activeElement;

    function close() {
      root.classList.add('out');
      openModals = Math.max(0, openModals - 1);
      if (!openModals) document.body.classList.remove('modal-open');
      setTimeout(() => {
        root.remove();
        try { previouslyFocused?.focus?.(); } catch (e) { /* gone from the DOM */ }
      }, 200);
      document.removeEventListener('keydown', onKey);
      if (onClose) onClose();
    }

    function onKey(e) {
      if (e.key === 'Escape') { e.stopPropagation(); close(); return; }
      if (e.key !== 'Tab') return;
      // keep focus inside the dialog
      const items = [...root.querySelectorAll(
        'a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])'
      )].filter(el => el.offsetParent !== null);
      if (!items.length) return;
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }

    root.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', close));
    document.addEventListener('keydown', onKey);

    document.body.appendChild(root);
    document.body.classList.add('modal-open');
    openModals++;
    requestAnimationFrame(() => root.classList.add('in'));
    setTimeout(() => root.querySelector('.zmodal-card')?.focus?.(), 30);

    return { root, close, body: bodyEl };
  };

  /* ============================================================
     2. Theme — dark by default, light optional
     ============================================================ */
  ZAD.theme = (function () {
    try { return localStorage.getItem('zad-theme') || 'dark'; } catch (e) { return 'dark'; }
  })();

  ZAD.applyTheme = function (theme) {
    ZAD.theme = theme === 'light' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', ZAD.theme);
    try { localStorage.setItem('zad-theme', ZAD.theme); } catch (e) { /* private mode */ }

    // keep this in step with --bg in the light theme and the inline boot script
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', ZAD.theme === 'light' ? '#fdf8fb' : '#07050f');

    document.querySelectorAll('[data-theme-btn]').forEach(b => {
      b.setAttribute('aria-pressed', String(ZAD.theme === 'light'));
      b.title = pick(
        ZAD.theme === 'light' ? 'الوضع الداكن' : 'الوضع الفاتح',
        ZAD.theme === 'light' ? 'Dark mode' : 'Light mode'
      );
    });
    document.dispatchEvent(new CustomEvent('zad:theme', { detail: { theme: ZAD.theme } }));
  };

  ZAD.toggleTheme = () => ZAD.applyTheme(ZAD.theme === 'light' ? 'dark' : 'light');

  /** Adds the theme button + the palette button into the nav of every page. */
  ZAD.mountShellButtons = function () {
    const right = document.querySelector('.nav-right');
    if (!right || right.querySelector('[data-theme-btn]')) return;

    const search = ZAD.el('button', 'icon-btn nav-shell-btn');
    search.type = 'button';
    search.setAttribute('data-palette-btn', '');
    search.setAttribute('aria-label', ZAD.t('palette_open'));
    search.title = ZAD.t('palette_open');
    search.innerHTML = ZAD.ICONS.search;
    search.addEventListener('click', () => ZAD.openPalette());

    const theme = ZAD.el('button', 'icon-btn nav-shell-btn');
    theme.type = 'button';
    theme.setAttribute('data-theme-btn', '');
    theme.innerHTML = `
      <svg class="ico-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
           stroke-linecap="round"><circle cx="12" cy="12" r="4"/>
        <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4"/></svg>
      <svg class="ico-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
           stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>`;
    theme.addEventListener('click', () => ZAD.toggleTheme());

    const first = right.firstChild;
    right.insertBefore(theme, first);
    right.insertBefore(search, theme);
    ZAD.applyTheme(ZAD.theme);
  };

  /* ============================================================
     3. Command palette — everything on the site in one search
     ============================================================ */
  let paletteOpen = null;

  function paletteIndex() {
    const items = [];

    (ZAD.UNITS || []).forEach(u => items.push({
      kind : 'unit',
      label: pick(u.ar, u.en),
      sub  : `Unit ${String(u.n).padStart(2, '0')} · ${pick(u.en, u.ar)}`,
      hay  : `${u.n} ${u.ar} ${u.en} ${u.code || ''}`.toLowerCase(),
      go   : () => ZAD.goto(`index.html?unit=${u.n}`),
    }));

    (ZAD.MAJORS || []).forEach(m => items.push({
      kind : 'pathway',
      label: pick(m.ar, m.en),
      sub  : pick(m.en, m.ar),
      hay  : `${m.ar} ${m.en} ${m.slug}`.toLowerCase(),
      go   : () => ZAD.goto(`index.html?major=${m.slug}`),
    }));

    (ZAD.GLOSSARY || []).forEach(t => items.push({
      kind : 'term',
      label: pick(t.ar, t.en),
      sub  : pick(t.en, t.ar),
      hay  : `${t.ar} ${t.en}`.toLowerCase(),
      go   : () => ZAD.goto(`glossary.html?q=${encodeURIComponent(t.en)}`),
    }));

    (ZAD.MAJORS || []).forEach(m => items.push({
      kind : 'quiz',
      label: pick(`اختبار: ${m.ar}`, `Quiz: ${m.en}`),
      sub  : pick('١٠ أسئلة سريعة', '10 quick questions'),
      hay  : `quiz ${m.ar} ${m.en} اختبار`.toLowerCase(),
      go   : () => ZAD.goto(`quiz.html?major=${m.slug}&mode=quick`),
    }));

    /* every curated resource, so searching "unity" or "figma" finds the tool */
    Object.entries(ZAD.RESOURCES || {}).forEach(([slug, links]) => {
      const m = ZAD.majorBySlug(slug);
      links.forEach(r => items.push({
        kind : 'link',
        label: pick(r.ar, r.en),
        sub  : m ? pick(m.ar, m.en) : r.url,
        hay  : `${r.ar} ${r.en} ${r.url} ${r.descEn}`.toLowerCase(),
        go   : () => window.open(r.url, '_blank', 'noopener,noreferrer'),
      }));
    });

    [
      { label: pick('الصفحة الرئيسية', 'Home'), url:'index.html', hay:'home رئيسية' },
      { label: pick('مركز الاختبارات', 'Quiz hub'), url:'quiz.html', hay:'quiz اختبار' },
      { label: pick('اختبار تحديد المسار', 'Placement quiz'), url:'quiz.html?mode=placement', hay:'placement تحديد مسار' },
      { label: pick('تحدي اليوم', 'Daily challenge'), url:'quiz.html?mode=daily', hay:'daily يومي تحدي' },
      { label: pick('البطاقات التعليمية', 'Flashcards'), url:'quiz.html?mode=cards', hay:'flashcards بطاقات' },
      { label: pick('المعجم', 'Glossary'), url:'glossary.html', hay:'glossary معجم مصطلحات' },
      { label: pick('لوحتي', 'My dashboard'), url:'dashboard.html', hay:'dashboard لوحة' },
    ].forEach(p => items.push({
      kind:'page', label:p.label, sub:p.url, hay:`${p.hay} ${p.label}`.toLowerCase(),
      go: () => ZAD.goto(p.url),
    }));

    return items;
  }

  ZAD.goto = function (url) { location.href = url; };

  ZAD.openPalette = async function () {
    if (paletteOpen) return;
    paletteOpen = { close() {} };            // claim the slot while loading

    // the glossary and resource lists are only downloaded the first time
    // someone actually opens the search
    await ZAD.ensure(['glossary', 'resources']);

    const index = paletteIndex();

    const wrap = ZAD.el('div', 'palette');
    wrap.innerHTML = `
      <div class="palette-scrim" data-close></div>
      <div class="palette-card" role="dialog" aria-modal="true" aria-label="${ZAD.esc(ZAD.t('palette_open'))}">
        <div class="palette-search">
          <span class="pi">${ZAD.ICONS.search}</span>
          <input type="text" id="palette-input" autocomplete="off" spellcheck="false"
                 placeholder="${ZAD.esc(ZAD.t('palette_ph'))}" aria-label="${ZAD.esc(ZAD.t('palette_ph'))}">
          <kbd>ESC</kbd>
        </div>
        <div class="palette-list" id="palette-list" role="listbox"></div>
        <div class="palette-foot">
          <span><kbd>&#8593;</kbd><kbd>&#8595;</kbd> ${ZAD.esc(ZAD.t('palette_move'))}</span>
          <span><kbd>&#8629;</kbd> ${ZAD.esc(ZAD.t('palette_open_hint'))}</span>
        </div>
      </div>`;

    document.body.appendChild(wrap);
    document.body.classList.add('modal-open');
    requestAnimationFrame(() => wrap.classList.add('in'));

    const input = wrap.querySelector('#palette-input');
    const list  = wrap.querySelector('#palette-list');
    let results = [], cursor = 0;

    const kindLabel = {
      unit   : pick('وحدة', 'Unit'),
      pathway: pick('مسار', 'Pathway'),
      term   : pick('مصطلح', 'Term'),
      quiz   : pick('اختبار', 'Quiz'),
      page   : pick('صفحة', 'Page'),
      link   : pick('مصدر', 'Resource'),
    };

    function render(query) {
      const q = query.trim().toLowerCase();
      results = (q
        ? index.filter(i => i.hay.includes(q) || i.label.toLowerCase().includes(q))
        : index.filter(i => i.kind === 'page' || i.kind === 'pathway')
      ).slice(0, 40);
      cursor = 0;

      list.innerHTML = results.length
        ? results.map((r, i) => `
            <button type="button" class="palette-item${i === 0 ? ' on' : ''}" data-i="${i}" role="option">
              <span class="pk pk-${r.kind}">${ZAD.esc(kindLabel[r.kind])}</span>
              <span class="pl">
                <b>${ZAD.esc(r.label)}</b>
                <small>${ZAD.esc(r.sub || '')}</small>
              </span>
            </button>`).join('')
        : `<div class="palette-empty">${ZAD.esc(ZAD.t('no_results'))}</div>`;

      list.querySelectorAll('[data-i]').forEach(b => {
        b.addEventListener('click', () => choose(Number(b.getAttribute('data-i'))));
      });
    }

    function move(step) {
      if (!results.length) return;
      cursor = (cursor + step + results.length) % results.length;
      list.querySelectorAll('.palette-item').forEach((el, i) => el.classList.toggle('on', i === cursor));
      list.querySelector('.palette-item.on')?.scrollIntoView({ block:'nearest' });
    }

    function choose(i) {
      const item = results[i];
      if (!item) return;
      close();
      item.go();
    }

    function close() {
      wrap.classList.remove('in');
      document.body.classList.remove('modal-open');
      setTimeout(() => wrap.remove(), 180);
      document.removeEventListener('keydown', onKey, true);
      paletteOpen = null;
    }

    function onKey(e) {
      if (e.key === 'Escape')    { e.preventDefault(); close(); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
      else if (e.key === 'ArrowUp')   { e.preventDefault(); move(-1); }
      else if (e.key === 'Enter')     { e.preventDefault(); choose(cursor); }
    }

    input.addEventListener('input', () => render(input.value));
    wrap.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', close));
    document.addEventListener('keydown', onKey, true);

    render('');
    setTimeout(() => input.focus(), 40);
    paletteOpen = { close };
  };

  /* ============================================================
     4. Keyboard shortcuts
     ============================================================ */
  ZAD.SHORTCUTS = [
    { keys:['Ctrl','K'], ar:'فتح البحث الشامل',       en:'Open the command palette' },
    { keys:['/'],        ar:'فتح البحث الشامل',       en:'Open the command palette' },
    { keys:['G','H'],    ar:'الذهاب للرئيسية',        en:'Go home' },
    { keys:['G','Q'],    ar:'الذهاب للاختبارات',      en:'Go to the quiz hub' },
    { keys:['G','G'],    ar:'الذهاب للمعجم',          en:'Go to the glossary' },
    { keys:['G','D'],    ar:'الذهاب للوحتي',          en:'Go to my dashboard' },
    { keys:['T'],        ar:'تبديل الوضع الفاتح/الداكن', en:'Toggle light / dark' },
    { keys:['L'],        ar:'تبديل اللغة',            en:'Switch language' },
    { keys:['?'],        ar:'عرض هذه القائمة',        en:'Show this list' },
    { keys:['Esc'],      ar:'إغلاق أي نافذة',         en:'Close any dialog' },
  ];

  ZAD.showShortcuts = function () {
    ZAD.modal({
      title: ZAD.esc(ZAD.t('shortcuts_title')),
      body: `<div class="shortcut-list">${ZAD.SHORTCUTS.map(s => `
        <div class="shortcut-row">
          <span>${ZAD.esc(pick(s.ar, s.en))}</span>
          <span class="keys">${s.keys.map(k => `<kbd>${ZAD.esc(k)}</kbd>`).join('')}</span>
        </div>`).join('')}</div>`,
    });
  };

  function typingInField(target) {
    const tag = (target?.tagName || '').toLowerCase();
    return tag === 'input' || tag === 'textarea' || tag === 'select' || target?.isContentEditable;
  }

  ZAD.initShortcuts = function () {
    let awaitingG = false, gTimer = null;

    document.addEventListener('keydown', e => {
      // Ctrl/Cmd+K works even inside a field
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault(); ZAD.openPalette(); return;
      }
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (typingInField(e.target)) return;

      const k = e.key.toLowerCase();

      if (awaitingG) {
        awaitingG = false;
        clearTimeout(gTimer);
        const dest = { h:'index.html', q:'quiz.html', g:'glossary.html', d:'dashboard.html' }[k];
        if (dest) { e.preventDefault(); ZAD.goto(dest); return; }
      }

      if (k === 'g') {
        awaitingG = true;
        gTimer = setTimeout(() => { awaitingG = false; }, 1200);
        return;
      }
      if (k === '/')  { e.preventDefault(); ZAD.openPalette(); }
      else if (k === '?' || (e.shiftKey && k === '/')) { e.preventDefault(); ZAD.showShortcuts(); }
      else if (k === 't') { ZAD.toggleTheme(); }
      else if (k === 'l') { ZAD.applyLang(ZAD.lang === 'ar' ? 'en' : 'ar'); }
    });
  };

  /* ============================================================
     5. What is new
     ============================================================ */
  ZAD.showChangelog = function () {
    const entries = ZAD.CHANGELOG || [];
    ZAD.modal({
      title: ZAD.esc(ZAD.t('whatsnew_title')),
      body: entries.length
        ? `<ol class="changelog">${entries.map(e => `
            <li>
              <div class="cl-head">
                <b>${ZAD.esc(pick(e.ar, e.en))}</b>
                <time>${ZAD.esc(e.date)}</time>
              </div>
              ${e.bodyAr || e.bodyEn
                ? `<p>${ZAD.esc(pick(e.bodyAr || '', e.bodyEn || ''))}</p>` : ''}
            </li>`).join('')}</ol>`
        : `<p style="color:var(--muted)">${ZAD.esc(ZAD.t('no_results'))}</p>`,
    });
    try { localStorage.setItem('zad-seen-news', (ZAD.CHANGELOG?.[0]?.date) || ''); } catch (e) { /* ignore */ }
    document.querySelectorAll('[data-news-dot]').forEach(d => d.remove());
  };

  ZAD.markNewsBadge = function () {
    const latest = ZAD.CHANGELOG?.[0]?.date;
    if (!latest) return;
    let seen = '';
    try { seen = localStorage.getItem('zad-seen-news') || ''; } catch (e) { /* ignore */ }
    if (seen === latest) return;

    document.querySelectorAll('[data-news-link]').forEach(link => {
      if (link.querySelector('[data-news-dot]')) return;
      const dot = ZAD.el('span', 'news-dot');
      dot.setAttribute('data-news-dot', '');
      link.appendChild(dot);
    });
  };

  /* ============================================================
     6. Service worker — offline support
     ============================================================ */
  ZAD.registerSW = function () {
    if (!('serviceWorker' in navigator)) return;
    if (location.protocol === 'file:') return;      // needs http(s)

    /* Pages are served from the cache first, which is what makes moving
       around instant — but it also means a freshly deployed version would
       otherwise sit unseen until the next navigation. When a new worker
       takes over, reload once so the visitor lands on the new build
       immediately. The flag stops that reload from ever looping. */
    let reloading = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (reloading) return;
      reloading = true;
      location.reload();
    });

    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js')
        .then(reg => {
          // ask the browser to look for a new sw.js on every page load
          reg.update?.();
        })
        .catch(err =>
          console.warn('[ZAD] service worker not registered:', err?.message || err));
    });
  };

  /* ============================================================
     7. Boot — call once per page, after ZAD.boot()
     ============================================================ */
  ZAD.bootShell = function () {
    ZAD.applyTheme(ZAD.theme);
    ZAD.mountShellButtons();
    ZAD.initShortcuts();
    ZAD.markNewsBadge();
    ZAD.registerSW();

    document.addEventListener('click', e => {
      const news = e.target.closest('[data-news-link]');
      if (news) { e.preventDefault(); ZAD.showChangelog(); }
      const keys = e.target.closest('[data-shortcuts-link]');
      if (keys) { e.preventDefault(); ZAD.showShortcuts(); }
    });

    document.addEventListener('zad:lang', () => {
      ZAD.applyTheme(ZAD.theme);   // refreshes the button title in the new language
    });
  };
})();
