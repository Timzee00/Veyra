-- Cost protection for owner-uploaded website images.
-- Limit each creator to 100 files in the public image bucket, enforced on Storage INSERT.
-- Lock the creator account row to serialize parallel uploads.
create or replace function app.veyra_creator_image_upload_allowed(object_path text)
returns boolean
language plpgsql volatile security definer set search_path = '' as $$
declare actor uuid; creator uuid; existing integer;
begin
 actor := auth.uid();
 if actor is null or object_path is null then return false; end if;
 begin
  creator := split_part(object_path,'/',1)::uuid;
 exception when invalid_text_representation then return false;
 end;
 if not app.current_user_owns_creator(creator) then return false; end if;
 perform 1 from public.creator_accounts where id=creator and owner_user_id=actor for update;
 if not found then return false; end if;
 select count(*) into existing from storage.objects
 where bucket_id='veyra-images' and name like creator::text || '/%';
 return existing < 100;
end $$;
revoke all on function app.veyra_creator_image_upload_allowed(text)
 from public,anon,authenticated;
grant execute on function app.veyra_creator_image_upload_allowed(text) to authenticated;

drop policy if exists "creator-owned image upload" on storage.objects;
create policy "creator-owned image upload" on storage.objects
 for insert to authenticated with check (
  bucket_id='veyra-images'
  and app.veyra_creator_image_upload_allowed(name)
 );
