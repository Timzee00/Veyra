import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { VEYRA } from "@/platform/brand/identity";

type Creator = { id: string; handle: string; display_name: string; bio: string | null; category: string | null; location: string | null; featured: boolean; avatar_path: string | null };
type Project = { id: string; slug: string; title: string; summary: string | null; published_at: string | null; creator: { handle: string; display_name: string } | null };
type Post = { id: string; slug: string; title: string; excerpt: string | null; post_type: string; published_at: string | null; creator: { handle: string; display_name: string } | null };

async function getDiscoveryData() {
  try {
    const supabase = await createSupabaseServerClient();
    const [{ data: creators }, { data: projects }, { data: posts }] = await Promise.all([
      supabase.from("creator_accounts").select("id, handle, display_name, bio, category, location, featured, avatar_path").eq("status", "active").order("featured", { ascending: false }).order("created_at", { ascending: false }).limit(8),
      supabase.from("projects").select("id, slug, title, summary, published_at, creator_accounts!inner(handle, display_name)").eq("published", true).order("published_at", { ascending: false }).limit(8),
      supabase.from("posts").select("id, slug, title, excerpt, post_type, published_at, creator_accounts!inner(handle, display_name)").eq("published", true).order("published_at", { ascending: false }).limit(6),
    ]);
    return {
      creators: (creators ?? []) as Creator[],
      projects: (projects ?? []).map((item) => ({ ...item, creator: Array.isArray(item.creator_accounts) ? item.creator_accounts[0] : item.creator_accounts })) as Project[],
      posts: (posts ?? []).map((item) => ({ ...item, creator: Array.isArray(item.creator_accounts) ? item.creator_accounts[0] : item.creator_accounts })) as Post[],
    };
  } catch {
    return { creators: [] as Creator[], projects: [] as Project[], posts: [] as Post[] };
  }
}

const categories = ["Design", "Photography", "Fashion", "Art", "Writing", "Technology", "Business", "Music", "Education"];

