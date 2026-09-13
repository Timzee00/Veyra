import type { TemplateDefinition } from "./types";

export type RendererSection = {
  type: string;
  variant?: string;
  [key: string]: unknown;
};

export function normalizeTemplateDefinition(definition: TemplateDefinition): TemplateDefinition {
  return {
    ...definition,
    layout: definition.layout ?? { variant: "single-column", maxWidth: 1180 },
    sections: Array.isArray(definition.sections) ? definition.sections : [],
    designTokens: definition.designTokens ?? {},
    responsive: definition.responsive ?? {},
    capabilities: Array.isArray(definition.capabilities) ? definition.capabilities : [],
  };
}

export function getRendererSections(definition: TemplateDefinition): RendererSection[] {
  return normalizeTemplateDefinition(definition).sections.map((section) => section as RendererSection);
}
