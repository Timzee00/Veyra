-- Private project media storage with creator-scoped object paths.
-- Files are served through signed URLs rather than exposing draft assets publicly.

insert into storage.buckets (id, name, public, file_size_limit)
values ('project-media', 'project-media', false, 52428800)
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit;

create policy "Project owners can upload project media"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'project-media'
  and exists (
    select 1
    from public.projects p
    where p.id = (storage.foldername(name))[2]::uuid
      and app.current_user_has_creator_access(p.creator_id)
  )
);

create policy "Project members can read project media"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'project-media'
  and exists (
    select 1
    from public.projects p
    where p.id = (storage.foldername(name))[2]::uuid
      and app.current_user_has_creator_access(p.creator_id)
  )
);

create policy "Project owners can update project media"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'project-media'
  and exists (
    select 1
    from public.projects p
    where p.id = (storage.foldername(name))[2]::uuid
      and app.current_user_has_creator_access(p.creator_id)
  )
)
with check (
  bucket_id = 'project-media'
  and exists (
    select 1
    from public.projects p
    where p.id = (storage.foldername(name))[2]::uuid
      and app.current_user_has_creator_access(p.creator_id)
  )
);

create policy "Project owners can delete project media"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'project-media'
  and exists (
    select 1
    from public.projects p
    where p.id = (storage.foldername(name))[2]::uuid
      and app.current_user_has_creator_access(p.creator_id)
  )
);

alter table public.project_media
  add column if not exists caption text,
  add column if not exists media_role text not null default 'gallery',
  add column if not exists mime_type text,
  add column if not exists file_size bigint;

alter table public.project_media
  drop constraint if exists project_media_role_check;

alter table public.project_media
  add constraint project_media_role_check
  check (media_role in ('cover','gallery','process','outcome'));

create index if not exists project_media_project_position_idx
  on public.project_media (project_id, position, created_at);
