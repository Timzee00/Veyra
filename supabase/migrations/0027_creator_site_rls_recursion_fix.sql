-- Remove circular RLS expressions between creator_accounts and creator_sites.
-- Owner/member checks must use trusted stable helpers, never a direct RLS table join.
drop policy if exists "Owners can read their sites" on public.creator_sites;
drop policy if exists "Owners can create their sites" on public.creator_sites;
drop policy if exists "Owners can update their sites" on public.creator_sites;
-- Historical broad site reads inadvertently exposed unlisted/suspended sites.
drop policy if exists sites_public_select on public.creator_sites;

create policy "Creator owner or member reads own site" on public.creator_sites
 for select to authenticated
 using ((select auth.uid()) is not null
   and (app.current_user_owns_creator(creator_id)
        or app.current_user_has_creator_access(creator_id)));

create policy "Creator owner inserts own site" on public.creator_sites
 for insert to authenticated
 with check ((select auth.uid()) is not null
   and app.current_user_owns_creator(creator_id));

create policy "Creator owner updates own site" on public.creator_sites
 for update to authenticated
 using ((select auth.uid()) is not null
   and app.current_user_owns_creator(creator_id))
 with check ((select auth.uid()) is not null
   and app.current_user_owns_creator(creator_id));

-- Existing "Public can read published creator sites" policy only permits
-- active creators with published websites through public.is_public_creator.
