-- Slice 3A.1: replayable plain-text instruction/article foundation.
-- This migration is only for an isolated local/test Supabase project while
-- docs/restart/DATA_MIGRATION_DECISION.md remains pending.

-- This is a fresh slice layered on the isolated 2A.1, 2B.1, and 2C.1
-- baselines. It is not an additive migration for the richer live article
-- schema. Fail before changing any instruction-boundary object when an earlier
-- or partial implementation exists.
do $guard$
declare
  v_actual_columns text[];
begin
  if pg_catalog.to_regclass('public.item_articles') is not null
    or pg_catalog.to_regclass('public.item_articles_pkey') is not null
    or pg_catalog.to_regclass('public.item_articles_item_creation_request_unique') is not null
    or pg_catalog.to_regclass('public.item_articles_item_display_order_unique') is not null
    or pg_catalog.to_regclass('public.idx_item_articles_item_id') is not null
    or pg_catalog.to_regclass('public.idx_item_articles_item_order') is not null
    or pg_catalog.to_regclass('public.idx_item_articles_source_language') is not null
    or pg_catalog.to_regprocedure('private.trim_instruction_text(text)') is not null
    or pg_catalog.to_regprocedure('private.instruction_body_has_unsafe_control(text)') is not null
    or pg_catalog.to_regprocedure('private.current_user_is_item_member(uuid)') is not null
  then
    raise exception using
      errcode = '55000',
      message = 'Slice 3A.1 requires an empty isolated instruction boundary';
  end if;

  if pg_catalog.to_regclass('auth.users') is null
    or pg_catalog.to_regclass('public.users') is null
    or pg_catalog.to_regclass('public.accounts') is null
    or pg_catalog.to_regclass('public.account_users') is null
    or pg_catalog.to_regclass('public.property_types') is null
    or pg_catalog.to_regclass('public.properties') is null
    or pg_catalog.to_regclass('public.items') is null
    or pg_catalog.to_regprocedure('auth.uid()') is null
    or pg_catalog.to_regprocedure('public.update_updated_at_column()') is null
    or pg_catalog.to_regprocedure('private.current_user_is_account_member(uuid)') is null
    or pg_catalog.to_regprocedure('private.current_user_can_write_account(uuid)') is null
    or pg_catalog.to_regprocedure('private.text_has_unsafe_control(text)') is null
    or pg_catalog.to_regprocedure('public.resolve_current_property(text,text,text)') is null
    or pg_catalog.to_regprocedure('private.current_user_is_property_member(uuid)') is null
    or pg_catalog.to_regprocedure('public.create_current_item(uuid,uuid,text)') is null
    or pg_catalog.to_regprocedure('public.read_public_item(uuid)') is null
    or not exists (select 1 from pg_catalog.pg_roles where rolname = 'anon')
    or not exists (select 1 from pg_catalog.pg_roles where rolname = 'authenticated')
  then
    raise exception using
      errcode = '55000',
      message = 'Slice 3A.1 requires the isolated Slice 2A.1, 2B.1, and 2C.1 baselines';
  end if;

  -- Verify the complete public column boundaries inherited from each isolated
  -- slice (plus the two auth columns composed by the inherited RPCs).
  -- This prevents a same-name legacy or partial table from satisfying the
  -- ordered migration contract.
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
  then
    raise exception using
      errcode = '55000',
      message = 'Slice 3A.1 auth columns do not match the isolated baselines';
  end if;

  select pg_catalog.array_agg(
    attribute.attname || ':'
    || pg_catalog.format_type(attribute.atttypid, attribute.atttypmod) || ':'
    || attribute.attnotnull::text
    order by attribute.attnum
  )
  into v_actual_columns
  from pg_catalog.pg_attribute as attribute
  where attribute.attrelid = 'public.users'::regclass
    and attribute.attnum > 0
    and not attribute.attisdropped;

  if v_actual_columns is distinct from array[
      'id:uuid:true',
      'email:text:true',
      'full_name:text:false',
      'role:text:true',
      'created_at:timestamp with time zone:true',
      'updated_at:timestamp with time zone:true',
      'is_admin:boolean:true',
      'profile_picture:text:false',
      'auth_provider:text:true'
    ]::text[]
  then
    raise exception using
      errcode = '55000',
      message = 'Slice 3A.1 user columns do not match Slice 2A.1';
  end if;

  select pg_catalog.array_agg(
    attribute.attname || ':'
    || pg_catalog.format_type(attribute.atttypid, attribute.atttypmod) || ':'
    || attribute.attnotnull::text
    order by attribute.attnum
  )
  into v_actual_columns
  from pg_catalog.pg_attribute as attribute
  where attribute.attrelid = 'public.accounts'::regclass
    and attribute.attnum > 0
    and not attribute.attisdropped;

  if v_actual_columns is distinct from array[
      'id:uuid:true',
      'owner_id:uuid:true',
      'name:character varying(100):true',
      'description:text:false',
      'settings:jsonb:true',
      'created_at:timestamp with time zone:true',
      'updated_at:timestamp with time zone:true'
    ]::text[]
  then
    raise exception using
      errcode = '55000',
      message = 'Slice 3A.1 account columns do not match Slice 2A.1';
  end if;

  select pg_catalog.array_agg(
    attribute.attname || ':'
    || pg_catalog.format_type(attribute.atttypid, attribute.atttypmod) || ':'
    || attribute.attnotnull::text
    order by attribute.attnum
  )
  into v_actual_columns
  from pg_catalog.pg_attribute as attribute
  where attribute.attrelid = 'public.account_users'::regclass
    and attribute.attnum > 0
    and not attribute.attisdropped;

  if v_actual_columns is distinct from array[
      'account_id:uuid:true',
      'user_id:uuid:true',
      'role:character varying(20):true',
      'invited_at:timestamp with time zone:false',
      'joined_at:timestamp with time zone:false',
      'created_at:timestamp with time zone:true'
    ]::text[]
  then
    raise exception using
      errcode = '55000',
      message = 'Slice 3A.1 membership columns do not match Slice 2A.1';
  end if;

  select pg_catalog.array_agg(
    attribute.attname || ':'
    || pg_catalog.format_type(attribute.atttypid, attribute.atttypmod) || ':'
    || attribute.attnotnull::text
    order by attribute.attnum
  )
  into v_actual_columns
  from pg_catalog.pg_attribute as attribute
  where attribute.attrelid = 'public.property_types'::regclass
    and attribute.attnum > 0
    and not attribute.attisdropped;

  if v_actual_columns is distinct from array[
      'id:uuid:true',
      'name:character varying(40):true',
      'display_name:character varying(80):true',
      'description:text:false',
      'created_at:timestamp with time zone:true'
    ]::text[]
  then
    raise exception using
      errcode = '55000',
      message = 'Slice 3A.1 property-type columns do not match Slice 2B.1';
  end if;

  select pg_catalog.array_agg(
    attribute.attname || ':'
    || pg_catalog.format_type(attribute.atttypid, attribute.atttypmod) || ':'
    || attribute.attnotnull::text
    order by attribute.attnum
  )
  into v_actual_columns
  from pg_catalog.pg_attribute as attribute
  where attribute.attrelid = 'public.properties'::regclass
    and attribute.attnum > 0
    and not attribute.attisdropped;

  if v_actual_columns is distinct from array[
      'id:uuid:true',
      'user_id:uuid:true',
      'property_type_id:uuid:true',
      'nickname:character varying(100):true',
      'address:text:false',
      'created_at:timestamp with time zone:true',
      'updated_at:timestamp with time zone:true',
      'account_id:uuid:true'
    ]::text[]
  then
    raise exception using
      errcode = '55000',
      message = 'Slice 3A.1 property columns do not match Slice 2B.1';
  end if;

  select pg_catalog.array_agg(
    attribute.attname || ':'
    || pg_catalog.format_type(attribute.atttypid, attribute.atttypmod) || ':'
    || attribute.attnotnull::text
    order by attribute.attnum
  )
  into v_actual_columns
  from pg_catalog.pg_attribute as attribute
  where attribute.attrelid = 'public.items'::regclass
    and attribute.attnum > 0
    and not attribute.attisdropped;

  if v_actual_columns is distinct from array[
      'id:uuid:true',
      'public_id:uuid:true',
      'property_id:uuid:true',
      'creation_request_id:uuid:true',
      'name:character varying(120):true',
      'description:text:false',
      'published_at:timestamp with time zone:false',
      'created_at:timestamp with time zone:true',
      'updated_at:timestamp with time zone:true'
    ]::text[]
  then
    raise exception using
      errcode = '55000',
      message = 'Slice 3A.1 item columns do not match Slice 2C.1';
  end if;

  -- Verify the exact parent keys and cascade chain used by article ownership.
  if not exists (
      select 1
      from pg_catalog.pg_constraint as key_constraint
      where key_constraint.conrelid = 'public.accounts'::regclass
        and key_constraint.contype = 'p'
        and key_constraint.conkey = array[
          (select attnum from pg_catalog.pg_attribute where attrelid = 'public.accounts'::regclass and attname = 'id')
        ]::smallint[]
    )
    or not exists (
      select 1
      from pg_catalog.pg_constraint as key_constraint
      where key_constraint.conrelid = 'public.account_users'::regclass
        and key_constraint.contype = 'p'
        and key_constraint.conkey = array[
          (select attnum from pg_catalog.pg_attribute where attrelid = 'public.account_users'::regclass and attname = 'account_id'),
          (select attnum from pg_catalog.pg_attribute where attrelid = 'public.account_users'::regclass and attname = 'user_id')
        ]::smallint[]
    )
    or not exists (
      select 1
      from pg_catalog.pg_constraint as key_constraint
      where key_constraint.conrelid = 'public.properties'::regclass
        and key_constraint.contype = 'p'
        and key_constraint.conkey = array[
          (select attnum from pg_catalog.pg_attribute where attrelid = 'public.properties'::regclass and attname = 'id')
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
          (select attnum from pg_catalog.pg_attribute where attrelid = 'public.properties'::regclass and attname = 'account_id')
        ]::smallint[]
        and key_constraint.confkey = array[
          (select attnum from pg_catalog.pg_attribute where attrelid = 'public.accounts'::regclass and attname = 'id')
        ]::smallint[]
    )
    or not exists (
      select 1
      from pg_catalog.pg_constraint as key_constraint
      where key_constraint.conrelid = 'public.items'::regclass
        and key_constraint.contype = 'p'
        and key_constraint.conkey = array[
          (select attnum from pg_catalog.pg_attribute where attrelid = 'public.items'::regclass and attname = 'id')
        ]::smallint[]
    )
    or not exists (
      select 1
      from pg_catalog.pg_constraint as key_constraint
      where key_constraint.conrelid = 'public.items'::regclass
        and key_constraint.confrelid = 'public.properties'::regclass
        and key_constraint.contype = 'f'
        and key_constraint.confdeltype = 'c'
        and key_constraint.conkey = array[
          (select attnum from pg_catalog.pg_attribute where attrelid = 'public.items'::regclass and attname = 'property_id')
        ]::smallint[]
        and key_constraint.confkey = array[
          (select attnum from pg_catalog.pg_attribute where attrelid = 'public.properties'::regclass and attname = 'id')
        ]::smallint[]
    )
  then
    raise exception using
      errcode = '55000',
      message = 'Slice 3A.1 prerequisite keys do not match the isolated baselines';
  end if;

  -- Require the inherited RLS and fixed-path execution traits used by this
  -- policy boundary. Do not infer safety from object names alone.
  if not (
      select app_user.relrowsecurity
        and account.relrowsecurity
        and membership.relrowsecurity
        and property_type.relrowsecurity
        and property.relrowsecurity
        and item.relrowsecurity
      from pg_catalog.pg_class as app_user
      cross join pg_catalog.pg_class as account
      cross join pg_catalog.pg_class as membership
      cross join pg_catalog.pg_class as property_type
      cross join pg_catalog.pg_class as property
      cross join pg_catalog.pg_class as item
      where app_user.oid = 'public.users'::regclass
        and account.oid = 'public.accounts'::regclass
        and membership.oid = 'public.account_users'::regclass
        and property_type.oid = 'public.property_types'::regclass
        and property.oid = 'public.properties'::regclass
        and item.oid = 'public.items'::regclass
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
      where membership_helper.oid = 'private.current_user_is_account_member(uuid)'::regprocedure
    )
    or not (
      select
        property_helper.prosecdef
        and property_helper.prorettype = 'pg_catalog.bool'::regtype
        and property_helper.proconfig = array['search_path=pg_catalog']::text[]
      from pg_catalog.pg_proc as property_helper
      where property_helper.oid = 'private.current_user_is_property_member(uuid)'::regprocedure
    )
    or not (
      select
        create_rpc.prosecdef
        and create_rpc.proconfig = array['search_path=pg_catalog']::text[]
      from pg_catalog.pg_proc as create_rpc
      where create_rpc.oid = 'public.create_current_item(uuid,uuid,text)'::regprocedure
    )
    or not (
      select
        read_rpc.prosecdef
        and read_rpc.provolatile = 's'
        and read_rpc.proconfig = array['search_path=pg_catalog']::text[]
      from pg_catalog.pg_proc as read_rpc
      where read_rpc.oid = 'public.read_public_item(uuid)'::regprocedure
    )
    or not (
      select auth_uid.prorettype = 'pg_catalog.uuid'::regtype
      from pg_catalog.pg_proc as auth_uid
      where auth_uid.oid = 'auth.uid()'::regprocedure
    )
  then
    raise exception using
      errcode = '55000',
      message = 'Slice 3A.1 prerequisite security traits do not match the isolated baselines';
  end if;
