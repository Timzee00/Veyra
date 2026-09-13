export type DesignCapability =
  | "colors"
  | "typography"
  | "gradients"
  | "spacing"
  | "radius"
  | "shadows"
  | "backgrounds"
  | "motion"
  | "buttons"
  | "cards"
  | "advanced_layout";

export interface ColorTokens {
  background: string;
  surface: string;
  text: string;
  muted: string;
  accent: string;
  accentStrong: string;
  border: string;
}

export interface TypographyTokens {
  headingFamily: string;
  bodyFamily: string;
  headingWeight: number;
  bodyWeight: number;
  scale: "compact" | "balanced" | "expressive";
  letterSpacing: "tight" | "normal" | "wide";
}

export interface GradientPreset {
  id: string;
  name: string;
  css: string;
}

export interface DesignTokens {
  colors: ColorTokens;
  typography: TypographyTokens;
  gradient?: GradientPreset;
  radius: number;
  shadow: "none" | "soft" | "deep" | "glow";
  backgroundMode: "solid" | "gradient" | "mesh" | "noise";
  motion: "none" | "subtle" | "smooth" | "cinematic";
}

export interface CreatorDesignSettings {
  schemaVersion: 1;
  tokens: DesignTokens;
  capabilities: DesignCapability[];
}

export const DEFAULT_DESIGN_TOKENS: DesignTokens = {
  colors: {
    background: "#07070a",
    surface: "#101015",
    text: "#f6f4ef",
    muted: "#a29fab",
    accent: "#bca8ff",
    accentStrong: "#7b5cff",
    border: "rgba(255,255,255,0.12)",
  },
  typography: {
    headingFamily: "Manrope",
    bodyFamily: "Manrope",
    headingWeight: 700,
    bodyWeight: 400,
    scale: "balanced",
    letterSpacing: "tight",
  },
  radius: 18,
  shadow: "soft",
  backgroundMode: "solid",
  motion: "subtle",
};

export const GRADIENT_PRESETS: GradientPreset[] = [
  { id: "violet-dawn", name: "Violet Dawn", css: "linear-gradient(135deg, #7b5cff, #ec4899)" },
  { id: "aurora-night", name: "Aurora Night", css: "radial-gradient(circle at 25% 20%, #7c3aed, transparent 45%), radial-gradient(circle at 75% 80%, #06b6d4, transparent 50%), #07070a" },
  { id: "editorial-cream", name: "Editorial Cream", css: "linear-gradient(135deg, #f4ead8, #bca8ff)" },
];
