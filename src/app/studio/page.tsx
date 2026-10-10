import type { Metadata } from "next";
import Link from "next/link";
import { VEYRA } from "@/platform/brand/identity";
import "./studio.css";

export const metadata: Metadata = {
  title: "Veyra Studio — Visual Website Builder",
  description: VEYRA.studioSummary,
  openGraph: {
    title: "Veyra Studio — Imagine it. Build it. Own it.",
    description: VEYRA.studioSummary,
    type: "website",
  },
};

const capabilities = [
  {
    number: "01",
    title: "Shape every page",
    detail: "Edit text, headings, images, FAQs and calls to action. Rearrange page elements and start from practical section presets.",
  },
  {
    number: "02",
    title: "Design across screens",
    detail: "Use desktop, tablet and mobile previews while you refine content, then adjust your website’s global typography, accent and layout style.",
  },
  {
    number: "03",
    title: "Build from your best work",
    detail: "Save a reusable section in your private library or duplicate a page to carry a layout into a new project.",
  },
  {
    number: "04",
    title: "Publish on your terms",
    detail: "Keep unfinished work in drafts, publish explicitly and restore a previous published page as a new private draft.",
  },
] as const;

const sequence = [
  { name: "Set up", detail: "Create your Veyra identity and choose a free starter template." },
  { name: "Create", detail: "Write your homepage and add pages with Veyra Studio." },
  { name: "Review", detail: "Check mobile, tablet and desktop previews before publishing." },
  { name: "Share", detail: "Make the approved website available under your Veyra creator address." },
] as const;

export default function StudioOverviewPage() {
  return <main className="studio-marketing">
    <header className="discover-nav">
      <Link className="brand" href="/" aria-label="Veyra home">
        <span className="brand-mark" aria-hidden="true">V</span><span>{VEYRA.wordmark}</span>
      </Link>
      <nav className="discover-links" aria-label="Primary navigation">
        <Link href="/explore">Discover</Link>
        <Link href="/studio" aria-current="page">Studio</Link>
        <Link href="/blog">Journal</Link>
        <Link href="/for-creators">For creators</Link>
      </nav>
      <div className="discover-actions">
        <Link href="/login">Log in</Link>
        <Link className="discover-cta" href="/signup">Start creating ↗</Link>
      </div>
    </header>

    <section className="studio-marketing-hero" aria-labelledby="studio-hero-title">
      <div className="studio-marketing-copy">
        <p className="eyebrow">VEYRA STUDIO / BUILD YOUR PRESENCE</p>
        <h1 id="studio-hero-title">Imagine it.<br /><span>Build it.</span><br />Own it.</h1>
        <p>{VEYRA.studioSummary} Make a home for your ideas and the work you're proud of.</p>
        <div className="studio-marketing-actions">
          <Link className="button button-primary" href="/signup">Get started <span aria-hidden="true">↗</span></Link>
          <Link className="button button-secondary" href="/explore">Explore published work</Link>
        </div>
        <p className="studio-marketing-footnote">Start with free templates. Advanced capabilities are being developed and are not yet available.</p>
      </div>
      <div className="studio-feature-board" aria-label="Veyra Studio workflow illustration">
        <div className="studio-feature-board-top"><span aria-hidden="true" className="studio-dots"><i/><i/><i/></span><span>DESIGN · PREVIEW · PUBLISH</span></div>
        <div className="studio-feature-board-body">
          <div className="studio-feature-board-tools"><span>Pages</span><span>Elements</span><span>Sections</span><span>Versions</span></div>
          <div className="studio-feature-board-canvas">
            <div className="studio-feature-mini-nav"><strong>YOUR BRAND</strong><span>HOME / ABOUT</span></div>
            <div className="studio-feature-mini-page"><span>YOUR NEXT IDEA</span><strong>Make space for your best work.</strong><p>Your story, built your way.</p><span className="studio-feature-mini-cta">Explore</span></div>
            <div className="studio-feature-mini-cards"><i/><i/><i/></div>
          </div>
        </div>
        <p className="studio-feature-board-caption">Concept illustration · not an actual screenshot of the editor</p>
      </div>
    </section>

    <section className="studio-marketing-features" aria-labelledby="studio-features-title">
      <div className="studio-marketing-section-head">
        <p className="eyebrow">YOUR CREATIVE TOOLKIT</p>
        <h2 id="studio-features-title">Professional workflows.<br />Without unnecessary complexity.</h2>
        <p>Build the foundations of a real website with tools designed to keep your content editable and your publishing decisions deliberate.</p>
      </div>
      <div className="studio-marketing-feature-grid">
        {capabilities.map(feature=><article key={feature.number}>
          <span>{feature.number} / STUDIO</span>
          <h3>{feature.title}</h3>
          <p>{feature.detail}</p>
        </article>)}
      </div>
    </section>

    <section className="studio-marketing-steps" aria-labelledby="studio-steps-title">
      <div><p className="eyebrow">FROM IDEA TO WEBSITE</p><h2 id="studio-steps-title">A clear way forward.</h2><p>Move from your first idea to your first published website in manageable steps.</p></div>
      <ol>{sequence.map((step,index)=><li key={step.name}><span>0{index+1}</span><div><h3>{step.name}</h3><p>{step.detail}</p></div></li>)}</ol>
    </section>

    <section className="studio-marketing-cta" aria-labelledby="studio-cta-title">
      <p className="eyebrow">{VEYRA.philosophy.toUpperCase()}</p>
      <h2 id="studio-cta-title">This is where the idea<br /><span>becomes yours.</span></h2>
      <Link className="button button-primary" href="/signup">Create with Veyra <span aria-hidden="true">↗</span></Link>
      <p>Build and publish with intention. Veyra is actively in development.</p>
    </section>
    <footer className="discover-footer">
      <span>© {new Date().getFullYear()} {VEYRA.name}</span>
      <div><Link href="/">Home</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/explore">Discover</Link></div>
      <span>Powered by {VEYRA.company}</span>
    </footer>
  </main>;
}
