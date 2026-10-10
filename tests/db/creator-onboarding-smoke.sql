-- End-to-end DB onboarding smoke test. Run on staging only.
-- Includes an authenticated signup fixture and checks public visibility.
-- The transaction rolls back all inserted rows.
begin;
do $smoke$
declare
 test_user uuid:=gen_random_uuid();
 stranger uuid:=gen_random_uuid();
 new_creator uuid;
 own_count integer;
 public_count integer;
 mutated_count integer;
begin
 insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at)
 values(test_user,'00000000-0000-0000-0000-000000000000',
 'authenticated','authenticated',
 'onboard-'||test_user::text||'@example.invalid',
 'fixture-only',now(),now(),now());
 perform set_config('request.jwt.claim.sub',test_user::text,true);
 execute 'set local role authenticated';

 new_creator:=public.create_creator_account(
   'verify-'||left(replace(test_user::text,'-',''),10),
   'Temporary Onboarding Test',
   'Smoke-test creator'
 );
 if new_creator is null then raise exception 'Onboarding returned no creator ID'; end if;
 select count(*) into own_count from public.creator_memberships
  where creator_id=new_creator and user_id=test_user and role_id='creator_owner';
 if own_count<>1 then raise exception 'Creator ownership membership missing'; end if;
 select count(*) into own_count from public.creator_sites
  where creator_id=new_creator and template_id='minimal' and visibility='draft';
 if own_count<>1 then raise exception 'Starter site with free template missing'; end if;

 execute 'set local role anon';
 select count(*) into public_count from public.creator_accounts where id=new_creator;
 if public_count<>0 then raise exception 'Unpublished creator exposed to visitors'; end if;
 select count(*) into public_count from public.creator_sites where creator_id=new_creator;
 if public_count<>0 then raise exception 'Unpublished site exposed to visitors'; end if;

 execute 'set local role authenticated';
 perform set_config('request.jwt.claim.sub',test_user::text,true);
 update public.creator_sites set visibility='published' where creator_id=new_creator;
 get diagnostics mutated_count = row_count;
 if mutated_count<>1 then raise exception 'Owner could not publish own site'; end if;

 perform set_config('request.jwt.claim.sub',stranger::text,true);
 update public.creator_sites set title='Unauthorized takeover' where creator_id=new_creator;
 get diagnostics mutated_count = row_count;
 if mutated_count<>0 then raise exception 'Stranger could edit creator website'; end if;

 execute 'set local role anon';
 select count(*) into public_count from public.creator_accounts where id=new_creator;
 if public_count<>1 then raise exception 'Published creator not visible publicly'; end if;
 select count(*) into public_count from public.creator_sites where creator_id=new_creator;
 if public_count<>1 then raise exception 'Published site not visible publicly'; end if;
end $smoke$;
rollback;
