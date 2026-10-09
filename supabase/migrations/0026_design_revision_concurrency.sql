-- Design draft optimistic concurrency: multi-tab saves must not silently overwrite work.
-- Publishing must commit the exact revision reviewed by the creator.
alter table public.creator_site_design_drafts
 add column if not exists revision integer not null default 0
 check (revision >= 0);

create or replace function public.veyra_save_design_draft(
 target_creator uuid, expected_revision integer, next_design jsonb
) returns integer language plpgsql security definer set search_path = '' as $$
declare saved_revision integer;
begin
 if auth.uid() is null or not app.current_user_owns_creator(target_creator) then
  raise exception 'Only the website owner may save design drafts' using errcode='42501';
 end if;
 if not public.veyra_valid_design(next_design) then
  raise exception 'Invalid design settings' using errcode='22023';
 end if;
 insert into public.creator_site_design_drafts(creator_id,design,revision)
 values(target_creator,'{}'::jsonb,0)
 on conflict(creator_id) do nothing;
 select revision into saved_revision
 from public.creator_site_design_drafts where creator_id=target_creator for update;
 if saved_revision is distinct from expected_revision then
  raise exception 'Your design changed in another tab. Reload before saving' using errcode='40001';
 end if;
 update public.creator_site_design_drafts
 set design=next_design,revision=revision+1,updated_at=now()
 where creator_id=target_creator
 returning revision into saved_revision;
 return saved_revision;
end $$;

create or replace function public.veyra_publish_design(
 target_creator uuid, expected_revision integer
) returns void language plpgsql security definer set search_path = '' as $$
declare current_design jsonb; saved_revision integer;
begin
 if auth.uid() is null or not app.current_user_owns_creator(target_creator) then
  raise exception 'Only the website owner may publish designs' using errcode='42501';
 end if;
 select design,revision into current_design,saved_revision
 from public.creator_site_design_drafts
 where creator_id=target_creator for update;
 if not found or saved_revision is distinct from expected_revision then
  raise exception 'Saved design changed. Review the latest draft before publishing' using errcode='40001';
 end if;
 if not public.veyra_valid_design(current_design) then
  raise exception 'Invalid design settings' using errcode='22023';
 end if;
 update public.creator_sites
 set design_published=current_design,updated_at=now()
 where creator_id=target_creator;
 if not found then raise exception 'Website not found' using errcode='22023'; end if;
end $$;

revoke all on function public.veyra_save_design_draft(uuid,integer,jsonb) from public,anon,authenticated;
revoke all on function public.veyra_publish_design(uuid,integer) from public,anon,authenticated;
grant execute on function public.veyra_save_design_draft(uuid,integer,jsonb) to authenticated;
grant execute on function public.veyra_publish_design(uuid,integer) to authenticated;
drop function if exists public.veyra_publish_design(uuid);

-- Prevent bypassing the revision check with a direct browser table write.
revoke insert,update,delete on public.creator_site_design_drafts from authenticated;
