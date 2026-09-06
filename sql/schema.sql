-- ============================================================================
--  ZAD · زاد  —  Supabase schema
--  Project: https://xxffliivclhrudjljvis.supabase.co
--
--  HOW TO RUN
--  1. Open your Supabase dashboard → SQL Editor → New query
--  2. Paste this whole file and press RUN
--  3. Re-running is safe: everything is idempotent (IF NOT EXISTS / DROP first)
--
--  WHAT IT CREATES
--    profiles        one row per signed-up user (education choices live here)
--    majors          the IT specialisation pathways shown on the site
--    units           the course units / PDFs
--    saved_units     bookmarks  (user ⇄ unit)
--    unit_progress   per-user progress on each unit
--    contact_messages  messages from the contact form
--
--  SECURITY: Row Level Security is ON for every table. The publishable
--  (anon) key in the browser can only ever touch the signed-in user's own
--  rows. Reference data (majors/units) is world-readable but not writable.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 0. Extensions
-- ---------------------------------------------------------------------------
create extension if not exists "pgcrypto";


-- ---------------------------------------------------------------------------
-- 1. Enumerated choices  (these back the multi-choice sign-up form)
-- ---------------------------------------------------------------------------
do $$ begin
  create type public.user_role as enum ('student','teacher','parent','self_learner');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.edu_level as enum
    ('school','btec_l2','btec_l3','btec_l4','diploma','university','other');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.study_year as enum ('year_1','year_2','year_3','graduate');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.progress_state as enum ('not_started','in_progress','completed');
exception when duplicate_object then null; end $$;


-- ---------------------------------------------------------------------------
-- 2. majors  —  IT specialisation pathways (reference data, public read)
-- ---------------------------------------------------------------------------
create table if not exists public.majors (
  slug        text primary key,
  name_ar     text not null,
  name_en     text not null,
  desc_ar     text,
  desc_en     text,
  accent      text default 'var(--p-400)',
  icon        text,
  sort_order  int  default 0,
  created_at  timestamptz not null default now()
);
alter table public.majors enable row level security;


-- ---------------------------------------------------------------------------
-- 3. units  —  course units / PDFs (reference data, public read)
-- ---------------------------------------------------------------------------
create table if not exists public.units (
  id          bigint generated always as identity primary key,
  unit_no     int  not null unique,          -- numbering used on the site
  btec_code   text,                          -- official Pearson unit reference
  title_ar    text not null,
  title_en    text not null,
  desc_ar     text,
  desc_en     text,
  major_slug  text references public.majors(slug) on delete set null,
  glh         int,                           -- guided learning hours
  credits     int,
  assessment  text,                          -- 'internal' | 'pearson_set'
  pdf_path    text,                          -- null = coming soon
  sort_order  int  default 0,
  created_at  timestamptz not null default now()
);

alter table public.units enable row level security;

create index if not exists units_major_idx on public.units (major_slug);


-- ---------------------------------------------------------------------------
-- 4. profiles  —  one row per auth user
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  email           text,
  full_name       text,
  username        text unique,
  avatar_url      text,
  bio             text,

  -- education choices captured at sign-up ---------------------------------
  role            public.user_role  not null default 'student',
  edu_level       public.edu_level,
  study_year      public.study_year,
  major_slug      text references public.majors(slug) on delete set null,
  interests       text[] not null default '{}',
  school          text,
  country         text,
  preferred_lang  text not null default 'ar' check (preferred_lang in ('ar','en')),

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  constraint username_format check (
    username is null or username ~ '^[a-zA-Z0-9_.]{3,24}$'
  )
);

alter table public.profiles enable row level security;

create index if not exists profiles_major_idx on public.profiles (major_slug);


-- ---------------------------------------------------------------------------
-- 5. saved_units  —  bookmarks
-- ---------------------------------------------------------------------------
create table if not exists public.saved_units (
  user_id    uuid   not null references public.profiles(id) on delete cascade,
  unit_id    bigint not null references public.units(id)    on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, unit_id)
);
alter table public.saved_units enable row level security;


