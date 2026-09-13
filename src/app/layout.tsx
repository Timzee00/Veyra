import type { Metadata } from "next";
import "./globals.css";
import "./home.css";
import "./auth.css";
import "./dashboard.css";
import "./dashboard-media.css";
import "./template-picker.css";
import "./public-creator.css";
import "./public-project.css";
import "./public-project-media.css";
import "./public-creator-media.css";
import "./portfolio-renderer.css";
import { ConsentBanner } from "@/components/privacy/ConsentBanner";

export const metadata: Metadata = {
  title: {
    default: "Veyra — Your work, unmistakably yours.",
    template: "%s — Veyra",
  },
  description: "Veyra is a premium portfolio platform for creators to publish, grow, and get discovered.",
  applicationName: "Veyra",
  generator: "Next.js",
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}<ConsentBanner /></body></html>;
}
