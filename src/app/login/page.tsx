import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import AuthForm from "@/components/auth/AuthForm";

export const metadata: Metadata = {
  title: "Log in",
  description: "Log in to your Veyra creator workspace.",
};

export default function LoginPage() {
  return (
    <main className="auth-shell auth-experience">
      <section className="auth-stage"><div className="auth-visual"><span className="auth-orbit auth-orbit-one" /><span className="auth-orbit auth-orbit-two" /><div className="auth-visual-copy"><span className="auth-kicker">YOUR SPACE TO SHINE</span><h2>Great work deserves to be seen.</h2><p>From art and photography to business, writing and everything in between.</p><div className="auth-visual-chips"><span>Create</span><span>Publish</span><span>Grow</span></div></div></div><div className="auth-card">
        <Link className="auth-brand" href="/" aria-label="Veyra home">V<span>V</span> VEYRA</Link>
        <p className="eyebrow">CREATOR ACCESS</p>
        <h1>Welcome back.</h1>
        <p className="auth-intro">Sign in to manage your portfolio, projects, identity and creator settings.</p>
        <Suspense fallback={<p role="status" className="auth-intro">Loading sign-in…</p>}><AuthForm mode="login" /></Suspense>
        <p className="auth-switch">New to Veyra? <Link href="/signup">Create your creator account</Link></p>
      <p className="auth-powered">Powered by Timzee Corp</p></div></section>
    </main>
  );
}
