export type AIPluginCapability =
  | "template_generation"
  | "template_revision"
  | "content_generation"
  | "content_revision"
  | "seo_assistance"
  | "image_assistance"
  | "analytics_assistance";

export type AIPluginStatus = "draft" | "active" | "paused" | "retired";

export interface AIPluginManifest {
  id: string;
  name: string;
  version: string;
  provider: string;
  status: AIPluginStatus;
  capabilities: AIPluginCapability[];
  endpoint?: string;
  configurationSchema?: Record<string, unknown>;
  requiredEntitlements: string[];
  privacyRequirements: string[];
}

export interface AIPluginRequest {
  pluginId: string;
  capability: AIPluginCapability;
  creatorId?: string;
  input: Record<string, unknown>;
  context?: Record<string, unknown>;
}

export interface AIPluginResult {
  pluginId: string;
  capability: AIPluginCapability;
  output: Record<string, unknown>;
  usage?: {
    inputUnits?: number;
    outputUnits?: number;
    model?: string;
  };
  metadata?: Record<string, unknown>;
}

/**
 * Plugins are adapters. They may provide AI capabilities later without
 * becoming part of Veyra's core business-domain implementation.
 */
export interface VeyraAIPlugin {
  manifest: AIPluginManifest;
  execute(request: AIPluginRequest): Promise<AIPluginResult>;
}
