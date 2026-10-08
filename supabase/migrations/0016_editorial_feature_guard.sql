-- Featured/editorial status is staff-curated, never creator-controlled.
-- Creator update RLS permits editing account fields generally, so protect this
-- field at the database boundary, including direct REST calls.
create or replace function public.veyra_guard_editorial_fields()
returns trigger language plpgsql set search_path = public as $$
begin
  if new.featured is distinct from old.featured and current_user not in ('postgres', 'supabase_admin') and coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'Editorial selection is managed by Veyra staff'
      using errcode = '42501';
  end if;
  return new;
end; $$;
drop trigger if exists veyra_editorial_guard on public.creator_accounts;
create trigger veyra_editorial_guard before update of featured
on public.creator_accounts for each row execute function public.veyra_guard_editorial_fields();
