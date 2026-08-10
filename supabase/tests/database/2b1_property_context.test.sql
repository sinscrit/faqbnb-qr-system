begin;

create extension if not exists pgtap with schema extensions;
set search_path = public, extensions;

select plan(77);

-- Shape, seed, least grants, RLS, and non-recursive policy structure.
select has_table('public', 'property_types', 'property type table exists');
select has_table('public', 'properties', 'property table exists');
select has_function(
  'public',
  'resolve_current_property',
  array['text', 'text', 'text'],
  'property context RPC has only content inputs'
);
select ok(
  (
    select column.is_nullable = 'NO'
    from information_schema.columns as column
    where column.table_schema = 'public'
      and column.table_name = 'properties'
      and column.column_name = 'account_id'
  ),
  'canonical property account_id is non-null'
);
select is(
  (select count(*) from public.property_types),
  7::bigint,
  'isolated product taxonomy contains exactly seven types'
);
select results_eq(
  $$
    select id, display_name::text
    from public.property_types
    where name = 'other'
  $$,
  $$values ('00000000-0000-4000-8000-000000000107'::uuid, 'Other'::text)$$,
  'other is a stable deterministic default type'
);
select is(
  (select count(distinct name) from public.property_types),
  7::bigint,
  'every seeded type name is unique'
);
select ok(
  has_table_privilege('authenticated', 'public.property_types', 'select'),
  'authenticated clients can read property types'
);
select ok(
  not has_table_privilege('anon', 'public.property_types', 'select'),
  'anonymous clients cannot read property types'
);
select ok(
  not has_table_privilege('public', 'public.property_types', 'select'),
  'PUBLIC has no property type table privilege'
);
select ok(
  not has_table_privilege('authenticated', 'public.property_types', 'insert'),
  'authenticated clients cannot insert property types'
);
select ok(
  not has_table_privilege('authenticated', 'public.property_types', 'update'),
  'authenticated clients cannot update property types'
);
select ok(
  not has_table_privilege('authenticated', 'public.property_types', 'delete'),
  'authenticated clients cannot delete property types'
);
select ok(
  has_table_privilege('authenticated', 'public.properties', 'select'),
  'authenticated clients can read member-visible properties'
);
select ok(
  not has_table_privilege('authenticated', 'public.properties', 'insert'),
  'authenticated clients cannot insert properties directly'
);
select ok(
  not has_table_privilege('authenticated', 'public.properties', 'update'),
  'authenticated clients cannot update properties directly'
);
select ok(
  not has_table_privilege('authenticated', 'public.properties', 'delete'),
  'authenticated clients cannot delete properties directly'
);
select ok(
  not has_table_privilege('anon', 'public.properties', 'select'),
  'anonymous clients cannot read properties'
);
select ok(
  not has_table_privilege('public', 'public.properties', 'select'),
  'PUBLIC has no property table privilege'
);
select ok(
  has_function_privilege(
    'authenticated',
    'public.resolve_current_property(text,text,text)',
    'execute'
  ),
  'authenticated clients can execute the property context RPC'
);
select ok(
  not has_function_privilege(
    'anon',
    'public.resolve_current_property(text,text,text)',
    'execute'
  ),
  'anonymous clients cannot execute the property context RPC'
);
select ok(
  not has_function_privilege(
    'public',
    'public.resolve_current_property(text,text,text)',
    'execute'
  ),
  'PUBLIC has no property context RPC execution privilege'
);
select ok(
  not has_function_privilege(
    'authenticated',
    'private.current_user_can_write_account(uuid)',
    'execute'
  ),
  'write-authority helper is not client executable'
);
select ok(
  not has_function_privilege(
    'authenticated',
    'private.text_has_unsafe_control(text)',
    'execute'
  ),
  'unsafe-text helper is not client executable'
);
select ok(
  (
    select
      rpc.prosecdef
      and rpc.proowner = property.relowner
      and rpc.proconfig = array['search_path=pg_catalog']::text[]
    from pg_proc as rpc
    cross join pg_class as property
    where rpc.oid = 'public.resolve_current_property(text,text,text)'::regprocedure
      and property.oid = 'public.properties'::regclass
  ),
  'property context RPC is a fixed-path security definer owned with its table'
);
select ok(
  (
    select
      helper.prosecdef
      and helper.proowner = property.relowner
      and helper.proconfig = array['search_path=pg_catalog']::text[]
    from pg_proc as helper
    cross join pg_class as property
    where helper.oid = 'private.current_user_can_write_account(uuid)'::regprocedure
      and property.oid = 'public.properties'::regclass
  ),
  'write-authority helper is a fixed-path security definer owned with its table'
);
select ok(
  (
    select
      not helper.prosecdef
      and helper.provolatile = 'i'
      and helper.proconfig = array['search_path=pg_catalog']::text[]
    from pg_proc as helper
    where helper.oid = 'private.text_has_unsafe_control(text)'::regprocedure
  ),
  'unsafe-text helper is fixed-path, immutable, and security invoker'
);
select ok(
  (select relrowsecurity from pg_class where oid = 'public.property_types'::regclass),
  'property types have RLS enabled'
);
select ok(
  (select relrowsecurity from pg_class where oid = 'public.properties'::regclass),
  'properties have RLS enabled'
);
select is(
  (
    select count(*)
    from pg_policy
    where polrelid = 'public.properties'::regclass
      and polcmd = 'r'
  ),
  1::bigint,
  'properties expose exactly one select policy'
);
select ok(
  (
    select pg_get_expr(polqual, polrelid)
      like '%current_user_is_account_member(account_id)%'
    from pg_policy
    where polrelid = 'public.properties'::regclass
      and polcmd = 'r'
  ),
  'property select policy delegates to the non-recursive membership helper'
);
select is(
  (
    select count(*)
    from pg_policy
    where polrelid = 'public.properties'::regclass
      and polcmd in ('a', 'w', 'd')
  ),
  0::bigint,
  'properties have no direct client write policies'
);

insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
values
  (
    '00000000-0000-0000-0000-000000000000',
    '11111111-1111-4111-8111-111111111111',
    'authenticated',
    'authenticated',
    'property-host-a@example.test',
    '',
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '22222222-2222-4222-8222-222222222222',
    'authenticated',
    'authenticated',
    'property-host-b@example.test',
    '',
    null,
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    now(),
    now()
  );

insert into public.users (id, email)
values
  ('11111111-1111-4111-8111-111111111111', 'property-host-a@example.test'),
  ('22222222-2222-4222-8222-222222222222', 'property-host-b@example.test');

insert into public.accounts (id, owner_id, name, created_at)
values
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    '11111111-1111-4111-8111-111111111111',
    'Property host A',
    '2026-01-01 00:00:00+00'
  ),
  (
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    '22222222-2222-4222-8222-222222222222',
    'Property host B',
    '2026-02-01 00:00:00+00'
  );

insert into public.account_users (account_id, user_id, role, joined_at)
values
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    '11111111-1111-4111-8111-111111111111',
    'owner',
    now()
  ),
  (
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    '22222222-2222-4222-8222-222222222222',
    'member',
    now()
  );

-- The role grant itself rejects an anonymous contract call.
select set_config('request.jwt.claim.sub', '', true);
select set_config('request.jwt.claim.role', 'anon', true);
set local role anon;
select throws_ok(
  $$select * from public.resolve_current_property()$$,
  '42501',
  null,
  'anonymous property context is denied'
);
reset role;

