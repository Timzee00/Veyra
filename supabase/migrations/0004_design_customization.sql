-- Veyra: creator design customization, reusable presets, and feature catalog expansion.
-- Customization is stored as structured data and resolved into design tokens at render time.

alter table public.creator_sites
  add column if not exists design_settings jsonb not null default '{}'::jsonb;

create table if not exists public.design_presets (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  name text not null,
  description text,
  preset_type text not null check (preset_type in ('system','color','gradient','typography','complete')),
  tokens jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  premium boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_design_presets_active_type
  on public.design_presets(active, preset_type, premium);

create table if not exists public.creator_saved_presets (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.creator_accounts(id) on delete cascade,
  preset_id uuid references public.design_presets(id) on delete set null,
  name text not null,
  tokens jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_creator_saved_presets_creator
  on public.creator_saved_presets(creator_id, updated_at desc);

alter table public.design_presets enable row level security;
alter table public.creator_saved_presets enable row level security;

create policy "public can read active design presets"
  on public.design_presets for select
  using (active = true);

create policy "creator can read own saved presets"
  on public.creator_saved_presets for select
  using (app.current_user_has_creator_access(creator_id));

create policy "creator can insert own saved presets"
  on public.creator_saved_presets for insert
  with check (app.current_user_has_creator_access(creator_id));

create policy "creator can update own saved presets"
  on public.creator_saved_presets for update
  using (app.current_user_has_creator_access(creator_id))
  with check (app.current_user_has_creator_access(creator_id));

create policy "creator can delete own saved presets"
  on public.creator_saved_presets for delete
  using (app.current_user_has_creator_access(creator_id));
