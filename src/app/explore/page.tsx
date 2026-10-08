import type { Metadata } from "next";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Discover creators and portfolios | Veyra",
  description: "Explore real published portfolios and creative work from designers, photographers, writers, developers, businesses, and more.",
};

const categories = ["All", "Design", "Photography", "Fashion", "Art", "Writing", "Technology", "Business", "Music", "Education", "Other"] as const;
type Search = { q?: string; category?: string; type?: string; before?: string; beforeId?: string; sort?: string };
type Creator = { id: string; handle: string; display_name: string; bio: string | null; category: string | null; location: string | null; featured: boolean; created_at: string };

function toQuery(filters: Record<string, string | null | undefined>) {
  const query = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => { if (value) query.set(key, value); });
  return "/explore" + (query.size ? "?" + query.toString() : "");
}

function categoryName(raw: string | null) {
  return raw?.trim() || "Independent creator";
}

export default async function ExplorePage({ searchParams }: { searchParams: Promise<Search> }) {
  const raw = await searchParams;
  const q = (raw.q ?? "").trim().slice(0, 80);
  const category = categories.find((item) => item.toLowerCase() === (raw.category ?? "").toLowerCase()) ?? "All";
  const type = ["all", "creators", "projects", "posts"].includes(raw.type ?? "") ? raw.type! : "all";
  const sort = raw.sort === "featured" ? "featured" : "newest";
  const before = raw.before && /^\d{4}-\d\d-\d\dT[\d:.]+Z$/.test(raw.before) ? raw.before : null;
  const beforeId = raw.beforeId && /^[a-f0-9-]{36}$/i.test(raw.beforeId) ? raw.beforeId : null;
  // PostgREST .or uses a filter grammar, not SQL parameters. Escape filter metacharacters.
  const safeTerm = q.replace(/[%_(),.\\]/g, " ").replace(/\s+/g, " ").trim();
  const term = "%" + safeTerm + "%";
  const supabase = await createSupabaseServerClient();

  const creatorQuery = supabase.from("creator_accounts")
    .select("id, handle, display_name, bio, category, location, featured, created_at")
    .eq("status", "active");
  if (category !== "All") creatorQuery.ilike("category", category);
  if (safeTerm) creatorQuery.or(`display_name.ilike.${term},handle.ilike.${term},bio.ilike.${term},category.ilike.${term}`);
  if (sort === "featured") creatorQuery.eq("featured", true);
  if (before && beforeId) creatorQuery.or(`created_at.lt.${before},and(created_at.eq.${before},id.lt.${beforeId})`);
  const projectQuery = supabase.from("projects")
    .select("id, slug, title, summary, published_at, creator_accounts!inner(handle, display_name)")
    .eq("published", true);
  const postQuery = supabase.from("posts")
    .select("id, slug, title, excerpt, post_type, published_at, creator_accounts!inner(handle, display_name)")
    .eq("published", true);
  if (safeTerm) {
    projectQuery.or(`title.ilike.${term},summary.ilike.${term}`);
    postQuery.or(`title.ilike.${term},excerpt.ilike.${term}`);
  }
  const showCreators = type === "all" || type === "creators";
  const showProjects = type === "all" || type === "projects";
  const showPosts = type === "all" || type === "posts";
  const [{ data: creators, error: creatorError }, { data: projects }, { data: posts }] = await Promise.all([
    showCreators ? creatorQuery.order("created_at", { ascending: false }).order("id", { ascending: false }).limit(25) : Promise.resolve({ data: [] as Creator[], error: null }),
    showProjects ? projectQuery.order("published_at", { ascending: false }).limit(12) : Promise.resolve({ data: [] }),
    showPosts ? postQuery.order("published_at", { ascending: false }).limit(8) : Promise.resolve({ data: [] }),
  ]);
  const creatorRows = (creators ?? []).slice(0, 24) as Creator[];
  const last = creatorRows.at(-1);
  const hasMore = (creators?.length ?? 0) > 24 && Boolean(last);
  const next = last ? toQuery({ q, category: category === "All" ? null : category, sort: sort === "newest" ? null : sort, type: type === "all" ? null : type, before: last.created_at, beforeId: last.id }) : null;
  type RowOwner = { handle: string; display_name: string } | { handle: string; display_name: string }[] | null;
  const projectsForView = (projects ?? []).map(item => ({ ...item, owner: Array.isArray(item.creator_accounts) ? item.creator_accounts[0] : item.creator_accounts as RowOwner }));
  const postsForView = (posts ?? []).map(item => ({ ...item, owner: Array.isArray(item.creator_accounts) ? item.creator_accounts[0] : item.creator_accounts as RowOwner }));

  return <main className="discover-shell veyra-discover">
    <header className="discover-nav"><Link className="brand" href="/"><span className="brand-mark">V</span><span>VEYRA</span></Link><nav className="discover-links"><Link href="/explore" aria-current="page">Discover</Link><Link href="/blog">Journal</Link><Link href="/for-creators">For creators</Link></nav><div className="discover-actions"><Link href="/login">Log in</Link><Link className="discover-cta" href="/signup">Create your space ↗</Link></div></header>

    <section className="discover-section discover-hero">
      <div className="discover-hero-orb" aria-hidden="true" />
      <p className="eyebrow">THE VEYRA DIRECTORY / HUMAN CREATIVITY</p>
      <h1 className="explore-title">Discover people.<br /><span>Explore their worlds.</span></h1>
      <p className="discover-lede">A home for remarkable work, independent ideas, and the people behind them. Find a creator, explore their website, or make the next connection.</p>
      <form className="discover-search explore-search" action="/explore" method="get" role="search">
        <label htmlFor="q">What inspires you?</label>
        <div><input id="q" name="q" defaultValue={q} type="search" maxLength={80} placeholder="Try a name, skill, craft, or industry…" /><button type="submit">Explore Veyra ↗</button></div>
      </form>
      <div className="discover-category-strip" aria-label="Creative fields">
        {categories.map(item => <Link key={item} className={category === item ? "selected" : ""} href={toQuery({ q, category: item === "All" ? null : item, type: type === "all" ? null : type, sort: sort === "newest" ? null : sort })}>{item}</Link>)}
      </div>
    </section>

    <section className="discover-section discover-content" aria-label="Explore published work">
      <div className="discover-top-row"><div><p className="eyebrow">CURATED BY PEOPLE / DISCOVERED BY YOU</p><h2>Spaces worth exploring.</h2><p>Every site here belongs to a real published creator. Editorially featured spaces are marked, not sold as popularity.</p></div><Link href="/signup" className="discover-cta">Build your portfolio ↗</Link></div>
      <div className="discover-filters" aria-label="Discovery options">
        {(["all","creators","projects","posts"] as const).map(item=><Link key={item} className={item===type?"active":""} href={toQuery({q,category:category==="All"?null:category,type:item==="all"?null:item,sort:sort==="newest"?null:sort})}>{item==="all"?"All work":item==="creators"?"Websites & creators":item==="projects"?"Projects":"Stories"}</Link>)}
        {showCreators && <div className="discover-sort"><Link className={sort==="newest"?"active":""} href={toQuery({q,category:category==="All"?null:category,type:type==="all"?null:type})}>Recently joined</Link><Link className={sort==="featured"?"active":""} href={toQuery({q,category:category==="All"?null:category,type:type==="all"?null:type,sort:"featured"})}>Editor's picks</Link></div>}
      </div>

      {showCreators && <section className="discover-group" aria-label="Published creator websites">
        <div className="discover-group-heading"><h3>Creator websites</h3><span>{creatorRows.length} shown{hasMore?" · more available":""}</span></div>
        {creatorError && <p className="discover-empty" role="alert">Creator websites are temporarily unavailable. Please try again.</p>}
        {!creatorError && creatorRows.length === 0 && <div className="discover-empty"><h3>No published creators matched.</h3><p>Try another creative field or search term. New creators appear here after publishing their websites.</p><Link href="/explore">Explore everyone →</Link></div>}
        <div className="discover-site-grid">{creatorRows.map((creator, index) => <article className="discover-site-card" key={creator.id}>
          <Link className={`discover-site-art discover-art-${index%6}`} href={`/creator/${encodeURIComponent(creator.handle)}`} aria-label={`Visit ${creator.display_name}'s website`}>
            <span className="site-art-eyebrow">VEYRA / CREATOR WEBSITE</span>
            <span className="site-art-monogram">{creator.display_name.slice(0,1).toUpperCase()}</span>
            <strong>{creator.display_name}</strong>
            <span className="site-art-bottom">{categoryName(creator.category)}</span>
          </Link>
          <div className="discover-site-details"><div><p className="site-category">{categoryName(creator.category)}{creator.location?` · ${creator.location}`:""}</p><h4>{creator.display_name}</h4>{creator.bio && <p className="site-description">{creator.bio}</p>}</div>{creator.featured && <span className="editor-pick">Editor's pick</span>}</div>
          <div className="discover-site-actions"><Link href={`/creator/${encodeURIComponent(creator.handle)}`}>Visit website ↗</Link><Link href={`/u/${encodeURIComponent(creator.handle)}`}>View profile →</Link></div>
        </article>)}</div>
        {hasMore && next && <div className="discover-more"><Link href={next}>Explore more creators →</Link></div>}
      </section>}

      {showProjects && <section className="discover-group" aria-label="Recent projects"><div className="discover-group-heading"><h3>Fresh creative work</h3><span>Recently published</span></div><div className="project-discover-grid">{projectsForView.map(project => <article className="discover-project-card" key={project.id}><div className="discover-project-visual"><span>PROJECT</span><strong>{project.title.slice(0,1)}</strong></div><div className="discover-project-meta"><div><h4>{project.title}</h4><p>{project.summary}</p></div>{project.owner && !Array.isArray(project.owner) && <Link href={`/creator/${project.owner.handle}/project/${project.slug}`}>View project ↗</Link>}</div>{project.owner && !Array.isArray(project.owner) && <small>By {project.owner.display_name}</small>}</article>)}</div>{projectsForView.length === 0 && <p className="discover-empty">Published projects will appear here as creators share their work.</p>}</section>}
      {showPosts && <section className="discover-group" aria-label="Creator stories"><div className="discover-group-heading"><h3>Stories from the community</h3><span>Insights & updates</span></div><div className="post-discover-list">{postsForView.map(post=><Link key={post.id} className="post-discover-row" href={post.owner && !Array.isArray(post.owner)?`/creator/${post.owner.handle}/post/${post.slug}`:"/explore"}><span>JOURNAL</span><div><small>{post.post_type}</small><h4>{post.title}</h4><p>{post.excerpt}</p></div><span>↗</span></Link>)}</div>{postsForView.length===0 && <p className="discover-empty">Creator stories will appear here after publication.</p>}</section>}
    </section>
    <section className="discover-section discover-outro"><p className="eyebrow">YOUR WORK BELONGS HERE</p><h2>There's room for your story, too.</h2><p>Artists, teachers, makers, entrepreneurs, designers and dreamers — build a space that feels like you.</p><Link href="/signup" className="discover-cta">Create your Veyra space ↗</Link></section>
    <footer className="discover-footer"><span>© {new Date().getFullYear()} Veyra</span><div><Link href="/">Home</Link><Link href="/blog">Journal</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link></div><span>Powered by Timzee Corp</span></footer>
  </main>;
}
