import type { Metadata } from "next";
import Link from "next/link";
import AuthForm from "@/components/auth/AuthForm";
import { VEYRA } from "@/platform/brand/identity";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create your Veyra creator account.",
};

export default function SignupPage() {
  return (
    <main className="auth-shell auth-experience">
      <section className="auth-stage"><div className="auth-visual"><span className="auth-orbit auth-orbit-one" /><span className="auth-orbit auth-orbit-two" /><div className="auth-visual-copy"><span className="auth-kicker">{VEYRA.philosophy.toUpperCase()}</span><h2>{VEYRA.tagline}</h2><p>Build a portfolio that feels like you, share your ideas, and meet your next opportunity.</p><div className="auth-visual-chips"><span>Make</span><span>Share</span><span>Connect</span></div></div></div><div className="auth-card">
        <Link className="auth-brand" href="/" aria-label="Veyra home">V<span>V</span> VEYRA</Link>
        <p className="eyebrow">CREATE YOUR SPACE</p>
        <h1>Make your work<br />a destination.</h1>
        <p className="auth-intro">Create your account first. We will guide you through your public creator profile next.</p>
        <AuthForm mode="signup" />
        <p className="auth-switch">Already have an account? <Link href="/login">Log in</Link></p>
      <p className="auth-powered">Powered by Timzee Corp</p></div></section>
    </main>
  );
}
