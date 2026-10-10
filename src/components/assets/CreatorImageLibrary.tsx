"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type ImageAsset = {
  id: string;
  creator_id: string;
  storage_path: string;
  alt_text: string;
  mime_type: string;
  size_bytes: number;
  created_at: string;
};

const mimeTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const IMAGE_EXTENSIONS: Record<string,string> = { "image/jpeg":"jpg","image/png":"png","image/webp":"webp","image/gif":"gif" };
const MAX_ITEMS_PER_PICK = 5;

export default function CreatorImageLibrary({
  creatorId, onSelect, label = "Use image", compact = false,
}: {
  creatorId: string;
  onSelect?: (url: string, path: string, alt: string) => void;
  label?: string;
  compact?: boolean;
}) {
  const [assets, setAssets] = useState<ImageAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      const { data, error: fetchError } = await createSupabaseBrowserClient()
        .from("creator_assets")
        .select("id,creator_id,storage_path,alt_text,mime_type,size_bytes,created_at")
        .eq("creator_id", creatorId)
        .order("created_at", { ascending: false })
        .limit(100);
      if (!active) return;
      if (fetchError) setError("Could not load your images. Check that the creator-image migration is installed.");
      else setAssets((data ?? []) as ImageAsset[]);
      setLoading(false);
    }
    void load();
    return () => { active = false; };
  }, [creatorId]);

  function urlFor(path: string): string {
    return createSupabaseBrowserClient().storage.from("veyra-images").getPublicUrl(path).data.publicUrl;
  }

  async function upload(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (!files.length || busy) return;
    setError("");
    setNotice("");
    if (files.length > MAX_ITEMS_PER_PICK) {
      setError("Choose up to five images at a time.");
      return;
    }
    setBusy(true);
    try {
      const client = createSupabaseBrowserClient();
      const { data: { user }, error: authError } = await client.auth.getUser();
      if (authError || !user) throw new Error("Sign in to upload images.");
      const { data: creator } = await client.from("creator_accounts")
        .select("id").eq("id", creatorId).eq("owner_user_id", user.id).maybeSingle();
      if (!creator) throw new Error("Only the site owner can upload images.");

      const added: ImageAsset[] = [];
      for (const file of files) {
        if (!mimeTypes.has(file.type)) throw new Error(`${file.name}: upload a JPG, PNG, WebP or GIF.`);
        if (!file.size || file.size > MAX_FILE_SIZE)
          throw new Error(`${file.name}: images must be smaller than 5 MB.`);
        const extension = IMAGE_EXTENSIONS[file.type];
        const path = `${creatorId}/${crypto.randomUUID()}.${extension}`;
        const { error: fileError } = await client.storage.from("veyra-images")
          .upload(path, file, { contentType: file.type, cacheControl: "3600", upsert: false });
        if (fileError) throw fileError;
        const readableAlt = file.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").trim().slice(0, 220);
        const { data: item, error: recordError } = await client.from("creator_assets")
          .insert({ creator_id: creatorId, storage_path: path, alt_text: readableAlt,
            mime_type: file.type, size_bytes: file.size })
          .select("id,creator_id,storage_path,alt_text,mime_type,size_bytes,created_at").single();
        if (recordError || !item) {
          await client.storage.from("veyra-images").remove([path]);
          throw recordError ?? new Error("Could not save the image record.");
        }
        added.push(item as ImageAsset);
      }
      setAssets(previous => [...added.reverse(), ...previous].slice(0, 100));
      setNotice("Image uploaded. Select it below to use it on your website.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The upload could not be completed.");
    } finally {
      setBusy(false);
    }
  }

  return <section className={compact ? "veyra-assets veyra-assets-compact" : "veyra-assets"}
    aria-label="Creator image library">
    <div className="veyra-assets-heading">
      <h3>Your images</h3><small>{assets.length} shown</small>
    </div>
    <label className="veyra-assets-upload">
      <strong>{busy ? "Uploading…" : "Upload images"}</strong>
      <span>JPG, PNG, WebP or GIF · 5 MB each · maximum five at once</span>
      <input type="file" accept="image/jpeg,image/png,image/webp,image/gif"
        multiple disabled={busy} onChange={event => void upload(event)} />
    </label>
    <p className="veyra-assets-public-note">Images in this library have public URLs, including before you publish your site. Do not upload private or sensitive files.</p>
    {loading && <p role="status">Loading images…</p>}
    {!loading && !assets.length && !error && <p>Add a photo, logo or banner to begin your library.</p>}
    <div className="veyra-assets-grid">{assets.map(item => {
      const url = urlFor(item.storage_path);
      return <article key={item.id} className="veyra-assets-tile">
        <img src={url} loading="lazy" alt={item.alt_text || "Uploaded site image"} />
        <small title={item.alt_text}>{item.alt_text || "Image"}</small>
        {onSelect
          ? <button type="button" disabled={busy} onClick={() => onSelect(url,item.storage_path,item.alt_text)}>{label}</button>
          : <button type="button" disabled={busy} onClick={() => void navigator.clipboard.writeText(url).then(
            () => setNotice("Image URL copied."), () => setError("Could not copy. Use your browser's image link option.")
          )}>Copy URL</button>}
      </article>;
    })}</div>
    {error && <p className="form-error" role="alert">{error}</p>}
    {notice && <p className="form-message" role="status">{notice}</p>}
  </section>;
}
