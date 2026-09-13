import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import OnboardingForm from "@/components/onboarding/OnboardingForm";

export const metadata: Metadata = {
  title: "Set up your creator profile",
  description: "Choose your Veyra handle and create your public creator space.",
};

export default async function OnboardingPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/onboarding");

  const { data: existing } = await supabase
    .from("creator_accounts")
    .select("id, handle, display_name, bio")
    .eq("owner_user_id", user.id)
    .maybeSingle();

  if (existing) redirect("/dashboard");

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <p className="eyebrow">YOUR VEYRA IDENTITY</p>
        <h1>Let&apos;s build your space.</h1>
        <p className="auth-intro">Your handle becomes your public Veyra URL. You can refine your portfolio, visual system and profile later.</p>
        <OnboardingForm suggestedName={user.user_metadata?.full_name ?? ""} />
      </section>
    </main>
  );
}
