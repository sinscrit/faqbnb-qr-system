-- Slice 2B.1: replayable property/type and deterministic property-context
-- foundation. This migration is only for an isolated local/test Supabase
-- project while docs/restart/DATA_MIGRATION_DECISION.md remains pending.

-- This is a fresh-slice migration layered on the isolated 2A.1 baseline, not
-- an additive migration for the live project. Fail before changing any
-- property boundary object when an earlier or partial implementation exists.
do $guard$
begin
  if pg_catalog.to_regclass('public.property_types') is not null
    or pg_catalog.to_regclass('public.properties') is not null
    or pg_catalog.to_regprocedure('public.resolve_current_property(text,text,text)') is not null
    or pg_catalog.to_regprocedure('private.current_user_can_write_account(uuid)') is not null
    or pg_catalog.to_regprocedure('private.text_has_unsafe_control(text)') is not null
  then
    raise exception using
      errcode = '55000',
      message = 'Slice 2B.1 requires an empty isolated property boundary';
  end if;

  -- Fail before any 2B.1 DDL when this file is run out of order. The ordered
  -- migration depends on the complete isolated 2A.1 identity/account boundary;
  -- it must not leave a partial property boundary in a manual/non-transactional
  -- replay merely because the property objects themselves were initially empty.
  if pg_catalog.to_regclass('public.users') is null
    or pg_catalog.to_regclass('public.accounts') is null
    or pg_catalog.to_regclass('public.account_users') is null
    or pg_catalog.to_regprocedure('public.update_updated_at_column()') is null
    or pg_catalog.to_regprocedure('private.current_user_is_account_member(uuid)') is null
  then
    raise exception using
      errcode = '55000',
      message = 'Slice 2B.1 requires the isolated Slice 2A.1 baseline';
  end if;
end;
$guard$;

create or replace function private.text_has_unsafe_control(p_value text)
returns boolean
language sql
immutable
security invoker
set search_path = pg_catalog
as $function$
  select exists (
    select 1
    from pg_catalog.generate_series(
      1,
      pg_catalog.char_length(coalesce(p_value, ''))
    ) as character(position)
    where pg_catalog.ascii(
      pg_catalog.substr(p_value, character.position, 1)
    ) between 0 and 31
      or pg_catalog.ascii(
        pg_catalog.substr(p_value, character.position, 1)
      ) between 127 and 159
      or pg_catalog.ascii(
        pg_catalog.substr(p_value, character.position, 1)
      ) in (173, 1564, 65279)
      or pg_catalog.ascii(
        pg_catalog.substr(p_value, character.position, 1)
      ) between 8203 and 8207
      or pg_catalog.ascii(
        pg_catalog.substr(p_value, character.position, 1)
      ) between 8232 and 8238
      or pg_catalog.ascii(
        pg_catalog.substr(p_value, character.position, 1)
      ) between 8288 and 8303
  );
$function$;

revoke all on function private.text_has_unsafe_control(text)
from public, anon, authenticated;

create table public.property_types (
  id uuid primary key,
  name varchar(40) not null,
  display_name varchar(80) not null,
  description text,
  created_at timestamptz not null default now(),
  constraint property_types_name_unique unique (name),
  constraint property_types_name_format check (
    name = lower(name)
    and name ~ '^[a-z][a-z0-9_]{1,39}$'
  ),
  constraint property_types_display_name_not_blank check (
    length(btrim(display_name)) > 0
  ),
  constraint property_types_description_length check (
    description is null or char_length(description) <= 300
  )
);

create index idx_property_types_name on public.property_types(name);

-- These deterministic rows are a new product seed for clean isolated replay.
-- They are not asserted to share IDs, names, or labels with the seven live rows.
insert into public.property_types (id, name, display_name, description)
values
  ('00000000-0000-4000-8000-000000000101', 'apartment', 'Apartment', 'An apartment or flat.'),
  ('00000000-0000-4000-8000-000000000102', 'house', 'House', 'A standalone or attached house.'),
  ('00000000-0000-4000-8000-000000000103', 'villa', 'Villa', 'A villa or similar holiday home.'),
  ('00000000-0000-4000-8000-000000000104', 'cabin', 'Cabin', 'A cabin, chalet, or lodge.'),
  ('00000000-0000-4000-8000-000000000105', 'cottage', 'Cottage', 'A cottage or small country home.'),
  ('00000000-0000-4000-8000-000000000106', 'guesthouse', 'Guesthouse', 'A guesthouse or private guest suite.'),
  ('00000000-0000-4000-8000-000000000107', 'other', 'Other', 'Any property that does not fit the listed types.');

create table public.properties (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete restrict,
  property_type_id uuid not null references public.property_types(id) on delete restrict,
  nickname varchar(100) not null,
  address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  constraint properties_nickname_not_blank check (length(btrim(nickname)) > 0),
  constraint properties_nickname_safe_text check (
    not private.text_has_unsafe_control(nickname)
  ),
  constraint properties_address_length check (
    address is null or char_length(address) <= 500
  ),
  constraint properties_address_safe_text check (
    not private.text_has_unsafe_control(address)
  )
);

create index idx_properties_account_id on public.properties(account_id);
create index idx_properties_property_type_id on public.properties(property_type_id);
create index idx_properties_user_id on public.properties(user_id);
create index idx_properties_nickname on public.properties(nickname);

create trigger update_properties_updated_at
before update on public.properties
for each row execute function public.update_updated_at_column();

create or replace function private.current_user_can_write_account(p_account_id uuid)
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
      and membership.role in ('owner', 'admin', 'member')
  );
$function$;

revoke all on function private.current_user_can_write_account(uuid)
from public, anon, authenticated;

