-- Slice 2C.1: replayable item and public-identity foundation.
-- This migration is only for an isolated local/test Supabase project while
-- docs/restart/DATA_MIGRATION_DECISION.md remains pending.

-- This is a fresh slice layered on the isolated 2A.1 and 2B.1 baselines. It is
-- not an additive migration for the live project. Fail before changing any
-- item-boundary object when an earlier or partial implementation exists.
do $guard$
begin
  if pg_catalog.to_regclass('public.items') is not null
    or pg_catalog.to_regclass('public.items_pkey') is not null
    or pg_catalog.to_regclass('public.items_public_id_unique') is not null
    or pg_catalog.to_regclass('public.items_property_creation_request_unique') is not null
    or pg_catalog.to_regclass('public.idx_items_property_id') is not null
    or pg_catalog.to_regclass('public.idx_items_public_id') is not null
    or pg_catalog.to_regprocedure('public.create_current_item(uuid,uuid,text)') is not null
    or pg_catalog.to_regprocedure('public.read_public_item(uuid)') is not null
    or pg_catalog.to_regprocedure('private.current_user_is_property_member(uuid)') is not null
  then
    raise exception using
      errcode = '55000',
      message = 'Slice 2C.1 requires an empty isolated item boundary';
  end if;

  -- Require the complete ordered identity/account and property foundations
  -- before creating even the first 2C.1 helper. This prevents a partial item
  -- boundary during a manual or non-transactional out-of-order replay.
  if pg_catalog.to_regclass('auth.users') is null
    or pg_catalog.to_regclass('public.users') is null
    or pg_catalog.to_regclass('public.accounts') is null
    or pg_catalog.to_regclass('public.account_users') is null
    or pg_catalog.to_regclass('public.property_types') is null
    or pg_catalog.to_regclass('public.properties') is null
    or pg_catalog.to_regprocedure('public.update_updated_at_column()') is null
    or pg_catalog.to_regprocedure('private.current_user_is_account_member(uuid)') is null
    or pg_catalog.to_regprocedure('private.current_user_can_write_account(uuid)') is null
    or pg_catalog.to_regprocedure('private.text_has_unsafe_control(text)') is null
    or pg_catalog.to_regprocedure('public.resolve_current_property(text,text,text)') is null
    or pg_catalog.to_regprocedure('auth.uid()') is null
    or not exists (select 1 from pg_catalog.pg_roles where rolname = 'anon')
    or not exists (select 1 from pg_catalog.pg_roles where rolname = 'authenticated')
  then
    raise exception using
      errcode = '55000',
      message = 'Slice 2C.1 requires the isolated Slice 2A.1 and 2B.1 baselines';
  end if;

  -- Names alone are not a safe prerequisite. Verify the exact auth, property,
  -- and membership columns this slice reads before creating any item object.
  if not exists (
      select 1
      from pg_catalog.pg_attribute as attribute
      where attribute.attrelid = 'auth.users'::regclass
        and attribute.attname = 'id'
        and attribute.atttypid = 'pg_catalog.uuid'::regtype
        and attribute.attnotnull
        and not attribute.attisdropped
    )
    or not exists (
      select 1
      from pg_catalog.pg_attribute as attribute
      where attribute.attrelid = 'auth.users'::regclass
        and attribute.attname = 'email_confirmed_at'
        and attribute.atttypid = 'pg_catalog.timestamptz'::regtype
        and not attribute.attisdropped
    )
    or not exists (
      select 1
      from pg_catalog.pg_attribute as attribute
      where attribute.attrelid = 'public.properties'::regclass
        and attribute.attname = 'id'
        and attribute.atttypid = 'pg_catalog.uuid'::regtype
        and attribute.attnotnull
        and not attribute.attisdropped
    )
    or not exists (
      select 1
      from pg_catalog.pg_attribute as attribute
      where attribute.attrelid = 'public.properties'::regclass
        and attribute.attname = 'account_id'
        and attribute.atttypid = 'pg_catalog.uuid'::regtype
        and attribute.attnotnull
        and not attribute.attisdropped
    )
    or not exists (
      select 1
      from pg_catalog.pg_attribute as attribute
      where attribute.attrelid = 'public.account_users'::regclass
        and attribute.attname = 'account_id'
        and attribute.atttypid = 'pg_catalog.uuid'::regtype
        and attribute.attnotnull
        and not attribute.attisdropped
    )
    or not exists (
      select 1
      from pg_catalog.pg_attribute as attribute
      where attribute.attrelid = 'public.account_users'::regclass
        and attribute.attname = 'user_id'
        and attribute.atttypid = 'pg_catalog.uuid'::regtype
        and attribute.attnotnull
        and not attribute.attisdropped
    )
    or not exists (
      select 1
      from pg_catalog.pg_attribute as attribute
      where attribute.attrelid = 'public.account_users'::regclass
        and attribute.attname = 'role'
        and attribute.atttypid = 'pg_catalog.varchar'::regtype
        and attribute.atttypmod = 24
        and attribute.attnotnull
        and not attribute.attisdropped
    )
  then
    raise exception using
      errcode = '55000',
      message = 'Slice 2C.1 prerequisite columns do not match the isolated baselines';
  end if;

  -- Verify the tenant keys and delete semantics used by the new foreign key and
  -- membership lock. Attribute arrays make column order explicit.
  if not exists (
      select 1
      from pg_catalog.pg_constraint as key_constraint
      where key_constraint.conrelid = 'public.properties'::regclass
        and key_constraint.contype = 'p'
        and key_constraint.conkey = array[
          (
            select attribute.attnum
            from pg_catalog.pg_attribute as attribute
            where attribute.attrelid = 'public.properties'::regclass
              and attribute.attname = 'id'
          )
        ]::smallint[]
    )
    or not exists (
      select 1
      from pg_catalog.pg_constraint as key_constraint
      where key_constraint.conrelid = 'public.properties'::regclass
        and key_constraint.confrelid = 'public.accounts'::regclass
        and key_constraint.contype = 'f'
        and key_constraint.confdeltype = 'c'
        and key_constraint.conkey = array[
          (
            select attribute.attnum
            from pg_catalog.pg_attribute as attribute
            where attribute.attrelid = 'public.properties'::regclass
              and attribute.attname = 'account_id'
          )
        ]::smallint[]
        and key_constraint.confkey = array[
          (
            select attribute.attnum
            from pg_catalog.pg_attribute as attribute
            where attribute.attrelid = 'public.accounts'::regclass
              and attribute.attname = 'id'
          )
        ]::smallint[]
    )
    or not exists (
      select 1
      from pg_catalog.pg_constraint as key_constraint
      where key_constraint.conrelid = 'public.account_users'::regclass
        and key_constraint.contype = 'p'
        and key_constraint.conkey = array[
          (
            select attribute.attnum
            from pg_catalog.pg_attribute as attribute
            where attribute.attrelid = 'public.account_users'::regclass
              and attribute.attname = 'account_id'
          ),
          (
            select attribute.attnum
            from pg_catalog.pg_attribute as attribute
            where attribute.attrelid = 'public.account_users'::regclass
              and attribute.attname = 'user_id'
          )
        ]::smallint[]
    )
  then
    raise exception using
      errcode = '55000',
      message = 'Slice 2C.1 prerequisite keys do not match the isolated baselines';
  end if;

  -- Verify the prior RLS and fixed-path function traits this security boundary
  -- composes. This rejects same-name shims with weaker execution behavior.
  if not (
      select property.relrowsecurity and membership.relrowsecurity
      from pg_catalog.pg_class as property
      cross join pg_catalog.pg_class as membership
      where property.oid = 'public.properties'::regclass
        and membership.oid = 'public.account_users'::regclass
    )
    or not (
      select
        not trigger_function.prosecdef
        and trigger_function.prorettype = 'pg_catalog.trigger'::regtype
        and trigger_function.proconfig = array['search_path=pg_catalog']::text[]
      from pg_catalog.pg_proc as trigger_function
      where trigger_function.oid = 'public.update_updated_at_column()'::regprocedure
    )
    or not (
      select
        not text_helper.prosecdef
        and text_helper.prorettype = 'pg_catalog.bool'::regtype
        and text_helper.provolatile = 'i'
        and text_helper.proconfig = array['search_path=pg_catalog']::text[]
      from pg_catalog.pg_proc as text_helper
      where text_helper.oid = 'private.text_has_unsafe_control(text)'::regprocedure
    )
    or not (
      select
        membership_helper.prosecdef
        and membership_helper.prorettype = 'pg_catalog.bool'::regtype
        and membership_helper.proconfig = array['search_path=pg_catalog']::text[]
      from pg_catalog.pg_proc as membership_helper
      where membership_helper.oid =
        'private.current_user_is_account_member(uuid)'::regprocedure
    )
    or not (
      select
        write_helper.prosecdef
        and write_helper.prorettype = 'pg_catalog.bool'::regtype
        and write_helper.proconfig = array['search_path=pg_catalog']::text[]
      from pg_catalog.pg_proc as write_helper
      where write_helper.oid =
        'private.current_user_can_write_account(uuid)'::regprocedure
    )
    or not (
      select
        property_rpc.prosecdef
        and property_rpc.proconfig = array['search_path=pg_catalog']::text[]
      from pg_catalog.pg_proc as property_rpc
      where property_rpc.oid =
        'public.resolve_current_property(text,text,text)'::regprocedure
    )
    or not (
      select auth_uid.prorettype = 'pg_catalog.uuid'::regtype
      from pg_catalog.pg_proc as auth_uid
      where auth_uid.oid = 'auth.uid()'::regprocedure
    )
  then
    raise exception using
      errcode = '55000',
      message = 'Slice 2C.1 prerequisite security traits do not match the isolated baselines';
  end if;
