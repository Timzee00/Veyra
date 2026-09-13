import type { Metadata } from "next";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const sections = {
  appearance: { label: "APPEARANCE", title: "Shape the visual system.", text: "Template selection, color palettes, typography, spacing, backgrounds and motion controls are next in the Veyra editor." },
  analytics: { label: "ANALYTICS", title: "Understand your audience.", text: "Views, project performance, shares, WhatsApp actions, traffic sources and future engagement rollups will live here." },
  settings: { label: "SETTINGS", title: "Control your account.", text: "Security, sessions, privacy, data export, deletion, connected apps and account preferences will live here." },
} as const;

export async function generateMetadata({ params }: { params: Promise<{ section: string }> }): Promise<Metadata> {
  const { section } = await params;
  const item = sections[section as keyof typeof sections];
  return { title: item?.title ?? "Dashboard" };
}

export default async function DashboardSection({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  const item = sections[section as keyof typeof sections];
  if (!item) notFound();
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/dashboard/${section}`);
  const { data: creator } = await supabase.from("creator_accounts").select("display_name, handle").eq("owner_user_id", user.id).maybeSingle();
  if (!creator) redirect("/onboarding");

  return <main className="dashboard-shell"><aside className="dashboard-sidebar"><Link className="dashboard-brand" href="/">V<span>V</span> VEYRA</Link><div className="dashboard-context"><span>CREATOR SPACE</span><strong>{creator.display_name}</strong><small>@{creator.handle}</small></div><nav className="dashboard-nav"><Link href="/dashboard">Overview</Link><Link href="/dashboard/projects">Projects</Link><Link href="/dashboard/profile">Profile</Link><Link className={section === "appearance" ? "active" : ""} href="/dashboard/appearance">Appearance</Link><Link className={section === "analytics" ? "active" : ""} href="/dashboard/analytics">Analytics</Link><Link className={section === "settings" ? "active" : ""} href="/dashboard/settings">Settings</Link></nav></aside><section className="dashboard-main narrow-main"><header className="dashboard-topbar"><div><p className="eyebrow">{item.label}</p><h1>{item.title}</h1></div><Link href="/dashboard">Back to overview</Link></header><div className="dashboard-card" style={{marginTop:32,minHeight:280}}><p className="eyebrow">FOUNDATION READY</p><h2>We&apos;re building this layer next.</h2><p>{item.text}</p><p>The route is intentionally present now so the creator workspace has a stable information architecture while each subsystem is implemented behind the same permission and entitlement model.</p></div></section></main>;
}
