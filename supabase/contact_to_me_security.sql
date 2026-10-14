-- ════════════════════════════════════════════════════════════════════
--  contact_to_me — security setup for the portfolio contact form
--  Run in Supabase Dashboard → SQL Editor. Safe to re-run.
--
--  Goal:
--    • anonymous visitors can INSERT a message (name, email, description)
--    • nobody using the public key can SELECT, UPDATE or DELETE rows
--    • id and created_at are always set by the database
--  You (the owner) still see every message in Table Editor, because the
--  dashboard uses an admin role that bypasses RLS.
-- ════════════════════════════════════════════════════════════════════


-- 0) Inspect first (read-only). Check the columns and any existing policies.
select column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema = 'public' and table_name = 'contact_to_me'
order by ordinal_position;

select policyname, cmd, roles, qual, with_check
from pg_policies
where schemaname = 'public' and tablename = 'contact_to_me';
-- If you see any policy that allows SELECT / UPDATE / DELETE / ALL for
-- anon or public, drop it in step 2 (copy its exact name).


-- 1) Row Level Security must be ON (never disable it to "make the form work").
alter table public.contact_to_me enable row level security;


-- 2) Remove old/broad policies on this table.
--    Replace the names below with the ones listed by the query in step 0.
drop policy if exists "Enable insert for all users"            on public.contact_to_me;
drop policy if exists "Enable read access for all users"       on public.contact_to_me;
drop policy if exists "Public can submit contact messages"     on public.contact_to_me;


-- 3) Database-managed values. created_at defaults to now().
--    (If `id` is "bigint generated ... as identity" or uuid with a default,
--     nothing else is needed.)
alter table public.contact_to_me alter column created_at set default now();


-- 4) INSERT-only policy for visitors, with basic server-side validation that
--    mirrors the form's rules. Anything outside these limits is rejected.
create policy "Public can submit contact messages"
on public.contact_to_me
for insert
to anon, authenticated
with check (
      contact_name  is not null and char_length(btrim(contact_name)) between 2 and 100
  and contact_email is not null and char_length(contact_email) <= 254
  and contact_email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]{2,}$'
  and description   is not null and char_length(btrim(description)) between 10 and 2000
);
-- There are deliberately NO select / update / delete policies:
-- with RLS on, those operations are denied for anon and authenticated.


-- 5) Column privileges (defence in depth): the public roles may only insert
--    the three content columns, and have no table-level read/update/delete.
revoke all on table public.contact_to_me from anon, authenticated;
grant insert (contact_name, contact_email, description) on table public.contact_to_me to anon, authenticated;


-- 6) OPTIONAL — light spam protection: max 3 messages per email address per
--    10 minutes. Rejected inserts return HTTP 400 and the form shows an error.
create index if not exists contact_to_me_email_created_idx
  on public.contact_to_me (contact_email, created_at desc);

create or replace function public.contact_to_me_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (
    select count(*) from public.contact_to_me
    where lower(contact_email) = lower(new.contact_email)
      and created_at > now() - interval '10 minutes'
  ) >= 3 then
    raise exception 'Too many messages from this address. Please try again later.';
  end if;
  return new;
end;
$$;

revoke all on function public.contact_to_me_rate_limit() from public, anon, authenticated;

drop trigger if exists contact_to_me_rate_limit on public.contact_to_me;
create trigger contact_to_me_rate_limit
before insert on public.contact_to_me
for each row execute function public.contact_to_me_rate_limit();


-- 7) Verify (should list exactly one INSERT policy, and RLS = true).
select relname, relrowsecurity from pg_class where relname = 'contact_to_me';
select policyname, cmd, roles from pg_policies where tablename = 'contact_to_me';
