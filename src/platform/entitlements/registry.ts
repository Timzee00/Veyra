export const FEATURE_IDS = {
  BASIC_PROFILE: "basic_profile",
  PREMIUM_TEMPLATES: "premium_templates",
  VIDEO_PORTFOLIO: "video_portfolio",
  ADVANCED_ANALYTICS: "advanced_analytics",
  CUSTOM_DOMAIN: "custom_domain",
  CUSTOM_BRANDING: "custom_branding",
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

/**
 * Product code should ask for capabilities, never for plan names.
 * Resolution will later combine plan, add-ons, promotions and admin grants.
 */
export interface EntitlementResolver {
  canUse(feature: FeatureId): Promise<boolean>;
  limit(feature: FeatureId): Promise<number | null>;
}
