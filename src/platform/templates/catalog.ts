import type { TemplateDefinition, TemplateCapability } from "./types";
import { DEFAULT_DESIGN_TOKENS } from "@/platform/design/types";

export interface BuiltInTemplate {
  id: string;
  name: string;
  description: string;
  tier: "free" | "pro" | "studio";
  defaultVersion: string;
  capabilities: TemplateCapability[];
  definition: TemplateDefinition;
}

const commonCapabilities: TemplateCapability[] = [
  "colors",
  "typography",
  "gradients",
  "spacing",
  "radius",
  "shadows",
  "backgrounds",
  "motion",
];

export const BUILT_IN_TEMPLATES: BuiltInTemplate[] = [
  {
    id: "minimal",
    name: "Minimal",
    description: "Quiet typography, generous spacing and focused project presentation.",
    tier: "free",
    defaultVersion: "1.0.0",
    capabilities: commonCapabilities,
    definition: {
      schemaVersion: 1,
      layout: { variant: "single-column", maxWidth: 1180 },
      sections: [
        { type: "hero", variant: "minimal" },
        { type: "projects", variant: "grid" },
        { type: "about", variant: "split" },
        { type: "services", variant: "list" },
        { type: "contact", variant: "simple" },
      ],
      designTokens: DEFAULT_DESIGN_TOKENS,
      responsive: { mobileColumns: 1, tabletColumns: 2, desktopColumns: 3 },
      capabilities: commonCapabilities,
    },
  },
  {
    id: "cinema",
    name: "Cinema",
    description: "Large imagery, dramatic typography and cinematic transitions.",
    tier: "pro",
    defaultVersion: "1.0.0",
    capabilities: [...commonCapabilities, "custom_sections", "advanced_layout"],
    definition: {
      schemaVersion: 1,
      layout: { variant: "immersive", maxWidth: 1440, navigation: "overlay" },
      sections: [
        { type: "hero", variant: "visual" },
        { type: "featured_project", variant: "full-bleed" },
        { type: "projects", variant: "masonry" },
        { type: "about", variant: "cinematic" },
        { type: "contact", variant: "cta" },
      ],
      designTokens: { ...DEFAULT_DESIGN_TOKENS, motion: "cinematic", radius: 24 },
      responsive: { mobileColumns: 1, tabletColumns: 2, desktopColumns: 3 },
      capabilities: [...commonCapabilities, "custom_sections", "advanced_layout"],
    },
  },
];

export function getBuiltInTemplate(templateId: string): BuiltInTemplate | null {
  return BUILT_IN_TEMPLATES.find((template) => template.id === templateId) ?? null;
}
