import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { BUILT_IN_TEMPLATES } from "@/platform/templates/catalog";
import TemplatePicker from "@/components/templates/TemplatePicker";
import VisualSiteEditor from "@/components/templates/VisualSiteEditor";

export const metadata: Metadata = { title: "Appearance" };

export default async function AppearancePage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard/appearance");
  const { data: creator } = await supabase.from("creator_accounts").select("id, handle, display_name").eq("owner_user_id", user.id).maybeSingle();
  if (!creator) redirect("/onboarding");
  const { data: site } = await supabase.from("creator_sites").select("template_id, visibility, design_published").eq("creator_id", creator.id).maybeSingle();
  if (!site) redirect("/dashboard/profile");
  const { data: privateDraft } = await supabase.from("creator_site_design_drafts").select("design, revision").eq("creator_id", creator.id).maybeSingle();

  return (
    <main className="dashboard-shell">
      <aside className="dashboard-sidebar"><Link className="dashboard-brand" href="/">V<span>V</span> VEYRA</Link><div className="dashboard-context"><span>CREATOR SPACE</span><strong>{creator.display_name}</strong></div><nav className="dashboard-nav"><Link href="/dashboard">Overview</Link><Link href="/dashboard/homepage">Homepage</Link><Link href="/dashboard/pages">Website pages</Link><Link href="/dashboard/projects">Projects</Link><Link href="/dashboard/profile">Profile</Link><Link className="active" href="/dashboard/appearance">Appearance</Link><Link href="/dashboard/analytics">Analytics</Link><Link href="/dashboard/settings">Settings</Link></nav></aside>
      <section className="dashboard-main narrow-main"><header className="dashboard-topbar"><div><p className="eyebrow">PRESENTATION SYSTEM</p><h1>Choose your canvas.</h1></div><Link href={site.visibility === "published" ? `/creator/${creator.handle}` : "/dashboard"}>Back</Link></header><TemplatePicker creatorId={creator.id} currentTemplateId={site.template_id} templates={BUILT_IN_TEMPLATES.map(({ definition, ...template }) => ({ ...template }))} /><VisualSiteEditor creatorId={creator.id} creatorName={creator.display_name} initialDraft={privateDraft?.design ?? site.design_published} initialPublished={site.design_published} initialRevision={privateDraft?.revision ?? 0} visible={site.visibility === "published"} /><div className="vpage-appearance-path"><h2>Ready to build pages?</h2><p>Appearance controls your website-wide visual style. Use the dedicated editors to change real homepage content or add standalone pages.</p><div><Link href="/dashboard/homepage">Edit homepage content →</Link><Link href="/dashboard/pages">Open page studio →</Link></div></div></section>
    </main>
  );
}
