-- Slice 3A.3: coordinated guest-safe instruction projection.
-- Apply only after the isolated Slice 3A.2 publication migration.

do $guard$
declare
  v_old_reader_acl text[];
  v_create_acl text[];
  v_publish_acl text[];
begin
  if pg_catalog.to_regclass('public.items') is null
    or pg_catalog.to_regclass('public.item_articles') is null
    or pg_catalog.to_regprocedure('public.create_current_item(uuid,uuid,text)') is null
    or pg_catalog.to_regprocedure('public.read_public_item(uuid)') is null
    or pg_catalog.to_regprocedure('public.publish_current_item_with_instruction(uuid,uuid,text,text,text)') is null
    or not exists (select 1 from pg_catalog.pg_roles where rolname = 'anon')
    or not exists (select 1 from pg_catalog.pg_roles where rolname = 'authenticated')
  then
    raise exception using errcode = '55000',
      message = 'Slice 3A.3 requires the complete isolated Slice 3A.2 boundary';
  end if;

  if not (
    select publication.prosecdef
      and publication.provolatile = 'v'
      and not publication.proisstrict
      and publication.proretset
      and publication.prorettype = 'pg_catalog.record'::regtype
      and publication.proconfig = array['search_path=pg_catalog']::text[]
      and publication.proowner = item.relowner
      and publication.proargnames = array[
        'p_property_id','p_request_id','p_name','p_instruction_title','p_instruction_body',
        'public_id','item_name','instruction_title','instruction_body'
      ]::text[]
      and publication.proargmodes = array['i','i','i','i','i','t','t','t','t']::"char"[]
      and publication.proallargtypes = array[
        'pg_catalog.uuid'::regtype,'pg_catalog.uuid'::regtype,
        'pg_catalog.text'::regtype,'pg_catalog.text'::regtype,'pg_catalog.text'::regtype,
        'pg_catalog.uuid'::regtype,'pg_catalog.text'::regtype,
        'pg_catalog.text'::regtype,'pg_catalog.text'::regtype
      ]::oid[]
    from pg_catalog.pg_proc as publication
    cross join pg_catalog.pg_class as item
    where publication.oid =
      'public.publish_current_item_with_instruction(uuid,uuid,text,text,text)'::regprocedure
      and item.oid = 'public.items'::regclass
  )
  then
    raise exception using errcode = '55000',
      message = 'Slice 3A.3 publication RPC does not match Slice 3A.2';
  end if;

  if not (
    select reader.prosecdef
      and reader.provolatile = 's'
      and not reader.proisstrict
      and reader.proretset
      and reader.prorettype = 'pg_catalog.record'::regtype
      and reader.proconfig = array['search_path=pg_catalog']::text[]
      and reader.proowner = item.relowner
      and reader.proargnames = array['p_public_id','public_id','name']::text[]
      and reader.proargmodes = array['i','t','t']::"char"[]
      and reader.proallargtypes = array[
        'pg_catalog.uuid'::regtype,'pg_catalog.uuid'::regtype,'pg_catalog.text'::regtype
      ]::oid[]
    from pg_catalog.pg_proc as reader
    cross join pg_catalog.pg_class as item
    where reader.oid = 'public.read_public_item(uuid)'::regprocedure
      and item.oid = 'public.items'::regclass
  )
  then
    raise exception using errcode = '55000',
      message = 'Slice 3A.3 public reader does not match Slice 2C.1';
  end if;

  select pg_catalog.array_agg(
    (case when acl.grantee = reader.proowner then 'owner' else role.rolname end)
      || ':' || acl.privilege_type || ':' || acl.is_grantable::text
    order by case when acl.grantee = reader.proowner then 'owner' else role.rolname end,
      acl.privilege_type, acl.is_grantable
  )
  into v_old_reader_acl
  from pg_catalog.pg_proc as reader
  cross join lateral pg_catalog.aclexplode(
    coalesce(reader.proacl, pg_catalog.acldefault('f', reader.proowner))
  ) as acl
  left join pg_catalog.pg_roles as role on role.oid = acl.grantee
  where reader.oid = 'public.read_public_item(uuid)'::regprocedure;

  if v_old_reader_acl is distinct from array[
    'anon:EXECUTE:false','authenticated:EXECUTE:false','owner:EXECUTE:false'
  ]::text[]
  then
    raise exception using errcode = '55000',
      message = 'Slice 3A.3 public reader ACL does not match Slice 2C.1';
  end if;

  select pg_catalog.array_agg(
    (case when acl.grantee = guarded.proowner then 'owner' else role.rolname end)
      || ':' || acl.privilege_type || ':' || acl.is_grantable::text
    order by case when acl.grantee = guarded.proowner then 'owner' else role.rolname end,
      acl.privilege_type, acl.is_grantable
  )
  into v_create_acl
  from pg_catalog.pg_proc as guarded
  cross join lateral pg_catalog.aclexplode(
    coalesce(guarded.proacl, pg_catalog.acldefault('f', guarded.proowner))
  ) as acl
  left join pg_catalog.pg_roles as role on role.oid = acl.grantee
  where guarded.oid = 'public.create_current_item(uuid,uuid,text)'::regprocedure;

  select pg_catalog.array_agg(
    (case when acl.grantee = guarded.proowner then 'owner' else role.rolname end)
      || ':' || acl.privilege_type || ':' || acl.is_grantable::text
    order by case when acl.grantee = guarded.proowner then 'owner' else role.rolname end,
      acl.privilege_type, acl.is_grantable
  )
  into v_publish_acl
  from pg_catalog.pg_proc as guarded
  cross join lateral pg_catalog.aclexplode(
    coalesce(guarded.proacl, pg_catalog.acldefault('f', guarded.proowner))
  ) as acl
  left join pg_catalog.pg_roles as role on role.oid = acl.grantee
  where guarded.oid =
    'public.publish_current_item_with_instruction(uuid,uuid,text,text,text)'::regprocedure;

  if v_create_acl is distinct from array[
      'authenticated:EXECUTE:false','owner:EXECUTE:false'
    ]::text[]
    or v_publish_acl is distinct from array[
      'authenticated:EXECUTE:false','owner:EXECUTE:false'
    ]::text[]
  then
    raise exception using errcode = '55000',
      message = 'Slice 3A.3 inherited write RPC ACLs do not match Slice 3A.2';
  end if;

  if not exists (
    select 1 from pg_catalog.pg_constraint
    where conrelid = 'public.item_articles'::regclass
      and conname = 'item_articles_item_display_order_unique'
      and contype = 'u'
  )
    or not exists (
      select 1 from pg_catalog.pg_constraint
      where conrelid = 'public.item_articles'::regclass
        and conname = 'item_articles_purpose_instructions_only'
        and contype = 'c' and convalidated
    )
    or not (
      select item.relrowsecurity and article.relrowsecurity
      from pg_catalog.pg_class as item
      cross join pg_catalog.pg_class as article
      where item.oid = 'public.items'::regclass
        and article.oid = 'public.item_articles'::regclass
    )
  then
    raise exception using errcode = '55000',
      message = 'Slice 3A.3 instruction relation does not match Slice 3A.1';
  end if;
