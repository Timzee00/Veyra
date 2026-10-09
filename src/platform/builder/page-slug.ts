// Shared editor-side page-slug rules, matched to site_page_safe_slug in SQL.
const RESERVED = new Set(["project", "post", "pages", "api", "opengraph-image"]);

export function pageSlugIsValid(value: string): boolean {
  return /^[a-z][a-z0-9-]{0,62}$/.test(value) && !RESERVED.has(value);
}

export function makeUniquePageSlug(title: string, suffix: string): string {
  const cleanSuffix = suffix.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 8);
  if (!cleanSuffix) throw new Error("A unique page identifier is required.");
  let base = title.toLowerCase().normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim().replace(/[\s-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (!base) base = "page";
  if (!/^[a-z]/.test(base)) base = `page-${base}`;
  base = base.slice(0, 48).replace(/-+$/g, "") || "page";
  const result = `${base}-${cleanSuffix}`;
  if (!pageSlugIsValid(result)) throw new Error("Could not create a valid page address.");
  return result;
}
