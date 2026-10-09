"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import PageBlocks from "@/components/builder/PageBlocks";
import { exportSectionBundle, importSectionBundle } from "@/platform/builder/section-bundle";
import { auditPage } from "@/platform/builder/page-audit";
import { createPageBlock, makeSectionKit, PAGE_BLOCK_KINDS, pageDocumentIsValid, SECTION_KITS } from "@/platform/builder/page-model";
import type { PageBlock, PageBlockKind, PageDocument } from "@/platform/builder/page-model";

type Page = { id: string; creator_id: string; slug: string; title: string; seo_description: string | null; revision: number; draft_blocks: unknown };
type Props = { page: Page; creatorHandle: string; siteLive: boolean; publishedSlug: string | null };

export default function SitePageStudio({ page, creatorHandle, siteLive, publishedSlug: initialPublishedSlug }: Props) {
  const router = useRouter();
  const initial = pageDocumentIsValid(page.draft_blocks) ? page.draft_blocks : [];
  const [blocks, setBlocks] = useState<PageDocument>(initial);
  const [title, setTitle] = useState(page.title);
  const [slug, setSlug] = useState(page.slug);
  const [description, setDescription] = useState(page.seo_description ?? "");
  const [saved, setSaved] = useState(JSON.stringify({ blocks: initial, title: page.title, slug: page.slug, description: page.seo_description ?? "" }));
  const [revision, setRevision] = useState(page.revision);
  const [past, setPast] = useState<PageDocument[]>([]);
  const [future, setFuture] = useState<PageDocument[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(initial[0]?.id ?? null);
  const [dragging, setDragging] = useState<number | null>(null);
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [busy, setBusy] = useState(false);
  const [publishedSlug, setPublishedSlug] = useState(initialPublishedSlug);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [bundleText, setBundleText] = useState("");
  const [showBundles, setShowBundles] = useState(false);

  const dirty = saved !== JSON.stringify({ blocks, title, slug, description });
  const selected = blocks.find(item => item.id === selectedId) ?? null;
  const count = blocks.length;
  const publicPath = publishedSlug ? `/creator/${creatorHandle}/pages/${publishedSlug}` : null;

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => { if (dirty) { event.preventDefault(); event.returnValue = ""; } };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const audit = useMemo(() => auditPage(title, description, blocks), [title, description, blocks]);
  const contentErrors = useMemo(() => {
    const issues: string[] = [];
    if (!pageDocumentIsValid(blocks)) issues.push("Some blocks have invalid content or unsafe URLs.");
    if (!/^[a-z][a-z0-9-]{0,62}$/.test(slug) || ["project","post","pages","api","opengraph-image"].includes(slug)) issues.push("Use a simple page address containing lowercase letters, numbers or hyphens.");
    if (!title.trim() || title.length > 110) issues.push("Page titles must contain 1–110 characters.");
    if (description.length > 300) issues.push("The SEO description must be 300 characters or fewer.");
    return issues;
  }, [blocks, description, slug, title]);

  function edit(next: PageDocument) {
    setPast(previous => [...previous.slice(-29), blocks]);
    setFuture([]);
    setBlocks(next);
    setMessage("");
  }
  function add(kind: PageBlockKind) {
    if (count >= 80) return;
    const block = createPageBlock(kind);
    edit([...blocks, block]);
    setSelectedId(block.id);
  }
  function addKit(kinds: readonly PageBlockKind[]) {
    if (count + kinds.length > 80) return;
    const next = makeSectionKit(kinds);
    edit([...blocks, ...next]);
    setSelectedId(next[0]?.id ?? null);
  }
  function updateProp(key: string, value: string) {
    if (!selected) return;
    edit(blocks.map(item => item.id === selected.id ? { ...item, props: { ...item.props, [key]: value } } : item));
  }
  function reorder(from: number, to: number) {
    if (from < 0 || to < 0 || from >= count || to >= count || from === to) return;
    const next = [...blocks];
    const [moving] = next.splice(from, 1);
    next.splice(to, 0, moving);
    edit(next);
  }
  function undo() {
    if (!past.length) return;
    const last = past[past.length-1];
    setFuture(items => [blocks, ...items.slice(0,29)]);
    setPast(items => items.slice(0,-1));
    setBlocks(last);
  }
  function redo() {
    if (!future.length) return;
    setPast(items => [...items.slice(-29), blocks]);
    setBlocks(future[0]);
    setFuture(items => items.slice(1));
  }

  async function copySections() {
    try {
      if (!blocks.length) throw new Error("Add page content before copying.");
      const value = exportSectionBundle(blocks);
      await navigator.clipboard.writeText(value);
      setMessage("Page sections copied. Paste the bundle into another Veyra page to reuse them.");
      setError("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not copy sections.");
    }
  }
  function appendSections() {
    try {
      const imported = importSectionBundle(bundleText, () => crypto.randomUUID());
      if (blocks.length + imported.length > 80) throw new Error("This page cannot exceed 80 elements.");
      edit([...blocks, ...imported]);
      setSelectedId(imported[0]?.id ?? null);
      setBundleText("");
      setShowBundles(false);
      setError("");
      setMessage("Sections added to your private draft. Save the draft to keep them.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not import sections.");
    }
  }

  async function saveDraft(): Promise<number | null> {
    setError(""); setMessage("");
    if (contentErrors.length) { setError(contentErrors[0]); return null; }
    const db = createSupabaseBrowserClient();
    const { data, error: updateError } = await db.from("site_pages")
      .update({ title: title.trim(), slug, seo_description: description.trim() || null, draft_blocks: blocks, revision: revision+1, updated_at: new Date().toISOString() })
      .eq("id", page.id).eq("creator_id", page.creator_id).eq("revision", revision)
      .select("revision").maybeSingle();
    if (updateError || !data) {
      setError(updateError?.code === "23505" ? "This page address is already taken. Choose a different address." :
        updateError?.message || "This page was updated somewhere else. Copy your changes and refresh to avoid overwriting newer work.");
      return null;
    }
    setRevision(data.revision);
    setSaved(JSON.stringify({ blocks, title, slug, description }));
    setMessage("Draft saved privately. Your published page is unchanged.");
    return data.revision;
  }

  // Desktop editing convenience: Ctrl/Cmd+S saves the private draft without publishing.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        if (!dirty || busy) return;
        setBusy(true);
        void saveDraft().finally(() => setBusy(false));
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  async function saveAndPublish() {
    if (!siteLive) { setError("Publish your main Veyra website before this page can become public."); return; }
    if (contentErrors.length || audit.errors.length) { setError((contentErrors[0] || audit.errors[0]) ?? "Please complete the page."); return; }
    setBusy(true); setError(""); setMessage("");
    try {
      let latest = revision;
      if (dirty) {
        const updated = await saveDraft();
        if (updated === null) return;
        latest = updated;
      }
      const { error: publishError } = await createSupabaseBrowserClient()
        .rpc("veyra_publish_site_page", { target_page: page.id, expected_revision: latest });
      if (publishError) throw publishError;
      setPublishedSlug(slug);
      setMessage("Published successfully. This page is now visible to website visitors.");
      router.refresh();
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Publishing failed."); }
    finally { setBusy(false); }
  }

  async function unpublish() {
    if (!publishedSlug || !window.confirm("Remove this page from the public website? Your saved draft will remain.")) return;
    setBusy(true); setMessage(""); setError("");
    try {
      const { error: removeError } = await createSupabaseBrowserClient().rpc("veyra_unpublish_site_page", { target_page: page.id });
      if (removeError) throw removeError;
      setPublishedSlug(null);
      setMessage("Page unpublished. Your private draft remains available.");
      router.refresh();
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Could not unpublish page."); }
    finally { setBusy(false); }
  }

  return <div className="vstudio">
    <div className="vstudio-top">
      <div><p className="eyebrow">VEYRA STUDIO / PAGE EDITOR</p><h1>{title || "Untitled page"}</h1><p className="vstudio-subtitle">Add sections, edit details and approve the exact version that goes live.</p></div>
      <div className="vstudio-commands"><span role="status">{busy?"Working…":dirty?"Unsaved changes":"Draft saved"}</span>
        <button type="button" onClick={undo} disabled={!past.length||busy}>Undo</button>
        <button type="button" onClick={redo} disabled={!future.length||busy}>Redo</button>
        <button type="button" onClick={()=>{setBusy(true);void saveDraft().finally(()=>setBusy(false));}} disabled={!dirty||busy}>Save draft</button>
        <button type="button" className="vstudio-publish" onClick={()=>void saveAndPublish()} disabled={busy||!siteLive}>Publish page ↗</button>
      </div>
    </div>
    {!siteLive && <p className="vstudio-alert">Your main website is not yet published. You can prepare these pages, then publish them after your main site goes live.</p>}
    <div className="vstudio-metadata"><label>Page title<input value={title} maxLength={110} onChange={e=>setTitle(e.target.value)} /></label>
      <label>Page address <span>/pages/</span><input value={slug} maxLength={63} onChange={e=>setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,""))}/></label>
      <label>Search engine description<input value={description} maxLength={300} placeholder="A concise summary of this page" onChange={e=>setDescription(e.target.value)}/></label>
    </div>
    <div className="vstudio-workspace">
      <aside className="vstudio-library"><h2>Elements</h2><div className="vstudio-element-grid">
        {PAGE_BLOCK_KINDS.map(kind=><button type="button" key={kind} onClick={()=>add(kind)} disabled={count>=80||busy}>+ {kind === "faq" ? "FAQ" : kind[0].toUpperCase()+kind.slice(1)}</button>)}
      </div><h2>Ready-made sections</h2>{SECTION_KITS.map(kit=><button type="button" className="vstudio-kit" key={kit.title} onClick={()=>addKit(kit.blocks)} disabled={count+kit.blocks.length>80||busy}><strong>{kit.title}</strong><small>{kit.description}</small></button>)}<p>Start with safe, responsive sections. No coding or paid AI required.</p><h2>Reusable sections</h2><p>Copy sections from this page and reuse them in another page. Imported elements receive new IDs and are private until published.</p><button type="button" className="vstudio-kit" disabled={!blocks.length||busy} onClick={()=>void copySections()}>Copy all page sections</button><button type="button" className="vstudio-kit" onClick={()=>setShowBundles(v=>!v)}>{showBundles?"Close import":"Import section bundle"}</button>{showBundles&&<div className="vstudio-bundle-import"><label>Paste Veyra section bundle<textarea rows={5} value={bundleText} onChange={e=>setBundleText(e.target.value)} maxLength={400000} placeholder="Paste copied JSON here" /></label><button type="button" disabled={!bundleText.trim()||busy} onClick={appendSections}>Add sections to draft</button></div>}</aside>
      <section className="vstudio-canvas">
        <div className="vstudio-canvas-toolbar"><span>PAGE PREVIEW · {count} ELEMENTS</span><div role="group" aria-label="Preview width">{(["desktop","tablet","mobile"] as const).map(size=><button type="button" key={size} aria-pressed={device===size} onClick={()=>setDevice(size)}>{size}</button>)}</div></div>
        <div className={`vstudio-viewport viewport-${device}`}><div className="vstudio-preview-paper"><div className="vstudio-preview-nav"><strong>{creatorHandle}</strong><span>Home · {title}</span></div>
          <PageBlocks blocks={blocks} siteBasePath={`/creator/${creatorHandle}`}/>
          {!blocks.length && <div className="vstudio-start"><h2>Your canvas is ready.</h2><p>Choose an element or a section on the left. The page will update instantly.</p></div>}
          <footer>Powered by Timzee Corp</footer>
        </div></div>
        <p className="vstudio-hint">This preview uses the same content renderer as the public page. Website-wide template styling may differ.</p>
        <div className="vstudio-layer-heading"><h2>Layers & order</h2><p>Drag elements, or use the arrow buttons to move them on mobile or with a keyboard.</p></div>
        <ol className="vstudio-layers">{blocks.map((block,index)=><li key={block.id} draggable={!busy} onDragStart={e=>{setDragging(index);e.dataTransfer.effectAllowed="move";}} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();if(dragging!==null)reorder(dragging,index);setDragging(null);}} onDragEnd={()=>setDragging(null)} className={selectedId===block.id?"selected":""}>
          <button type="button" className="vstudio-layer-select" aria-pressed={selectedId===block.id} onClick={()=>setSelectedId(block.id)}><span aria-hidden="true">⠿</span> {index+1}. {block.type}</button>
          <div><button type="button" aria-label={`Move ${block.type} up`} onClick={()=>reorder(index,index-1)} disabled={busy||index===0}>↑</button>
            <button type="button" aria-label={`Move ${block.type} down`} onClick={()=>reorder(index,index+1)} disabled={busy||index===count-1}>↓</button>
            <button type="button" aria-label={`Duplicate ${block.type}`} disabled={busy||count>=80} onClick={()=>{const copy:PageBlock={...block,id:crypto.randomUUID(),props:{...block.props}};edit([...blocks.slice(0,index+1),copy,...blocks.slice(index+1)]);setSelectedId(copy.id);}}>Copy</button>
            <button type="button" aria-label={`Remove ${block.type}`} disabled={busy} onClick={()=>{edit(blocks.filter(item=>item.id!==block.id));if(selectedId===block.id)setSelectedId(null);}}>Remove</button></div>
        </li>)}</ol>
      </section>
      <aside className="vstudio-inspector"><h2>Inspector</h2>{selected?<><p className="vstudio-selection">{selected.type} block selected</p>
        {selected.type!=="spacer"&&selected.type!=="divider"&&selected.type!=="faq"&&selected.type!=="image"&&<label>Text<textarea rows={4} value={String(selected.props.text??"")} maxLength={4000} onChange={e=>updateProp("text",e.target.value)} /></label>}
        {(selected.type==="button"||selected.type==="image")&&<label>{selected.type==="image"?"Image address (HTTPS)":"Destination URL"}<input value={String(selected.props.url??"")} maxLength={4000} onChange={e=>updateProp("url",e.target.value)}/></label>}
        {selected.type==="image"&&<label>Image description for accessibility<input value={String(selected.props.alt??"")} maxLength={220} onChange={e=>updateProp("alt",e.target.value)}/></label>}
        {selected.type==="faq"&&<><label>Question<input value={String(selected.props.question??"")} onChange={e=>updateProp("question",e.target.value)}/></label><label>Answer<textarea rows={4} value={String(selected.props.answer??"")} onChange={e=>updateProp("answer",e.target.value)}/></label></>}
        {(selected.type==="spacer"||selected.type==="divider")&&<p>This element adds spacing or separates sections without needing text.</p>}
        </>:<p>Select an element from Layers to edit its content.</p>}
        <div className="vstudio-guidance"><h3>Publishing checklist</h3><p>Ensure text is accurate, buttons have valid links, and any uploaded images have helpful descriptions. Review all screen widths before publishing.</p>
          {[...contentErrors,...audit.errors].map(issue=><p className="vstudio-issue" key={issue}>{issue}</p>)}
          {audit.recommendations.map(tip=><p key={tip}>Suggestion: {tip}</p>)}
        </div>
      </aside>
    </div>
    <div className="vstudio-footer-actions"><Link href="/dashboard/pages">← All pages</Link>
      {publicPath && siteLive && <Link href={publicPath} target="_blank">View live page ↗</Link>}
      {publishedSlug && <button type="button" onClick={()=>void unpublish()} disabled={busy}>Unpublish page</button>}
    </div>
    {error && <p role="alert" className="form-error">{error}</p>}
    {message && <p role="status" className="form-message">{message}</p>}
  </div>;
}
