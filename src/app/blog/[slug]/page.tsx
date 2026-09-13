import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { blogPosts, getBlogPost } from "@/content/blog";

type BlogArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: BlogArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return { title: "Article not found" };
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      images: [{ url: post.image }],
    },
  };
}

export default async function BlogArticlePage({ params }: BlogArticlePageProps) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const currentIndex = blogPosts.findIndex((item) => item.slug === post.slug);
  const nextPost = blogPosts[(currentIndex + 1) % blogPosts.length];

  return (
    <main className="article-shell">
      <header className="blog-nav article-nav">
        <Link className="brand" href="/" aria-label="Veyra home">
          <span className="brand-mark">V</span>
          <span>VEYRA</span>
        </Link>
        <nav className="blog-nav-links" aria-label="Article navigation">
          <Link href="/blog">All stories</Link>
          <Link href="/#platform">Platform</Link>
          <Link href="/privacy">Privacy</Link>
        </nav>
        <Link className="nav-cta" href="/#get-started">Start creating</Link>
      </header>

      <article className="article-page">
        <div className="article-heading">
          <p className="post-kicker">{post.category}</p>
          <h1>{post.title}</h1>
          <p className="article-intro">{post.excerpt}</p>
          <div className="post-meta article-meta">
            <span>{post.date}</span>
            <span>{post.readTime}</span>
          </div>
        </div>

        <figure className="article-cover">
          <img src={post.image} alt="" />
        </figure>

        <div className="article-layout">
          <aside className="article-aside">
            <span>VEYRA JOURNAL</span>
            <span>Published {post.date}</span>
            <Link href="/blog">← Back to journal</Link>
          </aside>
          <div className="article-body">
            {post.body.map((section, index) => (
              <section key={`${post.slug}-${index}`}>
                {section.heading && <h2>{section.heading}</h2>}
                {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </section>
            ))}
          </div>
        </div>
      </article>

      <section className="next-story" aria-labelledby="next-story-title">
        <p className="eyebrow">KEEP READING</p>
        <h2 id="next-story-title">{nextPost.title}</h2>
        <Link className="button button-primary" href={`/blog/${nextPost.slug}`}>Read next <span>↗</span></Link>
      </section>

      <footer className="footer blog-footer">
        <span>© {new Date().getFullYear()} Veyra</span>
        <Link href="/">Back to Veyra</Link>
        <span>Powered by Timzee Corp</span>
      </footer>
    </main>
  );
}
