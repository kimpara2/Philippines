// サイト全体ニュース・コラム個別ページ

import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Metadata } from "next";

type Props = { params: Promise<{ id: string }> };

const CATEGORY_LABELS: Record<string, string> = {
  news: "📰 ニュース",
  column: "✍️ コラム",
  event: "🎉 イベント",
};

const CATEGORY_COLORS: Record<string, string> = {
  news: "bg-blue-900/50 text-blue-400 border-blue-500/30",
  column: "bg-purple-900/50 text-purple-400 border-purple-500/30",
  event: "bg-yellow-900/50 text-yellow-400 border-yellow-500/30",
};

type SiteNews = {
  id: string;
  title: string;
  body: string;
  category: "news" | "column" | "event";
  thumbnail_url: string | null;
  is_published: boolean;
  created_at: string;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();

  const { data: postRaw } = await supabase
    .from("site_news")
    .select("title, body, category")
    .eq("id", id)
    .eq("is_published", true)
    .single();
  const post = postRaw as SiteNews | null;

  if (!post) return { title: "記事が見つかりません" };

  const title = `${post.title} | 東海NIGHT`;
  const description = post.body.slice(0, 120);

  return {
    title,
    description,
    keywords: ["フィリピンパブ", "東海NIGHT", post.title],
    openGraph: { title, description },
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/blog/${id}`,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: postRaw } = await supabase
    .from("site_news")
    .select("*")
    .eq("id", id)
    .eq("is_published", true)
    .single();
  const post = postRaw as SiteNews | null;

  if (!post) notFound();

  // 関連記事（同じカテゴリの他の記事）
  const { data: relatedRaw } = await supabase
    .from("site_news")
    .select("id, title, created_at, category")
    .eq("is_published", true)
    .eq("category", post.category)
    .neq("id", id)
    .order("created_at", { ascending: false })
    .limit(3);
  const related = relatedRaw as SiteNews[] | null;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.body.slice(0, 120),
    datePublished: post.created_at,
    author: {
      "@type": "Organization",
      name: "東海NIGHT",
    },
    publisher: {
      "@type": "Organization",
      name: "東海NIGHT",
    },
    mainEntityOfPage: `${siteUrl}/blog/${id}`,
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
        <Link href="/blog" className="hover:text-primary">ニュース・コラム</Link>
        <span className="mx-2">›</span>
        <span className="text-white line-clamp-1">{post.title}</span>
      </nav>

      <article>
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${CATEGORY_COLORS[post.category]}`}>
              {CATEGORY_LABELS[post.category]}
            </span>
            <span className="text-gray-500 text-sm">
              {new Date(post.created_at).toLocaleDateString("ja-JP")}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white leading-tight">
            {post.title}
          </h1>
        </div>

        {/* サムネイル画像 */}
        {post.thumbnail_url && (
          <div className="relative w-full aspect-[16/7] rounded-2xl overflow-hidden mb-8">
            <Image src={post.thumbnail_url} alt={post.title} fill className="object-cover" unoptimized />
          </div>
        )}

        {/* 本文 */}
        <div className="bg-dark-card border border-dark-border rounded-2xl p-6 md:p-8 mb-8">
          <div className="blog-body text-gray-200 leading-relaxed text-sm md:text-base">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h2: ({ children }) => (
                  <h2 className="text-xl md:text-2xl font-black text-primary mt-8 mb-3 pb-2 border-b border-primary/30">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-base md:text-lg font-bold text-accent mt-6 mb-2">
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="mb-4 leading-relaxed">{children}</p>
                ),
                strong: ({ children }) => (
                  <strong className="text-white font-bold">{children}</strong>
                ),
                em: ({ children }) => (
                  <em className="text-gray-300 italic">{children}</em>
                ),
                hr: () => (
                  <hr className="border-dark-border my-6" />
                ),
                ul: ({ children }) => (
                  <ul className="list-disc list-inside mb-4 space-y-1 text-gray-300">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside mb-4 space-y-1 text-gray-300">{children}</ol>
                ),
                li: ({ children }) => (
                  <li className="leading-relaxed">{children}</li>
                ),
                img: ({ src, alt }) => (
                  src ? (
                    <span className="block my-6 rounded-xl overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt={alt ?? ""} className="w-full object-cover rounded-xl" loading="lazy" />
                      {alt && <span className="block text-center text-gray-500 text-xs mt-1">{alt}</span>}
                    </span>
                  ) : null
                ),
              }}
            >
              {post.body}
            </ReactMarkdown>
          </div>
        </div>
      </article>

      {/* ブログ一覧へのリンク */}
      <div className="mb-8">
        <Link href="/blog"
          className="inline-flex items-center gap-2 text-primary hover:underline text-sm">
          ← ニュース・コラム一覧に戻る
        </Link>
      </div>

      {/* 関連記事 */}
      {related && related.length > 0 && (
        <div>
          <h2 className="text-accent font-bold mb-4 text-sm">関連記事</h2>
          <div className="space-y-2">
            {related.map((r) => (
              <Link key={r.id} href={`/blog/${r.id}`}
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
