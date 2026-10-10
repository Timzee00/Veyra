"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { createPageBackup } from "@/platform/exports/page-export";
import type { PageDraftBackup, PublishedPageBackup } from "@/platform/exports/page-export";

export default function DownloadPageBackup({
  creatorId, creatorHandle, disabled = false,
}: { creatorId: string; creatorHandle: string; disabled?: boolean }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function download() {
    if (busy || disabled) return;
    setBusy(true);
    setError("");
    setMessage("");

    try {
      const db = createSupabaseBrowserClient();
      const { data: authData, error: authError } = await db.auth.getUser();
      if (authError || !authData.user) throw new Error("Please sign in again before exporting.");

      // Defense in depth: RLS is the source of truth, and the owner ID must match.
      const { data: owner, error: ownerError } = await db.from("creator_accounts")
        .select("id,handle").eq("id", creatorId).eq("owner_user_id", authData.user.id).maybeSingle();
      if (ownerError || !owner || owner.handle !== creatorHandle)
        throw new Error("You do not have permission to export this website.");

      const [draftsResult, publicResult] = await Promise.all([
        db.from("site_pages")
          .select("id,title,slug,seo_description,draft_blocks,revision,updated_at")
          .eq("creator_id", creatorId).order("updated_at", { ascending: false }).limit(21),
        db.from("site_page_publications")
          .select("page_id,title,slug,seo_description,blocks,revision,published_at")
          .eq("creator_id", creatorId).order("published_at", { ascending: false }).limit(21),
      ]);
      if (draftsResult.error || publicResult.error)
        throw new Error("Could not read every website page. No backup was downloaded.");
      const content = createPageBackup(
        creatorHandle, (draftsResult.data ?? []) as PageDraftBackup[],
        (publicResult.data ?? []) as PublishedPageBackup[],
      );

      // Download in the browser only; do not upload private drafts to any new service.
      const blob = new Blob([content], { type: "application/json;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `veyra-pages-${creatorHandle}-${new Date().toISOString().slice(0,10)}.json`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 30000);
      setMessage("Your page backup was prepared. Keep this file private; it includes unpublished drafts.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not prepare this backup.");
    } finally {
      setBusy(false);
    }
  }

  return <section className="vpage-backup" aria-label="Download your page content">
    <div><h2>Keep a copy of your work.</h2>
      <p>Download your website pages, private drafts, and published snapshots as JSON. This backup does not include media files, projects, or your full account. Automatic import is not available yet.</p>
      <small>Store the file securely because private drafts may contain unpublished information.</small>
    </div>
    <button type="button" onClick={() => void download()} disabled={busy || disabled}>
      {busy ? "Preparing backup…" : "Download page backup"}
    </button>
    {error && <p role="alert" className="form-error">{error}</p>}
    {message && <p role="status" className="form-message">{message}</p>}
  </section>;
}
