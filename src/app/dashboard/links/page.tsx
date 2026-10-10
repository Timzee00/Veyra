import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import CreatorLinksEditor from "@/components/links/CreatorLinksEditor";
import "../creator-tools.css";

export const metadata: Metadata={title:"My links | Veyra Studio",description:"Manage a personal link hub for your Veyra website."};

export default async function CreatorLinksDashboard(){
 const db=await createSupabaseServerClient();
 const {data:{user}}=await db.auth.getUser();
 if(!user)redirect("/login?next=/dashboard/links");
 const {data:creator}=await db.from("creator_accounts")
  .select("id,handle,display_name").eq("owner_user_id",user.id).maybeSingle();
 if(!creator)redirect("/onboarding");
 const [{data:links,error},{data:site}]=await Promise.all([
  db.from("creator_links").select("id,creator_id,label,url,position,is_visible")
   .eq("creator_id",creator.id).order("position",{ascending:true}).order("created_at",{ascending:true}).limit(24),
  db.from("creator_sites").select("visibility").eq("creator_id",creator.id).maybeSingle(),
 ]);
 return <main className="dashboard-shell">
  <aside className="dashboard-sidebar"><Link className="dashboard-brand" href="/">V<span>V</span> VEYRA</Link>
   <div className="dashboard-context"><span>CREATOR TOOLS</span><strong>{creator.display_name}</strong></div>
   <nav className="dashboard-nav" aria-label="Creator navigation">
    <Link href="/dashboard">Overview</Link><Link href="/dashboard/homepage">Homepage</Link><Link href="/dashboard/pages">Pages</Link>
    <Link href="/dashboard/assets">Images</Link><Link className="active" href="/dashboard/links">My links</Link>
    <Link href="/dashboard/profile">Profile</Link><Link href="/dashboard/appearance">Appearance</Link>
   </nav></aside>
  <section className="dashboard-main narrow-main">
   {error?<p role="alert" className="form-error">Links could not be loaded. Check that Veyra's link-hub database migration was installed.</p>
    :<CreatorLinksEditor creatorId={creator.id} handle={creator.handle} initialLinks={links??[]} published={site?.visibility==="published"}/>}
  </section>
 </main>;
}
