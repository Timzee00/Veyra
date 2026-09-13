import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";

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

const categories = ["Graphic Design", "Branding", "Photography", "UI / UX", "Motion", "Illustration", "Film", "Creative Direction"];

export default async function Home() {
  const { creators, projects, posts } = await getDiscoveryData();
  return (
    <main className="discover-shell">
      <header className="discover-nav">
        <Link className="brand" href="/" aria-label="Veyra home"><span className="brand-mark">V</span><span>VEYRA</span></Link>
        <nav className="discover-links" aria-label="Primary navigation"><Link href="/explore">Discover</Link><Link href="/blog">Journal</Link><Link href="/for-creators">For creators</Link></nav>
        <div className="discover-actions"><Link href="/login">Log in</Link><Link className="discover-cta" href="/signup">Become a creator ↗</Link></div>
      </header>

      <section className="discover-hero">
        <div className="discover-hero-copy">
          <p className="eyebrow">A HOME FOR CREATIVE WORK</p>
          <h1>Discover people who<br /><span>make things matter.</span></h1>
          <p>Explore independent creators, visual work, ideas and stories. Go from inspiration to the right creator in a few clicks.</p>
          <form className="discover-search" action="/explore" method="get"><label htmlFor="q">Search creators, projects, styles...</label><div><input id="q" name="q" type="search" placeholder="Try “branding”, “motion”, or a creator name" /><button type="submit">Search ↗</button></div></form>
        </div>
        <aside className="hero-discovery-card"><span>EXPLORE VEYRA</span><strong>Creators.<br />Projects.<br />Ideas.</strong><p>No visitor account required to browse the creative community.</p></aside>
      </section>

      <section className="category-strip" aria-label="Creative categories">{categories.map((category) => <Link href={`/explore?category=${encodeURIComponent(category)}`} key={category}>{category}</Link>)}</section>

      <section className="discover-section" aria-labelledby="creators-title">
        <div className="discover-heading"><div><p className="eyebrow">01 / PEOPLE</p><h2 id="creators-title">Creators to know.</h2></div><Link href="/explore?type=creators">View all creators ↗</Link></div>
        <div className="creator-discover-grid">{creators.map((creator) => <Link className="creator-discover-card" href={`/creator/${creator.handle}`} key={creator.id}><div className="creator-avatar">{creator.avatar_path ? <span aria-hidden="true">●</span> : <span>{creator.display_name.slice(0, 1).toUpperCase()}</span>}</div><div><h3>{creator.display_name}</h3><p>{creator.category || "Independent creator"}{creator.location ? ` · ${creator.location}` : ""}</p><small>@{creator.handle}</small></div>{creator.featured && <strong>Featured</strong>}</Link>)}{creators.length === 0 && <div className="discover-empty">Creator discovery will populate as creators publish their Veyra sites.</div>}</div>
      </section>

      <section className="discover-section" aria-labelledby="projects-title">
        <div className="discover-heading"><div><p className="eyebrow">02 / WORK</p><h2 id="projects-title">Work worth stopping for.</h2></div><Link href="/explore?type=projects">Explore projects ↗</Link></div>
        <div className="project-discover-grid">{projects.map((project) => <article className="discover-project-card" key={project.id}><div className="discover-project-visual"><span>PROJECT</span><strong>{project.title.slice(0, 1)}</strong></div><div className="discover-project-meta"><div><h3>{project.title}</h3><p>{project.summary || "View this project on Veyra."}</p></div>{project.creator && <Link href={`/creator/${project.creator.handle}/project/${project.slug}`}>View ↗</Link>}</div>{project.creator && <small>By {project.creator.display_name}</small>}</article>)}{projects.length === 0 && <div className="discover-empty">Published projects will appear here once creators share their work.</div>}</div>
      </section>

      <section className="discover-section split-discovery" aria-labelledby="posts-title">
        <div><p className="eyebrow">03 / CREATOR POSTS</p><h2 id="posts-title">See the thinking<br />behind the work.</h2><p>Launch notes, process updates, ideas and moments from creators across Veyra.</p><Link className="text-link" href="/explore?type=posts">Explore posts <span>↗</span></Link></div>
        <div className="post-discover-list">{posts.map((post, index) => <Link className="post-discover-row" href={post.creator ? `/creator/${post.creator.handle}/post/${post.slug}` : "#"} key={post.id}><span>0{index + 1}</span><div><small>{post.post_type.replace("_", " ")}</small><h3>{post.title}</h3><p>{post.excerpt}</p></div><span>↗</span></Link>)}{posts.length === 0 && <div className="discover-empty">Creator posts will surface here as the community grows.</div>}</div>
      </section>

      <section className="creator-cta" aria-labelledby="creator-cta-title"><p className="eyebrow">04 / CREATE YOUR PRESENCE</p><h2 id="creator-cta-title">Your work deserves<br /><span>its own place on the internet.</span></h2><p>Build a portfolio, publish projects, share updates and make it easier for the right people to discover your work and contact you.</p><div><Link className="button button-primary" href="/signup">Create your Veyra profile ↗</Link><Link className="button button-secondary" href="/for-creators">See how Veyra works</Link></div></section>

      <footer className="discover-footer"><span>© {new Date().getFullYear()} Veyra</span><div><Link href="/explore">Discover</Link><Link href="/blog">Journal</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link></div><span>Powered by Timzee Corp</span></footer>
    </main>
  );
}
