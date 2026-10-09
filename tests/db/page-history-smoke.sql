-- Veyra staging-only database smoke test.
-- Run ONLY against a dedicated staging DB using a trusted SQL editor.
-- Every fixture is removed by the outer ROLLBACK; no persistent users/content.
begin;
do $smoke$
declare
  fixture_owner uuid := gen_random_uuid();
  other_user uuid := gen_random_uuid();
  fixture_creator uuid := gen_random_uuid();
  fixture_page uuid := gen_random_uuid();
  snapshot uuid;
  revision_result integer;
  visible_rows integer;
begin
  insert into auth.users
    (id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at)
  values
    (fixture_owner,'00000000-0000-0000-0000-000000000000',
     'authenticated','authenticated',
     'veyra-smoke-'||fixture_owner::text||'@example.invalid',
     'non-login-fixture',now(),now(),now());

  perform set_config('request.jwt.claim.sub',fixture_owner::text,true);
  insert into public.creator_accounts(id,owner_user_id,handle,display_name)
    values(fixture_creator,fixture_owner,
      'smoke-'||left(replace(fixture_owner::text,'-',''),12),'Staging Test');
  insert into public.creator_sites(creator_id,visibility,template_id)
    values(fixture_creator,'published','minimal');
  insert into public.site_pages(id,creator_id,title,slug,draft_blocks)
    values(fixture_page,fixture_creator,'Original','smokepage',
      '[{"id":"testheading","type":"heading","props":{"text":"Real heading"},"children":[]}]'::jsonb);

  perform public.veyra_publish_site_page(fixture_page,0);
  select id into snapshot from public.site_page_versions where page_id=fixture_page;
  if snapshot is null then raise exception 'Publication did not capture a snapshot'; end if;

  update public.site_pages set title='Unpublished change',revision=revision+1
   where id=fixture_page;
  revision_result := public.veyra_restore_page_version(fixture_page,snapshot,1);
  if revision_result<>2 then raise exception 'Restore revision mismatch'; end if;
  if (select title from public.site_pages where id=fixture_page)<>'Original' then
    raise exception 'Restore did not update private draft';
  end if;
  if (select title from public.site_page_publications where page_id=fixture_page)<>'Original' then
    raise exception 'Restore unexpectedly changed published page';
  end if;

  -- Exercise RLS with the real authenticated DB role (not bypassing it as postgres).
  execute 'set local role authenticated';
  select count(*) into visible_rows from public.site_page_versions where page_id=fixture_page;
  if visible_rows<>1 then raise exception 'Owner cannot see own publication history'; end if;
  perform set_config('request.jwt.claim.sub',other_user::text,true);
  select count(*) into visible_rows from public.site_page_versions where page_id=fixture_page;
  if visible_rows<>0 then raise exception 'Foreign user can see another owner history'; end if;
  begin
    perform public.veyra_restore_page_version(fixture_page,snapshot,2);
    raise exception 'Unauthorized version restore succeeded';
  exception when insufficient_privilege then null;
  end;
end $smoke$;
rollback;
