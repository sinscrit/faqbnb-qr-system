-- Slice 3A.2 (database half): atomic item + first instruction publication.
-- This isolated migration must not be deployed independently of the matching
-- application/public-projection half. It never targets the live project.

do $guard$
declare
  v_actual_columns text[];
begin
  if exists (
      select 1
      from pg_catalog.pg_proc as candidate
      join pg_catalog.pg_namespace as namespace
        on namespace.oid = candidate.pronamespace
      where namespace.nspname = 'public'
        and candidate.proname = 'publish_current_item_with_instruction'
    )
  then
    raise exception using
      errcode = '55000',
      message = 'Slice 3A.2 requires an empty isolated publication boundary';
  end if;

  if pg_catalog.to_regclass('auth.users') is null
    or pg_catalog.to_regclass('public.users') is null
    or pg_catalog.to_regclass('public.accounts') is null
    or pg_catalog.to_regclass('public.account_users') is null
    or pg_catalog.to_regclass('public.property_types') is null
    or pg_catalog.to_regclass('public.properties') is null
    or pg_catalog.to_regclass('public.items') is null
    or pg_catalog.to_regclass('public.item_articles') is null
    or pg_catalog.to_regprocedure('auth.uid()') is null
    or pg_catalog.to_regprocedure('private.current_user_is_account_member(uuid)') is null
    or pg_catalog.to_regprocedure('private.current_user_can_write_account(uuid)') is null
    or pg_catalog.to_regprocedure('private.current_user_is_property_member(uuid)') is null
    or pg_catalog.to_regprocedure('private.current_user_is_item_member(uuid)') is null
    or pg_catalog.to_regprocedure('private.text_has_unsafe_control(text)') is null
    or pg_catalog.to_regprocedure('private.trim_instruction_text(text)') is null
    or pg_catalog.to_regprocedure('private.instruction_body_has_unsafe_control(text)') is null
    or pg_catalog.to_regprocedure('public.create_current_item(uuid,uuid,text)') is null
    or pg_catalog.to_regprocedure('public.read_public_item(uuid)') is null
    or not exists (select 1 from pg_catalog.pg_roles where rolname = 'anon')
    or not exists (select 1 from pg_catalog.pg_roles where rolname = 'authenticated')
  then
    raise exception using
      errcode = '55000',
      message = 'Slice 3A.2 requires the complete isolated Slice 3A.1 baseline';
  end if;

  if not exists (
      select 1 from pg_catalog.pg_attribute as attribute
      where attribute.attrelid = 'auth.users'::regclass
        and attribute.attname = 'id'
        and attribute.atttypid = 'pg_catalog.uuid'::regtype
        and attribute.attnotnull
        and not attribute.attisdropped
    )
    or not exists (
      select 1 from pg_catalog.pg_attribute as attribute
      where attribute.attrelid = 'auth.users'::regclass
        and attribute.attname = 'email_confirmed_at'
        and attribute.atttypid = 'pg_catalog.timestamptz'::regtype
        and not attribute.attisdropped
    )
  then
    raise exception using
      errcode = '55000',
      message = 'Slice 3A.2 auth columns do not match the isolated baseline';
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
      message = 'Slice 3A.2 membership columns do not match Slice 2A.1';
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
      message = 'Slice 3A.2 property columns do not match Slice 2B.1';
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
      message = 'Slice 3A.2 item columns do not match Slice 2C.1';
  end if;

  select pg_catalog.array_agg(
    attribute.attname || ':'
      || pg_catalog.format_type(attribute.atttypid, attribute.atttypmod) || ':'
      || attribute.attnotnull::text
    order by attribute.attnum
  )
  into v_actual_columns
  from pg_catalog.pg_attribute as attribute
  where attribute.attrelid = 'public.item_articles'::regclass
    and attribute.attnum > 0
    and not attribute.attisdropped;

  if v_actual_columns is distinct from array[
      'id:uuid:true',
      'item_id:uuid:true',
      'creation_request_id:uuid:true',
      'purpose:character varying(40):true',
      'title:character varying(120):true',
      'description:text:true',
      'display_order:integer:true',
      'created_at:timestamp with time zone:true',
      'updated_at:timestamp with time zone:true'
    ]::text[]
  then
    raise exception using
      errcode = '55000',
      message = 'Slice 3A.2 instruction columns do not match Slice 3A.1';
  end if;

  if not exists (
      select 1 from pg_catalog.pg_constraint as key_constraint
      where key_constraint.conrelid = 'public.account_users'::regclass
        and key_constraint.contype = 'p'
        and key_constraint.conkey = array[
          (select attnum from pg_catalog.pg_attribute where attrelid = 'public.account_users'::regclass and attname = 'account_id'),
          (select attnum from pg_catalog.pg_attribute where attrelid = 'public.account_users'::regclass and attname = 'user_id')
        ]::smallint[]
    )
    or not exists (
      select 1 from pg_catalog.pg_constraint as key_constraint
      where key_constraint.conrelid = 'public.items'::regclass
        and key_constraint.contype = 'p'
        and key_constraint.conkey = array[
          (select attnum from pg_catalog.pg_attribute where attrelid = 'public.items'::regclass and attname = 'id')
        ]::smallint[]
    )
    or not exists (
      select 1 from pg_catalog.pg_constraint as key_constraint
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
    or not exists (
      select 1 from pg_catalog.pg_constraint as key_constraint
      where key_constraint.conrelid = 'public.items'::regclass
        and key_constraint.conname = 'items_property_creation_request_unique'
        and key_constraint.contype = 'u'
        and key_constraint.conkey = array[
          (select attnum from pg_catalog.pg_attribute where attrelid = 'public.items'::regclass and attname = 'property_id'),
          (select attnum from pg_catalog.pg_attribute where attrelid = 'public.items'::regclass and attname = 'creation_request_id')
        ]::smallint[]
    )
    or not exists (
      select 1 from pg_catalog.pg_constraint as key_constraint
      where key_constraint.conrelid = 'public.item_articles'::regclass
        and key_constraint.contype = 'p'
        and key_constraint.conkey = array[
          (select attnum from pg_catalog.pg_attribute where attrelid = 'public.item_articles'::regclass and attname = 'id')
        ]::smallint[]
    )
    or not exists (
      select 1 from pg_catalog.pg_constraint as key_constraint
      where key_constraint.conrelid = 'public.item_articles'::regclass
        and key_constraint.confrelid = 'public.items'::regclass
        and key_constraint.contype = 'f'
        and key_constraint.confdeltype = 'c'
        and key_constraint.conkey = array[
          (select attnum from pg_catalog.pg_attribute where attrelid = 'public.item_articles'::regclass and attname = 'item_id')
        ]::smallint[]
        and key_constraint.confkey = array[
          (select attnum from pg_catalog.pg_attribute where attrelid = 'public.items'::regclass and attname = 'id')
        ]::smallint[]
    )
    or not exists (
      select 1 from pg_catalog.pg_constraint as key_constraint
      where key_constraint.conrelid = 'public.item_articles'::regclass
        and key_constraint.conname = 'item_articles_item_creation_request_unique'
        and key_constraint.contype = 'u'
        and key_constraint.conkey = array[
          (select attnum from pg_catalog.pg_attribute where attrelid = 'public.item_articles'::regclass and attname = 'item_id'),
          (select attnum from pg_catalog.pg_attribute where attrelid = 'public.item_articles'::regclass and attname = 'creation_request_id')
        ]::smallint[]
    )
    or not exists (
      select 1 from pg_catalog.pg_constraint as key_constraint
      where key_constraint.conrelid = 'public.item_articles'::regclass
        and key_constraint.conname = 'item_articles_item_display_order_unique'
        and key_constraint.contype = 'u'
        and key_constraint.conkey = array[
          (select attnum from pg_catalog.pg_attribute where attrelid = 'public.item_articles'::regclass and attname = 'item_id'),
          (select attnum from pg_catalog.pg_attribute where attrelid = 'public.item_articles'::regclass and attname = 'display_order')
        ]::smallint[]
    )
    or (
      select pg_catalog.array_agg(key_constraint.conname order by key_constraint.conname)
      from pg_catalog.pg_constraint as key_constraint
      where key_constraint.conrelid = 'public.item_articles'::regclass
        and key_constraint.contype = 'c'
        and key_constraint.convalidated
    ) is distinct from array[
      'item_articles_description_normalized_not_blank',
      'item_articles_description_safe_text',
      'item_articles_display_order_nonnegative',
      'item_articles_purpose_instructions_only',
      'item_articles_title_normalized_not_blank',
      'item_articles_title_safe_text'
    ]::name[]
  then
    raise exception using
      errcode = '55000',
      message = 'Slice 3A.2 retry and lock keys do not match the isolated baseline';
  end if;

  if not (
      select membership.relrowsecurity
        and property.relrowsecurity
        and item.relrowsecurity
        and article.relrowsecurity
      from pg_catalog.pg_class as membership
      cross join pg_catalog.pg_class as property
      cross join pg_catalog.pg_class as item
      cross join pg_catalog.pg_class as article
      where membership.oid = 'public.account_users'::regclass
        and property.oid = 'public.properties'::regclass
        and item.oid = 'public.items'::regclass
        and article.oid = 'public.item_articles'::regclass
    )
    or not (
      select helper.proconfig = array['search_path=pg_catalog']::text[]
        and not helper.prosecdef
        and helper.provolatile = 'i'
        and helper.proisstrict
        and helper.prorettype = 'pg_catalog.text'::regtype
        and helper.proowner = article.relowner
      from pg_catalog.pg_proc as helper
      cross join pg_catalog.pg_class as article
      where helper.oid = 'private.trim_instruction_text(text)'::regprocedure
        and article.oid = 'public.item_articles'::regclass
    )
    or not (
      select helper.proconfig = array['search_path=pg_catalog']::text[]
        and not helper.prosecdef
        and helper.provolatile = 'i'
        and not helper.proisstrict
        and helper.prorettype = 'pg_catalog.bool'::regtype
        and helper.proowner = article.relowner
      from pg_catalog.pg_proc as helper
      cross join pg_catalog.pg_class as article
      where helper.oid = 'private.instruction_body_has_unsafe_control(text)'::regprocedure
        and article.oid = 'public.item_articles'::regclass
    )
    or not (
      select helper.proconfig = array['search_path=pg_catalog']::text[]
        and not helper.prosecdef
        and helper.provolatile = 'i'
        and not helper.proisstrict
        and helper.prorettype = 'pg_catalog.bool'::regtype
        and helper.proowner = article.relowner
      from pg_catalog.pg_proc as helper
      cross join pg_catalog.pg_class as article
      where helper.oid = 'private.text_has_unsafe_control(text)'::regprocedure
        and article.oid = 'public.item_articles'::regclass
    )
    or not (
      select pg_catalog.bool_and(
        helper.proconfig = array['search_path=pg_catalog']::text[]
        and helper.prosecdef
        and helper.provolatile = 's'
        and not helper.proisstrict
        and helper.prorettype = 'pg_catalog.bool'::regtype
        and helper.proowner = article.relowner
      )
      from pg_catalog.pg_proc as helper
      cross join pg_catalog.pg_class as article
      where helper.oid in (
          'private.current_user_is_account_member(uuid)'::regprocedure,
          'private.current_user_can_write_account(uuid)'::regprocedure,
          'private.current_user_is_property_member(uuid)'::regprocedure,
          'private.current_user_is_item_member(uuid)'::regprocedure
        )
        and article.oid = 'public.item_articles'::regclass
    )
    or not (
      select rpc.proconfig = array['search_path=pg_catalog']::text[]
        and rpc.prosecdef
        and rpc.provolatile = 'v'
        and not rpc.proisstrict
        and rpc.proretset
        and rpc.prorettype = 'pg_catalog.record'::regtype
        and rpc.proowner = item.relowner
        and rpc.proargnames = array[
          'p_property_id','p_request_id','p_name','public_id','property_id','name'
        ]::text[]
        and rpc.proargmodes = array['i','i','i','t','t','t']::"char"[]
        and rpc.proallargtypes = array[
          'pg_catalog.uuid'::regtype,'pg_catalog.uuid'::regtype,'pg_catalog.text'::regtype,
          'pg_catalog.uuid'::regtype,'pg_catalog.uuid'::regtype,'pg_catalog.text'::regtype
        ]::oid[]
      from pg_catalog.pg_proc as rpc
      cross join pg_catalog.pg_class as item
      where rpc.oid = 'public.create_current_item(uuid,uuid,text)'::regprocedure
        and item.oid = 'public.items'::regclass
    )
    or not (
      select rpc.proconfig = array['search_path=pg_catalog']::text[]
        and rpc.prosecdef
        and rpc.provolatile = 's'
        and not rpc.proisstrict
        and rpc.proretset
        and rpc.prorettype = 'pg_catalog.record'::regtype
        and rpc.proowner = item.relowner
        and rpc.proargnames = array['p_public_id','public_id','name']::text[]
        and rpc.proargmodes = array['i','t','t']::"char"[]
        and rpc.proallargtypes = array[
          'pg_catalog.uuid'::regtype,'pg_catalog.uuid'::regtype,'pg_catalog.text'::regtype
        ]::oid[]
      from pg_catalog.pg_proc as rpc
      cross join pg_catalog.pg_class as item
      where rpc.oid = 'public.read_public_item(uuid)'::regprocedure
        and item.oid = 'public.items'::regclass
    )
    or not (
      select uid_function.prorettype = 'pg_catalog.uuid'::regtype
        and uid_function.provolatile = 's'
      from pg_catalog.pg_proc as uid_function
      where uid_function.oid = 'auth.uid()'::regprocedure
    )
    or exists (
      select 1
      from (
        values
          (
            'private.text_has_unsafe_control(text)'::regprocedure,
            array['owner:EXECUTE:false']::text[]
          ),
          (
            'private.trim_instruction_text(text)'::regprocedure,
            array['owner:EXECUTE:false']::text[]
          ),
          (
            'private.instruction_body_has_unsafe_control(text)'::regprocedure,
            array['owner:EXECUTE:false']::text[]
          ),
          (
            'private.current_user_is_account_member(uuid)'::regprocedure,
            array['authenticated:EXECUTE:false','owner:EXECUTE:false']::text[]
          ),
          (
            'private.current_user_can_write_account(uuid)'::regprocedure,
            array['owner:EXECUTE:false']::text[]
          ),
          (
            'private.current_user_is_property_member(uuid)'::regprocedure,
            array['authenticated:EXECUTE:false','owner:EXECUTE:false']::text[]
          ),
          (
            'private.current_user_is_item_member(uuid)'::regprocedure,
            array['authenticated:EXECUTE:false','owner:EXECUTE:false']::text[]
          ),
          (
            'public.create_current_item(uuid,uuid,text)'::regprocedure,
            array['authenticated:EXECUTE:false','owner:EXECUTE:false']::text[]
          ),
          (
            'public.read_public_item(uuid)'::regprocedure,
            array[
              'anon:EXECUTE:false',
              'authenticated:EXECUTE:false',
              'owner:EXECUTE:false'
            ]::text[]
          )
      ) as expected(function_oid, privilege_rows)
      join pg_catalog.pg_proc as guarded_function
        on guarded_function.oid = expected.function_oid
      cross join lateral (
        select pg_catalog.array_agg(
          (
            case
              when privilege.grantee = guarded_function.proowner then 'owner'
              else grantee.rolname
            end
            || ':' || privilege.privilege_type
            || ':' || privilege.is_grantable::text
          )
          order by
            case
              when privilege.grantee = guarded_function.proowner then 'owner'
              else grantee.rolname
            end,
            privilege.privilege_type,
            privilege.is_grantable
        ) as privilege_rows
        from pg_catalog.aclexplode(
          coalesce(
            guarded_function.proacl,
            pg_catalog.acldefault('f', guarded_function.proowner)
          )
        ) as privilege
        left join pg_catalog.pg_roles as grantee
          on grantee.oid = privilege.grantee
      ) as actual
      where actual.privilege_rows is distinct from expected.privilege_rows
    )
    or pg_catalog.has_function_privilege(
      'authenticated', 'private.trim_instruction_text(text)', 'execute'
    )
    or pg_catalog.has_function_privilege(
      'anon', 'private.trim_instruction_text(text)', 'execute'
    )
    or pg_catalog.has_function_privilege(
      'public', 'private.trim_instruction_text(text)', 'execute'
    )
    or pg_catalog.has_function_privilege(
      'authenticated', 'private.instruction_body_has_unsafe_control(text)', 'execute'
    )
    or pg_catalog.has_function_privilege(
      'anon', 'private.instruction_body_has_unsafe_control(text)', 'execute'
    )
    or pg_catalog.has_function_privilege(
      'public', 'private.instruction_body_has_unsafe_control(text)', 'execute'
    )
    or pg_catalog.has_function_privilege(
      'authenticated', 'private.text_has_unsafe_control(text)', 'execute'
    )
    or pg_catalog.has_function_privilege(
      'anon', 'private.text_has_unsafe_control(text)', 'execute'
    )
    or pg_catalog.has_function_privilege(
      'public', 'private.text_has_unsafe_control(text)', 'execute'
    )
    or not pg_catalog.has_function_privilege(
      'authenticated', 'public.create_current_item(uuid,uuid,text)', 'execute'
    )
    or pg_catalog.has_function_privilege(
      'anon', 'public.create_current_item(uuid,uuid,text)', 'execute'
    )
    or pg_catalog.has_function_privilege(
      'public', 'public.create_current_item(uuid,uuid,text)', 'execute'
    )
    or not pg_catalog.has_function_privilege(
      'authenticated', 'public.read_public_item(uuid)', 'execute'
    )
    or not pg_catalog.has_function_privilege(
      'anon', 'public.read_public_item(uuid)', 'execute'
    )
    or pg_catalog.has_function_privilege(
      'public', 'public.read_public_item(uuid)', 'execute'
    )
  then
    raise exception using
      errcode = '55000',
      message = 'Slice 3A.2 security traits do not match the isolated baseline';
  end if;
end;
$guard$;

create function public.publish_current_item_with_instruction(
  p_property_id uuid,
  p_request_id uuid,
  p_item_name text,
  p_instruction_title text,
  p_instruction_body text
)
returns table (
  public_id uuid,
  item_name text,
  instruction_title text,
  instruction_body text
)
language plpgsql
security definer
set search_path = pg_catalog
as $function$
declare
  v_user_id uuid := auth.uid();
  v_account_id uuid;
  v_item_id uuid;
  v_public_id uuid;
  v_existing_item_name text;
  v_existing_published_at timestamptz;
  v_item_name text;
  v_instruction_title text;
  v_instruction_body text;
  v_article_id uuid;
  v_existing_request_id uuid;
  v_existing_purpose text;
  v_existing_title text;
  v_existing_body text;
  v_existing_order integer;
  v_instruction_count bigint;
begin
  -- Normalize and validate the complete payload before taking a lock or
  -- writing. Unicode outer whitespace is not stored; internal body LF/TAB is.
  if p_property_id is null then
    raise exception using errcode = '22023', message = 'Property is required';
  end if;
  if p_request_id is null then
    raise exception using errcode = '22023', message = 'Publication request is required';
  end if;

  v_item_name := private.trim_instruction_text(p_item_name);
  if v_item_name is null or pg_catalog.char_length(v_item_name) = 0 then
    raise exception using errcode = '22023', message = 'Item name is required';
  end if;
  if pg_catalog.char_length(v_item_name) > 120 then
    raise exception using errcode = '22001', message = 'Item name is too long';
  end if;
  if private.text_has_unsafe_control(v_item_name)
    or private.instruction_body_has_unsafe_control(v_item_name)
  then
    raise exception using errcode = '22023', message = 'Item name contains unsupported characters';
  end if;

  v_instruction_title := private.trim_instruction_text(p_instruction_title);
  if v_instruction_title is null or pg_catalog.char_length(v_instruction_title) = 0 then
    raise exception using errcode = '22023', message = 'Instruction title is required';
  end if;
  if pg_catalog.char_length(v_instruction_title) > 120 then
    raise exception using errcode = '22001', message = 'Instruction title is too long';
  end if;
  if private.text_has_unsafe_control(v_instruction_title)
    or private.instruction_body_has_unsafe_control(v_instruction_title)
  then
    raise exception using errcode = '22023', message = 'Instruction title contains unsupported characters';
  end if;

  v_instruction_body := private.trim_instruction_text(p_instruction_body);
  if v_instruction_body is null or pg_catalog.char_length(v_instruction_body) = 0 then
    raise exception using errcode = '22023', message = 'Instruction body is required';
  end if;
  if pg_catalog.char_length(v_instruction_body) > 8000 then
    raise exception using errcode = '22001', message = 'Instruction body is too long';
  end if;
  if private.instruction_body_has_unsafe_control(v_instruction_body) then
    raise exception using errcode = '22023', message = 'Instruction body contains unsupported characters';
  end if;

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

  -- Establish current writable membership before any conflict lookup. The row
  -- lock makes a concurrent role downgrade serialize ahead of publication.
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

  begin
    insert into public.items as item (
      property_id,
      creation_request_id,
      name
    )
    values (p_property_id, p_request_id, v_item_name)
    on conflict on constraint items_property_creation_request_unique do nothing
    returning item.id, item.public_id
    into v_item_id, v_public_id;
  exception when unique_violation then
    raise exception using
      errcode = '23505',
      message = 'Publication request conflicts with existing content';
  end;

  if v_item_id is null then
    select item.id, item.public_id
    into v_item_id, v_public_id
    from public.items as item
    where item.property_id = p_property_id
      and item.creation_request_id = p_request_id;

    if v_item_id is null then
      raise exception using
        errcode = '23505',
        message = 'Publication request conflicts with existing content';
    end if;
  end if;

  -- Use one lock order for both first calls and retries: membership, then item.
  select item.public_id, item.name::text, item.published_at
  into v_public_id, v_existing_item_name, v_existing_published_at
  from public.items as item
  where item.id = v_item_id
    and item.property_id = p_property_id
  for update of item;

  if v_public_id is null then
    raise exception using
      errcode = '23505',
      message = 'Publication request conflicts with existing content';
  end if;

  if v_existing_item_name is distinct from v_item_name then
    -- Slice 2C accepted only ASCII btrim, so a legitimate legacy draft may
    -- still contain outer NBSP or other Unicode White_Space. Canonicalize that
    -- narrow compatibility case only after locking it and only while draft.
    -- A published mismatch is immutable conflict state, never silently fixed.
    if v_existing_published_at is null
      and private.trim_instruction_text(v_existing_item_name) = v_item_name
    then
      update public.items as item
      set name = v_item_name
      where item.id = v_item_id;
      v_existing_item_name := v_item_name;
    else
      raise exception using
        errcode = '23505',
        message = 'Publication request conflicts with existing content';
    end if;
  end if;

  begin
    insert into public.item_articles as article (
      item_id,
      creation_request_id,
      purpose,
      title,
      description,
      display_order
    )
    values (
      v_item_id,
      p_request_id,
      'instructions',
      v_instruction_title,
      v_instruction_body,
      0
    )
    on conflict on constraint item_articles_item_creation_request_unique do nothing
    returning article.id into v_article_id;
  exception when unique_violation then
    raise exception using
      errcode = '23505',
      message = 'Publication request conflicts with existing content';
  end;

  select
    article.id,
    article.creation_request_id,
    article.purpose::text,
    article.title::text,
    article.description,
    article.display_order
  into
    v_article_id,
    v_existing_request_id,
    v_existing_purpose,
    v_existing_title,
    v_existing_body,
    v_existing_order
  from public.item_articles as article
  where article.item_id = v_item_id
    and article.creation_request_id = p_request_id
  for update of article;

  if v_article_id is null
    or v_existing_request_id is distinct from p_request_id
    or v_existing_purpose is distinct from 'instructions'
    or v_existing_title is distinct from v_instruction_title
    or v_existing_body is distinct from v_instruction_body
    or v_existing_order is distinct from 0
  then
    raise exception using
      errcode = '23505',
      message = 'Publication request conflicts with existing content';
  end if;

  select pg_catalog.count(*)
  into v_instruction_count
  from public.item_articles as article
  where article.item_id = v_item_id;

  if v_instruction_count is distinct from 1::bigint then
    raise exception using
      errcode = '23505',
      message = 'Publication request conflicts with existing content';
  end if;

  update public.items as item
  set published_at = coalesce(item.published_at, pg_catalog.now())
  where item.id = v_item_id;

  return query
  select
    v_public_id,
    v_item_name,
    v_instruction_title,
    v_instruction_body;
end;
$function$;

revoke all on function public.publish_current_item_with_instruction(
  uuid, uuid, text, text, text
)
from public, anon, authenticated;
grant execute on function public.publish_current_item_with_instruction(
  uuid, uuid, text, text, text
)
to authenticated;

comment on function public.publish_current_item_with_instruction(
  uuid, uuid, text, text, text
) is
  'Atomically creates or recovers one item and its sole first instruction, then publishes it for a confirmed writable property member.';
