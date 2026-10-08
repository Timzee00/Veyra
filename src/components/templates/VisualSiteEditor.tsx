"use client";
import { useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
type Design = { accent:string; font:"sans"|"serif"|"mono"; motion:"none"|"subtle"|"smooth"; radius:"sharp"|"soft"|"rounded"; heroAlignment:"left"|"center" };
const defaults:Design={accent:"#bca8ff",font:"sans",motion:"subtle",radius:"soft",heroAlignment:"left"};
function normalize(v:unknown):Design { const d=(v&&typeof v==="object"&&!Array.isArray(v)?v:{}) as Record<string,unknown>;return {accent:typeof d.accent==="string"&&/^#[0-9a-fA-F]{6}$/.test(d.accent)?d.accent:defaults.accent,font:d.font==="serif"||d.font==="mono"?d.font:"sans",motion:d.motion==="none"||d.motion==="smooth"?d.motion:"subtle",radius:d.radius==="sharp"||d.radius==="rounded"?d.radius:"soft",heroAlignment:d.heroAlignment==="center"?"center":"left"}; }
export default function VisualSiteEditor({creatorId,creatorName,initialDraft,initialPublished,visible}:{creatorId:string;creatorName:string;initialDraft:unknown;initialPublished:unknown;visible:boolean}) {
 const initial=normalize(initialDraft);
 const [design,setDesign]=useState<Design>(initial);
 const [saved,setSaved]=useState<Design>(initial);
 const [published,setPublished]=useState<Design>(normalize(initialPublished));
 const [device,setDevice]=useState<"desktop"|"tablet"|"mobile">("desktop");
 const [busy,setBusy]=useState<"save"|"publish"|null>(null);
 const [error,setError]=useState("");
 const [notice,setNotice]=useState("");
 const changed=useMemo(()=>JSON.stringify(design)!==JSON.stringify(saved),[design,saved]);
 function update<K extends keyof Design>(key:K,value:Design[K]){setDesign(p=>({...p,[key]:value}));setNotice("");}
 async function persist(publish:boolean){
  setBusy(publish?"publish":"save");setError("");setNotice("");
  try{
   const db=createSupabaseBrowserClient();
   const {data:{user},error:userError}=await db.auth.getUser();
   if(userError||!user)throw new Error("Please sign in again.");
   // Owner check: RLS remains authoritative for the actual write.
   const {data:owner,error:ownerError}=await db.from("creator_accounts").select("id").eq("id",creatorId).eq("owner_user_id",user.id).maybeSingle();
   if(ownerError||!owner)throw new Error("Only the website owner can change the design.");
   const patch=publish?{design_draft:design,design_published:design}:{design_draft:design};
   const {error:saveError}=await db.from("creator_sites").update(patch).eq("creator_id",creatorId);
   if(saveError)throw saveError;
   setSaved(design);if(publish)setPublished(design);
   setNotice(publish?"Design applied to your website.":"Draft saved. Your live website has not changed.");
  }catch(e){setError(e instanceof Error?e.message:"Could not save your design.");}
  finally{setBusy(null);}
 }
 return <section className="visual-builder" aria-label="Website design editor">
  <header className="visual-builder-header"><div><p className="eyebrow">VEYRA DESIGN STUDIO</p><h2>Make it yours.</h2><p>Refine your website, preview across devices, and publish your design only when you're happy.</p></div><div className="visual-builder-actions"><span aria-live="polite">{changed?"Unsaved changes":busy?"Working…":"All changes saved"}</span><button type="button" disabled={!!busy||!changed} onClick={()=>{setDesign(saved);setError("");setNotice("");}}>Discard</button><button type="button" disabled={!!busy||!changed} onClick={()=>persist(false)}>Save draft</button><button type="button" className="visual-builder-publish" disabled={!!busy||!visible} onClick={()=>persist(true)}>Apply to live website ↗</button></div></header>
  {!visible&&<p className="visual-builder-warning">Your site is not published yet. You can save your design draft, then publish your site from Profile.</p>}
  <div className="visual-builder-workspace">
   <aside className="visual-builder-inspector"><h3>Design controls</h3>
    <label>Accent color <span className="visual-builder-color"><input type="color" value={design.accent} onChange={e=>update("accent",e.target.value)}/><code>{design.accent}</code></span></label>
    <label>Typography<select value={design.font} onChange={e=>update("font",e.target.value as Design["font"])}><option value="sans">Contemporary sans</option><option value="serif">Editorial serif</option><option value="mono">Modern mono</option></select></label>
    <label>Corner style<select value={design.radius} onChange={e=>update("radius",e.target.value as Design["radius"])}><option value="sharp">Sharp</option><option value="soft">Soft</option><option value="rounded">Rounded</option></select></label>
    <label>Hero alignment<select value={design.heroAlignment} onChange={e=>update("heroAlignment",e.target.value as Design["heroAlignment"])}><option value="left">Left aligned</option><option value="center">Centered</option></select></label>
    <label>Motion<select value={design.motion} onChange={e=>update("motion",e.target.value as Design["motion"])}><option value="none">None</option><option value="subtle">Subtle</option><option value="smooth">Smooth</option></select></label>
    <button type="button" className="visual-builder-reset" onClick={()=>setDesign(defaults)}>Reset design choices</button>
    <p>Changes here affect your website's visual system, not its content. Your existing projects stay intact.</p>
   </aside>
   <div className="visual-builder-stage"><div className="visual-builder-devices" role="group" aria-label="Preview screen size">{(["desktop","tablet","mobile"] as const).map(item=><button key={item} type="button" aria-pressed={device===item} onClick={()=>setDevice(item)}>{item==="desktop"?"Desktop":item==="tablet"?"Tablet":"Mobile"}</button>)}</div>
    <div className={`visual-builder-frame device-${device}`}><div className={`visual-builder-preview font-${design.font} radius-${design.radius} motion-${design.motion} align-${design.heroAlignment}`} style={{"--preview-accent":design.accent} as React.CSSProperties}>
      <div className="visual-builder-mini-nav"><strong>{creatorName}</strong><span>Work · About · Contact</span></div><section><span>YOUR CREATIVE SPACE</span><h3>{creatorName}</h3><p>Thoughtful work, a distinctive story, and a place to be discovered.</p><span className="visual-builder-fauxbutton">Explore my work ↗</span></section><div className="visual-builder-mini-grid"><i/><i/><i/></div><footer>VEYRA · Powered by Timzee Corp</footer>
    </div></div><p className="visual-builder-preview-note">Representative style preview. Visit your real portfolio to review final content and layout.</p>
   </div>
  </div>
  {error&&<p role="alert" className="form-error">{error}</p>}{notice&&<p role="status" className="form-message">{notice}</p>}
  {JSON.stringify(published)!==JSON.stringify(design)&&<p className="visual-builder-preview-note">Your currently published design differs from this preview.</p>}
 </section>;
}
