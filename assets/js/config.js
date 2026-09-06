/* ============================================================
   ZAD — configuration
   The only file you need to edit if your keys or links change.
   ============================================================ */
window.ZAD = window.ZAD || {};

/* --- Supabase -------------------------------------------------
   The "publishable" key is designed to be visible in the browser.
   It is safe here ONLY because Row Level Security is enabled on
   every table (see sql/schema.sql). Never put a service_role key
   in front-end code.
--------------------------------------------------------------- */
ZAD.SUPABASE_URL = 'https://xxffliivclhrudjljvis.supabase.co';
ZAD.SUPABASE_KEY = 'sb_publishable_9ucM1cgAqenYMHkklnhNmw_dCCngNvR';

/* --- Site owner ---------------------------------------------- */
ZAD.OWNER = {
  name_en: 'Rayan Assoli',
  name_ar: 'ريان عسولي',
  handle : '@4ssoli',
  role_ar: 'طالب تكنولوجيا معلومات · صانع منصة زاد',
  role_en: 'IT student · creator of ZAD',
};

/* --- Social links -------------------------------------------- */
ZAD.SOCIAL = [
  { key:'instagram', label:'Instagram', handle:'@4ssoli',
    url:'https://www.instagram.com/4ssoli/', accent:'var(--a-fuchsia)' },
  { key:'facebook',  label:'Facebook',  handle:'@4ssoli',
    url:'https://web.facebook.com/4ssoli?locale=ar_AR', accent:'var(--a-blue)' },
];

/* --- Feature flags ------------------------------------------- */
ZAD.FEATURES = {
  particles: true,   // animated constellation background
  aurora   : true,   // blurred colour blobs
  liveDB   : true,   // pull units/majors from Supabase when available
};

/* --- What is new ---------------------------------------------
   Newest first. The date of the first entry is what the little
   dot in the footer compares against, so add new entries on top.
-------------------------------------------------------------- */
ZAD.CHANGELOG = [
  { date:'2026-08-18',
    ar:'لعبة الأسئلة، المعجم، ومساحة عمل لكل وحدة',
    en:'The question game, the glossary, and a workspace for every unit',
    bodyAr:'أضفنا اختبارات لكل مسار مع شرح لكل إجابة، اختبار تحديد المسار، تحدي يومي، بطاقات مراجعة، معجم مصطلحات بلغتين، متتبّع معايير التسليم، مواعيد التسليم، خطة مذاكرة، ووضع عمل بلا إنترنت.',
    bodyEn:'Quizzes for every pathway with an explanation for each answer, a placement quiz, a daily challenge, revision flashcards, a bilingual glossary, an assignment criteria tracker, deadlines, a study plan, and offline support.' },
];
