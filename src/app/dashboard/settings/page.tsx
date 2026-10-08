import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import SignOutButton from "@/components/auth/SignOutButton";
export const metadata: Metadata = { title: "Account settings" };
export default async function SettingsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard/settings");
  const { data: creator } = await supabase.from("creator_accounts").select("id, handle, display_name").eq("owner_user_id", user.id).maybeSingle();
  if (!creator) redirect("/onboarding");
  return <main className="dashboard-shell">
    <aside className="dashboard-sidebar" aria-label="Creator workspace">
      <Link className="dashboard-brand" href="/">V<span>V</span> VEYRA</Link>
      <div className="dashboard-context"><span>CREATOR SPACE</span><strong>{creator.display_name}</strong><small>@{creator.handle}</small></div>
      <nav className="dashboard-nav"><Link href="/dashboard">Overview</Link><Link href="/dashboard/projects">Projects</Link><Link href="/dashboard/profile">Profile</Link><Link href="/dashboard/appearance">Appearance</Link><Link href="/dashboard/analytics">Analytics</Link><Link className="active" href="/dashboard/settings">Settings</Link></nav>
    </aside>
    <section className="dashboard-main narrow-main">
      <header className="dashboard-topbar"><div><p className="eyebrow">YOUR VEYRA ACCOUNT</p><h1>Account & security.</h1></div><Link href="/dashboard">Back to dashboard</Link></header>
      <div className="dashboard-grid veyra-settings-grid">
        <section className="dashboard-card"><p className="eyebrow">SIGNED IN AS</p><h2>Your account</h2><p>{user.email}</p><p>Protect your account by keeping access to your verified email address.</p><SignOutButton /></section>
        <section className="dashboard-card"><p className="eyebrow">YOUR PUBLIC IDENTITY</p><h2>Creator profile</h2><p>Update your display name, creative field, location, description and public contact details.</p><Link href="/dashboard/profile">Edit my profile →</Link></section>
        <section className="dashboard-card"><p className="eyebrow">YOUR PORTFOLIO</p><h2>Website appearance</h2><p>Choose an available layout for your public portfolio.</p><Link href="/dashboard/appearance">Manage website →</Link></section>
        <section className="dashboard-card"><p className="eyebrow">PRIVACY</p><h2>Understand your choices</h2><p>Review the privacy and cookie policies. Account export and deletion controls are not yet available.</p><Link href="/privacy">Privacy information →</Link></section>
      </div>
      <p className="auth-powered">Powered by Timzee Corp</p>
    </section>
  </main>;
}
