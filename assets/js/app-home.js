/* ============================================================
   ZAD — home page controller
   Renders the pathways grid, the units grid (search + filters),
   the social section, and keeps everything in sync with the
   language toggle and the signed-in user's saved units.
   ============================================================ */
(function () {
  const state = {
    status : 'all',   // all | available | soon | saved
    major  : 'all',   // major slug or 'all'
    query  : '',
    saved  : new Set(),
    signedIn: false,
  };

  const L = () => ZAD.lang;
  const grid       = document.getElementById('courses-grid');
  const majorsGrid = document.getElementById('majors-grid');
  const majorBar   = document.getElementById('major-filter-bar');

  /* ---------------- pathways ---------------- */
  function renderMajors() {
    majorsGrid.innerHTML = ZAD.MAJORS.map((m, i) => {
      const count  = ZAD.unitsByMajor(m.slug).length;
      const links  = ZAD.resourcesFor(m.slug).length;
      const skills = (L() === 'ar' ? m.skillsAr : m.skillsEn) || [];
      return `
        <article class="major-card reveal" data-delay="${(i % 4) + 1}"
                 data-major="${ZAD.esc(m.slug)}" style="--accent:${m.accent}">
          <div class="major-icon">${ZAD.ICONS[m.icon] || ZAD.ICONS.book}</div>
          <div>
            <h4>${ZAD.esc(L() === 'ar' ? m.ar : m.en)}</h4>
            <div class="en">${ZAD.esc(L() === 'ar' ? m.en : m.ar)}</div>
          </div>
          <p>${ZAD.esc(L() === 'ar' ? m.descAr : m.descEn)}</p>
          <div class="major-meta">
            <span class="tag accent">${ZAD.esc(ZAD.countUnits(count))}</span>
            <span class="tag">${links} ${ZAD.esc(ZAD.t('links_label'))}</span>
            ${skills.slice(0, 2).map(s => `<span class="tag">${ZAD.esc(s)}</span>`).join('')}
          </div>
          <div class="major-btns">
            <button type="button" class="btn btn-soft btn-sm" data-sheet="${ZAD.esc(m.slug)}">
              ${ZAD.esc(ZAD.t('open_pathway'))}</button>
            <button type="button" class="btn btn-ghost btn-sm" data-filter-major="${ZAD.esc(m.slug)}">
              ${ZAD.esc(ZAD.t('majors_view'))}</button>
          </div>
        </article>`;
    }).join('');

    majorsGrid.querySelectorAll('[data-sheet]').forEach(btn => {
      btn.addEventListener('click', () => ZAD.openPathwaySheet(btn.getAttribute('data-sheet')));
    });
    majorsGrid.querySelectorAll('[data-filter-major]').forEach(btn => {
      btn.addEventListener('click', () => {
        const slug = btn.getAttribute('data-filter-major');
        state.major = state.major === slug ? 'all' : slug;
        syncMajorUI();
        renderUnits();
        document.getElementById('courses').scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
    ZAD.observeReveal();
  }

  /* ---------------- study tools strip ---------------- */
  function renderTools() {
    const host = document.getElementById('tools-grid');
    if (!host) return;

    const tools = [
      { icon:'spark', accent:'var(--a-fuchsia)', url:'quiz.html?mode=placement',
        ar:'ما المسار المناسب لي؟', en:'Which pathway suits me?',
        dAr:'١٢ سؤالًا ترشّح لك أفضل ٣ مسارات حسب ميولك.',
        dEn:'12 questions that suggest your best three pathways.' },
      { icon:'check', accent:'var(--a-emerald)', url:'quiz.html?mode=daily',
        ar:'تحدي اليوم', en:'Daily challenge',
        dAr:'٥ أسئلة جديدة كل يوم — نفس الأسئلة لكل الطلاب.',
        dEn:'5 fresh questions daily — the same for every student.' },
      { icon:'gamepad', accent:'var(--a-lime)', url:'quiz.html',
        ar:`لعبة الأسئلة · ${ZAD.statOf('questions')} سؤالًا`, en:`Question game · ${ZAD.statOf('questions')} questions`,
        dAr:'اختبر نفسك في أي مسار، مع شرح لكل إجابة.',
        dEn:'Test yourself on any pathway, with an explanation for every answer.' },
      { icon:'book', accent:'var(--a-cyan)', url:'glossary.html',
        ar:`المعجم · ${ZAD.statOf('glossary')} مصطلحًا`, en:`Glossary · ${ZAD.statOf('glossary')} terms`,
        dAr:'كل مصطلح تقني بالعربية والإنجليزية مع تعريف واضح.',
        dEn:'Every technical term in Arabic and English with a clear definition.' },
    ];

    host.innerHTML = tools.map((t, i) => `
      <a class="tool-card reveal" data-delay="${(i % 4) + 1}" href="${t.url}" style="--accent:${t.accent}">
        <span class="major-icon">${ZAD.ICONS[t.icon]}</span>
        <b>${ZAD.esc(L() === 'ar' ? t.ar : t.en)}</b>
        <p>${ZAD.esc(L() === 'ar' ? t.dAr : t.dEn)}</p>
        <span class="tool-go">${L() === 'ar' ? '&#8592;' : '&#8594;'}</span>
      </a>`).join('');
    ZAD.observeReveal();
  }

  /* ---------------- pathway filter chips ---------------- */
  function renderMajorBar() {
    majorBar.innerHTML =
      `<button type="button" data-mf="all" class="active">${ZAD.esc(ZAD.t('filter_all'))}</button>` +
      ZAD.MAJORS.map(m =>
        `<button type="button" data-mf="${ZAD.esc(m.slug)}">${ZAD.esc(L() === 'ar' ? m.ar : m.en)}</button>`
      ).join('');

    majorBar.querySelectorAll('[data-mf]').forEach(b => {
      b.addEventListener('click', () => {
        state.major = b.getAttribute('data-mf');
        syncMajorUI();
        renderUnits();
        ZAD.keepInView(document.querySelector('#courses .toolbar'));
      });
    });
    syncMajorUI();
  }

  function syncMajorUI() {
    majorBar.querySelectorAll('[data-mf]').forEach(b =>
      b.classList.toggle('active', b.getAttribute('data-mf') === state.major)
    );
    majorsGrid.querySelectorAll('[data-major]').forEach(c =>
      c.classList.toggle('selected', c.getAttribute('data-major') === state.major)
    );
  }

  /* ---------------- units ---------------- */
  function matches(u) {
    if (state.status === 'available' && !u.file) return false;
    if (state.status === 'soon'      &&  u.file) return false;
    if (state.status === 'saved'     && !state.saved.has(u.n)) return false;
    if (state.major !== 'all' && u.major !== state.major) return false;
    if (state.query) {
      const hay = `${u.n} ${u.ar} ${u.en} ${u.descAr} ${u.descEn} ${u.code || ''}`.toLowerCase();
      if (!hay.includes(state.query)) return false;
    }
    return true;
  }

  function unitCard(u, i) {
    const m       = ZAD.majorBySlug(u.major);
    const title   = L() === 'ar' ? u.ar : u.en;
    const sub     = L() === 'ar' ? u.en : u.ar;
    const desc    = L() === 'ar' ? u.descAr : u.descEn;
    const isSaved = state.saved.has(u.n);

    const meta = [
      m ? `<span class="tag" style="color:${m.accent};border-color:${m.accent}44">
             ${ZAD.esc(L() === 'ar' ? m.ar : m.en)}</span>` : '',
      u.code    ? `<span class="tag">${ZAD.esc(u.code)}</span>` : '',
      u.glh     ? `<span class="tag">${u.glh} ${ZAD.esc(ZAD.t('glh_label'))}</span>` : '',
      u.credits ? `<span class="tag">${u.credits} ${ZAD.esc(ZAD.t('credits_label'))}</span>` : '',
      u.assess  ? `<span class="tag">${ZAD.esc(ZAD.t(
                     u.assess === 'pearson_set' ? 'assess_set' : 'assess_internal'))}</span>` : '',
    ].filter(Boolean).join('');

    const action = u.file
      ? `<a class="btn btn-primary" href="${ZAD.esc(u.file)}" target="_blank" rel="noopener">
           ${ZAD.ICONS.download}<span>${ZAD.esc(ZAD.t('pdf_view'))}</span></a>`
      : `<span class="btn btn-ghost" aria-disabled="true">${ZAD.esc(ZAD.t('soon_label'))}</span>`;

    return `
      <article class="course-card" style="animation-delay:${Math.min(i, 12) * 35}ms">
        <div class="course-top">
          <span class="course-num">Unit ${String(u.n).padStart(2, '0')}</span>
          <span class="badge ${u.file ? 'badge-ok' : 'badge-soon'}">
            ${ZAD.esc(ZAD.t(u.file ? 'available_label' : 'soon_label'))}
          </span>
        </div>
        <h4>${ZAD.esc(title)}</h4>
        <div class="en">${ZAD.esc(sub)}</div>
        <p>${ZAD.esc(desc)}</p>
        <div class="course-meta">${meta}</div>
        <div class="course-actions">
          ${action}
          <button type="button" class="icon-btn" data-sheet-unit="${u.n}"
                  title="${ZAD.esc(ZAD.t('open_workspace'))}"
                  aria-label="${ZAD.esc(ZAD.t('open_workspace'))}">
            ${ZAD.ICONS.book}
          </button>
          <button type="button" class="icon-btn${isSaved ? ' saved' : ''}" data-save="${u.n}"
                  aria-pressed="${isSaved}"
                  title="${ZAD.esc(ZAD.t(isSaved ? 'unsave_unit' : 'save_unit'))}"
                  aria-label="${ZAD.esc(ZAD.t(isSaved ? 'unsave_unit' : 'save_unit'))}">
            ${isSaved ? ZAD.ICONS.bookmarkFill : ZAD.ICONS.bookmark}
          </button>
        </div>
      </article>`;
  }

  function renderUnits() {
    const list = ZAD.UNITS.filter(matches);

    grid.innerHTML = list.length
      ? list.map(unitCard).join('')
      : `<div class="empty-state">
           ${ZAD.ICONS.search}
           <h4 style="color:var(--text);margin-block-end:6px">${ZAD.esc(ZAD.t('no_results'))}</h4>
           <p>${ZAD.esc(ZAD.t('no_results_sub'))}</p>
         </div>`;

    grid.querySelectorAll('[data-save]').forEach(btn => {
      btn.addEventListener('click', () => onSave(Number(btn.getAttribute('data-save'))));
    });
    grid.querySelectorAll('[data-sheet-unit]').forEach(btn => {
      btn.addEventListener('click', () =>
        ZAD.openUnitSheet(Number(btn.getAttribute('data-sheet-unit'))));
    });
  }

  async function onSave(unitNo) {
    if (!state.signedIn) {
      ZAD.toast(ZAD.t('msg_need_login'), 'info');
      setTimeout(() => (location.href = 'signin.html'), 900);
      return;
    }
    const res = await ZAD.toggleSaved(unitNo);
    if (res.error) { ZAD.toast(res.error.message || ZAD.t('err_generic'), 'err'); return; }

    if (res.saved) state.saved.add(unitNo); else state.saved.delete(unitNo);
    ZAD.toast(ZAD.t(res.saved ? 'msg_saved' : 'msg_removed'), 'ok', 1600);
    renderUnits();
  }

  /* ---------------- social ---------------- */
  function renderSocial() {
    const owner = document.getElementById('owner-card');
    const name  = L() === 'ar' ? ZAD.OWNER.name_ar : ZAD.OWNER.name_en;
    const role  = L() === 'ar' ? ZAD.OWNER.role_ar : ZAD.OWNER.role_en;
    owner.innerHTML = `
      <div class="avatar">R</div>
      <div class="oc-t">
        <b>${ZAD.esc(name)}</b>
        <small>${ZAD.esc(role)}</small>
        <small style="display:block;font-family:var(--font-mono);color:var(--p-300);margin-block-start:4px">
          ${ZAD.esc(ZAD.OWNER.handle)}
        </small>
      </div>`;

    document.getElementById('social-grid').innerHTML = ZAD.SOCIAL.map(s => `
      <a class="social-card" href="${ZAD.esc(s.url)}" target="_blank" rel="noopener noreferrer"
         style="--accent:${s.accent}" aria-label="${ZAD.esc(s.label)} ${ZAD.esc(s.handle)}">
        ${ZAD.ICONS[s.key] || ZAD.ICONS.globe}
        <span>${ZAD.esc(s.label)}</span>
        <small>${ZAD.esc(s.handle)}</small>
      </a>`).join('');
  }

  /* ---------------- live data from Supabase (optional) ---------------- */
  async function hydrateFromDB() {
    if (!ZAD.dbReady || !ZAD.FEATURES?.liveDB) return;
    try {
      const [{ data: majors }, { data: units }] = await Promise.all([
        ZAD.db.from('majors').select('*').order('sort_order'),
        ZAD.db.from('units').select('*').order('sort_order'),
      ]);

      if (majors?.length) {
        ZAD.MAJORS = majors.map(m => {
          const local = ZAD.majorBySlug(m.slug);
          return {
            slug: m.slug, icon: m.icon || 'book', accent: m.accent || 'var(--p-400)',
            ar: m.name_ar, en: m.name_en, descAr: m.desc_ar, descEn: m.desc_en,
            skillsAr: local?.skillsAr || [], skillsEn: local?.skillsEn || [],
          };
        });
      }
      if (units?.length) {
        ZAD.UNITS = units.map(u => ({
          n: u.unit_no, code: u.btec_code, major: u.major_slug,
          glh: u.glh, credits: u.credits, assess: u.assessment,
          ar: u.title_ar, en: u.title_en,
          descAr: u.desc_ar, descEn: u.desc_en,
          file: u.pdf_path,
        }));
      }
      if (majors?.length || units?.length) renderAll();
    } catch (e) {
      console.warn('[ZAD] live data unavailable, using bundled content.', e?.message || e);
    }
  }

  /* ---------------- wiring ---------------- */
  function renderAll() {
    renderMajors();
    renderMajorBar();
    renderTools();
    renderUnits();
    renderSocial();
    ZAD.applyLang(ZAD.lang);
    ZAD.observeReveal();
  }

  /* Deep links from the palette, the quiz page and shared URLs:
     index.html?unit=4 opens that unit sheet, ?major=slug filters. */
  function applyDeepLink() {
    const params = new URLSearchParams(location.search);
    const major = params.get('major');
    const unit  = params.get('unit');

    if (major && ZAD.majorBySlug(major)) {
      state.major = major;
      syncMajorUI();
      renderUnits();
      document.getElementById('courses')?.scrollIntoView({ behavior:'smooth', block:'start' });
    }
    if (unit && ZAD.UNITS.some(u => u.n === Number(unit))) {
      ZAD.openUnitSheet(Number(unit));
    }
  }

  function init() {
    document.getElementById('search-icon').innerHTML = ZAD.ICONS.search;

    ZAD.boot();
    ZAD.bootShell();
    ZAD.mountFooter('#site-footer');
    ZAD.wireNavAuth();
    renderAll();
    applyDeepLink();

    /* status filters */
    document.querySelectorAll('#filter-bar [data-filter]').forEach(b => {
      b.addEventListener('click', () => {
        document.querySelectorAll('#filter-bar [data-filter]')
          .forEach(x => x.classList.remove('active'));
        b.classList.add('active');
        state.status = b.getAttribute('data-filter');
        renderUnits();
        // filtering 17 units down to 5 must not leave you below the list
        ZAD.keepInView(document.querySelector('#courses .toolbar'));
      });
    });

    /* search (debounced) */
    let timer = null;
    document.getElementById('unit-search').addEventListener('input', e => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        state.query = e.target.value.trim().toLowerCase();
        renderUnits();
        ZAD.keepInView(document.querySelector('#courses .toolbar'));
      }, 160);
    });

    /* language switch re-renders everything */
    document.addEventListener('zad:lang', renderAll);

    /* auth state → saved units + hero CTA */
    ZAD.onAuth(async user => {
      state.signedIn = !!user;
      ZAD.setStoreUser(user?.id);
      state.saved = user ? await ZAD.getSaved() : new Set();

      const cta = document.getElementById('hero-cta2');
      if (cta) {
        cta.setAttribute('href', user ? 'dashboard.html' : 'signin.html');
        cta.querySelector('span').setAttribute('data-i18n', user ? 'hero_cta3' : 'hero_cta2');
        ZAD.applyLang(ZAD.lang);
      }
      renderUnits();
    });

    hydrateFromDB();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