export default async function Home() {
  const { creators, projects, posts } = await getDiscoveryData();
  return (
    <main className="discover-shell">
      <header className="discover-nav">
        <Link className="brand" href="/" aria-label="Veyra home"><span className="brand-mark">V</span><span>VEYRA</span></Link>
        <nav className="discover-links" aria-label="Primary navigation"><Link href="/explore">Discover</Link><Link href="/studio">Studio</Link><Link href="/blog">Journal</Link><Link href="/for-creators">For creators</Link></nav>
        <div className="discover-actions"><Link href="/login">Log in</Link><Link className="discover-cta" href="/signup">Become a creator ↗</Link></div>
      </header>

      <section className="discover-hero">
        <div className="discover-hero-copy">
          <p className="eyebrow">THE CREATIVE PLATFORM · BY TIMZEE CORP</p>
          <h1>Imagine it.<br /><span>Build it. Own it.</span></h1>
          <p>{VEYRA.summary} Build your own space with Veyra Studio, or explore the creators shaping what comes next.</p>
          <div className="veyra-home-hero-actions"><Link className="button button-primary" href="/signup">Start creating <span aria-hidden="true">↗</span></Link><Link className="button button-secondary" href="/studio">Explore Veyra Studio</Link></div>
          <form className="discover-search" action="/explore" method="get"><label htmlFor="q">Search creators, projects, styles...</label><div><input id="q" name="q" type="search" placeholder="Try “branding”, “motion”, or a creator name" /><button type="submit">Search ↗</button></div></form>
        </div>
        <aside className="hero-discovery-card"><span>VEYRA / THE CREATIVE PLATFORM</span><strong>Create.<br />Publish.<br />Belong.</strong><p>Visual website tools for creators, with a public community anyone can explore.</p></aside>
      </section>

      <section className="category-strip" aria-label="Creative categories">{categories.map((category) => <Link href={`/explore?category=${encodeURIComponent(category)}`} key={category}>{category}</Link>)}</section>

      <section className="veyra-home-studio" aria-labelledby="studio-title">
        <div className="veyra-home-studio-intro"><p className="eyebrow">INTRODUCING VEYRA STUDIO</p><h2 id="studio-title">Your ideas need<br /><span>room to become real.</span></h2><p>Build and refine a multi-page creative website. Start with editable elements, save your own layouts, preview across screen sizes, and control what becomes public.</p><Link href="/studio">Discover the studio <span aria-hidden="true">↗</span></Link></div>
        <div className="veyra-home-studio-features">
          <article><span>01 / BUILD</span><h3>Pages with purpose.</h3><p>Arrange and edit headlines, images, questions, calls to action and ready-made sections.</p></article>
          <article><span>02 / REUSE</span><h3>Your sections, saved.</h3><p>Keep useful content in a private section library and reuse it across your pages.</p></article>
          <article><span>03 / PUBLISH</span><h3>Stay in control.</h3><p>Save drafts privately, review your page, publish deliberately, and restore an earlier published version.</p></article>
        </div>
      </section>

      <section className="discover-section" aria-labelledby="creators-title">
        <div className="discover-heading"><div><p className="eyebrow">01 / PEOPLE</p><h2 id="creators-title">Creators to know.</h2></div><Link href="/explore?type=creators">View all creators ↗</Link></div>
        <div className="creator-discover-grid">{creators.map((creator) => <Link className="creator-discover-card" href={`/u/${creator.handle}`} key={creator.id}><div className="creator-avatar">{creator.avatar_path ? <span aria-hidden="true">●</span> : <span>{creator.display_name.slice(0, 1).toUpperCase()}</span>}</div><div><h3>{creator.display_name}</h3><p>{creator.category || "Independent creator"}{creator.location ? ` · ${creator.location}` : ""}</p><small>@{creator.handle}</small></div>{creator.featured && <strong>Editor’s pick</strong>}</Link>)}{creators.length === 0 && <div className="discover-empty">Creator discovery will populate as creators publish their Veyra sites.</div>}</div>
      </section>

      <section className="discover-section" aria-labelledby="projects-title">
        <div className="discover-heading"><div><p className="eyebrow">02 / WORK</p><h2 id="projects-title">Work worth stopping for.</h2></div><Link href="/explore?type=projects">Explore projects ↗</Link></div>
        <div className="project-discover-grid">{projects.map((project) => <article className="discover-project-card" key={project.id}><div className="discover-project-visual"><span>PROJECT</span><strong>{project.title.slice(0, 1)}</strong></div><div className="discover-project-meta"><div><h3>{project.title}</h3><p>{project.summary || "View this project on Veyra."}</p></div>{project.creator && <Link href={`/creator/${project.creator.handle}/project/${project.slug}`}>View ↗</Link>}</div>{project.creator && <small>By {project.creator.display_name}</small>}</article>)}{projects.length === 0 && <div className="discover-empty">Published projects will appear here once creators share their work.</div>}</div>
      </section>

      <section className="discover-section split-discovery" aria-labelledby="posts-title">
        <div><p className="eyebrow">03 / CREATOR POSTS</p><h2 id="posts-title">See the thinking<br />behind the work.</h2><p>Launch notes, process updates, ideas and moments from creators across Veyra.</p><Link className="text-link" href="/explore?type=posts">Explore posts <span>↗</span></Link></div>
        <div className="post-discover-list">{posts.map((post, index) => <Link className="post-discover-row" href={post.creator ? `/creator/${post.creator.handle}/post/${post.slug}` : "#"} key={post.id}><span>0{index + 1}</span><div><small>{post.post_type.replace("_", " ")}</small><h3>{post.title}</h3><p>{post.excerpt}</p></div><span>↗</span></Link>)}{posts.length === 0 && <div className="discover-empty">Creator posts will surface here as the community grows.</div>}</div>
      </section>

      <section className="creator-cta" aria-labelledby="creator-cta-title"><p className="eyebrow">04 / CREATE YOUR PRESENCE</p><h2 id="creator-cta-title">Your work deserves<br /><span>its own place on the internet.</span></h2><p>{VEYRA.tagline} Create an online presence you can refine, publish and share with confidence.</p><div><Link className="button button-primary" href="/signup">Create your Veyra profile ↗</Link><Link className="button button-secondary" href="/for-creators">See how Veyra works</Link></div></section>

      <footer className="discover-footer"><span>© {new Date().getFullYear()} Veyra</span><div><Link href="/explore">Discover</Link><Link href="/blog">Journal</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link></div><span>Powered by Timzee Corp</span></footer>
    </main>
  );
}
