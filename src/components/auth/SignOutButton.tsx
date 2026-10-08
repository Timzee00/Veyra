"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
export default function SignOutButton({ className = "" }: { className?: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  async function signOut() {
    setBusy(true); setError("");
    try {
      const { error: authError } = await createSupabaseBrowserClient().auth.signOut({ scope: "local" });
      if (authError) throw authError;
      router.replace("/login");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not sign out.");
      setBusy(false);
    }
  }
  return <span className="veyra-signout"><button type="button" className={className} onClick={signOut} disabled={busy}>{busy ? "Signing out…" : "Sign out"}</button>{error && <span role="alert" className="form-error">{error}</span>}</span>;
}
