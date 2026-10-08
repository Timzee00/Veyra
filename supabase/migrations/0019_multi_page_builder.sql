-- Veyra multi-page studio: private editable documents and immutable-at-read public snapshots.
-- Migration after 0018_page_builder_content.sql. Never expose draft_blocks to anonymous visitors.

create or replace function public.veyra_valid_page_blocks(document jsonb)
returns boolean language plpgsql immutable set search_path = '' as $$
declare block jsonb; props jsonb; prop_key text; block_id text; ids text[] := array[]::text[];
begin
  if jsonb_typeof(document) is distinct from 'array' then return false; end if;
  if jsonb_array_length(document) > 80 then return false; end if;
  for block in select value from jsonb_array_elements(document) loop
    if jsonb_typeof(block) is distinct from 'object'
      or block->>'type' not in ('heading','paragraph','button','divider','image','quote','faq','spacer')
      or coalesce(block->>'id','') !~ '^[a-zA-Z0-9_-]{1,80}$'
      or block->>'id' = any(ids)
      or jsonb_typeof(block->'props') is distinct from 'object'
      or jsonb_typeof(block->'children') is distinct from 'array'
      or jsonb_array_length(block->'children') <> 0
      or exists (select 1 from jsonb_object_keys(block) as k where k not in ('id','type','props','children'))
    then return false; end if;
    ids := array_append(ids,block->>'id');
    props := block->'props';
    if (select count(*) from jsonb_object_keys(props)) > 8 then return false; end if;
    for prop_key in select jsonb_object_keys(props) loop
      if prop_key not in ('text','url','alt','question','answer')
        or jsonb_typeof(props->prop_key) is distinct from 'string'
        or length(props->>prop_key) > 4000 then return false; end if;
    end loop;
    if block->>'type' in ('button','image') then
      if coalesce(props->>'url','') !~ '^(https://[^[:space:]]+|/[^/[:space:]][^[:space:]]*)$'
        and props->>'url' <> '/' then return false; end if;
    end if;
    if block->>'type'='image' and coalesce(length(props->>'alt'),0)>220 then return false; end if;
  end loop;
  return true;
exception when others then return false;
end; $$;

create table public.site_pages (
 id uuid primary key default gen_random_uuid(),
 creator_id uuid not null references public.creator_accounts(id) on delete cascade,
 slug text not null,
 title text not null,
 seo_description text,
 draft_blocks jsonb not null default '[]'::jsonb,
 revision integer not null default 0 check (revision >= 0),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 constraint site_page_unique_slug unique(creator_id,slug),
 constraint site_page_safe_slug check (slug ~ '^[a-z][a-z0-9-]{0,62}$' and slug not in ('project','post','pages','api','opengraph-image')),
 constraint site_page_title_length check (length(title) between 1 and 110),
 constraint site_page_seo_length check (seo_description is null or length(seo_description) <= 300),
 constraint site_page_valid_draft check (public.veyra_valid_page_blocks(draft_blocks))
);
create index site_pages_owner_idx on public.site_pages(creator_id,updated_at desc);

create table public.site_page_publications (
 page_id uuid primary key references public.site_pages(id) on delete cascade,
 creator_id uuid not null references public.creator_accounts(id) on delete cascade,
 slug text not null,
 title text not null,
 seo_description text,
 blocks jsonb not null default '[]'::jsonb,
 revision integer not null,
 published_at timestamptz not null default now(),
 constraint site_page_public_slug unique(creator_id,slug),
 constraint site_page_public_blocks_valid check (public.veyra_valid_page_blocks(blocks))
);
create index site_page_public_creator_idx on public.site_page_publications(creator_id,published_at desc);
alter table public.site_pages enable row level security;
alter table public.site_page_publications enable row level security;

create policy "site page owner select" on public.site_pages
 for select to authenticated using ((select auth.uid()) is not null and app.current_user_owns_creator(creator_id));
create policy "site page owner insert" on public.site_pages
 for insert to authenticated with check ((select auth.uid()) is not null and app.current_user_owns_creator(creator_id));
create policy "site page owner update" on public.site_pages
 for update to authenticated using ((select auth.uid()) is not null and app.current_user_owns_creator(creator_id))
 with check ((select auth.uid()) is not null and app.current_user_owns_creator(creator_id));
create policy "site page owner delete" on public.site_pages
 for delete to authenticated using ((select auth.uid()) is not null and app.current_user_owns_creator(creator_id));

create policy "published page public or owner select" on public.site_page_publications
 for select to anon,authenticated using (
  app.current_user_owns_creator(creator_id)
  or exists (
    select 1 from public.creator_sites cs
    join public.creator_accounts ca on ca.id = cs.creator_id
    where cs.creator_id = site_page_publications.creator_id
      and cs.visibility = 'published'
      and ca.status = 'active'
  )
 );
revoke all on public.site_pages from anon;
revoke all on public.site_page_publications from anon,authenticated;
grant select,insert,update,delete on public.site_pages to authenticated;
grant select on public.site_page_publications to anon,authenticated;

create or replace function public.veyra_publish_site_page(target_page uuid, expected_revision integer)
returns void language plpgsql security definer set search_path = '' as $$
declare draft record;
begin
 if auth.uid() is null then raise exception 'Login required' using errcode='42501'; end if;
 select * into draft from public.site_pages where id=target_page;
 if not found or not app.current_user_owns_creator(draft.creator_id) then
   raise exception 'Page not found or unauthorized' using errcode='42501';
 end if;
 if draft.revision <> expected_revision then
   raise exception 'Page changed; reload before publishing' using errcode='40001';
 end if;
 insert into public.site_page_publications(page_id,creator_id,slug,title,seo_description,blocks,revision,published_at)
 values (draft.id,draft.creator_id,draft.slug,draft.title,draft.seo_description,draft.draft_blocks,draft.revision,now())
 on conflict (page_id) do update set
   slug=excluded.slug,title=excluded.title,seo_description=excluded.seo_description,
   blocks=excluded.blocks,revision=excluded.revision,published_at=excluded.published_at;
end; $$;
revoke all on function public.veyra_publish_site_page(uuid,integer) from public,anon,authenticated;
grant execute on function public.veyra_publish_site_page(uuid,integer) to authenticated;

create or replace function public.veyra_unpublish_site_page(target_page uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare owner_id uuid;
begin
 if auth.uid() is null then raise exception 'Login required' using errcode='42501'; end if;
 select creator_id into owner_id from public.site_pages where id=target_page;
 if owner_id is null or not app.current_user_owns_creator(owner_id) then
  raise exception 'Page not found or unauthorized' using errcode='42501';
 end if;
 delete from public.site_page_publications where page_id=target_page;
end; $$;
revoke all on function public.veyra_unpublish_site_page(uuid) from public,anon,authenticated;
grant execute on function public.veyra_unpublish_site_page(uuid) to authenticated;
