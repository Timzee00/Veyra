import type { ConsentChoice, ConsentPurpose, ConsentSnapshot } from "./contracts";

export const CONSENT_POLICY_VERSION = "1.0";
const STORAGE_KEY = `veyra-consent:${CONSENT_POLICY_VERSION}`;

const DEFAULT_CHOICES: Record<ConsentPurpose, ConsentChoice> = {
  essential: "accepted",
  preferences: "not_set",
  analytics: "not_set",
  marketing: "not_set",
};

export function readLocalConsent(): ConsentSnapshot {
  if (typeof window === "undefined") {
    return { policyVersion: CONSENT_POLICY_VERSION, updatedAt: null, choices: DEFAULT_CHOICES };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { policyVersion: CONSENT_POLICY_VERSION, updatedAt: null, choices: DEFAULT_CHOICES };
    const parsed = JSON.parse(raw) as Partial<ConsentSnapshot>;
    return {
      policyVersion: CONSENT_POLICY_VERSION,
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : null,
      choices: { ...DEFAULT_CHOICES, ...(parsed.choices ?? {}) },
    };
  } catch {
    return { policyVersion: CONSENT_POLICY_VERSION, updatedAt: null, choices: DEFAULT_CHOICES };
  }
}

export function writeLocalConsent(choices: Record<ConsentPurpose, ConsentChoice>): ConsentSnapshot {
  const snapshot: ConsentSnapshot = {
    policyVersion: CONSENT_POLICY_VERSION,
    updatedAt: new Date().toISOString(),
    choices: { ...DEFAULT_CHOICES, ...choices, essential: "accepted" },
  };

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  window.dispatchEvent(new CustomEvent("veyra:consent-changed", { detail: snapshot }));
  return snapshot;
}
