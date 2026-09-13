import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import ProfileEditor from "@/components/profile/ProfileEditor";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard/profile");
  const { data: creator } = await supabase.from("creator_accounts").select("id, handle, display_name, bio, website_url, whatsapp_number, default_inquiry_message").eq("owner_user_id", user.id).maybeSingle();
  if (!creator) redirect("/onboarding");
  const { data: site } = await supabase.from("creator_sites").select("visibility, title, seo_description").eq("creator_id", creator.id).maybeSingle();

  return (
    <main className="dashboard-shell">
      <aside className="dashboard-sidebar"><Link className="dashboard-brand" href="/">V<span>V</span> VEYRA</Link><div className="dashboard-context"><span>CREATOR SPACE</span><strong>{creator.display_name}</strong><small>@{creator.handle}</small></div><nav className="dashboard-nav"><Link href="/dashboard">Overview</Link><Link href="/dashboard/projects">Projects</Link><Link className="active" href="/dashboard/profile">Profile</Link><Link href="/dashboard/appearance">Appearance</Link><Link href="/dashboard/analytics">Analytics</Link><Link href="/dashboard/settings">Settings</Link></nav></aside>
      <section className="dashboard-main narrow-main"><header className="dashboard-topbar"><div><p className="eyebrow">CREATOR IDENTITY</p><h1>Make your profile yours.</h1></div><span className="profile-visibility">{site?.visibility === "published" ? "LIVE" : "DRAFT"}</span></header><ProfileEditor creator={creator} site={site} /></section>
    </main>
  );
}
