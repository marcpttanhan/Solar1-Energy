-- =====================================================================
-- Solar One Energy: content tables for the admin panel
--
-- Run once in Supabase: Dashboard → SQL Editor → New query → paste → Run.
-- Safe to re-run: every statement is idempotent.
--
-- Security model
--   • Anyone (the public site, using the anon key) can READ site content.
--   • Only signed-in users listed in public.admin_users can WRITE it.
--   • admin_users itself can only be changed here in the SQL editor
--     (or with the service-role key), never from the browser.
--
-- After running this script:
--   1. Authentication → Users → "Add user" → create your admin login
--      (email + password, tick "Auto Confirm User").
--   2. Authentication → Sign In / Providers → turn OFF "Allow new users to sign up"
--      so nobody else can create an account.
--   3. Grant that user admin rights (replace the email):
--
--        insert into public.admin_users (user_id)
--        select id from auth.users where email = 'admin@example.com'
--        on conflict do nothing;
--
--   4. Project Settings → API → copy the Project URL and the anon public key
--      into supabase-config.js in the website repo.
-- =====================================================================

-- ---------- tables ----------

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

create table if not exists public.admin_users (
  user_id     uuid primary key references auth.users (id) on delete cascade,
  created_at  timestamptz not null default now()
);

comment on table public.admin_users is
  'Accounts allowed to edit site_content. Manage from the SQL editor only.';

-- ---------- helper: is the current user an admin? ----------
-- security definer so the check can read admin_users regardless of that table's RLS.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid());
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

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
alter table public.admin_users  enable row level security;

-- site_content: public read, admin-only write
drop policy if exists "site_content: anyone can read"  on public.site_content;
drop policy if exists "site_content: admins insert"    on public.site_content;
drop policy if exists "site_content: admins update"    on public.site_content;
drop policy if exists "site_content: admins delete"    on public.site_content;

create policy "site_content: anyone can read"
  on public.site_content for select
  to anon, authenticated
  using (true);

create policy "site_content: admins insert"
  on public.site_content for insert
  to authenticated
  with check (public.is_admin());

create policy "site_content: admins update"
  on public.site_content for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "site_content: admins delete"
  on public.site_content for delete
  to authenticated
  using (public.is_admin());

-- admin_users: a signed-in user may only see their own row (used by the
-- admin page to confirm access). No insert/update/delete policies, so the
-- list can't be changed from the browser.
drop policy if exists "admin_users: read own row" on public.admin_users;

create policy "admin_users: read own row"
  on public.admin_users for select
  to authenticated
  using (user_id = auth.uid());

-- ---------- privileges ----------

revoke all on public.site_content from anon, authenticated;
revoke all on public.admin_users  from anon, authenticated;

grant select                          on public.site_content to anon, authenticated;
grant insert, update, delete          on public.site_content to authenticated;
grant select                          on public.admin_users  to authenticated;
