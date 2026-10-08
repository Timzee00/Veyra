"use client";

import { FormEvent, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type Mode = "login" | "signup";

export default function AuthForm({ mode }: { mode: Mode }) {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    setError(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const requestedNext = searchParams.get("next") || "/dashboard";
      const next = requestedNext.startsWith("/") && !requestedNext.startsWith("//") && !requestedNext.includes("\\") ? requestedNext : "/dashboard";
      if (resetMode) {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/auth/callback?next=/dashboard/settings` });
        if (resetError) throw resetError;
        setMessage("If this email has an account, password recovery instructions will arrive shortly.");
        return;
      }

      if (mode === "login") {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        window.location.assign(next);
        return;
      }

      const callbackUrl = `${window.location.origin}/auth/callback?next=/onboarding`;
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: callbackUrl,
          data: { full_name: name.trim() },
        },
      });
      if (signUpError) throw signUpError;

      setMessage("Account created. Check your email to verify it, then continue to Veyra.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={submit} noValidate>
      {mode === "signup" && !resetMode && (
        <label>
          Full name
          <input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" required minLength={2} />
        </label>
      )}
      <label>
        Email address
        <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" required />
      </label>
      {!resetMode && <label>
        Password
        <input value={password} onChange={(event) => setPassword(event.target.value)} type={showPassword ? "text" : "password"} autoComplete={mode === "login" ? "current-password" : "new-password"} required={!resetMode} minLength={8} />
      </label>}
      {!resetMode && <button type="button" className="auth-text-button" onClick={() => setShowPassword(!showPassword)}>{showPassword ? "Hide password" : "Show password"}</button>}
      {mode === "login" && <button type="button" className="auth-text-button" onClick={() => { setResetMode(!resetMode); setError(null); setMessage(null); }}>{resetMode ? "Back to sign in" : "Forgot password?"}</button>}
      <button type="submit" disabled={busy}>
        {busy ? "Working…" : resetMode ? "Send recovery email ↗" : mode === "login" ? "Log in ↗" : "Create account ↗"}
      </button>
      {message && <p className="form-message" role="status">{message}</p>}
      {error && <p className="form-error" role="alert">{error}</p>}
    </form>
  );
}