end;
$guard$;

create table public.items (
  id uuid primary key default gen_random_uuid(),
  public_id uuid not null default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  creation_request_id uuid not null,
  name varchar(120) not null,
  description text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint items_public_id_unique unique (public_id),
  constraint items_property_creation_request_unique unique (
    property_id,
    creation_request_id
  ),
  constraint items_name_normalized_not_blank check (
    name = btrim(name)
    and length(name) > 0
  ),
  constraint items_name_safe_text check (
    not private.text_has_unsafe_control(name)
  )
);

create trigger update_items_updated_at
before update on public.items
for each row execute function public.update_updated_at_column();

create or replace function private.current_user_is_property_member(
  p_property_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog
as $function$
  select exists (
    select 1
    from public.properties as property
    join public.account_users as membership
      on membership.account_id = property.account_id
    where property.id = p_property_id
      and membership.user_id = auth.uid()
  );
$function$;

revoke all on function private.current_user_is_property_member(uuid)
from public, anon, authenticated;
grant execute on function private.current_user_is_property_member(uuid)
to authenticated;

alter table public.items enable row level security;

create policy items_select_property_membership
on public.items for select
to authenticated
using (private.current_user_is_property_member(property_id));

-- Item writes are RPC-only in this slice. In particular there is no client
-- path that can set published_at. A later instruction/publication migration
-- must add the narrow publication RPC after it can require useful content.
revoke all on table public.items from public, anon, authenticated;
grant select on table public.items to authenticated;

create or replace function public.create_current_item(
  p_property_id uuid,
  p_request_id uuid,
  p_name text
)
returns table (
  public_id uuid,
  property_id uuid,
  name text
)
language plpgsql
security definer
set search_path = pg_catalog
as $function$
declare
  v_user_id uuid := auth.uid();
  v_account_id uuid;
  v_name text;
  v_public_id uuid;
  v_existing_name text;
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

  if p_property_id is null then
    raise exception using errcode = '22023', message = 'Property is required';
  end if;

  if p_request_id is null then
    raise exception using errcode = '22023', message = 'Creation request is required';
  end if;

  v_name := btrim(p_name);
  if v_name is null or length(v_name) = 0 then
    raise exception using errcode = '22023', message = 'Item name is required';
  end if;
  if char_length(v_name) > 120 then
    raise exception using errcode = '22001', message = 'Item name is too long';
  end if;
  if private.text_has_unsafe_control(v_name) then
    raise exception using
      errcode = '22023',
      message = 'Item name contains unsupported characters';
  end if;

  -- The property ID is a hint, never tenant authority. Derive its account and
  -- lock the current user's membership row before treating it as writable.
  select property.account_id
  into v_account_id
  from public.properties as property
  join public.account_users as membership
    on membership.account_id = property.account_id
  where property.id = p_property_id
    and membership.user_id = v_user_id
    and membership.role in ('owner', 'admin', 'member')
  for update of membership;

  if v_account_id is null then
    raise exception using errcode = 'P0002', message = 'Writable property not found';
  end if;

  -- The unique property/request key is both the retry identity and the
  -- concurrency serialization point. ON CONFLICT waits for an in-flight row,
  -- then the comparison below accepts only the same normalized payload.
  insert into public.items as item (
    property_id,
    creation_request_id,
    name
  )
  values (
    p_property_id,
    p_request_id,
    v_name
  )
  on conflict on constraint items_property_creation_request_unique do nothing
  returning item.public_id into v_public_id;

  if v_public_id is null then
    select item.public_id, item.name::text
    into v_public_id, v_existing_name
    from public.items as item
    where item.property_id = p_property_id
      and item.creation_request_id = p_request_id;

    if v_public_id is null or v_existing_name is distinct from v_name then
      raise exception using
        errcode = '22023',
        message = 'Creation request conflicts with another item';
    end if;
  end if;

  return query
  select v_public_id, p_property_id, v_name;
end;
$function$;

revoke all on function public.create_current_item(uuid, uuid, text)
from public, anon, authenticated;
grant execute on function public.create_current_item(uuid, uuid, text)
to authenticated;

create or replace function public.read_public_item(p_public_id uuid)
returns table (
  public_id uuid,
  name text
)
language sql
stable
security definer
set search_path = pg_catalog
as $function$
  select item.public_id, item.name::text
  from public.items as item
  where item.public_id = p_public_id
    and item.published_at is not null;
$function$;

revoke all on function public.read_public_item(uuid)
from public, anon, authenticated;
grant execute on function public.read_public_item(uuid)
to anon, authenticated;

comment on column public.items.description is
  'Compatibility field only in Slice 2C.1; item creation does not accept it.';
comment on column public.items.published_at is
  'Null draft marker. Only a later instruction-aware publication RPC may set it.';
comment on function public.create_current_item(uuid, uuid, text) is
  'Creates one draft item from server-validated property membership with idempotent retry.';
comment on function public.read_public_item(uuid) is
  'Returns only the allow-listed identity of a published guest item.';
