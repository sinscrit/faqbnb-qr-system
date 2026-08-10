begin;

create extension if not exists pgtap with schema extensions;
set search_path = public, extensions;

select plan(44);

select has_table('public', 'users', 'public users profile table exists');
select has_table('public', 'accounts', 'accounts table exists');
select has_table('public', 'account_users', 'membership table exists');
select has_function(
  'public',
  'bootstrap_current_user',
  array['text', 'text'],
  'authenticated bootstrap RPC exists'
);
select ok(
  not has_function_privilege('anon', 'public.bootstrap_current_user(text,text)', 'execute'),
  'anonymous role cannot execute bootstrap'
);
select ok(
  has_function_privilege('authenticated', 'public.bootstrap_current_user(text,text)', 'execute'),
  'authenticated role can execute bootstrap'
);
select ok(
  not has_function_privilege('public', 'public.bootstrap_current_user(text,text)', 'execute'),
  'PUBLIC has no bootstrap execute privilege'
);
select ok(
  not has_function_privilege('anon', 'private.current_user_is_account_member(uuid)', 'execute'),
  'anonymous role cannot execute the membership helper'
);
select ok(
  not has_function_privilege('anon', 'private.current_user_is_account_owner(uuid)', 'execute'),
  'anonymous role cannot execute the owner helper'
);
select ok(
  has_function_privilege('authenticated', 'private.current_user_is_account_member(uuid)', 'execute'),
  'authenticated policies can execute the membership helper'
);
select ok(
  has_function_privilege('authenticated', 'private.current_user_is_account_owner(uuid)', 'execute'),
  'authenticated policies can execute the owner helper'
);
select ok(
  not has_function_privilege('public', 'public.update_updated_at_column()', 'execute'),
  'PUBLIC has no direct trigger-helper execute privilege'
);
select ok(
  not has_function_privilege('anon', 'public.update_updated_at_column()', 'execute'),
  'anonymous role cannot execute the trigger helper'
);
select ok(
  not has_function_privilege('authenticated', 'public.update_updated_at_column()', 'execute'),
  'authenticated role cannot execute the trigger helper'
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
    'host-a@example.test',
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
    'host-b@example.test',
    '',
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    now(),
    now()
  );

set local role anon;
select set_config('request.jwt.claim.sub', '', true);
select set_config('request.jwt.claim.role', 'anon', true);
select throws_ok(
  $$select * from public.bootstrap_current_user()$$,
  '42501',
  'Authentication required',
  'unauthenticated bootstrap is denied'
);
reset role;

