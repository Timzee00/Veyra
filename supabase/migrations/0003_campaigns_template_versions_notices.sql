-- Veyra: campaigns, durable entitlement grants, template versions, and contextual notices
-- This migration is intentionally additive and keeps campaign lifecycle separate
-- from the lifetime of benefits granted by a campaign.

create table if not exists public.template_versions (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.templates(id) on delete restrict,
  version text not null,
  status text not null default 'active' check (status in ('draft','active','deprecated','maintenance','blocked')),
  definition jsonb not null default '{}'::jsonb,
  checksum text,
  release_notes text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  unique (template_id, version)
);

create index if not exists idx_template_versions_template_status
  on public.template_versions(template_id, status);

alter table public.creator_sites
  add column if not exists template_version_id uuid references public.template_versions(id) on delete restrict;

create index if not exists idx_creator_sites_template_version
  on public.creator_sites(template_version_id);

create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  name text not null,
  description text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  status text not null default 'draft' check (status in ('draft','scheduled','active','ended','archived')),
  eligibility jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at is null or ends_at > starts_at)
);

create index if not exists idx_campaigns_status_dates
  on public.campaigns(status, starts_at, ends_at);

create table if not exists public.campaign_benefits (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  feature_id uuid references public.features(id) on delete restrict,
  template_version_id uuid references public.template_versions(id) on delete restrict,
  entitlement_key text,
  value jsonb not null default '{}'::jsonb,
  grant_type text not null default 'permanent' check (grant_type in ('permanent','temporary','expires_at','usage_limited','subscription_bound','version_pinned','manual_upgrade')),
  duration_seconds bigint,
  max_uses integer,
  created_at timestamptz not null default now(),
  check (num_nonnulls(feature_id, template_version_id, entitlement_key) = 1),
  check (duration_seconds is null or duration_seconds > 0),
  check (max_uses is null or max_uses > 0)
);

create index if not exists idx_campaign_benefits_campaign
  on public.campaign_benefits(campaign_id);

create table if not exists public.campaign_claims (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete restrict,
  creator_id uuid not null references public.creators(id) on delete cascade,
  claimed_at timestamptz not null default now(),
  source_metadata jsonb not null default '{}'::jsonb,
  unique (campaign_id, creator_id)
);

create index if not exists idx_campaign_claims_creator
  on public.campaign_claims(creator_id, claimed_at desc);

-- Durable benefit grants are independent from campaign lifecycle.
create table if not exists public.entitlement_grants (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.creators(id) on delete cascade,
  feature_id uuid references public.features(id) on delete restrict,
  template_version_id uuid references public.template_versions(id) on delete restrict,
  campaign_id uuid references public.campaigns(id) on delete set null,
  campaign_benefit_id uuid references public.campaign_benefits(id) on delete set null,
  source_type text not null check (source_type in ('plan','addon','promotion','campaign','admin','verification','system')),
  source_key text,
  value jsonb not null default '{}'::jsonb,
  grant_type text not null check (grant_type in ('permanent','temporary','expires_at','usage_limited','subscription_bound','version_pinned','manual_upgrade')),
  granted_at timestamptz not null default now(),
  expires_at timestamptz,
  revoked_at timestamptz,
  revoked_reason text,
  unique (creator_id, feature_id, campaign_benefit_id, campaign_id, source_key)
);

create index if not exists idx_entitlement_grants_creator_active
  on public.entitlement_grants(creator_id, expires_at, revoked_at);

create index if not exists idx_entitlement_grants_template_version
  on public.entitlement_grants(template_version_id);

-- Contextual notices: banners, modal announcements, prompts, and in-product guidance.
create table if not exists public.notices (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  title text not null,
  body text not null,
  kind text not null default 'banner' check (kind in ('banner','modal','toast','inline','announcement')),
  placement text not null default 'global' check (placement in ('global','marketing','dashboard','creator_site','admin','support','auth')),
  priority integer not null default 100,
  status text not null default 'draft' check (status in ('draft','scheduled','active','paused','ended','archived')),
  starts_at timestamptz,
  ends_at timestamptz,
  dismissible boolean not null default true,
  cooldown_seconds integer,
  max_impressions integer,
  audience jsonb not null default '{}'::jsonb,
  eligibility jsonb not null default '{}'::jsonb,
  action jsonb not null default '{}'::jsonb,
  campaign_id uuid references public.campaigns(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at is null or starts_at is null or ends_at > starts_at),
  check (cooldown_seconds is null or cooldown_seconds >= 0),
  check (max_impressions is null or max_impressions > 0)
);

create index if not exists idx_notices_active_window
  on public.notices(status, starts_at, ends_at, priority desc);

create table if not exists public.notice_interactions (
  id uuid primary key default gen_random_uuid(),
  notice_id uuid not null references public.notices(id) on delete cascade,
  creator_id uuid references public.creators(id) on delete cascade,
  visitor_id text,
  interaction text not null check (interaction in ('impression','dismissed','clicked','converted')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_notice_interactions_notice_time
  on public.notice_interactions(notice_id, created_at desc);

create index if not exists idx_notice_interactions_actor_time
  on public.notice_interactions(creator_id, visitor_id, created_at desc);

-- RLS is enabled now; policies can be tightened alongside the existing project policies.
alter table public.template_versions enable row level security;
alter table public.campaigns enable row level security;
alter table public.campaign_benefits enable row level security;
alter table public.campaign_claims enable row level security;
alter table public.entitlement_grants enable row level security;
alter table public.notices enable row level security;
alter table public.notice_interactions enable row level security;

-- Public rendering needs published template definitions, but mutations remain server/admin controlled.
drop policy if exists "public can read active template versions" on public.template_versions;
create policy "public can read active template versions"
  on public.template_versions for select
  using (status in ('active','deprecated','maintenance'));

-- Public users can read active public-facing notices. Audience/entitlement checks happen in the application layer.
drop policy if exists "public can read active notices" on public.notices;
create policy "public can read active notices"
  on public.notices for select
  using (
    status = 'active'
    and (starts_at is null or starts_at <= now())
    and (ends_at is null or ends_at > now())
  );

-- Creators can read their own durable grants and claims; write paths are server-side.
drop policy if exists "creators can read own entitlement grants" on public.entitlement_grants;
create policy "creators can read own entitlement grants"
  on public.entitlement_grants for select
  using (
    exists (
      select 1 from public.creators c
      where c.id = creator_id and c.user_id = auth.uid()
    )
  );

drop policy if exists "creators can read own campaign claims" on public.campaign_claims;
create policy "creators can read own campaign claims"
  on public.campaign_claims for select
  using (
    exists (
      select 1 from public.creators c
      where c.id = creator_id and c.user_id = auth.uid()
    )
  );

-- Creators can read their own notice interactions; public impression writes should use a server endpoint.
drop policy if exists "creators can read own notice interactions" on public.notice_interactions;
create policy "creators can read own notice interactions"
  on public.notice_interactions for select
  using (
    exists (
      select 1 from public.creators c
      where c.id = creator_id and c.user_id = auth.uid()
    )
  );
