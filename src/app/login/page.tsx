import type { Metadata } from "next";
import Link from "next/link";
import AuthForm from "@/components/auth/AuthForm";

export const metadata: Metadata = {
  title: "Log in",
  description: "Log in to your Veyra creator workspace.",
};

export default function LoginPage() {
  return (
    <main className="auth-shell">
      <section className="auth-card">
        <Link className="auth-brand" href="/" aria-label="Veyra home">V<span>V</span> VEYRA</Link>
        <p className="eyebrow">CREATOR ACCESS</p>
        <h1>Welcome back.</h1>
        <p className="auth-intro">Sign in to manage your portfolio, projects, identity and creator settings.</p>
        <AuthForm mode="login" />
        <p className="auth-switch">New to Veyra? <Link href="/signup">Create your creator account</Link></p>
      </section>
    </main>
  );
}