-- ---------------------------------------------------------------------------
-- 6. unit_progress  —  per-user progress
-- ---------------------------------------------------------------------------
create table if not exists public.unit_progress (
  user_id    uuid   not null references public.profiles(id) on delete cascade,
  unit_id    bigint not null references public.units(id)    on delete cascade,
  state      public.progress_state not null default 'not_started',
  percent    int not null default 0 check (percent between 0 and 100),
  notes      text,
  updated_at timestamptz not null default now(),
  primary key (user_id, unit_id)
);
alter table public.unit_progress enable row level security;


-- ---------------------------------------------------------------------------
-- 7. contact_messages
-- ---------------------------------------------------------------------------
create table if not exists public.contact_messages (
  id         bigint generated always as identity primary key,
  user_id    uuid references public.profiles(id) on delete set null,
  name       text not null check (char_length(name)  between 2 and 120),
  email      text not null check (char_length(email) between 5 and 200),
  message    text not null check (char_length(message) between 5 and 4000),
  created_at timestamptz not null default now()
);
alter table public.contact_messages enable row level security;


-- ---------------------------------------------------------------------------
-- 8. updated_at helper
-- ---------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch on public.profiles;
create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

drop trigger if exists unit_progress_touch on public.unit_progress;
create trigger unit_progress_touch before update on public.unit_progress
  for each row execute function public.touch_updated_at();


