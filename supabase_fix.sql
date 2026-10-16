-- =====================================================================
-- Solar One Energy: repair the live project, 2026-10-16 (v3, safe to re-run)
--
-- Makes site_content match the website (key, data, updated_at, updated_by)
-- and sets its access rules: anyone reads, only the admin account
-- (admin@solar1energy.co.th) writes. Admin sign-in no longer uses the
-- admin_users table or is_admin(); this script leaves them alone.
--
-- Nothing is deleted: a site_content table of the wrong shape is renamed
-- to site_content_legacy_<timestamp> and kept for reference.
--
-- Run: Supabase Dashboard -> SQL Editor -> New query -> paste all -> Run.
-- =====================================================================

-- 1. Move aside a site_content table whose columns don't match
do $$
declare stamp text := to_char(clock_timestamp(), 'YYYYMMDD_HH24MISS');
begin
  if to_regclass('public.site_content') is not null and (
       select count(*) from information_schema.columns
       where table_schema = 'public' and table_name = 'site_content'
         and column_name in ('key', 'data', 'updated_at', 'updated_by')) < 4 then
    execute format('alter table public.site_content rename to %I', 'site_content_legacy_' || stamp);
  end if;
end $$;

-- 2. Remove every existing policy on site_content (older ones referenced admin_users)
do $$
declare p record;
begin
  for p in select policyname from pg_policies
           where schemaname = 'public' and tablename = 'site_content'
  loop
    execute format('drop policy %I on public.site_content', p.policyname);
  end loop;
end $$;

-- 3. The schema from supabase_schema.sql, unchanged
-- ---------- table ----------

create table if not exists public.site_content (
  key         text primary key
              check (key in ('hero', 'packages', 'roi', 'contact', 'projects', 'testimonials')),
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

-- 4. Make the API notice the new table right away
notify pgrst, 'reload schema';

-- 5. Check (the SQL editor shows this last result). Expect:
--    columns  | key, data, updated_at, updated_by
--    policies | 4
--    admin    | 1   (0 = create the user: see the steps in supabase_schema.sql)
select 'columns' as item, string_agg(column_name, ', ' order by ordinal_position) as result
  from information_schema.columns where table_schema = 'public' and table_name = 'site_content'
union all
select 'policies', count(*)::text from pg_policies where schemaname = 'public' and tablename = 'site_content'
union all
select 'admin', count(*)::text from auth.users where lower(email) = 'admin@solar1energy.co.th';
