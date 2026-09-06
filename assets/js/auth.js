/* ============================================================
   ZAD — authentication + user data
   Thin wrapper over supabase-js so pages stay readable.
   Every function resolves to { data, error } style results and
   never throws, so callers can stay simple.
   ============================================================ */
window.ZAD = window.ZAD || {};

(function () {
  const db = () => ZAD.db;

  /* ---------- session ---------- */

  /** Current user, or null. */
  ZAD.getUser = async function () {
    if (!db()) return null;
    const { data, error } = await db().auth.getUser();
    if (error) return null;
    return data?.user ?? null;
  };

  /** Current profile row, or null. */
  ZAD.getProfile = async function (userId) {
    if (!db()) return null;
    const uid = userId || (await ZAD.getUser())?.id;
    if (!uid) return null;
    const { data, error } = await db()
      .from('profiles').select('*').eq('id', uid).maybeSingle();
    if (error) { console.warn('[ZAD] getProfile', error.message); return null; }
    return data;
  };

  /** Fires cb(user) now and on every future auth change. */
  ZAD.onAuth = function (cb) {
    if (!db()) { cb(null); return; }
    ZAD.getUser().then(cb);
    db().auth.onAuthStateChange((_evt, session) => cb(session?.user ?? null));
  };

  /* ---------- sign up / in / out ---------- */

  /**
   * @param {object} p  { email, password, full_name, username, role,
   *                      edu_level, study_year, major_slug, interests,
   *                      school, country, preferred_lang }
   */
  ZAD.signUp = async function (p) {
    if (!db()) return { error: { message: ZAD.t('msg_offline') } };
    const { data, error } = await db().auth.signUp({
      email: p.email.trim(),
      password: p.password,
      options: {
        emailRedirectTo: location.origin + location.pathname.replace(/[^/]*$/, 'dashboard.html'),
        data: {
          full_name     : p.full_name     || null,
          username      : p.username      || null,
          role          : p.role          || 'student',
          edu_level     : p.edu_level     || null,
          study_year    : p.study_year    || null,
          major_slug    : p.major_slug    || null,
          interests     : p.interests     || [],
          school        : p.school        || null,
          country       : p.country       || null,
          preferred_lang: p.preferred_lang || ZAD.lang,
        },
      },
    });
    return { data, error };
  };

  ZAD.signIn = async function (email, password) {
    if (!db()) return { error: { message: ZAD.t('msg_offline') } };
    const { data, error } = await db().auth.signInWithPassword({
      email: String(email).trim(), password,
    });
    return { data, error };
  };

  ZAD.signOut = async function () {
    if (!db()) return;
    await db().auth.signOut();
  };

  ZAD.resetPassword = async function (email) {
    if (!db()) return { error: { message: ZAD.t('msg_offline') } };
    const { data, error } = await db().auth.resetPasswordForEmail(String(email).trim(), {
      redirectTo: location.origin + location.pathname.replace(/[^/]*$/, 'signin.html'),
    });
    return { data, error };
  };

  /* ---------- profile ---------- */

  ZAD.updateProfile = async function (patch) {
    if (!db()) return { error: { message: ZAD.t('msg_offline') } };
    const user = await ZAD.getUser();
    if (!user) return { error: { message: ZAD.t('msg_need_login') } };
    const { data, error } = await db()
      .from('profiles').update(patch).eq('id', user.id).select().maybeSingle();
    return { data, error };
  };

  /* ---------- saved units ----------
     Unit identity: the site's own unit number (units.unit_no). We resolve
     it to units.id once and cache the map, so callers just pass unit_no. */

  let unitIdMap = null;   // { unit_no -> units.id }

  async function unitIds() {
    if (unitIdMap) return unitIdMap;
    if (!db()) return (unitIdMap = {});
    const { data, error } = await db().from('units').select('id,unit_no');
    if (error || !data) { console.warn('[ZAD] unit map', error?.message); return (unitIdMap = {}); }
    unitIdMap = Object.fromEntries(data.map(r => [r.unit_no, r.id]));
    return unitIdMap;
  }
  ZAD.unitIds = unitIds;

  /** Set of unit_no values the signed-in user has saved. */
  ZAD.getSaved = async function () {
    if (!db()) return new Set();
    const user = await ZAD.getUser();
    if (!user) return new Set();
    const map = await unitIds();
    const back = Object.fromEntries(Object.entries(map).map(([no, id]) => [id, Number(no)]));
    const { data, error } = await db()
      .from('saved_units').select('unit_id').eq('user_id', user.id);
    if (error || !data) return new Set();
    return new Set(data.map(r => back[r.unit_id]).filter(n => n != null));
  };

  /** Toggle a bookmark. Returns { saved: boolean } or { error }. */
  ZAD.toggleSaved = async function (unitNo) {
    if (!db()) return { error: { message: ZAD.t('msg_offline') } };
    const user = await ZAD.getUser();
    if (!user) return { error: { message: ZAD.t('msg_need_login') } };

    const map = await unitIds();
    const unitId = map[unitNo];
    if (!unitId) return { error: { message: ZAD.t('err_generic') } };

    const { data: existing } = await db()
      .from('saved_units').select('unit_id')
      .eq('user_id', user.id).eq('unit_id', unitId).maybeSingle();

    if (existing) {
      const { error } = await db().from('saved_units')
        .delete().eq('user_id', user.id).eq('unit_id', unitId);
      return error ? { error } : { saved: false };
    }
    const { error } = await db().from('saved_units')
      .insert({ user_id: user.id, unit_id: unitId });
    return error ? { error } : { saved: true };
  };

  /* ---------- progress ---------- */

  /** [{ unit_no, state, percent }] for the signed-in user. */
  ZAD.getProgress = async function () {
    if (!db()) return [];
    const user = await ZAD.getUser();
    if (!user) return [];
    const map = await unitIds();
    const back = Object.fromEntries(Object.entries(map).map(([no, id]) => [id, Number(no)]));
    const { data, error } = await db()
      .from('unit_progress').select('unit_id,state,percent').eq('user_id', user.id);
    if (error || !data) return [];
    return data
      .map(r => ({ unit_no: back[r.unit_id], state: r.state, percent: r.percent }))
      .filter(r => r.unit_no != null);
  };

  ZAD.setProgress = async function (unitNo, percent) {
    if (!db()) return { error: { message: ZAD.t('msg_offline') } };
    const user = await ZAD.getUser();
    if (!user) return { error: { message: ZAD.t('msg_need_login') } };

    const map = await unitIds();
    const unitId = map[unitNo];
    if (!unitId) return { error: { message: ZAD.t('err_generic') } };

    const pct = Math.max(0, Math.min(100, Math.round(percent)));
    const state = pct >= 100 ? 'completed' : pct > 0 ? 'in_progress' : 'not_started';

    const { error } = await db().from('unit_progress').upsert(
      { user_id: user.id, unit_id: unitId, percent: pct, state },
      { onConflict: 'user_id,unit_id' }
    );
    return error ? { error } : { ok: true };
  };

  /* ---------- contact ---------- */
  ZAD.sendMessage = async function ({ name, email, message }) {
    if (!db()) return { error: { message: ZAD.t('msg_offline') } };
    const user = await ZAD.getUser();
    const { error } = await db().from('contact_messages').insert({
      user_id: user?.id ?? null,
      name: String(name).trim(),
      email: String(email).trim(),
      message: String(message).trim(),
    });
    return error ? { error } : { ok: true };
  };

  /* ---------- nav auth state ----------
     Swaps the "Sign in" nav button for a dashboard + sign-out pair. */
  ZAD.wireNavAuth = function () {
    const slot = document.querySelector('[data-auth-slot]');
    if (!slot) return;

    const guest = () => {
      slot.innerHTML =
        `<a class="btn btn-primary btn-sm" href="signin.html" data-i18n="nav_signin"></a>`;
      ZAD.applyLang(ZAD.lang);
    };
    const member = (user) => {
      const initial = (user.email || '?').charAt(0).toUpperCase();
      slot.innerHTML = `
        <a class="btn btn-soft btn-sm" href="dashboard.html" title="${ZAD.esc(user.email || '')}">
          <span style="font-family:var(--font-en);font-weight:800">${ZAD.esc(initial)}</span>
          <span data-i18n="nav_dashboard"></span>
        </a>
        <button class="icon-btn" id="nav-signout" type="button"
                aria-label="${ZAD.esc(ZAD.t('nav_signout'))}"
                title="${ZAD.esc(ZAD.t('nav_signout'))}">${ZAD.ICONS.logout}</button>`;
      ZAD.applyLang(ZAD.lang);
      slot.querySelector('#nav-signout')?.addEventListener('click', async () => {
        await ZAD.signOut();
        ZAD.toast(ZAD.t('msg_signed_out'), 'ok');
        setTimeout(() => location.reload(), 600);
      });
    };

    ZAD.onAuth(user => (user ? member(user) : guest()));
  };
})();
