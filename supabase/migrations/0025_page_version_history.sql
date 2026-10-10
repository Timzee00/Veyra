-- Veyra page publication history and safe draft restoration.
-- Publishing stays on the existing validated veyra_publish_site_page RPC.
-- Restoring a version never changes a live published page.
create table if not exists public.site_page_versions (
 id uuid primary key default gen_random_uuid(),
 page_id uuid not null references public.site_pages(id) on delete cascade,
 creator_id uuid not null references public.creator_accounts(id) on delete cascade,
 slug text not null,
 title text not null,
 seo_description text,
 blocks jsonb not null,
 draft_revision integer not null,
 published_at timestamptz not null default now(),
 constraint page_version_valid_blocks check(public.veyra_valid_page_blocks(blocks)),
 constraint page_version_nonempty check(jsonb_array_length(blocks)>0)
);
create index if not exists site_page_versions_latest_idx
 on public.site_page_versions(page_id,published_at desc,id desc);

alter table public.site_page_versions enable row level security;
create policy "page versions owner read" on public.site_page_versions
 for select to authenticated using (
   (select auth.uid()) is not null
   and app.current_user_owns_creator(creator_id)
   and exists (
     select 1 from public.site_pages p
     where p.id=page_id and p.creator_id=site_page_versions.creator_id
   )
 );
revoke all on public.site_page_versions from public,anon,authenticated;
grant select on public.site_page_versions to authenticated;

-- Publication snapshots cannot be created or altered by ordinary clients.
create or replace function app.record_site_page_publication()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
 insert into public.site_page_versions
  (page_id,creator_id,slug,title,seo_description,blocks,draft_revision,published_at)
 values
  (new.page_id,new.creator_id,new.slug,new.title,new.seo_description,new.blocks,new.revision,now());
 -- Keep a bounded history per page, including the latest publication.
 delete from public.site_page_versions history
 where history.page_id=new.page_id and history.id in (
  select id from public.site_page_versions
  where page_id=new.page_id
  order by published_at desc,id desc
  offset 30
 );
 return new;
end $$;
revoke all on function app.record_site_page_publication() from public,anon,authenticated;
drop trigger if exists veyra_record_page_publication on public.site_page_publications;
create trigger veyra_record_page_publication
 after insert or update on public.site_page_publications
 for each row execute function app.record_site_page_publication();

-- Preserve an already-published snapshot when introducing this feature.
insert into public.site_page_versions
 (page_id,creator_id,slug,title,seo_description,blocks,draft_revision,published_at)
select pub.page_id,pub.creator_id,pub.slug,pub.title,pub.seo_description,
 pub.blocks,pub.revision,pub.published_at
from public.site_page_publications pub
where jsonb_array_length(pub.blocks)>0
 and not exists (select 1 from public.site_page_versions v where v.page_id=pub.page_id);

create or replace function public.veyra_restore_page_version(
 target_page uuid, target_version uuid, expected_revision integer
)
returns integer language plpgsql security definer set search_path = '' as $$
declare draft record; snapshot record; next_revision integer;
begin
 if auth.uid() is null then
  raise exception 'Please sign in' using errcode='42501';
 end if;
 select id,creator_id,revision into draft
 from public.site_pages where id=target_page for update;
 if not found or not app.current_user_owns_creator(draft.creator_id) then
  raise exception 'Page not found or unauthorized' using errcode='42501';
 end if;
 if draft.revision <> expected_revision then
  raise exception 'This page has changed. Reload before restoring an older version' using errcode='40001';
 end if;
 select slug,title,seo_description,blocks into snapshot
 from public.site_page_versions
 where id=target_version and page_id=target_page and creator_id=draft.creator_id;
 if not found then
  raise exception 'Version unavailable' using errcode='22023';
 end if;
 update public.site_pages
 set slug=snapshot.slug,title=snapshot.title,
     seo_description=snapshot.seo_description,draft_blocks=snapshot.blocks,
     revision=revision+1,updated_at=now()
 where id=target_page
 returning revision into next_revision;
 return next_revision;
end $$;
revoke all on function public.veyra_restore_page_version(uuid,uuid,integer)
 from public,anon,authenticated;
grant execute on function public.veyra_restore_page_version(uuid,uuid,integer)
 to authenticated;
