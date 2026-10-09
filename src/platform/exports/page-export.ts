import { pageDocumentIsValid } from "../builder/page-model.ts";

export const PAGE_BACKUP_FORMAT = "veyra.page-backup.v1" as const;

export type PageDraftBackup = {
  id: string;
  title: string;
  slug: string;
  seo_description: string | null;
  draft_blocks: unknown;
  revision: number;
  updated_at: string;
};

export type PublishedPageBackup = {
  page_id: string;
  title: string;
  slug: string;
  seo_description: string | null;
  blocks: unknown;
  revision: number;
  published_at: string;
};

/** Exports owned page content only. This is NOT a full account data export. */
export function createPageBackup(
  handle: string,
  drafts: PageDraftBackup[],
  publications: PublishedPageBackup[],
  exportedAt = new Date().toISOString(),
): string {
  if (!/^[a-z0-9][a-z0-9_-]{2,31}$/.test(handle)) {
    throw new Error("Invalid creator identity for export.");
  }
  if (!Array.isArray(drafts) || drafts.length > 20 || !Array.isArray(publications) || publications.length > 20) {
    throw new Error("Unexpected page count. Please contact support before exporting.");
  }
  const ids = new Set<string>();
  for (const page of drafts) {
    if (!page || !pageDocumentIsValid(page.draft_blocks) || !page.id || ids.has(page.id)) {
      throw new Error("Some private pages are malformed. Export was cancelled to avoid an incomplete backup.");
    }
    ids.add(page.id);
  }
  const publicationIds = new Set<string>();
  for (const page of publications) {
    if (!page || !pageDocumentIsValid(page.blocks) || !ids.has(page.page_id) || publicationIds.has(page.page_id)) {
      throw new Error("Some published pages are inconsistent. Export was cancelled.");
    }
    publicationIds.add(page.page_id);
  }
  if (!Number.isFinite(Date.parse(exportedAt))) throw new Error("Invalid export timestamp.");
  const exportContent = {
    format: PAGE_BACKUP_FORMAT,
    product: "Veyra Studio",
    exported_at: exportedAt,
    creator_handle: handle,
    scope: "website_pages_only",
    note: "Includes private drafts and currently published page snapshots. Does not include account credentials, uploaded media files, projects, subscriptions, or complete account data. Manual import is not supported yet.",
    pages: drafts,
    publications,
  };
  return JSON.stringify(exportContent, null, 2);
}
