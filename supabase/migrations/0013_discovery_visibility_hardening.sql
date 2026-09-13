-- Discovery must never expose creator accounts whose public site is not published.

drop policy if exists creators_public_select on public.creator_accounts;
drop policy if exists "Public can read active published creator accounts" on public.creator_accounts;

create policy creators_public_select_published on public.creator_accounts
  for select to anon, authenticated
  using (
    status = 'active'
    and exists (
      select 1
      from public.creator_sites cs
      where cs.creator_id = creator_accounts.id
        and cs.visibility = 'published'
    )
  );

create policy creators_owner_select on public.creator_accounts
  for select to authenticated
  using (owner_user_id = auth.uid() or app.current_user_has_creator_access(id));
