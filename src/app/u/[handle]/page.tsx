import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }): Promise<Metadata> {
  const { handle } = await params;
  return { title: `@${handle} | Veyra creator profile`, robots: { index: false, follow: true } };
}

export default async function CreatorProfile({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: creator } = await supabase.from("creator_accounts")
    .select("id, handle, display_name, bio, category, location, website_url, avatar_path")
    .eq("handle", handle.toLowerCase()).eq("status", "active").maybeSingle();
  if (!creator) notFound();
  const { data: site } = await supabase.from("creator_sites")
    .select("visibility").eq("creator_id", creator.id).maybeSingle();
  if (site?.visibility !== "published") notFound();
  const { data: projects } = await supabase.from("projects")
    .select("id, slug, title, summary").eq("creator_id", creator.id).eq("published", true)
    .order("published_at", { ascending: false }).limit(6);
  const initial = creator.display_name.slice(0,1).toUpperCase();
  const avatarUrl = creator.avatar_path && creator.avatar_path.startsWith(`${creator.id}/`)
    ? supabase.storage.from("veyra-images").getPublicUrl(creator.avatar_path).data.publicUrl : null;
  return <main className="public-profile-shell">
    <nav className="public-profile-nav"><Link href="/explore">← Back to Discover</Link><Link href="/">VEYRA</Link></nav>
    <section className="public-profile-hero">
      <div className="public-profile-avatar">{avatarUrl?<img src={avatarUrl} alt={`${creator.display_name} profile photo`} className="veyra-public-avatar"/>:<span aria-hidden="true">{initial}</span>}</div>
      <p className="eyebrow">{creator.category || "Independent creator"}{creator.location?` · ${creator.location}`:""}</p>
      <h1>{creator.display_name}</h1><p className="public-profile-handle">@{creator.handle}</p>
      <p className="public-profile-bio">{creator.bio || "Explore this creator's published work and website."}</p>
      <div className="public-profile-actions"><Link className="profile-primary" href={`/creator/${creator.handle}`}>Visit website ↗</Link><Link href={`/links/${creator.handle}`}>All my links ↗</Link>{creator.website_url && <a href={creator.website_url} target="_blank" rel="noopener noreferrer">External link ↗</a>}</div>
    </section>
    <section className="public-profile-projects"><div className="public-profile-section-title"><p className="eyebrow">SELECTED WORK</p><h2>Recent projects</h2></div>
      {projects?.length ? <div className="public-profile-project-grid">{projects.map(p=><Link key={p.id} href={`/creator/${creator.handle}/project/${p.slug}`}><span>PROJECT</span><h3>{p.title}</h3><p>{p.summary}</p><span>Explore project ↗</span></Link>)}</div> : <p className="public-profile-no-work">This creator has not published any projects yet. Visit their website to learn more.</p>}
    </section>
    <footer className="public-profile-footer"><Link href="/explore">Explore other creators</Link><span>Powered by Timzee Corp</span></footer>
  </main>;
}
