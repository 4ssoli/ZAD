/* ============================================================
   ZAD — glossary controller
   Search and filter the bilingual term list. Both languages are
   always searched, so typing "firewall" finds the Arabic entry
   and typing "جدار" finds the English one.
   ============================================================ */
(function () {
  const L    = () => ZAD.lang;
  const pick = (ar, en) => (L() === 'ar' ? ar : en);

  const state = { query:'', major:'all' };

  const grid   = document.getElementById('gloss-grid');
  const bar    = document.getElementById('gloss-filter');
  const count  = document.getElementById('gloss-count');
  const search = document.getElementById('gloss-search');

  function matches(t) {
    if (state.major !== 'all' && t.major !== state.major) return false;
    if (!state.query) return true;
    return `${t.ar} ${t.en} ${t.defAr} ${t.defEn}`.toLowerCase().includes(state.query);
  }

  function render() {
    const list = ZAD.GLOSSARY.filter(matches).sort((a, b) =>
      L() === 'ar' ? a.ar.localeCompare(b.ar, 'ar') : a.en.localeCompare(b.en, 'en'));

    count.textContent = pick(
      `${list.length} من ${ZAD.GLOSSARY_COUNT} مصطلحًا`,
      `${list.length} of ${ZAD.GLOSSARY_COUNT} terms`);

    grid.innerHTML = list.length ? list.map(t => {
      const m = ZAD.majorBySlug(t.major);
      return `
        <article class="gloss-card" style="--accent:${m ? m.accent : 'var(--p-400)'}">
          <div class="gc-head">
            <h3>${ZAD.esc(pick(t.ar, t.en))}</h3>
            <span class="gc-alt">${ZAD.esc(pick(t.en, t.ar))}</span>
          </div>
          <p>${ZAD.esc(pick(t.defAr, t.defEn))}</p>
          <p class="gc-alt-def">${ZAD.esc(pick(t.defEn, t.defAr))}</p>
          ${m ? `<button type="button" class="tag accent gc-path" data-path="${ZAD.esc(t.major)}">
                   ${ZAD.esc(pick(m.ar, m.en))}</button>` : ''}
        </article>`;
    }).join('') : `
      <div class="empty-state">
        ${ZAD.ICONS.search}
        <h4 style="color:var(--text);margin-block-end:6px">${ZAD.esc(ZAD.t('no_results'))}</h4>
        <p>${ZAD.esc(ZAD.t('no_results_sub'))}</p>
      </div>`;

    grid.querySelectorAll('[data-path]').forEach(b =>
      b.addEventListener('click', () => ZAD.openPathwaySheet(b.getAttribute('data-path'))));
  }

  function renderFilters() {
    bar.innerHTML =
      `<button type="button" data-gf="all" class="${state.major === 'all' ? 'active' : ''}">
         ${ZAD.esc(ZAD.t('filter_all'))}</button>` +
      (ZAD.MAJORS || []).map(m => `
        <button type="button" data-gf="${ZAD.esc(m.slug)}"
                class="${state.major === m.slug ? 'active' : ''}">
          ${ZAD.esc(pick(m.ar, m.en))}</button>`).join('');

    bar.querySelectorAll('[data-gf]').forEach(b => b.addEventListener('click', () => {
      state.major = b.getAttribute('data-gf');
      renderFilters();
      render();
      // a filter can shrink 143 cards to 8; without this you are left
      // staring at the footer where the list used to be
      ZAD.keepInView(document.querySelector('.toolbar'));
    }));
  }

  function init() {
    ZAD.boot();
    ZAD.bootShell();
    ZAD.mountFooter('#site-footer');
    ZAD.wireNavAuth();

    document.getElementById('gloss-icon').innerHTML = ZAD.ICONS.search;

    /* deep links: glossary.html?q=…&major=… */
    const params = new URLSearchParams(location.search);
    const q = params.get('q');
    const major = params.get('major');
    if (q) { state.query = q.toLowerCase(); search.value = q; }
    if (major && ZAD.majorBySlug(major)) state.major = major;

    renderFilters();
    render();

    let timer = null;
    search.addEventListener('input', e => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        state.query = e.target.value.trim().toLowerCase();
        render();
        ZAD.keepInView(document.querySelector('.toolbar'));
      }, 140);
    });

    document.addEventListener('zad:lang', () => { renderFilters(); render(); });
    ZAD.onAuth(user => ZAD.setStoreUser(user?.id));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
