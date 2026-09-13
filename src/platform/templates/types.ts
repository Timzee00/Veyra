export type TemplateVersionStatus =
  | "draft"
  | "active"
  | "deprecated"
  | "maintenance"
  | "blocked";

export type TemplateCapability =
  | "colors"
  | "typography"
  | "gradients"
  | "spacing"
  | "radius"
  | "shadows"
  | "backgrounds"
  | "motion"
  | "custom_sections"
  | "advanced_layout";

export interface TemplateDefinition {
  schemaVersion: number;
  layout: Record<string, unknown>;
  sections: Array<Record<string, unknown>>;
  designTokens: Record<string, unknown>;
  responsive: Record<string, unknown>;
  capabilities: TemplateCapability[];
}

export interface TemplateVersion {
  id: string;
  templateId: string;
  version: string;
  status: TemplateVersionStatus;
  definition: TemplateDefinition;
  checksum: string | null;
  releaseNotes: string | null;
  publishedAt: string | null;
}

export type TemplateUpgradePolicy =
  | "manual"
  | "automatic_nonbreaking"
  | "blocked";

export interface CreatorTemplateBinding {
  templateId: string;
  templateVersionId: string;
  upgradePolicy: TemplateUpgradePolicy;
}