end;
$guard$;

-- Source: Unicode 17.0 UCD PropList.txt, property White_Space.
-- Unicode 17.0 White_Space is intentionally enumerated instead of relying on
-- database locale or regular-expression behavior: TAB..CR, SPACE, NEL, NBSP,
-- OGHAM SPACE MARK, U+2000..U+200A, LINE/PARAGRAPH SEPARATOR, NARROW NBSP,
-- MEDIUM MATHEMATICAL SPACE, and IDEOGRAPHIC SPACE. Both titles and bodies use
-- this immutable fixed-path boundary for nonblank and outer-trim enforcement.
create or replace function private.trim_instruction_text(p_value text)
returns text
language sql
immutable
strict
security invoker
set search_path = pg_catalog
as $function$
  select pg_catalog.btrim(
    p_value,
    pg_catalog.chr(9)
      || pg_catalog.chr(10)
      || pg_catalog.chr(11)
      || pg_catalog.chr(12)
      || pg_catalog.chr(13)
      || pg_catalog.chr(32)
      || pg_catalog.chr(133)
      || pg_catalog.chr(160)
      || pg_catalog.chr(5760)
      || pg_catalog.chr(8192)
      || pg_catalog.chr(8193)
      || pg_catalog.chr(8194)
      || pg_catalog.chr(8195)
      || pg_catalog.chr(8196)
      || pg_catalog.chr(8197)
      || pg_catalog.chr(8198)
      || pg_catalog.chr(8199)
      || pg_catalog.chr(8200)
      || pg_catalog.chr(8201)
      || pg_catalog.chr(8202)
      || pg_catalog.chr(8232)
      || pg_catalog.chr(8233)
      || pg_catalog.chr(8239)
      || pg_catalog.chr(8287)
      || pg_catalog.chr(12288)
  );