alter table public.property_types enable row level security;
alter table public.properties enable row level security;

create policy property_types_select_authenticated
on public.property_types for select
to authenticated
using (true);

create policy properties_select_membership
on public.properties for select
to authenticated
using (private.current_user_is_account_member(account_id));

-- Property writes are deliberately RPC-only in this slice. There are no
-- INSERT, UPDATE, or DELETE policies and clients receive no DML table grants.
revoke all on table public.property_types from anon, authenticated;
revoke all on table public.properties from anon, authenticated;
grant select on table public.property_types to authenticated;
grant select on table public.properties to authenticated;

create or replace function public.resolve_current_property(
  p_nickname text default null,
  p_address text default null,
  p_property_type_name text default 'other'
)
returns table (
  account_id uuid,
  state text,
  property_count bigint,
  property_id uuid,
  property_nickname text,
  property_address text,
  property_type_name text,
  property_type_display_name text
)
language plpgsql
security definer
set search_path = pg_catalog
as $function$
declare
  v_user_id uuid := auth.uid();
  v_account_id uuid;
  v_nickname text;
  v_address text;
  v_property_type_name text;
  v_property_type_id uuid;
  v_property_count bigint;
  v_property_id uuid;
  v_property_nickname text;
  v_property_address text;
  v_property_type_display_name text;
begin
  if v_user_id is null then
    raise exception using errcode = '42501', message = 'Authentication required';
  end if;

  if not exists (
    select 1
    from auth.users as auth_user
    where auth_user.id = v_user_id
      and auth_user.email_confirmed_at is not null
  ) then
    raise exception using errcode = '42501', message = 'Confirmed email required';
  end if;

  -- A property context is useful only for a role that can complete the host
  -- workflow. Viewer memberships remain readable through table RLS, but cannot
  -- become write authority or shadow a later writable membership here.
  select account.id
  into v_account_id
  from public.account_users as membership
  join public.accounts as account on account.id = membership.account_id
  where membership.user_id = v_user_id
    and membership.role in ('owner', 'admin', 'member')
  order by account.created_at, account.id
  limit 1
  for update of membership;

  if v_account_id is null then
    raise exception using errcode = 'P0002', message = 'No writable account membership';
  end if;

  -- Serialize all first-property retries for the selected account. No client
  -- value participates in tenant selection or lock authority.
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(v_account_id::text, 21)
  );

  select count(*)
  into v_property_count
  from public.properties as property
  where property.account_id = v_account_id;

  if v_property_count > 1 then
    return query
    select
      v_account_id,
      'selection_required'::text,
      v_property_count,
      null::uuid,
      null::text,
      null::text,
      null::text,
      null::text;
    return;
  end if;

  if v_property_count = 1 then
    select
      property.id,
      property.nickname::text,
      property.address,
      property_type.name::text,
      property_type.display_name::text
    into
      v_property_id,
      v_property_nickname,
      v_property_address,
      v_property_type_name,
      v_property_type_display_name
    from public.properties as property
    join public.property_types as property_type
      on property_type.id = property.property_type_id
    where property.account_id = v_account_id;

    return query
    select
      v_account_id,
      'ready'::text,
      v_property_count,
      v_property_id,
      v_property_nickname,
      v_property_address,
      v_property_type_name,
      v_property_type_display_name;
    return;
  end if;

  -- A null name is the read-only state check used by the dashboard. A supplied
  -- blank name is a failed creation attempt and receives an actionable error.
  if p_nickname is null then
    return query
    select
      v_account_id,
      'needs_property'::text,
      0::bigint,
      null::uuid,
      null::text,
      null::text,
      null::text,
      null::text;
    return;
  end if;

  v_nickname := btrim(p_nickname);
  if length(v_nickname) = 0 then
    raise exception using errcode = '22023', message = 'Property name is required';
  end if;
  if char_length(v_nickname) > 100 then
    raise exception using errcode = '22001', message = 'Property name is too long';
  end if;
  if private.text_has_unsafe_control(v_nickname) then
    raise exception using
      errcode = '22023',
      message = 'Property name contains unsupported characters';
  end if;

  v_address := nullif(btrim(p_address), '');
  if char_length(v_address) > 500 then
    raise exception using errcode = '22001', message = 'Property address is too long';
  end if;
  if private.text_has_unsafe_control(v_address) then
    raise exception using
      errcode = '22023',
      message = 'Property address contains unsupported characters';
  end if;

  v_property_type_name := lower(coalesce(nullif(btrim(p_property_type_name), ''), 'other'));
  select property_type.id, property_type.display_name::text
  into v_property_type_id, v_property_type_display_name
  from public.property_types as property_type
  where property_type.name = v_property_type_name;

  if v_property_type_id is null then
    raise exception using errcode = '22023', message = 'Unknown property type';
  end if;

  -- Re-check write authority after acquiring the account lock. This prevents a
  -- concurrent membership downgrade from becoming property-creation authority.
  if not private.current_user_can_write_account(v_account_id) then
    raise exception using errcode = '42501', message = 'Property write not permitted';
  end if;

  insert into public.properties (
    user_id,
    property_type_id,
    nickname,
    address,
    account_id
  )
  values (
    v_user_id,
    v_property_type_id,
    v_nickname,
    v_address,
    v_account_id
  )
  returning id into v_property_id;

  return query
  select
    v_account_id,
    'ready'::text,
    1::bigint,
    v_property_id,
    v_nickname,
    v_address,
    v_property_type_name,
    v_property_type_display_name;
end;
$function$;

revoke all on function public.resolve_current_property(text, text, text)
from public, anon, authenticated;
grant execute on function public.resolve_current_property(text, text, text)
to authenticated;
