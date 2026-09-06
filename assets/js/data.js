/* ============================================================
   ZAD — content data
   This mirrors sql/schema.sql so the site renders correctly even
   before the database is set up (or if the user is offline).
   When Supabase is reachable, ui.js swaps in the live rows.
   ============================================================ */
window.ZAD = window.ZAD || {};

/* ---------- inline SVG icon set ---------- */
ZAD.ICONS = {
  code:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
  globe:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
  network:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="2" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="16" y="16" width="6" height="6" rx="1"/><path d="M12 8v4M12 12H5v4M12 12h7v4"/></svg>',
  shield:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>',
  chart:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><rect x="7" y="12" width="3" height="6" rx="1"/><rect x="12" y="8" width="3" height="10" rx="1"/><rect x="17" y="4" width="3" height="14" rx="1"/></svg>',
  gamepad:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 11h4M8 9v4M15 12h.01M18 10h.01"/><rect x="2" y="6" width="20" height="12" rx="5"/></svg>',
  wrench:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a4 4 0 0 0 5 5l-9.4 9.4a2.1 2.1 0 0 1-3-3l9.4-9.4z"/><path d="m18 2 4 4-2.5 2.5L15.5 4.5 18 2z"/></svg>',
  palette:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2a10 10 0 1 0 0 20 2 2 0 0 0 1.6-3.2 2 2 0 0 1 1.6-3.2H18a4 4 0 0 0 4-4 10 10 0 0 0-10-9.6z"/></svg>',
  briefcase:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>',
  book:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
  search:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>',
  bookmark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>',
  bookmarkFill:'<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>',
  download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><path d="M12 15V3"/></svg>',
  user:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  teacher:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10 12 5 2 10l10 5 10-5z"/><path d="M6 12v5c3 2 9 2 12 0v-5"/></svg>',
  users:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  spark:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6 7.8 7.8M16.2 16.2l2.2 2.2M18.4 5.6 16.2 7.8M7.8 16.2l-2.2 2.2"/><circle cx="12" cy="12" r="3"/></svg>',
  check:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
  alert:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>',
  info:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>',
  mail:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/></svg>',
  lock:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
  eye:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>',
  eyeOff:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.9 4.24A9.1 9.1 0 0 1 12 4c6 0 10 7 10 7a18 18 0 0 1-2.3 3.1M6.6 6.6A18 18 0 0 0 2 11s4 7 10 7a9 9 0 0 0 4.4-1.1"/><path d="m2 2 20 20M9.9 9.9a3 3 0 0 0 4.2 4.2"/></svg>',
  logout:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><path d="M21 12H9"/></svg>',
  arrowL:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>',
  arrowR:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>',
  instagram:'<svg viewBox="0 0 24 24"><path d="M12 2c2.7 0 3.06.01 4.12.06 1.06.05 1.79.22 2.43.47.66.26 1.22.6 1.77 1.16.55.55.9 1.11 1.16 1.77.25.64.42 1.37.47 2.43.05 1.06.06 1.42.06 4.12s-.01 3.06-.06 4.12c-.05 1.06-.22 1.79-.47 2.43a4.9 4.9 0 0 1-1.16 1.77 4.9 4.9 0 0 1-1.77 1.16c-.64.25-1.37.42-2.43.47-1.06.05-1.42.06-4.12.06s-3.06-.01-4.12-.06c-1.06-.05-1.79-.22-2.43-.47a4.9 4.9 0 0 1-1.77-1.16 4.9 4.9 0 0 1-1.16-1.77c-.25-.64-.42-1.37-.47-2.43C2.01 15.06 2 14.7 2 12s.01-3.06.06-4.12c.05-1.06.22-1.79.47-2.43.26-.66.6-1.22 1.16-1.77A4.9 4.9 0 0 1 5.45 2.5c.64-.25 1.37-.42 2.43-.47C8.94 2.01 9.3 2 12 2zm0 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 8.2a3.2 3.2 0 1 1 0-6.4 3.2 3.2 0 0 1 0 6.4zm5.3-9.4a1.17 1.17 0 1 1 0-2.33 1.17 1.17 0 0 1 0 2.33z"/></svg>',
  facebook: '<svg viewBox="0 0 24 24"><path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.52 1.5-3.91 3.77-3.91 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.78-1.63 1.57v1.89h2.78l-.45 2.91h-2.33V22c4.78-.76 8.44-4.92 8.44-9.94z"/></svg>',
};

