/* ============================================================
   ZAD — assignment criteria checklists, one list per unit
   Keyed by the site unit number (ZAD.UNITS[].n).

   IMPORTANT — read this before using the checklist for marking:
   These are INDICATIVE criteria written for this site as a study
   aid. They follow the usual BTEC Pass / Merit / Distinction
   shape, but they are NOT the official Pearson wording and carry
   no awarding-body status. Always check the real assignment
   brief your teacher gives you. Treat this as a revision
   checklist, never as the specification.

   Edit any line freely — the tracker reads whatever is here.
   ============================================================ */
window.ZAD = window.ZAD || {};

ZAD.CRITERIA_DISCLAIMER = {
  ar:'هذه معايير استرشادية أعدّت للمراجعة فقط، وليست النص الرسمي من Pearson. اعتمد دائمًا على ورقة المهمة التي يسلّمها معلّمك.',
  en:'These are indicative revision criteria, not official Pearson wording. Always rely on the assignment brief your teacher gives you.',
};

ZAD.GRADES = {
  pass       : { ar:'نجاح',  en:'Pass',        color:'var(--ok)' },
  merit      : { ar:'جيد',   en:'Merit',       color:'var(--a-cyan)' },
  distinction: { ar:'امتياز', en:'Distinction', color:'var(--a-amber)' },
};