$function$;

revoke all on function private.trim_instruction_text(text)
from public, anon, authenticated;

-- Titles additionally use the stricter single-line C0/C1 helper inherited
-- from Slice 2B.1. Bodies intentionally permit horizontal tab and line feed.
-- Source: Unicode 17.0 UCD extracted/DerivedGeneralCategory.txt, Cf section.
-- Both reject the complete Unicode 17.0 General_Category=Cf set (170 code
-- points), explicitly enumerated below including supplementary-plane format
-- and tag controls. U+2028/U+2029 are rejected as format separators too.
create or replace function private.instruction_body_has_unsafe_control(
  p_value text
)
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
    where (
        pg_catalog.ascii(
          pg_catalog.substr(p_value, character.position, 1)
        ) between 0 and 31
        and pg_catalog.ascii(
          pg_catalog.substr(p_value, character.position, 1)
        ) not in (9, 10)
      )
      or pg_catalog.ascii(
        pg_catalog.substr(p_value, character.position, 1)
      ) between 127 and 159
      -- Unicode 17.0 Cf: U+00AD, U+0600..0605, U+061C, U+06DD,
      -- U+070F, U+0890..0891, U+08E2, U+180E, U+200B..200F,
      -- U+202A..202E, U+2060..2064, U+2066..206F, U+FEFF,
      -- U+FFF9..FFFB, U+110BD, U+110CD, U+13430..1343F,
      -- U+1BCA0..1BCA3, U+1D173..1D17A, U+E0001, U+E0020..E007F.
      or pg_catalog.ascii(
        pg_catalog.substr(p_value, character.position, 1)
      ) in (173, 1564, 1757, 1807, 2274, 6158, 65279, 69821, 69837, 917505)
      or pg_catalog.ascii(
        pg_catalog.substr(p_value, character.position, 1)
      ) between 1536 and 1541
      or pg_catalog.ascii(
        pg_catalog.substr(p_value, character.position, 1)
      ) between 2192 and 2193
      or pg_catalog.ascii(
        pg_catalog.substr(p_value, character.position, 1)
      ) between 8203 and 8207
      -- U+2028/U+2029 are Zl/Zp format separators; U+202A..202E are Cf.
      or pg_catalog.ascii(
        pg_catalog.substr(p_value, character.position, 1)
      ) between 8232 and 8238
      or pg_catalog.ascii(
        pg_catalog.substr(p_value, character.position, 1)
      ) between 8288 and 8292
      or pg_catalog.ascii(
        pg_catalog.substr(p_value, character.position, 1)
      ) between 8294 and 8303
      or pg_catalog.ascii(
        pg_catalog.substr(p_value, character.position, 1)
      ) between 65529 and 65531
      or pg_catalog.ascii(
        pg_catalog.substr(p_value, character.position, 1)
      ) between 78896 and 78911
      or pg_catalog.ascii(
        pg_catalog.substr(p_value, character.position, 1)
      ) between 113824 and 113827
      or pg_catalog.ascii(
        pg_catalog.substr(p_value, character.position, 1)
      ) between 119155 and 119162
      or pg_catalog.ascii(
        pg_catalog.substr(p_value, character.position, 1)
      ) between 917536 and 917631
  );
