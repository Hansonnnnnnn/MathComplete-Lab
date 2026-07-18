-- Run after migrations in a disposable/local Supabase database.
begin;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name in ('plan', 'role')
  ) then raise exception 'profiles still exposes an entitlement column'; end if;

  if not exists (
    select 1 from information_schema.table_constraints
    where table_schema = 'public' and table_name = 'attempts'
      and constraint_type = 'UNIQUE'
  ) then raise exception 'attempt idempotency constraint is missing'; end if;

  if not exists (
    select 1 from pg_proc join pg_namespace on pg_namespace.oid = pg_proc.pronamespace
    where pg_namespace.nspname = 'public' and pg_proc.proname = 'record_attempt'
  ) then raise exception 'record_attempt RPC is missing'; end if;

  if exists (
    select 1 from information_schema.role_table_grants
    where table_schema = 'public' and table_name = 'account_entitlements'
      and grantee = 'authenticated' and privilege_type in ('INSERT', 'UPDATE', 'DELETE')
  ) then raise exception 'authenticated can modify entitlements'; end if;

  if exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'mfa_recovery_codes'
  ) then raise exception 'recovery codes must not have client RLS policies'; end if;

  if (
    select count(*) from pg_policies
    where schemaname = 'public' and policyname like '%_mfa_access'
  ) < 6 then raise exception 'restrictive MFA policies are incomplete'; end if;
end $$;

-- Runtime RLS checks with two disposable users. The transaction is rolled back.
insert into auth.users (
  id, aud, role, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values
  ('10000000-0000-4000-8000-000000000001', 'authenticated', 'authenticated', 'rls-a@example.invalid', '{}'::jsonb, '{}'::jsonb, now(), now()),
  ('20000000-0000-4000-8000-000000000002', 'authenticated', 'authenticated', 'rls-b@example.invalid', '{}'::jsonb, '{}'::jsonb, now(), now())
on conflict (id) do nothing;

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"10000000-0000-4000-8000-000000000001","role":"authenticated","aal":"aal1"}',
  true
);
select public.record_attempt(jsonb_build_object(
  'client_attempt_id', 'a0000000-0000-4000-8000-000000000001',
  'game_id', 'rls-test',
  'question_key', 'user-a-question',
  'is_correct', true
));

reset role;
set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"20000000-0000-4000-8000-000000000002","role":"authenticated","aal":"aal1"}',
  true
);
select public.record_attempt(jsonb_build_object(
  'client_attempt_id', 'b0000000-0000-4000-8000-000000000002',
  'game_id', 'rls-test',
  'question_key', 'user-b-question',
  'is_correct', false
));

reset role;
set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"10000000-0000-4000-8000-000000000001","role":"authenticated","aal":"aal1"}',
  true
);

do $$
declare affected integer;
begin
  if (select count(*) from public.attempts where game_id = 'rls-test') <> 1 then
    raise exception 'cross-user attempt read was not blocked';
  end if;

  update public.profiles
  set display_name = 'cross-user-write'
  where id = '20000000-0000-4000-8000-000000000002';
  get diagnostics affected = row_count;
  if affected <> 0 then raise exception 'cross-user profile update was not blocked'; end if;

  begin
    update public.account_entitlements
    set role = 'admin'
    where user_id = '10000000-0000-4000-8000-000000000001';
    raise exception 'authenticated user can modify entitlements';
  exception when insufficient_privilege then null;
  end;

  begin
    insert into public.attempts (user_id, game_id, question_key)
    values ('10000000-0000-4000-8000-000000000001', 'direct-write', 'blocked');
    raise exception 'authenticated user can bypass record_attempt';
  exception when insufficient_privilege then null;
  end;
end $$;

reset role;

rollback;
