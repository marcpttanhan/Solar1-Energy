-- =====================================================================
-- Solar 1 Energy: Supabase security audit (READ-ONLY, changes nothing)
--
-- Run in Supabase: Dashboard → SQL Editor → New query → paste → Run.
-- Each query returns rows only when something needs attention, except the
-- last two, which list the policies and user accounts for review.
-- Fix findings with supabase_hardening.sql.
-- =====================================================================

-- 1. Tables in the API schema WITHOUT row level security (should be empty)
select c.relname as table_without_rls
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind in ('r', 'p') and not c.relrowsecurity;

-- 2. Anything other than site_content that the public roles can reach (should be empty)
select table_name, grantee, string_agg(privilege_type, ', ' order by privilege_type) as privileges
from information_schema.role_table_grants
where table_schema = 'public'
  and grantee in ('anon', 'authenticated')
  and table_name <> 'site_content'
group by table_name, grantee
order by table_name, grantee;

-- 3. site_content: anon may only SELECT; authenticated SELECT/INSERT/UPDATE/DELETE
select grantee, string_agg(privilege_type, ', ' order by privilege_type) as privileges
from information_schema.role_table_grants
where table_schema = 'public' and table_name = 'site_content' and grantee in ('anon', 'authenticated')
group by grantee;

-- 4. Functions in public the API roles can call (legacy is_admin() etc.; should be empty)
select p.oid::regprocedure as callable_function, p.prosecdef as security_definer
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname <> 'site_content_stamp'
  and not exists (select 1 from pg_depend d where d.objid = p.oid and d.deptype = 'e')
  and (has_function_privilege('anon', p.oid, 'execute') or has_function_privilege('authenticated', p.oid, 'execute'));

-- 5. Storage buckets (the site uses none; a public bucket here is unexpected)
select id, name, public from storage.buckets;

-- 6. Every policy, for review: writes on site_content must check the admin email
select tablename, policyname, cmd, roles, qual, with_check
from pg_policies
where schemaname = 'public'
order by tablename, policyname;

-- 7. User accounts: there should be exactly one, admin@solar1energy.co.th
select id, email, email_confirmed_at, created_at, last_sign_in_at
from auth.users
order by created_at;
