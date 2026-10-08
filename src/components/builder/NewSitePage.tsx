"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function NewSitePage({ creatorId, pageCount }: { creatorId: string; pageCount: number }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const pageLimit = 20;
  async function create(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const pageTitle = title.trim();
    if (!pageTitle || pageTitle.length > 110) { setError("Enter a page title, up to 110 characters."); return; }
    if (pageCount >= pageLimit) { setError("This workspace has reached the current 20-page limit."); return; }
    setBusy(true);
    try {
      const client = createSupabaseBrowserClient();
      const slugBase = pageTitle.toLowerCase().normalize("NFKD").replace(/[^a-z0-9\s-]/g, "").trim().replace(/[\s-]+/g, "-").slice(0, 48).replace(/-+$/, "") || "page";
      const slug = `${slugBase}-${crypto.randomUUID().slice(0, 6)}`;
      const { data, error: insertError } = await client.from("site_pages")
        .insert({ creator_id: creatorId, title: pageTitle, slug, draft_blocks: [] })
        .select("id").single();
      if (insertError || !data) throw new Error(insertError?.message || "Could not create the page.");
      router.push(`/dashboard/pages/${data.id}`);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not create your page.");
    } finally { setBusy(false); }
  }
  return <form className="vpage-new-form" onSubmit={create}>
    <label htmlFor="new-site-page-title">New page name</label>
    <div><input id="new-site-page-title" maxLength={110} value={title} placeholder="e.g. Services, About, Frequently asked questions" onChange={e=>setTitle(e.target.value)} required disabled={busy||pageCount>=pageLimit}/><button type="submit" disabled={busy||!title.trim()||pageCount>=pageLimit}>{busy?"Creating…":"Create page +"}</button></div>
    <small>Pages start as private drafts. You decide when to publish.</small>
    {error && <p role="alert" className="form-error">{error}</p>}
  </form>;
}
