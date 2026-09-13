import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function generateMetadata({ params }: { params: Promise<{ handle: string; slug: string }> }): Promise<Metadata> {
  const { handle, slug } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: creator } = await supabase.from("creator_accounts").select("id, display_name").eq("handle", handle.toLowerCase()).maybeSingle();
  if (!creator) return { title: "Post not found" };
  const { data: post } = await supabase.from("posts").select("title, excerpt").eq("creator_id", creator.id).eq("slug", slug).eq("published", true).maybeSingle();
  if (!post) return { title: "Post not found" };
  return { title: post.title, description: post.excerpt ?? `A post by ${creator.display_name} on Veyra.` };
}

export default async function PublicPostPage({ params }: { params: Promise<{ handle: string; slug: string }> }) {
  const { handle, slug } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: creator } = await supabase.from("creator_accounts").select("id, handle, display_name, bio").eq("handle", handle.toLowerCase()).maybeSingle();
  if (!creator) notFound();
  const { data: post } = await supabase.from("posts").select("id, title, excerpt, body, post_type, published_at, cover_path").eq("creator_id", creator.id).eq("slug", slug).eq("published", true).maybeSingle();
  if (!post) notFound();

  return <main className="public-project-shell"><header className="public-creator-nav"><Link className="brand" href="/"><span className="brand-mark">V</span><span>VEYRA</span></Link><Link href={`/creator/${creator.handle}`}>@{creator.handle}</Link><Link className="nav-cta" href="/explore">Discover ↗</Link></header><article className="public-project-article"><p className="eyebrow">CREATOR POST / {post.post_type.toUpperCase()}</p><h1>{post.title}</h1><p className="public-project-summary">{post.excerpt}</p><div className="public-project-body">{post.body ? post.body.split(/\n{2,}/).map((paragraph: string) => <p key={paragraph}>{paragraph}</p>) : <p>{post.excerpt || "This creator has not added the full post body yet."}</p>}</div><Link href={`/creator/${creator.handle}`}>← Back to {creator.display_name}</Link></article><footer className="public-creator-footer"><span>© {new Date().getFullYear()} {creator.display_name}</span><span>Published on Veyra</span><span>Powered by Timzee Corp</span></footer></main>;
}
