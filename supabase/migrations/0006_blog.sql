-- Veyra Journal / Blog
-- Content is platform-owned today; publishing writes will later flow through the admin service layer.

create type public.blog_post_status as enum ('draft', 'published', 'archived');
create type public.blog_comment_status as enum ('pending', 'approved', 'rejected', 'spam');

create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text not null default '',
  category text not null default 'Veyra Journal',
  cover_path text,
  content_json jsonb not null default '[]'::jsonb,
  author_name text not null default 'Veyra',
  status public.blog_post_status not null default 'draft',
  seo_title text,
  seo_description text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint blog_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create index blog_posts_public_idx
  on public.blog_posts (published_at desc)
  where status = 'published';

create table public.blog_comments (
  id uuid primary key default gen_random_uuid(),
  blog_post_id uuid not null references public.blog_posts(id) on delete cascade,
  author_name text not null,
  body text not null,
  status public.blog_comment_status not null default 'pending',
  user_id uuid references auth.users(id) on delete set null,
  anonymous_key text,
  created_at timestamptz not null default now(),
  moderated_at timestamptz,
  moderated_by uuid references auth.users(id) on delete set null,
  moderation_reason text,
  constraint blog_comment_body_length check (char_length(body) between 1 and 5000),
  constraint blog_comment_author_length check (char_length(author_name) between 1 and 120)
);

create index blog_comments_post_idx
  on public.blog_comments (blog_post_id, created_at desc)
  where status = 'approved';

alter table public.blog_posts enable row level security;
alter table public.blog_comments enable row level security;

create policy "Public can read published blog posts"
  on public.blog_posts
  for select
  to anon, authenticated
  using (status = 'published');

create policy "Public can read approved blog comments"
  on public.blog_comments
  for select
  to anon, authenticated
  using (
    status = 'approved'
    and exists (
      select 1
      from public.blog_posts p
      where p.id = blog_post_id
        and p.status = 'published'
    )
  );

-- Comment creation is intentionally not opened directly to anonymous clients.
-- Public comments should enter through an application/server endpoint with validation,
-- rate limiting, abuse controls, consent handling, and moderation before this policy is added.

comment on table public.blog_posts is 'Veyra platform editorial content and product updates.';
comment on table public.blog_comments is 'Moderated reader discussion for published Veyra Journal posts.';
