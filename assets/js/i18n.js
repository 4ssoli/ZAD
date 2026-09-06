/* ============================================================
   ZAD — bilingual dictionary (Arabic / English)
   Any element with data-i18n="key" gets its text swapped.
   Use data-i18n-attr="placeholder:key" to translate an attribute.
   ============================================================ */
window.ZAD = window.ZAD || {};

ZAD.DICT = {
  /* ---- navigation ---- */
  nav_home:      { ar:'الرئيسية',        en:'Home' },
  nav_about:     { ar:'عن التخصص',       en:'About' },
  nav_majors:    { ar:'التخصصات',        en:'Pathways' },
  nav_courses:   { ar:'المواد الدراسية', en:'Courses' },
  nav_social:    { ar:'تواصل معي',       en:'Connect' },
  nav_signin:    { ar:'تسجيل الدخول',    en:'Sign in' },
  nav_dashboard: { ar:'لوحتي',           en:'My dashboard' },
  nav_signout:   { ar:'خروج',            en:'Sign out' },
  nav_menu:      { ar:'القائمة',         en:'Menu' },
  nav_lang:      { ar:'اللغة',           en:'Language' },
  nav_quiz:      { ar:'الاختبارات',      en:'Quizzes' },
  nav_glossary:  { ar:'المعجم',          en:'Glossary' },

  /* ---- hero ---- */
  hero_pill:  { ar:'منصة زاد التعليمية — تكنولوجيا المعلومات',
                en:'ZAD Learning Platform — Information Technology' },
  hero_title: { ar:'زاد', en:'ZAD' },
  hero_sub:   { ar:'مكتبة رقمية شاملة لتخصص تكنولوجيا المعلومات (Pearson BTEC International): كل الوحدات والكتب والدوسيات في مكان واحد، مرتّبة حسب مسارات التخصص، مع حساب شخصي يحفظ تقدّمك.',
                en:'A complete digital library for the IT major (Pearson BTEC International): every unit, textbook and workbook in one place, organised by specialisation pathway, with a personal account that saves your progress.' },
  hero_cta1:  { ar:'استعرض المواد',    en:'Browse courses' },
  hero_cta2:  { ar:'أنشئ حسابك',       en:'Create your account' },
  hero_cta3:  { ar:'افتح لوحتي',       en:'Open my dashboard' },
  hero_cta4:  { ar:'ما المسار المناسب لي؟', en:'Which pathway suits me?' },
  scroll:     { ar:'مرّر للأسفل',      en:'Scroll' },

  stat1: { ar:'مادة ووحدة دراسية',     en:'Units & subjects' },
  stat2: { ar:'مسارات تخصص',           en:'Specialisation pathways' },
  stat3: { ar:'لغتان: عربي / إنجليزي', en:'Bilingual AR / EN' },
  stat4: { ar:'شهادة معتمدة دوليًا',   en:'Internationally accredited' },

  /* ---- about ---- */
  about_eyebrow:    { ar:'عن التخصص',  en:'About' },
  about_title:      { ar:'تخصص تكنولوجيا المعلومات — IT BTEC',
                      en:'Information Technology — IT BTEC' },
  about_sub:        { ar:'نظرة سريعة على طبيعة التخصص وما يقدمه من مهارات تقنية عملية',
                      en:'A quick look at the major and the practical tech skills it covers' },
  about_card_title: { ar:'ماذا يعني BTEC في تكنولوجيا المعلومات؟', en:'What is IT BTEC?' },
  about_card_body:  { ar:'شهادة Pearson BTEC International في تكنولوجيا المعلومات هي برنامج تطبيقي معتمد دوليًا، يجمع بين الأساس النظري والتطبيق العملي في مجالات البرمجة، الشبكات، تطوير المواقع والتطبيقات، الأمن السيبراني، تصميم الألعاب، والرسوميات الرقمية — بهدف تأهيل الطالب لسوق العمل التقني أو مواصلة التعليم الجامعي في IT.',
                      en:'The Pearson BTEC International qualification in IT is an internationally accredited, applied programme that blends theory with hands-on practice across programming, networking, web & app development, cybersecurity, game design and digital graphics — preparing students for the tech job market or further university study in IT.' },
  about_card_body2: { ar:'يُقاس حجم كل وحدة بساعات التعلّم الموجّه (GLH) وبعدد النقاط (Credits)، وتُقيَّم معظم الوحدات داخليًا عبر مشاريع عملية، بينما تُقيَّم وحدات أساسية عبر مهمة يحددها Pearson.',
                      en:'Each unit is sized in Guided Learning Hours (GLH) and credits. Most units are assessed internally through practical projects, while core units are assessed via a Pearson Set Assignment.' },

  chip1:{ar:'برمجة',en:'Programming'},        chip2:{ar:'شبكات',en:'Networking'},
  chip3:{ar:'أمن سيبراني',en:'Cybersecurity'}, chip4:{ar:'تطوير مواقع',en:'Web Dev'},
  chip5:{ar:'تطبيقات موبايل',en:'Mobile Apps'},chip6:{ar:'تصميم ألعاب',en:'Game Design'},
  chip7:{ar:'بيانات',en:'Data'},               chip8:{ar:'إدارة مشاريع',en:'Project Mgmt'},

  /* ---- majors ---- */
  majors_eyebrow: { ar:'المسارات',        en:'Pathways' },
  majors_title:   { ar:'مسارات التخصص',   en:'Specialisation pathways' },
  majors_sub:     { ar:'ينقسم تخصص تكنولوجيا المعلومات إلى مسارات، كل مسار يجمع الوحدات المرتبطة به. اختر مسارًا لعرض وحداته.',
                    en:'The IT major splits into pathways, each grouping its related units. Pick a pathway to see its units.' },
  majors_units:   { ar:'وحدة',            en:'units' },
  majors_skills:  { ar:'أهم المهارات',    en:'Key skills' },
  majors_view:    { ar:'عرض الوحدات',     en:'View units' },

  majors_links:   { ar:'روابط ومصادر',    en:'links & resources' },
  links_label:    { ar:'رابط',            en:'links' },
  open_pathway:   { ar:'المصادر والروابط', en:'Resources & links' },
  open_workspace: { ar:'مساحة الوحدة',    en:'Unit workspace' },

  /* ---- study tools ---- */
  tools_eyebrow: { ar:'أدوات الدراسة',   en:'Study tools' },
  tools_title:   { ar:'ذاكر، اختبر، وراجع', en:'Study, test, revise' },
  tools_sub:     { ar:'أدوات عملية مبنية على المنهج نفسه: اختبارات لكل مسار، تحدٍّ يومي، بطاقات مراجعة، ومعجم مصطلحات بلغتين.',
                   en:'Practical tools built on the syllabus itself: a quiz for every pathway, a daily challenge, revision flashcards and a bilingual glossary.' },

  /* ---- glossary ---- */
  gloss_eyebrow: { ar:'المصطلحات',        en:'Terminology' },
  gloss_title:   { ar:'معجم تكنولوجيا المعلومات', en:'IT glossary' },
  gloss_sub:     { ar:'كل مصطلح تحتاجه في المنهج، بالعربية والإنجليزية معًا، مع تعريف واضح في سطر واحد.',
                   en:'Every term the syllabus needs, in Arabic and English together, each defined in a single line.' },
  gloss_ph:      { ar:'ابحث بالعربية أو الإنجليزية…', en:'Search in Arabic or English…' },

  /* ---- shell: palette, shortcuts, news ---- */
  close:            { ar:'إغلاق',            en:'Close' },
  palette_open:     { ar:'بحث شامل',         en:'Search everything' },
  palette_ph:       { ar:'ابحث عن وحدة أو مسار أو مصطلح…', en:'Search a unit, pathway or term…' },
  palette_move:     { ar:'تنقّل',            en:'to move' },
  palette_open_hint:{ ar:'فتح',              en:'to open' },
  shortcuts_title:  { ar:'اختصارات لوحة المفاتيح', en:'Keyboard shortcuts' },
  whatsnew_title:   { ar:'جديد المنصة',      en:'What is new' },

  /* ---- courses ---- */
  courses_eyebrow:  { ar:'المنهاج',       en:'Curriculum' },
  courses_title:    { ar:'المواد والوحدات الدراسية', en:'Courses & units' },
  courses_sub:      { ar:'كل الوحدات المتوفرة كملفات PDF قابلة للتصفح والتحميل مباشرة',
                      en:'Every unit available as a browsable, downloadable PDF' },
  search_ph:        { ar:'ابحث باسم الوحدة أو رقمها…', en:'Search by unit name or number…' },
  filter_all:       { ar:'الكل',          en:'All' },
  filter_available: { ar:'متوفر PDF',     en:'PDF available' },
  filter_soon:      { ar:'قريبًا',        en:'Coming soon' },
  filter_saved:     { ar:'المحفوظة',      en:'Saved' },
  pdf_view:         { ar:'فتح PDF',       en:'Open PDF' },
  soon_label:       { ar:'قريبًا',        en:'Coming soon' },
  available_label:  { ar:'متوفر',         en:'Available' },
  no_results:       { ar:'لا توجد نتائج مطابقة', en:'No matching results' },
  no_results_sub:   { ar:'جرّب كلمة بحث أخرى أو غيّر الفلتر', en:'Try another search term or change the filter' },
  save_unit:        { ar:'حفظ الوحدة',    en:'Save unit' },
  unsave_unit:      { ar:'إزالة من المحفوظات', en:'Remove from saved' },
  glh_label:        { ar:'ساعة',          en:'GLH' },
  credits_label:    { ar:'نقطة',          en:'credits' },
  assess_internal:  { ar:'تقييم داخلي',   en:'Internal' },
  assess_set:       { ar:'مهمة Pearson',  en:'Pearson Set' },

  /* ---- social ---- */
  social_eyebrow: { ar:'تواصل',        en:'Connect' },
  social_title:   { ar:'تواصل معي',    en:"Let's connect" },
  social_sub:     { ar:'للأسئلة أو الاقتراحات أو الإبلاغ عن ملف ناقص — راسلني مباشرة',
                    en:'For questions, suggestions, or to report a missing file — message me directly' },

  /* ---- footer ---- */
  foot_about_t:  { ar:'عن زاد',        en:'About ZAD' },
  foot_about_p:  { ar:'منصة تعليمية مفتوحة تجمع مواد تخصص تكنولوجيا المعلومات (IT BTEC) في مكان واحد، بواجهة عربية/إنجليزية وحساب شخصي يحفظ تقدّمك.',
                   en:'An open learning platform gathering the IT BTEC course materials in one place, with an Arabic/English interface and a personal account that saves your progress.' },
  foot_links_t:  { ar:'روابط',         en:'Links' },
  foot_social_t: { ar:'تابعني',        en:'Follow me' },
  footer_text:   { ar:'منصة زاد التعليمية — تخصص تكنولوجيا المعلومات (IT BTEC)',
                   en:'ZAD Learning Platform — Information Technology (IT BTEC)' },
  footer_rights: { ar:'جميع الحقوق محفوظة',  en:'All rights reserved' },
  footer_by:     { ar:'تصميم وتطوير',        en:'Designed & built by' },

  /* ---- auth ---- */
  auth_aside_t:   { ar:'كل مواد تخصصك في حساب واحد', en:'Your whole major in one account' },
  auth_aside_p:   { ar:'أنشئ حسابًا مجانيًا لحفظ الوحدات، متابعة تقدّمك، والحصول على توصيات حسب مسارك الدراسي.',
                    en:'Create a free account to save units, track your progress, and get recommendations based on your pathway.' },
  perk1_t:{ar:'احفظ وحداتك',en:'Save your units'},
  perk1_s:{ar:'ثبّت الوحدات المهمة وارجع لها في أي وقت',en:'Pin the units that matter and come back any time'},
  perk2_t:{ar:'تابع تقدّمك',en:'Track your progress'},
  perk2_s:{ar:'سجّل نسبة إنجازك في كل وحدة وشاهدها في لوحتك',en:'Record how far you are in each unit and see it on your dashboard'},
  perk3_t:{ar:'توصيات حسب مسارك',en:'Pathway recommendations'},
  perk3_s:{ar:'نعرض لك الوحدات المرتبطة بالمسار الذي اخترته',en:'We surface the units tied to the pathway you picked'},

  tab_signin:  { ar:'تسجيل الدخول', en:'Sign in' },
  tab_signup:  { ar:'حساب جديد',    en:'Create account' },

  signin_h:    { ar:'أهلًا بعودتك',  en:'Welcome back' },
  signin_p:    { ar:'سجّل دخولك لمتابعة تقدّمك ووحداتك المحفوظة',
                 en:'Sign in to pick up your progress and saved units' },
  signup_h:    { ar:'أنشئ حسابك',    en:'Create your account' },
  signup_p:    { ar:'ثلاث خطوات قصيرة — ونجهّز لك المحتوى المناسب لمسارك',
                 en:'Three short steps — then we tailor the content to your pathway' },

  step1_t: { ar:'بيانات الحساب',      en:'Account details' },
  step1_s: { ar:'البريد وكلمة المرور التي ستستخدمها للدخول', en:'The email and password you will sign in with' },
  step2_t: { ar:'من أنت؟',            en:'Who are you?' },
  step2_s: { ar:'اختياراتك التعليمية تحدد ما نعرضه لك',      en:'Your education choices shape what we show you' },
  step3_t: { ar:'مسارك واهتماماتك',   en:'Your pathway & interests' },
  step3_s: { ar:'اختر مسارًا واحدًا وأي عدد من الاهتمامات',  en:'Pick one pathway and any number of interests' },

  f_fullname:  { ar:'الاسم الكامل',        en:'Full name' },
  f_fullname_p:{ ar:'مثال: ريان عسولي',    en:'e.g. Rayan Assoli' },
  f_username:  { ar:'اسم المستخدم',        en:'Username' },
  f_username_p:{ ar:'حروف وأرقام فقط',     en:'letters and numbers only' },
  f_email:     { ar:'البريد الإلكتروني',   en:'Email' },
  f_email_p:   { ar:'you@example.com',     en:'you@example.com' },
  f_password:  { ar:'كلمة المرور',         en:'Password' },
  f_password_p:{ ar:'٦ أحرف على الأقل',    en:'at least 6 characters' },
  f_role:      { ar:'صفتك',                en:'I am a' },
  f_level:     { ar:'المستوى التعليمي',    en:'Education level' },
  f_year:      { ar:'السنة الدراسية',      en:'Study year' },
  f_school:    { ar:'المدرسة / المؤسسة',   en:'School / institution' },
  f_school_p:  { ar:'اسم مدرستك أو كليتك',  en:'your school or college' },
  f_country:   { ar:'الدولة',              en:'Country' },
  f_major:     { ar:'المسار الرئيسي',      en:'Main pathway' },
  f_interests: { ar:'اهتماماتك',           en:'Your interests' },
  f_lang:      { ar:'لغة الواجهة المفضّلة', en:'Preferred language' },
  f_bio:       { ar:'نبذة عنك',            en:'About you' },
  f_choose:    { ar:'اختر…',               en:'Choose…' },
  f_optional:  { ar:'اختياري',             en:'optional' },

  btn_next:    { ar:'التالي',            en:'Next' },
  btn_back:    { ar:'رجوع',              en:'Back' },
  btn_signin:  { ar:'تسجيل الدخول',      en:'Sign in' },
  btn_signup:  { ar:'إنشاء الحساب',      en:'Create account' },
  btn_save:    { ar:'حفظ التغييرات',     en:'Save changes' },

  have_acc:    { ar:'لديك حساب بالفعل؟',  en:'Already have an account?' },
  no_acc:      { ar:'ليس لديك حساب؟',     en:"Don't have an account?" },
  forgot:      { ar:'نسيت كلمة المرور؟',  en:'Forgot your password?' },
  reset_sent:  { ar:'أرسلنا رابط إعادة التعيين إلى بريدك.', en:'We sent a reset link to your email.' },
  reset_need_email:{ ar:'اكتب بريدك الإلكتروني أولًا ثم اضغط الرابط.',
                     en:'Enter your email first, then click the link.' },

  /* ---- messages ---- */
  msg_signed_in:  { ar:'تم تسجيل الدخول بنجاح', en:'Signed in successfully' },
  msg_signed_out: { ar:'تم تسجيل الخروج',       en:'Signed out' },
  msg_check_mail: { ar:'تحقّق من بريدك الإلكتروني لتفعيل الحساب.',
                    en:'Check your email to confirm your account.' },
  msg_saved:      { ar:'تم الحفظ',              en:'Saved' },
  msg_removed:    { ar:'تمت الإزالة',           en:'Removed' },
  msg_profile_up: { ar:'تم تحديث ملفك الشخصي',  en:'Profile updated' },
  msg_need_login: { ar:'سجّل الدخول أولًا لحفظ الوحدات', en:'Sign in first to save units' },
  msg_offline:    { ar:'قاعدة البيانات غير متصلة حاليًا — المحتوى معروض للقراءة فقط.',
                    en:'The database is not reachable — content is shown read-only.' },
  err_fill:       { ar:'أكمل الحقول المطلوبة',  en:'Please complete the required fields' },
  err_email:      { ar:'أدخل بريدًا إلكترونيًا صحيحًا', en:'Enter a valid email address' },
  err_pw_short:   { ar:'كلمة المرور قصيرة جدًا (٦ أحرف على الأقل)',
                    en:'Password is too short (6 characters minimum)' },
  err_username:   { ar:'اسم المستخدم: ٣–٢٤ حرفًا، إنجليزية وأرقام و _ . فقط',
                    en:'Username: 3–24 chars, English letters, numbers, _ and . only' },
  err_generic:    { ar:'حدث خطأ، حاول مرة أخرى', en:'Something went wrong, please try again' },

  /* ---- dashboard ---- */
  dash_hi:        { ar:'أهلًا',              en:'Hi' },
  dash_sub:       { ar:'هذه لوحتك الشخصية على منصة زاد', en:'This is your personal ZAD dashboard' },
  dash_saved:     { ar:'وحدات محفوظة',       en:'Saved units' },
  dash_progress:  { ar:'متوسط التقدّم',      en:'Average progress' },
  dash_done:      { ar:'وحدات مكتملة',       en:'Completed units' },
  dash_available: { ar:'متاح في مسارك',      en:'Available in your pathway' },
  dash_my_saved:  { ar:'وحداتي المحفوظة',    en:'My saved units' },
  dash_my_prog:   { ar:'تقدّمي',             en:'My progress' },
  dash_recommend: { ar:'موصى بها لمسارك',    en:'Recommended for your pathway' },
  dash_profile:   { ar:'ملفي الشخصي',        en:'My profile' },
  dash_empty_saved:{ ar:'لم تحفظ أي وحدة بعد — اضغط أيقونة الحفظ على أي وحدة.',
                     en:'No saved units yet — tap the bookmark icon on any unit.' },
  dash_empty_prog:{ ar:'لم تبدأ أي وحدة بعد.', en:'You have not started any unit yet.' },
  dash_browse:    { ar:'تصفّح كل الوحدات',    en:'Browse all units' },
  dash_loading:   { ar:'جارِ التحميل…',       en:'Loading…' },
  dash_guest_t:   { ar:'تحتاج لتسجيل الدخول', en:'You need to sign in' },
  dash_guest_p:   { ar:'هذه الصفحة خاصة بالأعضاء. سجّل دخولك أو أنشئ حسابًا مجانيًا.',
                    en:'This page is for members. Sign in or create a free account.' },

  /* ---- dashboard: new panels ---- */
  dash_deadlines: { ar:'مواعيد التسليم',   en:'Deadlines' },
  dash_mastery:   { ar:'إتقاني في الاختبارات', en:'My quiz mastery' },
  dash_take_quiz: { ar:'اختبر نفسك',       en:'Take a quiz' },

  plan_title: { ar:'خطة المذاكرة',        en:'Study plan' },
  plan_sub:   { ar:'أدخل موعد امتحانك وسنوزّع الوحدات غير المكتملة على الأسابيع المتبقية.',
                en:'Enter your exam date and we spread the unfinished units across the weeks you have left.' },
  plan_date:  { ar:'موعد الامتحان',       en:'Exam date' },
  plan_hours: { ar:'ساعات المذاكرة أسبوعيًا', en:'Study hours per week' },
  plan_make:  { ar:'أنشئ الخطة',          en:'Build my plan' },

  share_title: { ar:'شارك تقدّمك',        en:'Share your progress' },
  share_sub:   { ar:'صورة جاهزة للنشر تعرض إنجازك على المنصة.',
                 en:'A ready-to-post image showing what you have achieved here.' },
  share_dl:    { ar:'حمّل الصورة',        en:'Download the image' },

  class_title:     { ar:'الصفوف',          en:'Classes' },
  class_bad_code:  { ar:'رمز الصف يتكوّن من ٦ حروف وأرقام.', en:'A class code is 6 letters and numbers.' },
  class_not_found: { ar:'لا يوجد صف بهذا الرمز.', en:'No class has that code.' },

  f_display:      { ar:'الاسم المعروض',   en:'Display name' },
  f_display_p:    { ar:'الاسم الظاهر للآخرين', en:'the name others see' },
  f_display_hint: { ar:'يظهر في لوحة المتصدّرين ولصف معلّمك فقط.',
                    en:'Shown on the leaderboard and to your teacher only.' },
  f_leaderboard:  { ar:'أوافق على ظهوري في لوحة المتصدّرين',
                    en:'Show me on the leaderboard' },
};

