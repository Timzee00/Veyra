import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import NewSitePage from "@/components/builder/NewSitePage";
import DuplicateSitePage from "@/components/builder/DuplicateSitePage";
import DownloadPageBackup from "@/components/builder/DownloadPageBackup";

export const metadata: Metadata = { title: "Website pages" };

export default async function WebsitePages() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard/pages");
  const { data: creator } = await supabase.from("creator_accounts")
    .select("id,handle,display_name").eq("owner_user_id",user.id).maybeSingle();
  if (!creator) redirect("/onboarding");
  const [{ data: pages, error }, { data: publications }, { data: site }] = await Promise.all([
    supabase.from("site_pages").select("id,title,slug,revision,updated_at").eq("creator_id",creator.id).order("updated_at",{ascending:false}).limit(25),
    supabase.from("site_page_publications").select("page_id,slug,published_at").eq("creator_id",creator.id).limit(25),
    supabase.from("creator_sites").select("visibility").eq("creator_id",creator.id).maybeSingle(),
  ]);
  const liveByPage = new Map((publications??[]).map(p=>[p.page_id,p]));
  return <main className="dashboard-shell">
    <aside className="dashboard-sidebar">
      <Link className="dashboard-brand" href="/">V<span>V</span> VEYRA</Link>
      <div className="dashboard-context"><span>YOUR WEBSITE</span><strong>{creator.display_name}</strong><small>@{creator.handle}</small></div>
      <nav className="dashboard-nav"><Link href="/dashboard">Overview</Link><Link className="active" href="/dashboard/pages">Pages</Link><Link href="/dashboard/projects">Projects</Link><Link href="/dashboard/assets">Images</Link><Link href="/dashboard/links">My links</Link><Link href="/dashboard/profile">Profile</Link><Link href="/dashboard/appearance">Appearance</Link><Link href="/dashboard/settings">Settings</Link></nav>
      <Link className="sidebar-public" href="/explore">Discover Veyra →</Link>
    </aside>
    <section className="dashboard-main narrow-main">
      <header className="dashboard-topbar"><div><p className="eyebrow">VEYRA STUDIO / SITE STRUCTURE</p><h1>Build your pages.</h1></div><Link href="/dashboard/appearance">Edit global styles →</Link></header>
      <div className="vpage-studio-intro"><h2>A page for every part of your story.</h2><p>Build an About page, services page, pricing guide or a dedicated FAQ. Your edits stay private until you approve a published version. Your original portfolio homepage stays intact.</p></div>
      <NewSitePage creatorId={creator.id} pageCount={pages?.length ?? 0}/>
      <div className="vpage-list-heading"><h2>Site pages</h2><span>{pages?.length??0} of 20</span></div>
      {error && <p className="form-error" role="alert">Pages are unavailable until the new database migration is installed and verified.</p>}
      {!error && !pages?.length && <div className="vpage-empty"><h3>Start with a page about your work.</h3><p>Give visitors a useful next step beyond your homepage.</p></div>}
      <div className="vpage-page-list">{(pages??[]).map(page=>{
        const published=liveByPage.get(page.id);
        return <article key={page.id} className="vpage-page-card">
          <div><p className="eyebrow">{published?"PUBLISHED SNAPSHOT":"PRIVATE DRAFT"}</p><h3>{page.title}</h3><p>/pages/{published?.slug??page.slug}</p></div>
          <div className="vpage-page-actions"><Link href={`/dashboard/pages/${page.id}`}>Edit page →</Link><DuplicateSitePage creatorId={creator.id} pageId={page.id} pageCount={pages?.length??0} />
            {published && site?.visibility === "published" && <Link href={`/creator/${creator.handle}/pages/${published.slug}`} target="_blank">Open live ↗</Link>}
          </div>
        </article>;
      })}</div>
      <DownloadPageBackup creatorId={creator.id} creatorHandle={creator.handle} disabled={!!error} />
      <p className="vpage-studio-note">Custom domains are a separate paid feature and are not enabled yet. Your free Veyra website address remains available.</p>
    </section>
  </main>;
}
