-- Publish only the exact homepage draft revision the editor approved.
-- An intervening save in another tab must not be published accidentally.
create or replace function public.veyra_publish_builder(
 target_creator uuid, expected_revision bigint
)
returns void language plpgsql security definer set search_path = '' as $$
declare draft jsonb; actual_revision bigint;
begin
 if auth.uid() is null or not app.current_user_owns_creator(target_creator) then
  raise exception 'Not authorized' using errcode='42501';
 end if;
 select blocks, revision into draft, actual_revision
 from public.creator_page_drafts where creator_id=target_creator for update;
 if not found then raise exception 'No saved homepage draft exists' using errcode='22023'; end if;
 if actual_revision is distinct from expected_revision then
  raise exception 'The draft changed. Review the latest version before publishing' using errcode='40001';
 end if;
 if not public.veyra_validate_blocks(draft) then raise exception 'Invalid draft blocks' using errcode='22023'; end if;
 update public.creator_sites set builder_published=draft,updated_at=now()
 where creator_id=target_creator;
 if not found then raise exception 'Website not found' using errcode='22023'; end if;
end; $$;
revoke all on function public.veyra_publish_builder(uuid,bigint) from public,anon,authenticated;
grant execute on function public.veyra_publish_builder(uuid,bigint) to authenticated;
-- Retire the old unversioned publisher to prevent bypassing the expected-revision check.
drop function if exists public.veyra_publish_builder(uuid);