/* ---------- IT specialisation pathways (majors) ---------- */
ZAD.MAJORS = [
  { slug:'software-development', icon:'code',      accent:'var(--a-blue)',
    ar:'تطوير البرمجيات', en:'Software Development',
    descAr:'التفكير الحاسوبي، الخوارزميات، وكتابة برامج منظمة وقابلة للصيانة.',
    descEn:'Computational thinking, algorithms, and writing structured, maintainable programs.',
    skillsAr:['Python','خوارزميات','هياكل بيانات','اختبار البرمجيات'],
    skillsEn:['Python','Algorithms','Data structures','Software testing'] },

  { slug:'web-development', icon:'globe',          accent:'var(--a-cyan)',
    ar:'تطوير الويب', en:'Web Development',
    descAr:'بناء مواقع من التخطيط إلى التنفيذ: HTML وCSS وJavaScript والاستضافة والأداء.',
    descEn:'Building websites end to end: HTML, CSS, JavaScript, hosting and performance.',
    skillsAr:['HTML','CSS','JavaScript','استضافة','أداء الموقع'],
    skillsEn:['HTML','CSS','JavaScript','Hosting','Performance'] },

  { slug:'networking', icon:'network',             accent:'var(--a-emerald)',
    ar:'الشبكات والبنية التحتية', en:'Networking & Infrastructure',
    descAr:'تصميم الشبكات، البروتوكولات، الأجهزة، والاتصال الآمن بين الأنظمة.',
    descEn:'Network design, protocols, hardware, and secure communication between systems.',
    skillsAr:['TCP/IP','LAN / WAN','أجهزة الشبكة','تصميم الشبكات'],
    skillsEn:['TCP/IP','LAN / WAN','Network hardware','Network design'] },

  { slug:'cybersecurity', icon:'shield',           accent:'var(--a-rose)',
    ar:'الأمن السيبراني', en:'Cybersecurity',
    descAr:'التهديدات، تقييم المخاطر، خطط الحماية، والاستجابة للحوادث الأمنية.',
    descEn:'Threats, risk assessment, protection plans, and responding to security incidents.',
    skillsAr:['تقييم المخاطر','التشفير','الاستجابة للحوادث','الأدلة الرقمية'],
    skillsEn:['Risk assessment','Encryption','Incident response','Digital forensics'] },

  { slug:'data-ai', icon:'chart',                  accent:'var(--a-fuchsia)',
    ar:'البيانات والذكاء الاصطناعي', en:'Data & AI',
    descAr:'نمذجة البيانات، جداول البيانات، لوحات المعلومات، ومقدمة الذكاء الاصطناعي.',
    descEn:'Data modelling, spreadsheets, dashboards, and an introduction to AI.',
    skillsAr:['نمذجة البيانات','Excel','لوحات معلومات','مقدمة AI'],
    skillsEn:['Data modelling','Excel','Dashboards','Intro to AI'] },

  { slug:'game-development', icon:'gamepad',       accent:'var(--a-lime)',
    ar:'تطوير الألعاب', en:'Game Development',
    descAr:'من فكرة اللعبة وتصميم آلياتها إلى نموذج قابل للعب.',
    descEn:'From game concept and mechanics design to a playable build.',
    skillsAr:['تصميم الألعاب','آليات اللعب','محركات الألعاب'],
    skillsEn:['Game design','Game mechanics','Game engines'] },

  { slug:'it-support', icon:'wrench',              accent:'var(--a-amber)',
    ar:'الدعم الفني وإدارة IT', en:'IT Support & Management',
    descAr:'استكشاف الأعطال، الصيانة، وإدارة موارد تكنولوجيا المعلومات في المؤسسات.',
    descEn:'Troubleshooting, maintenance, and managing IT resources in organisations.',
    skillsAr:['استكشاف الأعطال','الصيانة','دعم المستخدمين'],
    skillsEn:['Troubleshooting','Maintenance','User support'] },

  { slug:'digital-media', icon:'palette',          accent:'var(--a-orange)',
    ar:'الوسائط الرقمية', en:'Digital Media & Graphics',
    descAr:'الرسوميات الرقمية، الرسوم المتحركة، والتصميم البصري للمنتجات الرقمية.',
    descEn:'Digital graphics, animation, and visual design for digital products.',
    skillsAr:['رسوميات رقمية','رسوم متحركة','تصميم بصري'],
    skillsEn:['Digital graphics','Animation','Visual design'] },

  { slug:'it-business', icon:'briefcase',          accent:'var(--p-400)',
    ar:'أعمال وإدارة مشاريع IT', en:'IT Business & Projects',
    descAr:'دور الأنظمة في المؤسسة، إدارة المشاريع، ووسائل التواصل في الأعمال.',
    descEn:'The role of systems in an organisation, project management, and social media in business.',
    skillsAr:['إدارة المشاريع','أنظمة المؤسسات','تواصل الأعمال'],
    skillsEn:['Project management','Enterprise systems','Business communication'] },
];

