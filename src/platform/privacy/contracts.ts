export const CONSENT_PURPOSES = {
  ESSENTIAL: "essential",
  PREFERENCES: "preferences",
  ANALYTICS: "analytics",
  MARKETING: "marketing",
} as const;

export type ConsentPurpose =
  (typeof CONSENT_PURPOSES)[keyof typeof CONSENT_PURPOSES];

export type ConsentChoice = "accepted" | "rejected" | "not_set";

export interface ConsentRecordInput {
  purpose: ConsentPurpose;
  choice: ConsentChoice;
  policyVersion: string;
}

export interface ConsentSnapshot {
  policyVersion: string;
  updatedAt: string | null;
  choices: Record<ConsentPurpose, ConsentChoice>;
}
