drop policy if exists creators_public_select on public.creator_accounts;

create policy creators_member_select on public.creator_accounts
  for select using (
    owner_user_id = auth.uid()
    or app.current_user_has_creator_access(id)
  );

-- Public portfolio presentation should read from an explicitly allow-listed surface,
-- never from the private creator account row itself.
create or replace view public.public_creator_profiles
with (security_invoker = true)
as
select
  id,
  handle,
  display_name,
  bio,
  website_url,
  status,
  created_at
from public.creator_accounts
where status = 'active';

grant select on public.public_creator_profiles to anon, authenticated;
