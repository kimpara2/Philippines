// サイト全体ニュース・コラム一覧ページ

import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ニュース・コラム | 東海NIGHT",
  description: "東海NIGHTの最新ニュース・コラム・イベント情報をお届けします。全国のフィリピンパブ情報を発信中！",
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/blog`,
  },
};

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

export default async function BlogPage() {
  const supabase = await createClient();

  const { data: postsRaw } = await supabase
    .from("site_news")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  const posts = postsRaw as SiteNews[] | null;

  const categories = ["news", "column", "event"] as const;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* パンくず */}
      <nav className="text-sm text-gray-400 mb-6">
        <Link href="/" className="hover:text-primary">トップ</Link>
        <span className="mx-2">›</span>
        <span className="text-white">ニュース・コラム</span>
      </nav>

      <h1 className="text-2xl font-black text-white mb-2">📝 ニュース・コラム</h1>
      <p className="text-gray-400 text-sm mb-8">東海NIGHTからの最新情報をお届けします</p>

      {/* カテゴリタブ */}
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map((cat) => (
          <span key={cat}
            className={`text-xs px-3 py-1.5 rounded-full font-bold border ${CATEGORY_COLORS[cat]}`}>
            {CATEGORY_LABELS[cat]}
          </span>
        ))}
      </div>

      {posts && posts.length > 0 ? (
        <div className="space-y-5">
          {posts.map((post) => (
            <Link key={post.id} href={`/blog/${post.id}`} className="group block">
              <article className="bg-dark-card border border-dark-border hover:border-primary rounded-xl overflow-hidden transition-all flex flex-col md:flex-row">
                {/* サムネイル */}
                {post.thumbnail_url ? (
                  <div className="relative w-full md:w-56 h-44 md:h-auto shrink-0">
                    <Image src={post.thumbnail_url} alt={post.title} fill className="object-cover" unoptimized />
                  </div>
                ) : (
                  <div className="w-full md:w-56 h-44 md:h-auto shrink-0 bg-gradient-to-br from-purple-950 to-slate-900 flex items-center justify-center text-4xl">
                    {post.category === "news" ? "📰" : post.category === "column" ? "✍️" : "🎉"}
                  </div>
                )}
                <div className="p-5 flex flex-col justify-between flex-1">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${CATEGORY_COLORS[post.category]}`}>
                        {CATEGORY_LABELS[post.category]}
                      </span>
                      <span className="text-gray-500 text-xs">
                        {new Date(post.created_at).toLocaleDateString("ja-JP")}
                      </span>
                    </div>
                    <h2 className="text-white font-bold text-lg mb-2 group-hover:text-primary transition-colors leading-snug">
                      {post.title}
                    </h2>
                    <p className="text-gray-400 text-sm line-clamp-2 leading-relaxed">
                      {post.body}
                    </p>
                  </div>
                  <div className="text-primary text-xs mt-3 group-hover:underline">
                    続きを読む →
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-dark-card border border-dark-border rounded-2xl">
          <div className="text-5xl mb-4">📝</div>
          <p className="text-gray-400">まだ記事がありません</p>
        </div>
      )}
    </div>
  );
}
