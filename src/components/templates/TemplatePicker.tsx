"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type Template = { id: string; name: string; description: string; tier: "free" | "pro" | "studio"; defaultVersion: string };

export default function TemplatePicker({ creatorId, currentTemplateId, templates }: { creatorId: string; currentTemplateId: string; templates: Template[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState(currentTemplateId);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setBusy(true); setMessage(null); setError(null);
    try {
      const template = templates.find((item) => item.id === selected);
      if (!template) throw new Error("Choose a valid template.");
      const supabase = createSupabaseBrowserClient();
      const { error: updateError } = await supabase.from("creator_sites").update({ template_id: selected }).eq("creator_id", creatorId);
      if (updateError) throw updateError;
      setMessage(`${template.name} is now your selected template.`);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "We could not update your template.");
    } finally { setBusy(false); }
  }

  return <section className="template-picker"><div className="template-picker-intro"><p className="eyebrow">TEMPLATES</p><h2>Change the presentation without rebuilding the work.</h2><p>Your projects, profile and media stay attached to your creator account. The template controls how that content is presented.</p></div><div className="template-picker-grid">{templates.map((template) => <button type="button" key={template.id} className={`template-option ${selected === template.id ? "selected" : ""}`} onClick={() => setSelected(template.id)}><span className="template-option-tier">{template.tier.toUpperCase()}</span><strong>{template.name}</strong><p>{template.description}</p><small>Version {template.defaultVersion}</small></button>)}</div><div className="template-picker-actions"><button type="button" className="button button-primary" onClick={save} disabled={busy || selected === currentTemplateId}>{busy ? "Saving…" : "Apply template ↗"}</button>{selected === currentTemplateId && <span>Current template</span>}{message && <span className="form-message">{message}</span>}{error && <span className="form-error">{error}</span>}</div></section>;
}
