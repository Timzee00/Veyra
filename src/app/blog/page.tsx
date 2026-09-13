import type { Metadata } from "next";
import Link from "next/link";
import { blogPosts, featuredPost } from "@/content/blog";

export const metadata: Metadata = {
  title: "Blog",
  description: "Veyra updates, creator notes, product thinking, and build logs.",
};

export default function BlogPage() {
  const otherPosts = blogPosts.filter((post) => post.slug !== featuredPost.slug);

  return (
    <main className="blog-shell">
      <header className="blog-nav">
        <Link className="brand" href="/" aria-label="Veyra home">
          <span className="brand-mark">V</span>
          <span>VEYRA</span>
        </Link>
        <nav className="blog-nav-links" aria-label="Blog navigation">
          <Link href="/">Platform</Link>
          <Link href="/blog" aria-current="page">Blog</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
        </nav>
        <Link className="nav-cta" href="/#get-started">Start creating</Link>
      </header>

      <section className="blog-hero">
        <div>
          <p className="eyebrow">VEYRA / JOURNAL</p>
          <h1>Ideas, updates &<br /><span>the work behind Veyra.</span></h1>
          <p>
            Product updates, creator advice, design thinking, and build notes from the
            team shaping Veyra into a serious home for creative work.
          </p>
        </div>
        <div className="blog-hero-meta">
          <span>Latest</span>
          <strong>{featuredPost.date}</strong>
          <small>{blogPosts.length} stories published</small>
        </div>
      </section>

      <section className="featured-post" aria-labelledby="featured-title">
        <Link className="featured-image" href={`/blog/${featuredPost.slug}`} aria-label={`Read ${featuredPost.title}`}>
          <img src={featuredPost.image} alt="" />
          <span className="image-overlay-label">Featured story ↗</span>
        </Link>
        <div className="featured-copy">
          <p className="post-kicker">{featuredPost.category}</p>
          <h2 id="featured-title"><Link href={`/blog/${featuredPost.slug}`}>{featuredPost.title}</Link></h2>
          <p>{featuredPost.excerpt}</p>
          <div className="post-meta">
            <span>{featuredPost.date}</span>
            <span>{featuredPost.readTime}</span>
          </div>
          <Link className="text-link" href={`/blog/${featuredPost.slug}`}>Read the story <span>↗</span></Link>
        </div>
      </section>

      <section className="blog-grid-section" aria-labelledby="all-posts-title">
        <div className="section-heading-row">
          <div>
            <p className="eyebrow">02 / ARCHIVE</p>
            <h2 id="all-posts-title">More from Veyra.</h2>
          </div>
          <span>Insights / Product / Build</span>
        </div>

        <div className="blog-grid">
          {otherPosts.map((post) => (
            <article className="blog-card" key={post.slug}>
              <Link className="blog-card-image" href={`/blog/${post.slug}`} aria-label={`Read ${post.title}`}>
                <img src={post.image} alt="" />
              </Link>
              <div className="blog-card-body">
                <div className="post-meta"><span>{post.category}</span><span>{post.readTime}</span></div>
                <h3><Link href={`/blog/${post.slug}`}>{post.title}</Link></h3>
                <p>{post.excerpt}</p>
                <Link className="card-read" href={`/blog/${post.slug}`}>Read article <span>↗</span></Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="blog-subscribe" aria-labelledby="subscribe-title">
        <div>
          <p className="eyebrow">03 / KEEP UP</p>
          <h2 id="subscribe-title">Get the useful stuff.<br /><span>Skip the noise.</span></h2>
        </div>
        <form className="subscribe-form" action="#" method="post">
          <label htmlFor="blog-email">Email address</label>
          <div>
            <input id="blog-email" name="email" type="email" placeholder="you@example.com" autoComplete="email" required />
            <button type="submit">Subscribe ↗</button>
          </div>
          <small>Optional marketing updates. Manage your choices at any time.</small>
        </form>
      </section>

      <footer className="footer blog-footer">
        <span>© {new Date().getFullYear()} Veyra</span>
        <Link href="/">Back to Veyra</Link>
        <span>Powered by Timzee Corp</span>
      </footer>
    </main>
  );
}