-- An authenticated role without confirmed email ownership also fails.
select set_config('request.jwt.claim.sub', '22222222-2222-4222-8222-222222222222', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;
select throws_ok(
  $$select * from public.resolve_current_property()$$,
  '42501',
  'Confirmed email required',
  'unconfirmed authenticated identity cannot resolve property context'
);
reset role;

update auth.users
set email_confirmed_at = statement_timestamp()
where id = '22222222-2222-4222-8222-222222222222';

-- Zero-property state and bounded creation inputs.
select set_config('request.jwt.claim.sub', '11111111-1111-4111-8111-111111111111', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;
select is(
  (select state from public.resolve_current_property()),
  'needs_property',
  'zero properties returns the single obvious next state'
);
select is(
  (select property_count from public.resolve_current_property()),
  0::bigint,
  'zero state reports a zero property count'
);
select is(
  (select property_id from public.resolve_current_property()),
  null::uuid,
  'zero state never invents a selected property'
);
select throws_ok(
  $$select * from public.resolve_current_property('   ')$$,
  '22023',
  'Property name is required',
  'blank submitted property name is rejected'
);
select throws_ok(
  $$select * from public.resolve_current_property(repeat('n', 101))$$,
  '22001',
  'Property name is too long',
  'overlong property name is rejected'
);
select throws_ok(
  $$select * from public.resolve_current_property('Valid name', repeat('a', 501))$$,
  '22001',
  'Property address is too long',
  'overlong property address is rejected'
);
select throws_ok(
  $$select * from public.resolve_current_property('Valid name', null, 'spaceship')$$,
  '22023',
  'Unknown property type',
  'unknown property type is rejected'
);
select throws_ok(
  $$select * from public.resolve_current_property(E'Line\nbreak')$$,
  '22023',
  'Property name contains unsupported characters',
  'ASCII control characters are rejected from property names'
);
select throws_ok(
  $$select * from public.resolve_current_property('Zero​width')$$,
  '22023',
  'Property name contains unsupported characters',
  'Unicode zero-width controls are rejected from property names'
);
select throws_ok(
  $$select * from public.resolve_current_property('Valid name', 'Unsafe‮address')$$,
  '22023',
  'Property address contains unsupported characters',
  'Unicode directional controls are rejected from property addresses'
);
select is(
  (select count(*) from public.properties),
  0::bigint,
  'failed validation attempts create no property'
);
reset role;

select throws_ok(
  $$
    insert into public.properties (
      user_id, property_type_id, nickname, account_id
    ) values (
      '11111111-1111-4111-8111-111111111111',
      '00000000-0000-4000-8000-000000000107',
      'Unsafe​name',
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
    )
  $$,
  '23514',
  null,
  'table constraint rejects an unsafe Unicode property name'
);
select throws_ok(
  $$
    insert into public.properties (
      user_id, property_type_id, nickname, address, account_id
    ) values (
      '11111111-1111-4111-8111-111111111111',
      '00000000-0000-4000-8000-000000000107',
      'Valid name',
      'Unsafe‮address',
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
    )
  $$,
  '23514',
  null,
  'table constraint rejects an unsafe Unicode property address'
);

-- First creation, optional address/default type, retry, and own read.
select set_config('request.jwt.claim.sub', '11111111-1111-4111-8111-111111111111', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;
select is(
  (select state from public.resolve_current_property('  Seaside home  ', '   ', null)),
  'ready',
  'first property is created atomically and returned ready'
);
select is(
  (select property_nickname from public.resolve_current_property()),
  'Seaside home',
  'property name is normalized once'
);
select is(
  (select property_type_name from public.resolve_current_property()),
  'other',
  'omitted property type uses the other default'
);
select is(
  (select property_address from public.resolve_current_property()),
  null::text,
  'blank optional address is stored as null'
);
select ok(
  exists (
    select 1
    from public.properties
    where account_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
      and user_id = auth.uid()
  ),
  'created property derives account and compatibility creator from server identity'
);
select is(
  (select state from public.resolve_current_property('Ignored rename', 'Ignored address', 'villa')),
  'ready',
  'retry with one property returns ready'
);
select is(
  (select count(*) from public.properties),
  1::bigint,
  'retry does not duplicate the first property'
);
select results_eq(
  $$select nickname::text, address from public.properties$$,
  $$values ('Seaside home'::text, null::text)$$,
  'retry does not rename or modify the existing property'
);
select is(
  (select count(*) from public.properties),
  1::bigint,
  'owner can read exactly the property in the selected account'
);
reset role;

-- A second identity, cross-account denial, member and viewer reads.
select set_config('request.jwt.claim.sub', '22222222-2222-4222-8222-222222222222', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;
select results_eq(
  $$
    select property_nickname, property_address, property_type_name
    from public.resolve_current_property('City apartment', '  10 Main Street  ', 'HOUSE')
  $$,
  $$values ('City apartment'::text, '10 Main Street'::text, 'house'::text)$$,
  'account member creates a typed property with normalized optional address'
);
select ok(
  exists (
    select 1
    from public.properties
    where account_id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'
      and user_id = auth.uid()
      and property_type_id = '00000000-0000-4000-8000-000000000102'
  ),
  'second property keeps the server-derived identity and selected seed type'
);
select is(
  (
    select count(*)
    from public.properties
    where account_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
  ),
  0::bigint,
  'identity B cannot read identity A property without membership'
);
reset role;

insert into public.account_users (account_id, user_id, role, joined_at)
values (
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  '22222222-2222-4222-8222-222222222222',
  'member',
  now()
);

select set_config('request.jwt.claim.sub', '22222222-2222-4222-8222-222222222222', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;
select is(
  (select count(*) from public.properties),
  2::bigint,
  'member sees properties across both valid memberships'
);
reset role;

update public.account_users
set role = 'viewer'
where account_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
  and user_id = '22222222-2222-4222-8222-222222222222';

select set_config('request.jwt.claim.sub', '22222222-2222-4222-8222-222222222222', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;
select is(
  (select count(*) from public.properties),
  2::bigint,
  'viewer retains read-only property visibility'
);
select is(
  (select account_id from public.resolve_current_property()),
  'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'::uuid,
  'an earlier viewer membership does not shadow a later writable account'
);
reset role;

-- Direct writes and viewer-only context are denied.
select set_config('request.jwt.claim.sub', '11111111-1111-4111-8111-111111111111', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;
select throws_ok(
  $$
    insert into public.properties (
      user_id, property_type_id, nickname, account_id
    ) values (
      auth.uid(),
      '00000000-0000-4000-8000-000000000107',
      'Direct insert',
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
    )
  $$,
  '42501',
  null,
  'owner cannot bypass the RPC with a direct insert'
);
select throws_ok(
  $$update public.properties set nickname = 'Direct update'$$,
  '42501',
  null,
  'owner cannot directly update properties in this slice'
);
select throws_ok(
  $$delete from public.properties$$,
  '42501',
  null,
  'owner cannot directly delete properties in this slice'
);
reset role;

update public.account_users
set role = 'viewer'
where user_id = '22222222-2222-4222-8222-222222222222';

select set_config('request.jwt.claim.sub', '22222222-2222-4222-8222-222222222222', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;
select throws_ok(
  $$select * from public.resolve_current_property('Viewer write')$$,
  'P0002',
  'No writable account membership',
  'viewer-only identity cannot acquire property write context'
);
reset role;
select is(
  (select count(*) from public.properties),
  2::bigint,
  'viewer write attempt changes no property data'
);

update public.account_users
set role = 'owner'
where account_id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'
  and user_id = '22222222-2222-4222-8222-222222222222';

-- Several properties require an explicit future selection surface.
insert into public.properties (
  user_id,
  property_type_id,
  nickname,
  account_id
)
values (
  '11111111-1111-4111-8111-111111111111',
  '00000000-0000-4000-8000-000000000103',
  'Mountain villa',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
);

select set_config('request.jwt.claim.sub', '11111111-1111-4111-8111-111111111111', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;
select is(
  (select state from public.resolve_current_property('Must not create')),
  'selection_required',
  'multiple properties return selection_required without guessing'
);
select is(
  (select property_count from public.resolve_current_property()),
  2::bigint,
  'selection_required reports the exact property count'
);
select is(
  (select property_id from public.resolve_current_property()),
  null::uuid,
  'selection_required never auto-selects a property ID'
);
select results_eq(
  $$
    select
      property_nickname,
      property_address,
      property_type_name,
      property_type_display_name
    from public.resolve_current_property()
  $$,
  $$values (null::text, null::text, null::text, null::text)$$,
  'selection_required leaks no implicit property details'
);
select is(
  (
    select count(*)
    from public.properties
    where account_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
  ),
  2::bigint,
  'multiple-property retry neither creates nor consolidates rows'
);
select ok(
  exists (
    select 1
    from public.properties
    where account_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
      and nickname = 'Seaside home'
  ),
  'multiple-property retry does not rename existing data'
);
reset role;

-- Account context is deterministic and still needs only one user step.
insert into public.accounts (id, owner_id, name, created_at)
values (
  'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
  '11111111-1111-4111-8111-111111111111',
  'Earlier imported account',
  '2000-01-01 00:00:00+00'
);
insert into public.account_users (account_id, user_id, role, joined_at)
values (
  'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
  '11111111-1111-4111-8111-111111111111',
  'owner',
  now()
);

select set_config('request.jwt.claim.sub', '11111111-1111-4111-8111-111111111111', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;
select is(
  (select account_id from public.resolve_current_property()),
  'cccccccc-cccc-4ccc-8ccc-cccccccccccc'::uuid,
  'RPC derives the deterministic earliest writable account server-side'
);
select is(
  (select state from public.resolve_current_property()),
  'needs_property',
  'earliest account with no property asks for one name only'
);
select is(
  (select state from public.resolve_current_property('Imported cottage')),
  'ready',
  'first property for the derived account is created atomically'
);
select is(
  (
    select count(*)
    from public.properties
    where account_id = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc'
      and user_id = auth.uid()
  ),
  1::bigint,
  'derived account receives exactly one server-attributed property'
);
reset role;

select * from finish();
rollback;
