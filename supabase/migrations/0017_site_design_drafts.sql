-- Versioned site-wide style overrides: drafts do not change the public site.
alter table public.creator_sites add column if not exists design_draft jsonb not null default '{}'::jsonb;
alter table public.creator_sites add column if not exists design_published jsonb not null default '{}'::jsonb;
alter table public.creator_sites add column if not exists design_revision integer not null default 0;
create or replace function public.veyra_validate_design()
returns trigger language plpgsql as $$
declare body jsonb;
begin
  foreach body in array array[new.design_draft,new.design_published] loop
    if jsonb_typeof(body) <> 'object'
       or (select count(*) from jsonb_object_keys(body)) > 8
       or (body ? 'accent' and (jsonb_typeof(body->'accent') <> 'string' or (body->>'accent') !~ '^#[0-9a-fA-F]{6}$'))
       or (body ? 'font' and body->>'font' not in ('sans','serif','mono'))
       or (body ? 'motion' and body->>'motion' not in ('none','subtle','smooth'))
       or (body ? 'radius' and body->>'radius' not in ('sharp','soft','rounded'))
       or (body ? 'heroAlignment' and body->>'heroAlignment' not in ('left','center')) then
      raise exception 'Invalid website design settings' using errcode = '22023';
    end if;
  end loop;
  return new;
end; $$;
drop trigger if exists veyra_validate_design_settings on public.creator_sites;
create trigger veyra_validate_design_settings before insert or update of design_draft,design_published
on public.creator_sites for each row execute function public.veyra_validate_design();
