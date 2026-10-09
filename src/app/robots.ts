import type { MetadataRoute } from "next";
import { resolveSiteOrigin, shouldAvoidIndexing } from "@/platform/seo/site-config";

export default function robots(): MetadataRoute.Robots {
  if (shouldAvoidIndexing(process.env)) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }
  const origin = resolveSiteOrigin(process.env);
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/dashboard", "/admin", "/login", "/signup", "/onboarding", "/reset-password"] }],
    sitemap: `${origin}/sitemap.xml`,
  };
}
