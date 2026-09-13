"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type Creator = { id: string; handle: string; display_name: string; bio: string | null; website_url: string | null; whatsapp_number: string | null; default_inquiry_message: string | null };
type Site = { visibility: "draft" | "published" | "unlisted"; title: string | null; seo_description: string | null } | null;

export default function ProfileEditor({ creator, site }: { creator: Creator; site: Site }) {
  const router = useRouter();
  const [name, setName] = useState(creator.display_name);
  const [bio, setBio] = useState(creator.bio ?? "");
  const [website, setWebsite] = useState(creator.website_url ?? "");
  const [whatsapp, setWhatsapp] = useState(creator.whatsapp_number ?? "");
  const [message, setMessage] = useState(creator.default_inquiry_message ?? "Hi, I found your work on Veyra and would like to discuss a project.");
  const [siteTitle, setSiteTitle] = useState(site?.title ?? `${creator.display_name} — Veyra`);
  const [seo, setSeo] = useState(site?.seo_description ?? "");
  const [visibility, setVisibility] = useState(site?.visibility ?? "draft");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true); setNotice(null); setError(null);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: creatorError } = await supabase.from("creator_accounts").update({ display_name: name.trim(), bio: bio.trim() || null, website_url: website.trim() || null, whatsapp_number: whatsapp.trim() || null, default_inquiry_message: message.trim() || null }).eq("id", creator.id);
      if (creatorError) throw creatorError;
      const { error: siteError } = await supabase.from("creator_sites").update({ title: siteTitle.trim() || null, seo_description: seo.trim() || null, visibility }).eq("creator_id", creator.id);
      if (siteError) throw siteError;
      setNotice("Profile saved."); router.refresh();
    } catch (caught) { setError(caught instanceof Error ? caught.message : "We could not save your profile."); }
    finally { setBusy(false); }
  }

  return (
    <form className="project-form profile-form" onSubmit={submit}>
      <section className="settings-block"><p className="eyebrow">PUBLIC IDENTITY</p><h2>@{creator.handle}</h2><label>Display name<input value={name} onChange={(e)=>setName(e.target.value)} required maxLength={80}/></label><label>Bio<textarea value={bio} onChange={(e)=>setBio(e.target.value)} rows={4} maxLength={500}/></label><label>Website<input value={website} onChange={(e)=>setWebsite(e.target.value)} type="url" placeholder="https://example.com" /></label></section>
      <section className="settings-block"><p className="eyebrow">CONTACT</p><label>WhatsApp number<input value={whatsapp} onChange={(e)=>setWhatsapp(e.target.value)} placeholder="2348012345678" inputMode="tel" /></label><label>Default WhatsApp inquiry<input value={message} onChange={(e)=>setMessage(e.target.value)} maxLength={600}/></label></section>
      <section className="settings-block"><p className="eyebrow">SEARCH & PUBLISHING</p><label>Portfolio title<input value={siteTitle} onChange={(e)=>setSiteTitle(e.target.value)} maxLength={120}/></label><label>SEO description<textarea value={seo} onChange={(e)=>setSeo(e.target.value)} rows={3} maxLength={300}/></label><label>Visibility<select value={visibility} onChange={(e)=>setVisibility(e.target.value as typeof visibility)}><option value="draft">Draft — private</option><option value="published">Published — public</option><option value="unlisted">Unlisted — direct link only</option></select></label></section>
      <div className="project-form-actions"><button type="submit" disabled={busy}>{busy ? "Saving…" : "Save profile ↗"}</button>{notice && <span className="form-message">{notice}</span>}{error && <span className="form-error">{error}</span>}</div>
    </form>
  );
}
