import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import ProjectEditor from "@/components/projects/ProjectEditor";

export const metadata: Metadata = { title: "Edit project" };

export default async function ProjectEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/dashboard/projects/${id}`);
  const { data: creator } = await supabase.from("creator_accounts").select("id, handle, display_name").eq("owner_user_id", user.id).maybeSingle();
  if (!creator) redirect("/onboarding");
  const { data: project } = await supabase.from("projects").select("id, slug, title, summary, body, published, published_at").eq("id", id).eq("creator_id", creator.id).maybeSingle();
  if (!project) notFound();

  return <main className="dashboard-shell"><aside className="dashboard-sidebar"><Link className="dashboard-brand" href="/">V<span>V</span> VEYRA</Link><div className="dashboard-context"><span>PROJECT EDITOR</span><strong>{creator.display_name}</strong></div><nav className="dashboard-nav"><Link href="/dashboard">Overview</Link><Link className="active" href="/dashboard/projects">Projects</Link><Link href="/dashboard/profile">Profile</Link><Link href="/dashboard/appearance">Appearance</Link><Link href="/dashboard/analytics">Analytics</Link><Link href="/dashboard/settings">Settings</Link></nav></aside><section className="dashboard-main narrow-main"><header className="dashboard-topbar"><div><p className="eyebrow">PROJECT / EDIT</p><h1>{project.title}</h1></div><Link href="/dashboard/projects">Back to projects</Link></header><ProjectEditor project={project} /><div className="editor-public-link">{project.published ? <Link href={`/creator/${creator.handle}/project/${project.slug}`} target="_blank">Open public project ↗</Link> : <span>Draft — not public yet</span>}</div></section></main>;
}
