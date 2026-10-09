-- Consolidate historical creator-account/site RLS policies.
-- Equivalent access with one deliberate SELECT policy per role, avoiding
-- duplicated predicates and circular joins between exposed tables.

drop policy if exists "Owners can read creator accounts" on public.creator_accounts;
drop policy if exists creators_member_select on public.creator_accounts;
drop policy if exists creators_owner_select on public.creator_accounts;
drop policy if exists creators_public_select_published on public.creator_accounts;
drop policy if exists "Public can read active published creator accounts" on public.creator_accounts;

create policy "veyra creator accounts public reads" on public.creator_accounts
 for select to anon using (public.is_public_creator(id));

create policy "veyra creator accounts authenticated reads" on public.creator_accounts
 for select to authenticated using (
  public.is_public_creator(id)
  or ((select auth.uid()) is not null and
      (owner_user_id = (select auth.uid())
       or app.current_user_has_creator_access(id)))
 );

drop policy if exists "Owners can create creator accounts" on public.creator_accounts;
drop policy if exists creators_owner_insert on public.creator_accounts;
create policy "veyra creator accounts owner creates" on public.creator_accounts
 for insert to authenticated
 with check ((select auth.uid()) is not null and owner_user_id = (select auth.uid()));

drop policy if exists "Owners can update creator accounts" on public.creator_accounts;
drop policy if exists creators_owner_update on public.creator_accounts;
create policy "veyra creator accounts owner updates" on public.creator_accounts
 for update to authenticated
 using ((select auth.uid()) is not null and owner_user_id = (select auth.uid()))
 with check ((select auth.uid()) is not null and owner_user_id = (select auth.uid()));

drop policy if exists "Public can read published creator sites" on public.creator_sites;
drop policy if exists "Creator owner or member reads own site" on public.creator_sites;

create policy "veyra sites anonymous published reads" on public.creator_sites
 for select to anon using (public.is_public_creator(creator_id));

create policy "veyra sites authenticated reads" on public.creator_sites
 for select to authenticated using (
  public.is_public_creator(creator_id)
  or ((select auth.uid()) is not null and
      (app.current_user_owns_creator(creator_id)
       or app.current_user_has_creator_access(creator_id)))
 );

drop policy if exists sites_owner_insert on public.creator_sites;
drop policy if exists sites_owner_update on public.creator_sites;
-- Explicit owner INSERT / UPDATE policies from 0027 remain authoritative.
