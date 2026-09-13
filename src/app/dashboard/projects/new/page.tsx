import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import NewProjectForm from "@/components/projects/NewProjectForm";

export const metadata: Metadata = { title: "New project" };

export default async function NewProjectPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard/projects/new");
  const { data: creator } = await supabase.from("creator_accounts").select("id, display_name").eq("owner_user_id", user.id).maybeSingle();
  if (!creator) redirect("/onboarding");

  return (
    <main className="dashboard-shell">
      <aside className="dashboard-sidebar"><Link className="dashboard-brand" href="/">V<span>V</span> VEYRA</Link><div className="dashboard-context"><span>NEW PROJECT</span><strong>{creator.display_name}</strong></div><nav className="dashboard-nav"><Link href="/dashboard">Overview</Link><Link className="active" href="/dashboard/projects">Projects</Link><Link href="/dashboard/profile">Profile</Link><Link href="/dashboard/appearance">Appearance</Link><Link href="/dashboard/analytics">Analytics</Link><Link href="/dashboard/settings">Settings</Link></nav></aside>
      <section className="dashboard-main narrow-main">
        <header className="dashboard-topbar"><div><p className="eyebrow">PROJECT BUILDER</p><h1>Create a project.</h1></div><Link href="/dashboard/projects">Cancel</Link></header>
        <NewProjectForm creatorId={creator.id} />
      </section>
    </main>
  );
}
