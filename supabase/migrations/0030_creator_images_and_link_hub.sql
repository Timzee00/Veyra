-- Veyra creator image library and public link hub.
-- Creator images intentionally use a PUBLIC read bucket (website content only).
-- Owner uploads are isolated by creator UUID folder; never put private files here.
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('veyra-images','veyra-images',true,5242880,
  array['image/jpeg','image/png','image/webp','image/gif'])
on conflict(id) do update set
 public=true,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;

create table public.creator_assets (
 id uuid primary key default gen_random_uuid(),
 creator_id uuid not null references public.creator_accounts(id) on delete cascade,
 storage_path text not null unique,
 alt_text text not null default '',
 mime_type text not null check(mime_type in ('image/jpeg','image/png','image/webp','image/gif')),
 size_bytes integer not null check(size_bytes between 1 and 5242880),
 created_at timestamptz not null default now(),
 constraint creator_asset_path_owner check (
  storage_path like creator_id::text || '/%'
  and length(storage_path) < 180
 ),
 constraint creator_asset_alt_limit check(length(alt_text)<=220)
);
create index creator_assets_owner_created on public.creator_assets (creator_id,created_at desc);
alter table public.creator_assets enable row level security;
create policy "creator asset own read" on public.creator_assets for select to authenticated
 using ((select auth.uid()) is not null and app.current_user_owns_creator(creator_id));
create policy "creator asset own insert" on public.creator_assets for insert to authenticated
 with check ((select auth.uid()) is not null and app.current_user_owns_creator(creator_id));
create policy "creator asset own update" on public.creator_assets for update to authenticated
 using ((select auth.uid()) is not null and app.current_user_owns_creator(creator_id))
 with check ((select auth.uid()) is not null and app.current_user_owns_creator(creator_id));
create policy "creator asset own delete" on public.creator_assets for delete to authenticated
 using ((select auth.uid()) is not null and app.current_user_owns_creator(creator_id));
revoke all on public.creator_assets from anon,authenticated;
grant select,insert,update,delete on public.creator_assets to authenticated;

create policy "creator-owned image upload" on storage.objects
 for insert to authenticated with check (
  bucket_id='veyra-images'
  and (storage.foldername(name))[1] is not null
  and exists (
   select 1 from public.creator_accounts c
   where c.id::text=(storage.foldername(name))[1]
     and c.owner_user_id=(select auth.uid())
  )
 );
create policy "creator-owned image list" on storage.objects
 for select to authenticated using (
  bucket_id='veyra-images'
  and exists (
   select 1 from public.creator_accounts c
   where c.id::text=(storage.foldername(name))[1]
     and c.owner_user_id=(select auth.uid())
  )
 );
create policy "creator-owned image delete" on storage.objects
 for delete to authenticated using (
  bucket_id='veyra-images'
  and exists (
   select 1 from public.creator_accounts c
   where c.id::text=(storage.foldername(name))[1]
     and c.owner_user_id=(select auth.uid())
  )
 );

create table public.creator_links (
 id uuid primary key default gen_random_uuid(),
 creator_id uuid not null references public.creator_accounts(id) on delete cascade,
 label text not null check(length(btrim(label)) between 1 and 75),
 url text not null check (
   length(url)<=1500
   and url ~ '^https://[^/@[:space:]]+([/?#][^[:space:]]*)?$'
 ),
 position integer not null default 0 check(position between 0 and 10000),
 is_visible boolean not null default true,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index creator_links_owner_order on public.creator_links (creator_id,position,id);
alter table public.creator_links enable row level security;
create policy "creator links public read" on public.creator_links
 for select to anon,authenticated using (
 (is_visible and public.is_public_creator(creator_id))
 or ((select auth.uid()) is not null and app.current_user_owns_creator(creator_id))
 );
create policy "creator links owner insert" on public.creator_links for insert to authenticated
 with check ((select auth.uid()) is not null and app.current_user_owns_creator(creator_id));
create policy "creator links owner update" on public.creator_links for update to authenticated
 using ((select auth.uid()) is not null and app.current_user_owns_creator(creator_id))
 with check ((select auth.uid()) is not null and app.current_user_owns_creator(creator_id));
create policy "creator links owner delete" on public.creator_links for delete to authenticated
 using ((select auth.uid()) is not null and app.current_user_owns_creator(creator_id));
revoke all on public.creator_links from anon,authenticated;
grant select on public.creator_links to anon;
grant select,insert,update,delete on public.creator_links to authenticated;

-- Serialize concurrent inserts to enforce the creator's finite link allowance.
create or replace function app.creator_links_quota_guard()
returns trigger language plpgsql security definer set search_path = '' as $$
declare existing integer;
begin
 if auth.uid() is null or not app.current_user_owns_creator(new.creator_id) then
  raise exception 'Not authorized to add links' using errcode='42501';
 end if;
 perform 1 from public.creator_accounts where id=new.creator_id for update;
 select count(*) into existing from public.creator_links where creator_id=new.creator_id;
 if existing>=24 then
  raise exception 'Maximum of 24 links per creator' using errcode='23514';
 end if;
 return new;
end $$;
revoke all on function app.creator_links_quota_guard() from public,anon,authenticated;
create trigger creator_links_quota before insert on public.creator_links
 for each row execute function app.creator_links_quota_guard();
