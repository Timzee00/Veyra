-- Discovery query foundation for growing creator directories.
-- Apply after 0013. Avoid full-table scans for active published creator lists.
create index if not exists creator_accounts_public_feed_idx
  on public.creator_accounts (created_at desc, id desc)
  where status = 'active';
create index if not exists projects_public_feed_idx
  on public.projects (published_at desc, id desc)
  where published = true;
create index if not exists posts_public_feed_idx
  on public.posts (published_at desc, id desc)
  where published = true;
-- Text search currently uses ILIKE; pg_trgm helps substring searches.
create extension if not exists pg_trgm;
create index if not exists creator_accounts_name_trgm_idx
  on public.creator_accounts using gin (display_name gin_trgm_ops);
create index if not exists creator_accounts_handle_trgm_idx
  on public.creator_accounts using gin (handle gin_trgm_ops);
create index if not exists projects_title_trgm_idx
  on public.projects using gin (title gin_trgm_ops);
create index if not exists posts_title_trgm_idx
  on public.posts using gin (title gin_trgm_ops);
