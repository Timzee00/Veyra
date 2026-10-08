"use client";
import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { BuilderNode } from "@/platform/builder/block-catalog";
import { validateBuilderTree } from "@/platform/builder/block-catalog";
const supported=["heading","paragraph","button","divider"] as const;
type Kind=typeof supported[number];
function createBlock(type:Kind):BuilderNode{return{id:crypto.randomUUID(),type,props:type==="heading"?{text:"New heading"}:type==="paragraph"?{text:"Describe what makes your work special."}:type==="button"?{text:"Get in touch",url:"/"}:{},children:[]};}
const SECTION_PRESETS = [
 {id:"hero",label:"Hero / Introduction",elements:[["heading","Welcome to my world"],["paragraph","Introduce what you do and who you help."],["button","Explore my work"]]},
 {id:"services",label:"Services / Offerings",elements:[["heading","What I can help with"],["paragraph","Describe your real services, approach and what customers can expect."],["button","Request a quote"]]},
 {id:"about",label:"About / Story",elements:[["heading","The story behind the work"],["paragraph","Share your experience, values and the people you serve."]]},
 {id:"contact",label:"Contact / Call to action",elements:[["heading","Let's work together"],["paragraph","Tell visitors how to reach you and what happens next."],["button","Get in touch"]]},
] as const;
export default function PageBlockEditor({creatorId,initialBlocks,visible}:{creatorId:string;initialBlocks:unknown;visible:boolean}){
 const initial=validateBuilderTree(initialBlocks)&&initialBlocks.every(x=>supported.includes(x.type as Kind))?initialBlocks:[];
 const [blocks,setBlocks]=useState<BuilderNode[]>(initial);
 const [saved,setSaved]=useState(JSON.stringify(initial));
 const [history,setHistory]=useState<BuilderNode[][]>([]);
 const [future,setFuture]=useState<BuilderNode[][]>([]);
 const [busy,setBusy]=useState(false);const [status,setStatus]=useState("");
 function change(next:BuilderNode[]){setHistory(h=>[...h.slice(-19),blocks]);setFuture([]);setBlocks(next);setStatus("");}
 function undo(){if(!history.length)return;setFuture(f=>[blocks,...f]);setBlocks(history.at(-1)!);setHistory(h=>h.slice(0,-1));}
 function redo(){if(!future.length)return;setHistory(h=>[...h,blocks]);setBlocks(future[0]);setFuture(f=>f.slice(1));}
 function addPreset(preset:typeof SECTION_PRESETS[number]){
  const next=preset.elements.map(([kind,text])=>({...createBlock(kind as Kind),props:kind==="button"?{text,url:"/"}:{text}}));
  if(blocks.length+next.length>40){setStatus("Your page has reached the 40-block limit.");return;}
  change([...blocks,...next]);
 }
 function move(index:number,by:number){const to=index+by;if(to<0||to>=blocks.length)return;const next=[...blocks];[next[index],next[to]]=[next[to],next[index]];change(next);}
 async function save(publish:boolean){
  setBusy(true);setStatus("");
  try{
   if(!validateBuilderTree(blocks)||blocks.some(b=>!supported.includes(b.type as Kind)))throw new Error("Unsupported page block.");
   const db=createSupabaseBrowserClient();
   const {data:{user}}=await db.auth.getUser();if(!user)throw new Error("Please sign in.");
   const {data:owner}=await db.from("creator_accounts").select("id").eq("owner_user_id",user.id).eq("id",creatorId).maybeSingle();if(!owner)throw new Error("You cannot edit this website.");
   const {error}=await db.from("creator_page_drafts").upsert({creator_id:creatorId,blocks},{onConflict:"creator_id"});if(error)throw error;
   setSaved(JSON.stringify(blocks));
   if(publish){const {error:publishError}=await db.rpc("veyra_publish_builder",{target_creator:creatorId});if(publishError)throw publishError;}
   setStatus(publish?"Your page sections are now live.":"Draft saved privately.");
  }catch(e){setStatus(e instanceof Error?e.message:"Could not save.");}finally{setBusy(false);}
 }
 return <section className="veyra-block-editor" aria-label="Page sections editor">
  <div className="veyra-block-heading"><div><p className="eyebrow">PAGE COMPOSER / BETA</p><h2>Build your homepage.</h2><p>Add real text and links, arrange sections and preview before publishing. More sections and pages are being developed.</p></div><div className="veyra-block-actions"><button onClick={undo} disabled={!history.length||busy}>Undo</button><button onClick={redo} disabled={!future.length||busy}>Redo</button><button onClick={()=>save(false)} disabled={busy||JSON.stringify(blocks)===saved}>Save draft</button><button onClick={()=>save(true)} disabled={busy||!visible}>Publish sections</button></div></div>
  <div className="veyra-block-workspace"><aside><h3>Add an element</h3>{supported.map(type=><button key={type} disabled={blocks.length>=40} onClick={()=>change([...blocks,createBlock(type)])}>+ {type==="paragraph"?"Text":type[0].toUpperCase()+type.slice(1)}</button>)}<h3>Ready-made sections</h3>{SECTION_PRESETS.map(preset=><button key={preset.id} onClick={()=>addPreset(preset)} disabled={blocks.length+preset.elements.length>40}>+ {preset.label}</button>)}<small>Up to 40 blocks. Presets add editable content rather than fake data or nonworking integrations.</small></aside>
  <div className="veyra-block-list">{!blocks.length&&<p className="veyra-block-empty">Your canvas is empty. Choose an element to begin.</p>}{blocks.map((block,i)=><article key={block.id} className="veyra-block-item"><div className="veyra-block-toolbar"><strong>{i+1}. {block.type}</strong><div><button aria-label="Move up" disabled={i===0} onClick={()=>move(i,-1)}>↑</button><button aria-label="Move down" disabled={i===blocks.length-1} onClick={()=>move(i,1)}>↓</button><button aria-label="Duplicate block" disabled={blocks.length>=40} onClick={()=>change([...blocks.slice(0,i+1),{...block,id:crypto.randomUUID()},...blocks.slice(i+1)])}>Copy</button><button aria-label="Remove block" onClick={()=>change(blocks.filter(b=>b.id!==block.id))}>Remove</button></div></div>{block.type!=="divider"&&<label>Content<input value={String(block.props.text??"")} maxLength={5000} onChange={e=>change(blocks.map(b=>b.id===block.id?{...b,props:{...b.props,text:e.target.value}}:b))}/></label>}{block.type==="button"&&<label>Link (https:// or internal /path)<input value={String(block.props.url??"")} onChange={e=>change(blocks.map(b=>b.id===block.id?{...b,props:{...b.props,url:e.target.value}}:b))}/></label>}</article>)}<div className="veyra-block-canvas" aria-label="Live content preview"><strong>LIVE DRAFT PREVIEW</strong>{blocks.map(block=><div key={block.id}>{block.type==="heading"?<h2>{String(block.props.text??"")}</h2>:block.type==="paragraph"?<p>{String(block.props.text??"")}</p>:block.type==="button"?<span className="veyra-block-preview-button">{String(block.props.text??"Button")} ↗</span>:<hr/>}</div>)}</div></div></div>
  {status&&<p role="status" className="form-message">{status}</p>}{!visible&&<p className="visual-builder-warning">Publish your website from Profile before applying page sections.</p>}
 </section>;
}