/* ---------- engine ---------- */
ZAD.lang = (function () {
  try { return localStorage.getItem('zad-lang') || 'ar'; } catch (e) { return 'ar'; }
})();

ZAD.t = function (key) {
  const row = ZAD.DICT[key];
  return row ? (row[ZAD.lang] ?? row.ar) : key;
};

/**
 * "n units" with correct grammar in both languages.
 * Arabic counts differently from English: 1 → وحدة, 2 → وحدتان,
 * 3–10 → وحدات, 11+ → back to the singular form.
 */
ZAD.countUnits = function (n) {
  if (ZAD.lang === 'en') return `${n} ${n === 1 ? 'unit' : 'units'}`;
  if (n === 1) return 'وحدة واحدة';
  if (n === 2) return 'وحدتان';
  if (n >= 3 && n <= 10) return `${n} وحدات`;
  return `${n} وحدة`;
};

/** Swap all [data-i18n] text and [data-i18n-attr] attributes on the page. */
ZAD.applyLang = function (lang) {
  const previous = ZAD.lang;
  if (lang) ZAD.lang = lang;
  const l = ZAD.lang;
  const root = document.documentElement;

  root.setAttribute('lang', l);
  root.setAttribute('dir', l === 'ar' ? 'rtl' : 'ltr');
  try { localStorage.setItem('zad-lang', l); } catch (e) { /* private mode */ }

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const row = ZAD.DICT[el.getAttribute('data-i18n')];
    if (row) el.textContent = row[l] ?? row.ar;
  });

  document.querySelectorAll('[data-i18n-attr]').forEach(el => {
    el.getAttribute('data-i18n-attr').split(',').forEach(pair => {
      const [attr, key] = pair.split(':').map(s => s.trim());
      const row = ZAD.DICT[key];
      if (attr && row) el.setAttribute(attr, row[l] ?? row.ar);
    });
  });

  document.querySelectorAll('[data-lang-btn]').forEach(b => {
    b.classList.toggle('active', b.getAttribute('data-lang-btn') === l);
  });

  // Only announce a real change. Re-applying the same language is a plain
  // refresh (callers do it after re-rendering), and firing the event there
  // would make any listener that re-renders recurse forever.
  if (l !== previous) {
    document.dispatchEvent(new CustomEvent('zad:lang', { detail: { lang: l } }));
  }
};
