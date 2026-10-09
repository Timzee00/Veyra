import { pageDocumentIsValid } from "./page-model";
import type { PageDocument } from "./page-model";

// Portable, strictly validated section bundles. Content is data, never executable code.
export const SECTION_BUNDLE_FORMAT = "veyra.sections.v1";
export function exportSectionBundle(blocks: PageDocument): string {
 if (!pageDocumentIsValid(blocks) || !blocks.length) throw new Error("Select valid sections to export.");
 return JSON.stringify({ format: SECTION_BUNDLE_FORMAT, blocks });
}
export function importSectionBundle(serialized: string, generateId: () => string): PageDocument {
 if (serialized.length > 400_000) throw new Error("Section bundle is too large.");
 let raw: unknown;
 try { raw = JSON.parse(serialized); } catch { throw new Error("This is not valid section JSON."); }
 if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new Error("Invalid section bundle.");
 const bundle = raw as Record<string, unknown>;
 if (bundle.format !== SECTION_BUNDLE_FORMAT || Object.keys(bundle).some(k => k !== "format" && k !== "blocks"))
  throw new Error("This bundle is not supported by Veyra.");
 if (!pageDocumentIsValid(bundle.blocks) || bundle.blocks.length === 0) throw new Error("This bundle contains invalid sections.");
 const fresh = bundle.blocks.map(block => ({ ...block, id: generateId(), props: { ...block.props }, children: [] }));
 if (!pageDocumentIsValid(fresh)) throw new Error("Could not safely import these sections.");
 return fresh;
}
