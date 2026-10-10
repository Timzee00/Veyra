-- Harden public site snapshots against browser-side UPDATE bypasses.
-- Only trusted DB functions (owned by postgres) or server-side service roles
-- may change approved/published visual design and homepage documents.
-- Ordinary account owners still edit their private drafts.
create or replace function public.veyra_guard_published_site_fields()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  if new.design_published is distinct from old.design_published
     or new.builder_published is distinct from old.builder_published then
    if current_user not in ('postgres', 'supabase_admin', 'service_role') then
      raise exception 'Publish through the approved website publishing action' using errcode='42501';
    end if;
  end if;
  return new;
end;
$$;
drop trigger if exists veyra_guard_published_site_fields on public.creator_sites;
create trigger veyra_guard_published_site_fields
before update of design_published, builder_published
on public.creator_sites for each row
execute function public.veyra_guard_published_site_fields();

-- A free URL stays attached to the creator even when premium capabilities are disabled.
-- Limit unbounded public list queries with an index matching common page lookups.
create index if not exists veyra_public_page_lookup_idx
on public.site_page_publications (creator_id, slug);

-- Limit client token privileges to drafts and status queries.
revoke all on public.creator_site_design_drafts from anon;
grant select, insert, update on public.creator_site_design_drafts to authenticated;
revoke all on public.creator_page_drafts from anon;
grant select, insert, update on public.creator_page_drafts to authenticated;