ZAD.CRITERIA = {

  /* Unit 1 — Using IT to Support Information & Communication */
  1: [
    { code:'P1', grade:'pass', ar:'اشرح أنواع البيانات والمعلومات التي تستخدمها المؤسسات.',
      en:'Explain the types of data and information organisations use.' },
    { code:'P2', grade:'pass', ar:'صف أدوات تكنولوجيا المعلومات المستخدمة في الاتصال داخل المؤسسة.',
      en:'Describe the IT tools used for communication within an organisation.' },
    { code:'P3', grade:'pass', ar:'وضّح كيف تدعم أنظمة المعلومات اتخاذ القرار.',
      en:'Outline how information systems support decision-making.' },
    { code:'M1', grade:'merit', ar:'حلّل أثر جودة المعلومات على قرارات مؤسسة محدّدة.',
      en:'Analyse how information quality affects decisions in a specific organisation.' },
    { code:'M2', grade:'merit', ar:'قارن بين أداتين للاتصال من حيث الملاءمة والتكلفة.',
      en:'Compare two communication tools for suitability and cost.' },
    { code:'D1', grade:'distinction', ar:'قيّم فاعلية أنظمة المعلومات في المؤسسة وقدّم توصيات مبرّرة.',
      en:'Evaluate the effectiveness of the organisation information systems and justify recommendations.' },
  ],

  /* Unit 2 (site) — Data Modelling and Spreadsheets */
  2: [
    { code:'P1', grade:'pass', ar:'أنشئ نموذج بيانات يلبّي متطلبات محدّدة.',
      en:'Create a data model that meets a given set of requirements.' },
    { code:'P2', grade:'pass', ar:'استخدم الصيغ والدوال لمعالجة البيانات.',
      en:'Use formulas and functions to process the data.' },
    { code:'P3', grade:'pass', ar:'أنشئ لوحة معلومات تعرض المؤشرات الأساسية.',
      en:'Build a dashboard that presents the key indicators.' },
    { code:'P4', grade:'pass', ar:'طبّق قواعد التحقق من صحة البيانات المدخلة.',
      en:'Apply validation rules to the data entered.' },
    { code:'M1', grade:'merit', ar:'حلّل النتائج واستخلص استنتاجات مدعومة بالبيانات.',
      en:'Analyse the results and draw conclusions supported by the data.' },
    { code:'M2', grade:'merit', ar:'حسّن النموذج ليتعامل مع سيناريوهات مختلفة.',
      en:'Refine the model so it handles different scenarios.' },
    { code:'D1', grade:'distinction', ar:'قيّم دقة النموذج وموثوقيته واقترح تحسينات مبرّرة.',
      en:'Evaluate the accuracy and reliability of the model and justify improvements.' },
  ],

  /* Unit 3 — Introduction to Computer Networks */
  3: [
    { code:'P1', grade:'pass', ar:'صف مكوّنات الشبكة وأنواعها المختلفة.',
      en:'Describe network components and the different network types.' },
    { code:'P2', grade:'pass', ar:'اشرح البروتوكولات الأساسية ووظيفة كل منها.',
      en:'Explain the core protocols and what each one does.' },
    { code:'P3', grade:'pass', ar:'صمّم مخطط شبكة يلبّي احتياجًا محدّدًا.',
      en:'Design a network diagram that meets a stated need.' },
    { code:'M1', grade:'merit', ar:'برّر اختيار الطوبولوجيا والأجهزة في تصميمك.',
      en:'Justify your choice of topology and hardware in the design.' },
    { code:'M2', grade:'merit', ar:'اختبر التصميم في محاكي ووثّق النتائج.',
      en:'Test the design in a simulator and document the results.' },
    { code:'D1', grade:'distinction', ar:'قيّم أداء الشبكة وأمنها واقترح تحسينات مبرّرة.',
      en:'Evaluate the performance and security of the network and justify improvements.' },
  ],

  /* Unit 4 — Introduction to Programming */
  4: [
    { code:'P1', grade:'pass', ar:'حلّل المشكلة وحدّد المتطلبات الوظيفية للحل.',
      en:'Analyse the problem and identify the functional requirements.' },
    { code:'P2', grade:'pass', ar:'صمّم الخوارزمية بالكود الوهمي أو مخطط التدفق.',
      en:'Design the algorithm using pseudocode or a flowchart.' },
    { code:'P3', grade:'pass', ar:'اكتب برنامجًا يعمل ويحقّق المتطلبات.',
      en:'Write a working program that meets the requirements.' },
    { code:'P4', grade:'pass', ar:'اختبر البرنامج بجدول حالات اختبار موثّق.',
      en:'Test the program with a documented test-case table.' },
    { code:'M1', grade:'merit', ar:'حسّن جودة الكود: تسمية واضحة، دوال، ومعالجة أخطاء.',
      en:'Improve code quality: clear naming, functions and error handling.' },
    { code:'M2', grade:'merit', ar:'حلّل نتائج الاختبار وأصلح الأخطاء موثّقًا ما غيّرته.',
      en:'Analyse the test results and fix the faults, documenting each change.' },
    { code:'D1', grade:'distinction', ar:'قيّم الحل مقابل المتطلبات واقترح تطويرات مستقبلية مبرّرة.',
      en:'Evaluate the solution against the requirements and justify future development.' },
  ],

  /* Unit 5 — Digital Graphics & Animation */
  5: [
    { code:'P1', grade:'pass', ar:'اشرح الفرق بين الرسوم النقطية والمتجهية وصيغ الملفات.',
      en:'Explain raster versus vector graphics and the file formats.' },
    { code:'P2', grade:'pass', ar:'خطّط عملك بلوحة إلهام وقصة مصوّرة.',
      en:'Plan your work with a mood board and a storyboard.' },
    { code:'P3', grade:'pass', ar:'أنتج رسومًا ثابتة ومتحركة تلبّي المتطلبات.',
      en:'Produce static and animated graphics that meet the brief.' },
    { code:'M1', grade:'merit', ar:'طبّق مبادئ التصميم من ألوان وخطوط وتباين بشكل مدروس.',
      en:'Apply design principles of colour, type and contrast deliberately.' },
    { code:'M2', grade:'merit', ar:'وثّق مصادر الأصول وتراخيصها.',
      en:'Document your asset sources and their licences.' },
    { code:'D1', grade:'distinction', ar:'قيّم عملك النهائي مقابل احتياج الجمهور وبرّر قراراتك.',
      en:'Evaluate the final work against audience need and justify your decisions.' },
  ],

  /* Unit 6 — Introduction to Website Development */
  6: [
    { code:'P1', grade:'pass', ar:'اشرح مكوّنات صفحة الويب ودور HTML وCSS.',
      en:'Explain the parts of a web page and the roles of HTML and CSS.' },
    { code:'P2', grade:'pass', ar:'أنشئ صفحات مهيكلة بوسوم دلالية صحيحة.',
      en:'Build pages structured with correct semantic tags.' },
    { code:'P3', grade:'pass', ar:'نسّق الصفحات بورقة أنماط خارجية.',
      en:'Style the pages using an external stylesheet.' },
    { code:'M1', grade:'merit', ar:'طبّق تخطيطًا متجاوبًا يعمل على الجوال والحاسوب.',
      en:'Apply a responsive layout that works on phone and desktop.' },
    { code:'D1', grade:'distinction', ar:'قيّم الموقع من حيث سهولة الاستخدام وإتاحة الوصول.',
      en:'Evaluate the site for usability and accessibility.' },
  ],

  /* Unit 7 — Introduction to Applications */
  7: [
    { code:'P1', grade:'pass', ar:'حدّد احتياجات المستخدمين المستهدفين للتطبيق.',
      en:'Identify the needs of the target users for the application.' },
    { code:'P2', grade:'pass', ar:'صمّم واجهات التطبيق وتدفّق الشاشات.',
      en:'Design the application interfaces and screen flow.' },
    { code:'P3', grade:'pass', ar:'ابنِ نموذجًا عاملًا للتطبيق.',
      en:'Build a working prototype of the application.' },
    { code:'M1', grade:'merit', ar:'اختبر التطبيق مع مستخدمين حقيقيين وسجّل ملاحظاتهم.',
      en:'Test the app with real users and record their feedback.' },
    { code:'D1', grade:'distinction', ar:'قيّم التطبيق مقابل احتياجات المستخدم وبرّر التحسينات.',
      en:'Evaluate the app against user needs and justify improvements.' },
  ],

  /* Unit 8 — Introduction to Game Design */
  8: [
    { code:'P1', grade:'pass', ar:'صف أنواع الألعاب وتوقعات جمهورها.',
      en:'Describe game genres and the expectations of their audiences.' },
    { code:'P2', grade:'pass', ar:'اكتب مستند تصميم لعبة يشمل الآليات والمستويات.',
      en:'Write a game design document covering mechanics and levels.' },
    { code:'P3', grade:'pass', ar:'صمّم شخصيات ومستويات تناسب الجمهور المستهدف.',
      en:'Design characters and levels appropriate to the target audience.' },
    { code:'M1', grade:'merit', ar:'برّر قرارات التصميم بالرجوع إلى تجربة اللاعب.',
      en:'Justify your design decisions by reference to player experience.' },
    { code:'D1', grade:'distinction', ar:'قيّم التصميم بعد اختبار اللعب واقترح تعديلات مبرّرة.',
      en:'Evaluate the design after playtesting and justify changes.' },
  ],

  /* Unit 9 — Strategic IT Systems (textbook) */
  9: [
    { code:'P1', grade:'pass', ar:'صف أنظمة تكنولوجيا المعلومات المستخدمة في المؤسسات.',
      en:'Describe the IT systems organisations use.' },
    { code:'P2', grade:'pass', ar:'اشرح كيف تدعم هذه الأنظمة الأهداف الإستراتيجية.',
      en:'Explain how those systems support strategic goals.' },
    { code:'M1', grade:'merit', ar:'حلّل العلاقة بين النظام والميزة التنافسية للمؤسسة.',
      en:'Analyse the link between the system and competitive advantage.' },
    { code:'D1', grade:'distinction', ar:'قيّم مدى ملاءمة الأنظمة الحالية واقترح بديلًا مبرّرًا.',
      en:'Evaluate the fit of the current systems and justify an alternative.' },
  ],

  /* Unit 10 — Strategic IT Systems (workbook) */
  10: [
    { code:'P1', grade:'pass', ar:'أكمل الأنشطة التطبيقية المرافقة لكل فصل.',
      en:'Complete the practical activities that accompany each chapter.' },
    { code:'P2', grade:'pass', ar:'طبّق المفاهيم على دراسة حالة مؤسسة حقيقية.',
      en:'Apply the concepts to a real organisation case study.' },
    { code:'M1', grade:'merit', ar:'اربط نتائج الأنشطة بالمفاهيم النظرية في الكتاب.',
      en:'Link the activity outcomes back to the theory in the textbook.' },
    { code:'D1', grade:'distinction', ar:'قدّم تحليلًا نقديًا لدراسة الحالة مع توصيات.',
      en:'Present a critical analysis of the case study with recommendations.' },
  ],

  /* Unit 11 — Website Development */
  11: [
    { code:'P1', grade:'pass', ar:'خطّط الموقع بمخطط هيكلي وخريطة صفحات.',
      en:'Plan the site with wireframes and a site map.' },
    { code:'P2', grade:'pass', ar:'ابنِ موقعًا متعدّد الصفحات بتنقّل واضح.',
      en:'Build a multi-page site with clear navigation.' },
    { code:'P3', grade:'pass', ar:'طبّق تنسيقًا متجاوبًا يعمل على أحجام شاشات مختلفة.',
      en:'Apply responsive styling that works across screen sizes.' },
    { code:'P4', grade:'pass', ar:'اختبر الموقع ووثّق النتائج في جدول اختبار.',
      en:'Test the site and record the outcomes in a test table.' },
    { code:'M1', grade:'merit', ar:'حسّن الأداء وإتاحة الوصول بناءً على نتائج القياس.',
      en:'Improve performance and accessibility based on measured results.' },
    { code:'M2', grade:'merit', ar:'اختبر الموقع على أكثر من متصفح ووثّق الفروق.',
      en:'Test on more than one browser and document the differences.' },
    { code:'D1', grade:'distinction', ar:'قيّم الموقع مقابل متطلبات العميل وبرّر التطويرات المقترحة.',
      en:'Evaluate the site against the client requirements and justify further development.' },
  ],

  /* Unit 12 — Mobile App Development */
  12: [
    { code:'P1', grade:'pass', ar:'حلّل متطلبات التطبيق وحدّد جمهوره.',
      en:'Analyse the app requirements and define its audience.' },
    { code:'P2', grade:'pass', ar:'صمّم الواجهات ومسار تنقّل المستخدم.',
      en:'Design the interfaces and the user journey.' },
    { code:'P3', grade:'pass', ar:'برمج التطبيق ليؤدّي وظائفه الأساسية.',
      en:'Code the app so it performs its core functions.' },
    { code:'P4', grade:'pass', ar:'اختبر التطبيق على جهاز أو محاكٍ ووثّق النتائج.',
      en:'Test on a device or emulator and document the results.' },
    { code:'M1', grade:'merit', ar:'حسّن تجربة المستخدم بناءً على تغذية راجعة حقيقية.',
      en:'Improve the user experience based on real feedback.' },
    { code:'D1', grade:'distinction', ar:'قيّم التطبيق مقابل المتطلبات وبرّر خطة التطوير القادمة.',
      en:'Evaluate the app against requirements and justify a development plan.' },
  ],

  /* Unit 13 — IT Technical Support & Management */
  13: [
    { code:'P1', grade:'pass', ar:'صف أدوار الدعم الفني وإجراءاته في المؤسسة.',
      en:'Describe technical support roles and procedures in an organisation.' },
    { code:'P2', grade:'pass', ar:'طبّق منهجية استكشاف الأعطال على أعطال حقيقية.',
      en:'Apply a troubleshooting methodology to real faults.' },
    { code:'P3', grade:'pass', ar:'وثّق الأعطال وحلولها في سجل أو نظام تذاكر.',
      en:'Document faults and fixes in a log or ticketing system.' },
    { code:'M1', grade:'merit', ar:'حلّل أسباب الأعطال المتكرّرة واقترح إجراءات وقائية.',
      en:'Analyse recurring faults and propose preventative measures.' },
    { code:'D1', grade:'distinction', ar:'قيّم فاعلية إجراءات الدعم وقدّم توصيات مبرّرة للتحسين.',
      en:'Evaluate the effectiveness of the support process and justify recommendations.' },
  ],

  /* Unit 14 — Computer Game Development */
  14: [
    { code:'P1', grade:'pass', ar:'حوّل مستند التصميم إلى خطة تنفيذ تقنية.',
      en:'Turn the design document into a technical implementation plan.' },
    { code:'P2', grade:'pass', ar:'ابنِ نموذجًا قابلًا للعب يتضمّن الآليات الأساسية.',
      en:'Build a playable prototype containing the core mechanics.' },
    { code:'P3', grade:'pass', ar:'أضف الأصول والأصوات ووثّق تراخيصها.',
      en:'Add assets and audio, documenting their licences.' },
    { code:'M1', grade:'merit', ar:'اختبر اللعبة مع لاعبين وسجّل الملاحظات والتعديلات.',
      en:'Playtest with real players and record feedback and changes.' },
    { code:'M2', grade:'merit', ar:'وازن الصعوبة وأصلح الأخطاء الظاهرة في الاختبار.',
      en:'Balance difficulty and fix the faults the testing exposed.' },
    { code:'D1', grade:'distinction', ar:'قيّم النسخة النهائية مقابل التصميم الأصلي وبرّر ما تغيّر.',
      en:'Evaluate the final build against the original design and justify what changed.' },
  ],

  /* Unit 15 — Cybersecurity & Incident Management */
  15: [
    { code:'P1', grade:'pass', ar:'صف التهديدات السيبرانية الشائعة وأثرها على المؤسسات.',
      en:'Describe common cyber threats and their impact on organisations.' },
    { code:'P2', grade:'pass', ar:'نفّذ تقييم مخاطر يحدّد الاحتمال والأثر.',
      en:'Carry out a risk assessment identifying likelihood and impact.' },
    { code:'P3', grade:'pass', ar:'صمّم خطة حماية تتضمّن ضوابط تقنية وإجرائية.',
      en:'Design a protection plan with technical and procedural controls.' },
    { code:'P4', grade:'pass', ar:'اشرح إجراءات الاستجابة للحوادث وجمع الأدلة.',
      en:'Explain incident response procedures and evidence gathering.' },
    { code:'M1', grade:'merit', ar:'حلّل ملاءمة الضوابط المختارة للمخاطر المحدّدة.',
      en:'Analyse how well the chosen controls match the identified risks.' },
    { code:'M2', grade:'merit', ar:'طبّق سلسلة حفظ صحيحة في سيناريو أدلة رقمية.',
      en:'Apply a correct chain of custody in a digital evidence scenario.' },
    { code:'D1', grade:'distinction', ar:'قيّم خطة الحماية والاستجابة واقترح تحسينات مبرّرة.',
      en:'Evaluate the protection and response plan and justify improvements.' },
  ],

  /* Unit 16 — Programming (textbook) */
  16: [
    { code:'P1', grade:'pass', ar:'اشرح مفاهيم البرمجة الأساسية بأمثلة من الكتاب.',
      en:'Explain the core programming concepts using textbook examples.' },
    { code:'P2', grade:'pass', ar:'طبّق التمارين العملية المرافقة لكل فصل.',
      en:'Work through the practical exercises for each chapter.' },
    { code:'M1', grade:'merit', ar:'اربط المفاهيم النظرية بمشروعك البرمجي العملي.',
      en:'Connect the theory to your own practical programming project.' },
    { code:'D1', grade:'distinction', ar:'قيّم أي الأساليب البرمجية أنسب لمشكلة معيّنة ولماذا.',
      en:'Evaluate which programming approach best suits a given problem and why.' },
  ],

  /* Unit 17 — IT Project Management */
  17: [
    { code:'P1', grade:'pass', ar:'حدّد نطاق المشروع وأصحاب المصلحة فيه.',
      en:'Define the project scope and its stakeholders.' },
    { code:'P2', grade:'pass', ar:'أعدّ خطة زمنية بمخطط جانت ومَعالم واضحة.',
      en:'Produce a schedule with a Gantt chart and clear milestones.' },
    { code:'P3', grade:'pass', ar:'أنشئ سجل مخاطر مع خطط الاستجابة.',
      en:'Create a risk register with response plans.' },
    { code:'P4', grade:'pass', ar:'تابع تنفيذ المشروع ووثّق التقدّم والتغييرات.',
      en:'Monitor delivery and document progress and changes.' },
    { code:'M1', grade:'merit', ar:'حلّل انحرافات الجدول أو الميزانية وأسبابها.',
      en:'Analyse schedule or budget variances and their causes.' },
    { code:'M2', grade:'merit', ar:'قارن بين منهجيتين لإدارة المشاريع في سياق مشروعك.',
      en:'Compare two project methodologies in the context of your project.' },
    { code:'D1', grade:'distinction', ar:'قيّم نجاح المشروع واستخلص دروسًا مبرّرة للمشاريع القادمة.',
      en:'Evaluate the project outcome and justify lessons for future projects.' },
  ],
};

/* ---------- helpers ---------- */
ZAD.criteriaFor = function (unitNo) { return ZAD.CRITERIA[unitNo] || []; };
ZAD.criteriaCount = function (unitNo) { return ZAD.criteriaFor(unitNo).length; };
