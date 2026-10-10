"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export type CreatorLink = {
 id: string; creator_id: string; label: string; url: string;
 position: number; is_visible: boolean;
};
function validExternalUrl(value: string): boolean {
 try {
  if (!/^https:\/\//.test(value) || /\s/.test(value) || value.length > 1500) return false;
  const parsed = new URL(value);
  return parsed.protocol==="https:" && !!parsed.hostname && !parsed.username && !parsed.password;
 } catch { return false; }
}
export default function CreatorLinksEditor({
 creatorId, handle, initialLinks, published,
}: {creatorId:string;handle:string;initialLinks:CreatorLink[];published:boolean}) {
 const [links,setLinks]=useState<CreatorLink[]>(initialLinks);
 const [label,setLabel]=useState("");
 const [url,setUrl]=useState("");
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState("");
 const [notice,setNotice]=useState("");

 async function add(event: React.FormEvent<HTMLFormElement>) {
  event.preventDefault();
  if(busy)return;
  setError("");setNotice("");
  const title=label.trim(),destination=url.trim();
  if(!title || title.length>75) {setError("Enter a link title of 1–75 characters.");return;}
  if(!validExternalUrl(destination)){setError("Use a valid HTTPS link without a password or username.");return;}
  if(links.length>=24){setError("Maximum 24 links.");return;}
  setBusy(true);
  try {
   const {data,error:insertError}=await createSupabaseBrowserClient()
    .from("creator_links")
    .insert({creator_id:creatorId,label:title,url:destination,position:links.length,is_visible:true})
    .select("id,creator_id,label,url,position,is_visible").single();
   if(insertError||!data)throw insertError??new Error("Could not create link");
   setLinks(previous=>[...previous,data as CreatorLink]);setLabel("");setUrl("");
   setNotice("Link added.");
  }catch(caught){setError(caught instanceof Error?caught.message:"Could not add link.");}
  finally{setBusy(false);}
 }
 async function update(link:CreatorLink, patch:Partial<Pick<CreatorLink,"label"|"url"|"is_visible"|"position">>) {
  if(busy)return;
  const next={...link,...patch};
  if(!next.label.trim()||next.label.length>75||!validExternalUrl(next.url)){setError("Link title and HTTPS URL must be valid.");return;}
  setBusy(true);setError("");setNotice("");
  try{
   const {error:saveError}=await createSupabaseBrowserClient().from("creator_links")
    .update({...patch,updated_at:new Date().toISOString()})
    .eq("id",link.id).eq("creator_id",creatorId);
   if(saveError)throw saveError;
   setLinks(previous=>previous.map(item=>item.id===link.id?next:item));
   setNotice("Link updated.");
  }catch(caught){setError(caught instanceof Error?caught.message:"Could not update link.");}
  finally{setBusy(false);}
 }
 async function remove(link:CreatorLink){
  if(busy||!window.confirm(`Remove "${link.label}" from your link page?`))return;
  setBusy(true);setError("");setNotice("");
  try{
   const {error:deleteError}=await createSupabaseBrowserClient().from("creator_links")
    .delete().eq("id",link.id).eq("creator_id",creatorId);
   if(deleteError)throw deleteError;
   setLinks(previous=>previous.filter(item=>item.id!==link.id));
   setNotice("Link removed.");
  }catch(caught){setError(caught instanceof Error?caught.message:"Could not remove link.");}
  finally{setBusy(false);}
 }
 async function shift(index:number,direction:-1|1) {
  const target=index+direction;
  if(busy||target<0||target>=links.length)return;
  const ordered=[...links];
  [ordered[index],ordered[target]]=[ordered[target],ordered[index]];
  setBusy(true);setError("");setNotice("");
  try{
   const db=createSupabaseBrowserClient();
   // Two independent ordered updates; failure restores local order.
   const results=await Promise.all(ordered.map((item,position)=>db.from("creator_links")
    .update({position}).eq("id",item.id).eq("creator_id",creatorId)));
   if(results.some(result=>result.error))throw new Error("Could not reorder every link. Reload to refresh their order.");
   setLinks(ordered.map((item,position)=>({...item,position})));
   setNotice("Link order updated.");
  }catch(caught){setError(caught instanceof Error?caught.message:"Could not reorder links.");}
  finally{setBusy(false);}
 }
 const publicPath=`/links/${handle}`;
 return <section className="veyra-link-manager" aria-label="Manage creator links">
  <header><div><p className="eyebrow">VEYRA / YOUR LINKS</p><h2>Everything you want to share.</h2>
   <p>Bring together your portfolio, shop, WhatsApp contact, social profiles and other destinations.</p></div>
   <a href={publicPath} target="_blank" rel="noreferrer">View link page ↗</a></header>
  {!published&&<p className="vstudio-alert">Your links are saved privately until your main website is published.</p>}
  <form onSubmit={event=>void add(event)} className="veyra-link-form">
   <label>Button title<input required maxLength={75} placeholder="e.g. My portfolio" value={label} onChange={event=>setLabel(event.target.value)} /></label>
   <label>Full HTTPS destination<input required type="url" placeholder="https://example.com" value={url} onChange={event=>setUrl(event.target.value)} /></label>
   <button type="submit" disabled={busy||links.length>=24}>Add link</button>
  </form>
  <div className="veyra-link-count">{links.length} / 24 links</div>
  <ol className="veyra-link-list">{links.map((item,index)=><li key={item.id}>
    <div className="veyra-link-detail"><strong>{item.label}</strong><small>{item.url}</small>
      {!item.is_visible&&<small>Hidden from visitors</small>}</div>
    <div className="veyra-link-actions">
      <button type="button" disabled={busy||index===0} aria-label={`Move ${item.label} up`} onClick={()=>void shift(index,-1)}>↑</button>
      <button type="button" disabled={busy||index===links.length-1} aria-label={`Move ${item.label} down`} onClick={()=>void shift(index,1)}>↓</button>
      <button type="button" disabled={busy} onClick={()=>void update(item,{is_visible:!item.is_visible})}>{item.is_visible?"Hide":"Show"}</button>
      <details className="veyra-link-inline-editor"><summary>Edit link</summary>
        <form onSubmit={event=>{event.preventDefault();
          const values=new FormData(event.currentTarget);
          const newLabel=String(values.get("label")??"").trim();
          const newUrl=String(values.get("url")??"").trim();
          void update(item,{label:newLabel,url:newUrl});
        }}>
          <label>Link title<input name="label" maxLength={75} defaultValue={item.label} required disabled={busy}/></label>
          <label>HTTPS destination<input name="url" type="url" maxLength={1500} defaultValue={item.url} required disabled={busy}/></label>
          <button type="submit" disabled={busy}>Save changes</button>
        </form>
      </details>
      <button type="button" disabled={busy} onClick={()=>void remove(item)}>Delete</button>
    </div>
   </li>)}</ol>
   {!links.length&&<p>No links yet. Add your first destination above.</p>}
   {error&&<p className="form-error" role="alert">{error}</p>}
   {notice&&<p className="form-message" role="status">{notice}</p>}
 </section>;
}