/* ---------- course units ---------- */
ZAD.UNITS = [
  { n:1,  code:'Unit 1', major:'it-business',          glh:120, credits:20, assess:'pearson_set',
    ar:'استخدام تكنولوجيا المعلومات لدعم المعلومات والاتصالات في المؤسسات',
    en:'Using IT to Support Information & Communication in Organisations',
    descAr:'دور البيانات والمعلومات في اتخاذ القرار، وأدوات تكنولوجيا المعلومات المستخدمة داخل المؤسسات.',
    descEn:'The role of data and information in decision-making, and the IT tools organisations rely on.',
    file:'pdfs/unit01-it-support-organisations.pdf' },

  { n:2,  code:'Unit 5', major:'data-ai',              glh:60,  credits:10, assess:'internal',
    ar:'نمذجة البيانات وجداول البيانات', en:'Data Modelling and Spreadsheets',
    descAr:'معالجة البيانات، إنشاء لوحات المعلومات (Dashboards)، واستخلاص النتائج منها.',
    descEn:'Data processing techniques, building dashboards, and drawing conclusions from data.',
    file:'pdfs/unit02-data-modelling.pdf' },

  { n:3,  code:null,     major:'networking',           glh:60,  credits:10, assess:'internal',
    ar:'مقدمة إلى شبكات الكمبيوتر', en:'Introduction to Computer Networks',
    descAr:'أساسيات الشبكات، مكوناتها، أنواعها، وكيفية تصميم شبكة آمنة وفعّالة.',
    descEn:'Networking fundamentals, components, types, and designing a secure, efficient network.',
    file:'pdfs/unit03-computer-networks.pdf' },

  { n:4,  code:'Unit 4', major:'software-development', glh:90,  credits:15, assess:'internal',
    ar:'مقدمة في البرمجة', en:'Introduction to Programming',
    descAr:'مهارات التفكير الحاسوبي، تصميم وبرمجة حلول برمجية لمشكلات متنوعة.',
    descEn:'Computational thinking skills; designing and coding software solutions.',
    file:'pdfs/unit04-programming.pdf' },

  { n:5,  code:null,     major:'digital-media',        glh:60,  credits:10, assess:'internal',
    ar:'مقدمة للرسومات الرقمية والرسوم المتحركة', en:'Introduction to Digital Graphics & Animation',
    descAr:'أساسيات تصميم الرسوم الرقمية الثابتة والمتحركة وأدواتها.',
    descEn:'Fundamentals of static and animated digital graphics and the tools used to create them.',
    file:'pdfs/unit05-digital-graphics-animation.pdf' },

  { n:6,  code:'Unit 6', major:'web-development',      glh:60,  credits:10, assess:'internal',
    ar:'مقدمة لتطوير مواقع الويب', en:'Introduction to Website Development',
    descAr:'أساسيات بناء صفحات الويب وهيكلتها قبل الدخول في التطوير المتقدم.',
    descEn:'The basics of structuring and building web pages before advanced development.',
    file:null },

  { n:7,  code:'Unit 7', major:'software-development', glh:60,  credits:10, assess:'internal',
    ar:'مقدمة في التطبيقات', en:'Introduction to Applications',
    descAr:'تصميم وبناء تطبيق للأجهزة المحمولة يلبي احتياجات مستخدمين محددين.',
    descEn:'Designing and building a mobile application that meets specific user needs.',
    file:'pdfs/unit07-app-development-intro.pdf' },

  { n:8,  code:'Unit 8', major:'game-development',     glh:60,  credits:10, assess:'internal',
    ar:'مقدمة في تصميم الألعاب', en:'Introduction to Game Design',
    descAr:'أساسيات تصميم ألعاب الحاسوب وتوقعات اللاعبين وميزات التصميم.',
    descEn:'Fundamentals of computer game design, player expectations and design features.',
    file:'pdfs/unit08-game-design-intro.pdf' },

  { n:9,  code:null,     major:'it-business',          glh:null, credits:null, assess:'internal',
    ar:'كتاب أنظمة تكنولوجيا المعلومات الإستراتيجية', en:'Strategic IT Systems (Textbook)',
    descAr:'كيفية استخدام أنظمة تكنولوجيا المعلومات دعمًا لأهداف المؤسسة الإستراتيجية.',
    descEn:"How IT systems are used to support an organisation's strategic goals.",
    file:null },

  { n:10, code:null,     major:'it-business',          glh:null, credits:null, assess:'internal',
    ar:'دوسية أنظمة تكنولوجيا المعلومات الإستراتيجية', en:'Strategic IT Systems (Workbook)',
    descAr:'تمارين وأنشطة تطبيقية مرافقة لمادة أنظمة تكنولوجيا المعلومات الإستراتيجية.',
    descEn:'Practical exercises and activities accompanying the Strategic IT Systems unit.',
    file:null },

  { n:11, code:'Unit 6', major:'web-development',      glh:60,  credits:10, assess:'internal',
    ar:'تطوير المواقع الإلكترونية', en:'Website Development',
    descAr:'بناء موقع إلكتروني كامل من التخطيط إلى التنفيذ والاختبار.',
    descEn:'Building a full website from planning through implementation and testing.',
    file:'pdfs/unit11-website-development.pdf' },

  { n:12, code:'Unit 7', major:'software-development', glh:60,  credits:10, assess:'internal',
    ar:'تطوير تطبيقات الهاتف المحمول', en:'Mobile App Development',
    descAr:'دورة تطوير تطبيق محمول كاملة: التصميم، البرمجة، والاختبار.',
    descEn:'The full mobile app development cycle: design, coding, and testing.',
    file:'pdfs/unit12-mobile-app-development.pdf' },

  { n:13, code:'Unit 12', major:'it-support',          glh:60,  credits:10, assess:'internal',
    ar:'الدعم الفني وإدارة تكنولوجيا المعلومات', en:'IT Technical Support & Management',
    descAr:'استكشاف الأعطال، الصيانة، وإدارة موارد تكنولوجيا المعلومات في المؤسسات.',
    descEn:'Troubleshooting, maintenance, and managing IT resources within organisations.',
    file:'pdfs/unit13-it-technical-support.pdf' },

  { n:14, code:'Unit 8', major:'game-development',     glh:60,  credits:10, assess:'internal',
    ar:'تطوير ألعاب الحاسوب', en:'Computer Game Development',
    descAr:'تحويل تصميم اللعبة إلى نموذج قابل للعب باستخدام أدوات التطوير.',
    descEn:'Turning a game design into a playable build using development tools.',
    file:null },

  { n:15, code:'Unit 11', major:'cybersecurity',       glh:120, credits:20, assess:'internal',
    ar:'الأمن السيبراني وإدارة الحوادث', en:'Cybersecurity & Incident Management',
    descAr:'تهديدات الأمن السيبراني، خطط الحماية، وإجراءات جمع الأدلة عند وقوع حادث أمني.',
    descEn:'Cybersecurity threats, protection plans, and forensic procedures after an incident.',
    file:'pdfs/unit15-cybersecurity-incident-management.pdf' },

  { n:16, code:'Unit 4', major:'software-development', glh:90,  credits:15, assess:'internal',
    ar:'كتاب البرمجة', en:'Programming (Textbook)',
    descAr:'المرجع الأساسي لمادة البرمجة بمفاهيمها وتطبيقاتها العملية.',
    descEn:'The core programming reference with concepts and practical applications.',
    file:'pdfs/unit04-programming.pdf' },

  { n:17, code:null,     major:'it-business',          glh:90,  credits:15, assess:'internal',
    ar:'إدارة مشاريع تكنولوجيا المعلومات', en:'IT Project Management',
    descAr:'تخطيط، تنفيذ، ومتابعة مشاريع تكنولوجيا المعلومات من الفكرة حتى التسليم.',
    descEn:'Planning, executing and tracking IT projects from concept to delivery.',
    file:null },
];

