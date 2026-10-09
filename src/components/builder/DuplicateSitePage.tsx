"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function DuplicateSitePage({creatorId,pageId,pageCount}:{creatorId:string;pageId:string;pageCount:number}){
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState("");
 const router=useRouter();
 async function duplicate(){
  if(busy)return;
  setBusy(true);setError("");
  try{
   const db=createSupabaseBrowserClient();
   const {data:source,error:readError}=await db.from("site_pages")
     .select("title,slug,seo_description,draft_blocks").eq("creator_id",creatorId).eq("id",pageId).single();
   if(readError||!source)throw new Error("Could not read the page. Check your permissions.");
   const slug=source.slug.slice(0,45).replace(/-+$/,"")+"-copy-"+crypto.randomUUID().slice(0,6);
   const {data:copy,error:createError}=await db.from("site_pages")
    .insert({creator_id:creatorId,title:("Copy of "+source.title).slice(0,110),slug,
      seo_description:source.seo_description,draft_blocks:source.draft_blocks})
    .select("id").single();
   if(createError||!copy)throw new Error(createError?.message||"Could not duplicate the page.");
   router.push("/dashboard/pages/"+copy.id);
   router.refresh();
  }catch(e){setError(e instanceof Error?e.message:"Duplication failed.");}
  finally{setBusy(false);}
 }
 return <div className="vpage-duplicate-action"><button type="button" onClick={()=>void duplicate()} disabled={busy||pageCount>=20} aria-label="Duplicate this page as a private draft">{busy?"Duplicating…":"Duplicate page"}</button>{pageCount>=20&&<small>Page limit reached.</small>}{error&&<p role="alert" className="form-error">{error}</p>}</div>;
}
