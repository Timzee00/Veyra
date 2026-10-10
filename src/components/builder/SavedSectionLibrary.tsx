"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { exportSectionBundle, importSectionBundle } from "@/platform/builder/section-bundle";
import { pageDocumentIsValid } from "@/platform/builder/page-model";
import type { PageDocument } from "@/platform/builder/page-model";

type SavedKit = {
 id: string;
 name: string;
 block_count: number;
 created_at: string;
};
type Props = {
 creatorId: string;
 blocks: PageDocument;
 selectedId: string | null;
 busy: boolean;
 onInsert: (imported: PageDocument) => void;
};

export default function SavedSectionLibrary({creatorId,blocks,selectedId,busy,onInsert}:Props) {
 const [open,setOpen] = useState(false);
 const [items,setItems] = useState<SavedKit[]>([]);
 const [name,setName] = useState("");
 const [loading,setLoading] = useState(false);
 const [saving,setSaving] = useState(false);
 const [error,setError] = useState("");
 const [notice,setNotice] = useState("");
 const selected = blocks.find(block=>block.id===selectedId) ?? null;

 useEffect(()=>{
  if(!open)return;
  let active=true;
  async function load(){
   setLoading(true);setError("");
   const {data,error:loadError}=await createSupabaseBrowserClient()
     .from("site_section_library").select("id,name,block_count,created_at")
     .eq("creator_id",creatorId).order("created_at",{ascending:false}).limit(24);
   if(!active)return;
   if(loadError)setError("Could not load saved sections. Check that the section-library migration is installed.");
   else setItems((data??[]) as SavedKit[]);
   setLoading(false);
  }
  void load();
  return()=>{active=false;};
 },[open,creatorId]);

 async function save(which:"selected"|"all"){
  if(busy||saving)return;
  setError("");setNotice("");
  const content=which==="selected" ? selected?[selected]:[] : blocks;
  const kitName=name.trim();
  if(!kitName||kitName.length>80){setError("Give your saved section a name (1–80 characters).");return;}
  if(!pageDocumentIsValid(content)||content.length===0){setError("Choose valid content to save.");return;}
  if(items.length>=24){setError("This site has reached the limit of 24 saved sections.");return;}
  setSaving(true);
  try{
   // Reuse the same schema validation as portable sections.
   const safeBlocks=importSectionBundle(exportSectionBundle(content),()=>crypto.randomUUID());
   const {data,error:insertError}=await createSupabaseBrowserClient().from("site_section_library")
     .insert({creator_id:creatorId,name:kitName,blocks:safeBlocks})
     .select("id,name,block_count,created_at").single();
   if(insertError||!data)throw new Error(insertError?.message??"Could not save this section.");
   setItems(prev=>[data as SavedKit,...prev].slice(0,24));setName("");
   setNotice("Saved to your private library. You can reuse it across your pages.");
  }catch(caught){setError(caught instanceof Error?caught.message:"Could not save section.");}
  finally{setSaving(false);}
 }

 async function insert(kit:SavedKit){
  if(busy||saving)return;
  setError("");setNotice("");setSaving(true);
  try{
   if(blocks.length+kit.block_count>80)throw new Error("Importing this section would exceed the page's 80-element limit.");
   const {data,error:fetchError}=await createSupabaseBrowserClient()
     .from("site_section_library").select("blocks")
     .eq("creator_id",creatorId).eq("id",kit.id).single();
   if(fetchError||!data||!pageDocumentIsValid(data.blocks)||!data.blocks.length)
    throw new Error("This saved section could not be loaded or has invalid content.");
   const imported=importSectionBundle(exportSectionBundle(data.blocks),()=>crypto.randomUUID());
   onInsert(imported);
   setNotice(`Added "${kit.name}" to your private draft. Save your page to keep the change.`);
  }catch(caught){setError(caught instanceof Error?caught.message:"Unable to insert saved sections.");}
  finally{setSaving(false);}
 }

 async function remove(kit:SavedKit){
  if(busy||saving||!window.confirm(`Delete "${kit.name}" from your private section library? This will not change pages already using it.`))return;
  setSaving(true);setError("");setNotice("");
  try{
   const {error:deleteError}=await createSupabaseBrowserClient()
     .from("site_section_library").delete().eq("creator_id",creatorId).eq("id",kit.id);
   if(deleteError)throw deleteError;
   setItems(prev=>prev.filter(entry=>entry.id!==kit.id));
   setNotice("Saved section deleted. Existing pages were not changed.");
  }catch(caught){setError(caught instanceof Error?caught.message:"Could not delete saved section.");}
  finally{setSaving(false);}
 }
 return <div className="vstudio-saved-library">
   <button type="button" className="vstudio-kit" onClick={()=>setOpen(value=>!value)} aria-expanded={open} aria-controls="veyra-saved-kits">{open?"Hide saved section library":"Open saved section library"}</button>
   {open&&<section id="veyra-saved-kits" aria-label="Saved website sections">
     <p>Save and reuse your real sections. Your library is private to this website.</p>
     <label>Section name<input value={name} onChange={e=>setName(e.target.value)} maxLength={80} placeholder="e.g. Service introduction" disabled={busy||saving}/></label>
     <div className="vstudio-library-actions">
       <button type="button" disabled={busy||saving||!selected||!name.trim()} onClick={()=>void save("selected")}>Save selected</button>
       <button type="button" disabled={busy||saving||!blocks.length||!name.trim()} onClick={()=>void save("all")}>Save whole page as kit</button>
     </div>
     <h3>Saved sections ({items.length}/24)</h3>
     {loading&&<p role="status">Loading saved sections…</p>}
     {!loading&&!items.length&&<p>Your library is empty. Select an element or build a page, give it a name, and save it.</p>}
     <ul className="vstudio-library-items">{items.map(kit=><li key={kit.id}>
       <strong>{kit.name}</strong>
       <small>{kit.block_count} elements</small>
       <div className="vstudio-library-actions">
        <button type="button" disabled={busy||saving} onClick={()=>insert(kit)}>Insert</button>
        <button type="button" disabled={busy||saving} onClick={()=>void remove(kit)} aria-label={`Delete saved section ${kit.name}`}>Delete</button>
       </div>
     </li>)}</ul>
     {error&&<p role="alert" className="form-error">{error}</p>}
     {notice&&<p role="status" className="form-message">{notice}</p>}
   </section>}
 </div>;
}
