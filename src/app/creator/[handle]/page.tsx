import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getBuiltInTemplate } from "@/platform/templates/catalog";
import PortfolioRenderer from "@/components/portfolio/PortfolioRenderer";

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }): Promise<Metadata> {
  const { handle } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: creator } = await supabase
    .from("creator_accounts")
    .select("display_name, bio, handle")
    .eq("handle", handle.toLowerCase())
    .maybeSingle();

  if (!creator) return { title: "Creator not found" };

  const title = creator.display_name;
  const description = creator.bio ?? `View ${creator.display_name}'s creative portfolio on Veyra.`;
  const path = `/creator/${encodeURIComponent(creator.handle)}/opengraph-image`;

  return {
    title,
    description,
    alternates: { canonical: `/creator/${encodeURIComponent(creator.handle)}` },
    openGraph: {
      type: "website",
      title,
      description,
      url: `/creator/${encodeURIComponent(creator.handle)}`,
      siteName: "Veyra",
      images: [{ url: path, width: 1200, height: 630, alt: `${title} — portfolio on Veyra` }],
    },
    twitter: { card: "summary_large_image", title, description, images: [path] },
  };
}

export default async function CreatorPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: creator } = await supabase
    .from("creator_accounts")
    .select("id, handle, display_name, bio, website_url, whatsapp_number, default_inquiry_message, avatar_path, category, location")
    .eq("handle", handle.toLowerCase())
    .maybeSingle();
  if (!creator) notFound();

  const { data: site } = await supabase
    .from("creator_sites")
    .select("title, seo_description, visibility, template_id, template_version_id")
    .eq("creator_id", creator.id)
    .maybeSingle();
  if (site?.visibility !== "published") notFound();

  const { data: projects } = await supabase
    .from("projects")
    .select("id, slug, title, summary, published_at")
    .eq("creator_id", creator.id)
    .eq("published", true)
    .order("published_at", { ascending: false });

  const template = getBuiltInTemplate(site.template_id);
  if (!template) notFound();

  const projectIds = (projects ?? []).map((project) => project.id);
  const { data: media } = projectIds.length
    ? await supabase.from("project_media").select("project_id, storage_path, media_role, position").in("project_id", projectIds).order("position", { ascending: true })
    : { data: [] as Array<{ project_id: string; storage_path: string; media_role: string; position: number }> };

  const coverCandidates = (media ?? []).filter((item) => item.media_role === "cover");
  const admin = createSupabaseAdminClient();
  const { data: signed } = coverCandidates.length
    ? await admin.storage.from("project-media").createSignedUrls(coverCandidates.map((item) => item.storage_path), 3600)
    : { data: [] as Array<{ path: string; signedUrl: string | null }> };
  const signedByPath = new Map((signed ?? []).map((item) => [item.path, item.signedUrl]));
  const coverByProject = new Map(coverCandidates.map((item) => [item.project_id, signedByPath.get(item.storage_path) ?? null]));

  const projectsWithCovers = (projects ?? []).map((project) => ({ ...project, coverUrl: coverByProject.get(project.id) ?? null }));

  return <PortfolioRenderer creator={creator} site={site} projects={projectsWithCovers} definition={template.definition} />;
}
