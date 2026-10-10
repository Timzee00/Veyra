import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import "./links-public.css";

type RouteProps = {params:Promise<{handle:string}>};

async function readPublic(handle:string) {
 const db=await createSupabaseServerClient();
 const {data:creator}=await db.from("creator_accounts")
  .select("id,handle,display_name,bio,avatar_path,status")
  .eq("handle",handle.toLowerCase()).eq("status","active").maybeSingle();
 if(!creator)return null;
 const {data:site}=await db.from("creator_sites")
  .select("visibility").eq("creator_id",creator.id).eq("visibility","published").maybeSingle();
 if(!site)return null;
 const {data:links}=await db.from("creator_links")
  .select("id,label,url,position,is_visible").eq("creator_id",creator.id)
  .eq("is_visible",true).order("position",{ascending:true}).order("created_at",{ascending:true}).limit(24);
 const avatar=typeof creator.avatar_path==="string" && creator.avatar_path.startsWith(`${creator.id}/`)
  ? db.storage.from("veyra-images").getPublicUrl(creator.avatar_path).data.publicUrl : null;
 return {creator,links:links??[],avatar};
}

export async function generateMetadata({params}:RouteProps):Promise<Metadata>{
 const {handle}=await params;
 const info=await readPublic(handle);
 if(!info)return {title:"Link page unavailable",robots:{index:false,follow:false}};
 return {
  title:`${info.creator.display_name} — Links | Veyra`,
  description:info.creator.bio||`Visit links shared by ${info.creator.display_name}.`,
  alternates:{canonical:`/links/${encodeURIComponent(info.creator.handle)}`},
  openGraph:{title:`${info.creator.display_name} — Links`,description:info.creator.bio||"Find my links on Veyra.",type:"profile"},
 };
}

export default async function PublicCreatorLinks({params}:RouteProps) {
 const {handle}=await params;
 const info=await readPublic(handle);
 if(!info)notFound();
 const {creator,links,avatar}=info;
 return <main className="veyra-links-public">
  <div className="veyra-links-card">
   <header className="veyra-links-identity">
    {avatar?<img className="veyra-links-avatar" src={avatar} alt={`${creator.display_name}'s profile`}/>
     :<div className="veyra-links-avatar-placeholder" aria-hidden="true">{creator.display_name.slice(0,1).toUpperCase()}</div>}
    <h1>{creator.display_name}</h1>
    <p className="veyra-links-handle">@{creator.handle}</p>
    {creator.bio&&<p className="veyra-links-bio">{creator.bio}</p>}
   </header>
   <nav aria-label="Creator links" className="veyra-links-list">
    {links.map(item=><a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer nofollow">
     <span>{item.label}</span><span aria-hidden="true">↗</span>
    </a>)}
   </nav>
   {!links.length&&<p className="veyra-links-empty">There are no published links to show yet.</p>}
   <div className="veyra-links-profile"><Link href={`/creator/${creator.handle}`}>Visit website ↗</Link><Link href={`/u/${creator.handle}`}>Creator profile</Link></div>
   <footer><Link href="/">VEYRA</Link><span>Powered by Timzee Corp</span></footer>
  </div>
 </main>;
}
