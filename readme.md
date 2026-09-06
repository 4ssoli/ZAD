# زاد · ZAD — IT BTEC Learning Platform

A bilingual (Arabic RTL / English LTR) learning platform for the Pearson BTEC
International Level 3 Information Technology major.

Built by **Rayan Assoli** — [Instagram @4ssoli](https://www.instagram.com/4ssoli/) ·
[Facebook @4ssoli](https://web.facebook.com/4ssoli?locale=ar_AR)

---

## What's here

```
zad-site/
├── index.html            Home — hero, about, pathways, study tools, units, social
├── quiz.html             The question game — 6 modes in one page
├── glossary.html         Bilingual IT term dictionary
├── signin.html           Sign in + 3-step sign up with education choices
├── dashboard.html        Private area — deadlines, mastery, study plan, profile
├── manifest.json         Makes the site installable as an app
├── sw.js                 Service worker — offline support + PDF caching
├── assets/
│   ├── icon.svg          App icon (and icon-maskable.svg for Android)
│   ├── css/zad.css       The whole design system (one file, both themes)
│   └── js/
│       ├── config.js     ← Supabase keys, social links, "what is new" entries
│       ├── supabase.js   Creates the Supabase client
│       ├── i18n.js       Arabic/English dictionary + language engine
│       ├── data.js       Pathways, units, and the sign-up choice lists
│       ├── resources.js  ← Curated external links, one list per pathway
│       ├── quiz-data.js  ← Question banks + the placement quiz
│       ├── criteria.js   ← Indicative P/M/D criteria per unit
│       ├── glossary.js   ← The bilingual term list
│       ├── ui.js         Background, nav, animations, toasts, footer
│       ├── auth.js       Sign up / in / out, profile, saved units, progress
│       ├── userdata.js   Notes, deadlines, criteria, attempts, classes
│       ├── shell.js      Modal, theme, command palette, shortcuts, offline
│       ├── sheets.js     The unit workspace and pathway sheets
│       ├── app-home.js       home page controller
│       ├── app-quiz.js       quiz engine + all six modes
│       ├── app-glossary.js   glossary controller
│       ├── app-signin.js     auth page controller
│       └── app-dashboard.js  dashboard controller
├── sql/schema.sql        Run this once in Supabase (part two adds the study tools)
└── pdfs/                 Your unit PDFs (unchanged)
```

**No build step, no `npm install`.** Supabase is loaded from a CDN.

---

## Setup — 3 steps

### 1. Create the database

1. Open your Supabase dashboard → **SQL Editor** → **New query**
2. Paste the whole of [`sql/schema.sql`](sql/schema.sql) and press **Run**

Part one creates 6 tables (`profiles`, `majors`, `units`, `saved_units`,
`unit_progress`, `contact_messages`), turns on Row Level Security for all of
them, adds a trigger that creates a profile row on sign-up, and seeds the 9
pathways and 17 units.

Part two adds the study tools: `unit_notes`, `unit_deadlines`,
`criteria_progress`, `quiz_attempts`, `classes` and `class_members`, plus the
`leaderboard` and `class_overview` views and three leaderboard columns on
`profiles`.

Re-running the whole file is safe — everything is idempotent.

**If you skip part two the site still works.** Notes, deadlines, criteria ticks
and quiz scores simply stay in the visitor's browser instead of syncing across
devices, and the console prints one warning telling you which table is missing.

### 2. Check the auth settings

In Supabase → **Authentication** → **Sign In / Providers**:

- **Email** provider must be enabled.
- **Confirm email**: if this is ON, new users must click a link in their inbox
  before they can sign in. While you're testing, turning it OFF makes sign-up
  instant. Turn it back on before sharing the site publicly.

In **Authentication → URL Configuration**, add your site URL (and your local
address, e.g. `http://localhost:8123`) to **Redirect URLs**, so the confirmation
and password-reset links come back to your site.

### 3. Open the site

The site needs to be served over `http://`, not opened as a `file://` path —
browsers block parts of the auth flow on `file://`.

Any of these work:

```bash
npx serve zad-site
```

```bash
python -m http.server 8123 --directory zad-site
```

Or, with no installs at all, the small PowerShell server used during
development:

```bash
powershell -NoProfile -ExecutionPolicy Bypass -Command "$l=New-Object System.Net.HttpListener;$l.Prefixes.Add('http://localhost:8123/');$l.Start();Write-Host 'http://localhost:8123/';while($l.IsListening){$c=$l.GetContext();$p=Join-Path 'zad-site' ([Uri]::UnescapeDataString($c.Request.Url.AbsolutePath).TrimStart('/'));if(!$p -or (Test-Path $p -PathType Container)){$p=Join-Path $p 'index.html'};if(Test-Path $p -PathType Leaf){$b=[IO.File]::ReadAllBytes($p);$c.Response.OutputStream.Write($b,0,$b.Length)}else{$c.Response.StatusCode=404};$c.Response.OutputStream.Close()}"
```

Then visit <http://localhost:8123/>.

---

## Deploying

Any static host works — there is no server code.

- **Netlify / Vercel**: drag the `zad-site` folder onto their dashboard.
- **GitHub Pages**: push `zad-site` and enable Pages on the branch.
- **Cloudflare Pages**: connect the repo, leave the build command empty, set the
  output directory to `zad-site`.

After deploying, add the live URL to Supabase → **Authentication → URL
Configuration → Redirect URLs**.

---

## Editing content

| I want to change… | Edit |
|---|---|
| Supabase keys, social links, owner name | `assets/js/config.js` |
| The "what is new" list | `assets/js/config.js` (`ZAD.CHANGELOG`, newest first) |
| Any Arabic/English wording | `assets/js/i18n.js` |
| Units, pathways, sign-up choice lists | `assets/js/data.js` **and** `sql/schema.sql` |
| Links shown for a pathway | `assets/js/resources.js` |
| Quiz questions / the placement quiz | `assets/js/quiz-data.js` |
| Assignment criteria for a unit | `assets/js/criteria.js` |
| Glossary terms | `assets/js/glossary.js` |
| Colours, spacing, animations, light theme | `assets/css/zad.css` (the `:root` tokens at the top) |

### Adding a quiz question

Open `assets/js/quiz-data.js`, find the pathway, and add one object:

```js
{ qAr:'…', qEn:'…',
  aAr:['الإجابة الصحيحة','…','…','…'],
  aEn:['The correct answer','…','…','…'],
  correct:0, unit:4, level:'easy',
  explAr:'لماذا هذه الإجابة صحيحة.', explEn:'Why this answer is right.' },
```

Write the correct answer **first** and leave `correct:0` — it is much easier to
proofread that way. The engine deals the options in a fresh random order every
time, so students never see a pattern. Nothing else needs changing: the counters
on the home page and the quiz hub read the bank directly.

### The link preview (WhatsApp / Facebook / X)

When someone shares your link, crawlers read the `og:` tags in the `<head>` and
show `assets/og-cover.jpg` — a 1200×630 card with the ZAD mark, the headline and
the current counts.

**Set your address once.** Every page ships with a placeholder. Replace
`https://your-site.netlify.app` with your real address in all five HTML files:

```bash
cd "D:/Rayan zanwat/ZAD/zad-website/zad-site" && sed -i 's|https://your-site.netlify.app|https://YOUR-REAL-ADDRESS|g' index.html quiz.html glossary.html signin.html dashboard.html
```

Crawlers do not run JavaScript, so these have to be absolute URLs written into
the HTML — a relative path is not reliable.

**To redraw the card** (after changing the numbers, colours or wording), edit
`../tools/make-og-card.ps1` and run:

```bash
powershell -ExecutionPolicy Bypass -File "../tools/make-og-card.ps1" "assets/og-cover.jpg"
```

Keep it under ~300 KB and exactly 1200×630. If you have a real logo file, draw
it in the script with `$g.DrawImage(...)` in place of the rounded "Z" square.

**After redeploying, previews are cached.** Facebook and WhatsApp keep an old
copy for days. Force a refresh at
[developers.facebook.com/tools/debug](https://developers.facebook.com/tools/debug/)
(paste the URL → *Scrape Again*). For a quick test elsewhere, sharing
`your-site.netlify.app/?v=2` bypasses the cache.

### How the pages stay light

Each page loads only the data it renders. The home page does not download the
question bank; the glossary does not download the criteria. Anything else is
fetched the first time it is needed:

```js
await ZAD.ensure(['criteria']);            // when a unit sheet opens
await ZAD.ensure(['glossary','resources']); // when the search palette opens
```

`ZAD.ensure()` lives in `ui.js`, caches its promises, and resolves immediately
if the file is already on the page. Every `<script>` tag is `defer`, so none of
them block the first paint.

Because of this, headline numbers like "135 questions" come from
`assets/js/stats.js` rather than counting the arrays. **If you add questions,
terms or links, update the count in `stats.js` too** — on the page that owns
the data, the real count wins automatically, so the two can only drift on
*other* pages.

### Adding a resource link

Open `assets/js/resources.js` and add an entry to the pathway array. Give three
of them `step:1`, `step:2`, `step:3` — those become the "start here" path
(learn → practise → build). Tags come from `ZAD.RES_TAGS` at the top of the file.

`data.js` is the offline fallback and `schema.sql` seeds the database. The site
prefers the database when it's reachable and falls back to `data.js` when it
isn't — so if you change a unit, change it in both, or just change it in the
database and let the site pull it live.

### Adding a PDF

1. Drop the file in `pdfs/`.
2. Set its `file:` path in `assets/js/data.js`.
3. Set the same path in the `pdf_path` column in Supabase (Table Editor → `units`).

The card flips from "قريبًا / Coming soon" to "متوفر / Available" automatically.

---

## About the key in `config.js`

`SUPABASE_KEY` is a **publishable** key. It is meant to be visible in browser
code — it is not a secret. What actually protects your data is Row Level
Security, which `schema.sql` enables on every table:

- A signed-in user can read and write **only their own** profile, saved units,
  progress, notes, deadlines, criteria ticks and quiz attempts.
- `majors` and `units` are readable by everyone, writable by no one.
- `contact_messages` can be written by anyone but read by no one from the browser.
- The `leaderboard` view is the one place data crosses between users. It runs
  with the owner's rights on purpose, and its `where` clause only ever returns
  students who ticked "show me on the leaderboard" — exposing a display name and
  a percentage, never an email, a real name or an attempt history.
- `class_overview` works the same way, gated by `is_class_owner()`, so a teacher
  only ever sees the classes they created.
- Students join a class through the `join_class()` function rather than by
  reading the `classes` table, so nobody can list other people's class codes.

Never put a `service_role` key in these files — that one bypasses all of the above.

---

## Features

- **The question game** — 135 questions across the 9 pathways, every one with an
  explanation shown after you answer. Six modes: Quick 10 (timed), Exam (25
  questions, reviewed at the end), Daily challenge (5 questions, identical for
  every student that day), Unit challenge, Flashcards (Leitner spaced
  repetition), and a 12-question **placement quiz** that recommends a pathway.
- **Curated resources** — 77 hand-picked external links, grouped by pathway,
  each tagged (free, Arabic, tool, video, certificate…) with a three-step
  "start here" path: learn, practise, build.
- **Unit workspace** — open any unit to get its PDF inline (it remembers your
  page), your private notes, a deadline, a progress slider, and a checklist of
  the assignment criteria.
- **Assignment criteria tracker** — indicative Pass / Merit / Distinction
  checklists for all 17 units, with a progress bar. These are a revision aid
  written for this site, **not** official Pearson wording — the app says so on
  screen too.
- **Bilingual glossary** — 143 IT terms, each with its Arabic and English name
  and a one-line definition in both languages, searchable in either language.
- **Study plan** — enter your exam date and it spreads the units you have not
  finished across the weeks you have left.
- **Dashboard** — deadlines sorted by urgency, quiz mastery rings with badges
  and a day streak, a shareable progress image, saved units and progress.
- **Classes** — a teacher creates a class, shares a 6-character code, and sees
  their students' average progress and quiz scores. Students join with the code.
- **Leaderboard** — opt-in only, and it shows nothing but a display name and a
  percentage.
- **Command palette** — `Ctrl+K` (or `/`) searches every unit, pathway, term,
  quiz and resource link at once. Press `?` for the full shortcut list.
- **Works offline** — installable as an app, with the pages and PDFs cached.
- **Light and dark themes** — toggle in the header, or press `T`.
- **Bilingual** — full Arabic RTL / English LTR, remembered between visits,
  including correct Arabic plural forms.
- **9 specialisation pathways** — units grouped by Software Development, Web
  Development, Networking, Cybersecurity, Data & AI, Game Development, IT
  Support, Digital Media and IT Business.
- **Unit metadata** — BTEC unit reference, GLH, credits and assessment type.
- **Search and filters** — by text, by availability, by pathway, by saved.
- **Accounts** — 3-step sign-up capturing role, education level, study year,
  pathway, interests, school and country.
- **Dashboard** — saved units, progress sliders, pathway recommendations, and an
  editable profile.
- **Animations** — constellation background that reacts to the cursor, aurora
  gradients, scroll reveals, animated counters — all disabled automatically for
  visitors who prefer reduced motion.
- **Works offline** — if Supabase is unreachable, the site still renders every
  unit from bundled data, read-only.
