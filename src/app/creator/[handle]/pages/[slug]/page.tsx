import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import PageBlocks from "@/components/builder/PageBlocks";
import { pageDocumentIsValid } from "@/platform/builder/page-model";

type RouteProps = { params: Promise<{handle:string;slug:string}> };
async function getPublicPage(handle:string,slug:string) {
  const supabase=await createSupabaseServerClient();
  const {data:creator}=await supabase.from("creator_accounts")
    .select("id,handle,display_name,status").eq("handle",handle.toLowerCase()).eq("status","active").maybeSingle();
  if(!creator)return null;
  const {data:site}=await supabase.from("creator_sites")
    .select("visibility").eq("creator_id",creator.id).eq("visibility","published").maybeSingle();
  if(!site)return null;
  const {data:page}=await supabase.from("site_page_publications")
    .select("slug,title,seo_description,blocks").eq("creator_id",creator.id).eq("slug",slug).maybeSingle();
  if(!page||!pageDocumentIsValid(page.blocks))return null;
  return {creator,page};
}
export async function generateMetadata({params}:RouteProps):Promise<Metadata>{
  const {handle,slug}=await params;
  const result=await getPublicPage(handle,slug);
  if(!result)return {title:"Page not found",robots:{index:false,follow:false}};
  return {title:`${result.page.title} | ${result.creator.display_name}`,
    description:result.page.seo_description ?? `Learn more from ${result.creator.display_name} on Veyra.`,
    alternates:{canonical:`/creator/${encodeURIComponent(result.creator.handle)}/pages/${encodeURIComponent(result.page.slug)}`}};
}
export default async function PublicSitePage({params}:RouteProps){
  const {handle,slug}=await params;
  const result=await getPublicPage(handle,slug);
  if(!result)notFound();
  const {creator,page}=result;
  return <main className="vpage-public-shell">
    <header className="vpage-public-header"><Link href={`/creator/${creator.handle}`} className="vpage-public-brand">{creator.display_name}</Link><nav aria-label="Page navigation"><Link href={`/creator/${creator.handle}`}>Home</Link><Link href={`/u/${creator.handle}`}>Creator profile</Link></nav></header>
    <section className="vpage-public-hero"><p className="eyebrow">WELCOME / {creator.display_name}</p><h1>{page.title}</h1>{page.seo_description&&<p>{page.seo_description}</p>}</section>
    <PageBlocks blocks={page.blocks} siteBasePath={`/creator/${creator.handle}`}/>
    <footer className="vpage-public-footer"><Link href={`/creator/${creator.handle}`}>← Back to website</Link><span>Powered by Timzee Corp</span></footer>
  </main>;
}
