import type { Metadata } from "next";
import Link from "next/link";
import AuthForm from "@/components/auth/AuthForm";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create your Veyra creator account.",
};

export default function SignupPage() {
  return (
    <main className="auth-shell">
      <section className="auth-card">
        <Link className="auth-brand" href="/" aria-label="Veyra home">V<span>V</span> VEYRA</Link>
        <p className="eyebrow">CREATE YOUR SPACE</p>
        <h1>Make your work<br />a destination.</h1>
        <p className="auth-intro">Create your account first. We will guide you through your public creator profile next.</p>
        <AuthForm mode="signup" />
        <p className="auth-switch">Already have an account? <Link href="/login">Log in</Link></p>
      </section>
    </main>
  );
}
