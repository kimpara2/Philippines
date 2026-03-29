// 店舗ニュース・ブログ一覧ページ

import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: store } = await supabase.from("stores").select("name, area").eq("slug", slug).single();
  if (!store) return { title: "店舗が見つかりません" };

  const title = `${store.name}のお知らせ・ブログ`;
  const description = `${store.area ?? ""}のフィリピンパブ「${store.name}」の最新情報・イベント・お知らせ一覧`;
  return {
    title,
    description,
    openGraph: { title, description },
    alternates: { canonical: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/stores/${slug}/news` },
  };
}

export default async function StoreNewsPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: store } = await supabase
    .from("stores")
    .select("id, name, area")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!store) notFound();

  const { data: posts } = await supabase
    .from("news_posts")
    .select("*")
    .eq("store_id", store.id)
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* パンくず */}
      <nav className="text-sm text-gray-400 mb-6">
        <Link href="/" className="hover:text-primary">トップ</Link>
        <span className="mx-2">›</span>
        <Link href="/stores" className="hover:text-primary">店舗一覧</Link>
        <span className="mx-2">›</span>
        <Link href={`/stores/${slug}`} className="hover:text-primary">{store.name}</Link>
        <span className="mx-2">›</span>
        <span className="text-white">お知らせ</span>
      </nav>

      <h1 className="text-2xl font-black text-white mb-2">
        📢 {store.name}のお知らせ・ブログ
      </h1>
      <p className="text-gray-400 text-sm mb-8">{posts?.length ?? 0}件の投稿</p>

      {posts && posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map((post) => (
            <Link key={post.id} href={`/stores/${slug}/news/${post.id}`}>
              <div className="bg-dark-card border border-dark-border hover:border-primary rounded-xl p-5 transition-all group">
                {post.event_date && (
                  <div className="text-accent text-xs font-bold mb-2">
                    📅 イベント：{new Date(post.event_date).toLocaleDateString("ja-JP")}
                  </div>
                )}
                <h2 className="text-white font-bold text-lg mb-2 group-hover:text-primary transition-colors">
                  {post.title}
                </h2>
                <p className="text-gray-400 text-sm line-clamp-2">{post.body}</p>
                <div className="text-gray-500 text-xs mt-3">
                  {new Date(post.created_at).toLocaleDateString("ja-JP")}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-dark-card rounded-2xl border border-dark-border">
          <div className="text-5xl mb-4">📢</div>
          <p className="text-gray-400">まだお知らせがありません</p>
        </div>
      )}
    </div>
  );
}
