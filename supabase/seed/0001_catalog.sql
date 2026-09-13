insert into public.features (id, name, description, kind)
values
  ('basic_profile', 'Basic profile', 'Core creator identity and profile publishing.', 'boolean'),
  ('premium_templates', 'Premium templates', 'Access to premium portfolio presentation systems.', 'boolean'),
  ('video_portfolio', 'Video portfolio', 'Publish supported video work.', 'boolean'),
  ('advanced_analytics', 'Advanced analytics', 'Extended portfolio performance and traffic analytics.', 'boolean'),
  ('custom_domain', 'Custom domain', 'Connect a verified custom domain to a creator site.', 'boolean'),
  ('custom_branding', 'Custom branding', 'Remove platform branding and unlock advanced identity controls.', 'boolean'),
  ('team_members', 'Team members', 'Invite collaborators with scoped permissions.', 'limit'),
  ('api_access', 'API access', 'Use supported Veyra APIs and integrations.', 'boolean'),
  ('priority_support', 'Priority support', 'Priority support queue handling.', 'boolean')
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  kind = excluded.kind;

insert into public.plans (code, name, description, sort_order)
values
  ('free', 'Free', 'A strong starting point for independent creators.', 10),
  ('pro', 'Pro', 'For creators ready for more presentation and growth tools.', 20),
  ('studio', 'Studio', 'For established creators who need deeper control.', 30)
on conflict (code) do update set
  name = excluded.name,
  description = excluded.description,
  sort_order = excluded.sort_order;

insert into public.plan_entitlements (plan_id, feature_id, enabled, limit_value)
select p.id, v.feature_id, v.enabled, v.limit_value
from public.plans p
join (values
  ('free', 'basic_profile', true, null::bigint),
  ('free', 'premium_templates', false, null::bigint),
  ('free', 'video_portfolio', false, null::bigint),
  ('free', 'advanced_analytics', false, null::bigint),
  ('free', 'custom_domain', false, 0::bigint),
  ('free', 'custom_branding', false, null::bigint),
  ('free', 'team_members', false, 0::bigint),
  ('free', 'api_access', false, null::bigint),
  ('free', 'priority_support', false, null::bigint),
  ('pro', 'basic_profile', true, null::bigint),
  ('pro', 'premium_templates', true, null::bigint),
  ('pro', 'video_portfolio', true, null::bigint),
  ('pro', 'advanced_analytics', true, null::bigint),
  ('pro', 'custom_domain', false, 0::bigint),
  ('pro', 'custom_branding', true, null::bigint),
  ('pro', 'team_members', true, 2::bigint),
  ('pro', 'api_access', false, null::bigint),
  ('pro', 'priority_support', true, null::bigint),
  ('studio', 'basic_profile', true, null::bigint),
  ('studio', 'premium_templates', true, null::bigint),
  ('studio', 'video_portfolio', true, null::bigint),
  ('studio', 'advanced_analytics', true, null::bigint),
  ('studio', 'custom_domain', true, 1::bigint),
  ('studio', 'custom_branding', true, null::bigint),
  ('studio', 'team_members', true, 10::bigint),
  ('studio', 'api_access', true, null::bigint),
  ('studio', 'priority_support', true, null::bigint)
) as v(plan_code, feature_id, enabled, limit_value) on v.plan_code = p.code
on conflict (plan_id, feature_id) do update set
  enabled = excluded.enabled,
  limit_value = excluded.limit_value;

insert into public.roles (id, name, description)
values
  ('creator_owner', 'Creator owner', 'Full control over the creator account.'),
  ('creator_editor', 'Creator editor', 'Can manage permitted portfolio content.'),
  ('support_agent', 'Support agent', 'Can manage creator support conversations.'),
  ('moderator', 'Moderator', 'Can review and act on reported content.'),
  ('reviewer', 'Reviewer', 'Can review verification applications.'),
  ('admin', 'Admin', 'Platform administration with scoped permissions.'),
  ('super_admin', 'Super admin', 'Highest-level platform administration.')
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description;

insert into public.permissions (id, description)
values
  ('creator.manage', 'Manage a creator account.'),
  ('content.manage', 'Create, edit and publish permitted content.'),
  ('support.manage', 'Manage support tickets and messages.'),
  ('verification.review', 'Review verification applications.'),
  ('moderation.manage', 'Review reports and take moderation actions.'),
  ('billing.manage', 'Manage billing and subscription operations.'),
  ('plans.manage', 'Create and configure product plans.'),
  ('platform.manage', 'Manage platform configuration and feature flags.'),
  ('audit.read', 'View security and administrative audit events.')
on conflict (id) do update set description = excluded.description;

insert into public.role_permissions (role_id, permission_id)
values
  ('creator_owner', 'creator.manage'),
  ('creator_owner', 'content.manage'),
  ('creator_editor', 'content.manage'),
  ('support_agent', 'support.manage'),
  ('reviewer', 'verification.review'),
  ('moderator', 'moderation.manage'),
  ('admin', 'support.manage'),
  ('admin', 'verification.review'),
  ('admin', 'moderation.manage'),
  ('admin', 'billing.manage'),
  ('admin', 'audit.read'),
  ('super_admin', 'support.manage'),
  ('super_admin', 'verification.review'),
  ('super_admin', 'moderation.manage'),
  ('super_admin', 'billing.manage'),
  ('super_admin', 'plans.manage'),
  ('super_admin', 'platform.manage'),
  ('super_admin', 'audit.read')
on conflict do nothing;
