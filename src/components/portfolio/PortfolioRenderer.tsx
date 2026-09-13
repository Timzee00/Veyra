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

  return (
    <main className={`portfolio-shell template-${site.template_id}`}>
      <header className="portfolio-nav">
        <Link className="brand" href="/" aria-label="Veyra home"><span className="brand-mark">V</span><span>VEYRA</span></Link>
        <div className="portfolio-nav-name">{creator.display_name}</div>
        <Link className="portfolio-contact" href={whatsappUrl ?? "#work"} target={whatsappUrl ? "_blank" : undefined}>Start a project ↗</Link>
      </header>

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
              </section>
            );
          case "featured_project":
            return featured ? (
              <section className={`portfolio-featured featured-${section.variant ?? "default"}`} key={key}>
                <div className="portfolio-featured-copy"><p className="eyebrow">FEATURED WORK</p><h2>{featured.title}</h2><p>{featured.summary}</p><Link href={`/creator/${creator.handle}/project/${featured.slug}`}>View project ↗</Link></div>
                {featured.coverUrl && <img src={featured.coverUrl} alt="" />}
              </section>
            ) : null;
          case "projects":
            return (
              <section className={`portfolio-projects projects-${section.variant ?? "grid"}`} id="work" key={key}>
                <div className="public-section-heading"><div><p className="eyebrow">SELECTED WORK</p><h2>Projects.</h2></div><span>{projects.length} published</span></div>
                <div className="portfolio-project-grid">
                  {projects.map((project) => (
                    <article className="portfolio-project" key={project.id}>
                      {project.coverUrl ? <img src={project.coverUrl} alt="" /> : <div className="portfolio-project-placeholder" aria-hidden="true"><span>VEYRA</span></div>}
                      <div><span>{new Date(project.published_at ?? Date.now()).getFullYear()}</span><h3>{project.title}</h3><p>{project.summary}</p><Link href={`/creator/${creator.handle}/project/${project.slug}`}>View project ↗</Link></div>
                    </article>
                  ))}
                </div>
              </section>
            );
          case "about":
            return (
              <section className={`portfolio-about about-${section.variant ?? "split"}`} key={key}>
                <p className="eyebrow">ABOUT</p><h2>{creator.bio || "Thoughtful creative work, presented with clarity."}</h2>
                {creator.website_url && <a href={creator.website_url} target="_blank" rel="noreferrer">Visit website ↗</a>}
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
              <section className={`portfolio-contact-section contact-${section.variant ?? "simple"}`} key={key}>
                <p className="eyebrow">LET'S WORK TOGETHER</p><h2>Have a project in mind?</h2>
                {whatsappUrl && <a className="button button-primary" href={whatsappUrl} target="_blank" rel="noreferrer">Talk on WhatsApp ↗</a>}
              </section>
            );
          default:
            return null;
        }
      })}

      <footer className="public-creator-footer"><span>© {new Date().getFullYear()} {creator.display_name}</span><span>Built with Veyra</span><span>Powered by Timzee Corp</span></footer>
    </main>
  );
}
