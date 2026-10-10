-- Editorial picks are staff-curated; block client writes on INSERT and UPDATE.
create or replace function public.veyra_guard_editorial_fields()
returns trigger language plpgsql set search_path = public as $$
begin
  if (tg_op = 'INSERT' and new.featured = true)
     or (tg_op = 'UPDATE' and new.featured is distinct from old.featured) then
    if current_user not in ('postgres', 'supabase_admin')
       and coalesce(auth.role(), '') <> 'service_role' then
      raise exception 'Editorial selection is managed by Veyra staff' using errcode = '42501';
    end if;
  end if;
  return new;
end; $$;
drop trigger if exists veyra_editorial_guard on public.creator_accounts;
create trigger veyra_editorial_guard before insert or update of featured
on public.creator_accounts for each row execute function public.veyra_guard_editorial_fields();
