/* ============================================================
   ZAD — headline counts
   The home page and the quiz hub show "135 questions", "143 terms"
   and so on. Those numbers used to come from counting the real
   arrays, which meant every page had to download the whole question
   bank and glossary just to print a number.

   Keeping the counts here lets the big data files load only on the
   page that actually needs them. If you add questions or terms,
   update the number here too — or run this in the console on the
   quiz page to get the real figures:

     ZAD.QUESTION_COUNT, ZAD.GLOSSARY_COUNT, ZAD.RESOURCE_COUNT
   ============================================================ */
window.ZAD = window.ZAD || {};

ZAD.STATS = {
  questions: 135,   // quiz-data.js
  glossary : 143,   // glossary.js
  resources: 77,    // resources.js
  units    : 17,    // data.js
  pathways : 9,     // data.js
};

/* If the real file is loaded, prefer its live count over the constant,
   so the two can never drift apart on the page that owns the data. */
ZAD.statOf = function (key) {
  if (key === 'questions' && typeof ZAD.QUESTION_COUNT === 'number') return ZAD.QUESTION_COUNT;
  if (key === 'glossary'  && typeof ZAD.GLOSSARY_COUNT === 'number') return ZAD.GLOSSARY_COUNT;
  if (key === 'resources' && typeof ZAD.RESOURCE_COUNT === 'number') return ZAD.RESOURCE_COUNT;
  return ZAD.STATS[key] ?? 0;
};