/* ---------- education choices used by the sign-up form ---------- */
ZAD.CHOICES = {
  roles: [
    { v:'student',      icon:'user',    ar:'طالب/ة',       en:'Student',
      subAr:'أدرس المنهج حاليًا',       subEn:'Currently studying' },
    { v:'teacher',      icon:'teacher', ar:'معلّم/ة',      en:'Teacher',
      subAr:'أدرّس المادة',             subEn:'I teach the subject' },
    { v:'parent',       icon:'users',   ar:'ولي أمر',      en:'Parent',
      subAr:'أتابع مستوى ابني/ابنتي',   subEn:'Following my child' },
    { v:'self_learner', icon:'spark',   ar:'متعلّم ذاتي',  en:'Self-learner',
      subAr:'أتعلّم بمفردي',            subEn:'Learning on my own' },
  ],
  levels: [
    { v:'btec_l3',    ar:'BTEC المستوى الثالث', en:'BTEC Level 3' },
    { v:'btec_l2',    ar:'BTEC المستوى الثاني', en:'BTEC Level 2' },
    { v:'btec_l4',    ar:'BTEC المستوى الرابع', en:'BTEC Level 4' },
    { v:'school',     ar:'مدرسة ثانوية',        en:'High school' },
    { v:'diploma',    ar:'دبلوم',               en:'Diploma' },
    { v:'university', ar:'جامعة',               en:'University' },
    { v:'other',      ar:'أخرى',                en:'Other' },
  ],
  years: [
    { v:'year_1',   ar:'السنة الأولى', en:'Year 1' },
    { v:'year_2',   ar:'السنة الثانية', en:'Year 2' },
    { v:'year_3',   ar:'السنة الثالثة', en:'Year 3' },
    { v:'graduate', ar:'خرّيج/ة',       en:'Graduate' },
  ],
  interests: [
    { v:'programming',   ar:'برمجة',            en:'Programming' },
    { v:'web',           ar:'تطوير ويب',        en:'Web development' },
    { v:'mobile',        ar:'تطبيقات موبايل',   en:'Mobile apps' },
    { v:'networking',    ar:'شبكات',            en:'Networking' },
    { v:'cybersecurity', ar:'أمن سيبراني',      en:'Cybersecurity' },
    { v:'data',          ar:'بيانات',           en:'Data' },
    { v:'ai',            ar:'ذكاء اصطناعي',     en:'AI' },
    { v:'games',         ar:'ألعاب',            en:'Games' },
    { v:'design',        ar:'تصميم',            en:'Design' },
    { v:'support',       ar:'دعم فني',          en:'IT support' },
    { v:'project_mgmt',  ar:'إدارة مشاريع',     en:'Project management' },
    { v:'robotics',      ar:'روبوتيات',         en:'Robotics' },
  ],
  countries: [
    { v:'JO', ar:'الأردن',           en:'Jordan' },
    { v:'PS', ar:'فلسطين',           en:'Palestine' },
    { v:'SA', ar:'السعودية',         en:'Saudi Arabia' },
    { v:'AE', ar:'الإمارات',         en:'UAE' },
    { v:'EG', ar:'مصر',              en:'Egypt' },
    { v:'OM', ar:'عُمان',            en:'Oman' },
    { v:'QA', ar:'قطر',              en:'Qatar' },
    { v:'KW', ar:'الكويت',           en:'Kuwait' },
    { v:'BH', ar:'البحرين',          en:'Bahrain' },
    { v:'IQ', ar:'العراق',           en:'Iraq' },
    { v:'LB', ar:'لبنان',            en:'Lebanon' },
    { v:'SY', ar:'سوريا',            en:'Syria' },
    { v:'MA', ar:'المغرب',           en:'Morocco' },
    { v:'DZ', ar:'الجزائر',          en:'Algeria' },
    { v:'TN', ar:'تونس',             en:'Tunisia' },
    { v:'LY', ar:'ليبيا',            en:'Libya' },
    { v:'SD', ar:'السودان',          en:'Sudan' },
    { v:'YE', ar:'اليمن',            en:'Yemen' },
    { v:'TR', ar:'تركيا',            en:'Türkiye' },
    { v:'UK', ar:'المملكة المتحدة',  en:'United Kingdom' },
    { v:'OTHER', ar:'دولة أخرى',     en:'Other country' },
  ],
};

/* ---------- helpers ---------- */
ZAD.majorBySlug = function (slug) {
  return ZAD.MAJORS.find(m => m.slug === slug) || null;
};
ZAD.unitsByMajor = function (slug) {
  return ZAD.UNITS.filter(u => u.major === slug);
};
