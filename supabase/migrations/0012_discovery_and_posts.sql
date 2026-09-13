-- Veyra discovery layer: public creator discovery, posts, and searchable creative work.

alter table public.creator_accounts
  add column if not exists category text,
  add column if not exists location text,
  add column if not exists avatar_path text,
  add column if not exists featured boolean not null default false;

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.creator_accounts(id) on delete cascade,
  slug text not null,
  title text not null,
  excerpt text,
  body text,
  cover_path text,
  post_type text not null default 'update',
  published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (creator_id, slug),
  constraint post_slug_format check (slug ~ '^[a-z0-9][a-z0-9-]{0,79}$'),
  constraint post_type_allowed check (post_type in ('update','showcase','process','insight','announcement'))
);

create index posts_public_idx on public.posts (published, published_at desc);
create index posts_creator_public_idx on public.posts (creator_id, published, published_at desc);

create table public.post_media (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  storage_path text not null,
  media_type text not null default 'image',
  mime_type text,
  width integer,
  height integer,
  alt_text text,
  caption text,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create index post_media_public_idx on public.post_media (post_id, position);

create table public.post_likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  anonymous_key text,
  created_at timestamptz not null default now(),
  constraint post_like_identity check (user_id is not null or anonymous_key is not null)
);

create unique index post_likes_user_unique_idx
  on public.post_likes (post_id, user_id)
  where user_id is not null;
create unique index post_likes_anonymous_unique_idx
  on public.post_likes (post_id, anonymous_key)
  where anonymous_key is not null;

alter table public.posts enable row level security;
alter table public.post_media enable row level security;
alter table public.post_likes enable row level security;

create policy posts_public_select on public.posts
  for select to anon, authenticated
  using (
    published = true
    and exists (
      select 1 from public.creator_accounts ca
      join public.creator_sites cs on cs.creator_id = ca.id
      where ca.id = posts.creator_id
        and ca.status = 'active'
        and cs.visibility = 'published'
    )
  );

create policy posts_creator_select on public.posts
  for select to authenticated
  using (app.current_user_has_creator_access(creator_id));

create policy posts_creator_insert on public.posts
  for insert to authenticated
  with check (app.current_user_has_creator_access(creator_id));

create policy posts_creator_update on public.posts
  for update to authenticated
  using (app.current_user_has_creator_access(creator_id))
  with check (app.current_user_has_creator_access(creator_id));

create policy posts_creator_delete on public.posts
  for delete to authenticated
  using (app.current_user_has_creator_access(creator_id));

create policy post_media_public_select on public.post_media
  for select to anon, authenticated
  using (
    exists (
      select 1 from public.posts p
      where p.id = post_media.post_id
        and p.published = true
    )
  );

create policy post_media_creator_insert on public.post_media
  for insert to authenticated
  with check (
    exists (
      select 1 from public.posts p
      where p.id = post_media.post_id
        and app.current_user_has_creator_access(p.creator_id)
    )
  );

create policy post_media_creator_update on public.post_media
  for update to authenticated
  using (
    exists (
      select 1 from public.posts p
      where p.id = post_media.post_id
        and app.current_user_has_creator_access(p.creator_id)
    )
  );

create policy post_media_creator_delete on public.post_media
  for delete to authenticated
  using (
    exists (
      select 1 from public.posts p
      where p.id = post_media.post_id
        and app.current_user_has_creator_access(p.creator_id)
    )
  );

create policy post_likes_public_select on public.post_likes
  for select to anon, authenticated
  using (
    exists (select 1 from public.posts p where p.id = post_likes.post_id and p.published = true)
  );

create policy post_likes_identity_insert on public.post_likes
  for insert to anon, authenticated
  with check (
    (auth.uid() is not null and user_id = auth.uid())
    or (auth.uid() is null and user_id is null and anonymous_key is not null)
  );

create policy post_likes_identity_delete on public.post_likes
  for delete to authenticated
  using (user_id = auth.uid());

comment on table public.posts is 'Creator-authored short-form updates and showcase posts for Veyra discovery.';
comment on table public.post_likes is 'Individual post likes with authenticated or anonymous identity keys.';
