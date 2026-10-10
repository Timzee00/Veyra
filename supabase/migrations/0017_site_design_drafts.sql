-- Publicly rendered settings and privately stored creator drafts are separate.
alter table public.creator_sites add column if not exists design_published jsonb not null default '{}'::jsonb;
create table if not exists public.creator_site_design_drafts (
 creator_id uuid primary key references public.creator_accounts(id) on delete cascade,
 design jsonb not null default '{}'::jsonb,
 updated_at timestamptz not null default now()
);
alter table public.creator_site_design_drafts enable row level security;
create policy veyra_design_owner_read on public.creator_site_design_drafts for select to authenticated
 using (app.current_user_owns_creator(creator_id));
create policy veyra_design_owner_insert on public.creator_site_design_drafts for insert to authenticated
 with check (app.current_user_owns_creator(creator_id));
create policy veyra_design_owner_update on public.creator_site_design_drafts for update to authenticated
 using (app.current_user_owns_creator(creator_id)) with check (app.current_user_owns_creator(creator_id));
create or replace function public.veyra_valid_design(body jsonb)
returns boolean language sql immutable set search_path = public as $$
 select jsonb_typeof(body) = 'object'
   and (select count(*) from jsonb_object_keys(body)) <= 8
   and (not (body ? 'accent') or (jsonb_typeof(body->'accent') = 'string' and (body->>'accent') ~ '^#[0-9a-fA-F]{6}$'))
   and (not (body ? 'font') or body->>'font' in ('sans','serif','mono'))
   and (not (body ? 'motion') or body->>'motion' in ('none','subtle','smooth'))
   and (not (body ? 'radius') or body->>'radius' in ('sharp','soft','rounded'))
   and (not (body ? 'heroAlignment') or body->>'heroAlignment' in ('left','center'))
   and not exists (select 1 from jsonb_object_keys(body) as k where k not in ('accent','font','motion','radius','heroAlignment'));
$$;
alter table public.creator_sites add constraint veyra_published_design_valid check (public.veyra_valid_design(design_published));
alter table public.creator_site_design_drafts add constraint veyra_private_draft_valid check (public.veyra_valid_design(design));
-- A caller can publish their own draft only; cannot publish an arbitrary JSON payload.
create or replace function public.veyra_publish_design(target_creator uuid)
returns void language plpgsql security definer set search_path = public as $$
declare draft jsonb;
begin
 if auth.uid() is null or not app.current_user_owns_creator(target_creator) then
   raise exception 'Permission denied' using errcode='42501';
 end if;
 select design into draft from public.creator_site_design_drafts where creator_id=target_creator;
 if draft is null then raise exception 'Save a design draft first' using errcode='22023'; end if;
 update public.creator_sites set design_published=draft,updated_at=now() where creator_id=target_creator;
 if not found then raise exception 'Website not found' using errcode='22023'; end if;
end; $$;
revoke all on function public.veyra_publish_design(uuid) from public, anon;
grant execute on function public.veyra_publish_design(uuid) to authenticated;
