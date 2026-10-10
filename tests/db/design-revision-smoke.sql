-- Staging-only test for appearance draft conflict protection and publication approval.
-- Temporary fixtures are always rolled back.
begin;
do $smoke$
declare
 owner_id uuid:=gen_random_uuid();
 outsider uuid:=gen_random_uuid();
 creator uuid:=gen_random_uuid();
 first_design jsonb:='{"accent":"#123456","font":"sans","motion":"subtle","radius":"soft","heroAlignment":"left"}';
 second_design jsonb:='{"accent":"#fedcba","font":"serif","motion":"none","radius":"sharp","heroAlignment":"center"}';
 saved_revision integer;
begin
 insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at)
 values(owner_id,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
 'design-smoke-'||owner_id::text||'@example.invalid','fixture-only',now(),now(),now());
 perform set_config('request.jwt.claim.sub',owner_id::text,true);
 insert into public.creator_accounts(id,owner_user_id,handle,display_name)
 values(creator,owner_id,'design-'||left(replace(owner_id::text,'-',''),12),'Design Smoke');
 insert into public.creator_sites(creator_id,visibility,template_id)
 values(creator,'published','minimal');
 execute 'set local role authenticated';

 saved_revision:=public.veyra_save_design_draft(creator,0,first_design);
 if saved_revision<>1 then raise exception 'First save revision incorrect'; end if;

 begin
  perform public.veyra_save_design_draft(creator,0,second_design);
  raise exception 'Stale draft overwrite succeeded';
 exception when serialization_failure then null;
 end;

 perform public.veyra_publish_design(creator,1);
 if (select design_published from public.creator_sites where creator_id=creator)<>first_design then
  raise exception 'Approved design not published';
 end if;

 saved_revision:=public.veyra_save_design_draft(creator,1,second_design);
 if saved_revision<>2 then raise exception 'Second save revision incorrect'; end if;

 begin
  perform public.veyra_publish_design(creator,1);
  raise exception 'Stale revision was published';
 exception when serialization_failure then null;
 end;

 if (select design_published from public.creator_sites where creator_id=creator)<>first_design then
  raise exception 'Failed publish unexpectedly changed public website';
 end if;

 begin
  update public.creator_site_design_drafts set design=first_design where creator_id=creator;
  raise exception 'Direct client design update succeeded';
 exception when insufficient_privilege then null;
 end;

 perform set_config('request.jwt.claim.sub',outsider::text,true);
 if exists(select 1 from public.creator_site_design_drafts where creator_id=creator) then
  raise exception 'Foreign user can read private design draft';
 end if;
 begin
  perform public.veyra_save_design_draft(creator,2,first_design);
  raise exception 'Foreign user saved another owner design';
 exception when insufficient_privilege then null;
 end;
end $smoke$;
rollback;
