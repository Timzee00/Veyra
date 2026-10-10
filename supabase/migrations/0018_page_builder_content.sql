-- Builder content is versioned separately from style overrides.
create table if not exists public.creator_page_drafts (
 creator_id uuid primary key references public.creator_accounts(id) on delete cascade,
 blocks jsonb not null default '[]'::jsonb,
 revision bigint not null default 0,
 updated_at timestamptz not null default now(),
 constraint builder_draft_array check(jsonb_typeof(blocks)='array' and jsonb_array_length(blocks)<=40)
);
alter table public.creator_page_drafts enable row level security;
create policy creator_page_draft_read on public.creator_page_drafts for select to authenticated using (app.current_user_owns_creator(creator_id));
create policy creator_page_draft_insert on public.creator_page_drafts for insert to authenticated with check(app.current_user_owns_creator(creator_id));
create policy creator_page_draft_update on public.creator_page_drafts for update to authenticated using(app.current_user_owns_creator(creator_id)) with check(app.current_user_owns_creator(creator_id));
alter table public.creator_sites add column if not exists builder_published jsonb not null default '[]'::jsonb;
create or replace function public.veyra_validate_blocks(content jsonb)
returns boolean language plpgsql immutable set search_path=public as $$
declare item jsonb; idx integer; id_set text[] := '{}'::text[];
begin
 if jsonb_typeof(content) <> 'array' or jsonb_array_length(content)>40 then return false; end if;
 for item in select value from jsonb_array_elements(content) loop
  if jsonb_typeof(item)<>'object' or item->>'type' not in ('heading','paragraph','button','divider')
     or (item->>'id') !~ '^[a-zA-Z0-9_-]{1,80}$'
     or item->>'id' = any(id_set)
     or jsonb_typeof(item->'props') <> 'object'
     or coalesce(length(item->'props'->>'text'),0)>5000
     or coalesce(length(item->'props'->>'url'),0)>2048
     or coalesce(item->'props'->>'url','') !~ '^(|/[^/]|https://)'
     or jsonb_typeof(item->'children') <> 'array'
     or jsonb_array_length(item->'children')>0
     or exists(select 1 from jsonb_object_keys(item) k where k not in ('id','type','props','children'))
     or exists(select 1 from jsonb_object_keys(item->'props') k where k not in ('text','url')) then return false; end if;
  id_set:=array_append(id_set,item->>'id');
 end loop;
 return true;
exception when others then return false;
end $$;
alter table public.creator_page_drafts add constraint valid_page_draft check(public.veyra_validate_blocks(blocks));
alter table public.creator_sites add constraint valid_page_published check(public.veyra_validate_blocks(builder_published));
create or replace function public.veyra_publish_builder(target_creator uuid)
returns void language plpgsql security definer set search_path=public as $$
declare draft jsonb;
begin
 if auth.uid() is null or not app.current_user_owns_creator(target_creator) then raise exception 'Not authorized' using errcode='42501'; end if;
 select blocks into draft from public.creator_page_drafts where creator_id=target_creator;
 if draft is null then raise exception 'No draft exists' using errcode='22023'; end if;
 update public.creator_sites set builder_published=draft, updated_at=now() where creator_id=target_creator;
 if not found then raise exception 'Website missing' using errcode='22023'; end if;
end $$;
revoke all on function public.veyra_publish_builder(uuid) from public,anon;
grant execute on function public.veyra_publish_builder(uuid) to authenticated;
