-- Slice 2A.1: replayable identity, account, membership, and bootstrap foundation.
-- This migration is tested only in an isolated local/test Supabase project while
-- docs/restart/DATA_MIGRATION_DECISION.md remains pending.

-- This is a fresh-baseline migration, not an additive migration for the live
-- project. Fail before changing schemas, functions, grants, or policies if any
-- identity/account boundary object already exists. A later preservation-safe
-- live migration must be designed from approved reconciliation evidence.
do $guard$
begin
  if pg_catalog.to_regclass('public.users') is not null
    or pg_catalog.to_regclass('public.accounts') is not null
    or pg_catalog.to_regclass('public.account_users') is not null
    or pg_catalog.to_regprocedure('public.update_updated_at_column()') is not null
    or pg_catalog.to_regprocedure('public.bootstrap_current_user(text,text)') is not null
    or pg_catalog.to_regprocedure('private.current_user_is_account_member(uuid)') is not null
    or pg_catalog.to_regprocedure('private.current_user_is_account_owner(uuid)') is not null
  then
    raise exception using
      errcode = '55000',
      message = 'Slice 2A.1 requires an empty isolated identity/account boundary';
  end if;
end;
$guard$;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to authenticated;

create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog
as $function$
begin
  new.updated_at = statement_timestamp();
  return new;
end;
$function$;

revoke all on function public.update_updated_at_column() from public, anon, authenticated;

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  role text not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  is_admin boolean not null default false,
  profile_picture text,
  auth_provider text not null default 'email',
  constraint users_email_not_blank check (length(btrim(email)) > 0),
  constraint users_full_name_length check (full_name is null or length(full_name) <= 120),
  constraint users_role_allowed check (role in ('user', 'admin', 'system_admin')),
  constraint users_auth_provider_not_blank check (length(btrim(auth_provider)) > 0)
);

create index if not exists idx_users_email on public.users(email);
create index if not exists idx_users_role on public.users(role);
create index if not exists idx_users_is_admin on public.users(is_admin);
create index if not exists idx_users_auth_provider on public.users(auth_provider);

drop trigger if exists update_users_updated_at on public.users;
create trigger update_users_updated_at
before update on public.users
for each row execute function public.update_updated_at_column();

create table public.accounts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete restrict,
  name varchar(100) not null,
  description text,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint accounts_name_not_blank check (length(btrim(name)) > 0),
  constraint accounts_owner_name_unique unique (owner_id, name)
);

create index if not exists idx_accounts_owner_id on public.accounts(owner_id);

drop trigger if exists update_accounts_updated_at on public.accounts;
create trigger update_accounts_updated_at
before update on public.accounts
for each row execute function public.update_updated_at_column();

create table public.account_users (
  account_id uuid not null references public.accounts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role varchar(20) not null default 'member',
  invited_at timestamptz,
  joined_at timestamptz,
  created_at timestamptz not null default now(),
  primary key (account_id, user_id),
  constraint account_users_role_allowed check (role in ('owner', 'admin', 'member', 'viewer')),
  constraint account_users_joined_after_invite check (
    invited_at is null or joined_at is null or joined_at >= invited_at
  )
);

create index if not exists idx_account_users_account_id on public.account_users(account_id);
create index if not exists idx_account_users_user_id on public.account_users(user_id);
create index if not exists idx_account_users_role on public.account_users(role);

create or replace function private.current_user_is_account_member(p_account_id uuid)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog
as $function$
  select exists (
    select 1
    from public.account_users as membership
    where membership.account_id = p_account_id
      and membership.user_id = auth.uid()
  );
$function$;

create or replace function private.current_user_is_account_owner(p_account_id uuid)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog
as $function$
  select exists (
    select 1
    from public.accounts as account
    where account.id = p_account_id
      and account.owner_id = auth.uid()
  );
$function$;

revoke all on function private.current_user_is_account_member(uuid) from public, anon, authenticated;
revoke all on function private.current_user_is_account_owner(uuid) from public, anon, authenticated;
grant execute on function private.current_user_is_account_member(uuid) to authenticated;
grant execute on function private.current_user_is_account_owner(uuid) to authenticated;

