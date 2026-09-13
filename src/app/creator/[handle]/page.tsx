import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }): Promise<Metadata> {
  const { handle } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: creator } = await supabase.from("creator_accounts").select("display_name, bio, handle").eq("handle", handle.toLowerCase()).maybeSingle();
  if (!creator) return { title: "Creator not found" };
  return { title: creator.display_name, description: creator.bio ?? `View ${creator.display_name}'s creative portfolio on Veyra.` };
}

export default async function CreatorPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: creator } = await supabase
    .from("creator_accounts")
    .select("id, handle, display_name, bio, website_url, whatsapp_number, default_inquiry_message")
    .eq("handle", handle.toLowerCase())
    .maybeSingle();
  if (!creator) notFound();

  const { data: site } = await supabase.from("creator_sites").select("title, seo_description, visibility").eq("creator_id", creator.id).maybeSingle();
  if (site?.visibility !== "published") notFound();

  const { data: projects } = await supabase
    .from("projects")
    .select("id, slug, title, summary, published_at")
    .eq("creator_id", creator.id)
    .eq("published", true)
    .order("published_at", { ascending: false });

  const projectIds = (projects ?? []).map((project) => project.id);
  const { data: media } = projectIds.length
    ? await supabase.from("project_media").select("project_id, storage_path, media_role, position").in("project_id", projectIds).order("position", { ascending: true })
    : { data: [] as Array<{ project_id: string; storage_path: string; media_role: string; position: number }> };

  const admin = createSupabaseAdminClient();
  const coverCandidates = (media ?? []).filter((item) => item.media_role === "cover");
  const { data: signed } = coverCandidates.length
    ? await admin.storage.from("project-media").createSignedUrls(coverCandidates.map((item) => item.storage_path), 3600)
    : { data: [] as Array<{ path: string; signedUrl: string }> };
  const signedByPath = new Map((signed ?? []).map((item) => [item.path, item.signedUrl]));
  const coverByProject = new Map(coverCandidates.map((item) => [item.project_id, signedByPath.get(item.storage_path)]));

  const whatsappHref = creator.whatsapp_number
    ? `https://wa.me/${creator.whatsapp_number.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(creator.default_inquiry_message ?? `Hi, I found ${creator.display_name}'s work on Veyra and would like to discuss a project.`)}`
    : null;

  return (
    <main className="public-creator-shell">
      <header className="public-creator-nav">
        <Link className="brand" href="/" aria-label="Veyra home"><span className="brand-mark">V</span><span>VEYRA</span></Link>
        <span className="public-handle">/{creator.handle}</span>
        <Link className="nav-cta" href="/signup">Create yours ↗</Link>
      </header>

      <section className="creator-hero"><p className="eyebrow">CREATIVE PORTFOLIO</p><h1>{creator.display_name}</h1><p>{creator.bio || "A creator building thoughtful work."}</p><div className="creator-contact">{creator.website_url && <a href={creator.website_url} target="_blank" rel="noreferrer">Website ↗</a>}{whatsappHref && <a href={whatsappHref} target="_blank" rel="noreferrer">Start a WhatsApp conversation ↗</a>}</div></section>

      <section className="creator-projects" aria-labelledby="creator-projects-title">
        <div className="public-section-heading"><div><p className="eyebrow">SELECTED WORK</p><h2 id="creator-projects-title">Projects.</h2></div><span>{projects?.length ?? 0} published</span></div>
        <div className="public-project-grid">
          {(projects ?? []).map((project) => {
            const coverUrl = coverByProject.get(project.id);
            return (
              <article key={project.id} className="public-project-card">
                {coverUrl && <Link href={`/creator/${creator.handle}/project/${project.slug}`} className="public-project-card-image" aria-label={`View ${project.title}`}><img src={coverUrl} alt="" /></Link>}
                <span>{new Date(project.published_at ?? Date.now()).getFullYear()}</span>
                <h3>{project.title}</h3><p>{project.summary || "A project presented on Veyra."}</p><Link href={`/creator/${creator.handle}/project/${project.slug}`}>View project ↗</Link>
              </article>
            );
          })}
        </div>
        {(!projects || projects.length === 0) && <div className="public-empty">This creator is preparing their first published project.</div>}
      </section>

      <footer className="public-creator-footer"><span>© {new Date().getFullYear()} {creator.display_name}</span><span>Powered by Veyra</span><span>Built with Veyra · Powered by Timzee Corp</span></footer>
    </main>
  );
}
