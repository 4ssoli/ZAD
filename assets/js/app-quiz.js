/* ============================================================
   ZAD — quiz controller
   Six modes on one page:
     quick      10 questions from one pathway, 20s each
     exam       25 questions, no timer, full review at the end
     daily      5 questions, the same for everyone, changes daily
     unit       every question tied to one unit
     placement  12 preference questions that recommend a pathway
     cards      spaced-repetition flashcards (Leitner boxes)
   ============================================================ */
(function () {
  const L    = () => ZAD.lang;
  const pick = (ar, en) => (L() === 'ar' ? ar : en);
  const app  = document.getElementById('quiz-app');

  const MODES = {
    quick: { count:10, seconds:20, instant:true  },
    exam : { count:25, seconds:0,  instant:false },
    daily: { count:5,  seconds:30, instant:true  },
    unit : { count:10, seconds:20, instant:true  },
  };

  const state = {
    view:'hub', mode:'quick', major:null, unit:null,
    questions:[], index:0, answers:[], locked:false,
    startedAt:0, remaining:0, ticker:null,
    attempts:[], mastery:{}, streak:0,
    placementScores:{},
  };

  /* ---------------- helpers ---------------- */
  const params = new URLSearchParams(location.search);

  /** Deterministic pseudo-random, so the daily challenge matches for everyone. */
  function seeded(seedText) {
    let h = 1779033703 ^ seedText.length;
    for (let i = 0; i < seedText.length; i++) {
      h = Math.imul(h ^ seedText.charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    return function () {
      h = Math.imul(h ^ (h >>> 16), 2246822507);
      h = Math.imul(h ^ (h >>> 13), 3266489909);
      h ^= h >>> 16;
      return (h >>> 0) / 4294967296;
    };
  }

  function shuffle(list, rnd = Math.random) {
    const out = list.slice();
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }

  const qText    = q => pick(q.qAr, q.qEn);
  const qAnswers = q => (L() === 'ar' ? q.aAr : q.aEn);
  const qExpl    = q => pick(q.explAr, q.explEn);

  /**
   * The banks are written with the right answer first because that is far
   * easier to proofread. If we served them that way students would learn to
   * pick A, so every question is dealt with its options in a fresh order and
   * `correct` moved to match. The daily challenge passes its seeded random in
   * so that everyone gets the same order on the same day.
   */
  function prepare(q, rnd = Math.random) {
    const order = shuffle(q.aEn.map((_, i) => i), rnd);
    return {
      ...q,
      aAr    : order.map(i => q.aAr[i]),
      aEn    : order.map(i => q.aEn[i]),
      correct: order.indexOf(q.correct),
    };
  }

  function majorName(slug) {
    const m = ZAD.majorBySlug(slug);
    return m ? pick(m.ar, m.en) : '';
  }

  /* ---------------- building a run ---------------- */
  function buildQuestions() {
    const cfg = MODES[state.mode] || MODES.quick;

    if (state.mode === 'daily') {
      const day = new Date().toISOString().slice(0, 10);
      const rnd = seeded('zad-daily-' + day);
      return shuffle(ZAD.allQuestions(), rnd).slice(0, cfg.count).map(q => prepare(q, rnd));
    }
    if (state.mode === 'unit') {
      const pool = ZAD.quizForUnit(state.unit);
      return shuffle(pool).slice(0, Math.min(cfg.count, pool.length)).map(q => prepare(q));
    }
    const pool = state.major ? ZAD.quizFor(state.major) : ZAD.allQuestions();
    return shuffle(pool).slice(0, Math.min(cfg.count, pool.length)).map(q => prepare(q));
  }

  /* ============================================================
     HUB
     ============================================================ */
  function renderHub() {
    stopTimer();
    const total = ZAD.statOf('questions');
    const best  = Object.entries(state.mastery).sort((a, b) => b[1] - a[1])[0];

    app.innerHTML = `
      <section class="quiz-head">
        <span class="eyebrow">${ZAD.esc(pick('اختبر نفسك', 'Test yourself'))}</span>
        <h1 class="gradient-text">${ZAD.esc(pick('لعبة الأسئلة', 'The question game'))}</h1>
        <p>${ZAD.esc(pick(
          `${total} سؤالًا موزّعة على ٩ مسارات، مع شرح لكل إجابة. اختر مسارًا وابدأ.`,
          `${total} questions across 9 pathways, each with an explanation. Pick a pathway and start.`))}</p>

        <div class="quiz-stats">
          <div class="qs"><b>${state.streak}</b><small>${ZAD.esc(pick('يوم متتالي', 'day streak'))}</small></div>
          <div class="qs"><b>${state.attempts.length}</b><small>${ZAD.esc(pick('محاولة', 'attempts'))}</small></div>
          <div class="qs"><b>${best ? best[1] + '%' : '—'}</b>
            <small>${ZAD.esc(best ? majorName(best[0]) : pick('أفضل مسار', 'best pathway'))}</small></div>
        </div>
      </section>

      <section class="mode-grid">
        <button type="button" class="mode-card feature" data-go="placement">
          <span class="mc-ico">${ZAD.ICONS.spark}</span>
          <b>${ZAD.esc(pick('ما المسار المناسب لي؟', 'Which pathway suits me?'))}</b>
          <p>${ZAD.esc(pick(
            '١٢ سؤالًا بلا إجابات صحيحة أو خاطئة، ونرشّح لك أفضل ٣ مسارات.',
            '12 questions with no right or wrong answers — we suggest your top 3 pathways.'))}</p>
          <span class="mc-go">${ZAD.esc(pick('ابدأ الاختبار', 'Start'))}</span>
        </button>

        <button type="button" class="mode-card" data-go="daily">
          <span class="mc-ico">${ZAD.ICONS.check}</span>
          <b>${ZAD.esc(pick('تحدي اليوم', 'Daily challenge'))}</b>
          <p>${ZAD.esc(pick(
            '٥ أسئلة يومية، نفس الأسئلة لكل الطلاب — حافظ على سلسلتك.',
            '5 questions a day, the same for every student — keep your streak alive.'))}</p>
          <span class="mc-go">${ZAD.esc(pick('العب الآن', 'Play now'))}</span>
        </button>

        <button type="button" class="mode-card" data-go="cards">
          <span class="mc-ico">${ZAD.ICONS.book}</span>
          <b>${ZAD.esc(pick('بطاقات المراجعة', 'Flashcards'))}</b>
          <p>${ZAD.esc(pick(
            'مراجعة متباعدة: البطاقة التي تخطئ فيها تعود أسرع.',
            'Spaced repetition: the cards you miss come back sooner.'))}</p>
          <span class="mc-go">${ZAD.esc(pick('راجع', 'Review'))}</span>
        </button>
      </section>

      <section class="pathway-quiz">
        <h2>${ZAD.esc(pick('اختر مسارًا', 'Choose a pathway'))}</h2>
        <p class="pq-sub">${ZAD.esc(pick(
          'الحلقة تعرض إتقانك: متوسط آخر ٣ محاولات في المسار.',
          'The ring shows your mastery: the average of your last 3 attempts.'))}</p>
        <div class="pq-grid">
          ${(ZAD.MAJORS || []).map(m => {
            const pct   = state.mastery[m.slug];
            const badge = pct != null ? ZAD.badgeFor(pct) : null;
            const count = ZAD.quizFor(m.slug).length;
            return `
              <article class="pq-card" style="--accent:${m.accent}">
                <div class="pq-ring" style="--pct:${pct || 0}">
                  <span>${pct != null ? pct + '%' : '—'}</span>
                </div>
                <div class="pq-main">
                  <b>${ZAD.esc(pick(m.ar, m.en))} ${badge ? `<span title="${ZAD.esc(pick(badge.ar, badge.en))}">${badge.icon}</span>` : ''}</b>
                  <small>${count} ${ZAD.esc(pick('سؤالًا', 'questions'))}</small>
                </div>
                <div class="pq-btns">
                  <button type="button" class="btn btn-primary btn-sm"
                          data-start="quick" data-major="${ZAD.esc(m.slug)}">
                    ${ZAD.esc(pick('١٠ أسئلة', 'Quick 10'))}</button>
                  <button type="button" class="btn btn-ghost btn-sm"
                          data-start="exam" data-major="${ZAD.esc(m.slug)}">
                    ${ZAD.esc(pick('امتحان', 'Exam'))}</button>
                </div>
              </article>`;
          }).join('')}
        </div>
      </section>

      <section class="panel lb-panel">
        <div class="panel-head">
          <h3>${ZAD.esc(pick('لوحة المتصدّرين', 'Leaderboard'))}</h3>
          <span class="tag">${ZAD.esc(pick('اختياري', 'Opt-in'))}</span>
        </div>
        <div class="panel-body" id="lb-body">
          <p style="color:var(--muted-2);font-size:13.5px">${ZAD.esc(ZAD.t('dash_loading'))}</p>
        </div>
      </section>`;

    app.querySelectorAll('[data-go]').forEach(b => {
      b.addEventListener('click', () => {
        const go = b.getAttribute('data-go');
        if (go === 'placement') startPlacement();
        else if (go === 'cards') startCards();
        else start('daily', null);
      });
    });
    app.querySelectorAll('[data-start]').forEach(b => {
      b.addEventListener('click', () =>
        start(b.getAttribute('data-start'), b.getAttribute('data-major')));
    });

    loadLeaderboard();
    ZAD.scrollTop();
    ZAD.applyLang(ZAD.lang);
  }

  async function loadLeaderboard() {
    const host = document.getElementById('lb-body');
    if (!host) return;

    if (!ZAD.dbReady) {
      host.innerHTML = `<p style="color:var(--muted-2);font-size:13.5px">
        ${ZAD.esc(ZAD.t('msg_offline'))}</p>`;
      return;
    }
    const rows = await ZAD.getLeaderboard('all');
    if (!rows.length) {
      host.innerHTML = `<p style="color:var(--muted-2);font-size:13.5px">
        ${ZAD.esc(pick(
          'لا أحد على اللوحة بعد. فعّل الظهور من لوحتك الشخصية لتكون الأول.',
          'Nobody is on the board yet. Turn on sharing in your dashboard to be first.'))}</p>`;
      return;
    }
    host.innerHTML = `<ol class="lb-list">${rows.map((r, i) => `
      <li>
        <span class="lb-rank">${i + 1}</span>
        <span class="lb-name">${ZAD.esc(r.display_name || '—')}</span>
        <span class="tag">${ZAD.esc(majorName(r.major_slug) || '')}</span>
        <b class="lb-pct">${r.best_pct}%</b>
      </li>`).join('')}</ol>`;
  }

  /* ============================================================
     RUN
     ============================================================ */
  function start(mode, major, unit) {
    state.mode  = mode;
    state.major = major || null;
    state.unit  = unit != null ? Number(unit) : null;
    state.questions = buildQuestions();

    if (!state.questions.length) {
      ZAD.toast(pick('لا توجد أسئلة لهذا الاختيار بعد.', 'No questions for this selection yet.'), 'info');
      renderHub();
      return;
    }
    state.index = 0;
    state.answers = new Array(state.questions.length).fill(null);
    state.locked = false;
    state.startedAt = Date.now();
    state.view = 'run';
    renderQuestion();
  }

  function runTitle() {
    if (state.mode === 'daily') return pick('تحدي اليوم', 'Daily challenge');
    if (state.mode === 'exam')  return `${pick('امتحان', 'Exam')} · ${majorName(state.major)}`;
    if (state.mode === 'unit')  return `${pick('وحدة', 'Unit')} ${state.unit}`;
    return majorName(state.major) || pick('اختبار سريع', 'Quick quiz');
  }

  function renderQuestion() {
    const cfg = MODES[state.mode] || MODES.quick;
    const q   = state.questions[state.index];
    const n   = state.questions.length;
    const answered = state.answers[state.index];

    app.innerHTML = `
      <section class="run">
        <div class="run-top">
          <button type="button" class="btn btn-ghost btn-sm" id="run-quit">
            ${ZAD.esc(pick('خروج', 'Quit'))}</button>
          <div class="run-title">${ZAD.esc(runTitle())}</div>
          <div class="run-count">${state.index + 1} / ${n}</div>
        </div>

        <div class="run-bar"><i style="inline-size:${((state.index) / n) * 100}%"></i></div>

        ${cfg.seconds ? `
          <div class="run-timer" id="run-timer">
            <svg viewBox="0 0 36 36" aria-hidden="true">
              <circle class="tr" cx="18" cy="18" r="16"></circle>
              <circle class="tv" cx="18" cy="18" r="16" id="timer-arc"></circle>
            </svg>
            <b id="timer-num">${cfg.seconds}</b>
          </div>` : ''}

        <h2 class="run-q">${ZAD.esc(qText(q))}</h2>
        ${!cfg.instant ? `
          <p class="run-hint">${ZAD.esc(pick(
            'يمكنك تغيير إجابتك أو الرجوع للسؤال السابق. تظهر التصحيحات في النهاية.',
            'You can change your answer or go back. Corrections appear at the end.'))}</p>` : ''}

        <div class="run-answers" id="run-answers">
          ${qAnswers(q).map((a, i) => `
            <button type="button" class="ans" data-i="${i}">
              <span class="ans-k">${'ABCD'[i]}</span>
              <span class="ans-t">${ZAD.esc(a)}</span>
            </button>`).join('')}
        </div>

        <div class="run-feedback" id="run-feedback" hidden></div>

        <div class="run-foot">
          ${!cfg.instant && state.index > 0 ? `
            <button type="button" class="btn btn-ghost" id="run-back">
              ${ZAD.esc(ZAD.t('btn_back'))}</button>` : ''}
          <button type="button" class="btn btn-primary" id="run-next" hidden>
            ${ZAD.esc(state.index + 1 === n ? pick('عرض النتيجة', 'See result') : pick('التالي', 'Next'))}
          </button>
          ${!cfg.instant ? `
            <button type="button" class="btn btn-ghost" id="run-skip">
              ${ZAD.esc(pick('تخطّي', 'Skip'))}</button>` : ''}
        </div>
      </section>`;

    app.querySelectorAll('.ans').forEach(b =>
      b.addEventListener('click', () => choose(Number(b.getAttribute('data-i')))));

    document.getElementById('run-quit').addEventListener('click', () => {
      stopTimer();
      renderHub();
    });
    document.getElementById('run-next')?.addEventListener('click', next);
    document.getElementById('run-skip')?.addEventListener('click', () => { choose(null); next(); });
    document.getElementById('run-back')?.addEventListener('click', () => {
      state.index = Math.max(0, state.index - 1);
      renderQuestion();
    });

    if (answered != null) {
      if (cfg.instant) {
        showAnswerState(answered);
      } else {
        // coming back to a question you already answered: show the choice again
        app.querySelectorAll('.ans').forEach(b =>
          b.classList.toggle('picked', Number(b.getAttribute('data-i')) === answered));
        document.getElementById('run-next').hidden = false;
      }
    } else if (cfg.seconds) {
      startTimer(cfg.seconds);
    }

    ZAD.scrollTop();
    ZAD.applyLang(ZAD.lang);
  }

  function startTimer(seconds) {
    stopTimer();
    state.remaining = seconds;
    const num = document.getElementById('timer-num');
    const arc = document.getElementById('timer-arc');
    const full = 2 * Math.PI * 16;

    const paint = () => {
      if (num) num.textContent = state.remaining;
      if (arc) {
        arc.style.strokeDasharray = String(full);
        arc.style.strokeDashoffset = String(full * (1 - state.remaining / seconds));
      }
      document.getElementById('run-timer')?.classList.toggle('low', state.remaining <= 5);
    };
    paint();

    state.ticker = setInterval(() => {
      state.remaining--;
      paint();
      if (state.remaining <= 0) {
        stopTimer();
        if (state.answers[state.index] == null) choose(-1);   // ran out of time
      }
    }, 1000);
  }

  function stopTimer() {
    if (state.ticker) { clearInterval(state.ticker); state.ticker = null; }
  }

  function choose(i) {
    const cfg = MODES[state.mode] || MODES.quick;

    // In the timed modes the answer is revealed straight away, so it locks.
    // In exam mode nothing is revealed yet, so you may change your mind as
    // often as you like until you move on — the same as a paper exam.
    if (cfg.instant && state.answers[state.index] != null) return;

    stopTimer();
    state.answers[state.index] = i;

    if (cfg.instant) { showAnswerState(i); return; }

    app.querySelectorAll('.ans').forEach(b =>
      b.classList.toggle('picked', Number(b.getAttribute('data-i')) === i));
    document.getElementById('run-next').hidden = false;
  }

  function showAnswerState(chosen) {
    const q = state.questions[state.index];
    const right = q.correct;

    app.querySelectorAll('.ans').forEach(b => {
      const i = Number(b.getAttribute('data-i'));
      b.disabled = true;
      if (i === right) b.classList.add('right');
      else if (i === chosen) b.classList.add('wrong');
    });

    const box = document.getElementById('run-feedback');
    const ok  = chosen === right;
    box.hidden = false;
    box.className = `run-feedback ${ok ? 'ok' : 'no'}`;
    box.innerHTML = `
      <b>${ZAD.esc(ok ? pick('إجابة صحيحة', 'Correct')
                      : chosen === -1 ? pick('انتهى الوقت', 'Time is up')
                                      : pick('إجابة خاطئة', 'Not quite'))}</b>
      <p>${ZAD.esc(qExpl(q))}</p>
      ${q.unit ? `<button type="button" class="link-btn" data-open-unit="${q.unit}">
          ${ZAD.esc(pick('افتح الوحدة المرتبطة', 'Open the related unit'))}</button>` : ''}`;

    box.querySelector('[data-open-unit]')?.addEventListener('click', () =>
      ZAD.openUnitSheet(Number(q.unit)));

    document.getElementById('run-next').hidden = false;
    document.getElementById('run-next').focus();
  }

  function next() {
    if (state.index + 1 >= state.questions.length) { finish(); return; }
    state.index++;
    renderQuestion();
  }

  /* ============================================================
     RESULT
     ============================================================ */
  async function finish() {
    stopTimer();
    const total   = state.questions.length;
    const score   = state.questions.filter((q, i) => state.answers[i] === q.correct).length;
    const pct     = Math.round((score / total) * 100);
    const seconds = Math.round((Date.now() - state.startedAt) / 1000);
    const badge   = ZAD.badgeFor(pct);

    await ZAD.saveAttempt({ major: state.major, mode: state.mode, score, total, seconds });
    state.attempts = await ZAD.getAttempts();
    state.mastery  = ZAD.masteryByMajor(state.attempts);
    state.streak   = ZAD.streakFrom(state.attempts);

    const verdict = pct >= 80 ? pick('ممتاز، أنت جاهز.', 'Excellent — you are ready.')
                  : pct >= 60 ? pick('جيد، راجع الأسئلة التي أخطأت فيها.', 'Good — review the ones you missed.')
                              : pick('تحتاج مراجعة الوحدة قبل الإعادة.', 'Review the unit before trying again.');

    app.innerHTML = `
      <section class="result">
        <div class="result-card">
          <div class="result-ring" style="--pct:${pct}">
            <span><b>${pct}%</b><small>${score} / ${total}</small></span>
          </div>
          <h1>${badge ? badge.icon + ' ' : ''}${ZAD.esc(verdict)}</h1>
          <p class="result-sub">
            ${ZAD.esc(runTitle())} ·
            ${ZAD.esc(pick(`استغرقت ${seconds} ثانية`, `${seconds} seconds`))}
            ${state.streak > 1 ? ` · ${ZAD.esc(pick(`سلسلة ${state.streak} أيام`, `${state.streak} day streak`))}` : ''}
          </p>
          <div class="result-actions">
            <button type="button" class="btn btn-primary" id="again">
              ${ZAD.esc(pick('حاول مرة أخرى', 'Try again'))}</button>
            <button type="button" class="btn btn-ghost" id="to-hub">
              ${ZAD.esc(pick('كل الاختبارات', 'All quizzes'))}</button>
            ${state.major ? `<button type="button" class="btn btn-ghost" id="to-path">
              ${ZAD.esc(pick('مصادر هذا المسار', 'Pathway resources'))}</button>` : ''}
          </div>
        </div>

        <h2 class="review-h">${ZAD.esc(pick('المراجعة', 'Review'))}</h2>
        <div class="review-list">
          ${state.questions.map((q, i) => {
            const chosen = state.answers[i];
            const ok = chosen === q.correct;
            const answers = qAnswers(q);
            return `
              <article class="review-row ${ok ? 'ok' : 'no'}">
                <div class="rr-top">
                  <span class="rr-n">${i + 1}</span>
                  <b>${ZAD.esc(qText(q))}</b>
                </div>
                <div class="rr-a">
                  <span class="rr-yours">${ZAD.esc(pick('إجابتك:', 'You:'))}
                    ${ZAD.esc(chosen == null || chosen === -1
                      ? pick('لم تجب', 'no answer') : answers[chosen])}</span>
                  ${!ok ? `<span class="rr-right">${ZAD.esc(pick('الصحيح:', 'Correct:'))}
                    ${ZAD.esc(answers[q.correct])}</span>` : ''}
                </div>
                <p class="rr-x">${ZAD.esc(qExpl(q))}</p>
                ${q.unit ? `<button type="button" class="link-btn" data-open-unit="${q.unit}">
                    ${ZAD.esc(pick('افتح الوحدة', 'Open the unit'))}</button>` : ''}
              </article>`;
          }).join('')}
        </div>
      </section>`;

    document.getElementById('again').addEventListener('click', () =>
      start(state.mode, state.major, state.unit));
    document.getElementById('to-hub').addEventListener('click', renderHub);
    document.getElementById('to-path')?.addEventListener('click', () =>
      ZAD.openPathwaySheet(state.major));
    app.querySelectorAll('[data-open-unit]').forEach(b =>
      b.addEventListener('click', () => ZAD.openUnitSheet(Number(b.getAttribute('data-open-unit')))));

    ZAD.scrollTop();
    ZAD.applyLang(ZAD.lang);
  }

  /* ============================================================
     PLACEMENT
     ============================================================ */
  function startPlacement() {
    state.view = 'placement';
    state.mode = 'placement';
    state.index = 0;
    state.placementScores = {};
    state.answers = new Array(ZAD.PLACEMENT.length).fill(null);
    renderPlacement();
  }

  function renderPlacement() {
    const q = ZAD.PLACEMENT[state.index];
    const n = ZAD.PLACEMENT.length;

    app.innerHTML = `
      <section class="run">
        <div class="run-top">
          <button type="button" class="btn btn-ghost btn-sm" id="run-quit">
            ${ZAD.esc(pick('خروج', 'Quit'))}</button>
          <div class="run-title">${ZAD.esc(pick('ما المسار المناسب لي؟', 'Which pathway suits me?'))}</div>
          <div class="run-count">${state.index + 1} / ${n}</div>
        </div>
        <div class="run-bar"><i style="inline-size:${(state.index / n) * 100}%"></i></div>

        <h2 class="run-q">${ZAD.esc(pick(q.qAr, q.qEn))}</h2>
        <p class="run-hint">${ZAD.esc(pick(
          'لا توجد إجابة صحيحة — اختر ما يشبهك فعلًا.',
          'There is no right answer — pick what is actually true for you.'))}</p>

        <div class="run-answers">
          ${q.options.map((o, i) => `
            <button type="button" class="ans soft" data-i="${i}">
              <span class="ans-k">${'ABCD'[i]}</span>
              <span class="ans-t">${ZAD.esc(pick(o.ar, o.en))}</span>
            </button>`).join('')}
        </div>

        ${state.index > 0 ? `
          <div class="run-foot">
            <button type="button" class="btn btn-ghost" id="p-back">
              ${ZAD.esc(ZAD.t('btn_back'))}</button>
          </div>` : ''}
      </section>`;

    app.querySelectorAll('.ans').forEach(b => b.addEventListener('click', () => {
      const i = Number(b.getAttribute('data-i'));
      state.answers[state.index] = i;
      if (state.index + 1 >= ZAD.PLACEMENT.length) placementResult();
      else { state.index++; renderPlacement(); }
    }));

    document.getElementById('run-quit').addEventListener('click', renderHub);
    document.getElementById('p-back')?.addEventListener('click', () => {
      state.index = Math.max(0, state.index - 1);
      renderPlacement();
    });
    ZAD.scrollTop();
    ZAD.applyLang(ZAD.lang);
  }

  function placementResult() {
    const scores = {};
    ZAD.PLACEMENT.forEach((q, qi) => {
      const choice = q.options[state.answers[qi]];
      if (!choice) return;
      Object.entries(choice.scores).forEach(([slug, pts]) => {
        scores[slug] = (scores[slug] || 0) + pts;
      });
    });

    const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1]).slice(0, 3);
    const top    = ranked[0];
    const max    = top ? top[1] : 1;

    app.innerHTML = `
      <section class="result">
        <div class="result-card">
          <h1>${ZAD.esc(pick('مسارك المقترح', 'Your suggested pathway'))}</h1>
          <p class="result-sub">${ZAD.esc(pick(
            'اقتراح مبني على تفضيلاتك — وليس قرارًا نهائيًا. جرّب اختبار المسار قبل أن تحسم.',
            'A suggestion based on your preferences, not a verdict. Try the pathway quiz before deciding.'))}</p>

          <div class="place-list">
            ${ranked.map(([slug, pts], i) => {
              const m = ZAD.majorBySlug(slug);
              if (!m) return '';
              return `
                <article class="place-row ${i === 0 ? 'first' : ''}" style="--accent:${m.accent}">
                  <span class="place-rank">${i + 1}</span>
                  <span class="major-icon">${ZAD.ICONS[m.icon] || ZAD.ICONS.book}</span>
                  <div class="place-main">
                    <b>${ZAD.esc(pick(m.ar, m.en))}</b>
                    <div class="bar"><i style="inline-size:${Math.round((pts / max) * 100)}%"></i></div>
                    <small>${ZAD.esc(pick(m.descAr, m.descEn))}</small>
                  </div>
                  <div class="place-btns">
                    <button type="button" class="btn btn-soft btn-sm" data-path="${ZAD.esc(slug)}">
                      ${ZAD.esc(pick('المصادر', 'Resources'))}</button>
                    <button type="button" class="btn btn-ghost btn-sm" data-quiz="${ZAD.esc(slug)}">
                      ${ZAD.esc(pick('اختبار', 'Quiz'))}</button>
                  </div>
                </article>`;
            }).join('')}
          </div>

          <div class="result-actions">
            <button type="button" class="btn btn-primary" id="set-major"
                    data-slug="${ZAD.esc(top ? top[0] : '')}">
              ${ZAD.esc(pick('اجعله مساري في ملفي', 'Set as my pathway'))}</button>
            <button type="button" class="btn btn-ghost" id="to-hub">
              ${ZAD.esc(pick('رجوع', 'Back'))}</button>
          </div>
        </div>
      </section>`;

    app.querySelectorAll('[data-path]').forEach(b =>
      b.addEventListener('click', () => ZAD.openPathwaySheet(b.getAttribute('data-path'))));
    app.querySelectorAll('[data-quiz]').forEach(b =>
      b.addEventListener('click', () => start('quick', b.getAttribute('data-quiz'))));
    document.getElementById('to-hub').addEventListener('click', renderHub);

    document.getElementById('set-major').addEventListener('click', async e => {
      const slug = e.currentTarget.getAttribute('data-slug');
      if (!slug) return;
      const user = await ZAD.getUser();
      if (!user) {
        ZAD.toast(ZAD.t('msg_need_login'), 'info');
        setTimeout(() => (location.href = 'signin.html'), 900);
        return;
      }
      const { error } = await ZAD.updateProfile({ major_slug: slug });
      if (error) ZAD.toast(error.message || ZAD.t('err_generic'), 'err');
      else ZAD.toast(ZAD.t('msg_profile_up'), 'ok');
    });

    ZAD.scrollTop();
    ZAD.applyLang(ZAD.lang);
  }

  /* ============================================================
     FLASHCARDS  (Leitner boxes 1–5)
     ============================================================ */
  function startCards(major) {
    const pool = major ? ZAD.quizFor(major) : ZAD.allQuestions();
    const deck = shuffle(pool.map((q, i) => ({
      q: prepare(q), key: `${q.unit || 'x'}#${(q.qEn || '').slice(0, 24)}#${i}`,
    }))).filter(c => ZAD.cardIsDue(c.key));

    state.view = 'cards';
    state.cards = deck.slice(0, 20);
    state.cardIndex = 0;
    state.cardsDone = 0;
    renderCard();
  }

  function renderCard() {
    if (!state.cards.length) {
      app.innerHTML = `
        <section class="result">
          <div class="result-card">
            <h1>${ZAD.esc(pick('لا توجد بطاقات مستحقة الآن', 'No cards due right now'))}</h1>
            <p class="result-sub">${ZAD.esc(pick(
              'المراجعة المتباعدة تعيد البطاقات في مواعيدها. ارجع غدًا، أو ابدأ اختبارًا عاديًا.',
              'Spaced repetition brings cards back on schedule. Come back tomorrow, or take a normal quiz.'))}</p>
            <div class="result-actions">
              <button type="button" class="btn btn-primary" id="to-hub">
                ${ZAD.esc(pick('رجوع', 'Back'))}</button>
            </div>
          </div>
        </section>`;
      document.getElementById('to-hub').addEventListener('click', renderHub);
      return;
    }

    if (state.cardIndex >= state.cards.length) {
      app.innerHTML = `
        <section class="result">
          <div class="result-card">
            <h1>${ZAD.esc(pick('انتهت جلسة المراجعة', 'Review session finished'))}</h1>
            <p class="result-sub">${ZAD.esc(pick(
              `راجعت ${state.cardsDone} بطاقة. البطاقات التي عرفتها ستعود بعد وقت أطول.`,
              `You reviewed ${state.cardsDone} cards. The ones you knew will come back later.`))}</p>
            <div class="result-actions">
              <button type="button" class="btn btn-primary" id="to-hub">
                ${ZAD.esc(pick('رجوع', 'Back'))}</button>
            </div>
          </div>
        </section>`;
      document.getElementById('to-hub').addEventListener('click', renderHub);
      return;
    }

    const card = state.cards[state.cardIndex];
    const q = card.q;

    app.innerHTML = `
      <section class="run cards">
        <div class="run-top">
          <button type="button" class="btn btn-ghost btn-sm" id="run-quit">
            ${ZAD.esc(pick('خروج', 'Quit'))}</button>
          <div class="run-title">${ZAD.esc(pick('بطاقات المراجعة', 'Flashcards'))}</div>
          <div class="run-count">${state.cardIndex + 1} / ${state.cards.length}</div>
        </div>

        <div class="flashcard" id="flashcard">
          <div class="fc-face fc-front"><p>${ZAD.esc(qText(q))}</p></div>
          <div class="fc-face fc-back">
            <b>${ZAD.esc(qAnswers(q)[q.correct])}</b>
            <p>${ZAD.esc(qExpl(q))}</p>
          </div>
        </div>

        <div class="run-foot" id="fc-foot">
          <button type="button" class="btn btn-primary" id="fc-flip">
            ${ZAD.esc(pick('اقلب البطاقة', 'Flip the card'))}</button>
        </div>
      </section>`;

    document.getElementById('run-quit').addEventListener('click', renderHub);
    document.getElementById('fc-flip').addEventListener('click', () => {
      document.getElementById('flashcard').classList.add('flipped');
      document.getElementById('fc-foot').innerHTML = `
        <button type="button" class="btn btn-ghost" id="fc-again">
          ${ZAD.esc(pick('لم أعرفها', 'Did not know it'))}</button>
        <button type="button" class="btn btn-primary" id="fc-knew">
          ${ZAD.esc(pick('عرفتها', 'I knew it'))}</button>`;

      document.getElementById('fc-again').addEventListener('click', () => rate(card, false));
      document.getElementById('fc-knew').addEventListener('click', () => rate(card, true));
    });
    ZAD.scrollTop();
    ZAD.applyLang(ZAD.lang);
  }

  function rate(card, knew) {
    const state0 = ZAD.getCardState()[card.key];
    const box = state0?.box || 1;
    ZAD.setCardBox(card.key, knew ? box + 1 : 1);
    state.cardsDone++;
    state.cardIndex++;
    renderCard();
  }

  /* ============================================================
     INIT
     ============================================================ */
  async function init() {
    ZAD.boot();
    ZAD.bootShell();
    ZAD.mountFooter('#site-footer');
    ZAD.wireNavAuth();

    ZAD.onAuth(async user => {
      ZAD.setStoreUser(user?.id);
      state.attempts = await ZAD.getAttempts();
      state.mastery  = ZAD.masteryByMajor(state.attempts);
      state.streak   = ZAD.streakFrom(state.attempts);
      if (state.view === 'hub') renderHub();
    });

    document.addEventListener('zad:lang', () => {
      if (state.view === 'hub') renderHub();
      else if (state.view === 'run') renderQuestion();
      else if (state.view === 'placement') renderPlacement();
      else if (state.view === 'cards') renderCard();
    });

    /* deep links: quiz.html?mode=…&major=…&unit=… */
    const mode  = params.get('mode');
    const major = params.get('major');
    const unit  = params.get('unit');

    if (unit)                       start('unit', null, unit);
    else if (mode === 'placement')  startPlacement();
    else if (mode === 'cards')      startCards(major);
    else if (mode === 'daily')      start('daily', null);
    else if (mode && major)         start(mode === 'exam' ? 'exam' : 'quick', major);
    else if (major)                 start('quick', major);
    else                            renderHub();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
