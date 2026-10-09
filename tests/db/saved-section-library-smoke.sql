-- Staging-only private reusable section library regression. All fixtures roll back.
begin;
do $smoke$
declare
 owner_id uuid:=gen_random_uuid();
 stranger uuid:=gen_random_uuid();
 creator uuid:=gen_random_uuid();
 layout jsonb:='[{"id":"headline","type":"heading","props":{"text":"Reusable title"},"children":[]}]'::jsonb;
 saved_id uuid;
 visible_count integer;
 idx integer;
begin
 insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at)
 values(owner_id,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
 'section-kit-'||owner_id::text||'@example.invalid','fixture',now(),now(),now());
 perform set_config('request.jwt.claim.sub',owner_id::text,true);
 insert into public.creator_accounts(id,owner_user_id,handle,display_name)
 values(creator,owner_id,'kits-'||left(replace(owner_id::text,'-',''),12),'Section Library Test');
 execute 'set local role authenticated';

 insert into public.site_section_library(creator_id,name,blocks)
 values(creator,'Homepage hero',layout) returning id into saved_id;
 select block_count into visible_count from public.site_section_library where id=saved_id;
 if visible_count<>1 then raise exception 'Generated block count is incorrect'; end if;

 for idx in 2..24 loop
  insert into public.site_section_library(creator_id,name,blocks)
  values(creator,'Kit '||idx,layout);
 end loop;
 begin
  insert into public.site_section_library(creator_id,name,blocks)
  values(creator,'Kit 25 must be rejected',layout);
  raise exception 'Quota was bypassed';
 exception when check_violation then null;
 end;

 perform set_config('request.jwt.claim.sub',stranger::text,true);
 select count(*) into visible_count from public.site_section_library where creator_id=creator;
 if visible_count<>0 then raise exception 'Another user can see saved kits'; end if;
 delete from public.site_section_library where id=saved_id;
 get diagnostics visible_count=row_count;
 if visible_count<>0 then raise exception 'Another user could delete owner kits'; end if;

 execute 'set local role anon';
 begin
  perform 1 from public.site_section_library where creator_id=creator;
  raise exception 'Anonymous client can read section library';
 exception when insufficient_privilege then null;
 end;

 execute 'set local role authenticated';
 perform set_config('request.jwt.claim.sub',owner_id::text,true);
 select count(*) into visible_count from public.site_section_library where creator_id=creator;
 if visible_count<>24 then raise exception 'Owner expected 24 kits but sees %',visible_count; end if;
end $smoke$;
rollback;