-- ---------------------------------------------------------------------------
-- 9. Auto-create a profile whenever someone signs up.
--    Reads the education choices passed as options.data from supabase.auth.signUp
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
begin
  insert into public.profiles (
    id, email, full_name, username, role, edu_level,
    study_year, major_slug, interests, school, country, preferred_lang
  )
  values (
    new.id,
    new.email,
    nullif(meta->>'full_name',''),
    nullif(meta->>'username',''),
    coalesce(nullif(meta->>'role','')::public.user_role, 'student'),
    nullif(meta->>'edu_level','')::public.edu_level,
    nullif(meta->>'study_year','')::public.study_year,
    nullif(meta->>'major_slug',''),
    coalesce(
      (select array_agg(value::text)
         from jsonb_array_elements_text(
           case jsonb_typeof(meta->'interests')
             when 'array' then meta->'interests'
             else '[]'::jsonb
           end) as value),
      '{}'
    ),
    nullif(meta->>'school',''),
    nullif(meta->>'country',''),
    coalesce(nullif(meta->>'preferred_lang',''), 'ar')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ---------------------------------------------------------------------------
-- 10. Row Level Security policies
--     (RLS itself was switched on beside each CREATE TABLE above, so no table
--      ever exists un-protected, even for the moment this script is running.)
-- ---------------------------------------------------------------------------

-- majors / units: anyone (even signed out) may READ, nobody may write
drop policy if exists majors_read on public.majors;
create policy majors_read on public.majors
  for select to anon, authenticated using (true);

drop policy if exists units_read on public.units;
create policy units_read on public.units
  for select to anon, authenticated using (true);

-- profiles: a user sees & edits only their own row
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
  for select to authenticated using (auth.uid() = id);

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own on public.profiles
  for insert to authenticated with check (auth.uid() = id);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists profiles_delete_own on public.profiles;
create policy profiles_delete_own on public.profiles
  for delete to authenticated using (auth.uid() = id);

-- saved_units: own rows only
drop policy if exists saved_all_own on public.saved_units;
create policy saved_all_own on public.saved_units
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- unit_progress: own rows only
drop policy if exists progress_all_own on public.unit_progress;
create policy progress_all_own on public.unit_progress
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- contact_messages: anyone may send, nobody may read back from the browser
drop policy if exists contact_insert on public.contact_messages;
create policy contact_insert on public.contact_messages
  for insert to anon, authenticated with check (true);


-- ---------------------------------------------------------------------------
-- 11. Seed: majors (IT specialisation pathways)
-- ---------------------------------------------------------------------------
insert into public.majors (slug,name_ar,name_en,desc_ar,desc_en,accent,icon,sort_order) values
 ('software-development','تطوير البرمجيات','Software Development',
  'التفكير الحاسوبي، الخوارزميات، وكتابة برامج منظمة وقابلة للصيانة.',
  'Computational thinking, algorithms, and writing structured, maintainable programs.',
  'var(--a-blue)','code',1),

 ('web-development','تطوير الويب','Web Development',
  'بناء مواقع من التخطيط إلى التنفيذ: HTML وCSS وJavaScript والاستضافة والأداء.',
  'Building websites end to end: HTML, CSS, JavaScript, hosting and performance.',
  'var(--a-cyan)','globe',2),

 ('networking','الشبكات والبنية التحتية','Networking & Infrastructure',
  'تصميم الشبكات، البروتوكولات، الأجهزة، والاتصال الآمن بين الأنظمة.',
  'Network design, protocols, hardware, and secure communication between systems.',
  'var(--a-emerald)','network',3),

 ('cybersecurity','الأمن السيبراني','Cybersecurity',
  'التهديدات، تقييم المخاطر، خطط الحماية، والاستجابة للحوادث الأمنية.',
  'Threats, risk assessment, protection plans, and responding to security incidents.',
  'var(--a-rose)','shield',4),

 ('data-ai','البيانات والذكاء الاصطناعي','Data & AI',
  'نمذجة البيانات، جداول البيانات، لوحات المعلومات، ومقدمة الذكاء الاصطناعي.',
  'Data modelling, spreadsheets, dashboards, and an introduction to AI.',
  'var(--a-fuchsia)','chart',5),

 ('game-development','تطوير الألعاب','Game Development',
  'من فكرة اللعبة وتصميم آلياتها إلى نموذج قابل للعب.',
  'From game concept and mechanics design to a playable build.',
  'var(--a-lime)','gamepad',6),

 ('it-support','الدعم الفني وإدارة IT','IT Support & Management',
  'استكشاف الأعطال، الصيانة، وإدارة موارد تكنولوجيا المعلومات في المؤسسات.',
  'Troubleshooting, maintenance, and managing IT resources in organisations.',
  'var(--a-amber)','wrench',7),

 ('digital-media','الوسائط الرقمية','Digital Media & Graphics',
  'الرسوميات الرقمية، الرسوم المتحركة، والتصميم البصري للمنتجات الرقمية.',
  'Digital graphics, animation, and visual design for digital products.',
  'var(--a-orange)','palette',8),

 ('it-business','أعمال وإدارة مشاريع IT','IT Business & Projects',
  'دور الأنظمة في المؤسسة، إدارة المشاريع، ووسائل التواصل في الأعمال.',
  'The role of systems in an organisation, project management, and social media in business.',
  'var(--p-400)','briefcase',9)
on conflict (slug) do update set
  name_ar=excluded.name_ar, name_en=excluded.name_en,
  desc_ar=excluded.desc_ar, desc_en=excluded.desc_en,
  accent =excluded.accent,  icon   =excluded.icon,
  sort_order=excluded.sort_order;


-- ---------------------------------------------------------------------------
-- 12. Seed: units
--     btec_code maps to the official Pearson BTEC International Level 3 IT
--     unit where the mapping is unambiguous; left null where it is not.
-- ---------------------------------------------------------------------------
insert into public.units
 (unit_no,btec_code,title_ar,title_en,desc_ar,desc_en,major_slug,glh,credits,assessment,pdf_path,sort_order) values

 (1,'Unit 1',
  'استخدام تكنولوجيا المعلومات لدعم المعلومات والاتصالات في المؤسسات',
  'Using IT to Support Information & Communication in Organisations',
  'دور البيانات والمعلومات في اتخاذ القرار، وأدوات تكنولوجيا المعلومات المستخدمة داخل المؤسسات.',
  'The role of data and information in decision-making, and the IT tools organisations rely on.',
  'it-business',120,20,'pearson_set','pdfs/unit01-it-support-organisations.pdf',1),

 (2,'Unit 5',
  'نمذجة البيانات وجداول البيانات','Data Modelling and Spreadsheets',
  'معالجة البيانات، إنشاء لوحات المعلومات (Dashboards)، واستخلاص النتائج منها.',
  'Data processing techniques, building dashboards, and drawing conclusions from data.',
  'data-ai',60,10,'internal','pdfs/unit02-data-modelling.pdf',2),

 (3,null,
  'مقدمة إلى شبكات الكمبيوتر','Introduction to Computer Networks',
  'أساسيات الشبكات، مكوناتها، أنواعها، وكيفية تصميم شبكة آمنة وفعّالة.',
  'Networking fundamentals, components, types, and designing a secure, efficient network.',
  'networking',60,10,'internal','pdfs/unit03-computer-networks.pdf',3),

 (4,'Unit 4',
  'مقدمة في البرمجة','Introduction to Programming',
  'مهارات التفكير الحاسوبي، تصميم وبرمجة حلول برمجية لمشكلات متنوعة.',
  'Computational thinking skills; designing and coding software solutions.',
  'software-development',90,15,'internal','pdfs/unit04-programming.pdf',4),

 (5,null,
  'مقدمة للرسومات الرقمية والرسوم المتحركة','Introduction to Digital Graphics & Animation',
  'أساسيات تصميم الرسوم الرقمية الثابتة والمتحركة وأدواتها.',
  'Fundamentals of static and animated digital graphics and the tools used to create them.',
  'digital-media',60,10,'internal','pdfs/unit05-digital-graphics-animation.pdf',5),

 (6,'Unit 6',
  'مقدمة لتطوير مواقع الويب','Introduction to Website Development',
  'أساسيات بناء صفحات الويب وهيكلتها قبل الدخول في التطوير المتقدم.',
  'The basics of structuring and building web pages before advanced development.',
  'web-development',60,10,'internal',null,6),

 (7,'Unit 7',
  'مقدمة في التطبيقات','Introduction to Applications',
  'تصميم وبناء تطبيق للأجهزة المحمولة يلبي احتياجات مستخدمين محددين.',
  'Designing and building a mobile application that meets specific user needs.',
  'software-development',60,10,'internal','pdfs/unit07-app-development-intro.pdf',7),

 (8,'Unit 8',
  'مقدمة في تصميم الألعاب','Introduction to Game Design',
  'أساسيات تصميم ألعاب الحاسوب وتوقعات اللاعبين وميزات التصميم.',
  'Fundamentals of computer game design, player expectations and design features.',
  'game-development',60,10,'internal','pdfs/unit08-game-design-intro.pdf',8),

 (9,null,
  'كتاب أنظمة تكنولوجيا المعلومات الإستراتيجية','Strategic IT Systems (Textbook)',
  'كيفية استخدام أنظمة تكنولوجيا المعلومات دعمًا لأهداف المؤسسة الإستراتيجية.',
  'How IT systems are used to support an organisation''s strategic goals.',
  'it-business',null,null,'internal',null,9),

 (10,null,
  'دوسية أنظمة تكنولوجيا المعلومات الإستراتيجية','Strategic IT Systems (Workbook)',
  'تمارين وأنشطة تطبيقية مرافقة لمادة أنظمة تكنولوجيا المعلومات الإستراتيجية.',
  'Practical exercises and activities accompanying the Strategic IT Systems unit.',
  'it-business',null,null,'internal',null,10),

 (11,'Unit 6',
  'تطوير المواقع الإلكترونية','Website Development',
  'بناء موقع إلكتروني كامل من التخطيط إلى التنفيذ والاختبار.',
  'Building a full website from planning through implementation and testing.',
  'web-development',60,10,'internal','pdfs/unit11-website-development.pdf',11),

 (12,'Unit 7',
  'تطوير تطبيقات الهاتف المحمول','Mobile App Development',
  'دورة تطوير تطبيق محمول كاملة: التصميم، البرمجة، والاختبار.',
  'The full mobile app development cycle: design, coding, and testing.',
  'software-development',60,10,'internal','pdfs/unit12-mobile-app-development.pdf',12),

 (13,'Unit 12',
  'الدعم الفني وإدارة تكنولوجيا المعلومات','IT Technical Support & Management',
  'استكشاف الأعطال، الصيانة، وإدارة موارد تكنولوجيا المعلومات في المؤسسات.',
  'Troubleshooting, maintenance, and managing IT resources within organisations.',
  'it-support',60,10,'internal','pdfs/unit13-it-technical-support.pdf',13),

 (14,'Unit 8',
  'تطوير ألعاب الحاسوب','Computer Game Development',
  'تحويل تصميم اللعبة إلى نموذج قابل للعب باستخدام أدوات التطوير.',
  'Turning a game design into a playable build using development tools.',
  'game-development',60,10,'internal',null,14),

 (15,'Unit 11',
  'الأمن السيبراني وإدارة الحوادث','Cybersecurity & Incident Management',
  'تهديدات الأمن السيبراني، خطط الحماية، وإجراءات جمع الأدلة عند وقوع حادث أمني.',
  'Cybersecurity threats, protection plans, and forensic procedures after an incident.',
  'cybersecurity',120,20,'internal','pdfs/unit15-cybersecurity-incident-management.pdf',15),

 (16,'Unit 4',
  'كتاب البرمجة','Programming (Textbook)',
  'المرجع الأساسي لمادة البرمجة بمفاهيمها وتطبيقاتها العملية.',
  'The core programming reference with concepts and practical applications.',
  'software-development',90,15,'internal','pdfs/unit04-programming.pdf',16),

 (17,null,
  'إدارة مشاريع تكنولوجيا المعلومات','IT Project Management',
  'تخطيط، تنفيذ، ومتابعة مشاريع تكنولوجيا المعلومات من الفكرة حتى التسليم.',
  'Planning, executing and tracking IT projects from concept to delivery.',
  'it-business',90,15,'internal',null,17)

on conflict (unit_no) do update set
  btec_code=excluded.btec_code,
  title_ar =excluded.title_ar,  title_en=excluded.title_en,
  desc_ar  =excluded.desc_ar,   desc_en =excluded.desc_en,
  major_slug=excluded.major_slug,
  glh=excluded.glh, credits=excluded.credits,
  assessment=excluded.assessment, pdf_path=excluded.pdf_path,
  sort_order=excluded.sort_order;


-- ---------------------------------------------------------------------------
-- 13. Convenience view: a unit joined with its major
-- ---------------------------------------------------------------------------
create or replace view public.units_with_major
with (security_invoker = true) as
select u.*,
       m.name_ar as major_name_ar,
       m.name_en as major_name_en,
       m.accent  as major_accent
from public.units u
left join public.majors m on m.slug = u.major_slug;

-- ===========================================================================
--  PART TWO — study tools
--  Everything below powers the quiz game, the notes, the assignment criteria
--  tracker, the deadlines, the leaderboard and the teacher class view.
--
--  Safe to run on an existing database: every statement is idempotent, and
--  nothing here changes the tables created above. If you skip this part the
--  site still works — the new features simply keep their data in the
--  visitor's browser instead of the database.
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- 14. profiles: leaderboard opt-in
--     display_name is deliberately separate from full_name — a student can
--     appear as "Rayan A." publicly while their real name stays private.
-- ---------------------------------------------------------------------------
alter table public.profiles add column if not exists display_name text;
alter table public.profiles add column if not exists show_on_leaderboard boolean not null default false;
alter table public.profiles add column if not exists exam_date date;

do $$ begin
  alter table public.profiles
    add constraint display_name_len check (
      display_name is null or char_length(display_name) between 2 and 24
    );
exception when duplicate_object then null; end $$;


-- ---------------------------------------------------------------------------
-- 15. unit_notes  —  one free-text note per user per unit
-- ---------------------------------------------------------------------------
create table if not exists public.unit_notes (
  user_id    uuid   not null references public.profiles(id) on delete cascade,
  unit_id    bigint not null references public.units(id)    on delete cascade,
  body       text   not null check (char_length(body) <= 20000),
  updated_at timestamptz not null default now(),
  primary key (user_id, unit_id)
);
alter table public.unit_notes enable row level security;

drop policy if exists notes_all_own on public.unit_notes;
create policy notes_all_own on public.unit_notes
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);