alter table public.users enable row level security;
alter table public.accounts enable row level security;
alter table public.account_users enable row level security;

drop policy if exists users_select_self on public.users;
create policy users_select_self
on public.users for select
to authenticated
using (id = (select auth.uid()));

drop policy if exists accounts_select_membership on public.accounts;
create policy accounts_select_membership
on public.accounts for select
to authenticated
using (private.current_user_is_account_member(id));

drop policy if exists accounts_update_owner on public.accounts;
create policy accounts_update_owner
on public.accounts for update
to authenticated
using (private.current_user_is_account_owner(id))
with check (private.current_user_is_account_owner(id));

drop policy if exists account_users_select_same_account on public.account_users;
create policy account_users_select_same_account
on public.account_users for select
to authenticated
using (private.current_user_is_account_member(account_id));

revoke all on table public.users from anon, authenticated;
revoke all on table public.accounts from anon, authenticated;
revoke all on table public.account_users from anon, authenticated;
grant select on table public.users to authenticated;
grant select on table public.accounts to authenticated;
grant update (name, description, settings) on table public.accounts to authenticated;
grant select on table public.account_users to authenticated;

create or replace function public.bootstrap_current_user(
  p_display_name text default null,
  p_account_name text default null
)
returns table (
  user_id uuid,
  account_id uuid,
  account_name text,
  account_role text
)
language plpgsql
security definer
set search_path = pg_catalog
as $function$
declare
  v_user_id uuid := auth.uid();
  v_email text;
  v_provider text;
  v_display_name text := nullif(btrim(p_display_name), '');
  v_requested_account_name text := coalesce(nullif(btrim(p_account_name), ''), 'My account');
  v_account_id uuid;
  v_account_name text;
begin
  if v_user_id is null then
    raise exception using errcode = '42501', message = 'Authentication required';
  end if;

  if length(v_display_name) > 120 then
    raise exception using errcode = '22001', message = 'Display name is too long';
  end if;

  if length(v_requested_account_name) > 100 then
    raise exception using errcode = '22001', message = 'Account name is too long';
  end if;

  -- Serialize retries and concurrent callback requests for one auth identity.
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(v_user_id::text, 0)
  );

  select
    auth_user.email,
    coalesce(nullif(auth_user.raw_app_meta_data ->> 'provider', ''), 'email')
  into v_email, v_provider
  from auth.users as auth_user
  where auth_user.id = v_user_id;

  if v_email is null or length(btrim(v_email)) = 0 then
    raise exception using errcode = '23502', message = 'Authenticated email is required';
  end if;

  insert into public.users as profile (
    id,
    email,
    full_name,
    role,
    is_admin,
    auth_provider
  )
  values (
    v_user_id,
    lower(btrim(v_email)),
    v_display_name,
    'user',
    false,
    v_provider
  )
  on conflict (id) do update
  set email = excluded.email,
      full_name = coalesce(v_display_name, profile.full_name),
      auth_provider = excluded.auth_provider;

  select account.id, account.name
  into v_account_id, v_account_name
  from public.accounts as account
  where account.owner_id = v_user_id
  order by account.created_at, account.id
  limit 1
  for update;

  if v_account_id is null then
    insert into public.accounts (owner_id, name)
    values (v_user_id, v_requested_account_name)
    returning id, name into v_account_id, v_account_name;
  end if;

  insert into public.account_users as membership (
    account_id,
    user_id,
    role,
    joined_at
  )
  values (
    v_account_id,
    v_user_id,
    'owner',
    statement_timestamp()
  )
  -- Name the constraint because the RETURNS TABLE output columns are also
  -- PL/pgSQL variables named account_id and user_id.
  on conflict on constraint account_users_pkey do update
  set role = 'owner',
      joined_at = coalesce(membership.joined_at, excluded.joined_at);

  return query
  select v_user_id, v_account_id, v_account_name, 'owner'::text;
end;
$function$;

revoke all on function public.bootstrap_current_user(text, text) from public, anon, authenticated;
grant execute on function public.bootstrap_current_user(text, text) to authenticated;
