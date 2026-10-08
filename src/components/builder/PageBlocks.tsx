import type { PageDocument, PageBlock } from "@/platform/builder/page-model";
import { safeSiteUrl, pageDocumentIsValid } from "@/platform/builder/page-model";

function RenderBlock({ block, siteBasePath }: { block: PageBlock; siteBasePath?: string }) {
  const text = typeof block.props.text === "string" ? block.props.text : "";
  const url = typeof block.props.url === "string" && safeSiteUrl(block.props.url) ? block.props.url : "";
  const href = !url || url.startsWith("https://") || !siteBasePath ? url : url === "/" ? siteBasePath : `${siteBasePath}/pages/${url.replace(/^\\/(pages\\/)?/, "")}`;
  switch (block.type) {
    case "heading": return <h2 className="vpage-heading">{text}</h2>;
    case "paragraph": return <p className="vpage-paragraph">{text}</p>;
    case "button": return href ? <a className="vpage-cta" href={href} rel={href.startsWith("https://") ? "noopener noreferrer" : undefined}>{text || "Learn more"} <span aria-hidden="true">↗</span></a> : null;
    case "divider": return <hr className="vpage-divider" />;
    case "image": return url ? <figure className="vpage-figure"><img src={url} loading="lazy" alt={String(block.props.alt ?? "")} /></figure> : null;
    case "quote": return <blockquote className="vpage-quote">{text}</blockquote>;
    case "faq": return <details className="vpage-faq"><summary>{String(block.props.question ?? "")}</summary><p>{String(block.props.answer ?? "")}</p></details>;
    case "spacer": return <div className="vpage-spacer" aria-hidden="true" />;
    default: return null;
  }
}

export default function PageBlocks({ blocks, className = "", siteBasePath }: { blocks: PageDocument | unknown; className?: string; siteBasePath?: string }) {
  if (!pageDocumentIsValid(blocks)) return null;
  return <div className={`veyra-page-content ${className}`}>{blocks.map(block => <div className={`vpage-block vpage-block-${block.type}`} key={block.id}><RenderBlock block={block} siteBasePath={siteBasePath} /></div>)}</div>;
}