-- ---------------------------------------------------------------------------
-- 16. unit_deadlines  —  when the assignment for a unit is due
-- ---------------------------------------------------------------------------
create table if not exists public.unit_deadlines (
  user_id    uuid   not null references public.profiles(id) on delete cascade,
  unit_id    bigint not null references public.units(id)    on delete cascade,
  due_date   date   not null,
  title      text   check (title is null or char_length(title) <= 120),
  created_at timestamptz not null default now(),
  primary key (user_id, unit_id)
);
alter table public.unit_deadlines enable row level security;

drop policy if exists deadlines_all_own on public.unit_deadlines;
create policy deadlines_all_own on public.unit_deadlines
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);


-- ---------------------------------------------------------------------------
-- 17. criteria_progress  —  ticked assignment criteria (P1, M2, D1 …)
--     The criteria text itself lives in assets/js/criteria.js; only the code
--     is stored, so editing the wording never orphans a student's ticks.
-- ---------------------------------------------------------------------------
create table if not exists public.criteria_progress (
  user_id    uuid   not null references public.profiles(id) on delete cascade,
  unit_id    bigint not null references public.units(id)    on delete cascade,
  code       text   not null check (char_length(code) <= 8),
  done_at    timestamptz not null default now(),
  primary key (user_id, unit_id, code)
);
alter table public.criteria_progress enable row level security;

