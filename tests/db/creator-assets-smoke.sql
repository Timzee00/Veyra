-- Staging-only creator asset ownership test. All fixtures are rolled back.
-- This validates metadata RLS, not an actual browser file transfer.
begin;
do $smoke$
declare
 owner_id uuid:=gen_random_uuid();
 outsider uuid:=gen_random_uuid();
 creator uuid:=gen_random_uuid();
 asset_id uuid;
 num integer;
begin
 insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at)
 values(owner_id,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
  'asset-smoke-'||owner_id::text||'@example.invalid','fixture-only',now(),now(),now());
 perform set_config('request.jwt.claim.sub',owner_id::text,true);
 insert into public.creator_accounts(id,owner_user_id,handle,display_name)
 values(creator,owner_id,'asset-'||left(replace(owner_id::text,'-',''),12),'Asset test');
 execute 'set local role authenticated';

 insert into public.creator_assets(creator_id,storage_path,alt_text,mime_type,size_bytes)
 values(creator,creator::text||'/example.jpg','Profile photo','image/jpeg',2048)
 returning id into asset_id;
 select count(*) into num from public.creator_assets where id=asset_id;
 if num<>1 then raise exception 'Owner could not read asset metadata';end if;

 perform set_config('request.jwt.claim.sub',outsider::text,true);
 select count(*) into num from public.creator_assets where id=asset_id;
 if num<>0 then raise exception 'Other user read private metadata';end if;

 update public.creator_assets set alt_text='Stolen edit' where id=asset_id;
 get diagnostics num=row_count;
 if num<>0 then raise exception 'Other user changed asset metadata';end if;

 begin
  insert into public.creator_assets(creator_id,storage_path,mime_type,size_bytes)
  values(creator,creator::text||'/evil.jpg','image/jpeg',800);
  raise exception 'Other user could create creator asset metadata';
 exception when insufficient_privilege then null;
 end;

 perform set_config('request.jwt.claim.sub',owner_id::text,true);
 begin
  insert into public.creator_assets(creator_id,storage_path,mime_type,size_bytes)
  values(creator,outsider::text||'/wrong-creator.jpg','image/jpeg',800);
  raise exception 'Mismatched creator directory was accepted';
 exception when check_violation then null;
 end;
end $smoke$;
rollback;
