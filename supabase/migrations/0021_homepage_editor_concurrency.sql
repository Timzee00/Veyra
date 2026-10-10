-- Atomic homepage draft saves prevent stale editor tabs from overwriting newer work.
create or replace function public.veyra_save_homepage_draft(target_creator uuid, expected_revision bigint, next_blocks jsonb)
returns bigint language plpgsql security definer set search_path = '' as $$
declare actual_revision bigint;
begin
 if auth.uid() is null or not app.current_user_owns_creator(target_creator) then
  raise exception 'Only the website owner may edit this page' using errcode='42501';
 end if;
 if not public.veyra_validate_blocks(next_blocks) then
  raise exception 'Invalid or unsupported page content' using errcode='22023';
 end if;
 insert into public.creator_page_drafts(creator_id,blocks,revision)
 values(target_creator,'[]'::jsonb,0) on conflict(creator_id) do nothing;
 select revision into actual_revision from public.creator_page_drafts where creator_id=target_creator for update;
 if actual_revision is distinct from expected_revision then
  raise exception 'A newer draft exists. Reload before saving to avoid losing changes' using errcode='40001';
 end if;
 update public.creator_page_drafts set blocks=next_blocks,revision=revision+1,updated_at=now()
 where creator_id=target_creator returning revision into actual_revision;
 return actual_revision;
end; $$;
revoke all on function public.veyra_save_homepage_draft(uuid,bigint,jsonb) from public,anon,authenticated;
grant execute on function public.veyra_save_homepage_draft(uuid,bigint,jsonb) to authenticated;
