-- Project library access: owners manage their own work; public readers see published work only.

alter table public.projects enable row level security;
alter table public.project_media enable row level security;

create policy "Public can read published projects"
  on public.projects for select
  to anon, authenticated
  using (
    published = true
    and exists (
      select 1 from public.creator_accounts c
      where c.id = creator_id and c.status = 'active'
    )
  );

create policy "Owners can read all of their projects"
  on public.projects for select
  to authenticated
  using (
    exists (
      select 1 from public.creator_accounts c
      where c.id = creator_id and c.owner_user_id = auth.uid()
    )
  );

create policy "Owners can create projects"
  on public.projects for insert
  to authenticated
  with check (
    exists (
      select 1 from public.creator_accounts c
      where c.id = creator_id and c.owner_user_id = auth.uid()
    )
  );

create policy "Owners can update projects"
  on public.projects for update
  to authenticated
  using (
    exists (
      select 1 from public.creator_accounts c
      where c.id = creator_id and c.owner_user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.creator_accounts c
      where c.id = creator_id and c.owner_user_id = auth.uid()
    )
  );

create policy "Owners can delete projects"
  on public.projects for delete
  to authenticated
  using (
    exists (
      select 1 from public.creator_accounts c
      where c.id = creator_id and c.owner_user_id = auth.uid()
    )
  );

create policy "Public can read media for published projects"
  on public.project_media for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.projects p
      where p.id = project_id and p.published = true
    )
  );

create policy "Owners can read project media"
  on public.project_media for select
  to authenticated
  using (
    exists (
      select 1 from public.projects p
      join public.creator_accounts c on c.id = p.creator_id
      where p.id = project_id and c.owner_user_id = auth.uid()
    )
  );

create policy "Owners can add project media"
  on public.project_media for insert
  to authenticated
  with check (
    exists (
      select 1 from public.projects p
      join public.creator_accounts c on c.id = p.creator_id
      where p.id = project_id and c.owner_user_id = auth.uid()
    )
  );

create policy "Owners can update project media"
  on public.project_media for update
  to authenticated
  using (
    exists (
      select 1 from public.projects p
      join public.creator_accounts c on c.id = p.creator_id
      where p.id = project_id and c.owner_user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.projects p
      join public.creator_accounts c on c.id = p.creator_id
      where p.id = project_id and c.owner_user_id = auth.uid()
    )
  );

create policy "Owners can delete project media"
  on public.project_media for delete
  to authenticated
  using (
    exists (
      select 1 from public.projects p
      join public.creator_accounts c on c.id = p.creator_id
      where p.id = project_id and c.owner_user_id = auth.uid()
    )
  );
