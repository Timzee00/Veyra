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
on conflict (template_id,version) do nothing; -- published template versions are immutable

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


-- Keep the database catalog in sync with BUILT_IN_TEMPLATES in the application.
-- Paid templates are registered for future releases but remain gated for now.
insert into public.templates (id,name,slug,description,tier,active) values
('editorial','Editorial','editorial','Magazine-inspired art direction and visual storytelling.','free',true),
('immersive','Immersive','immersive','Spacious visual presentation with a dramatic opening.','pro',true),
('studio','Studio','studio','Structured presentation for creative teams.','studio',true),
('agency','Agency','agency','Bold case-study presentation for client-facing teams.','studio',true)
on conflict (id) do update set
 name=excluded.name,slug=excluded.slug,description=excluded.description,
 tier=excluded.tier,active=excluded.active;

insert into public.template_versions(template_id,version,status,definition,release_notes,published_at) values
('editorial','1.0.0','active',
 '{"schemaVersion":1,"layout":{"variant":"editorial","maxWidth":1100},"sections":[{"type":"hero","variant":"editorial"},{"type":"projects","variant":"editorial"},{"type":"about","variant":"split"},{"type":"contact","variant":"simple"}],"designTokens":{"radius":8,"backgroundMode":"solid"},"responsive":{"mobileColumns":1,"tabletColumns":2,"desktopColumns":2},"capabilities":["colors","typography","gradients","spacing","radius","shadows","backgrounds","motion"]}'::jsonb,
 'Initial Editorial release.',now()),
('immersive','1.0.0','active',
 '{"schemaVersion":1,"layout":{"variant":"immersive","maxWidth":1280},"sections":[{"type":"hero","variant":"immersive"},{"type":"featured_project","variant":"full-bleed"},{"type":"projects","variant":"grid"},{"type":"about","variant":"cinematic"},{"type":"contact","variant":"cta"}],"designTokens":{"motion":"smooth","radius":28,"backgroundMode":"gradient"},"responsive":{"mobileColumns":1,"tabletColumns":2,"desktopColumns":3},"capabilities":["colors","typography","gradients","spacing","radius","shadows","backgrounds","motion","custom_sections","advanced_layout"]}'::jsonb,
 'Initial Immersive release.',now()),
('studio','1.0.0','active',
 '{"schemaVersion":1,"layout":{"variant":"studio-grid","maxWidth":1380},"sections":[{"type":"hero","variant":"studio"},{"type":"projects","variant":"grid"},{"type":"services","variant":"list"},{"type":"about","variant":"split"},{"type":"contact","variant":"simple"}],"designTokens":{"radius":10,"motion":"subtle"},"responsive":{"mobileColumns":1,"tabletColumns":2,"desktopColumns":4},"capabilities":["colors","typography","gradients","spacing","radius","shadows","backgrounds","motion","custom_sections","advanced_layout"]}'::jsonb,
 'Initial Studio release.',now()),
('agency','1.0.0','active',
 '{"schemaVersion":1,"layout":{"variant":"agency","maxWidth":1320},"sections":[{"type":"hero","variant":"agency"},{"type":"projects","variant":"case-studies"},{"type":"services","variant":"list"},{"type":"contact","variant":"cta"}],"designTokens":{"radius":14,"motion":"smooth"},"responsive":{"mobileColumns":1,"tabletColumns":2,"desktopColumns":2},"capabilities":["colors","typography","gradients","spacing","radius","shadows","backgrounds","motion","custom_sections","advanced_layout"]}'::jsonb,
 'Initial Agency release.',now())
on conflict (template_id,version) do nothing; -- never overwrite a pinned version
