begin;

select plan(26);

-- Catalog and least-privilege contract.
select has_function('public', 'read_public_item', array['uuid'], 'public reader exists'); -- 1
select has_function('public', 'publish_current_item_with_instruction', array['uuid','uuid','text','text','text'], 'atomic publication remains'); -- 2
select has_function('public', 'create_current_item', array['uuid','uuid','text'], 'owner compatibility function remains'); -- 3
select is(
  (select proargnames from pg_catalog.pg_proc where oid = 'public.read_public_item(uuid)'::regprocedure),
  array['p_public_id','public_id','name','instructions']::text[],
  'reader exposes exact argument and output names'
); -- 4
select is(
  (select proargmodes from pg_catalog.pg_proc where oid = 'public.read_public_item(uuid)'::regprocedure),
  array['i','t','t','t']::"char"[],
  'reader exposes one input and three table outputs'
); -- 5
select is(
  (select proallargtypes from pg_catalog.pg_proc where oid = 'public.read_public_item(uuid)'::regprocedure),
  array['pg_catalog.uuid'::regtype,'pg_catalog.uuid'::regtype,'pg_catalog.text'::regtype,'pg_catalog.jsonb'::regtype]::oid[],
  'reader output types are uuid, text, jsonb'
); -- 6
select ok((select prosecdef from pg_catalog.pg_proc where oid = 'public.read_public_item(uuid)'::regprocedure), 'reader is security definer'); -- 7
select is((select provolatile::text from pg_catalog.pg_proc where oid = 'public.read_public_item(uuid)'::regprocedure), 's', 'reader is stable'); -- 8
select is((select proconfig from pg_catalog.pg_proc where oid = 'public.read_public_item(uuid)'::regprocedure), array['search_path=pg_catalog']::text[], 'reader has fixed path'); -- 9
select ok(not has_function_privilege('PUBLIC', 'public.read_public_item(uuid)', 'EXECUTE'), 'PUBLIC cannot execute reader'); -- 10
select ok(has_function_privilege('anon', 'public.read_public_item(uuid)', 'EXECUTE'), 'anon can execute reader'); -- 11
select ok(has_function_privilege('authenticated', 'public.read_public_item(uuid)', 'EXECUTE'), 'authenticated can execute reader'); -- 12
select ok(not has_function_privilege('authenticated', 'public.create_current_item(uuid,uuid,text)', 'EXECUTE'), 'authenticated cannot use obsolete draft RPC'); -- 13
select ok(has_function_privilege('authenticated', 'public.publish_current_item_with_instruction(uuid,uuid,text,text,text)', 'EXECUTE'), 'authenticated keeps atomic publication RPC'); -- 14
select ok(not has_table_privilege('anon', 'public.items', 'SELECT'), 'anon has no item table grant'); -- 15
select ok(not has_table_privilege('anon', 'public.item_articles', 'SELECT'), 'anon has no article table grant'); -- 16

-- Owner-created fixtures exercise the anonymous security-definer projection.
insert into auth.users (id, email, email_confirmed_at)
values ('10000000-0000-4000-8000-000000000001', 'projection@example.test', now());
insert into public.users (id, email)
values ('10000000-0000-4000-8000-000000000001', 'projection@example.test');
insert into public.accounts (id, owner_id, name)
values ('20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', 'Projection account');
insert into public.account_users (account_id, user_id, role, joined_at)
values ('20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', 'owner', now());
insert into public.properties (id, user_id, property_type_id, nickname, account_id)
select '30000000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000001', id, 'Projection home',
  '20000000-0000-4000-8000-000000000001'
from public.property_types where name = 'other';
insert into public.items (id, public_id, property_id, creation_request_id, name, published_at)
values
  ('40000000-0000-4000-8000-000000000001','50000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000001','60000000-0000-4000-8000-000000000001','Coffee machine',now()),
  ('40000000-0000-4000-8000-000000000002','50000000-0000-4000-8000-000000000002','30000000-0000-4000-8000-000000000001','60000000-0000-4000-8000-000000000002','Draft kettle',null),
  ('40000000-0000-4000-8000-000000000003','50000000-0000-4000-8000-000000000003','30000000-0000-4000-8000-000000000001','60000000-0000-4000-8000-000000000003','Empty published item',now());
insert into public.item_articles (id, item_id, creation_request_id, purpose, title, description, display_order)
values
  ('70000000-0000-4000-8000-000000000002','40000000-0000-4000-8000-000000000001','80000000-0000-4000-8000-000000000002','instructions','Second','Second body',1),
  ('70000000-0000-4000-8000-000000000001','40000000-0000-4000-8000-000000000001','80000000-0000-4000-8000-000000000001','instructions','First','First body',0),
  ('70000000-0000-4000-8000-000000000003','40000000-0000-4000-8000-000000000002','80000000-0000-4000-8000-000000000003','instructions','Hidden','Draft body',0);

select is((select count(*)::integer from public.read_public_item('50000000-0000-4000-8000-000000000001')), 1, 'published useful item returns once'); -- 17
select is((select public_id from public.read_public_item('50000000-0000-4000-8000-000000000001')), '50000000-0000-4000-8000-000000000001'::uuid, 'public identity is returned'); -- 18
select is((select name from public.read_public_item('50000000-0000-4000-8000-000000000001')), 'Coffee machine', 'guest name is returned'); -- 19
select is((select jsonb_array_length(instructions) from public.read_public_item('50000000-0000-4000-8000-000000000001')), 2, 'all valid instructions are projected'); -- 20
select is((select instructions->0 from public.read_public_item('50000000-0000-4000-8000-000000000001')), '{"body":"First body","title":"First"}'::jsonb, 'display order is deterministic'); -- 21
select is((select instructions->1 from public.read_public_item('50000000-0000-4000-8000-000000000001')), '{"body":"Second body","title":"Second"}'::jsonb, 'second instruction follows display order'); -- 22
select is((select array_agg(key order by key) from public.read_public_item('50000000-0000-4000-8000-000000000001'), lateral jsonb_object_keys(instructions->0) as key), array['body','title']::text[], 'nested object exposes exactly title and body'); -- 23
select is((select count(*)::integer from public.read_public_item('50000000-0000-4000-8000-000000000002')), 0, 'draft and its instruction are invisible'); -- 24
select is((select count(*)::integer from public.read_public_item('50000000-0000-4000-8000-000000000003')), 0, 'published item without useful instruction is invisible'); -- 25
select is((select count(*)::integer from public.read_public_item('50000000-0000-4000-8000-000000000099')), 0, 'unknown identity matches draft absence'); -- 26

select * from finish();
rollback;