$function$;

revoke all on function private.instruction_body_has_unsafe_control(text)
from public, anon, authenticated;

create table public.item_articles (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.items(id) on delete cascade,
  creation_request_id uuid not null,
  purpose varchar(40) not null default 'instructions',
  title varchar(120) not null,
  description text not null,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint item_articles_item_creation_request_unique unique (
    item_id,
    creation_request_id
  ),
  constraint item_articles_item_display_order_unique unique (
    item_id,
    display_order
  ),
  constraint item_articles_purpose_instructions_only check (
    purpose = 'instructions'
  ),
  constraint item_articles_title_normalized_not_blank check (
    title = private.trim_instruction_text(title)
    and length(private.trim_instruction_text(title)) > 0
  ),
  constraint item_articles_title_safe_text check (
    not private.text_has_unsafe_control(title)
    and not private.instruction_body_has_unsafe_control(title)
  ),
  constraint item_articles_description_normalized_not_blank check (
    description = private.trim_instruction_text(description)
    and length(private.trim_instruction_text(description)) > 0
    and char_length(description) <= 8000
  ),
  constraint item_articles_description_safe_text check (
    not private.instruction_body_has_unsafe_control(description)
  ),
  constraint item_articles_display_order_nonnegative check (
    display_order >= 0
  )
);

