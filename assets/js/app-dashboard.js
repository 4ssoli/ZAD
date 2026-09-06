/* ============================================================
   ZAD — dashboard controller
   Guards the page, loads the profile / saved units / progress,
   renders the KPIs and panels, and saves profile edits.
   ============================================================ */
(function () {
  const L = () => ZAD.lang;
  const $ = sel => document.querySelector(sel);
  const label = o => (L() === 'ar' ? o.ar : o.en);

  const view = {
    loading: $('#dash-loading'),
    guest  : $('#dash-guest'),
    main   : $('#dash-main'),
  };

  const state = {
    user: null, profile: null, saved: new Set(), progress: [],
    deadlines: {}, attempts: [], mastery: {}, streak: 0,
    classes: { owned: [], joined: [] },
  };
  const pick = (ar, en) => (L() === 'ar' ? ar : en);

  function show(which) {
    view.loading.hidden = which !== 'loading';
    view.guest.hidden   = which !== 'guest';
    view.main.hidden    = which !== 'main';
  }

  const unitByNo = n => ZAD.UNITS.find(u => u.n === n);
  const unitTitle = u => (L() === 'ar' ? u.ar : u.en);

  /* ---------------- header ---------------- */
  function renderHead() {
    const p = state.profile || {};
    const name = p.full_name || p.username || (state.user.email || '').split('@')[0];

    $('#dash-avatar').textContent = (name || '?').charAt(0).toUpperCase();
    $('#dash-name').textContent   = name;
    $('#dash-email').textContent  = state.user.email || '';

    const major = ZAD.majorBySlug(p.major_slug);
    const find  = (arr, v) => arr.find(o => o.v === v);
    const role  = find(ZAD.CHOICES.roles,     p.role);
    const level = find(ZAD.CHOICES.levels,    p.edu_level);
    const year  = find(ZAD.CHOICES.years,     p.study_year);
    const ctry  = find(ZAD.CHOICES.countries, p.country);

    const tags = [
      role  ? `<span class="tag accent" style="--accent:var(--p-400)">${ZAD.esc(label(role))}</span>` : '',
      major ? `<span class="tag" style="color:${major.accent};border-color:${major.accent}44">
                 ${ZAD.esc(L() === 'ar' ? major.ar : major.en)}</span>` : '',
      level ? `<span class="tag">${ZAD.esc(label(level))}</span>` : '',
      year  ? `<span class="tag">${ZAD.esc(label(year))}</span>`  : '',
      p.school  ? `<span class="tag">${ZAD.esc(p.school)}</span>` : '',
      ctry  ? `<span class="tag">${ZAD.esc(label(ctry))}</span>`  : '',
    ].filter(Boolean).join('');

    $('#dash-tags').innerHTML = tags;
  }

  /* ---------------- KPIs ---------------- */
  function renderKPIs() {
    const done = state.progress.filter(p => p.percent >= 100).length;
    const avg  = state.progress.length
      ? Math.round(state.progress.reduce((s, p) => s + p.percent, 0) / state.progress.length)
      : 0;
    const inPathway = state.profile?.major_slug
      ? ZAD.unitsByMajor(state.profile.major_slug).length
      : ZAD.UNITS.length;

    $('#kpi-saved').textContent    = state.saved.size;
    $('#kpi-progress').textContent = avg;
    $('#kpi-done').textContent     = done;
    $('#kpi-pathway').textContent  = inPathway;
  }

  /* ---------------- unit row ---------------- */
  function unitRow(u, extra = '') {
    const m = ZAD.majorBySlug(u.major);
    const open = `<button type="button" class="btn btn-soft btn-sm" data-open-unit="${u.n}">
           ${ZAD.esc(u.file ? ZAD.t('pdf_view') : ZAD.t('open_workspace'))}</button>`;

    return `
      <div class="progress-row">
        <span class="course-num">${String(u.n).padStart(2, '0')}</span>
        <div class="pr-main">
          <div class="pr-name">${ZAD.esc(unitTitle(u))}</div>
          ${m ? `<span class="tag" style="color:${m.accent};border-color:${m.accent}44">
                   ${ZAD.esc(L() === 'ar' ? m.ar : m.en)}</span>` : ''}
          ${extra}
        </div>
        ${open}
      </div>`;
  }

  const emptyMsg = key =>
    `<p style="color:var(--muted-2);font-size:13.5px;text-align:center;padding-block:18px">
       ${ZAD.esc(ZAD.t(key))}</p>`;

  /* ---------------- panels ---------------- */
  function renderSaved() {
    const list = [...state.saved].map(unitByNo).filter(Boolean);
    $('#saved-list').innerHTML = list.length
      ? list.map(u => unitRow(u)).join('')
      : emptyMsg('dash_empty_saved');
    wireUnitButtons('#saved-list');
  }

  /* every unit row opens the unit workspace sheet */
  function wireUnitButtons(scope) {
    document.querySelectorAll(`${scope} [data-open-unit]`).forEach(b =>
      b.addEventListener('click', () => ZAD.openUnitSheet(Number(b.getAttribute('data-open-unit')))));
  }

  function renderProgress() {
    const rows = state.progress
      .map(p => ({ p, u: unitByNo(p.unit_no) }))
      .filter(r => r.u)
      .sort((a, b) => b.p.percent - a.p.percent);

    $('#progress-list').innerHTML = rows.length
      ? rows.map(({ p, u }) => `
          <div class="progress-row">
            <div class="pr-main">
              <div class="pr-name">${ZAD.esc(unitTitle(u))}</div>
              <div class="bar"><i style="inline-size:${p.percent}%"></i></div>
            </div>
            <span class="pr-pct">${p.percent}%</span>
            <input type="range" min="0" max="100" step="10" value="${p.percent}"
                   data-prog="${u.n}" style="inline-size:96px;accent-color:var(--p-500)"
                   aria-label="${ZAD.esc(unitTitle(u))}">
          </div>`).join('')
      : emptyMsg('dash_empty_prog');

    wireProgressInputs('#progress-list');
  }

  function renderReco() {
    const slug = state.profile?.major_slug;
    const list = (slug ? ZAD.unitsByMajor(slug) : ZAD.UNITS.filter(u => u.file)).slice(0, 6);
    const seen = new Map(state.progress.map(p => [p.unit_no, p.percent]));

    $('#reco-list').innerHTML = list.length
      ? list.map(u => unitRow(u, `
          <div style="display:flex;align-items:center;gap:9px;margin-block-start:8px">
            <input type="range" min="0" max="100" step="10" value="${seen.get(u.n) ?? 0}"
                   data-prog="${u.n}" style="inline-size:110px;accent-color:var(--p-500)"
                   aria-label="${ZAD.esc(unitTitle(u))}">
            <span class="pr-pct" data-prog-out="${u.n}">${seen.get(u.n) ?? 0}%</span>
          </div>`)).join('')
      : emptyMsg('dash_empty_prog');

    wireProgressInputs('#reco-list');
    wireUnitButtons('#reco-list');
  }

  /* progress sliders — save on release, not on every pixel */
  function wireProgressInputs(scope) {
    document.querySelectorAll(`${scope} [data-prog]`).forEach(input => {
      const no = Number(input.getAttribute('data-prog'));

      input.addEventListener('input', () => {
        const out = document.querySelector(`[data-prog-out="${no}"]`);
        if (out) out.textContent = input.value + '%';
      });

      input.addEventListener('change', async () => {
        const pct = Number(input.value);
        const res = await ZAD.setProgress(no, pct);
        if (res.error) { ZAD.toast(res.error.message || ZAD.t('err_generic'), 'err'); return; }

        const row = state.progress.find(p => p.unit_no === no);
        if (row) row.percent = pct;
        else state.progress.push({ unit_no: no, percent: pct, state: 'in_progress' });

        ZAD.toast(ZAD.t('msg_saved'), 'ok', 1400);
        renderKPIs();
        renderProgress();
      });
    });
  }

  /* ---------------- deadlines ---------------- */
  function renderDeadlines() {
    const rows = Object.entries(state.deadlines)
      .map(([no, row]) => ({ u: unitByNo(Number(no)), row, days: ZAD.daysUntil(row.due) }))
      .filter(r => r.u && r.days != null)
      .sort((a, b) => a.days - b.days);

    $('#deadline-count').textContent = rows.length
      ? pick(`${rows.length} موعد`, `${rows.length} due`) : '';

    $('#deadline-list').innerHTML = rows.length ? rows.map(({ u, row, days }) => {
      const cls = days < 0 ? 'late' : days <= 3 ? 'soon' : '';
      const when = days < 0 ? pick(`متأخر ${Math.abs(days)} يوم`, `${Math.abs(days)}d overdue`)
                 : days === 0 ? pick('اليوم', 'today')
                 : pick(`${days} يوم`, `${days}d`);
      return `
        <button type="button" class="deadline-row ${cls}" data-unit="${u.n}">
          <span class="dl-when">${ZAD.esc(when)}</span>
          <span class="dl-main">
            <b>${ZAD.esc(unitTitle(u))}</b>
            ${row.title ? `<small>${ZAD.esc(row.title)}</small>` : ''}
          </span>
          <span class="course-num">${String(u.n).padStart(2, '0')}</span>
        </button>`;
    }).join('') : `
      <p style="color:var(--muted-2);font-size:13.5px;text-align:center;padding-block:18px">
        ${ZAD.esc(pick(
          'لا مواعيد مسجّلة. افتح أي وحدة وأضف موعد التسليم.',
          'No deadlines saved. Open any unit and add its due date.'))}</p>`;

    $('#deadline-list').querySelectorAll('[data-unit]').forEach(b =>
      b.addEventListener('click', () => ZAD.openUnitSheet(Number(b.getAttribute('data-unit')))));
  }

  /* ---------------- quiz mastery ---------------- */
  function renderMastery() {
    const entries = Object.entries(state.mastery).sort((a, b) => b[1] - a[1]);

    $('#mastery-list').innerHTML = entries.length ? `
      <div class="mastery-top">
        <span class="tag accent" style="--accent:var(--a-amber)">
          ${ZAD.esc(pick(`سلسلة ${state.streak} يوم`, `${state.streak} day streak`))}</span>
        <span class="tag">${ZAD.esc(pick(
          `${state.attempts.length} محاولة`, `${state.attempts.length} attempts`))}</span>
      </div>
      ${entries.map(([slug, pct]) => {
        const m = ZAD.majorBySlug(slug);
        const badge = ZAD.badgeFor(pct);
        return `
          <div class="progress-row">
            <div class="pr-main">
              <div class="pr-name">${badge ? badge.icon + ' ' : ''}${ZAD.esc(m ? label(m) : slug)}</div>
              <div class="bar"><i style="inline-size:${pct}%"></i></div>
            </div>
            <span class="pr-pct">${pct}%</span>
            <a class="btn btn-soft btn-sm" href="quiz.html?major=${ZAD.esc(slug)}&mode=quick">
              ${ZAD.esc(pick('أعد', 'Retry'))}</a>
          </div>`;
      }).join('')}` : `
      <p style="color:var(--muted-2);font-size:13.5px;text-align:center;padding-block:18px">
        ${ZAD.esc(pick(
          'لم تجرّب أي اختبار بعد — ابدأ باختبار سريع من صفحة الاختبارات.',
          'No quiz attempts yet — start with a quick quiz from the quiz page.'))}</p>`;
  }

  /* ---------------- study plan ---------------- */
  function buildPlanForm() {
    const slug = state.profile?.major_slug || '';
    $('#plan-major').innerHTML =
      `<option value="">${ZAD.esc(pick('كل الوحدات', 'All units'))}</option>` +
      ZAD.MAJORS.map(m =>
        `<option value="${ZAD.esc(m.slug)}"${m.slug === slug ? ' selected' : ''}>
           ${ZAD.esc(label(m))}</option>`).join('');
  }

  function makePlan() {
    const dateStr = $('#plan-date').value;
    const days = ZAD.daysUntil(dateStr);
    if (days == null || days <= 0) {
      ZAD.toast(pick('اختر تاريخًا في المستقبل.', 'Pick a date in the future.'), 'err');
      return;
    }
    const hours = Math.max(1, Number($('#plan-hours').value) || 6);
    const slug  = $('#plan-major').value;

    /* Units that still need work, hardest first: the least progress leads. */
    const done = new Map(state.progress.map(p => [p.unit_no, p.percent]));
    const pool = (slug ? ZAD.unitsByMajor(slug) : ZAD.UNITS)
      .map(u => ({ u, pct: done.get(u.n) ?? 0 }))
      .filter(r => r.pct < 100)
      .sort((a, b) => a.pct - b.pct);

    if (!pool.length) {
      $('#plan-out').innerHTML = `<p class="plan-empty">${ZAD.esc(pick(
        'كل وحدات هذا المسار مكتملة. اختر مسارًا آخر أو راجع بالبطاقات.',
        'Every unit in this pathway is complete. Pick another pathway or revise with flashcards.'))}</p>`;
      return;
    }

    const weeks = Math.max(1, Math.ceil(days / 7));
    const perWeek = Math.max(1, Math.ceil(pool.length / weeks));
    const hoursPerUnit = Math.max(1, Math.round(hours / perWeek));

    const blocks = [];
    for (let w = 0; w < weeks && w * perWeek < pool.length; w++) {
      blocks.push({
        week : w + 1,
        units: pool.slice(w * perWeek, (w + 1) * perWeek),
      });
    }

    $('#plan-out').innerHTML = `
      <div class="plan-head">
        <b>${ZAD.esc(pick(`${weeks} أسبوعًا حتى الامتحان`, `${weeks} weeks until the exam`))}</b>
        <span>${ZAD.esc(pick(
          `${ZAD.countUnits(pool.length)} غير مكتملة · ${hoursPerUnit} ساعات لكل وحدة تقريبًا`
            .replace('1 ساعات', 'ساعة واحدة').replace('2 ساعات', 'ساعتان'),
          `${pool.length} units left · about ${hoursPerUnit}h per unit`))}</span>
      </div>
      <ol class="plan-list">
        ${blocks.map(b => `
          <li>
            <span class="plan-w">${ZAD.esc(pick(`الأسبوع ${b.week}`, `Week ${b.week}`))}</span>
            <div class="plan-units">
              ${b.units.map(({ u, pct }) => `
                <button type="button" class="plan-unit" data-unit="${u.n}">
                  <span class="course-num">${String(u.n).padStart(2, '0')}</span>
                  <span>${ZAD.esc(unitTitle(u))}</span>
                  <small>${pct}%</small>
                </button>`).join('')}
              <a class="plan-quiz" href="quiz.html${slug ? `?major=${ZAD.esc(slug)}&mode=quick` : ''}">
                ${ZAD.esc(pick('اختبار نهاية الأسبوع', 'End-of-week quiz'))}</a>
            </div>
          </li>`).join('')}
      </ol>`;

    $('#plan-out').querySelectorAll('[data-unit]').forEach(b =>
      b.addEventListener('click', () => ZAD.openUnitSheet(Number(b.getAttribute('data-unit')))));
  }

  /* ---------------- share card ---------------- */
  function drawShareCard() {
    const canvas = $('#share-canvas');
    if (!canvas?.getContext) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;

    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, '#1e0a4d');
    grad.addColorStop(0.55, '#2e1065');
    grad.addColorStop(1, '#07050f');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = 'rgba(139,92,246,.22)';
    ctx.beginPath(); ctx.arc(W - 90, 90, 150, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(80, H - 60, 120, 0, Math.PI * 2); ctx.fill();

    const done  = state.progress.filter(p => p.percent >= 100).length;
    const avg   = state.progress.length
      ? Math.round(state.progress.reduce((s, p) => s + p.percent, 0) / state.progress.length) : 0;
    const name  = state.profile?.full_name || state.profile?.username
                || (state.user?.email || '').split('@')[0];

    ctx.textAlign = 'left';
    ctx.fillStyle = '#c4b5fd';
    ctx.font = '600 26px "Space Grotesk", Arial, sans-serif';
    ctx.fillText('ZAD  ·  IT BTEC', 60, 80);

    ctx.fillStyle = '#ffffff';
    ctx.font = '800 56px "Thmanyah Sans", Cairo, "Space Grotesk", Arial, sans-serif';
    ctx.fillText(String(name).slice(0, 22), 60, 160);

    const stats = [
      [String(done), pick('وحدة مكتملة', 'units done')],
      [`${avg}%`,    pick('متوسط التقدّم', 'avg progress')],
      [String(state.saved.size), pick('محفوظة', 'saved')],
      [String(state.streak),     pick('سلسلة أيام', 'day streak')],
    ];
    stats.forEach(([v, k], i) => {
      const x = 60 + i * 230;
      ctx.fillStyle = '#a78bfa';
      ctx.font = '700 64px "Space Grotesk", Arial, sans-serif';
      ctx.fillText(v, x, 320);
      ctx.fillStyle = '#cfc7ea';
      ctx.font = '500 22px "Thmanyah Sans", Cairo, Arial, sans-serif';
      ctx.fillText(k, x, 360);
    });

    const barW = W - 120, pctW = Math.round((avg / 100) * barW);
    ctx.fillStyle = 'rgba(255,255,255,.12)';
    ctx.fillRect(60, 420, barW, 16);
    ctx.fillStyle = '#8b5cf6';
    ctx.fillRect(60, 420, pctW, 16);

    ctx.fillStyle = '#9c93b8';
    ctx.font = '500 22px "Thmanyah Sans", Cairo, Arial, sans-serif';
    ctx.fillText(pick('منصة زاد التعليمية — تخصص تكنولوجيا المعلومات',
                      'ZAD Learning Platform — Information Technology'), 60, 500);
  }

  function downloadShareCard() {
    const canvas = $('#share-canvas');
    if (!canvas) return;
    drawShareCard();
    const link = document.createElement('a');
    link.download = 'zad-progress.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  /* ---------------- classes ---------------- */
  function renderClasses() {
    const host = $('#class-body');
    if (!ZAD.dbReady) {
      host.innerHTML = `<p style="color:var(--muted-2);font-size:13.5px">
        ${ZAD.esc(ZAD.t('msg_offline'))}</p>`;
      return;
    }
    const isTeacher = state.profile?.role === 'teacher';
    const { owned, joined } = state.classes;

    host.innerHTML = `
      <p class="panel-lede">${ZAD.esc(pick(
        'الصفوف تربط المعلّم بطلابه: المعلّم ينشئ صفًا ويشارك رمزه، والطالب ينضم بالرمز.',
        'Classes link a teacher to their students: the teacher creates a class and shares its code.'))}</p>

      ${owned.length ? `
        <div class="class-list">
          ${owned.map(c => `
            <div class="class-row">
              <div>
                <b>${ZAD.esc(c.name || pick('صفّي', 'My class'))}</b>
                <code class="class-code">${ZAD.esc(c.code)}</code>
              </div>
              <button type="button" class="btn btn-soft btn-sm" data-roster="${ZAD.esc(c.id)}"
                      data-name="${ZAD.esc(c.name || '')}">
                ${ZAD.esc(pick('عرض الصف', 'View class'))}</button>
            </div>`).join('')}
        </div>` : ''}

      ${joined.length ? `
        <div class="class-list">
          ${joined.map(c => `
            <div class="class-row">
              <div>
                <b>${ZAD.esc(c.name || pick('صف', 'Class'))}</b>
                <small style="color:var(--muted-2)">${ZAD.esc(pick('أنت عضو', 'You are a member'))}</small>
              </div>
              <button type="button" class="btn btn-ghost btn-sm" data-leave="${ZAD.esc(c.id)}">
                ${ZAD.esc(pick('مغادرة', 'Leave'))}</button>
            </div>`).join('')}
        </div>` : ''}

      <div class="class-actions">
        <div class="field">
          <label for="class-code-in">${ZAD.esc(pick('انضم برمز الصف', 'Join with a class code'))}</label>
          <div style="display:flex;gap:9px">
            <input class="input" type="text" id="class-code-in" maxlength="6"
                   placeholder="ABC123" style="text-transform:uppercase">
            <button type="button" class="btn btn-primary" id="class-join">
              ${ZAD.esc(pick('انضم', 'Join'))}</button>
          </div>
        </div>
        ${isTeacher ? `
          <div class="field">
            <label for="class-name-in">${ZAD.esc(pick('أنشئ صفًا جديدًا', 'Create a new class'))}</label>
            <div style="display:flex;gap:9px">
              <input class="input" type="text" id="class-name-in"
                     placeholder="${ZAD.esc(pick('مثال: BTEC IT — السنة الأولى', 'e.g. BTEC IT — Year 1'))}">
              <button type="button" class="btn btn-soft" id="class-make">
                ${ZAD.esc(pick('إنشاء', 'Create'))}</button>
            </div>
          </div>`
        : `<p class="hint">${ZAD.esc(pick(
            'إنشاء الصفوف متاح لمن اختار صفة "معلّم" في ملفه الشخصي.',
            'Creating classes is available to profiles set to the teacher role.'))}</p>`}
      </div>`;

    host.querySelector('#class-join')?.addEventListener('click', async () => {
      const res = await ZAD.joinClass($('#class-code-in').value);
      if (res.error) { ZAD.toast(res.error.message || ZAD.t('err_generic'), 'err'); return; }
      ZAD.toast(pick('انضممت إلى الصف', 'Joined the class'), 'ok');
      state.classes = await ZAD.myClasses();
      renderClasses();
    });

    host.querySelector('#class-make')?.addEventListener('click', async () => {
      const res = await ZAD.createClass($('#class-name-in').value.trim());
      if (res.error) { ZAD.toast(res.error.message || ZAD.t('err_generic'), 'err'); return; }
      ZAD.toast(pick('أُنشئ الصف', 'Class created'), 'ok');
      state.classes = await ZAD.myClasses();
      renderClasses();
    });

    host.querySelectorAll('[data-leave]').forEach(b => b.addEventListener('click', async () => {
      const res = await ZAD.leaveClass(b.getAttribute('data-leave'));
      if (res.error) { ZAD.toast(res.error.message || ZAD.t('err_generic'), 'err'); return; }
      state.classes = await ZAD.myClasses();
      renderClasses();
    }));

    host.querySelectorAll('[data-roster]').forEach(b =>
      b.addEventListener('click', () => showRoster(b.getAttribute('data-roster'), b.getAttribute('data-name'))));
  }

  async function showRoster(classId, className) {
    const sheet = ZAD.modal({
      wide : true,
      title: ZAD.esc(className || pick('الصف', 'Class')),
      body : `<p style="color:var(--muted)">${ZAD.esc(ZAD.t('dash_loading'))}</p>`,
    });

    const rows = await ZAD.classRoster(classId);
    sheet.body.innerHTML = rows.length ? `
      <table class="roster">
        <thead>
          <tr>
            <th>${ZAD.esc(pick('الطالب', 'Student'))}</th>
            <th>${ZAD.esc(pick('المسار', 'Pathway'))}</th>
            <th>${ZAD.esc(pick('متوسط التقدّم', 'Avg progress'))}</th>
            <th>${ZAD.esc(pick('وحدات مكتملة', 'Units done'))}</th>
            <th>${ZAD.esc(pick('متوسط الاختبارات', 'Avg quiz'))}</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map(r => `
            <tr>
              <td>${ZAD.esc(r.student_name || '—')}</td>
              <td>${ZAD.esc(ZAD.majorBySlug(r.major_slug) ? label(ZAD.majorBySlug(r.major_slug)) : '—')}</td>
              <td>${r.avg_progress == null ? '—' : Math.round(r.avg_progress) + '%'}</td>
              <td>${r.units_done ?? 0}</td>
              <td>${r.avg_quiz == null ? '—' : Math.round(r.avg_quiz) + '%'}</td>
            </tr>`).join('')}
        </tbody>
      </table>` : `
      <p style="color:var(--muted)">${ZAD.esc(pick(
        'لم ينضم أحد بعد. شارك رمز الصف مع طلابك.',
        'Nobody has joined yet. Share the class code with your students.'))}</p>`;
  }

  /* ---------------- profile form ---------------- */
  function buildProfileForm() {
    const opts = (arr, sel) =>
      `<option value="">${ZAD.esc(ZAD.t('f_choose'))}</option>` +
      arr.map(o =>
        `<option value="${ZAD.esc(o.v)}"${o.v === sel ? ' selected' : ''}>${ZAD.esc(label(o))}</option>`
      ).join('');

    const p = state.profile || {};

    $('#pf-level').innerHTML   = opts(ZAD.CHOICES.levels,    p.edu_level);
    $('#pf-year').innerHTML    = opts(ZAD.CHOICES.years,     p.study_year);
    $('#pf-country').innerHTML = opts(ZAD.CHOICES.countries, p.country);

    $('#pf-major').innerHTML =
      `<option value="">${ZAD.esc(ZAD.t('f_choose'))}</option>` +
      ZAD.MAJORS.map(m =>
        `<option value="${ZAD.esc(m.slug)}"${m.slug === p.major_slug ? ' selected' : ''}>
           ${ZAD.esc(L() === 'ar' ? m.ar : m.en)}</option>`
      ).join('');

    const chosen = new Set(p.interests || []);
    $('#pf-interests').innerHTML = ZAD.CHOICES.interests.map(i => `
      <label class="chip-opt">
        <input type="checkbox" name="pf-interest" value="${ZAD.esc(i.v)}"
               ${chosen.has(i.v) ? 'checked' : ''}>
        <span>${ZAD.esc(label(i))}</span>
      </label>`).join('');

    $('#pf-name').value     = p.full_name || '';
    $('#pf-username').value = p.username  || '';
    $('#pf-school').value   = p.school    || '';
    $('#pf-bio').value      = p.bio       || '';
    $('#pf-display').value  = p.display_name || '';
    $('#pf-leaderboard').checked = !!p.show_on_leaderboard;
  }

  async function onSaveProfile(e) {
    e.preventDefault();

    const username = $('#pf-username').value.trim();
    if (username && !/^[a-zA-Z0-9_.]{3,24}$/.test(username)) {
      ZAD.toast(ZAD.t('err_username'), 'err'); return;
    }

    const patch = {
      full_name : $('#pf-name').value.trim()   || null,
      username  : username                      || null,
      major_slug: $('#pf-major').value          || null,
      edu_level : $('#pf-level').value          || null,
      study_year: $('#pf-year').value           || null,
      school    : $('#pf-school').value.trim()  || null,
      country   : $('#pf-country').value        || null,
      bio       : $('#pf-bio').value.trim()     || null,
      interests : [...document.querySelectorAll('[name="pf-interest"]:checked')].map(c => c.value),
      display_name       : $('#pf-display').value.trim() || null,
      show_on_leaderboard: $('#pf-leaderboard').checked,
    };

    const btn = $('#pf-submit');
    btn.disabled = true;
    let { data, error } = await ZAD.updateProfile(patch);

    // The leaderboard columns only exist after the newer schema.sql has been
    // run. If they are missing, save everything else rather than failing.
    if (error && /display_name|show_on_leaderboard|column/i.test(error.message || '')) {
      delete patch.display_name;
      delete patch.show_on_leaderboard;
      ({ data, error } = await ZAD.updateProfile(patch));
      if (!error) ZAD.toast(pick(
        'حُفظ الملف. خانة لوحة المتصدّرين تحتاج تشغيل ملف SQL الجديد.',
        'Profile saved. The leaderboard fields need the new SQL file to be run.'), 'info', 5000);
    }
    btn.disabled = false;

    if (error) { ZAD.toast(error.message || ZAD.t('err_generic'), 'err'); return; }

    state.profile = data || { ...state.profile, ...patch };
    ZAD.toast(ZAD.t('msg_profile_up'), 'ok');
    renderHead();
    renderKPIs();
    renderReco();
    renderClasses();
    drawShareCard();
  }

  /* ---------------- load ---------------- */
  async function load(user) {
    state.user = user;
    ZAD.setStoreUser(user.id);

    const [profile, saved, progress, deadlines, attempts, classes] = await Promise.all([
      ZAD.getProfile(user.id),
      ZAD.getSaved(),
      ZAD.getProgress(),
      ZAD.getDeadlines(),
      ZAD.getAttempts(),
      ZAD.myClasses(),
    ]);
    state.profile   = profile;
    state.saved     = saved;
    state.progress  = progress;
    state.deadlines = deadlines;
    state.attempts  = attempts;
    state.classes   = classes;
    state.mastery   = ZAD.masteryByMajor(attempts);
    state.streak    = ZAD.streakFrom(attempts);

    renderAll();
    show('main');
    ZAD.observeReveal();
  }

  function renderAll() {
    if (!state.user) return;
    renderHead();
    renderKPIs();
    renderDeadlines();
    renderMastery();
    renderSaved();
    renderProgress();
    renderReco();
    renderClasses();
    buildPlanForm();
    buildProfileForm();
    drawShareCard();
    ZAD.applyLang(ZAD.lang);
  }

  /* ---------------- init ---------------- */
  function init() {
    ZAD.boot();
    ZAD.bootShell();
    ZAD.wireNavAuth();
    $('#guest-icon').innerHTML = ZAD.ICONS.lock;

    $('#plan-make')?.addEventListener('click', makePlan);
    $('#share-dl')?.addEventListener('click', downloadShareCard);
    document.addEventListener('zad:theme', () => drawShareCard());

    /* the unit sheet can change a deadline or the progress of a unit */
    document.addEventListener('zad:studydata', async () => {
      if (!state.user) return;
      state.deadlines = await ZAD.getDeadlines();
      state.progress  = await ZAD.getProgress();
      renderDeadlines();
      renderProgress();
      renderKPIs();
      drawShareCard();
    });

    if (!ZAD.dbReady) {
      show('guest');
      ZAD.toast(ZAD.t('msg_offline'), 'err', 5000);
      ZAD.applyLang(ZAD.lang);
      return;
    }

    ZAD.onAuth(user => {
      if (user) load(user);
      else { show('guest'); ZAD.applyLang(ZAD.lang); }
    });

    $('#profile-form').addEventListener('submit', onSaveProfile);
    document.addEventListener('zad:lang', renderAll);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
