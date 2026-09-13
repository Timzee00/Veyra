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

const commonCapabilities: TemplateCapability[] = ["colors", "typography", "gradients", "spacing", "radius", "shadows", "backgrounds", "motion"];
const advancedCapabilities: TemplateCapability[] = [...commonCapabilities, "custom_sections", "advanced_layout"];

export const BUILT_IN_TEMPLATES: BuiltInTemplate[] = [
  {
    id: "minimal", name: "Minimal", description: "Quiet typography, generous spacing and focused project presentation.", tier: "free", defaultVersion: "1.0.0", capabilities: commonCapabilities,
    definition: { schemaVersion: 1, layout: { variant: "single-column", maxWidth: 1180 }, sections: [{ type: "hero", variant: "minimal" }, { type: "projects", variant: "grid" }, { type: "about", variant: "split" }, { type: "services", variant: "list" }, { type: "contact", variant: "simple" }], designTokens: DEFAULT_DESIGN_TOKENS, responsive: { mobileColumns: 1, tabletColumns: 2, desktopColumns: 3 }, capabilities: commonCapabilities },
  },
  {
    id: "editorial", name: "Editorial", description: "A magazine-inspired composition for art direction and visual storytelling.", tier: "free", defaultVersion: "1.0.0", capabilities: commonCapabilities,
    definition: { schemaVersion: 1, layout: { variant: "editorial", maxWidth: 1100 }, sections: [{ type: "hero", variant: "editorial" }, { type: "projects", variant: "editorial" }, { type: "about", variant: "split" }, { type: "contact", variant: "simple" }], designTokens: { ...DEFAULT_DESIGN_TOKENS, radius: 8, backgroundMode: "solid" }, responsive: { mobileColumns: 1, tabletColumns: 2, desktopColumns: 2 }, capabilities: commonCapabilities },
  },
  {
    id: "cinema", name: "Cinema", description: "Large imagery, dramatic typography and cinematic presentation.", tier: "pro", defaultVersion: "1.0.0", capabilities: advancedCapabilities,
    definition: { schemaVersion: 1, layout: { variant: "immersive", maxWidth: 1440, navigation: "overlay" }, sections: [{ type: "hero", variant: "visual" }, { type: "featured_project", variant: "full-bleed" }, { type: "projects", variant: "masonry" }, { type: "about", variant: "cinematic" }, { type: "contact", variant: "cta" }], designTokens: { ...DEFAULT_DESIGN_TOKENS, motion: "cinematic", radius: 24 }, responsive: { mobileColumns: 1, tabletColumns: 2, desktopColumns: 3 }, capabilities: advancedCapabilities },
  },
  {
    id: "immersive", name: "Immersive", description: "A spacious, art-forward experience built around a strong visual opening.", tier: "pro", defaultVersion: "1.0.0", capabilities: advancedCapabilities,
    definition: { schemaVersion: 1, layout: { variant: "immersive", maxWidth: 1280 }, sections: [{ type: "hero", variant: "immersive" }, { type: "featured_project", variant: "full-bleed" }, { type: "projects", variant: "grid" }, { type: "about", variant: "cinematic" }, { type: "contact", variant: "cta" }], designTokens: { ...DEFAULT_DESIGN_TOKENS, motion: "smooth", radius: 28, backgroundMode: "gradient" }, responsive: { mobileColumns: 1, tabletColumns: 2, desktopColumns: 3 }, capabilities: advancedCapabilities },
  },
  {
    id: "studio", name: "Studio", description: "Structured, high-density presentation for prolific creative studios.", tier: "studio", defaultVersion: "1.0.0", capabilities: advancedCapabilities,
    definition: { schemaVersion: 1, layout: { variant: "studio-grid", maxWidth: 1380 }, sections: [{ type: "hero", variant: "studio" }, { type: "projects", variant: "grid" }, { type: "services", variant: "list" }, { type: "about", variant: "split" }, { type: "contact", variant: "simple" }], designTokens: { ...DEFAULT_DESIGN_TOKENS, radius: 10, motion: "subtle" }, responsive: { mobileColumns: 1, tabletColumns: 2, desktopColumns: 4 }, capabilities: advancedCapabilities },
  },
  {
    id: "agency", name: "Agency", description: "Bold case-study presentation designed for teams and client-facing work.", tier: "studio", defaultVersion: "1.0.0", capabilities: advancedCapabilities,
    definition: { schemaVersion: 1, layout: { variant: "agency", maxWidth: 1320 }, sections: [{ type: "hero", variant: "agency" }, { type: "projects", variant: "case-studies" }, { type: "services", variant: "list" }, { type: "contact", variant: "cta" }], designTokens: { ...DEFAULT_DESIGN_TOKENS, radius: 14, motion: "smooth" }, responsive: { mobileColumns: 1, tabletColumns: 2, desktopColumns: 2 }, capabilities: advancedCapabilities },
  },
];

export function getBuiltInTemplate(templateId: string): BuiltInTemplate | null {
  return BUILT_IN_TEMPLATES.find((template) => template.id === templateId) ?? null;
}
