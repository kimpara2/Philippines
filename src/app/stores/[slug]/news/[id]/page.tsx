// 店舗ニュース・ブログ個別ページ（SEO的に最重要）

import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string; id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, id } = await params;
  const supabase = await createClient();

  const { data: post } = await supabase.from("news_posts").select("title, body").eq("id", id).single();
  const { data: store } = await supabase.from("stores").select("name, area").eq("slug", slug).single();

  if (!post || !store) return { title: "記事が見つかりません" };

  const title = `${post.title}｜${store.name}（${store.area ?? ""}のフィリピンパブ）`;
  const description = post.body.slice(0, 120);

  return {
    title,
    description,
    keywords: [store.name, `${store.area}フィリピンパブ`, post.title, "フィリピンパブ"],
    openGraph: { title, description },
    alternates: { canonical: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/stores/${slug}/news/${id}` },
  };
}

export default async function StoreNewsDetailPage({ params }: Props) {
  const { slug, id } = await params;
  const supabase = await createClient();

  const { data: store } = await supabase
    .from("stores")
    .select("id, name, area, cover_image_url")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!store) notFound();

  const { data: post } = await supabase
    .from("news_posts")
    .select("*")
    .eq("id", id)
    .eq("store_id", store.id)
    .eq("is_published", true)
    .single();

  if (!post) notFound();

  // 関連記事（同じ店舗の他の記事）
  const { data: related } = await supabase
    .from("news_posts")
    .select("id, title, created_at")
    .eq("store_id", store.id)
    .eq("is_published", true)
    .neq("id", id)
    .order("created_at", { ascending: false })
    .limit(3);

  // JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.body.slice(0, 120),
    datePublished: post.created_at,
    author: {
      "@type": "Organization",
      name: store.name,
    },
    publisher: {
      "@type": "Organization",
      name: "東海NIGHT",
    },
    mainEntityOfPage: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/stores/${slug}/news/${id}`,
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* パンくず */}
      <nav className="text-sm text-gray-400 mb-6">
        <Link href="/" className="hover:text-primary">トップ</Link>
        <span className="mx-2">›</span>
        <Link href={`/stores/${slug}`} className="hover:text-primary">{store.name}</Link>
        <span className="mx-2">›</span>
        <Link href={`/stores/${slug}/news`} className="hover:text-primary">お知らせ</Link>
        <span className="mx-2">›</span>
        <span className="text-white line-clamp-1">{post.title}</span>
      </nav>

      <article>
        {/* ヘッダー */}
        <div className="mb-8">
          {post.event_date && (
            <div className="text-accent text-sm font-bold mb-3">
              📅 イベント日：{new Date(post.event_date).toLocaleDateString("ja-JP")}
            </div>
          )}
          <h1 className="text-2xl md:text-3xl font-black text-white mb-4 leading-tight">
            {post.title}
          </h1>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <Link href={`/stores/${slug}`} className="flex items-center gap-1.5 hover:text-primary transition-colors">
              <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full font-bold">
                {store.area}
              </span>
              <span>{store.name}</span>
            </Link>
            <span>{new Date(post.created_at).toLocaleDateString("ja-JP")}</span>
          </div>
        </div>

        {/* 本文 */}
        <div className="bg-dark-card border border-dark-border rounded-2xl p-6 md:p-8 mb-8">
          <div className="text-gray-200 leading-relaxed whitespace-pre-line text-sm md:text-base">
            {post.body}
          </div>
        </div>
      </article>

      {/* 店舗へのリンク */}
      <div className="bg-dark-card border border-primary/30 rounded-xl p-5 mb-8">
        <div className="text-accent text-xs font-bold mb-2">この記事の店舗</div>
        <Link href={`/stores/${slug}`}
          className="text-white font-bold hover:text-primary transition-colors text-lg">
          🏪 {store.name} →
        </Link>
        {store.area && <div className="text-gray-400 text-sm mt-1">📍 {store.area}</div>}
      </div>

      {/* 関連記事 */}
      {related && related.length > 0 && (
        <div>
          <h2 className="text-accent font-bold mb-4 text-sm">他のお知らせ</h2>
          <div className="space-y-2">
            {related.map((r) => (
              <Link key={r.id} href={`/stores/${slug}/news/${r.id}`}
                className="flex items-center justify-between bg-dark-card border border-dark-border hover:border-primary rounded-lg px-4 py-3 transition-all group">
                <span className="text-gray-300 group-hover:text-primary text-sm transition-colors line-clamp-1">
                  {r.title}
                </span>
                <span className="text-gray-500 text-xs shrink-0 ml-3">
                  {new Date(r.created_at).toLocaleDateString("ja-JP")}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
