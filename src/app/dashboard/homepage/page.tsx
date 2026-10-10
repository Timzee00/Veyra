import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import PageBlockEditor from "@/components/templates/PageBlockEditor";

export const metadata: Metadata = { title: "Edit homepage" };
export default async function HomepageStudio() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard/homepage");
  const { data: creator } = await supabase.from("creator_accounts")
    .select("id,handle,display_name").eq("owner_user_id",user.id).maybeSingle();
  if (!creator) redirect("/onboarding");
  const [{ data: site }, { data: pageDraft }] = await Promise.all([
    supabase.from("creator_sites").select("visibility").eq("creator_id",creator.id).maybeSingle(),
    supabase.from("creator_page_drafts").select("blocks, revision").eq("creator_id",creator.id).maybeSingle(),
  ]);
  return <main className="dashboard-shell">
    <aside className="dashboard-sidebar">
      <Link className="dashboard-brand" href="/">V<span>V</span> VEYRA</Link>
      <div className="dashboard-context"><span>YOUR WEBSITE</span><strong>{creator.display_name}</strong><small>@{creator.handle}</small></div>
      <nav className="dashboard-nav"><Link href="/dashboard">Overview</Link><Link className="active" href="/dashboard/homepage">Homepage</Link><Link href="/dashboard/pages">Website pages</Link><Link href="/dashboard/projects">Projects</Link><Link href="/dashboard/appearance">Appearance</Link><Link href="/dashboard/settings">Settings</Link></nav>
    </aside>
    <section className="dashboard-main narrow-main">
      <header className="dashboard-topbar"><div><p className="eyebrow">VEYRA STUDIO / HOME</p><h1>Edit your homepage.</h1></div><Link href="/dashboard/pages">Other pages →</Link></header>
      <p className="vpage-studio-note">Your homepage continues to use your chosen portfolio template. Build additional standalone pages in Website pages.</p>
      <PageBlockEditor creatorId={creator.id} initialBlocks={pageDraft?.blocks ?? []} initialRevision={pageDraft?.revision ?? 0} visible={site?.visibility==="published"} />
    </section>
  </main>;
}
