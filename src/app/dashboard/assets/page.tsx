import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import CreatorImageLibrary from "@/components/assets/CreatorImageLibrary";
import "../creator-tools.css";

export const metadata: Metadata = { title: "Image library | Veyra Studio" };
export default async function AssetsDashboard() {
 const db=await createSupabaseServerClient();
 const {data:{user}}=await db.auth.getUser();
 if(!user)redirect("/login?next=/dashboard/assets");
 const {data:creator}=await db.from("creator_accounts")
   .select("id,handle,display_name").eq("owner_user_id",user.id).maybeSingle();
 if(!creator)redirect("/onboarding");
 return <main className="dashboard-shell">
   <aside className="dashboard-sidebar"><Link href="/" className="dashboard-brand">V<span>V</span> VEYRA</Link>
    <div className="dashboard-context"><span>YOUR CREATIVE SPACE</span><strong>{creator.display_name}</strong></div>
    <nav className="dashboard-nav" aria-label="Creator navigation"><Link href="/dashboard">Overview</Link>
      <Link href="/dashboard/pages">Website pages</Link><Link className="active" href="/dashboard/assets">Images</Link>
      <Link href="/dashboard/links">My links</Link><Link href="/dashboard/profile">Profile</Link>
      <Link href="/dashboard/appearance">Appearance</Link></nav></aside>
   <section className="dashboard-main narrow-main veyra-asset-workspace">
     <header><p className="eyebrow">VEYRA STUDIO / ASSETS</p><h1>Your image library.</h1>
      <p>Upload photos, logos and banners, then add them to image elements in your website pages. Image URLs can also be copied for reuse.</p></header>
     <CreatorImageLibrary creatorId={creator.id}/>
     <p><Link href="/dashboard/pages">← Return to Page Studio</Link></p>
   </section>
 </main>;
}
