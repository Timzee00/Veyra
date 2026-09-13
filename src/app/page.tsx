const stats = [
  { value: "∞", label: "Ways to present your work" },
  { value: "01", label: "Portfolio, built around you" },
  { value: "24/7", label: "Your work stays discoverable" },
];

const capabilities = [
  {
    number: "01",
    title: "Publish work that feels like you",
    text: "Projects, case studies, motion, galleries and visual stories live inside a portfolio system that keeps your identity intact.",
  },
  {
    number: "02",
    title: "Choose a better canvas",
    text: "Switch between thoughtfully designed templates without rebuilding your content. Your data stays yours; the presentation can evolve.",
  },
  {
    number: "03",
    title: "Turn attention into opportunity",
    text: "Likes, comments, shares, analytics, enquiries and WhatsApp actions connect creative work to real conversations.",
  },
];

const templateLabels = [
  "Minimal",
  "Editorial",
  "Cinema",
  "Immersive",
  "Studio",
  "Agency",
];

export default function Home() {
  return (
    <main className="site-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <nav className="nav-wrap" aria-label="Primary navigation">
        <a className="brand" href="#top" aria-label="Veyra home">
          <span className="brand-mark">V</span>
          <span>VEYRA</span>
        </a>
        <div className="nav-links">
          <a href="#platform">Platform</a>
          <a href="#templates">Templates</a>
          <a href="#creators">Creators</a>
          <a href="#pricing">Pricing</a>
        </div>
        <a className="nav-cta" href="#get-started">Start creating</a>
      </nav>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">THE CREATIVE PORTFOLIO PLATFORM</p>
          <h1>
            Your work,
            <span> unmistakably yours.</span>
          </h1>
          <p className="hero-text">
            Veyra gives modern creators a premium place to publish projects,
            tell stories, build reputation and turn attention into opportunity.
          </p>
          <div className="hero-actions" id="get-started">
            <a className="button button-primary" href="#platform">Explore Veyra <span>↗</span></a>
            <a className="button button-secondary" href="#templates">View templates</a>
          </div>
          <div className="hero-note">
            <span className="pulse-dot" />
            Built to grow from portfolio to creator ecosystem.
          </div>
        </div>

        <div className="hero-art" aria-label="Veyra creative workspace preview">
          <div className="art-orbit orbit-a" />
          <div className="art-orbit orbit-b" />
          <div className="hero-card hero-card-back">
            <span>CREATIVE / 001</span>
            <strong>Make work<br />worth remembering.</strong>
          </div>
          <div className="hero-card hero-card-front">
            <div className="card-topline">
              <span>VEYRA / PORTFOLIO</span>
              <span>01 — 06</span>
            </div>
            <div className="visual-block">
              <div className="visual-noise" />
              <div className="visual-word">FORM</div>
            </div>
            <div className="card-footer">
              <div>
                <small>PROJECT</small>
                <p>Identity / Motion / Digital</p>
              </div>
              <div className="mini-arrow">↗</div>
            </div>
          </div>
        </div>
      </section>

      <section className="stats-band" aria-label="Veyra highlights">
        {stats.map((item) => (
          <div className="stat" key={item.label}>
            <strong>{item.value}</strong>
            <span>{item.label}</span>
          </div>
        ))}
      </section>

      <section className="section" id="platform">
        <div className="section-intro">
          <p className="eyebrow">01 / PLATFORM</p>
          <h2>More than a portfolio.<br />A system for your creative career.</h2>
        </div>
        <div className="capability-grid">
          {capabilities.map((item) => (
            <article className="capability" key={item.number}>
              <span className="item-number">{item.number}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
              <span className="line-arrow">↗</span>
            </article>
          ))}
        </div>
      </section>

      <section className="template-section" id="templates">
        <div className="template-copy">
          <p className="eyebrow">02 / PRESENTATION</p>
          <h2>One body of work.<br />Many ways to make it unforgettable.</h2>
          <p>
            Veyra templates are presentation systems, not skins. Switch the
            composition while your projects, profile, services and social links stay intact.
          </p>
          <div className="template-pills">
            {templateLabels.map((label) => <span key={label}>{label}</span>)}
          </div>
        </div>
        <div className="template-stack" aria-hidden="true">
          <div className="template-sheet sheet-one"><span>IMMERSIVE</span><b>01</b></div>
          <div className="template-sheet sheet-two"><span>EDITORIAL</span><b>02</b></div>
          <div className="template-sheet sheet-three"><span>CINEMA</span><b>03</b></div>
        </div>
      </section>

      <section className="creator-section" id="creators">
        <div>
          <p className="eyebrow">03 / CREATOR CONTROL</p>
          <h2>You stay in control.<br />Veyra handles the infrastructure.</h2>
        </div>
        <div className="creator-details">
          <p>
            From profile settings and project publishing to verification, support,
            analytics, moderation, privacy controls and account security, Veyra is
            designed as a platform — not a collection of disconnected pages.
          </p>
          <div className="detail-row"><span>01</span><strong>Identity & permissions</strong><em>Built in</em></div>
          <div className="detail-row"><span>02</span><strong>Privacy & consent</strong><em>Built in</em></div>
          <div className="detail-row"><span>03</span><strong>Verification & reputation</strong><em>Built in</em></div>
          <div className="detail-row"><span>04</span><strong>Support & account recovery</strong><em>Built in</em></div>
        </div>
      </section>

      <section className="closing" id="pricing">
        <p className="eyebrow">04 / NEXT</p>
        <h2>Build your world.<br /><span>Then make it bigger.</span></h2>
        <a className="button button-primary" href="#top">Enter Veyra <span>↗</span></a>
        <p className="powered">Powered by Timzee Corp</p>
      </section>

      <footer className="footer">
        <span>© {new Date().getFullYear()} Veyra</span>
        <span>Independent creator infrastructure</span>
        <span>Powered by Timzee Corp</span>
      </footer>
    </main>
  );
}
