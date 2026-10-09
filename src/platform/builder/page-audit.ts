import { pageDocumentIsValid } from "./page-model.ts";
import type { PageDocument } from "./page-model.ts";

export type PageAudit = { errors: string[]; recommendations: string[] };

export function auditPage(title: string, description: string, blocks: unknown): PageAudit {
  const errors: string[] = [];
  const recommendations: string[] = [];
  if (!title.trim()) errors.push("Give this page a useful title.");
  if (!pageDocumentIsValid(blocks)) {
    errors.push("Some blocks contain unsupported content, invalid links, or malformed fields.");
    return { errors, recommendations };
  }
  const document = blocks as PageDocument;
  if (!document.some(block => block.type === "heading")) errors.push("Add at least one heading before publishing this page.");
  if (document.length === 0) errors.push("Add content before publishing this page.");
  if (!description.trim()) recommendations.push("Add a search engine description to help people understand this page.");
  else if (description.length < 50 || description.length > 160) recommendations.push("A search description around 50–160 characters is often easier to display in search results.");
  const headings = document.filter(block => block.type === "heading");
  if (headings.length > 1) recommendations.push("Use a clear heading hierarchy; several equally prominent headings can confuse visitors.");
  if (document.length > 60) recommendations.push("This page has many blocks. Consider splitting content across pages for easier navigation.");
  const repeatedLinks = new Map<string, number>();
  for (const block of document) {
    const text = typeof block.props.text === "string" ? block.props.text : "";
    if (block.type === "image") {
      if (String(block.props.url ?? "") === "/site-editor-placeholder.svg") errors.push("Replace the temporary image placeholder with your own image before publishing.");
      if (!String(block.props.alt ?? "").trim()) recommendations.push("Add helpful alternative text to informative images.");
    }
    if (block.type === "heading" && text.toLowerCase().includes("your next great headline")) errors.push("Replace the example heading before publishing.");
    if (block.type === "paragraph" && text.toLowerCase().includes("write something helpful")) errors.push("Replace the example paragraph before publishing.");
    if (block.type === "quote" && text.toLowerCase().includes("add a genuine quote")) errors.push("Replace the testimonial example with genuine, approved wording.");
    if (block.type === "faq" && (!String(block.props.question ?? "").trim() || !String(block.props.answer ?? "").trim() || String(block.props.question ?? "").toLowerCase() === "a question your visitors ask" || String(block.props.answer ?? "").toLowerCase() === "give a clear, useful answer.")) errors.push("Replace FAQ sample questions and answers with real information.");
    if (block.type === "button") {
      if (!text.trim()) errors.push("Label each button so visitors know what it does.");
      if (/^(click here|read more|learn more)$/i.test(text.trim())) recommendations.push("Use specific button labels that describe the destination.");
      const url = String(block.props.url ?? "");
      if (url) repeatedLinks.set(url, (repeatedLinks.get(url) ?? 0) + 1);
    }
    if (block.type === "image") {
      const alt = String(block.props.alt ?? "").trim();
      if (/^(image|photo|picture|graphic)\s*(of)?\s*$/i.test(alt)) recommendations.push("Describe what an informative image actually shows instead of using a generic label.");
    }
  }
  if (Array.from(repeatedLinks.values()).some(count => count >= 6)) recommendations.push("Several buttons lead to the same destination. Make sure visitors have clear choices.");
  return { errors: Array.from(new Set(errors)), recommendations: Array.from(new Set(recommendations)) };
}
