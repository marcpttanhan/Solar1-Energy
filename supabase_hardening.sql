-- =====================================================================
-- Solar 1 Energy: Supabase hardening (security audit, 2026-10-28)
--
-- Run once in Supabase: Dashboard → SQL Editor → New query → paste → Run.
-- Safe to re-run. Deletes nothing and does not touch site_content, so the
-- website and the admin panel keep working exactly as before.
--
-- Why: supabase_fix.sql (2026-10-16) renamed an older site_content table to
-- site_content_legacy_<timestamp> and left the old admin_users table and
-- is_admin() function in place. Those kept whatever access they had before,
-- possibly readable or writable with the public anon key.
--
-- Check before and after with supabase_security_audit.sql.
-- =====================================================================

-- 1. Row level security on for every table in the API schema, and every table
--    except site_content closed to the public API roles.
do $$
declare t record;
begin
  for t in
    select c.relname, c.relkind
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind in ('r', 'p', 'v', 'm', 'f', 'S')
      and not exists (select 1 from pg_depend d where d.objid = c.oid and d.deptype = 'e')
  loop
    if t.relkind in ('r', 'p') then
      execute format('alter table public.%I enable row level security', t.relname);
    end if;
    if t.relname <> 'site_content' then
      execute format('revoke all on public.%I from anon, authenticated', t.relname);
    end if;
  end loop;
end $$;

-- 2. Legacy functions (is_admin() and the like) no longer callable through the API.
--    site_content_stamp is the trigger that stamps edits; triggers fire without
--    EXECUTE rights, but it is left as it is anyway.
do $$
declare f record;
begin
  for f in
    select p.oid::regprocedure as sig
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname <> 'site_content_stamp'
      and not exists (select 1 from pg_depend d where d.objid = p.oid and d.deptype = 'e')
  loop
    execute format('revoke execute on function %s from public, anon, authenticated', f.sig);
  end loop;
end $$;

-- 3. site_content: re-assert the intended access (same as supabase_schema.sql).
alter table public.site_content enable row level security;
revoke all on public.site_content from anon, authenticated;
grant select                 on public.site_content to anon, authenticated;
grant insert, update, delete on public.site_content to authenticated;

-- 4. New tables made later in the SQL editor stay private until granted on
--    purpose. (Supabase otherwise gives anon and authenticated full rights on
--    every new table, guarded only by RLS.)
alter default privileges for role postgres in schema public revoke all on tables    from anon, authenticated;
alter default privileges for role postgres in schema public revoke all on sequences from anon, authenticated;
alter default privileges for role postgres in schema public revoke all on functions from anon, authenticated;

-- 5. Optional, strongest: tie writes to the admin account's user id as well as
--    its email. Find the id under Authentication → Users, put it in place of
--    00000000-0000-0000-0000-000000000000 below, and run this block on its own.
--
-- do $$
-- declare
--   admin_id constant uuid := '00000000-0000-0000-0000-000000000000';
--   cond text := format($c$auth.uid() = %L::uuid and lower(auth.jwt() ->> 'email') = 'admin@solar1energy.co.th'$c$, admin_id);
-- begin
--   execute format('alter policy "site_content: admin insert" on public.site_content with check (%s)', cond);
--   execute format('alter policy "site_content: admin update" on public.site_content using (%s) with check (%s)', cond, cond);
--   execute format('alter policy "site_content: admin delete" on public.site_content using (%s)', cond);
-- end $$;

-- 6. Dashboard settings that SQL cannot change (check these by hand):
--    • Authentication → Sign In / Providers: "Allow new users to sign up" OFF,
--      anonymous sign-ins OFF.
--    • Authentication → Attack Protection: leaked-password protection ON;
--      CAPTCHA optional.
--    • Authentication → Multi-Factor: enable TOTP and enrol the admin account.
--    • Project Settings → API: keep the service_role / secret key out of any
--      code or chat. Rotate it if it was ever shared.
