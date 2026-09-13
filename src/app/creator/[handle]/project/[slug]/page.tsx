import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function generateMetadata({ params }: { params: Promise<{ handle: string; slug: string }> }): Promise<Metadata> {
  const { handle, slug } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: creator } = await supabase.from("creator_accounts").select("id, display_name").eq("handle", handle.toLowerCase()).maybeSingle();
  if (!creator) return { title: "Project not found" };
  const { data: project } = await supabase.from("projects").select("title, summary").eq("creator_id", creator.id).eq("slug", slug).eq("published", true).maybeSingle();
  if (!project) return { title: "Project not found" };
  return { title: project.title, description: project.summary ?? `A project by ${creator.display_name}.` };
}

export default async function PublicProjectPage({ params }: { params: Promise<{ handle: string; slug: string }> }) {
  const { handle, slug } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: creator } = await supabase
    .from("creator_accounts")
    .select("id, handle, display_name, bio, whatsapp_number, default_inquiry_message")
    .eq("handle", handle.toLowerCase())
    .maybeSingle();
  if (!creator) notFound();

  const { data: project } = await supabase
    .from("projects")
    .select("id, slug, title, summary, body, published_at")
    .eq("creator_id", creator.id)
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  if (!project) notFound();

  const { data: media } = await supabase
    .from("project_media")
    .select("id, storage_path, media_type, alt_text, caption, media_role, position")
    .eq("project_id", project.id)
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });

  const admin = createSupabaseAdminClient();
  const paths = (media ?? []).map((item) => item.storage_path);
  const { data: signed } = paths.length
    ? await admin.storage.from("project-media").createSignedUrls(paths, 3600)
    : { data: [] as Array<{ path: string; signedUrl: string }> };
  const signedByPath = new Map((signed ?? []).map((item) => [item.path, item.signedUrl]));

  const whatsapp = creator.whatsapp_number
    ? `https://wa.me/${creator.whatsapp_number.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Hi, I saw your "${project.title}" project on Veyra and would like to discuss a similar project.`)}`
    : null;

  return (
    <main className="public-project-shell">
      <header className="public-creator-nav">
        <Link className="brand" href="/"><span className="brand-mark">V</span><span>VEYRA</span></Link>
        <Link href={`/creator/${creator.handle}`}>@{creator.handle}</Link>
        <span />
      </header>

      <article className="public-project-article">
        <p className="eyebrow">PROJECT / {new Date(project.published_at ?? Date.now()).getFullYear()}</p>
        <h1>{project.title}</h1>
        <p className="public-project-summary">{project.summary}</p>

        {(media ?? []).length > 0 && (
          <section className="public-media-grid" aria-label="Project media">
            {(media ?? []).map((item) => {
              const url = signedByPath.get(item.storage_path);
              if (!url) return null;
              return (
                <figure className={`public-media public-media-${item.media_role}`} key={item.id}>
                  {item.media_type === "video"
                    ? <video src={url} controls preload="metadata" aria-label={item.alt_text ?? "Project video"} />
                    : <img src={url} alt={item.alt_text ?? "Project work"} />}
                  {item.caption && <figcaption>{item.caption}</figcaption>}
                </figure>
              );
            })}
          </section>
        )}

        <div className="public-project-body">
          {project.body
            ? project.body.split(/\n{2,}/).map((paragraph) => <p key={paragraph}>{paragraph}</p>)
            : <p>This creator has not added the full project story yet.</p>}
        </div>

        {whatsapp && <a className="button button-primary" href={whatsapp} target="_blank" rel="noreferrer">Discuss a project on WhatsApp ↗</a>}
      </article>

      <footer className="public-creator-footer">
        <span>© {new Date().getFullYear()} {creator.display_name}</span>
        <span>Project hosted on Veyra</span>
        <span>Powered by Timzee Corp</span>
      </footer>
    </main>
  );
}
