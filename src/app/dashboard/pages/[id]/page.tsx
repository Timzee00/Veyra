import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import SitePageStudio from "@/components/builder/SitePageStudio";
export const metadata: Metadata = { title: "Edit website page" };

export default async function EditWebsitePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard/pages");
  const { data: creator } = await supabase.from("creator_accounts")
    .select("id,handle,display_name").eq("owner_user_id",user.id).maybeSingle();
  if (!creator) redirect("/onboarding");
  const [{ data: page }, { data: site }] = await Promise.all([
    supabase.from("site_pages").select("id,creator_id,title,slug,seo_description,draft_blocks,revision").eq("creator_id",creator.id).eq("id",id).maybeSingle(),
    supabase.from("creator_sites").select("visibility").eq("creator_id",creator.id).maybeSingle(),
  ]);
  if (!page) notFound();
  const { data: livePage } = await supabase.from("site_page_publications")
    .select("slug").eq("page_id",page.id).maybeSingle();
  return <main className="vstudio-page-shell">
    <nav className="vstudio-site-nav"><Link href="/dashboard/pages">← Your pages</Link><Link className="vstudio-site-brand" href="/dashboard">VEYRA STUDIO</Link><span>Powered by Timzee Corp</span></nav>
    <SitePageStudio page={page} creatorHandle={creator.handle} siteLive={site?.visibility==="published"} publishedSlug={livePage?.slug ?? null}/>
  </main>;
}
