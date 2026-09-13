export type CampaignStatus = "draft" | "scheduled" | "active" | "ended" | "archived";

export type BenefitGrantType =
  | "permanent"
  | "temporary"
  | "expires_at"
  | "usage_limited"
  | "subscription_bound"
  | "version_pinned"
  | "manual_upgrade";

export interface CampaignBenefit {
  id: string;
  featureId?: string;
  templateVersionId?: string;
  entitlementKey?: string;
  value: Record<string, unknown>;
  grantType: BenefitGrantType;
  durationSeconds?: number;
  maxUses?: number;
}

export interface Campaign {
  id: string;
  key: string;
  name: string;
  description: string | null;
  startsAt: string;
  endsAt: string | null;
  status: CampaignStatus;
  eligibility: Record<string, unknown>;
  benefits: CampaignBenefit[];
}

export interface EntitlementGrant {
  id: string;
  creatorId: string;
  featureId: string | null;
  templateVersionId: string | null;
  campaignId: string | null;
  sourceType: "plan" | "addon" | "promotion" | "campaign" | "admin" | "verification" | "system";
  sourceKey: string | null;
  value: Record<string, unknown>;
  grantType: BenefitGrantType;
  grantedAt: string;
  expiresAt: string | null;
  revokedAt: string | null;
}

export function grantIsActive(grant: EntitlementGrant, now = new Date()): boolean {
  if (grant.revokedAt) return false;
  if (grant.expiresAt && new Date(grant.expiresAt) <= now) return false;
  return true;
}