create trigger update_item_articles_updated_at
before update on public.item_articles
for each row execute function public.update_updated_at_column();

create or replace function private.current_user_is_item_member(p_item_id uuid)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog
as $function$
  select exists (
    select 1
    from public.items as item
    join public.properties as property
      on property.id = item.property_id
    join public.account_users as membership
      on membership.account_id = property.account_id
    where item.id = p_item_id
      and membership.user_id = auth.uid()
  );
$function$;

revoke all on function private.current_user_is_item_member(uuid)
from public, anon, authenticated;
grant execute on function private.current_user_is_item_member(uuid)
to authenticated;

alter table public.item_articles enable row level security;

create policy item_articles_select_item_membership
on public.item_articles for select
to authenticated
using (private.current_user_is_item_member(item_id));

-- This slice adds storage and same-account host reads only. There is no client
-- creation/editing RPC, publication transition, or anonymous reader yet.
revoke all on table public.item_articles from public, anon, authenticated;
grant select on table public.item_articles to authenticated;

comment on table public.item_articles is
  'Isolated Slice 3A.1 plain-text instruction storage; not yet publicly readable or client-writable.';
comment on column public.item_articles.creation_request_id is
  'Reserved idempotency identity for the later narrow instruction-creation RPC.';
comment on column public.item_articles.purpose is
  'Server-owned discriminator constrained to instructions in P0.';
comment on column public.item_articles.description is
  'Canonical Instruction DTO body representation; source_language is deliberately deferred.';
