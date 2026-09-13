import type { Metadata } from "next";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Discover", description: "Search creators and creative work across Veyra." };

export default async function ExplorePage({ searchParams }: { searchParams: Promise<{ q?: string; category?: string; type?: string }> }) {
  const params = await searchParams;
  const q = (params.q ?? "").trim();
  const category = (params.category ?? "").trim();
  const type = params.type ?? "all";
  const search = `%${q}%`;

  const supabase = await createSupabaseServerClient();
  const creatorQuery = supabase.from("creator_accounts").select("id, handle, display_name, bio, category, location, featured").eq("status", "active");
  const projectQuery = supabase.from("projects").select("id, slug, title, summary, published_at, creator_accounts!inner(handle, display_name)").eq("published", true);
  const postQuery = supabase.from("posts").select("id, slug, title, excerpt, post_type, published_at, creator_accounts!inner(handle, display_name)").eq("published", true);

  if (q) {
    creatorQuery.or(`display_name.ilike.${search},handle.ilike.${search},bio.ilike.${search},category.ilike.${search}`);
    projectQuery.or(`title.ilike.${search},summary.ilike.${search}`);
    postQuery.or(`title.ilike.${search},excerpt.ilike.${search}`);
  }
  if (category) creatorQuery.ilike("category", `%${category}%`);

  const [{ data: creators }, { data: projects }, { data: posts }] = await Promise.all([
    type === "projects" || type === "posts" ? Promise.resolve({ data: [] }) : creatorQuery.order("featured", { ascending: false }).order("created_at", { ascending: false }).limit(30),
    type === "creators" || type === "posts" ? Promise.resolve({ data: [] }) : projectQuery.order("published_at", { ascending: false }).limit(30),
    type === "creators" || type === "projects" ? Promise.resolve({ data: [] }) : postQuery.order("published_at", { ascending: false }).limit(30),
  ]);

  const projectRows = (projects ?? []).map((item) => ({ ...item, creator: Array.isArray(item.creator_accounts) ? item.creator_accounts[0] : item.creator_accounts })) as Array<{ id:string; slug:string; title:string; summary:string|null; published_at:string|null; creator:{handle:string;display_name:string}|null }>;
  const postRows = (posts ?? []).map((item) => ({ ...item, creator: Array.isArray(item.creator_accounts) ? item.creator_accounts[0] : item.creator_accounts })) as Array<{ id:string; slug:string; title:string; excerpt:string|null; post_type:string; published_at:string|null; creator:{handle:string;display_name:string}|null }>;

  return (
    <main className="discover-shell">
      <header className="discover-nav"><Link className="brand" href="/"><span className="brand-mark">V</span><span>VEYRA</span></Link><nav className="discover-links"><Link href="/explore" aria-current="page">Discover</Link><Link href="/blog">Journal</Link><Link href="/for-creators">For creators</Link></nav><div className="discover-actions"><Link href="/login">Log in</Link><Link className="discover-cta" href="/signup">Become a creator ↗</Link></div></header>
      <section className="discover-section" style={{paddingTop:"80px"}}>
        <p className="eyebrow">VEYRA / DISCOVER</p><h1 className="explore-title">Find your next<br /><span>creative reference.</span></h1>
        <form className="discover-search explore-search" action="/explore" method="get"><label htmlFor="q">Search the community</label><div><input id="q" name="q" defaultValue={q} type="search" placeholder="Creator, project, style, category..."/><button type="submit">Search ↗</button></div></form>
        <div className="explore-filters"><Link className={!type||type==="all"?"active":""} href={`/explore${q?`?q=${encodeURIComponent(q)}`:""}`}>All</Link><Link className={type==="creators"?"active":""} href={`/explore?type=creators${q?`&q=${encodeURIComponent(q)}`:""}`}>Creators</Link><Link className={type==="projects"?"active":""} href={`/explore?type=projects${q?`&q=${encodeURIComponent(q)}`:""}`}>Projects</Link><Link className={type==="posts"?"active":""} href={`/explore?type=posts${q?`&q=${encodeURIComponent(q)}`:""}`}>Posts</Link></div>
      </section>

      {(type === "all" || type === "creators") && <section className="discover-section explore-results"><div className="discover-heading"><div><p className="eyebrow">CREATORS</p><h2>People making the work.</h2></div><span>{creators?.length ?? 0} results</span></div><div className="creator-discover-grid">{(creators ?? []).map((creator) => <Link className="creator-discover-card" href={`/creator/${creator.handle}`} key={creator.id}><div className="creator-avatar"><span>{creator.display_name.slice(0,1).toUpperCase()}</span></div><div><h3>{creator.display_name}</h3><p>{creator.category || "Independent creator"}{creator.location ? ` · ${creator.location}` : ""}</p><small>@{creator.handle}</small></div>{creator.featured && <strong>Featured</strong>}</Link>)}</div></section>}
      {(type === "all" || type === "projects") && <section className="discover-section explore-results"><div className="discover-heading"><div><p className="eyebrow">PROJECTS</p><h2>Recent creative work.</h2></div><span>{projectRows.length} results</span></div><div className="project-discover-grid">{projectRows.map((project) => <article className="discover-project-card" key={project.id}><div className="discover-project-visual"><span>PROJECT</span><strong>{project.title.slice(0,1)}</strong></div><div className="discover-project-meta"><div><h3>{project.title}</h3><p>{project.summary}</p></div>{project.creator && <Link href={`/creator/${project.creator.handle}/project/${project.slug}`}>View ↗</Link>}</div>{project.creator && <small>By {project.creator.display_name}</small>}</article>)}</div></section>}
      {(type === "all" || type === "posts") && <section className="discover-section explore-results"><div className="discover-heading"><div><p className="eyebrow">POSTS</p><h2>What creators are saying.</h2></div><span>{postRows.length} results</span></div><div className="post-discover-list">{postRows.map((post,index)=><Link className="post-discover-row" href={post.creator?`/creator/${post.creator.handle}/post/${post.slug}`:"#"} key={post.id}><span>0{index+1}</span><div><small>{post.post_type}</small><h3>{post.title}</h3><p>{post.excerpt}</p></div><span>↗</span></Link>)}</div></section>}
      <footer className="discover-footer"><span>© {new Date().getFullYear()} Veyra</span><div><Link href="/">Home</Link><Link href="/blog">Journal</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link></div><span>Powered by Timzee Corp</span></footer>
    </main>
  );
}
