import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Manage your Veyra creator workspace.",
};

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard");

  const { data: creator } = await supabase
    .from("creator_accounts")
    .select("id, handle, display_name, bio, status, website_url, whatsapp_number")
    .eq("owner_user_id", user.id)
    .maybeSingle();

  if (!creator) redirect("/onboarding");

  const [{ count: projectCount }, { count: publishedCount }, { data: site }] = await Promise.all([
    supabase.from("projects").select("id", { count: "exact", head: true }).eq("creator_id", creator.id),
    supabase.from("projects").select("id", { count: "exact", head: true }).eq("creator_id", creator.id).eq("published", true),
    supabase.from("creator_sites").select("visibility, template_id").eq("creator_id", creator.id).maybeSingle(),
  ]);

  const publicUrl = `/creator/${creator.handle}`;

  return (
    <main className="dashboard-shell">
      <aside className="dashboard-sidebar" aria-label="Creator dashboard navigation">
        <Link className="dashboard-brand" href="/">V<span>V</span> VEYRA</Link>
        <div className="dashboard-context"><span>CREATOR SPACE</span><strong>{creator.display_name}</strong><small>@{creator.handle}</small></div>
        <nav className="dashboard-nav">
          <Link className="active" href="/dashboard">Overview</Link>
          <Link href="/dashboard/projects">Projects</Link>
          <Link href="/dashboard/profile">Profile</Link>
          <Link href="/dashboard/appearance">Appearance</Link>
          <Link href="/dashboard/analytics">Analytics</Link>
          <Link href="/dashboard/settings">Settings</Link>
        </nav>
        <Link className="sidebar-public" href={publicUrl} target="_blank">View public profile ↗</Link>
      </aside>

      <section className="dashboard-main">
        <header className="dashboard-topbar">
          <div><p className="eyebrow">CREATOR DASHBOARD</p><h1>Good to have you back.</h1></div>
          <div className="dashboard-user"><span>{user.email}</span><Link href="/">Exit</Link></div>
        </header>

        <div className="welcome-panel">
          <div><span className="status-dot" /> <strong>{site?.visibility === "published" ? "Your portfolio is live" : "Your portfolio is still in setup"}</strong></div>
          <p>{site?.visibility === "published" ? "Keep publishing great work. Your public profile is ready to share." : "Add your projects and profile details, then publish your creator site when it is ready."}</p>
          <Link href={site?.visibility === "published" ? publicUrl : "/dashboard/profile"}>{site?.visibility === "published" ? "Open public profile ↗" : "Complete profile →"}</Link>
        </div>

        <section className="dashboard-stats" aria-label="Portfolio statistics">
          <article><span>PROJECTS</span><strong>{projectCount ?? 0}</strong><small>Total work in your library</small></article>
          <article><span>PUBLISHED</span><strong>{publishedCount ?? 0}</strong><small>Publicly visible projects</small></article>
          <article><span>TEMPLATE</span><strong>{site?.template_id ?? "minimal"}</strong><small>Current presentation system</small></article>
          <article><span>STATUS</span><strong>{creator.status}</strong><small>Creator account state</small></article>
        </section>

        <section className="dashboard-grid">
          <article className="dashboard-card dashboard-card-wide">
            <div className="card-heading"><div><p className="eyebrow">YOUR WORK</p><h2>Build the portfolio.</h2></div><Link href="/dashboard/projects">Manage projects ↗</Link></div>
            <p>Projects are the core of your Veyra presence. Add case studies, imagery, motion and the story behind the work.</p>
            <Link className="dashboard-action" href="/dashboard/projects/new">Create your first project <span>↗</span></Link>
          </article>
          <article className="dashboard-card">
            <p className="eyebrow">IDENTITY</p><h2>{creator.display_name}</h2><p>{creator.bio || "Add a short bio so visitors immediately understand what you create."}</p><Link href="/dashboard/profile">Edit profile →</Link>
          </article>
          <article className="dashboard-card">
            <p className="eyebrow">NEXT STEP</p><h2>Make it unmistakably yours.</h2><p>Choose a template and shape its visual system with your own colors, typography, spacing and motion.</p><Link href="/dashboard/appearance">Customize appearance →</Link>
          </article>
        </section>
      </section>
    </main>
  );
}