select set_config('request.jwt.claim.sub', '11111111-1111-4111-8111-111111111111', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;
select lives_ok(
  $$select * from public.bootstrap_current_user('Host A', 'Host A home')$$,
  'first authenticated bootstrap succeeds'
);
reset role;

select is(
  (select count(*) from public.users where id = '11111111-1111-4111-8111-111111111111'),
  1::bigint,
  'bootstrap creates one public profile'
);
select is(
  (select count(*) from public.accounts where owner_id = '11111111-1111-4111-8111-111111111111'),
  1::bigint,
  'bootstrap creates exactly one owned account'
);
select is(
  (
    select count(*)
    from public.account_users
    where user_id = '11111111-1111-4111-8111-111111111111'
      and role = 'owner'
  ),
  1::bigint,
  'bootstrap creates one owner membership'
);

select set_config('request.jwt.claim.sub', '11111111-1111-4111-8111-111111111111', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;
select lives_ok(
  $$select * from public.bootstrap_current_user('Host A revised', 'Ignored retry name')$$,
  'bootstrap retry succeeds'
);
reset role;

select is(
  (select count(*) from public.accounts where owner_id = '11111111-1111-4111-8111-111111111111'),
  1::bigint,
  'bootstrap retry remains single-account'
);
select is(
  (
    select name
    from public.accounts
    where owner_id = '11111111-1111-4111-8111-111111111111'
  ),
  'Host A home',
  'bootstrap retry preserves the initial account'
);
select is(
  (select full_name from public.users where id = '11111111-1111-4111-8111-111111111111'),
  'Host A revised',
  'bootstrap retry can repair the optional display name'
);

select set_config('request.jwt.claim.sub', '22222222-2222-4222-8222-222222222222', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;
select lives_ok(
  $$select * from public.bootstrap_current_user(null, null)$$,
  'second identity bootstrap succeeds with optional names omitted'
);
reset role;

select is(
  (select count(*) from public.accounts where owner_id = '22222222-2222-4222-8222-222222222222'),
  1::bigint,
  'second identity automatically receives one account'
);
select is(
  (select name from public.accounts where owner_id = '22222222-2222-4222-8222-222222222222'),
  'My account',
  'default account name needs no extra user step'
);

select set_config('request.jwt.claim.sub', '11111111-1111-4111-8111-111111111111', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;
select is((select count(*) from public.users), 1::bigint, 'identity A sees only its profile');
select is((select count(*) from public.accounts), 1::bigint, 'identity A sees only its account');
select is((select count(*) from public.account_users), 1::bigint, 'identity A sees only its account membership');
select ok(
  private.current_user_is_account_member((select id from public.accounts limit 1)),
  'non-recursive membership helper recognizes identity A'
);
select results_eq(
  $$
    with changed as (
      update public.accounts
      set description = 'A safe owner update'
      returning id
    )
    select count(*)::bigint from changed
  $$,
  $$values (1::bigint)$$,
  'identity A can update its own account'
);
select throws_ok(
  $$insert into public.accounts (owner_id, name) values (auth.uid(), 'Bypass')$$,
  '42501',
  null,
  'identity A cannot bypass bootstrap with a direct account insert'
);
select throws_ok(
  $$insert into public.users (id, email) values (auth.uid(), 'bypass@example.test')$$,
  '42501',
  null,
  'identity A cannot bypass bootstrap with a direct profile insert'
);
select throws_ok(
  $$insert into public.account_users (account_id, user_id, role) select id, auth.uid(), 'owner' from public.accounts limit 1$$,
  '42501',
  null,
  'identity A cannot bypass bootstrap with a direct membership insert'
);
reset role;

select set_config('request.jwt.claim.sub', '22222222-2222-4222-8222-222222222222', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;
select is(
  (
    select count(*)
    from public.accounts
    where owner_id = '11111111-1111-4111-8111-111111111111'
  ),
  0::bigint,
  'identity B cannot read identity A account'
);
select is(
  (
    select count(*)
    from public.users
    where id = '11111111-1111-4111-8111-111111111111'
  ),
  0::bigint,
  'identity B cannot read identity A profile'
);
select is(
  (
    select count(*)
    from public.account_users
    where user_id = '11111111-1111-4111-8111-111111111111'
  ),
  0::bigint,
  'identity B cannot read identity A membership'
);
select results_eq(
  $$
    with changed as (
      update public.accounts
      set description = 'Cross-account write'
      where owner_id = '11111111-1111-4111-8111-111111111111'
      returning id
    )
    select count(*)::bigint from changed
  $$,
  $$values (0::bigint)$$,
  'identity B cannot update identity A account'
);
reset role;

select set_config('request.jwt.claim.sub', '', true);
select set_config('request.jwt.claim.role', 'anon', true);
set local role anon;
select throws_ok(
  $$select count(*) from public.users$$,
  '42501',
  null,
  'anonymous role cannot read profiles'
);
select throws_ok(
  $$select count(*) from public.accounts$$,
  '42501',
  null,
  'anonymous role cannot read accounts'
);
select throws_ok(
  $$select count(*) from public.account_users$$,
  '42501',
  null,
  'anonymous role cannot read memberships'
);
reset role;

-- Historical data may already contain multiple accounts for one owner. The
-- bootstrap must choose deterministically, repair only that account's owner
-- membership, and never delete or consolidate the other account implicitly.
insert into public.accounts (owner_id, name, created_at)
values (
  '11111111-1111-4111-8111-111111111111',
  'Legacy A account',
  '2000-01-01 00:00:00+00'::timestamptz
);

select set_config('request.jwt.claim.sub', '11111111-1111-4111-8111-111111111111', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;
select is(
  (select account_name from public.bootstrap_current_user(null, 'Ignored multiple-account name')),
  'Legacy A account',
  'bootstrap deterministically reuses the earliest existing owned account'
);
select is(
  (select count(*) from public.accounts),
  2::bigint,
  'bootstrap preserves multiple existing owned accounts without adding another'
);
select is(
  (
    select count(*)
    from public.account_users
    where user_id = auth.uid()
      and role = 'owner'
  ),
  2::bigint,
  'bootstrap repairs owner membership for the selected existing account'
);
reset role;

select * from finish();
rollback;
