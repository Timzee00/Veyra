import Link from "next/link";
import { getRendererSections } from "@/platform/templates/renderer";
import type { TemplateDefinition } from "@/platform/templates/types";

type Creator = {
  handle: string;
  display_name: string;
  bio: string | null;
  website_url: string | null;
  whatsapp_number: string | null;
  default_inquiry_message: string | null;
};

type Project = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  published_at: string | null;
  coverUrl?: string | null;
};

type Site = {
  title: string | null;
  seo_description: string | null;
  template_id: string;
  template_version_id?: string | null;
};

function buildWhatsAppUrl(creator: Creator) {
  if (!creator.whatsapp_number) return null;
  const number = creator.whatsapp_number.replace(/[^0-9]/g, "");
  const message = creator.default_inquiry_message ?? `Hi, I found ${creator.display_name}'s work on Veyra and would like to discuss a project.`;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

function creatorInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "V";
}

export default function PortfolioRenderer({
  creator,
  site,
  projects,
  definition,
}: {
  creator: Creator;
  site: Site;
  projects: Project[];
  definition: TemplateDefinition;
}) {
  const sections = getRendererSections(definition);
  const whatsappUrl = buildWhatsAppUrl(creator);
  const featured = projects[0];
  const initials = creatorInitials(creator.display_name);
  const pageTitle = site.title?.trim() || creator.display_name;

  return (
    <main className={`portfolio-shell template-${site.template_id}`}>
      <header className="portfolio-nav">
        <Link className="creator-brand" href="#top" aria-label={`${creator.display_name} home`}>
          <span className="creator-brand-mark">{initials}</span>
          <span className="creator-brand-name">{creator.display_name}</span>
        </Link>

        <Link className="portfolio-platform-link" href="/" aria-label="Discover more creators on Veyra">
          <span>V</span> Discover on Veyra
        </Link>

        <div className="portfolio-nav-actions">
          <a className="portfolio-nav-work" href="#work">Work</a>
          {whatsappUrl ? (
            <a className="portfolio-contact" href={whatsappUrl} target="_blank" rel="noreferrer">Start a project ↗</a>
          ) : (
            <a className="portfolio-contact" href="#contact">Contact</a>
          )}
        </div>
      </header>

      <div id="top" className="portfolio-page-title" aria-hidden="true">{pageTitle}</div>

      {sections.map((section, index) => {
        const key = `${section.type}-${index}`;
        switch (section.type) {
          case "hero":
            return (
              <section className={`portfolio-hero hero-${section.variant ?? "default"}`} key={key}>
                <p className="eyebrow">CREATIVE PORTFOLIO / @{creator.handle}</p>
                <h1>{creator.display_name}</h1>
                <p>{creator.bio || "A creator building thoughtful work."}</p>
                {whatsappUrl && <a className="button button-primary" href={whatsappUrl} target="_blank" rel="noreferrer">Start a project ↗</a>}
                {creator.website_url && <a className="portfolio-secondary-link" href={creator.website_url} target="_blank" rel="noreferrer">Visit website ↗</a>}
              </section>
            );
          case "featured_project":
            return featured ? (
              <section className={`portfolio-featured featured-${section.variant ?? "default"}`} key={key}>
                <div className="portfolio-featured-copy"><p className="eyebrow">FEATURED WORK</p><h2>{featured.title}</h2><p>{featured.summary}</p><Link href={`/creator/${creator.handle}/project/${featured.slug}`}>View project ↗</Link></div>
                {featured.coverUrl ? <img src={featured.coverUrl} alt="" /> : <div className="portfolio-featured-placeholder" aria-hidden="true" />}
              </section>
            ) : null;
          case "projects":
            return (
              <section className={`portfolio-projects projects-${section.variant ?? "grid"}`} id="work" key={key}>
                <div className="public-section-heading"><div><p className="eyebrow">SELECTED WORK</p><h2>Projects.</h2></div><span>{projects.length} published</span></div>
                <div className="portfolio-project-grid">
                  {projects.map((project) => (
                    <article className="portfolio-project" key={project.id}>
                      {project.coverUrl ? <img src={project.coverUrl} alt="" loading="lazy" /> : <div className="portfolio-project-placeholder" aria-hidden="true"><span>NO COVER</span></div>}
                      <div><span>{new Date(project.published_at ?? Date.now()).getFullYear()}</span><h3>{project.title}</h3><p>{project.summary}</p><Link href={`/creator/${creator.handle}/project/${project.slug}`}>View project ↗</Link></div>
                    </article>
                  ))}
                </div>
              </section>
            );
          case "about":
            return (
              <section className={`portfolio-about about-${section.variant ?? "split"}`} key={key}>
                <div>
                  <p className="eyebrow">ABOUT</p>
                  <h2>{creator.bio || "Thoughtful creative work, presented with clarity."}</h2>
                </div>
                <div className="portfolio-about-side">
                  <span>Creator</span>
                  <strong>{creator.display_name}</strong>
                  {creator.website_url && <a href={creator.website_url} target="_blank" rel="noreferrer">Visit website ↗</a>}
                </div>
              </section>
            );
          case "services":
            return (
              <section className="portfolio-services" key={key}>
                <p className="eyebrow">SERVICES</p><div className="service-lines"><span>Brand identity</span><span>Digital design</span><span>Motion & visual systems</span><span>Creative direction</span></div>
              </section>
            );
          case "contact":
            return (
              <section id="contact" className={`portfolio-contact-section contact-${section.variant ?? "simple"}`} key={key}>
                <p className="eyebrow">LET'S WORK TOGETHER</p><h2>Have a project in mind?</h2>
                {whatsappUrl && <a className="button button-primary" href={whatsappUrl} target="_blank" rel="noreferrer">Talk on WhatsApp ↗</a>}
              </section>
            );
          default:
            return null;
        }
      })}

      <footer className="public-creator-footer">
        <span>© {new Date().getFullYear()} {creator.display_name}</span>
        <Link href="/">Discover creators on Veyra</Link>
        <span>Powered by Timzee Corp</span>
      </footer>
    </main>
  );
}
