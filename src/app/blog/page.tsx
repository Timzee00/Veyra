import type { Metadata } from "next";
import Link from "next/link";
import styles from "./blog.module.css";
import { blogPosts, featuredPost } from "@/content/blog";

export const metadata: Metadata = {
  title: "Blog",
  description: "Veyra updates, creator notes, product thinking, and build logs.",
};

export default function BlogPage() {
  const otherPosts = blogPosts.filter((post) => post.slug !== featuredPost.slug);

  return (
    <main className={styles.shell}>
      <header className={styles.nav}>
        <Link className="brand" href="/" aria-label="Veyra home">
          <span className="brand-mark">V</span>
          <span>VEYRA</span>
        </Link>
        <nav className={styles.links} aria-label="Blog navigation">
          <Link href="/">Platform</Link>
          <Link href="/blog" aria-current="page">Blog</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
        </nav>
        <Link className="nav-cta" href="/#get-started">Start creating</Link>
      </header>

      <section className={styles.hero}>
        <div>
          <p className="eyebrow">VEYRA / JOURNAL</p>
          <h1>Ideas, updates &<br /><span>the work behind Veyra.</span></h1>
          <p>
            Product updates, creator advice, design thinking, and build notes from the
            team shaping Veyra into a serious home for creative work.
          </p>
        </div>
        <div className={styles.heroMeta}>
          <span>Latest</span>
          <strong>{featuredPost.date}</strong>
          <small>{blogPosts.length} stories published</small>
        </div>
      </section>

      <section className={styles.featured} aria-labelledby="featured-title">
        <Link className={styles.featuredImage} href={`/blog/${featuredPost.slug}`} aria-label={`Read ${featuredPost.title}`}>
          <img src={featuredPost.image} alt="" />
          <span className={styles.overlay}>Featured story ↗</span>
        </Link>
        <div className={styles.featuredCopy}>
          <p className={styles.kicker}>{featuredPost.category}</p>
          <h2 id="featured-title"><Link href={`/blog/${featuredPost.slug}`}>{featuredPost.title}</Link></h2>
          <p>{featuredPost.excerpt}</p>
          <div className={styles.meta}>
            <span>{featuredPost.date}</span>
            <span>{featuredPost.readTime}</span>
          </div>
          <Link className={styles.textLink} href={`/blog/${featuredPost.slug}`}>Read the story <span>↗</span></Link>
        </div>
      </section>

      <section className={styles.archive} aria-labelledby="all-posts-title">
        <div className={styles.headingRow}>
          <div>
            <p className="eyebrow">02 / ARCHIVE</p>
            <h2 id="all-posts-title">More from Veyra.</h2>
          </div>
          <span>Insights / Product / Build</span>
        </div>

        <div className={styles.grid}>
          {otherPosts.map((post) => (
            <article className={styles.card} key={post.slug}>
              <Link className={styles.cardImage} href={`/blog/${post.slug}`} aria-label={`Read ${post.title}`}>
                <img src={post.image} alt="" />
              </Link>
              <div className={styles.cardBody}>
                <div className={styles.meta}><span>{post.category}</span><span>{post.readTime}</span></div>
                <h3><Link href={`/blog/${post.slug}`}>{post.title}</Link></h3>
                <p>{post.excerpt}</p>
                <Link className={styles.cardRead} href={`/blog/${post.slug}`}>Read article <span>↗</span></Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.subscribe} aria-labelledby="subscribe-title">
        <div>
          <p className="eyebrow">03 / KEEP UP</p>
          <h2 id="subscribe-title">Get the useful stuff.<br /><span>Skip the noise.</span></h2>
        </div>
        <form className={styles.form} action="#" method="post">
          <label htmlFor="blog-email">Email address</label>
          <div>
            <input id="blog-email" name="email" type="email" placeholder="you@example.com" autoComplete="email" required />
            <button type="submit">Subscribe ↗</button>
          </div>
          <small>Optional marketing updates. Manage your choices at any time.</small>
        </form>
      </section>

      <footer className={`${styles.footer}`}>
        <span>© {new Date().getFullYear()} Veyra</span>
        <Link href="/">Back to Veyra</Link>
        <span>Powered by Timzee Corp</span>
      </footer>
    </main>
  );
}
