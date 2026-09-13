"use client";

import { ChangeEvent, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type MediaItem = {
  id: string;
  storage_path: string;
  media_type: string;
  width: number | null;
  height: number | null;
  alt_text: string | null;
  caption: string | null;
  media_role: string;
  mime_type: string | null;
  file_size: number | null;
  position: number;
};

function safeFilename(name: string) {
  const cleaned = name.toLowerCase().replace(/[^a-z0-9.]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  return cleaned.slice(0, 100) || "asset";
}

function inferMediaType(file: File) {
  if (file.type.startsWith("video/")) return "video";
  if (file.type.startsWith("image/")) return "image";
  return "file";
}

export default function ProjectMediaManager({
  creatorId,
  projectId,
  initialMedia,
}: {
  creatorId: string;
  projectId: string;
  initialMedia: MediaItem[];
}) {
  const [media, setMedia] = useState(initialMedia);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (!files.length) return;

    setUploading(true);
    setMessage(null);
    setError(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const nextItems: MediaItem[] = [];
      const startPosition = media.length;

      for (let index = 0; index < files.length; index += 1) {
        const file = files[index];
        const allowed = file.type.startsWith("image/") || file.type.startsWith("video/");
        if (!allowed) throw new Error(`${file.name}: only image and video files are supported.`);
        if (file.size > 50 * 1024 * 1024) throw new Error(`${file.name}: maximum file size is 50 MB.`);

        const filePath = `${creatorId}/${projectId}/${Date.now()}-${index}-${safeFilename(file.name)}`;
        const { error: uploadError } = await supabase.storage.from("project-media").upload(filePath, file, {
          cacheControl: "31536000",
          upsert: false,
          contentType: file.type,
        });
        if (uploadError) throw uploadError;

        const row = {
          project_id: projectId,
          storage_path: filePath,
          media_type: inferMediaType(file),
          mime_type: file.type,
          file_size: file.size,
          media_role: startPosition + index === 0 && media.length === 0 ? "cover" : "gallery",
          position: startPosition + index,
        };

        const { data, error: insertError } = await supabase
          .from("project_media")
          .insert(row)
          .select("id, storage_path, media_type, width, height, alt_text, caption, media_role, mime_type, file_size, position")
          .single();
        if (insertError) {
          await supabase.storage.from("project-media").remove([filePath]);
          throw insertError;
        }
        nextItems.push(data as MediaItem);
      }

      setMedia((current) => [...current, ...nextItems]);
      setMessage(`${nextItems.length} ${nextItems.length === 1 ? "file" : "files"} uploaded.`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "We could not upload the selected files.");
    } finally {
      setUploading(false);
    }
  }

  async function remove(item: MediaItem) {
    setMessage(null);
    setError(null);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: deleteRowError } = await supabase.from("project_media").delete().eq("id", item.id);
      if (deleteRowError) throw deleteRowError;
      const { error: deleteFileError } = await supabase.storage.from("project-media").remove([item.storage_path]);
      if (deleteFileError) throw deleteFileError;
      setMedia((current) => current.filter((entry) => entry.id !== item.id));
      setMessage("Media removed.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "We could not remove this media.");
    }
  }

  async function updateField(id: string, field: "alt_text" | "caption" | "media_role", value: string) {
    setMedia((current) => current.map((entry) => entry.id === id ? { ...entry, [field]: value } : entry));
    const supabase = createSupabaseBrowserClient();
    const { error: updateError } = await supabase.from("project_media").update({ [field]: value || null }).eq("id", id);
    if (updateError) setError(updateError.message);
  }

  return (
    <section className="media-manager" aria-labelledby="media-manager-title">
      <div className="media-manager-head">
        <div>
          <p className="eyebrow">VISUAL ASSETS</p>
          <h2 id="media-manager-title">Build the visual story.</h2>
          <p>Upload images or motion, then give every asset useful context. Draft assets stay private until the project is published.</p>
        </div>
        <label className="media-upload-button">
          {uploading ? "Uploading…" : "Upload media ↗"}
          <input type="file" accept="image/*,video/*" multiple disabled={uploading} onChange={upload} />
        </label>
      </div>

      {media.length === 0 ? (
        <div className="media-empty">No media yet. Add your first image or video to turn this into a visual case study.</div>
      ) : (
        <div className="media-list">
          {media.map((item) => (
            <article className="media-row" key={item.id}>
              <div className="media-icon" aria-hidden="true">{item.media_type === "video" ? "VIDEO" : "IMAGE"}</div>
              <div className="media-main">
                <strong>{item.storage_path.split("/").pop()}</strong>
                <span>{item.mime_type ?? item.media_type} · {item.file_size ? `${Math.max(1, Math.round(item.file_size / 1024))} KB` : "size pending"}</span>
                <div className="media-fields">
                  <label>Role<select value={item.media_role} onChange={(event) => updateField(item.id, "media_role", event.target.value)}><option value="cover">Cover</option><option value="gallery">Gallery</option><option value="process">Process</option><option value="outcome">Outcome</option></select></label>
                  <label>Alt text<input value={item.alt_text ?? ""} onChange={(event) => updateField(item.id, "alt_text", event.target.value)} placeholder="Describe the visual for accessibility" maxLength={300} /></label>
                  <label>Caption<input value={item.caption ?? ""} onChange={(event) => updateField(item.id, "caption", event.target.value)} placeholder="Optional visual caption" maxLength={300} /></label>
                </div>
              </div>
              <button className="media-remove" type="button" onClick={() => remove(item)}>Remove</button>
            </article>
          ))}
        </div>
      )}

      {message && <p className="form-message" role="status">{message}</p>}
      {error && <p className="form-error" role="alert">{error}</p>}
    </section>
  );
}
