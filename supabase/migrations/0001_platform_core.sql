create extension if not exists pgcrypto;

create schema if not exists app;

create type public.creator_status as enum ('active', 'suspended', 'pending_deletion', 'deleted');
create type public.site_visibility as enum ('draft', 'published', 'unlisted');
create type public.verification_status as enum ('not_applied', 'pending', 'under_review', 'approved', 'rejected', 'suspended', 'revoked', 'expired');
create type public.ticket_status as enum ('open', 'in_progress', 'waiting_for_creator', 'waiting_for_support', 'resolved', 'closed');
create type public.ticket_priority as enum ('low', 'normal', 'high', 'urgent');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  avatar_path text,
  timezone text default 'Africa/Lagos',
  locale text default 'en-NG',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.creator_accounts (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete restrict,
  handle text not null unique,
  display_name text not null,
  bio text,
  website_url text,
  whatsapp_number text,
  default_inquiry_message text,
  status public.creator_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint creator_handle_format check (handle ~ '^[a-z0-9][a-z0-9_-]{2,31}$')
);

create table public.creator_sites (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null unique references public.creator_accounts(id) on delete cascade,
  visibility public.site_visibility not null default 'draft',
  template_id text not null default 'minimal',
  title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Stable template catalog. Individual releases live in template_versions.
create table public.templates (
  id text primary key,
  name text not null,
  slug text not null unique,
  description text,
  tier text not null default 'free' check (tier in ('free','pro','studio','custom')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.features (
  id text primary key,
  name text not null,
  description text,
  kind text not null default 'boolean',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.plans (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.plan_entitlements (
  plan_id uuid not null references public.plans(id) on delete cascade,
  feature_id text not null references public.features(id) on delete cascade,
  enabled boolean not null default true,
  limit_value bigint,
  value_json jsonb,
  primary key (plan_id, feature_id)
);

create table public.creator_subscriptions (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.creator_accounts(id) on delete cascade,
  plan_id uuid not null references public.plans(id) on delete restrict,
  status text not null default 'active',
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  provider text,
  provider_reference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index creator_one_active_subscription_idx
  on public.creator_subscriptions (creator_id)
  where status = 'active' and ends_at is null;

create table public.permissions (
  id text primary key,
  description text
);

create table public.roles (
  id text primary key,
  name text not null unique,
  description text
);

create table public.role_permissions (
  role_id text not null references public.roles(id) on delete cascade,
  permission_id text not null references public.permissions(id) on delete cascade,
  primary key (role_id, permission_id)
);

create table public.creator_memberships (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.creator_accounts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role_id text not null references public.roles(id) on delete restrict,
  created_at timestamptz not null default now(),
  unique (creator_id, user_id)
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.creator_accounts(id) on delete cascade,
  slug text not null,
  title text not null,
  summary text,
  body text,
  published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (creator_id, slug)
);

create index projects_public_idx on public.projects (creator_id, published, published_at desc);

create table public.project_media (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  storage_path text not null,
  media_type text not null,
  width integer,
  height integer,
  alt_text text,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.verification_profiles (
  creator_id uuid primary key references public.creator_accounts(id) on delete cascade,
  status public.verification_status not null default 'not_applied',
  verification_type text,
  verified_at timestamptz,
  expires_at timestamptz,
  revoked_at timestamptz,
  reason text,
  updated_at timestamptz not null default now()
);

create table public.verification_applications (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.creator_accounts(id) on delete cascade,
  verification_type text not null,
  answers jsonb not null default '{}'::jsonb,
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id) on delete set null,
  decision text,
  reviewer_notes text
);

create index verification_applications_creator_idx on public.verification_applications (creator_id, submitted_at desc);

create table public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid references public.creator_accounts(id) on delete set null,
  requester_user_id uuid references auth.users(id) on delete set null,
  assigned_to uuid references auth.users(id) on delete set null,
  subject text not null,
  status public.ticket_status not null default 'open',
  priority public.ticket_priority not null default 'normal',
  category text not null default 'general',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.support_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.support_tickets(id) on delete cascade,
  author_user_id uuid references auth.users(id) on delete set null,
  body text not null,
  internal boolean not null default false,
  created_at timestamptz not null default now()
);

create index support_messages_ticket_idx on public.support_messages (ticket_id, created_at);

create table public.consent_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  anonymous_key text,
  purpose text not null,
  choice text not null,
  policy_version text not null,
  recorded_at timestamptz not null default now(),
  expires_at timestamptz
);

create index consent_lookup_idx on public.consent_records (user_id, anonymous_key, purpose, recorded_at desc);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  event_name text not null,
  creator_id uuid references public.creator_accounts(id) on delete set null,
  actor_user_id uuid references auth.users(id) on delete set null,
  anonymous_key text,
  entity_type text,
  entity_id uuid,
  properties jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

create index events_creator_time_idx on public.events (creator_id, occurred_at desc);
create index events_name_time_idx on public.events (event_name, occurred_at desc);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  target_type text,
  target_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index audit_target_idx on public.audit_logs (target_type, target_id, created_at desc);

create or replace function app.current_user_has_creator_access(target_creator_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.creator_memberships cm
    where cm.creator_id = target_creator_id
      and cm.user_id = auth.uid()
  );
$$;

create or replace function app.current_user_owns_creator(target_creator_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.creator_accounts ca
    where ca.id = target_creator_id
      and ca.owner_user_id = auth.uid()
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.creator_accounts enable row level security;
alter table public.creator_sites enable row level security;
alter table public.projects enable row level security;
alter table public.project_media enable row level security;
alter table public.creator_memberships enable row level security;
alter table public.verification_profiles enable row level security;
alter table public.support_tickets enable row level security;
alter table public.support_messages enable row level security;
alter table public.consent_records enable row level security;
alter table public.events enable row level security;
alter table public.audit_logs enable row level security;

create policy profiles_select_own on public.profiles
  for select using (id = auth.uid());

create policy profiles_update_own on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

create policy creators_public_select on public.creator_accounts
  for select using (status = 'active');

create policy creators_owner_insert on public.creator_accounts
  for insert with check (owner_user_id = auth.uid());

create policy creators_owner_update on public.creator_accounts
  for update using (owner_user_id = auth.uid())
  with check (owner_user_id = auth.uid());

create policy sites_public_select on public.creator_sites
  for select using (
    visibility in ('published', 'unlisted')
    or app.current_user_has_creator_access(creator_id)
  );

create policy sites_owner_insert on public.creator_sites
  for insert with check (app.current_user_owns_creator(creator_id));

create policy sites_owner_update on public.creator_sites
  for update using (app.current_user_owns_creator(creator_id))
  with check (app.current_user_owns_creator(creator_id));

create policy projects_public_select on public.projects
  for select using (
    published = true
    or app.current_user_has_creator_access(creator_id)
  );

create policy projects_creator_insert on public.projects
  for insert with check (app.current_user_has_creator_access(creator_id));

create policy projects_creator_update on public.projects
  for update using (app.current_user_has_creator_access(creator_id))
  with check (app.current_user_has_creator_access(creator_id));

create policy projects_creator_delete on public.projects
  for delete using (app.current_user_has_creator_access(creator_id));

create policy media_public_select on public.project_media
  for select using (
    exists (
      select 1 from public.projects p
      where p.id = project_media.project_id
        and (p.published = true or app.current_user_has_creator_access(p.creator_id))
    )
  );

create policy media_creator_insert on public.project_media
  for insert with check (
    exists (
      select 1 from public.projects p
      where p.id = project_media.project_id
        and app.current_user_has_creator_access(p.creator_id)
    )
  );

create policy media_creator_update on public.project_media
  for update using (
    exists (
      select 1 from public.projects p
      where p.id = project_media.project_id
        and app.current_user_has_creator_access(p.creator_id)
    )
  );

create policy memberships_owner_select on public.creator_memberships
  for select using (user_id = auth.uid() or app.current_user_owns_creator(creator_id));

create policy verification_public_select on public.verification_profiles
  for select using (status = 'approved');

create policy verification_owner_select on public.verification_profiles
  for select using (app.current_user_has_creator_access(creator_id));

create policy support_requester_select on public.support_tickets
  for select using (requester_user_id = auth.uid() or app.current_user_has_creator_access(creator_id));

create policy support_requester_insert on public.support_tickets
  for insert with check (requester_user_id = auth.uid());

create policy support_message_requester_select on public.support_messages
  for select using (
    exists (
      select 1 from public.support_tickets st
      where st.id = support_messages.ticket_id
        and (st.requester_user_id = auth.uid() or app.current_user_has_creator_access(st.creator_id))
        and support_messages.internal = false
    )
  );

create policy support_message_requester_insert on public.support_messages
  for insert with check (
    author_user_id = auth.uid()
    and exists (
      select 1 from public.support_tickets st
      where st.id = support_messages.ticket_id
        and st.requester_user_id = auth.uid()
    )
  );

create policy consent_own_select on public.consent_records
  for select using (user_id = auth.uid());

create policy consent_own_insert on public.consent_records
  for insert with check (user_id = auth.uid() or (user_id is null and anonymous_key is not null));

create policy events_creator_select on public.events
  for select using (app.current_user_has_creator_access(creator_id));

-- Event ingestion and audit writes should be performed through trusted server-side paths.
-- Deliberately no client insert policy is granted to events or audit_logs here.
