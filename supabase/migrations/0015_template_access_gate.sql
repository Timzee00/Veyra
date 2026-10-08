-- Fail closed until paid entitlements are implemented and verified.
-- Both public clients and authenticated creators may select only active free templates.
-- A future entitlement-aware RPC can replace this gate when billing is ready.
create or replace function public.veyra_restrict_template_selection()
returns trigger language plpgsql set search_path = public as $$
declare allowed boolean;
begin
  if tg_op = 'INSERT' or new.template_id is distinct from old.template_id then
    select exists (
      select 1 from public.templates
      where id = new.template_id and active = true and tier = 'free'
    ) into allowed;
    if not allowed then
      raise exception 'This template is not available on the current plan'
        using errcode = '42501';
    end if;
  end if;
  return new;
end; $$;
drop trigger if exists veyra_template_access_gate on public.creator_sites;
create trigger veyra_template_access_gate
before insert or update of template_id on public.creator_sites
for each row execute function public.veyra_restrict_template_selection();
