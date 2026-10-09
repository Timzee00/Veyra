"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type PageVersion = {
  id: string;
  title: string;
  slug: string;
  draft_revision: number;
  published_at: string;
};

export default function PageVersionHistory({
  pageId, creatorId, revision, dirty, busy,
}: {
  pageId: string;
  creatorId: string;
  revision: number;
  dirty: boolean;
  busy: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [versions, setVersions] = useState<PageVersion[]>([]);
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    let active = true;
    async function loadVersions() {
      setLoading(true);
      setError("");
      const { data, error: fetchError } = await createSupabaseBrowserClient()
        .from("site_page_versions")
        .select("id,title,slug,draft_revision,published_at")
        .eq("page_id", pageId)
        .eq("creator_id", creatorId)
        .order("published_at", { ascending: false })
        .limit(30);
      if (!active) return;
      setLoading(false);
      if (fetchError) {
        setError("Could not load published versions. Please check the database migration.");
      } else {
        setVersions((data ?? []) as PageVersion[]);
      }
    }
    void loadVersions();
    return () => { active = false; };
  }, [open, pageId, creatorId]);

  async function restore(version: PageVersion) {
    if (busy || restoring) return;
    const warning = dirty
      ? "You have unsaved changes. Restoring will replace the current private draft and discard those changes. The live page will NOT change. Continue?"
      : "Restore this published version into the private editor? The live page will NOT change until you publish it again.";
    if (!window.confirm(warning)) return;

    setError("");
    setRestoring(true);
    try {
      const { error: restoreError } = await createSupabaseBrowserClient()
        .rpc("veyra_restore_page_version", {
          target_page: pageId,
          target_version: version.id,
          expected_revision: revision,
        });
      if (restoreError) throw restoreError;
      // New server props must replace the editor's local state, including undo history.
      window.location.reload();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Version restore failed.");
      setRestoring(false);
    }
  }

  return <section className="vstudio-version-history" aria-label="Page publishing history">
    <button type="button" aria-expanded={open} aria-controls="veyra-page-versions"
      disabled={busy || restoring} onClick={() => setOpen(value => !value)}>
      {open ? "Hide published versions" : "Published version history"}
    </button>
    {open && <div id="veyra-page-versions">
      <p>Keep up to 30 published snapshots. Restoring a version changes only your private draft. Review and publish it separately when ready.</p>
      {loading && <p role="status">Loading version history…</p>}
      {!loading && !versions.length && !error && <p>No published versions yet. Your first successful publication will appear here.</p>}
      <ol>{versions.map(version => <li key={version.id}>
        <div><strong>{version.title}</strong>
          <small>{new Date(version.published_at).toLocaleString()} · Draft revision {version.draft_revision} · /pages/{version.slug}</small>
        </div>
        <button type="button" disabled={busy || restoring} onClick={() => void restore(version)}
          aria-label={`Restore snapshot from ${new Date(version.published_at).toLocaleString()}`}>Restore draft</button>
      </li>)}</ol>
      {error && <p role="alert" className="form-error">{error}</p>}
    </div>}
  </section>;
}