drop policy if exists criteria_all_own on public.criteria_progress;
create policy criteria_all_own on public.criteria_progress
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);


-- ---------------------------------------------------------------------------
-- 18. quiz_attempts  —  one row per finished quiz
-- ---------------------------------------------------------------------------
create table if not exists public.quiz_attempts (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  major_slug text references public.majors(slug) on delete set null,
  mode       text not null check (mode in ('quick','exam','daily','unit','placement')),
  score      int  not null check (score >= 0),
  total      int  not null check (total  > 0),
  duration_s int  not null default 0 check (duration_s >= 0),
  taken_at   timestamptz not null default now(),
  constraint score_within_total check (score <= total)
);
alter table public.quiz_attempts enable row level security;

create index if not exists attempts_user_idx  on public.quiz_attempts (user_id, taken_at desc);
create index if not exists attempts_major_idx on public.quiz_attempts (major_slug);

drop policy if exists attempts_all_own on public.quiz_attempts;
create policy attempts_all_own on public.quiz_attempts
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);


-- ---------------------------------------------------------------------------
-- 19. classes + class_members  —  teacher / student link
-- ---------------------------------------------------------------------------
create table if not exists public.classes (
  id         uuid primary key default gen_random_uuid(),
  code       text not null unique check (code ~ '^[A-Z0-9]{6}$'),
  name       text check (name is null or char_length(name) <= 80),
  owner_id   uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.classes enable row level security;

create table if not exists public.class_members (
  class_id  uuid not null references public.classes(id)  on delete cascade,
  user_id   uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (class_id, user_id)
);
alter table public.class_members enable row level security;

-- Membership checks live in SECURITY DEFINER helpers on purpose. Writing them
-- inline as sub-selects would make the classes policy read class_members and
-- the class_members policy read classes, which Postgres rejects as infinite
-- recursion. A definer function skips RLS, so the loop never forms.
create or replace function public.is_class_owner(cid uuid)
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1 from public.classes c where c.id = cid and c.owner_id = auth.uid()
  );
