/* ============================================================
   ZAD — Supabase client
   Loaded from the UMD CDN bundle so the site runs with ZERO npm
   install and even works when opened straight from the file system.
   Requires <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
   BEFORE this file.
   ============================================================ */
window.ZAD = window.ZAD || {};

(function () {
  const lib = window.supabase; // the UMD global from the CDN bundle

  if (!lib || typeof lib.createClient !== 'function') {
    console.warn('[ZAD] Supabase library not loaded — running in offline mode.');
    ZAD.db = null;
    ZAD.dbReady = false;
    return;
  }
  if (!ZAD.SUPABASE_URL || !ZAD.SUPABASE_KEY) {
    console.warn('[ZAD] Supabase keys missing in config.js — running in offline mode.');
    ZAD.db = null;
    ZAD.dbReady = false;
    return;
  }

  ZAD.db = lib.createClient(ZAD.SUPABASE_URL, ZAD.SUPABASE_KEY, {
    auth: {
      persistSession   : true,
      autoRefreshToken : true,
      detectSessionInUrl: true,
      storageKey       : 'zad-auth',
    },
  });
  ZAD.dbReady = true;
})();