end;
$guard$;

-- Draft creation is now exclusively an owner/internal compatibility primitive.
revoke execute on function public.create_current_item(uuid, uuid, text)
from authenticated;

revoke all on function public.read_public_item(uuid)
from public, anon, authenticated;
drop function public.read_public_item(uuid);

create function public.read_public_item(p_public_id uuid)
returns table (
  public_id uuid,
  name text,
  instructions jsonb
)
language sql
stable
security definer
set search_path = pg_catalog
as $function$
  select
    item.public_id,
    item.name::text,
    pg_catalog.jsonb_agg(
      pg_catalog.jsonb_build_object(
        'title', article.title::text,
        'body', article.description
      )
      order by article.display_order, article.id
    ) as instructions
  from public.items as item
  join public.item_articles as article
    on article.item_id = item.id
   and article.purpose = 'instructions'
  where item.public_id = p_public_id
    and item.published_at is not null
  group by item.id, item.public_id, item.name
  having pg_catalog.count(*) >= 1;
$function$;

revoke all on function public.read_public_item(uuid)
from public, anon, authenticated;
grant execute on function public.read_public_item(uuid)
to anon, authenticated;

comment on function public.read_public_item(uuid) is
  'Returns exactly one guest-safe published item with deterministically ordered plain-text instructions.';
