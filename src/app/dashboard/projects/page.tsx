import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Projects" };

export default async function ProjectsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard/projects");

  const { data: creator } = await supabase.from("creator_accounts").select("id, handle, display_name").eq("owner_user_id", user.id).maybeSingle();
  if (!creator) redirect("/onboarding");

  const { data: projects } = await supabase.from("projects").select("id, slug, title, summary, published, published_at, updated_at").eq("creator_id", creator.id).order("updated_at", { ascending: false });

  return (
    <main className="dashboard-shell">
      <aside className="dashboard-sidebar"><Link className="dashboard-brand" href="/">V<span>V</span> VEYRA</Link><div className="dashboard-context"><span>CREATOR SPACE</span><strong>{creator.display_name}</strong><small>@{creator.handle}</small></div><nav className="dashboard-nav"><Link href="/dashboard">Overview</Link><Link className="active" href="/dashboard/projects">Projects</Link><Link href="/dashboard/profile">Profile</Link><Link href="/dashboard/appearance">Appearance</Link><Link href="/dashboard/analytics">Analytics</Link><Link href="/dashboard/settings">Settings</Link></nav><Link className="sidebar-public" href={`/creator/${creator.handle}`} target="_blank">View public profile ↗</Link></aside>
      <section className="dashboard-main">
        <header className="dashboard-topbar"><div><p className="eyebrow">PORTFOLIO / PROJECTS</p><h1>Your work library.</h1></div><Link className="dashboard-primary" href="/dashboard/projects/new">New project ↗</Link></header>
        <div className="project-toolbar"><span>{projects?.length ?? 0} projects</span><span>Drafts and published work</span></div>
        <div className="project-list">
          {(projects ?? []).map((project) => (
            <article className="project-row" key={project.id}>
              <div><span className="project-status">{project.published ? "Published" : "Draft"}</span><h2>{project.title}</h2><p>{project.summary || "No summary yet."}</p></div>
              <div><small>Updated {new Date(project.updated_at).toLocaleDateString("en-NG")}</small><Link href={`/dashboard/projects/${project.id}`}>Open project →</Link></div>
            </article>
          ))}
          {(!projects || projects.length === 0) && <div className="empty-project"><span>01</span><h2>Your first project starts here.</h2><p>Add a case study, identity project, poster, motion piece, gallery or any other work you want people to remember.</p><Link className="dashboard-action" href="/dashboard/projects/new">Create project <span>↗</span></Link></div>}
        </div>
      </section>
    </main>
  );
}
