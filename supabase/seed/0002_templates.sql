insert into public.templates (id, name, slug, description, tier)
values
  ('minimal', 'Minimal', 'minimal', 'Quiet typography and focused project presentation.', 'free'),
  ('cinema', 'Cinema', 'cinema', 'Large imagery, dramatic typography and cinematic presentation.', 'pro')
on conflict (id) do update set
  name = excluded.name,
  slug = excluded.slug,
  description = excluded.description,
  tier = excluded.tier,
  active = true;

insert into public.template_versions (template_id, version, status, definition, release_notes, published_at)
values
  (
    'minimal', '1.0.0', 'active',
    '{"schemaVersion":1,"layout":{"variant":"single-column","maxWidth":1180},"sections":[{"type":"hero","variant":"minimal"},{"type":"projects","variant":"grid"},{"type":"about","variant":"split"},{"type":"services","variant":"list"},{"type":"contact","variant":"simple"}],"designTokens":{},"responsive":{"mobileColumns":1,"tabletColumns":2,"desktopColumns":3},"capabilities":["colors","typography","gradients","spacing","radius","shadows","backgrounds","motion"]}'::jsonb,
    'Initial Minimal release.', now()
  ),
  (
    'cinema', '1.0.0', 'active',
    '{"schemaVersion":1,"layout":{"variant":"immersive","maxWidth":1440,"navigation":"overlay"},"sections":[{"type":"hero","variant":"visual"},{"type":"featured_project","variant":"full-bleed"},{"type":"projects","variant":"masonry"},{"type":"about","variant":"cinematic"},{"type":"contact","variant":"cta"}],"designTokens":{"motion":"cinematic","radius":24},"responsive":{"mobileColumns":1,"tabletColumns":2,"desktopColumns":3},"capabilities":["colors","typography","gradients","spacing","radius","shadows","backgrounds","motion","custom_sections","advanced_layout"]}'::jsonb,
    'Initial Cinema release.', now()
  )
on conflict (template_id, version) do update set
  status = excluded.status,
  definition = excluded.definition,
  release_notes = excluded.release_notes,
  published_at = excluded.published_at;

insert into public.design_presets (key, name, description, preset_type, tokens, premium)
values
  ('midnight', 'Midnight', 'Deep neutral palette for high-contrast portfolios.', 'complete', '{"colors":{"background":"#07070a","surface":"#101015","text":"#f6f4ef","muted":"#a29fab","accent":"#bca8ff","accentStrong":"#7b5cff","border":"rgba(255,255,255,0.12)"}}'::jsonb, false),
  ('aurora', 'Aurora', 'Color-rich glow treatment for expressive creative work.', 'gradient', '{"gradient":{"id":"aurora-night","name":"Aurora Night","css":"radial-gradient(circle at 25% 20%, #7c3aed, transparent 45%), radial-gradient(circle at 75% 80%, #06b6d4, transparent 50%), #07070a"}}'::jsonb, true),
  ('editorial', 'Editorial', 'Refined typography and warm contrast for art-directed presentation.', 'typography', '{"typography":{"scale":"expressive","letterSpacing":"tight"}}'::jsonb, true)
on conflict (key) do update set
  name = excluded.name,
  description = excluded.description,
  preset_type = excluded.preset_type,
  tokens = excluded.tokens,
  premium = excluded.premium,
  active = true;
