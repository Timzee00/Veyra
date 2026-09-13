import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Veyra — Your work, unmistakably yours.",
    template: "%s — Veyra",
  },
  description:
    "Veyra is a premium portfolio platform for creators to publish, grow, and get discovered.",
  applicationName: "Veyra",
  generator: "Next.js",
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
