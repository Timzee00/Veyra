import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { BUILT_IN_TEMPLATES } from "@/platform/templates/catalog";
import TemplatePicker from "@/components/templates/TemplatePicker";

export const metadata: Metadata = { title: "Appearance" };

export default async function AppearancePage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard/appearance");
  const { data: creator } = await supabase.from("creator_accounts").select("id, display_name").eq("owner_user_id", user.id).maybeSingle();
  if (!creator) redirect("/onboarding");
  const { data: site } = await supabase.from("creator_sites").select("template_id, visibility").eq("creator_id", creator.id).maybeSingle();
  if (!site) redirect("/dashboard/profile");

  return (
    <main className="dashboard-shell">
      <aside className="dashboard-sidebar"><Link className="dashboard-brand" href="/">V<span>V</span> VEYRA</Link><div className="dashboard-context"><span>CREATOR SPACE</span><strong>{creator.display_name}</strong></div><nav className="dashboard-nav"><Link href="/dashboard">Overview</Link><Link href="/dashboard/projects">Projects</Link><Link href="/dashboard/profile">Profile</Link><Link className="active" href="/dashboard/appearance">Appearance</Link><Link href="/dashboard/analytics">Analytics</Link><Link href="/dashboard/settings">Settings</Link></nav></aside>
      <section className="dashboard-main narrow-main"><header className="dashboard-topbar"><div><p className="eyebrow">PRESENTATION SYSTEM</p><h1>Choose your canvas.</h1></div><Link href={site.visibility === "published" ? `/creator/${creator.display_name}` : "/dashboard/profile"}>Back</Link></header><TemplatePicker creatorId={creator.id} currentTemplateId={site.template_id} templates={BUILT_IN_TEMPLATES.map(({ definition, ...template }) => ({ ...template }))} /></section>
    </main>
  );
}
