// フィリピンパブ 人気ランキングページ — 口コミ評価順

import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "フィリピンパブ 人気ランキング | 夜トカイ",
  description:
    "口コミ評価が高い人気のフィリピンパブ・スナックをランキング形式で紹介。エリア別の人気店を探すなら夜トカイ。",
  keywords: ["フィリピンパブ", "ランキング", "人気", "おすすめ", "口コミ", "評価"],
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";

const MEDAL = ["🥇", "🥈", "🥉"];

function StarDisplay({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={`text-sm ${i <= full ? "text-yellow-400" : i === full + 1 && half ? "text-yellow-400 opacity-60" : "text-gray-600"}`}>
          ★
        </span>
      ))}
    </span>
  );
}

export default async function RankingPage() {
  const supabase = await createClient();

  // 口コミ付きで承認済み・公開中の店舗を取得
  const { data: storesRaw } = await supabase
    .from("stores")
    .select("id, slug, name, area, description, cover_image_url, min_price, max_price, open_hours, address, reviews(rating)")
    .eq("is_published", true)
    .eq("is_approved", true);

  type StoreWithReviews = {
    id: string;
    slug: string;
    name: string;
    area: string | null;
    description: string | null;
    cover_image_url: string | null;
    min_price: number | null;
    max_price: number | null;
    open_hours: string | null;
    address: string | null;
    reviews: { rating: number }[];
  };

  // 平均評価を計算してソート
  const ranked = ((storesRaw ?? []) as StoreWithReviews[])
    .map((store) => {
      const ratings = (store.reviews ?? []).map((r) => r.rating);
      const avgRating =
        ratings.length > 0
          ? ratings.reduce((a, b) => a + b, 0) / ratings.length
          : 0;
      return { ...store, avgRating, reviewCount: ratings.length };
    })
    .sort((a, b) => {
      if (b.avgRating !== a.avgRating) return b.avgRating - a.avgRating;
      return b.reviewCount - a.reviewCount;
    });

  // JSON-LD（ItemList）
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "フィリピンパブ 人気ランキング",
    description: "口コミ評価が高いフィリピンパブのランキング",
    numberOfItems: ranked.length,
    itemListElement: ranked.slice(0, 10).map((store, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: store.name,
      url: `${SITE_URL}/stores/${store.slug}`,
    })),
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* パンくずリスト */}
      <nav className="text-xs text-gray-500 mb-6 flex items-center gap-1.5">
        <Link href="/" className="hover:text-primary transition-colors">トップ</Link>
        <span>›</span>
        <span className="text-gray-300">人気ランキング</span>
      </nav>

      <h1 className="text-3xl font-black text-white mb-2">🏆 フィリピンパブ 人気ランキング</h1>
      <p className="text-gray-400 text-sm mb-10">
        口コミ評価をもとにした人気ランキングです。高評価のお店を参考にして、お気に入りの一軒を見つけましょう。
      </p>

      {ranked.length === 0 ? (
        <div className="text-center py-20 bg-dark-card rounded-2xl border border-dark-border">
          <div className="text-5xl mb-4">🍹</div>
          <p className="text-gray-400">まだランキングデータがありません。</p>
          <p className="text-gray-500 text-sm mt-2">口コミが集まると自動的にランキングが作成されます。</p>
          <Link href="/stores" className="inline-block mt-6 text-primary hover:underline text-sm">
            店舗一覧を見る →
          </Link>
        </div>
      ) : (
        <div className="border-y border-dark-border divide-y divide-dark-border">
          {ranked.map((store, i) => {
            const priceText =
              store.min_price && store.max_price
                ? `¥${store.min_price.toLocaleString()}〜¥${store.max_price.toLocaleString()}`
                : store.min_price
                ? `¥${store.min_price.toLocaleString()}〜`
                : null;

            return (
              <Link key={store.id} href={`/stores/${store.slug}`} className="block group">
                <div className="flex h-36 md:h-44 bg-dark-card group-hover:bg-dark transition-colors overflow-hidden">

                  {/* ランキング番号 */}
                  <div className="flex items-center justify-center w-14 md:w-20 shrink-0 bg-dark border-r border-dark-border">
                    {i < 3 ? (
                      <span className="text-2xl md:text-3xl">{MEDAL[i]}</span>
                    ) : (
                      <span className="text-white font-black text-xl md:text-2xl">{i + 1}</span>
                    )}
                  </div>

                  {/* 店舗画像 */}
                  <div className="relative w-36 h-36 md:w-44 md:h-44 shrink-0">
                    {store.cover_image_url ? (
                      <Image
                        src={store.cover_image_url}
                        alt={store.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        unoptimized
                      />
                    ) : (
                      <div className="absolute inset-0 bg-dark-border flex items-center justify-center text-4xl">
                        🍹
                      </div>
                    )}
                    {store.area && (
                      <div className="absolute top-2 left-2">
                        <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full font-bold">
                          {store.area}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* テキスト */}
                  <div className="flex-1 flex flex-col justify-center px-5 md:px-8 py-4 min-w-0">
                    <h2 className="text-white font-black text-base md:text-xl leading-tight group-hover:text-primary transition-colors mb-1.5">
                      {store.name}
                    </h2>

                    {/* 評価 */}
                    <div className="flex items-center gap-2 mb-2">
                      <StarDisplay rating={store.avgRating} />
                      <span className="text-yellow-400 font-bold text-sm">
                        {store.avgRating > 0 ? store.avgRating.toFixed(1) : "—"}
                      </span>
                      <span className="text-gray-500 text-xs">
                        （{store.reviewCount}件の口コミ）
                      </span>
                    </div>

                    {store.description && (
                      <p className="text-gray-400 text-sm line-clamp-1 mb-2 hidden md:block">
                        {store.description}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                      {store.address && (
                        <span className="text-gray-400 text-xs flex items-center gap-1">
                          <span>📍</span>
                          <span className="line-clamp-1">{store.address}</span>
                        </span>
                      )}
                      {store.open_hours && (
                        <span className="text-gray-400 text-xs flex items-center gap-1">
                          <span>🕐</span>{store.open_hours}
                        </span>
                      )}
                      {priceText && (
                        <span className="text-accent text-xs font-bold flex items-center gap-1">
                          <span>💰</span>{priceText}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 矢印 */}
                  <div className="flex items-center pr-5 md:pr-8 shrink-0 text-gray-600 group-hover:text-primary transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* CTAセクション */}
      <div className="mt-12 text-center">
        <p className="text-gray-400 text-sm mb-4">あなたのお気に入りのお店の口コミを投稿して、ランキングに参加しませんか？</p>
        <Link
          href="/stores"
          className="inline-block bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded-full font-bold transition-colors text-sm"
        >
          🏪 すべての店舗を見る
        </Link>
      </div>
    </div>
  );
}
