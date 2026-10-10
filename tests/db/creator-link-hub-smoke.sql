-- Staging-only creator link hub and image-library RLS test.
-- All fixture writes are rolled back.
begin;
do $test$
declare
 owner_id uuid:=gen_random_uuid();
 stranger uuid:=gen_random_uuid();
 creator uuid:=gen_random_uuid();
 visible integer;
 i integer;
begin
 insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at)
 values(owner_id,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
  'link-smoke-'||owner_id::text||'@example.invalid','no-login-fixture',now(),now(),now());
 perform set_config('request.jwt.claim.sub',owner_id::text,true);
 insert into public.creator_accounts(id,owner_user_id,handle,display_name)
 values(creator,owner_id,'link-'||left(replace(owner_id::text,'-',''),12),'Link smoke');
 insert into public.creator_sites(creator_id,visibility,template_id) values(creator,'draft','minimal');
 execute 'set local role authenticated';
 insert into public.creator_links(creator_id,label,url,position)
 values(creator,'My portfolio','https://example.com',0);
 insert into public.creator_links(creator_id,label,url,position,is_visible)
 values(creator,'Hidden link','https://example.org',1,false);

 execute 'set local role anon';
 perform set_config('request.jwt.claim.sub','',true);
 select count(*) into visible from public.creator_links where creator_id=creator;
 if visible<>0 then raise exception 'Private links visible before publish'; end if;

 execute 'set local role authenticated';
 perform set_config('request.jwt.claim.sub',owner_id::text,true);
 update public.creator_sites set visibility='published' where creator_id=creator;
 execute 'set local role anon';
 select count(*) into visible from public.creator_links where creator_id=creator;
 if visible<>1 then raise exception 'Expected one public link, got %',visible;end if;

 execute 'set local role authenticated';
 perform set_config('request.jwt.claim.sub',stranger::text,true);
 select count(*) into visible from public.creator_assets where creator_id=creator;
 if visible<>0 then raise exception 'Foreign creator assets exposed'; end if;
 begin
  insert into public.creator_links(creator_id,label,url)
  values(creator,'Unauthorized','https://example.net');
  raise exception 'Foreign account added link';
 exception when insufficient_privilege then null;
 end;
 perform set_config('request.jwt.claim.sub',owner_id::text,true);
 for i in 3..24 loop
  insert into public.creator_links(creator_id,label,url,position)
  values(creator,'Link '||i,'https://example.com/link',i);
 end loop;
 begin
  insert into public.creator_links(creator_id,label,url,position)
  values(creator,'Link 25','https://example.com/overflow',25);
  raise exception 'Link limit not enforced';
 exception when check_violation then null;
 end;
end $test$;
rollback;