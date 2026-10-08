"use client";
import { FormEvent, useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setMessage("");
    if (password.length < 8) { setError("Use a password with at least 8 characters."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }
    setBusy(true);
    try {
      const client = createSupabaseBrowserClient();
      const { data: { user }, error: userError } = await client.auth.getUser();
      if (userError || !user) throw new Error("This recovery link has expired. Request a new link from sign in.");
      const { error: updateError } = await client.auth.updateUser({ password });
      if (updateError) throw updateError;
      setPassword(""); setConfirm("");
      setMessage("Your password has been updated. You can now go to your dashboard.");
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Unable to update your password."); }
    finally { setBusy(false); }
  }
  return <main className="auth-shell auth-experience"><section className="auth-card">
    <Link className="auth-brand" href="/">V<span>V</span> VEYRA</Link>
    <p className="eyebrow">ACCOUNT SECURITY</p><h1>New password.</h1>
    <p className="auth-intro">Choose a strong password to secure your creator account.</p>
    <form className="auth-form" onSubmit={submit}>
      <label>New password<input type="password" autoComplete="new-password" minLength={8} value={password} onChange={e=>setPassword(e.target.value)} required /></label>
      <label>Confirm new password<input type="password" autoComplete="new-password" minLength={8} value={confirm} onChange={e=>setConfirm(e.target.value)} required /></label>
      <button type="submit" disabled={busy}>{busy ? "Updating…" : "Update password"}</button>
      {error && <p role="alert" className="form-error">{error}</p>}
      {message && <p role="status" className="form-message">{message} <Link href="/dashboard">Open dashboard</Link></p>}
    </form><p className="auth-switch"><Link href="/login">Back to sign in</Link></p>
    <p className="auth-powered">Powered by Timzee Corp</p>
  </section></main>;
}
