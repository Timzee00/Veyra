-- Staging-only regression: private sites remain invisible to visitors.
-- Tests RLS under actual anon and authenticated SQL roles. All data rolls back.
begin;
do $smoke$
declare
 owner_id uuid:=gen_random_uuid();
 outsider uuid:=gen_random_uuid();
 creator uuid;
 all_creators uuid[]:=array[]::uuid[];
 idx integer;
 visible_count integer;
begin
 insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at)
 values(owner_id,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
 'visibility-smoke-'||owner_id::text||'@example.invalid','fixture',now(),now(),now());

 perform set_config('request.jwt.claim.sub',owner_id::text,true);
 for idx in 1..4 loop
  creator:=gen_random_uuid();
  all_creators:=array_append(all_creators,creator);
  insert into public.creator_accounts(id,owner_user_id,handle,display_name,status)
  values(creator,owner_id,'policy-'||idx||'-'||left(replace(owner_id::text,'-',''),10),
   'Temporary Policy Test',
   case when idx=4 then 'suspended'::public.creator_status else 'active'::public.creator_status end);
  insert into public.creator_sites(creator_id,visibility,template_id)
  values(creator,
   case when idx=1 then 'draft'::public.site_visibility
        when idx=2 then 'unlisted'::public.site_visibility
        else 'published'::public.site_visibility end,
   'minimal');
 end loop;

 execute 'set local role anon';
 select count(*) into visible_count from public.creator_sites where creator_id=any(all_creators);
 if visible_count<>1 then raise exception 'Anonymous saw % sites instead of 1',visible_count; end if;

 execute 'set local role authenticated';
 perform set_config('request.jwt.claim.sub',outsider::text,true);
 select count(*) into visible_count from public.creator_sites where creator_id=any(all_creators);
 if visible_count<>1 then raise exception 'Foreign account saw % sites instead of 1',visible_count; end if;

 perform set_config('request.jwt.claim.sub',owner_id::text,true);
 select count(*) into visible_count from public.creator_sites where creator_id=any(all_creators);
 if visible_count<>4 then raise exception 'Owner could see only % of 4 sites',visible_count; end if;
end $smoke$;
rollback;
