"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type Project = { id: string; slug: string; title: string; summary: string | null; body: string | null; published: boolean; published_at: string | null };

export default function ProjectEditor({ project }: { project: Project }) {
  const router = useRouter();
  const [title, setTitle] = useState(project.title);
  const [slug, setSlug] = useState(project.slug);
  const [summary, setSummary] = useState(project.summary ?? "");
  const [body, setBody] = useState(project.body ?? "");
  const [published, setPublished] = useState(project.published);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function save(event: FormEvent) {
    event.preventDefault(); setBusy(true); setNotice(null); setError(null);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: updateError } = await supabase.from("projects").update({ title: title.trim(), slug: slug.trim(), summary: summary.trim() || null, body: body.trim() || null, published, published_at: published ? (project.published_at ?? new Date().toISOString()) : null }).eq("id", project.id);
      if (updateError) throw updateError;
      setNotice(published ? "Project saved and published." : "Project saved as draft.");
      router.refresh();
    } catch (caught) { setError(caught instanceof Error ? caught.message : "We could not save this project."); }
    finally { setBusy(false); }
  }

  return <form className="project-form" onSubmit={save}><label>Project title<input value={title} onChange={(e)=>setTitle(e.target.value)} required maxLength={140}/></label><label>Public slug<input value={slug} onChange={(e)=>setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,"-").replace(/-+/g,"-").replace(/^-|-$/g, ""))} required maxLength={80}/></label><label>Summary<input value={summary} onChange={(e)=>setSummary(e.target.value)} maxLength={280}/></label><label>Project story<textarea value={body} onChange={(e)=>setBody(e.target.value)} rows={14} maxLength={20000}/></label><label className="publish-toggle"><input type="checkbox" checked={published} onChange={(e)=>setPublished(e.target.checked)}/><span>Publish this project publicly</span></label><div className="project-form-actions"><button type="submit" disabled={busy}>{busy ? "Saving…" : published ? "Save & publish ↗" : "Save draft ↗"}</button>{notice && <span className="form-message">{notice}</span>}{error && <span className="form-error">{error}</span>}</div></form>;
}
