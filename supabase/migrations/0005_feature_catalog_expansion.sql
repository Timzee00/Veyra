-- Veyra: expandable product capability catalog.
-- Plans can be reconfigured later without changing application code.

insert into public.features (id, name, description, kind)
values
  ('platform_branding_removal', 'Remove platform branding', 'Remove the Veyra/Timzee Corp platform badge from a public creator site where the current entitlement permits it.', 'boolean'),
  ('design_customization', 'Design customization', 'Customize supported template colors, typography, gradients and presentation tokens.', 'boolean'),
  ('advanced_customization', 'Advanced customization', 'Use expanded layout, motion, background and component controls.', 'boolean'),
  ('campaign_benefits', 'Campaign benefits', 'Receive benefits granted through Veyra campaigns and promotions.', 'boolean'),
  ('ai_template_builder', 'AI template builder', 'Generate validated Veyra template definitions using the future AI template builder.', 'boolean'),
  ('ai_template_publish', 'Publish custom AI templates', 'Publish and manage a custom template generated through the future AI template builder.', 'boolean')
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  kind = excluded.kind,
  active = true;
