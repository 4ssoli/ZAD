/* ============================================================
   ZAD — sheets
   Two big modals shared by the home page and the dashboard:

   ZAD.openUnitSheet(unitNo)      the unit workspace — PDF viewer,
                                  notes, criteria tracker, deadline
                                  and progress, all in one place.
   ZAD.openPathwaySheet(slug)     the pathway sheet — start-here
                                  path, every curated link, and the
                                  units that belong to the pathway.
   ============================================================ */
window.ZAD = window.ZAD || {};

(function () {
  const L = () => ZAD.lang;
  const pick = (ar, en) => (L() === 'ar' ? ar : en);

  /* ============================================================
     Unit workspace
     ============================================================ */
  ZAD.openUnitSheet = async function (unitNo) {
    const u = (ZAD.UNITS || []).find(x => x.n === Number(unitNo));
    if (!u) return;

    // the criteria checklists are only fetched when a unit is opened
    await ZAD.ensure(['criteria']);

    const m       = ZAD.majorBySlug(u.major);
    const title   = pick(u.ar, u.en);
    const crit    = ZAD.criteriaFor(u.n);
    const started = ZAD.getReadPage(u.n);

    const tabs = [
      { id:'pdf',   label: pick('الملف', 'File') },
      { id:'crit',  label: pick('المعايير', 'Criteria') },
      { id:'notes', label: pick('ملاحظاتي', 'My notes') },
      { id:'plan',  label: pick('الموعد والتقدّم', 'Deadline & progress') },
    ];

    const sheet = ZAD.modal({
      wide : true,
      title: `<span class="course-num">Unit ${String(u.n).padStart(2, '0')}</span>
              <span class="sheet-title">${ZAD.esc(title)}</span>`,
      body : `
        <div class="sheet-meta">
          ${m ? `<span class="tag" style="color:${m.accent};border-color:${m.accent}44">
                   ${ZAD.esc(pick(m.ar, m.en))}</span>` : ''}
          ${u.code    ? `<span class="tag">${ZAD.esc(u.code)}</span>` : ''}
          ${u.glh     ? `<span class="tag">${u.glh} ${ZAD.esc(ZAD.t('glh_label'))}</span>` : ''}
          ${u.credits ? `<span class="tag">${u.credits} ${ZAD.esc(ZAD.t('credits_label'))}</span>` : ''}
          <span class="badge ${u.file ? 'badge-ok' : 'badge-soon'}">
            ${ZAD.esc(ZAD.t(u.file ? 'available_label' : 'soon_label'))}</span>
        </div>
        <p class="sheet-desc">${ZAD.esc(pick(u.descAr, u.descEn))}</p>

        <div class="sheet-tabs" role="tablist">
          ${tabs.map((t, i) => `
            <button type="button" role="tab" data-tab="${t.id}"
                    class="${i === 0 ? 'on' : ''}">${ZAD.esc(t.label)}</button>`).join('')}
        </div>

        <div class="sheet-panes">
          <!-- ---------- file ---------- -->
          <section data-pane="pdf" class="on">
            ${u.file ? `
              <div class="pdf-bar">
                <label class="pdf-page">
                  <span>${ZAD.esc(pick('صفحة', 'Page'))}</span>
                  <input type="number" min="1" value="${started}" id="pdf-page-in">
                </label>
                <button type="button" class="btn btn-soft btn-sm" id="pdf-go">
                  ${ZAD.esc(pick('اذهب', 'Go'))}</button>
                <span class="pdf-hint">${ZAD.esc(pick(
                  'نحفظ آخر صفحة فتحتها على هذا الجهاز.',
                  'The last page you opened is remembered on this device.'))}</span>
                <a class="btn btn-ghost btn-sm" href="${ZAD.esc(u.file)}" target="_blank" rel="noopener">
                  ${ZAD.esc(pick('فتح في تبويب', 'Open in a tab'))}</a>
              </div>
              <div class="pdf-frame">
                <iframe id="pdf-iframe" title="${ZAD.esc(title)}"
                        src="${ZAD.esc(u.file)}#page=${started}"></iframe>
              </div>` : `
              <div class="sheet-empty">
                <p>${ZAD.esc(pick(
                  'ملف هذه الوحدة لم يُرفع بعد. يمكنك مع ذلك استخدام المعايير والملاحظات من الآن.',
                  'The file for this unit is not uploaded yet. You can still use the criteria and notes now.'))}</p>
              </div>`}
          </section>

          <!-- ---------- criteria ---------- -->
          <section data-pane="crit">
            ${crit.length ? `
              <div class="crit-top">
                <div class="bar"><i id="crit-bar" style="inline-size:0%"></i></div>
                <span class="pr-pct" id="crit-count">0 / ${crit.length}</span>
              </div>
              <p class="crit-note">${ZAD.esc(pick(
                ZAD.CRITERIA_DISCLAIMER.ar, ZAD.CRITERIA_DISCLAIMER.en))}</p>
              <div class="crit-list" id="crit-list">
                ${crit.map(c => `
                  <label class="crit-row" data-code="${ZAD.esc(c.code)}">
                    <input type="checkbox" data-crit="${ZAD.esc(c.code)}">
                    <span class="crit-code" style="--g:${ZAD.GRADES[c.grade].color}">
                      ${ZAD.esc(c.code)}</span>
                    <span class="crit-text">${ZAD.esc(pick(c.ar, c.en))}</span>
                    <span class="crit-grade">${ZAD.esc(pick(
                      ZAD.GRADES[c.grade].ar, ZAD.GRADES[c.grade].en))}</span>
                  </label>`).join('')}
              </div>` : `
              <div class="sheet-empty"><p>${ZAD.esc(pick(
                'لا توجد معايير مسجّلة لهذه الوحدة بعد.',
                'No criteria are recorded for this unit yet.'))}</p></div>`}
          </section>

          <!-- ---------- notes ---------- -->
          <section data-pane="notes">
            <label class="sr-only" for="unit-note">${ZAD.esc(pick('ملاحظاتي', 'My notes'))}</label>
            <textarea class="textarea" id="unit-note" rows="12"
                      placeholder="${ZAD.esc(pick(
                        'اكتب ملخصك، الأسئلة التي لم تفهمها، أو خطوات مهمتك…',
                        'Write your summary, the parts you did not understand, or your assignment steps…'))}"></textarea>
            <div class="note-foot">
              <span id="note-status"></span>
              <button type="button" class="btn btn-soft btn-sm" id="note-save">
                ${ZAD.esc(ZAD.t('btn_save'))}</button>
            </div>
          </section>

          <!-- ---------- deadline + progress ---------- -->
          <section data-pane="plan">
            <div class="field">
              <label for="unit-due">${ZAD.esc(pick('موعد التسليم', 'Due date'))}</label>
              <input class="input" type="date" id="unit-due">
              <span class="hint" id="due-hint"></span>
            </div>
            <div class="field">
              <label for="unit-due-title">${ZAD.esc(pick('اسم المهمة', 'Assignment name'))}
                <span class="hint">(${ZAD.esc(ZAD.t('f_optional'))})</span></label>
              <input class="input" type="text" id="unit-due-title"
                     placeholder="${ZAD.esc(pick('مثال: المهمة الأولى', 'e.g. Assignment 1'))}">
            </div>
            <div class="field">
              <label for="unit-prog">${ZAD.esc(pick('نسبة إنجازي', 'My progress'))}
                <b id="prog-out" style="color:var(--p-300)">0%</b></label>
              <input type="range" id="unit-prog" min="0" max="100" step="10" value="0"
                     style="accent-color:var(--p-500);inline-size:100%">
            </div>
            <div class="sheet-actions">
              <button type="button" class="btn btn-primary" id="plan-save">
                ${ZAD.esc(ZAD.t('btn_save'))}</button>
              <a class="btn btn-ghost" href="quiz.html?unit=${u.n}">
                ${ZAD.esc(pick('اختبر نفسك في هذه الوحدة', 'Test yourself on this unit'))}</a>
            </div>
          </section>
        </div>`,
    });

    const $ = sel => sheet.root.querySelector(sel);

    /* tabs */
    sheet.root.querySelectorAll('[data-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-tab');
        sheet.root.querySelectorAll('[data-tab]').forEach(b => b.classList.toggle('on', b === btn));
        sheet.root.querySelectorAll('[data-pane]').forEach(p =>
          p.classList.toggle('on', p.getAttribute('data-pane') === id));
      });
    });

    /* pdf paging */
    if (u.file) {
      const jump = () => {
        const page = Math.max(1, Number($('#pdf-page-in').value) || 1);
        $('#pdf-iframe').setAttribute('src', `${u.file}#page=${page}`);
        ZAD.setReadPage(u.n, page);
      };
      $('#pdf-go').addEventListener('click', jump);
      $('#pdf-page-in').addEventListener('change', jump);
    }

    /* criteria */
    if (crit.length) {
      const all = await ZAD.getCriteriaProgress();
      const done = new Set(all[u.n] || []);

      const paint = () => {
        const n = crit.filter(c => done.has(c.code)).length;
        $('#crit-count').textContent = `${n} / ${crit.length}`;
        $('#crit-bar').style.inlineSize = `${Math.round((n / crit.length) * 100)}%`;
      };

      sheet.root.querySelectorAll('[data-crit]').forEach(box => {
        const code = box.getAttribute('data-crit');
        box.checked = done.has(code);
        box.closest('.crit-row').classList.toggle('done', box.checked);
        box.addEventListener('change', async () => {
          box.closest('.crit-row').classList.toggle('done', box.checked);
          if (box.checked) done.add(code); else done.delete(code);
          paint();
          await ZAD.toggleCriterion(u.n, code, box.checked);
        });
      });
      paint();
    }

    /* notes — save on blur, on button, and 1.2s after typing stops */
    const notes = await ZAD.getNotes();
    const area  = $('#unit-note');
    area.value = notes[u.n] || '';

    let noteTimer = null;
    const saveNote = async () => {
      $('#note-status').textContent = pick('جارِ الحفظ…', 'Saving…');
      const res = await ZAD.saveNote(u.n, area.value);
      $('#note-status').textContent = res.local
        ? pick('حُفظ على هذا الجهاز', 'Saved on this device')
        : pick('تم الحفظ', 'Saved');
      setTimeout(() => { $('#note-status').textContent = ''; }, 2400);
    };
    area.addEventListener('input', () => {
      clearTimeout(noteTimer);
      noteTimer = setTimeout(saveNote, 1200);
    });
    area.addEventListener('blur', () => { clearTimeout(noteTimer); saveNote(); });
    $('#note-save').addEventListener('click', saveNote);

    /* deadline + progress */
    const deadlines = await ZAD.getDeadlines();
    const row = deadlines[u.n];
    if (row) {
      $('#unit-due').value = row.due || '';
      $('#unit-due-title').value = row.title || '';
    }

    const paintDue = () => {
      const days = ZAD.daysUntil($('#unit-due').value);
      const hint = $('#due-hint');
      if (days == null) { hint.textContent = ''; hint.className = 'hint'; return; }
      if (days < 0) {
        hint.textContent = pick(`متأخر بـ ${Math.abs(days)} يوم`, `${Math.abs(days)} days overdue`);
        hint.className = 'hint due-late';
      } else if (days === 0) {
        hint.textContent = pick('التسليم اليوم', 'Due today');
        hint.className = 'hint due-soon';
      } else {
        hint.textContent = pick(`باقي ${days} يوم`, `${days} days left`);
        hint.className = `hint ${days <= 3 ? 'due-soon' : ''}`;
      }
    };
    $('#unit-due').addEventListener('change', paintDue);
    paintDue();

    const progress = await ZAD.getProgress();
    const mine = progress.find(p => p.unit_no === u.n);
    const slider = $('#unit-prog');
    slider.value = mine?.percent ?? 0;
    $('#prog-out').textContent = `${slider.value}%`;
    slider.addEventListener('input', () => { $('#prog-out').textContent = `${slider.value}%`; });

    $('#plan-save').addEventListener('click', async () => {
      await ZAD.saveDeadline(u.n, $('#unit-due').value || null, $('#unit-due-title').value.trim());
      const res = await ZAD.setProgress(u.n, Number(slider.value));
      if (res?.error) ZAD.toast(res.error.message || ZAD.t('err_generic'), 'err');
      else ZAD.toast(ZAD.t('msg_saved'), 'ok', 1600);
      document.dispatchEvent(new CustomEvent('zad:studydata'));
    });
  };

  /* ============================================================
     Pathway sheet — resources + units
     ============================================================ */
  ZAD.openPathwaySheet = async function (slug) {
    const m = ZAD.majorBySlug(slug);
    if (!m) return;

    await ZAD.ensure(['resources']);

    const links  = ZAD.resourcesFor(slug);
    const start  = ZAD.startPathFor(slug);
    const rest   = links.filter(r => !r.step);
    const units  = ZAD.unitsByMajor(slug);
    const skills = (L() === 'ar' ? m.skillsAr : m.skillsEn) || [];

    const tagPill = t => {
      const row = ZAD.RES_TAGS[t];
      if (!row) return '';
      return `<span class="res-tag" style="--tc:${row.color}">${ZAD.esc(pick(row.ar, row.en))}</span>`;
    };

    const linkCard = (r, badge) => `
      <a class="res-card" href="${ZAD.esc(r.url)}" target="_blank" rel="noopener noreferrer">
        ${badge ? `<span class="res-step">${badge}</span>` : ''}
        <div class="res-main">
          <b>${ZAD.esc(pick(r.ar, r.en))}</b>
          <p>${ZAD.esc(pick(r.descAr, r.descEn))}</p>
          <div class="res-tags">${(r.tags || []).map(tagPill).join('')}</div>
        </div>
        <span class="res-go" aria-hidden="true">${L() === 'ar' ? '&#8592;' : '&#8594;'}</span>
      </a>`;

    ZAD.modal({
      wide : true,
      title: `<span class="sheet-icon" style="--accent:${m.accent}">${ZAD.ICONS[m.icon] || ZAD.ICONS.book}</span>
              <span class="sheet-title">${ZAD.esc(pick(m.ar, m.en))}</span>`,
      body : `
        <p class="sheet-desc">${ZAD.esc(pick(m.descAr, m.descEn))}</p>
        <div class="sheet-meta">
          ${skills.map(s => `<span class="tag">${ZAD.esc(s)}</span>`).join('')}
        </div>

        <div class="sheet-actions">
          <a class="btn btn-primary btn-sm" href="quiz.html?major=${ZAD.esc(slug)}&mode=quick">
            ${ZAD.esc(pick('اختبار سريع — ١٠ أسئلة', 'Quick quiz — 10 questions'))}</a>
          <a class="btn btn-ghost btn-sm" href="quiz.html?major=${ZAD.esc(slug)}&mode=exam">
            ${ZAD.esc(pick('وضع الامتحان', 'Exam mode'))}</a>
          <a class="btn btn-ghost btn-sm" href="glossary.html?major=${ZAD.esc(slug)}">
            ${ZAD.esc(pick('مصطلحات المسار', 'Pathway terms'))}</a>
        </div>

        ${start.length ? `
          <h4 class="sheet-h">${ZAD.esc(pick('ابدأ من هنا', 'Start here'))}</h4>
          <p class="sheet-sub">${ZAD.esc(pick(
            'ثلاث خطوات بالترتيب: تعلّم، تدرّب، ثم اصنع شيئًا.',
            'Three steps in order: learn, practise, then build something.'))}</p>
          <div class="res-grid start">
            ${start.map(r => linkCard(r, String(r.step))).join('')}
          </div>` : ''}

        ${rest.length ? `
          <h4 class="sheet-h">${ZAD.esc(pick('مصادر إضافية', 'More resources'))}</h4>
          <div class="res-grid">${rest.map(r => linkCard(r)).join('')}</div>` : ''}

        <h4 class="sheet-h">${ZAD.esc(pick('وحدات هذا المسار', 'Units in this pathway'))}</h4>
        <div class="sheet-units">
          ${units.length ? units.map(u => `
            <button type="button" class="sheet-unit" data-unit="${u.n}">
              <span class="course-num">${String(u.n).padStart(2, '0')}</span>
              <span class="su-t">${ZAD.esc(pick(u.ar, u.en))}</span>
              <span class="badge ${u.file ? 'badge-ok' : 'badge-soon'}">
                ${ZAD.esc(ZAD.t(u.file ? 'available_label' : 'soon_label'))}</span>
            </button>`).join('')
          : `<p style="color:var(--muted-2)">${ZAD.esc(ZAD.t('no_results'))}</p>`}
        </div>

        <p class="sheet-foot">${ZAD.esc(pick(
          'الروابط تفتح في تبويب جديد، وهي مواقع خارجية لا تتبع منصة زاد.',
          'Links open in a new tab. They are external sites, not part of ZAD.'))}</p>`,
    }).root.querySelectorAll('[data-unit]').forEach(b => {
      b.addEventListener('click', () => ZAD.openUnitSheet(Number(b.getAttribute('data-unit'))));
    });
  };
})();
