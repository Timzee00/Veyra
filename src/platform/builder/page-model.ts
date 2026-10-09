import type { BuilderNode } from "./block-catalog";

export const PAGE_BLOCK_KINDS = ["heading", "paragraph", "button", "divider", "image", "quote", "faq", "spacer"] as const;
export type PageBlockKind = typeof PAGE_BLOCK_KINDS[number];
export type PageBlock = BuilderNode & { type: PageBlockKind };
export type PageDocument = PageBlock[];

const allowedProps = new Set(["text", "url", "alt", "question", "answer"]);

export function pageDocumentIsValid(value: unknown): value is PageDocument {
  if (!Array.isArray(value) || value.length > 80) return false;
  const seen = new Set<string>();
  for (const item of value) {
    if (!item || typeof item !== "object" || Array.isArray(item)) return false;
    const block = item as Record<string, unknown>;
    if (Object.keys(block).some(key => !["id", "type", "props", "children"].includes(key))) return false;
    if (typeof block.id !== "string" || !/^[a-zA-Z0-9_-]{1,80}$/.test(block.id) || seen.has(block.id)) return false;
    seen.add(block.id);
    if (!PAGE_BLOCK_KINDS.includes(block.type as PageBlockKind)) return false;
    if (!Array.isArray(block.children) || block.children.length !== 0) return false;
    if (!block.props || typeof block.props !== "object" || Array.isArray(block.props)) return false;
    for (const [key, prop] of Object.entries(block.props)) {
      if (!allowedProps.has(key) || typeof prop !== "string" || prop.length > 4000) return false;
    }
    const props = block.props as Record<string, string>;
    if ((block.type === "button" || block.type === "image") && !safeSiteUrl(props.url ?? "")) return false;
    if (block.type === "image" && (props.alt ?? "").length > 220) return false;
  }
  return true;
}

export function safeSiteUrl(value: string): boolean {
  if (value === "/") return true;
  if (/^\/(?!\/)[^\s]*$/.test(value)) return !/[\\\\]/.test(value);
  if (!/^https:\/\/[^\s]+$/.test(value)) return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" && Boolean(parsed.hostname) && !parsed.username && !parsed.password;
  } catch { return false; }
}

export function createPageBlock(type: PageBlockKind): PageBlock {
  const defaults: Record<PageBlockKind, Record<string, string>> = {
    heading: { text: "Your next great headline" },
    paragraph: { text: "Write something helpful for your visitors." },
    button: { text: "Learn more", url: "/" },
    divider: {},
    image: { url: "/site-editor-placeholder.svg", alt: "Temporary image placeholder" },
    quote: { text: "Add a genuine quote from a customer or collaborator." },
    faq: { question: "A question your visitors ask", answer: "Give a clear, useful answer." },
    spacer: {},
  };
  return { id: crypto.randomUUID(), type, props: defaults[type], children: [] };
}

export const SECTION_KITS: readonly { title: string; description: string; blocks: readonly PageBlockKind[] }[] = [
  { title: "Welcome", description: "A strong headline and introduction", blocks: ["heading", "paragraph", "button"] },
  { title: "Services", description: "Describe your offer and invite inquiries", blocks: ["divider", "heading", "paragraph", "button"] },
  { title: "Featured work", description: "Give an important project visual impact", blocks: ["divider", "heading", "image", "paragraph"] },
  { title: "Testimonials", description: "Share real, approved words from customers", blocks: ["divider", "heading", "quote"] },
  { title: "FAQ", description: "Answer common customer questions", blocks: ["divider", "heading", "faq", "faq"] },
];

export function makeSectionKit(blocks: readonly PageBlockKind[]): PageBlock[] {
  return blocks.map(type => createPageBlock(type));
}
