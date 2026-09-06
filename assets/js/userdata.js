/* ============================================================
   ZAD — per-user study data
   Notes, deadlines, criteria ticks, quiz attempts, flashcard
   boxes, PDF reading position and class membership.

   Every function follows the same rule as auth.js: it never
   throws, and it works signed out. When Supabase is reachable
   and the visitor is signed in, data lives in the database and
   is mirrored locally; otherwise it lives in localStorage only,
   so the whole site still works offline or before the new SQL
   has been run.
   ============================================================ */
window.ZAD = window.ZAD || {};

(function () {
  const db = () => (ZAD.dbReady ? ZAD.db : null);

  /* ---------------- local storage layer ---------------- */
  let currentUid = 'guest';
  ZAD.setStoreUser = uid => { currentUid = uid || 'guest'; };

  const key = name => `zad:${currentUid}:${name}`;

  const lsGet = (name, fallback) => {
    try {
      const raw = localStorage.getItem(key(name));
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  };
  const lsSet = (name, value) => {
    try { localStorage.setItem(key(name), JSON.stringify(value)); } catch (e) { /* full or private */ }
  };
  ZAD.lsGet = lsGet;
  ZAD.lsSet = lsSet;

  /** Did the last database call fail because the new tables are missing? */
  ZAD.schemaWarned = false;
  function noteSchemaGap(error, table) {
    if (!error) return false;
    const missing = /relation .* does not exist|schema cache|could not find the table/i
      .test(error.message || '');
    if (missing && !ZAD.schemaWarned) {
      ZAD.schemaWarned = true;
      console.warn(
        `[ZAD] Table "${table}" is not in the database yet — study data is being kept ` +
        'in this browser only. Run sql/schema.sql in Supabase to sync it across devices.'
      );
    }
    return missing;
  }

  async function uid() {
    const user = await ZAD.getUser();
    return user?.id || null;
  }

  /* Resolve a site unit number to the units.id UUID (auth.js caches the map). */
  async function unitId(unitNo) {
    if (!db()) return null;
    const map = await ZAD.unitIds();
    return map[unitNo] || null;
  }

  /* ============================================================
     Notes — one free-text note per unit
     ============================================================ */
  ZAD.getNotes = async function () {
    const local = lsGet('notes', {});
    const id = await uid();
    if (!db() || !id) return local;

    const { data, error } = await db()
      .from('unit_notes').select('unit_id,body').eq('user_id', id);
    if (error) { noteSchemaGap(error, 'unit_notes'); return local; }

    const map = await ZAD.unitIds();
    const back = Object.fromEntries(Object.entries(map).map(([no, u]) => [u, Number(no)]));
    const remote = {};
    (data || []).forEach(r => { if (back[r.unit_id] != null) remote[back[r.unit_id]] = r.body; });
    lsSet('notes', remote);
    return remote;
  };

  ZAD.saveNote = async function (unitNo, body) {
    const local = lsGet('notes', {});
    if (body && body.trim()) local[unitNo] = body; else delete local[unitNo];
    lsSet('notes', local);

    const id = await uid();
    if (!db() || !id) return { ok: true, local: true };

    const u = await unitId(unitNo);
    if (!u) return { ok: true, local: true };

    if (!body || !body.trim()) {
      const { error } = await db().from('unit_notes')
        .delete().eq('user_id', id).eq('unit_id', u);
      return error ? { error } : { ok: true };
    }
    const { error } = await db().from('unit_notes').upsert(
      { user_id: id, unit_id: u, body: body.trim(), updated_at: new Date().toISOString() },
      { onConflict: 'user_id,unit_id' }
    );
    if (error) { noteSchemaGap(error, 'unit_notes'); return { ok: true, local: true }; }
    return { ok: true };
  };

  /* ============================================================
     Deadlines — one due date per unit
     ============================================================ */
  ZAD.getDeadlines = async function () {
    const local = lsGet('deadlines', {});
    const id = await uid();
    if (!db() || !id) return local;

    const { data, error } = await db()
      .from('unit_deadlines').select('unit_id,due_date,title').eq('user_id', id);
    if (error) { noteSchemaGap(error, 'unit_deadlines'); return local; }

    const map = await ZAD.unitIds();
    const back = Object.fromEntries(Object.entries(map).map(([no, u]) => [u, Number(no)]));
    const remote = {};
    (data || []).forEach(r => {
      const no = back[r.unit_id];
      if (no != null) remote[no] = { due: r.due_date, title: r.title || '' };
    });
    lsSet('deadlines', remote);
    return remote;
  };

  ZAD.saveDeadline = async function (unitNo, due, title) {
    const local = lsGet('deadlines', {});
    if (due) local[unitNo] = { due, title: title || '' }; else delete local[unitNo];
    lsSet('deadlines', local);

    const id = await uid();
    if (!db() || !id) return { ok: true, local: true };
    const u = await unitId(unitNo);
    if (!u) return { ok: true, local: true };

    if (!due) {
      const { error } = await db().from('unit_deadlines')
        .delete().eq('user_id', id).eq('unit_id', u);
      return error ? { error } : { ok: true };
    }
    const { error } = await db().from('unit_deadlines').upsert(
      { user_id: id, unit_id: u, due_date: due, title: title || null },
      { onConflict: 'user_id,unit_id' }
    );
    if (error) { noteSchemaGap(error, 'unit_deadlines'); return { ok: true, local: true }; }
    return { ok: true };
  };

  /** Days from today until a yyyy-mm-dd date. Negative means overdue. */
  ZAD.daysUntil = function (isoDate) {
    if (!isoDate) return null;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const due = new Date(isoDate + 'T00:00:00');
    if (Number.isNaN(due.getTime())) return null;
    return Math.round((due - today) / 86400000);
  };

  /* ============================================================
     Assignment criteria ticks — { unitNo: [codes…] }
     ============================================================ */
  ZAD.getCriteriaProgress = async function () {
    const local = lsGet('criteria', {});
    const id = await uid();
    if (!db() || !id) return local;

    const { data, error } = await db()
      .from('criteria_progress').select('unit_id,code').eq('user_id', id);
    if (error) { noteSchemaGap(error, 'criteria_progress'); return local; }

    const map = await ZAD.unitIds();
    const back = Object.fromEntries(Object.entries(map).map(([no, u]) => [u, Number(no)]));
    const remote = {};
    (data || []).forEach(r => {
      const no = back[r.unit_id];
      if (no == null) return;
      (remote[no] = remote[no] || []).push(r.code);
    });
    lsSet('criteria', remote);
    return remote;
  };

  ZAD.toggleCriterion = async function (unitNo, code, on) {
    const local = lsGet('criteria', {});
    const list = new Set(local[unitNo] || []);
    if (on) list.add(code); else list.delete(code);
    local[unitNo] = [...list];
    lsSet('criteria', local);

    const id = await uid();
    if (!db() || !id) return { ok: true, local: true };
    const u = await unitId(unitNo);
    if (!u) return { ok: true, local: true };

    if (on) {
      const { error } = await db().from('criteria_progress').upsert(
        { user_id: id, unit_id: u, code },
        { onConflict: 'user_id,unit_id,code' }
      );
      if (error) { noteSchemaGap(error, 'criteria_progress'); return { ok: true, local: true }; }
    } else {
      const { error } = await db().from('criteria_progress')
        .delete().eq('user_id', id).eq('unit_id', u).eq('code', code);
      if (error) { noteSchemaGap(error, 'criteria_progress'); return { ok: true, local: true }; }
    }
    return { ok: true };
  };

  /* ============================================================
     PDF reading position — local only, it is a per-device thing
     ============================================================ */
  ZAD.getReadPage = unitNo => (lsGet('pdfpage', {})[unitNo] || 1);
  ZAD.setReadPage = function (unitNo, page) {
    const all = lsGet('pdfpage', {});
    all[unitNo] = Math.max(1, Number(page) || 1);
    lsSet('pdfpage', all);
  };

  /* ============================================================
     Quiz attempts
     ============================================================ */
  ZAD.saveAttempt = async function (attempt) {
    // attempt: { major, mode, score, total, seconds }
    const row = {
      major: attempt.major || null,
      mode : attempt.mode,
      score: attempt.score,
      total: attempt.total,
      seconds: attempt.seconds || 0,
      at   : new Date().toISOString(),
    };
    const local = lsGet('attempts', []);
    local.unshift(row);
    lsSet('attempts', local.slice(0, 200));

    const id = await uid();
    if (!db() || !id) return { ok: true, local: true };

    const { error } = await db().from('quiz_attempts').insert({
      user_id: id, major_slug: row.major, mode: row.mode,
      score: row.score, total: row.total, duration_s: row.seconds,
    });
    if (error) { noteSchemaGap(error, 'quiz_attempts'); return { ok: true, local: true }; }
    return { ok: true };
  };

  ZAD.getAttempts = async function () {
    const local = lsGet('attempts', []);
    const id = await uid();
    if (!db() || !id) return local;

    const { data, error } = await db()
      .from('quiz_attempts')
      .select('major_slug,mode,score,total,duration_s,taken_at')
      .eq('user_id', id).order('taken_at', { ascending: false }).limit(200);
    if (error) { noteSchemaGap(error, 'quiz_attempts'); return local; }

    const remote = (data || []).map(r => ({
      major: r.major_slug, mode: r.mode, score: r.score,
      total: r.total, seconds: r.duration_s, at: r.taken_at,
    }));
    lsSet('attempts', remote);
    return remote;
  };

  /** Mastery per pathway: average % of the three most recent attempts. */
  ZAD.masteryByMajor = function (attempts) {
    const out = {};
    (ZAD.MAJORS || []).forEach(m => {
      const mine = attempts
        .filter(a => a.major === m.slug && a.total > 0)
        .slice(0, 3);
      if (!mine.length) return;
      const pct = mine.reduce((s, a) => s + (a.score / a.total) * 100, 0) / mine.length;
      out[m.slug] = Math.round(pct);
    });
    return out;
  };

  /** Badge tier for a percentage. */
  ZAD.badgeFor = function (pct) {
    if (pct >= 95) return { tier:'gold',   icon:'🥇', ar:'ذهبي',  en:'Gold' };
    if (pct >= 80) return { tier:'silver', icon:'🥈', ar:'فضّي',  en:'Silver' };
    if (pct >= 60) return { tier:'bronze', icon:'🥉', ar:'برونزي', en:'Bronze' };
    return null;
  };

  /** Consecutive days with at least one attempt, counting back from today. */
  ZAD.streakFrom = function (attempts) {
    const days = new Set(attempts.map(a => String(a.at).slice(0, 10)));
    let streak = 0;
    const cursor = new Date(); cursor.setHours(0, 0, 0, 0);
    // today only counts if it has an attempt; otherwise start from yesterday
    if (!days.has(cursor.toISOString().slice(0, 10))) cursor.setDate(cursor.getDate() - 1);
    while (days.has(cursor.toISOString().slice(0, 10))) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
  };

  /* ============================================================
     Leaderboard — reads the opt-in public view
     ============================================================ */
  ZAD.getLeaderboard = async function (majorSlug) {
    if (!db()) return [];
    let q = db().from('leaderboard').select('display_name,major_slug,best_pct,attempts')
      .order('best_pct', { ascending: false }).limit(25);
    if (majorSlug && majorSlug !== 'all') q = q.eq('major_slug', majorSlug);
    const { data, error } = await q;
    if (error) { noteSchemaGap(error, 'leaderboard'); return []; }
    return data || [];
  };

  /* ============================================================
     Flashcards — Leitner boxes 1..5, kept per device
     Key: "<majorSlug>#<index>"
     ============================================================ */
  ZAD.getCardState = () => lsGet('cards', {});
  ZAD.setCardBox = function (cardKey, box) {
    const all = lsGet('cards', {});
    const b = Math.max(1, Math.min(5, box));
    // review gap in days doubles with each box: 1, 2, 4, 8, 16
    const gap = Math.pow(2, b - 1);
    const due = new Date();
    due.setDate(due.getDate() + gap);
    all[cardKey] = { box: b, due: due.toISOString().slice(0, 10) };
    lsSet('cards', all);
  };
  ZAD.cardIsDue = function (cardKey) {
    const row = lsGet('cards', {})[cardKey];
    if (!row) return true;                     // never seen → due now
    return row.due <= new Date().toISOString().slice(0, 10);
  };

  /* ============================================================
     Classes — a teacher creates one, students join with the code
     ============================================================ */
  ZAD.makeClassCode = function () {
    // no 0/O/1/I so a code read aloud in class is unambiguous
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let out = '';
    const bytes = new Uint32Array(6);
    (window.crypto || window.msCrypto).getRandomValues(bytes);
    for (let i = 0; i < 6; i++) out += alphabet[bytes[i] % alphabet.length];
    return out;
  };

  ZAD.createClass = async function (name) {
    if (!db()) return { error: { message: ZAD.t('msg_offline') } };
    const id = await uid();
    if (!id) return { error: { message: ZAD.t('msg_need_login') } };

    const code = ZAD.makeClassCode();
    const { data, error } = await db().from('classes')
      .insert({ code, name: name || null, owner_id: id }).select().maybeSingle();
    if (error) { noteSchemaGap(error, 'classes'); return { error }; }
    return { data };
  };

  ZAD.myClasses = async function () {
    if (!db()) return { owned: [], joined: [] };
    const id = await uid();
    if (!id) return { owned: [], joined: [] };

    const [owned, member] = await Promise.all([
      db().from('classes').select('*').eq('owner_id', id),
      db().from('class_members').select('class_id,classes(*)').eq('user_id', id),
    ]);
    if (owned.error) noteSchemaGap(owned.error, 'classes');
    if (member.error) noteSchemaGap(member.error, 'class_members');

    return {
      owned : owned.data || [],
      joined: (member.data || []).map(r => r.classes).filter(Boolean),
    };
  };

  ZAD.joinClass = async function (code) {
    if (!db()) return { error: { message: ZAD.t('msg_offline') } };
    const id = await uid();
    if (!id) return { error: { message: ZAD.t('msg_need_login') } };

    const clean = String(code || '').trim().toUpperCase();
    if (!/^[A-Z0-9]{6}$/.test(clean)) return { error: { message: ZAD.t('class_bad_code') } };

    // join_class is a SECURITY DEFINER function: a student never needs read
    // access to the classes table just to look a code up.
    const { data, error } = await db().rpc('join_class', { p_code: clean });
    if (error) {
      noteSchemaGap(error, 'join_class');
      if (/class not found/i.test(error.message || '')) {
        return { error: { message: ZAD.t('class_not_found') } };
      }
      return { error };
    }
    return { data: Array.isArray(data) ? data[0] : data };
  };

  ZAD.leaveClass = async function (classId) {
    if (!db()) return { error: { message: ZAD.t('msg_offline') } };
    const id = await uid();
    if (!id) return { error: { message: ZAD.t('msg_need_login') } };
    const { error } = await db().from('class_members')
      .delete().eq('class_id', classId).eq('user_id', id);
    return error ? { error } : { ok: true };
  };

  /** Roster for a class the signed-in user owns (RLS enforces ownership). */
  ZAD.classRoster = async function (classId) {
    if (!db()) return [];
    const { data, error } = await db()
      .from('class_overview').select('*').eq('class_id', classId);
    if (error) { noteSchemaGap(error, 'class_overview'); return []; }
    return data || [];
  };
})();
