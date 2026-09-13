"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

function makeSlug(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
}

export default function NewProjectForm({ creatorId }: { creatorId: string }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [summary, setSummary] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const finalSlug = makeSlug(slug || title);
    if (!title.trim() || !finalSlug) {
      setError("Add a project title before continuing.");
      setBusy(false);
      return;
    }

    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error: insertError } = await supabase
        .from("projects")
        .insert({ creator_id: creatorId, title: title.trim(), slug: finalSlug, summary: summary.trim() || null, body: body.trim() || null })
        .select("id")
        .single();
      if (insertError) throw insertError;
      router.replace(`/dashboard/projects/${data.id}`);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "We could not save this project.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="project-form" onSubmit={submit}>
      <label>Project title<input value={title} onChange={(event) => { setTitle(event.target.value); if (!slug) setSlug(makeSlug(event.target.value)); }} placeholder="Dura Imports — Brand Identity" required maxLength={140} /></label>
      <label>Public slug<input value={slug} onChange={(event) => setSlug(makeSlug(event.target.value))} placeholder="dura-imports-brand-identity" required maxLength={80} /><small>This will be part of your public project URL.</small></label>
      <label>Short summary<input value={summary} onChange={(event) => setSummary(event.target.value)} placeholder="A visual identity built for a modern importation brand." maxLength={280} /></label>
      <label>Project story<textarea value={body} onChange={(event) => setBody(event.target.value)} rows={10} placeholder="Describe the brief, approach, decisions and outcome. Rich editing will be added to this builder later." maxLength={12000} /></label>
      <div className="project-form-actions"><button type="submit" disabled={busy}>{busy ? "Saving…" : "Create project ↗"}</button><span>Saved as a private draft.</span></div>
      {error && <p className="form-error" role="alert">{error}</p>}
    </form>
  );
}
