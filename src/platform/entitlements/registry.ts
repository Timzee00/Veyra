export const FEATURE_IDS = {
  BASIC_PROFILE: "basic_profile",
  PREMIUM_TEMPLATES: "premium_templates",
  VIDEO_PORTFOLIO: "video_portfolio",
  ADVANCED_ANALYTICS: "advanced_analytics",
  CUSTOM_DOMAIN: "custom_domain",
  CUSTOM_BRANDING: "custom_branding",
  PLATFORM_BRANDING_REMOVAL: "platform_branding_removal",
  DESIGN_CUSTOMIZATION: "design_customization",
  ADVANCED_CUSTOMIZATION: "advanced_customization",
  CAMPAIGN_BENEFITS: "campaign_benefits",
  AI_TEMPLATE_BUILDER: "ai_template_builder",
  AI_TEMPLATE_PUBLISH: "ai_template_publish",
  TEAM_MEMBERS: "team_members",
  API_ACCESS: "api_access",
  PRIORITY_SUPPORT: "priority_support",
} as const;

export type FeatureId = (typeof FEATURE_IDS)[keyof typeof FEATURE_IDS];

export type EntitlementValue = {
  enabled: boolean;
  limit?: number | null;
  value?: Record<string, unknown> | null;
};

export interface EntitlementResolver {
  canUse(feature: FeatureId): Promise<boolean>;
  limit(feature: FeatureId): Promise<number | null>;
  value(feature: FeatureId): Promise<Record<string, unknown> | null>;
}
