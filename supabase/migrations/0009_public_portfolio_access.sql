-- Public portfolio reads are limited to active creators and published sites/work.
-- SECURITY DEFINER keeps the public-read policies from recursively evaluating each other.

create or replace function public.is_public_creator(p_creator_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.creator_accounts c
    join public.creator_sites s on s.creator_id = c.id
    where c.id = p_creator_id
      and c.status = 'active'
      and s.visibility = 'published'
  );
$$;

drop policy if exists "Public can read active published creator accounts" on public.creator_accounts;
drop policy if exists "Public can read published creator sites" on public.creator_sites;

create policy "Public can read active published creator accounts"
  on public.creator_accounts for select
  to anon, authenticated
  using (public.is_public_creator(id));

create policy "Public can read published creator sites"
  on public.creator_sites for select
  to anon, authenticated
  using (public.is_public_creator(creator_id));
