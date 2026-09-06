/* ============================================================
   ZAD — shared UI engine
   Background layers, nav behaviour, language toggle, scroll
   reveal, animated counters, toasts, shared footer.
   ============================================================ */
window.ZAD = window.ZAD || {};

(function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- tiny helpers ---------- */
  ZAD.esc = function (s) {
    return String(s ?? '').replace(/[&<>"']/g, c => (
      { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]
    ));
  };
  ZAD.el = function (tag, cls, html) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  };

  /* ---------- scroll position ----------
     Views that swap their whole contents (the quiz, a filtered list) leave
     the window where it was, so a visitor who was half way down the page
     lands in the middle of the new view — or below it, staring at the
     footer. These two helpers put the reader where they expect to be. */

  /** Jump to the top of the page. Instant, not smooth: during a quiz a
      half-second glide between questions feels broken, not polished. */
  ZAD.scrollTop = function () {
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  /** Only scrolls if the element's top has gone above the viewport, so
      re-rendering a list you are already looking at never yanks the page. */
  ZAD.keepInView = function (el) {
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const navH = parseInt(getComputedStyle(document.documentElement)
      .getPropertyValue('--nav-h'), 10) || 70;
    if (window.scrollY > top - navH) {
      window.scrollTo({ top: Math.max(0, top - navH - 16), behavior: 'auto' });
    }
  };

  /* ---------- on-demand data files ----------
     The question bank, the glossary, the criteria and the resource lists
     are big. Loading all of them on every page meant the home page pulled
     down the whole quiz bank just to print "135 questions". Instead each
     page loads only what it renders, and anything else is fetched the
     moment it is first needed — opening a unit sheet, the pathway sheet
     or the search palette.

       await ZAD.ensure(['criteria']);           // one file
       await ZAD.ensure(['glossary','resources']);

     Calling it twice is free: the promise is cached, and a file already
     present as a <script> tag resolves immediately. */
  const pending = {};
  ZAD.ensure = function (names) {
    return Promise.all((names || []).map(name => {
      if (pending[name]) return pending[name];

      const src = `assets/js/${name}.js`;
      const already = [...document.scripts].some(s => (s.getAttribute('src') || '').endsWith(src));
      if (already) return (pending[name] = Promise.resolve(name));

      pending[name] = new Promise((resolve) => {
        const el = document.createElement('script');
        el.src = src;
        el.onload = () => resolve(name);
        el.onerror = () => {
          console.warn(`[ZAD] could not load ${src} — that feature will be empty.`);
          resolve(name);           // never block the UI on a missing file
        };
        document.head.appendChild(el);
      });
      return pending[name];
    }));
  };

  /* ---------- background layers ---------- */
  ZAD.mountBackground = function () {
    if (document.querySelector('.bg-fixed')) return;
    const frag = document.createDocumentFragment();
    frag.appendChild(ZAD.el('div', 'bg-fixed'));
    if (ZAD.FEATURES?.aurora && !reduceMotion) frag.appendChild(ZAD.el('div', 'bg-aurora'));
    frag.appendChild(ZAD.el('div', 'grid-overlay'));
    frag.appendChild(ZAD.el('div', 'noise'));
    if (ZAD.FEATURES?.particles && !reduceMotion) {
      const c = document.createElement('canvas');
      c.id = 'particles';
      frag.appendChild(c);
    }
    document.body.prepend(frag);
    initParticles();
  };

  /* ---------- constellation canvas ---------- */
  function initParticles() {
    const canvas = document.getElementById('particles');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let dots = [], w = 0, h = 0, raf = null;
    const pointer = { x: -9999, y: -9999 };

    // The dot and link colours come from CSS custom properties, so the
    // constellation turns pink with the light theme instead of staying violet.
    let dotRGB = '167,139,250', lineRGB = '139,92,246';
    function readColours() {
      const css = getComputedStyle(document.documentElement);
      dotRGB  = (css.getPropertyValue('--particle-dot')  || '').trim() || dotRGB;
      lineRGB = (css.getPropertyValue('--particle-line') || '').trim() || lineRGB;
    }
    readColours();
    document.addEventListener('zad:theme', readColours);

    function resize() {
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    /* The link-drawing pass compares every dot with every other one, so the
       cost grows with the square of the count: 78 dots is ~3,000 checks per
       frame, which is real work for a phone battery. Phones get a much
       smaller field, and devices that report little memory or Data Saver
       get none at all. */
    const conn = navigator.connection || {};
    const lowPower = conn.saveData === true
      || (navigator.deviceMemory && navigator.deviceMemory <= 2)
      || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2);

    function seed() {
      if (lowPower) { dots = []; return; }
      const cap = w < 700 ? 26 : 78;                 // phones get a third
      const count = Math.min(cap, Math.max(16, Math.floor(w / 20)));
      dots = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 1.5 + 0.6,
      }));
    }
    function frame() {
      ctx.clearRect(0, 0, w, h);
      for (const p of dots) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        // gentle drift away from the cursor
        const dx = p.x - pointer.x, dy = p.y - pointer.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 14400 && d2 > 0.01) {
          const f = (1 - d2 / 14400) * 0.55, d = Math.sqrt(d2);
          p.x += (dx / d) * f; p.y += (dy / d) * f;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${dotRGB},.5)`;
        ctx.fill();
      }
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const a = dots[i], b = dots[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 128) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(${lineRGB},${0.15 * (1 - dist / 128)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(frame);
    }

    resize(); seed();
    if (dots.length) frame();
    else canvas.remove();          // nothing to draw: drop the canvas entirely

    let resizeTimer = null;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);   // fires constantly while a phone rotates
      resizeTimer = setTimeout(() => { resize(); seed(); }, 150);
    });
    window.addEventListener('pointermove', e => { pointer.x = e.clientX; pointer.y = e.clientY; });
    window.addEventListener('pointerleave', () => { pointer.x = pointer.y = -9999; });
    // pause when the tab is hidden so we don't burn battery
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) { cancelAnimationFrame(raf); raf = null; }
      else if (!raf) frame();
    });
  }

  /* ---------- scroll reveal ---------- */
  let io = null;
  ZAD.observeReveal = function () {
    if (reduceMotion) {
      document.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));
      return;
    }
    if (!io) {
      io = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    }
    document.querySelectorAll('.reveal:not(.in)').forEach(el => io.observe(el));
  };

  /* ---------- animated counters ---------- */
  ZAD.countUp = function () {
    const nums = document.querySelectorAll('[data-count]');
    if (!nums.length) return;
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        obs.unobserve(e.target);
        const target = parseFloat(e.target.getAttribute('data-count'));
        if (Number.isNaN(target)) return;
        if (reduceMotion) { e.target.textContent = target; return; }
        const dur = 1100, t0 = performance.now();
        (function step(now) {
          const p = Math.min((now - t0) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          e.target.textContent = Math.round(target * eased);
          if (p < 1) requestAnimationFrame(step);
        })(t0);
      });
    }, { threshold: 0.5 });
    nums.forEach(n => obs.observe(n));
  };

  /* ---------- nav ---------- */
  ZAD.initNav = function () {
    const nav = document.querySelector('.nav');
    if (nav) {
      const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 12);
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
    }
    const burger = document.querySelector('.nav-burger');
    const links  = document.querySelector('.nav-links');
    if (burger && links) {
      // Tap-to-close layer behind the panel. Built here so every page gets it
      // without repeating the markup in each HTML file.
      const scrim = ZAD.el('div', 'nav-scrim');
      document.body.appendChild(scrim);

      const setMenu = (open) => {
        links.classList.toggle('open', open);
        scrim.classList.toggle('show', open);
        document.body.classList.toggle('nav-open', open);
        burger.setAttribute('aria-expanded', String(open));
      };
      const close = () => setMenu(false);

      burger.addEventListener('click', () => setMenu(!links.classList.contains('open')));
      scrim.addEventListener('click', close);
      links.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
      document.addEventListener('keydown', e => {
        if (e.key !== 'Escape' || !links.classList.contains('open')) return;
        close();
        burger.focus();
      });

      // Rotating to landscape or resizing past the breakpoint leaves the panel
      // hidden by CSS but still "open" in state — reset it so the scrim and the
      // body scroll lock don't linger.
      const desktop = window.matchMedia('(min-width: 861px)');
      const onBreakpoint = e => { if (e.matches) close(); };
      desktop.addEventListener
        ? desktop.addEventListener('change', onBreakpoint)
        : desktop.addListener(onBreakpoint);
    }
    document.querySelectorAll('[data-lang-btn]').forEach(btn => {
      btn.addEventListener('click', () => ZAD.applyLang(btn.getAttribute('data-lang-btn')));
    });
  };

  /* ---------- toasts ---------- */
  ZAD.toast = function (message, kind = 'info', ms = 3200) {
    let wrap = document.querySelector('.toast-wrap');
    if (!wrap) { wrap = ZAD.el('div', 'toast-wrap'); document.body.appendChild(wrap); }
    const icon = kind === 'ok' ? ZAD.ICONS.check : kind === 'err' ? ZAD.ICONS.alert : ZAD.ICONS.info;
    const t = ZAD.el('div', `toast ${kind}`, `${icon}<span>${ZAD.esc(message)}</span>`);
    t.setAttribute('role', 'status');
    wrap.appendChild(t);
    setTimeout(() => {
      t.classList.add('out');
      t.addEventListener('animationend', () => t.remove(), { once: true });
    }, ms);
  };

  /* ---------- shared footer ---------- */
  ZAD.mountFooter = function (mount) {
    const host = typeof mount === 'string' ? document.querySelector(mount) : mount;
    if (!host) return;
    const socials = (ZAD.SOCIAL || []).map(s =>
      `<li><a href="${s.url}" target="_blank" rel="noopener noreferrer">${ZAD.esc(s.label)} · ${ZAD.esc(s.handle)}</a></li>`
    ).join('');

    host.innerHTML = `
      <div class="foot-grid">
        <div class="foot-about">
          <div class="brand">
            <div class="mark">Z</div>
            <div><div class="brand-ar">زاد</div><div class="brand-en">ZAD</div></div>
          </div>
          <p data-i18n="foot_about_p"></p>
        </div>
        <div>
          <h5 data-i18n="foot_links_t"></h5>
          <ul>
            <li><a href="index.html#about"   data-i18n="nav_about"></a></li>
            <li><a href="index.html#majors"  data-i18n="nav_majors"></a></li>
            <li><a href="index.html#courses" data-i18n="nav_courses"></a></li>
            <li><a href="quiz.html"          data-i18n="nav_quiz"></a></li>
            <li><a href="glossary.html"      data-i18n="nav_glossary"></a></li>
            <li><a href="signin.html"        data-i18n="nav_signin"></a></li>
            <li><a href="#" data-news-link><span data-i18n="whatsnew_title"></span></a></li>
            <li><a href="#" data-shortcuts-link data-i18n="shortcuts_title"></a></li>
          </ul>
        </div>
        <div>
          <h5 data-i18n="foot_social_t"></h5>
          <ul>${socials}</ul>
        </div>
      </div>
      <div class="foot-bottom">
        <div class="foot-brand">زاد · ZAD</div>
        <p><span data-i18n="footer_text"></span> · <span data-i18n="footer_rights"></span></p>
        <p style="margin-block-start:6px">
          <span data-i18n="footer_by"></span>
          <a href="${ZAD.SOCIAL[0].url}" target="_blank" rel="noopener noreferrer"
             style="color:var(--p-300);text-decoration:none;font-weight:700">
            ${ZAD.esc(ZAD.OWNER.name_en)}
          </a>
          <span style="color:var(--muted-2)">· ${ZAD.esc(ZAD.OWNER.handle)}</span>
        </p>
      </div>`;
  };

  /* ---------- boot ---------- */
  ZAD.boot = function () {
    ZAD.mountBackground();
    ZAD.initNav();
    ZAD.applyLang(ZAD.lang);
    ZAD.observeReveal();
    ZAD.countUp();
  };
})();
