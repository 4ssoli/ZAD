/* ============================================================
   ZAD — sign in / sign up controller
   Builds the education choice controls from ZAD.CHOICES, walks
   the 3-step wizard, validates, and talks to Supabase auth.
   ============================================================ */
(function () {
  const L = () => ZAD.lang;
  const $  = sel => document.querySelector(sel);
  const label = o => (L() === 'ar' ? o.ar : o.en);

  const formIn  = $('#form-signin');
  const formUp  = $('#form-signup');
  const alertEl = $('#alert-slot');
  let step = 1;

  /* ---------------- alerts ---------------- */
  function showAlert(msg, kind = 'err') {
    const icon = kind === 'ok'   ? ZAD.ICONS.check
               : kind === 'info' ? ZAD.ICONS.info
               : kind === 'warn' ? ZAD.ICONS.alert
               : ZAD.ICONS.alert;
    alertEl.innerHTML = `<div class="alert alert-${kind}">${icon}<div>${ZAD.esc(msg)}</div></div>`;
    alertEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
  const clearAlert = () => (alertEl.innerHTML = '');

  /* ---------------- build the choice controls ---------------- */
  function buildChoices() {
    /* role — cards */
    $('#role-grid').innerHTML = ZAD.CHOICES.roles.map((r, i) => `
      <label class="choice">
        <input type="radio" name="su-role" value="${ZAD.esc(r.v)}" ${i === 0 ? 'checked' : ''}>
        <span class="ci">${ZAD.ICONS[r.icon] || ZAD.ICONS.user}</span>
        <span class="ct">${ZAD.esc(label(r))}</span>
        <span class="cs">${ZAD.esc(L() === 'ar' ? r.subAr : r.subEn)}</span>
      </label>`).join('');

    /* selects */
    const opts = (arr, ph) =>
      `<option value="">${ZAD.esc(ph)}</option>` +
      arr.map(o => `<option value="${ZAD.esc(o.v)}">${ZAD.esc(label(o))}</option>`).join('');

    $('#su-level').innerHTML   = opts(ZAD.CHOICES.levels,    ZAD.t('f_choose'));
    $('#su-year').innerHTML    = opts(ZAD.CHOICES.years,     ZAD.t('f_choose'));
    $('#su-country').innerHTML = opts(ZAD.CHOICES.countries, ZAD.t('f_choose'));

    $('#su-major').innerHTML =
      `<option value="">${ZAD.esc(ZAD.t('f_choose'))}</option>` +
      ZAD.MAJORS.map(m =>
        `<option value="${ZAD.esc(m.slug)}">${ZAD.esc(L() === 'ar' ? m.ar : m.en)}</option>`
      ).join('');

    /* interests — multi-select chips */
    $('#interests-grid').innerHTML = ZAD.CHOICES.interests.map(i => `
      <label class="chip-opt">
        <input type="checkbox" name="su-interest" value="${ZAD.esc(i.v)}">
        <span>${ZAD.esc(label(i))}</span>
      </label>`).join('');

    /* marketing perks */
    $('#auth-perks').innerHTML = [
      ['bookmark', 'perk1_t', 'perk1_s'],
      ['chart',    'perk2_t', 'perk2_s'],
      ['spark',    'perk3_t', 'perk3_s'],
    ].map(([icon, t, s]) => `
      <div class="auth-perk">
        <div class="pi">${ZAD.ICONS[icon]}</div>
        <div><b>${ZAD.esc(ZAD.t(t))}</b><small>${ZAD.esc(ZAD.t(s))}</small></div>
      </div>`).join('');

    /* password eye buttons */
    document.querySelectorAll('.pw-toggle').forEach(b => {
      if (!b.innerHTML.trim()) b.innerHTML = ZAD.ICONS.eye;
    });
  }

  /* ---------------- keep selections across a language switch ---------------- */
  function snapshot() {
    return {
      role     : document.querySelector('[name="su-role"]:checked')?.value,
      level    : $('#su-level').value,
      year     : $('#su-year').value,
      country  : $('#su-country').value,
      major    : $('#su-major').value,
      interests: [...document.querySelectorAll('[name="su-interest"]:checked')].map(c => c.value),
    };
  }
  function restore(s) {
    if (!s) return;
    if (s.role) {
      const r = document.querySelector(`[name="su-role"][value="${s.role}"]`);
      if (r) r.checked = true;
    }
    if (s.level)   $('#su-level').value   = s.level;
    if (s.year)    $('#su-year').value    = s.year;
    if (s.country) $('#su-country').value = s.country;
    if (s.major)   $('#su-major').value   = s.major;
    s.interests?.forEach(v => {
      const c = document.querySelector(`[name="su-interest"][value="${v}"]`);
      if (c) c.checked = true;
    });
  }

  /* ---------------- tabs ---------------- */
  function switchTab(which) {
    clearAlert();
    document.querySelectorAll('[data-tab]').forEach(b =>
      b.classList.toggle('active', b.getAttribute('data-tab') === which)
    );
    formIn.hidden = which !== 'signin';
    formUp.hidden = which !== 'signup';
  }

  /* ---------------- wizard ---------------- */
  function goStep(n) {
    step = n;
    document.querySelectorAll('.step-panel').forEach(p =>
      p.classList.toggle('active', p.getAttribute('data-panel') === String(n))
    );
    document.querySelectorAll('.step-dot').forEach(d => {
      const s = Number(d.getAttribute('data-step'));
      d.classList.toggle('active', s === n);
      d.classList.toggle('done',   s <  n);
    });
    formUp.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* ---------------- validation ---------------- */
  const emailOk = v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v).trim());

  function validateStep1() {
    const email = $('#su-email').value.trim();
    const pw    = $('#su-pw').value;
    const uname = $('#su-username').value.trim();

    if (!email || !pw)            { showAlert(ZAD.t('err_fill'));     return false; }
    if (!emailOk(email))          { showAlert(ZAD.t('err_email'));    return false; }
    if (pw.length < 6)            { showAlert(ZAD.t('err_pw_short')); return false; }
    if (uname && !/^[a-zA-Z0-9_.]{3,24}$/.test(uname)) {
      showAlert(ZAD.t('err_username')); return false;
    }
    clearAlert();
    return true;
  }

  /* password strength meter */
  function scorePw(v) {
    let s = 0;
    if (v.length >= 6)  s++;
    if (v.length >= 10) s++;
    if (/[A-Z]/.test(v) && /[a-z]/.test(v)) s++;
    if (/\d/.test(v) && /[^A-Za-z0-9]/.test(v)) s++;
    return Math.min(s, 4);
  }
  function paintMeter() {
    const s = scorePw($('#su-pw').value);
    document.querySelectorAll('#pw-meter i').forEach((bar, i) => {
      bar.className = i < s ? `on-${s}` : '';
    });
  }

  /* ---------------- submit ---------------- */
  function busy(btn, on) {
    btn.disabled = on;
    const span = btn.querySelector('span');
    if (on) {
      btn.dataset.label = span.textContent;
      span.textContent = '…';
      btn.insertAdjacentHTML('afterbegin', '<i class="spinner"></i>');
    } else {
      span.textContent = btn.dataset.label || span.textContent;
      btn.querySelector('.spinner')?.remove();
    }
  }

  async function onSignIn(e) {
    e.preventDefault();
    clearAlert();
    const email = $('#si-email').value.trim();
    const pw    = $('#si-pw').value;

    if (!email || !pw)   { showAlert(ZAD.t('err_fill'));  return; }
    if (!emailOk(email)) { showAlert(ZAD.t('err_email')); return; }

    const btn = $('#si-submit');
    busy(btn, true);
    const { error } = await ZAD.signIn(email, pw);
    busy(btn, false);

    if (error) { showAlert(error.message || ZAD.t('err_generic')); return; }
    showAlert(ZAD.t('msg_signed_in'), 'ok');
    setTimeout(() => (location.href = 'dashboard.html'), 700);
  }

  async function onSignUp(e) {
    e.preventDefault();
    if (!validateStep1()) { goStep(1); return; }

    const payload = {
      email         : $('#su-email').value.trim(),
      password      : $('#su-pw').value,
      full_name     : $('#su-name').value.trim() || null,
      username      : $('#su-username').value.trim() || null,
      role          : document.querySelector('[name="su-role"]:checked')?.value || 'student',
      edu_level     : $('#su-level').value   || null,
      study_year    : $('#su-year').value    || null,
      major_slug    : $('#su-major').value   || null,
      school        : $('#su-school').value.trim() || null,
      country       : $('#su-country').value || null,
      preferred_lang: document.querySelector('[name="su-lang"]:checked')?.value || ZAD.lang,
      interests     : [...document.querySelectorAll('[name="su-interest"]:checked')].map(c => c.value),
    };

    const btn = $('#su-submit');
    busy(btn, true);
    const { data, error } = await ZAD.signUp(payload);
    busy(btn, false);

    if (error) { showAlert(error.message || ZAD.t('err_generic')); return; }

    // Supabase returns a session immediately only when email confirmation is off.
    if (data?.session) {
      showAlert(ZAD.t('msg_signed_in'), 'ok');
      setTimeout(() => (location.href = 'dashboard.html'), 700);
    } else {
      showAlert(ZAD.t('msg_check_mail'), 'info');
    }
  }

  async function onForgot(e) {
    e.preventDefault();
    const email = $('#si-email').value.trim();
    if (!emailOk(email)) { showAlert(ZAD.t('reset_need_email'), 'warn'); return; }
    const { error } = await ZAD.resetPassword(email);
    if (error) { showAlert(error.message || ZAD.t('err_generic')); return; }
    showAlert(ZAD.t('reset_sent'), 'ok');
  }

  /* ---------------- init ---------------- */
  function init() {
    ZAD.boot();
    ZAD.bootShell();
    buildChoices();
    ZAD.applyLang(ZAD.lang);

    if (!ZAD.dbReady) showAlert(ZAD.t('msg_offline'), 'warn');

    /* already signed in? go straight to the dashboard */
    ZAD.onAuth(user => { if (user) location.replace('dashboard.html'); });

    /* tab switching */
    document.querySelectorAll('[data-tab]').forEach(b =>
      b.addEventListener('click', () => switchTab(b.getAttribute('data-tab')))
    );
    document.querySelectorAll('[data-goto]').forEach(a =>
      a.addEventListener('click', e => { e.preventDefault(); switchTab(a.getAttribute('data-goto')); })
    );
    if (location.hash === '#signup') switchTab('signup');

    /* wizard nav */
    document.querySelectorAll('[data-next]').forEach(b =>
      b.addEventListener('click', () => {
        const to = Number(b.getAttribute('data-next'));
        if (to === 2 && !validateStep1()) return;
        goStep(to);
      })
    );
    document.querySelectorAll('[data-prev]').forEach(b =>
      b.addEventListener('click', () => goStep(Number(b.getAttribute('data-prev'))))
    );

    /* password visibility + strength */
    document.querySelectorAll('.pw-toggle').forEach(btn =>
      btn.addEventListener('click', () => {
        const input = document.getElementById(btn.getAttribute('data-pw-for'));
        const show  = input.type === 'password';
        input.type  = show ? 'text' : 'password';
        btn.innerHTML = show ? ZAD.ICONS.eyeOff : ZAD.ICONS.eye;
      })
    );
    $('#su-pw').addEventListener('input', paintMeter);

    /* submits */
    formIn.addEventListener('submit', onSignIn);
    formUp.addEventListener('submit', onSignUp);
    $('#forgot-link').addEventListener('click', onForgot);

    /* rebuild the localized controls when the language changes */
    document.addEventListener('zad:lang', () => {
      const snap = snapshot();
      buildChoices();
      restore(snap);
      ZAD.applyLang(ZAD.lang);
      document.querySelectorAll('.pw-toggle').forEach(b => (b.innerHTML = ZAD.ICONS.eye));
      document.querySelectorAll('input[type="password"], input[type="text"]').forEach(i => {
        if (i.id === 'su-pw' || i.id === 'si-pw') i.type = 'password';
      });
      paintMeter();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
