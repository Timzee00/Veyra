-- Public portfolio reads are limited to active creators and published sites/work.

create policy "Public can read active published creator accounts"
  on public.creator_accounts for select
  to anon, authenticated
  using (
    status = 'active'
    and exists (
      select 1 from public.creator_sites s
      where s.creator_id = id and s.visibility = 'published'
    )
  );

create policy "Public can read published creator sites"
  on public.creator_sites for select
  to anon, authenticated
  using (
    visibility = 'published'
    and exists (
      select 1 from public.creator_accounts c
      where c.id = creator_id and c.status = 'active'
    )
  );
