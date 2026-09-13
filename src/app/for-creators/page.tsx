import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "For creators", description: "Create a professional portfolio and creative presence with Veyra." };

const steps = [
  ["01", "Create your identity", "Choose your handle, add your profile, services, links and contact details."],
  ["02", "Build your work", "Publish projects, case studies, galleries, motion and ongoing creator posts."],
  ["03", "Make it yours", "Choose a presentation system and customize its colors, type, spacing and motion."],
  ["04", "Get discovered", "Share your profile, turn visits into conversations, and learn what your audience responds to."],
];

export default function ForCreatorsPage() {
  return <main className="creator-landing-shell"><header className="discover-nav"><Link className="brand" href="/"><span className="brand-mark">V</span><span>VEYRA</span></Link><nav className="discover-links"><Link href="/explore">Discover</Link><Link href="/blog">Journal</Link><Link href="/for-creators" aria-current="page">For creators</Link></nav><div className="discover-actions"><Link href="/login">Log in</Link><Link className="discover-cta" href="/signup">Start creating ↗</Link></div></header>
    <section className="creator-landing-hero"><p className="eyebrow">FOR CREATORS</p><h1>Build a creative presence<br /><span>people remember.</span></h1><p>Veyra gives designers, photographers, filmmakers, illustrators, studios and other independent creators the infrastructure to show work beautifully and turn discovery into opportunity.</p><div><Link className="button button-primary" href="/signup">Create your profile ↗</Link><Link className="button button-secondary" href="/explore">See the community</Link></div></section>
    <section className="creator-benefits"><div className="benefit-intro"><p className="eyebrow">THE SYSTEM</p><h2>Everything around<br />your work.</h2></div><div className="benefit-list">{steps.map(([number,title,text])=><article key={number}><span>{number}</span><div><h3>{title}</h3><p>{text}</p></div></article>)}</div></section>
    <section className="creator-landing-grid"><article><span>PORTFOLIO</span><h2>Projects that feel like complete stories.</h2><p>Move beyond a grid of thumbnails. Add context, process, outcomes, media and clear next steps for potential clients.</p></article><article><span>DISCOVERY</span><h2>Be found beyond your own link.</h2><p>Veyra has a public discovery layer where people can browse creators, categories, projects and posts without needing an account.</p></article><article><span>CONTROL</span><h2>Your identity stays yours.</h2><p>Keep your name, visual language, social presence, WhatsApp contact and presentation choices under your control.</p></article><article><span>GROWTH</span><h2>Understand what gets attention.</h2><p>Analytics, engagement and inquiry signals are designed to connect creative visibility to real outcomes.</p></article></section>
    <section className="creator-landing-cta"><p className="eyebrow">READY WHEN YOU ARE</p><h2>Make a place<br /><span>for the work.</span></h2><Link className="button button-primary" href="/signup">Become a Veyra creator ↗</Link></section>
    <footer className="discover-footer"><span>© {new Date().getFullYear()} Veyra</span><div><Link href="/">Home</Link><Link href="/explore">Discover</Link><Link href="/blog">Journal</Link><Link href="/privacy">Privacy</Link></div><span>Powered by Timzee Corp</span></footer>
  </main>;
}