$$;

create or replace function public.is_class_member(cid uuid)
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1 from public.class_members m where m.class_id = cid and m.user_id = auth.uid()
  );
$$;

drop policy if exists classes_select on public.classes;
create policy classes_select on public.classes
  for select to authenticated
  using (owner_id = auth.uid() or public.is_class_member(id));

drop policy if exists classes_insert_own on public.classes;
create policy classes_insert_own on public.classes
  for insert to authenticated with check (owner_id = auth.uid());

drop policy if exists classes_update_own on public.classes;
create policy classes_update_own on public.classes
  for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());

drop policy if exists classes_delete_own on public.classes;
create policy classes_delete_own on public.classes
  for delete to authenticated using (owner_id = auth.uid());

drop policy if exists members_select on public.class_members;
create policy members_select on public.class_members
  for select to authenticated
  using (user_id = auth.uid() or public.is_class_owner(class_id));

drop policy if exists members_leave on public.class_members;
create policy members_leave on public.class_members
  for delete to authenticated using (user_id = auth.uid() or public.is_class_owner(class_id));

-- Joining goes through this function rather than a direct insert, so a student
-- never needs permission to read the whole classes table just to find a code.
create or replace function public.join_class(p_code text)
returns table (id uuid, name text, code text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  target public.classes%rowtype;
begin
  if auth.uid() is null then
    raise exception 'not signed in';
  end if;

  select * into target from public.classes c where c.code = upper(trim(p_code));
  if not found then
    raise exception 'class not found';
  end if;

  insert into public.class_members (class_id, user_id)
  values (target.id, auth.uid())
  on conflict (class_id, user_id) do nothing;

  return query select target.id, target.name, target.code;
end;
$$;

revoke all on function public.join_class(text) from public;
grant execute on function public.join_class(text) to authenticated;


-- ---------------------------------------------------------------------------
-- 20. leaderboard  —  best score per pathway, opted-in students only
--     This view runs with the owner's rights (security_invoker is NOT set),
--     which is what lets one student see another student's best score. The
--     WHERE clause is the protection: nothing appears unless that student
--     ticked "show me on the leaderboard", and only their display name and
--     percentage are exposed — never their email, real name or attempts.
-- ---------------------------------------------------------------------------
create or replace view public.leaderboard as
select
  p.display_name,
  a.major_slug,
  max(round((a.score::numeric / a.total) * 100))::int as best_pct,
  count(*)::int as attempts
from public.quiz_attempts a
join public.profiles p on p.id = a.user_id
where p.show_on_leaderboard = true
  and p.display_name is not null
  and a.mode in ('quick','exam','daily')
group by p.display_name, a.major_slug;

grant select on public.leaderboard to anon, authenticated;


-- ---------------------------------------------------------------------------
-- 21. class_overview  —  what a teacher sees for their own class
--     Same pattern: owner's rights, with `is_class_owner` as the gate, so a
--     teacher only ever sees the classes they created.
-- ---------------------------------------------------------------------------
create or replace view public.class_overview as
select
  c.id                                as class_id,
  c.name                              as class_name,
  m.user_id                           as student_id,
  coalesce(p.display_name, p.full_name, p.username) as student_name,
  p.major_slug,
  (select avg(up.percent) from public.unit_progress up where up.user_id = m.user_id)          as avg_progress,
  (select count(*) from public.unit_progress up
     where up.user_id = m.user_id and up.percent >= 100)::int                                  as units_done,
  (select avg(round((qa.score::numeric / qa.total) * 100))
     from public.quiz_attempts qa where qa.user_id = m.user_id)                                as avg_quiz
from public.classes c
join public.class_members m on m.class_id = c.id
join public.profiles p      on p.id = m.user_id
where public.is_class_owner(c.id);

grant select on public.class_overview to authenticated;


-- ---------------------------------------------------------------------------
-- 22. updated_at trigger for the new notes table
-- ---------------------------------------------------------------------------
drop trigger if exists unit_notes_touch on public.unit_notes;
create trigger unit_notes_touch before update on public.unit_notes
  for each row execute function public.touch_updated_at();


-- ============================================================================
--  Done. Check: Table Editor should now show 11 tables with RLS enabled,
--  9 rows in majors and 17 rows in units, plus the leaderboard and
--  class_overview views.
-- ============================================================================
