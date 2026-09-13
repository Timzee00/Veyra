import type { MetadataRoute } from "next";
import { blogPosts } from "@/content/blog";

const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://veyra.example.com").replace(/\/$/, "");

export default function sitemap(): MetadataRoute.Sitemap {
  const routes: MetadataRoute.Sitemap = [
    { url: baseUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/blog`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/terms`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/cookies`, changeFrequency: "yearly", priority: 0.2 },
  ];

  return routes.concat(
    blogPosts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      changeFrequency: "monthly" as const,
      priority: post.featured ? 0.8 : 0.6,
    })),
  );
}
