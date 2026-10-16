-- =====================================================================
-- Solar One Energy: content table for the admin panel
--
-- Run once in Supabase: Dashboard → SQL Editor → New query → paste → Run.
-- Safe to re-run: every statement is idempotent.
-- (Project that already has an older/different site_content table: run
-- supabase_fix.sql instead, which moves that table aside first.)
--
-- Security model
--   • Anyone (the public site, using the anon key) can READ site content.
--   • Only the admin account can WRITE it: the Supabase Auth user whose
--     email is admin@solar1energy.co.th (adminEmail in supabase-config.js).
--     The admin page signs in as that account when someone types "admin".
--
-- After running this script:
--   1. Authentication → Users → "Add user" → "Create new user":
--      email admin@solar1energy.co.th, your password, tick "Auto Confirm User".
--   2. Authentication → Sign In / Providers → turn OFF "Allow new users to sign up".
--   3. Project Settings → API → copy the Project URL and the anon public key
--      into supabase-config.js in the website repo.
--
-- To use a different admin email, change it here AND in supabase-config.js.
-- =====================================================================

-- ---------- table ----------

create table if not exists public.site_content (
  key         text primary key
              check (key in ('hero', 'packages', 'roi', 'contact', 'testimonials')),
  data        jsonb not null
              check (jsonb_typeof(data) = 'object')
              check (pg_column_size(data) < 200000),        -- ~200 KB per section
  updated_at  timestamptz not null default now(),
  updated_by  uuid references auth.users (id) on delete set null
);

comment on table public.site_content is
  'One JSON document per website section. Missing rows fall back to the defaults built into the site.';

-- ---------- stamp who changed what ----------

create or replace function public.site_content_stamp()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  new.updated_by := auth.uid();
  return new;
end;
$$;

drop trigger if exists site_content_stamp on public.site_content;
create trigger site_content_stamp
  before insert or update on public.site_content
  for each row execute function public.site_content_stamp();

-- ---------- row level security ----------

alter table public.site_content enable row level security;

drop policy if exists "site_content: anyone can read"  on public.site_content;
drop policy if exists "site_content: admins insert"    on public.site_content;
drop policy if exists "site_content: admins update"    on public.site_content;
drop policy if exists "site_content: admins delete"    on public.site_content;
drop policy if exists "site_content: admin insert"     on public.site_content;
drop policy if exists "site_content: admin update"     on public.site_content;
drop policy if exists "site_content: admin delete"     on public.site_content;

create policy "site_content: anyone can read"
  on public.site_content for select
  to anon, authenticated
  using (true);

-- Writes: signed in AND signed in as the admin account. Checking the email
-- (not just "authenticated") keeps the site safe even if sign-ups get
-- switched back on by mistake.
create policy "site_content: admin insert"
  on public.site_content for insert
  to authenticated
  with check (lower(auth.jwt() ->> 'email') = 'admin@solar1energy.co.th');

create policy "site_content: admin update"
  on public.site_content for update
  to authenticated
  using (lower(auth.jwt() ->> 'email') = 'admin@solar1energy.co.th')
  with check (lower(auth.jwt() ->> 'email') = 'admin@solar1energy.co.th');

create policy "site_content: admin delete"
  on public.site_content for delete
  to authenticated
  using (lower(auth.jwt() ->> 'email') = 'admin@solar1energy.co.th');

-- ---------- privileges ----------

revoke all on public.site_content from anon, authenticated;

grant select                          on public.site_content to anon, authenticated;
grant insert, update, delete          on public.site_content to authenticated;
