"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function OnboardingForm({ suggestedName }: { suggestedName: string }) {
  const router = useRouter();
  const [name, setName] = useState(suggestedName);
  const [handle, setHandle] = useState("");
  const [bio, setBio] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    const normalizedHandle = handle.trim().toLowerCase();
    if (!/^[a-z0-9][a-z0-9_-]{2,31}$/.test(normalizedHandle)) {
      setError("Use 3–32 characters: lowercase letters, numbers, hyphens or underscores.");
      setBusy(false);
      return;
    }

    try {
      const supabase = createSupabaseBrowserClient();
      const { error: rpcError } = await supabase.rpc("create_creator_account", {
        p_handle: normalizedHandle,
        p_display_name: name.trim(),
        p_bio: bio.trim() || null,
      });
      if (rpcError) throw rpcError;
      router.replace("/dashboard");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "We could not create your creator space.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={submit}>
      <label>
        Display name
        <input value={name} onChange={(event) => setName(event.target.value)} required minLength={2} maxLength={80} />
      </label>
      <label>
        Veyra handle
        <input value={handle} onChange={(event) => setHandle(event.target.value.replace(/\s/g, "-"))} placeholder="yourname" required minLength={3} maxLength={32} autoCapitalize="none" />
        <small style={{ color: "#6f6d77" }}>veyra.com/creator/{handle || "yourname"}</small>
      </label>
      <label>
        Short bio <span style={{ color: "#6f6d77" }}>(optional)</span>
        <textarea value={bio} onChange={(event) => setBio(event.target.value)} maxLength={280} rows={4} style={{ resize: "vertical", background: "#0a0a0d", color: "#f5f2eb", border: "1px solid rgba(255,255,255,.12)", borderRadius: 12, padding: 14, font: "inherit" }} />
      </label>
      <button type="submit" disabled={busy}>{busy ? "Creating your space…" : "Create my Veyra space ↗"}</button>
      {error && <p className="form-error" role="alert">{error}</p>}
    </form>
  );
}
