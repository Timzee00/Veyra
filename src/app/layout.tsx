import type { Metadata } from "next";
import { VEYRA } from "@/platform/brand/identity";
import { resolveSiteOrigin, shouldAvoidIndexing } from "@/platform/seo/site-config";
import "./globals.css";
import "./home.css";
import "./discovery.css";
import "./creator-landing.css";
import "./explore.css";
import "./auth.css";
import "./dashboard.css";
import "./dashboard-media.css";
import "./template-picker.css";
import "./page-studio.css";
import "./public-creator.css";
import "./public-project.css";
import "./public-project-media.css";
import "./public-creator-media.css";
import "./portfolio-renderer.css";
import { ConsentBanner } from "@/components/privacy/ConsentBanner";

export const metadata: Metadata = {
  metadataBase: new URL(resolveSiteOrigin(process.env)),
  title: { default: `${VEYRA.name} — ${VEYRA.tagline}`, template: `%s — ${VEYRA.name}` },
  description: VEYRA.summary,
  applicationName: VEYRA.name,
  openGraph: {
    title: `${VEYRA.name} — ${VEYRA.tagline}`,
    description: VEYRA.summary,
    siteName: VEYRA.name,
    type: "website",
    locale: "en_US",
  },
  twitter: { card: "summary", title: `${VEYRA.name} — ${VEYRA.tagline}`, description: VEYRA.summary },
  robots: shouldAvoidIndexing(process.env)
    ? { index: false, follow: false }
    : { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}<ConsentBanner /></body></html>;
}
