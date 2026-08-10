begin;

create extension if not exists pgtap with schema extensions;
set search_path = public, extensions;

select plan(73);

select has_function(
  'public',
  'publish_current_item_with_instruction',
  array['uuid', 'uuid', 'text', 'text', 'text'],
  'atomic publication RPC has the exact five-input identity'
);
select ok(
  (
    select rpc.prosecdef
      and rpc.provolatile = 'v'
      and rpc.proretset
      and rpc.prorettype = 'pg_catalog.record'::regtype
      and rpc.proconfig = array['search_path=pg_catalog']::text[]
      and rpc.proowner = item.relowner
    from pg_catalog.pg_proc as rpc
    cross join pg_catalog.pg_class as item
    where rpc.oid =
      'public.publish_current_item_with_instruction(uuid,uuid,text,text,text)'::regprocedure
      and item.oid = 'public.items'::regclass
  ),
  'publication RPC is a table-owned fixed-path volatile security definer'
);
select is(
  (
    select rpc.proargnames
    from pg_catalog.pg_proc as rpc
    where rpc.oid =
      'public.publish_current_item_with_instruction(uuid,uuid,text,text,text)'::regprocedure
  ),
  array[
    'p_property_id',
    'p_request_id',
    'p_name',
    'p_instruction_title',
    'p_instruction_body',
    'public_id',
    'item_name',
    'instruction_title',
    'instruction_body'
  ]::text[],
  'input and output argument names expose only the narrow publication contract'
);
select results_eq(
  $$
    select rpc.proargmodes
    from pg_catalog.pg_proc as rpc
    where rpc.oid =
      'public.publish_current_item_with_instruction(uuid,uuid,text,text,text)'::regprocedure
  $$,
  $$values (array['i','i','i','i','i','t','t','t','t']::"char"[])$$,
  'publication RPC has exactly five inputs and four table outputs'
);
select results_eq(
  $$
    select pg_catalog.format_type(argument.type_oid, null)::text
    from pg_catalog.pg_proc as rpc
    cross join lateral pg_catalog.unnest(rpc.proallargtypes)
      with ordinality as argument(type_oid, position)
    where rpc.oid =
      'public.publish_current_item_with_instruction(uuid,uuid,text,text,text)'::regprocedure
      and argument.position > 5
    order by argument.position
  $$,
  $$values ('uuid'::text), ('text'::text), ('text'::text), ('text'::text)$$,
  'publication RPC returns exactly public ID, item name, title, and body types'
);
select ok(
  has_function_privilege(
    'authenticated',
    'public.publish_current_item_with_instruction(uuid,uuid,text,text,text)',
    'execute'
  ),
  'authenticated receives publication execute'
);
select ok(
  not has_function_privilege(
    'anon',
    'public.publish_current_item_with_instruction(uuid,uuid,text,text,text)',
    'execute'
  ),
  'anonymous receives no publication execute'
);
select ok(
  not has_function_privilege(
    'public',
    'public.publish_current_item_with_instruction(uuid,uuid,text,text,text)',
    'execute'
  ),
  'PUBLIC receives no implicit publication execute'
);
select ok(
  not has_function_privilege(
    'authenticated',
    'public.create_current_item(uuid,uuid,text)',
    'execute'
  ),
  'coordinated public projection revokes obsolete draft creation'
);
select ok(
  not has_function_privilege('anon', 'public.create_current_item(uuid,uuid,text)', 'execute'),
  'existing draft creation remains unavailable to anonymous'
);
select ok(
  has_function_privilege('anon', 'public.read_public_item(uuid)', 'execute')
    and has_function_privilege('authenticated', 'public.read_public_item(uuid)', 'execute'),
  'existing two-field reader grants remain unchanged'
);
select ok(
  not has_function_privilege('public', 'public.read_public_item(uuid)', 'execute'),
  'existing public reader still has no PUBLIC default grant'
);
select is(
  (select rpc.proargnames
   from pg_catalog.pg_proc as rpc
   where rpc.oid = 'public.read_public_item(uuid)'::regprocedure),
  array['p_public_id', 'public_id', 'name', 'instructions']::text[],
  'coordinated public reader exposes the final guest projection'
);
select ok(
  (
    select pg_catalog.bool_and(
      helper.proowner = article.relowner
      and not helper.prosecdef
      and helper.provolatile = 'i'
      and helper.proconfig = array['search_path=pg_catalog']::text[]
      and helper.prorettype = case helper.proname
        when 'trim_instruction_text' then 'pg_catalog.text'::regtype
        else 'pg_catalog.bool'::regtype
      end
      and helper.proisstrict = (helper.proname = 'trim_instruction_text')
    )
    from pg_catalog.pg_proc as helper
    cross join pg_catalog.pg_class as article
    where helper.oid in (
        'private.text_has_unsafe_control(text)'::regprocedure,
        'private.trim_instruction_text(text)'::regprocedure,
        'private.instruction_body_has_unsafe_control(text)'::regprocedure
      )
      and article.oid = 'public.item_articles'::regclass
  ),
  'all inherited text helpers retain exact owner, return, volatility, strictness, and path traits'
);
select ok(
  not has_function_privilege('authenticated','private.text_has_unsafe_control(text)','execute')
    and not has_function_privilege('anon','private.text_has_unsafe_control(text)','execute')
    and not has_function_privilege('public','private.text_has_unsafe_control(text)','execute')
    and not has_function_privilege('authenticated','private.trim_instruction_text(text)','execute')
    and not has_function_privilege('anon','private.trim_instruction_text(text)','execute')
    and not has_function_privilege('public','private.trim_instruction_text(text)','execute')
    and not has_function_privilege('authenticated','private.instruction_body_has_unsafe_control(text)','execute')
    and not has_function_privilege('anon','private.instruction_body_has_unsafe_control(text)','execute')
    and not has_function_privilege('public','private.instruction_body_has_unsafe_control(text)','execute'),
  'all inherited text helpers remain owner-only'
);
select is(
  (
    select pg_catalog.array_agg(
      function_boundary.label || ':'
        || case when privilege.grantee=guarded_function.proowner then 'owner' else grantee.rolname end
        || ':' || privilege.privilege_type
        || ':' || privilege.is_grantable::text
      order by function_boundary.label,
        case when privilege.grantee=guarded_function.proowner then 'owner' else grantee.rolname end,
        privilege.privilege_type,
        privilege.is_grantable
    )
    from (values
      ('account_member','private.current_user_is_account_member(uuid)'::regprocedure),
      ('body','private.instruction_body_has_unsafe_control(text)'::regprocedure),
      ('can_write','private.current_user_can_write_account(uuid)'::regprocedure),
      ('create','public.create_current_item(uuid,uuid,text)'::regprocedure),
      ('item_member','private.current_user_is_item_member(uuid)'::regprocedure),
      ('property_member','private.current_user_is_property_member(uuid)'::regprocedure),
      ('read','public.read_public_item(uuid)'::regprocedure),
      ('text','private.text_has_unsafe_control(text)'::regprocedure),
      ('trim','private.trim_instruction_text(text)'::regprocedure)
    ) as function_boundary(label,function_oid)
    join pg_catalog.pg_proc as guarded_function on guarded_function.oid=function_boundary.function_oid
    cross join lateral pg_catalog.aclexplode(
      coalesce(guarded_function.proacl,pg_catalog.acldefault('f',guarded_function.proowner))
    ) as privilege
    left join pg_catalog.pg_roles as grantee on grantee.oid=privilege.grantee
  ),
  array[
    'account_member:authenticated:EXECUTE:false','account_member:owner:EXECUTE:false',
    'body:owner:EXECUTE:false','can_write:owner:EXECUTE:false',
    'create:owner:EXECUTE:false',
    'item_member:authenticated:EXECUTE:false','item_member:owner:EXECUTE:false',
    'property_member:authenticated:EXECUTE:false','property_member:owner:EXECUTE:false',
    'read:anon:EXECUTE:false','read:authenticated:EXECUTE:false','read:owner:EXECUTE:false',
    'text:owner:EXECUTE:false','trim:owner:EXECUTE:false'
  ]::text[],
  'all inherited function ACLs contain exactly the intended grantees and execute grantability'
);
select ok(
  (
    select pg_catalog.bool_and(
      helper.proowner = article.relowner
      and helper.prosecdef
      and helper.provolatile = 's'
      and not helper.proisstrict
      and helper.prorettype = 'pg_catalog.bool'::regtype
      and helper.proconfig = array['search_path=pg_catalog']::text[]
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
  ),
  'inherited membership helpers retain exact table owner and security traits'
);
select ok(
  (
    select rpc.proowner = item.relowner
      and rpc.prosecdef
      and rpc.provolatile = 'v'
      and rpc.proretset
      and rpc.prorettype = 'pg_catalog.record'::regtype
      and rpc.proargnames = array['p_property_id','p_request_id','p_name','public_id','property_id','name']::text[]
      and rpc.proargmodes = array['i','i','i','t','t','t']::"char"[]
      and rpc.proallargtypes = array[
        'pg_catalog.uuid'::regtype,'pg_catalog.uuid'::regtype,'pg_catalog.text'::regtype,
        'pg_catalog.uuid'::regtype,'pg_catalog.uuid'::regtype,'pg_catalog.text'::regtype
      ]::oid[]
    from pg_catalog.pg_proc as rpc
    cross join pg_catalog.pg_class as item
    where rpc.oid = 'public.create_current_item(uuid,uuid,text)'::regprocedure
      and item.oid = 'public.items'::regclass
  ),
  'inherited draft RPC retains exact owner and input/output contract'
);
select ok(
  (
    select rpc.proowner = item.relowner
      and rpc.prosecdef
      and rpc.provolatile = 's'
      and rpc.proretset
      and rpc.prorettype = 'pg_catalog.record'::regtype
      and rpc.proargnames = array['p_public_id','public_id','name','instructions']::text[]
      and rpc.proargmodes = array['i','t','t','t']::"char"[]
      and rpc.proallargtypes = array[
        'pg_catalog.uuid'::regtype,'pg_catalog.uuid'::regtype,
        'pg_catalog.text'::regtype,'pg_catalog.jsonb'::regtype
      ]::oid[]
    from pg_catalog.pg_proc as rpc
    cross join pg_catalog.pg_class as item
    where rpc.oid = 'public.read_public_item(uuid)'::regprocedure
      and item.oid = 'public.items'::regclass
  ),
  'coordinated public reader retains exact owner and final return contract'
);
select results_eq(
  $$select key_constraint.conname::text collate "C"
    from pg_catalog.pg_constraint as key_constraint
    where key_constraint.conrelid='public.item_articles'::regclass
      and key_constraint.contype='c'
      and key_constraint.convalidated
    order by key_constraint.conname$$,
  $$values
    ('item_articles_description_normalized_not_blank'::text collate "C"),
    ('item_articles_description_safe_text'::text collate "C"),
    ('item_articles_display_order_nonnegative'::text collate "C"),
    ('item_articles_purpose_instructions_only'::text collate "C"),
    ('item_articles_title_normalized_not_blank'::text collate "C"),
    ('item_articles_title_safe_text'::text collate "C")$$,
  'all relied-on 3A.1 content and ordering constraints remain validated'
);
select ok(
  pg_catalog.pg_get_functiondef(
    'public.publish_current_item_with_instruction(uuid,uuid,text,text,text)'::regprocedure
  ) like '%for update of membership%'
  and pg_catalog.pg_get_functiondef(
    'public.publish_current_item_with_instruction(uuid,uuid,text,text,text)'::regprocedure
  ) like '%for update of item%'
  and pg_catalog.pg_get_functiondef(
    'public.publish_current_item_with_instruction(uuid,uuid,text,text,text)'::regprocedure
  ) like '%for update of article%',
  'static function body exposes membership then item then article lock stages'
);
select ok(
  pg_catalog.pg_get_functiondef(
    'public.publish_current_item_with_instruction(uuid,uuid,text,text,text)'::regprocedure
  ) like '%items_property_creation_request_unique%'
  and pg_catalog.pg_get_functiondef(
    'public.publish_current_item_with_instruction(uuid,uuid,text,text,text)'::regprocedure
  ) like '%item_articles_item_creation_request_unique%',
  'both retry identities use their named uniqueness boundaries'
);
select ok(
  pg_catalog.lower(pg_catalog.pg_get_functiondef(
    'public.publish_current_item_with_instruction(uuid,uuid,text,text,text)'::regprocedure
  )) like '%v_instruction_count is distinct from 1::bigint%'
  and pg_catalog.lower(pg_catalog.pg_get_functiondef(
    'public.publish_current_item_with_instruction(uuid,uuid,text,text,text)'::regprocedure
  )) like '%coalesce(item.published_at, pg_catalog.now())%',
  'publication follows an exact-one-instruction check and preserves retry timestamp'
);
select ok(
  pg_catalog.lower(pg_catalog.pg_get_functiondef(
    'public.publish_current_item_with_instruction(uuid,uuid,text,text,text)'::regprocedure
  )) like '%private.trim_instruction_text(v_existing_item_name) = v_item_name%'
  and pg_catalog.lower(pg_catalog.pg_get_functiondef(
    'public.publish_current_item_with_instruction(uuid,uuid,text,text,text)'::regprocedure
  )) like '%v_existing_published_at is null%',
  'legacy normalization is guarded behind the locked unpublished item state'
);
select is(
  (
    select count(*)
    from information_schema.routine_privileges
    where routine_schema = 'public'
      and routine_name = 'publish_current_item_with_instruction'
      and privilege_type <> 'EXECUTE'
  ),
  0::bigint,
  'publication RPC exposes no privilege other than execute'
);

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
values
  ('00000000-0000-0000-0000-000000000000','51111111-1111-4111-8111-111111111111','authenticated','authenticated','publish-owner@example.test','',now(),'{}','{}',now(),now()),
  ('00000000-0000-0000-0000-000000000000','52222222-2222-4222-8222-222222222222','authenticated','authenticated','publish-admin@example.test','',now(),'{}','{}',now(),now()),
  ('00000000-0000-0000-0000-000000000000','53333333-3333-4333-8333-333333333333','authenticated','authenticated','publish-member@example.test','',now(),'{}','{}',now(),now()),
  ('00000000-0000-0000-0000-000000000000','54444444-4444-4444-8444-444444444444','authenticated','authenticated','publish-viewer@example.test','',now(),'{}','{}',now(),now()),
  ('00000000-0000-0000-0000-000000000000','55555555-5555-4555-8555-555555555555','authenticated','authenticated','publish-cross@example.test','',now(),'{}','{}',now(),now()),
  ('00000000-0000-0000-0000-000000000000','56666666-6666-4666-8666-666666666666','authenticated','authenticated','publish-unconfirmed@example.test','',null,'{}','{}',now(),now());

insert into public.users (id, email)
values
  ('51111111-1111-4111-8111-111111111111','publish-owner@example.test'),
  ('52222222-2222-4222-8222-222222222222','publish-admin@example.test'),
  ('53333333-3333-4333-8333-333333333333','publish-member@example.test'),
  ('54444444-4444-4444-8444-444444444444','publish-viewer@example.test'),
  ('55555555-5555-4555-8555-555555555555','publish-cross@example.test'),
  ('56666666-6666-4666-8666-666666666666','publish-unconfirmed@example.test');

insert into public.accounts (id, owner_id, name)
values
  ('5aaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','51111111-1111-4111-8111-111111111111','Publish account A'),
  ('5bbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','55555555-5555-4555-8555-555555555555','Publish account B');

insert into public.account_users (account_id, user_id, role, joined_at)
values
  ('5aaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','51111111-1111-4111-8111-111111111111','owner',now()),
  ('5aaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','52222222-2222-4222-8222-222222222222','admin',now()),
  ('5aaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','53333333-3333-4333-8333-333333333333','member',now()),
  ('5aaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','54444444-4444-4444-8444-444444444444','viewer',now()),
  ('5aaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','56666666-6666-4666-8666-666666666666','member',now()),
  ('5bbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','55555555-5555-4555-8555-555555555555','owner',now());

insert into public.properties (id, user_id, property_type_id, nickname, account_id)
values
  ('5aaaaaaa-1111-4111-8111-111111111111','51111111-1111-4111-8111-111111111111','00000000-0000-4000-8000-000000000107','Publish property A1','5aaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),
  ('5aaaaaaa-2222-4222-8222-222222222222','51111111-1111-4111-8111-111111111111','00000000-0000-4000-8000-000000000107','Publish property A2','5aaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),
  ('5bbbbbbb-1111-4111-8111-111111111111','55555555-5555-4555-8555-555555555555','00000000-0000-4000-8000-000000000107','Publish property B','5bbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb');

-- Owner: normalization, atomic creation, exact result, and stable retry.
select set_config('request.jwt.claim.sub', '51111111-1111-4111-8111-111111111111', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;
select results_eq(
  $$select item_name, instruction_title, instruction_body
    from public.publish_current_item_with_instruction(
      '5aaaaaaa-1111-4111-8111-111111111111',
      '5aaaaaaa-0000-4000-8000-000000000001',
      chr(160) || 'Coffee machine' || chr(160),
      chr(12288) || 'Make coffee' || chr(12288),
      E'\nFill the tank.\nPress start.\tWait.\n'
    )$$,
  $$values ('Coffee machine'::text,'Make coffee'::text,E'Fill the tank.\nPress start.\tWait.'::text)$$,
  'owner atomically publishes normalized useful content'
);
reset role;
select is((select count(*) from public.items where creation_request_id='5aaaaaaa-0000-4000-8000-000000000001'),1::bigint,'first publication creates one item');
select is((select count(*) from public.item_articles where creation_request_id='5aaaaaaa-0000-4000-8000-000000000001'),1::bigint,'first publication creates one instruction');
select ok((select published_at is not null from public.items where creation_request_id='5aaaaaaa-0000-4000-8000-000000000001'),'item publishes only after instruction creation');
create temporary table publication_snapshot as
select public_id, published_at
from public.items where creation_request_id='5aaaaaaa-0000-4000-8000-000000000001';
grant select on publication_snapshot to authenticated;
set local role authenticated;
select results_eq(
  $$select public_id from public.publish_current_item_with_instruction(
    '5aaaaaaa-1111-4111-8111-111111111111','5aaaaaaa-0000-4000-8000-000000000001',
    'Coffee machine','Make coffee',E'Fill the tank.\nPress start.\tWait.')$$,
  $$select public_id from publication_snapshot$$,
  'exact sequential retry returns the stable public UUID'
);
reset role;
select results_eq(
  $$select item.public_id, item.published_at from public.items as item
    where item.creation_request_id='5aaaaaaa-0000-4000-8000-000000000001'$$,
  $$select public_id, published_at from publication_snapshot$$,
  'exact retry preserves the original publication timestamp'
);
select results_eq(
  $$select public_id, name::text from public.read_public_item(
    (select public_id from publication_snapshot))$$,
  $$select public_id, 'Coffee machine'::text from publication_snapshot$$,
  'coordinated public reader preserves the published item identity fields'
);

-- Reusing a request with any changed content is a generic atomic conflict.
set local role authenticated;
select throws_ok($$select * from public.publish_current_item_with_instruction('5aaaaaaa-1111-4111-8111-111111111111','5aaaaaaa-0000-4000-8000-000000000001','Kettle','Make coffee',E'Fill the tank.\nPress start.\tWait.')$$,'23505','Publication request conflicts with existing content','changed item name conflicts');
select throws_ok($$select * from public.publish_current_item_with_instruction('5aaaaaaa-1111-4111-8111-111111111111','5aaaaaaa-0000-4000-8000-000000000001','Coffee machine','Start coffee',E'Fill the tank.\nPress start.\tWait.')$$,'23505','Publication request conflicts with existing content','changed instruction title conflicts');
select throws_ok($$select * from public.publish_current_item_with_instruction('5aaaaaaa-1111-4111-8111-111111111111','5aaaaaaa-0000-4000-8000-000000000001','Coffee machine','Make coffee','Different body')$$,'23505','Publication request conflicts with existing content','changed instruction body conflicts');
reset role;
select results_eq($$select name::text from public.items where creation_request_id='5aaaaaaa-0000-4000-8000-000000000001'$$,$$values ('Coffee machine'::text)$$,'item conflict leaves stored name unchanged');
select results_eq($$select title::text,description from public.item_articles where creation_request_id='5aaaaaaa-0000-4000-8000-000000000001'$$,$$values ('Make coffee'::text,E'Fill the tank.\nPress start.\tWait.'::text)$$,'instruction conflicts leave stored content unchanged');

-- The same request UUID is independent on another validated property.
set local role authenticated;
select lives_ok($$select * from public.publish_current_item_with_instruction('5aaaaaaa-2222-4222-8222-222222222222','5aaaaaaa-0000-4000-8000-000000000001','Kettle','Boil water','Fill to the mark, then switch on.')$$,'same request independently publishes another property');
reset role;
select is((select count(distinct public_id) from public.items where creation_request_id='5aaaaaaa-0000-4000-8000-000000000001'),2::bigint,'property-scoped retry creates two distinct public identities');

-- Existing 2C draft completion.
insert into public.items (property_id,creation_request_id,name)
values ('5aaaaaaa-1111-4111-8111-111111111111','5aaaaaaa-0000-4000-8000-000000000010','Wi-Fi router');
set local role authenticated;
select lives_ok($$select * from public.publish_current_item_with_instruction('5aaaaaaa-1111-4111-8111-111111111111','5aaaaaaa-0000-4000-8000-000000000010','Wi-Fi router','Restart the router','Unplug it for ten seconds, then reconnect it.')$$,'existing matching 2C draft gains its first instruction and publishes');
reset role;
select ok((select published_at is not null from public.items where creation_request_id='5aaaaaaa-0000-4000-8000-000000000010'),'completed draft is published');

-- Slice 2C's ASCII-only btrim allowed outer Unicode whitespace. Recover it
-- after the item lock, converge storage/return/read, and keep retries stable.
insert into public.items (property_id,creation_request_id,name,published_at)
values
  ('5aaaaaaa-1111-4111-8111-111111111111','5aaaaaaa-0000-4000-8000-000000000011',chr(160)||'Legacy NBSP'||chr(160),null),
  ('5aaaaaaa-1111-4111-8111-111111111111','5aaaaaaa-0000-4000-8000-000000000012',chr(12288)||'Legacy ideographic'||chr(12288),null),
  ('5aaaaaaa-1111-4111-8111-111111111111','5aaaaaaa-0000-4000-8000-000000000013',chr(160)||'Published mismatch'||chr(160),now());
set local role authenticated;
select results_eq(
  $$select item_name from public.publish_current_item_with_instruction(
      '5aaaaaaa-1111-4111-8111-111111111111','5aaaaaaa-0000-4000-8000-000000000011',
      chr(160)||'Legacy NBSP'||chr(160),'Use legacy item','Follow the first instruction.')
    union all
    select item_name from public.publish_current_item_with_instruction(
      '5aaaaaaa-1111-4111-8111-111111111111','5aaaaaaa-0000-4000-8000-000000000012',
      chr(12288)||'Legacy ideographic'||chr(12288),'Use second legacy item','Follow the second instruction.')$$,
  $$values ('Legacy NBSP'::text),('Legacy ideographic'::text)$$,
  'NBSP and U+3000 wrapped legacy drafts return canonical names'
);
reset role;
select results_eq(
  $$select creation_request_id,name::text from public.items
    where creation_request_id in (
      '5aaaaaaa-0000-4000-8000-000000000011',
      '5aaaaaaa-0000-4000-8000-000000000012'
    ) order by creation_request_id$$,
  $$values
    ('5aaaaaaa-0000-4000-8000-000000000011'::uuid,'Legacy NBSP'::text),
    ('5aaaaaaa-0000-4000-8000-000000000012'::uuid,'Legacy ideographic'::text)$$,
  'locked unpublished legacy drafts converge to canonical stored names'
);
set local role authenticated;
select results_eq(
  $$select public_id from public.publish_current_item_with_instruction(
      '5aaaaaaa-1111-4111-8111-111111111111','5aaaaaaa-0000-4000-8000-000000000011',
      'Legacy NBSP','Use legacy item','Follow the first instruction.')
    union all
    select public_id from public.publish_current_item_with_instruction(
      '5aaaaaaa-1111-4111-8111-111111111111','5aaaaaaa-0000-4000-8000-000000000012',
      'Legacy ideographic','Use second legacy item','Follow the second instruction.')$$,
  $$select public_id from public.items where creation_request_id in (
      '5aaaaaaa-0000-4000-8000-000000000011',
      '5aaaaaaa-0000-4000-8000-000000000012'
    ) order by creation_request_id$$,
  'canonical retries preserve both recovered public identities'
);
reset role;
select results_eq(
  $$select public_item.name from public.items as item
    cross join lateral public.read_public_item(item.public_id) as public_item
    where item.creation_request_id in (
      '5aaaaaaa-0000-4000-8000-000000000011',
      '5aaaaaaa-0000-4000-8000-000000000012'
    ) order by item.creation_request_id$$,
  $$values ('Legacy NBSP'::text),('Legacy ideographic'::text)$$,
  'unchanged old reader returns canonical recovered legacy names'
);
set local role authenticated;
select throws_ok(
  $$select * from public.publish_current_item_with_instruction(
    '5aaaaaaa-1111-4111-8111-111111111111','5aaaaaaa-0000-4000-8000-000000000013',
    'Published mismatch','Do not mutate','This call must conflict.')$$,
  '23505','Publication request conflicts with existing content',
  'published normalization mismatch is a conflict rather than a rewrite'
);
reset role;
select is(
  (select name::text from public.items where creation_request_id='5aaaaaaa-0000-4000-8000-000000000013'),
  chr(160)||'Published mismatch'||chr(160),
  'published mismatched item remains byte-for-byte unchanged'
);

-- Admin and member may publish; viewer, unconfirmed, cross-account, and anon may not.
select set_config('request.jwt.claim.sub','52222222-2222-4222-8222-222222222222',true);
set local role authenticated;
select lives_ok($$select * from public.publish_current_item_with_instruction('5aaaaaaa-1111-4111-8111-111111111111','5aaaaaaa-0000-4000-8000-000000000020','Oven','Use the oven','Turn the left dial to the required temperature.')$$,'admin may publish');
reset role;
select set_config('request.jwt.claim.sub','53333333-3333-4333-8333-333333333333',true);
set local role authenticated;
select lives_ok($$select * from public.publish_current_item_with_instruction('5aaaaaaa-1111-4111-8111-111111111111','5aaaaaaa-0000-4000-8000-000000000021','Television','Use the television','Press power, then choose an input.')$$,'member may publish');
reset role;
select set_config('request.jwt.claim.sub','54444444-4444-4444-8444-444444444444',true);
set local role authenticated;
select throws_ok($$select * from public.publish_current_item_with_instruction('5aaaaaaa-1111-4111-8111-111111111111','5aaaaaaa-0000-4000-8000-000000000022','Viewer item','Viewer title','Viewer body')$$,'P0002','Writable property not found','viewer receives generic nonwritable-property denial');
reset role;
select set_config('request.jwt.claim.sub','56666666-6666-4666-8666-666666666666',true);
set local role authenticated;
select throws_ok($$select * from public.publish_current_item_with_instruction('5aaaaaaa-1111-4111-8111-111111111111','5aaaaaaa-0000-4000-8000-000000000023','Unconfirmed item','Unconfirmed title','Unconfirmed body')$$,'42501','Confirmed email required','unconfirmed member is denied');
reset role;
select set_config('request.jwt.claim.sub','55555555-5555-4555-8555-555555555555',true);
set local role authenticated;
select throws_ok($$select * from public.publish_current_item_with_instruction('5aaaaaaa-1111-4111-8111-111111111111','5aaaaaaa-0000-4000-8000-000000000024','Cross item','Cross title','Cross body')$$,'P0002','Writable property not found','cross-account property hint gets the same generic denial');
select throws_ok($$select * from public.publish_current_item_with_instruction('59999999-9999-4999-8999-999999999999','5aaaaaaa-0000-4000-8000-000000000025','Missing item','Missing title','Missing body')$$,'P0002','Writable property not found','missing property gets the same generic denial');
reset role;
select set_config('request.jwt.claim.sub','',true);
select set_config('request.jwt.claim.role','anon',true);
set local role anon;
select throws_ok($$select * from public.publish_current_item_with_instruction('5aaaaaaa-1111-4111-8111-111111111111','5aaaaaaa-0000-4000-8000-000000000026','Anon item','Anon title','Anon body')$$,'42501',null,'anonymous cannot execute publication');
reset role;

-- Validation rejects blank, oversized, outer-only, and unsafe values before writes.
select set_config('request.jwt.claim.sub','51111111-1111-4111-8111-111111111111',true);
select set_config('request.jwt.claim.role','authenticated',true);
set local role authenticated;
select throws_ok($$select * from public.publish_current_item_with_instruction('5aaaaaaa-1111-4111-8111-111111111111','5aaaaaaa-0000-4000-8000-000000000030',chr(160),'Title','Body')$$,'22023','Item name is required','Unicode-blank item name is rejected');
select throws_ok($$select * from public.publish_current_item_with_instruction('5aaaaaaa-1111-4111-8111-111111111111','5aaaaaaa-0000-4000-8000-000000000031','Item',chr(12288),'Body')$$,'22023','Instruction title is required','Unicode-blank title is rejected');
select throws_ok($$select * from public.publish_current_item_with_instruction('5aaaaaaa-1111-4111-8111-111111111111','5aaaaaaa-0000-4000-8000-000000000032','Item','Title',E'\n\t\n')$$,'22023','Instruction body is required','LF/TAB-only body is rejected');
select throws_ok($$select * from public.publish_current_item_with_instruction('5aaaaaaa-1111-4111-8111-111111111111','5aaaaaaa-0000-4000-8000-000000000033',repeat('i',121),'Title','Body')$$,'22001','Item name is too long','item name over 120 is rejected');
select throws_ok($$select * from public.publish_current_item_with_instruction('5aaaaaaa-1111-4111-8111-111111111111','5aaaaaaa-0000-4000-8000-000000000034','Item',repeat('t',121),'Body')$$,'22001','Instruction title is too long','title over 120 is rejected');
select throws_ok($$select * from public.publish_current_item_with_instruction('5aaaaaaa-1111-4111-8111-111111111111','5aaaaaaa-0000-4000-8000-000000000035','Item','Title',repeat('b',8001))$$,'22001','Instruction body is too long','body over 8000 is rejected');
select throws_ok($$select * from public.publish_current_item_with_instruction('5aaaaaaa-1111-4111-8111-111111111111','5aaaaaaa-0000-4000-8000-000000000036','Unsafe' || chr(917536),'Title','Body')$$,'22023','Item name contains unsupported characters','supplementary Unicode Cf item name is rejected');
select throws_ok($$select * from public.publish_current_item_with_instruction('5aaaaaaa-1111-4111-8111-111111111111','5aaaaaaa-0000-4000-8000-000000000037','Item','Unsafe' || chr(8232),'Body')$$,'22023','Instruction title contains unsupported characters','Unicode separator title is rejected');
select throws_ok($$select * from public.publish_current_item_with_instruction('5aaaaaaa-1111-4111-8111-111111111111','5aaaaaaa-0000-4000-8000-000000000038','Item','Title','Unsafe' || chr(917505))$$,'22023','Instruction body contains unsupported characters','supplementary Unicode Cf body is rejected');
select throws_ok($$select * from public.publish_current_item_with_instruction('5aaaaaaa-1111-4111-8111-111111111111','5aaaaaaa-0000-4000-8000-000000000039','Item','Title',E'Carriage\rreturn')$$,'22023','Instruction body contains unsupported characters','carriage return in body is rejected');
select throws_ok($$select * from public.publish_current_item_with_instruction('5aaaaaaa-1111-4111-8111-111111111111','5aaaaaaa-0000-4000-8000-000000000029','Item','Title','Unsafe' || chr(8233))$$,'22023','Instruction body contains unsupported characters','outer Unicode paragraph separator in body is rejected before trimming');
reset role;
select is((select count(*) from public.items where creation_request_id between '5aaaaaaa-0000-4000-8000-000000000029' and '5aaaaaaa-0000-4000-8000-000000000039'),0::bigint,'all validation failures occur before item writes');

-- Conflicting article state never publishes or mutates a draft.
insert into public.items (id,property_id,creation_request_id,name)
values
  ('5aaaaaaa-9000-4000-8000-000000000001','5aaaaaaa-1111-4111-8111-111111111111','5aaaaaaa-0000-4000-8000-000000000040','Occupied order'),
  ('5aaaaaaa-9000-4000-8000-000000000002','5aaaaaaa-1111-4111-8111-111111111111','5aaaaaaa-0000-4000-8000-000000000041','Wrong order'),
  ('5aaaaaaa-9000-4000-8000-000000000003','5aaaaaaa-1111-4111-8111-111111111111','5aaaaaaa-0000-4000-8000-000000000042','Two instructions');
insert into public.item_articles (item_id,creation_request_id,title,description,display_order)
values
  ('5aaaaaaa-9000-4000-8000-000000000001','5aaaaaaa-9000-4000-8000-000000000011','Existing title','Existing body',0),
  ('5aaaaaaa-9000-4000-8000-000000000002','5aaaaaaa-0000-4000-8000-000000000041','Requested title','Requested body',1),
  ('5aaaaaaa-9000-4000-8000-000000000003','5aaaaaaa-0000-4000-8000-000000000042','Requested title','Requested body',0),
  ('5aaaaaaa-9000-4000-8000-000000000003','5aaaaaaa-9000-4000-8000-000000000012','Second title','Second body',1);
set local role authenticated;
select throws_ok($$select * from public.publish_current_item_with_instruction('5aaaaaaa-1111-4111-8111-111111111111','5aaaaaaa-0000-4000-8000-000000000040','Occupied order','Requested title','Requested body')$$,'23505','Publication request conflicts with existing content','occupied order zero is a sanitized conflict');
select throws_ok($$select * from public.publish_current_item_with_instruction('5aaaaaaa-1111-4111-8111-111111111111','5aaaaaaa-0000-4000-8000-000000000041','Wrong order','Requested title','Requested body')$$,'23505','Publication request conflicts with existing content','same request at changed order is a sanitized conflict');
select throws_ok($$select * from public.publish_current_item_with_instruction('5aaaaaaa-1111-4111-8111-111111111111','5aaaaaaa-0000-4000-8000-000000000042','Two instructions','Requested title','Requested body')$$,'23505','Publication request conflicts with existing content','more than one instruction blocks publication');
reset role;
select is((select count(*) from public.items where id in ('5aaaaaaa-9000-4000-8000-000000000001','5aaaaaaa-9000-4000-8000-000000000002','5aaaaaaa-9000-4000-8000-000000000003') and published_at is not null),0::bigint,'all article conflicts leave drafts unpublished');
select is((select count(*) from public.item_articles where item_id='5aaaaaaa-9000-4000-8000-000000000001'),1::bigint,'article failure rolls back the attempted instruction insert');

-- A downstream article error also rolls back a newly created item.
create function public.probe_reject_publication_article()
returns trigger language plpgsql set search_path=pg_catalog
as $$begin raise exception using errcode='23514',message='probe article rejection'; end$$;
create trigger reject_publication_article before insert on public.item_articles
for each row when (new.title = 'Trigger rejection')
execute function public.probe_reject_publication_article();
set local role authenticated;
select throws_ok($$select * from public.publish_current_item_with_instruction('5aaaaaaa-1111-4111-8111-111111111111','5aaaaaaa-0000-4000-8000-000000000050','Rolled back','Trigger rejection','Valid body')$$,'23514','probe article rejection','downstream article failure escapes without partial success');
reset role;
select is((select count(*) from public.items where creation_request_id='5aaaaaaa-0000-4000-8000-000000000050'),0::bigint,'article failure rolls back the newly inserted item');
drop trigger reject_publication_article on public.item_articles;
drop function public.probe_reject_publication_article();

select * from finish();
rollback;
