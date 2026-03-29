// トップページ

import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { StoreCard } from "@/components/store/StoreCard";
import type { Store, CastPreview } from "@/types/database";
import { getTranslations } from "next-intl/server";

// 都道府県・主要エリア一覧
const PREFECTURES = [
  { name: "東京", icon: "🗼", areas: ["新宿", "池袋", "六本木", "錦糸町", "上野"] },
  { name: "大阪", icon: "🏯", areas: ["なんば", "心斎橋", "梅田", "北新地"] },
  { name: "神奈川", icon: "⚓", areas: ["横浜", "川崎"] },
  { name: "愛知", icon: "🦐", areas: ["栄", "錦", "大須"] },
  { name: "静岡", icon: "🗻", areas: ["浜松", "静岡市", "沼津"] },
  { name: "北海道", icon: "🦀", areas: ["すすきの", "札幌"] },
  { name: "福岡", icon: "🍜", areas: ["中洲", "天神", "博多"] },
  { name: "兵庫", icon: "🌹", areas: ["神戸", "三宮"] },
  { name: "京都", icon: "⛩️", areas: ["木屋町", "先斗町"] },
  { name: "広島", icon: "🕊️", areas: ["流川", "紙屋町"] },
  { name: "宮城", icon: "🌿", areas: ["国分町", "仙台"] },
  { name: "沖縄", icon: "🌺", areas: ["松山", "栄町"] },
];

type SiteNews = {
  id: string;
  title: string;
  body: string;
  category: "news" | "column" | "event";
  thumbnail_url?: string | null;
  created_at: string;
};

// カテゴリラベルは翻訳から取得するため、ここでは絵文字のみ定義
const CATEGORY_EMOJI: Record<string, string> = {
  news: "📰",
  column: "✍️",
  event: "🎉",
};

const CATEGORY_COLORS: Record<string, string> = {
  news: "bg-blue-900/50 text-blue-400 border-blue-500/30",
  column: "bg-purple-900/50 text-purple-400 border-purple-500/30",
  event: "bg-yellow-900/50 text-yellow-400 border-yellow-500/30",
};

export default async function HomePage() {
  const supabase = await createClient();
  const t = await getTranslations("home");
  const tc = await getTranslations("category");

  const { data: storesRaw } = await supabase
    .from("stores")
    .select("*")
    .eq("is_published", true)
    .eq("is_approved", true)
    .order("created_at", { ascending: false })
    .limit(8);
  const stores = storesRaw as Store[] | null;

  // キャスト写真を取得
  const storeIds = (stores ?? []).map((s) => s.id);
  const castsRaw = storeIds.length > 0
    ? (await supabase.from("cast_members").select("id, store_id, name, profile_image_url").in("store_id", storeIds).eq("is_active", true).order("sort_order")).data
    : null;
  const castsByStore: Record<string, CastPreview[]> = {};
  (castsRaw ?? []).forEach((c) => {
    const cast = c as CastPreview;
    if (!castsByStore[cast.store_id]) castsByStore[cast.store_id] = [];
    castsByStore[cast.store_id].push(cast);
  });

  const { data: newsRaw } = await supabase
    .from("site_news")
    .select("id, title, body, category, created_at")
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(3);
  const siteNews = newsRaw as SiteNews[] | null;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "フィリピンパブNavi",
    "url": siteUrl,
    "description": "全国のフィリピンパブ・スナック情報ポータルサイト。エリアや口コミから人気のフィリピンパブを探せます。",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${siteUrl}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    <div>
      {/* ヒーローセクション */}
      <section className="relative bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 py-20 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 text-8xl">🍹</div>
          <div className="absolute top-20 right-10 text-6xl">✨</div>
          <div className="absolute bottom-10 left-1/4 text-7xl">🎵</div>
          <div className="absolute bottom-5 right-1/4 text-5xl">💫</div>
        </div>

        <div className="relative max-w-2xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-black mb-4">
            <span className="text-primary">フィリピンパブ</span>
            <span className="text-accent">Na</span>
            <span className="text-primary">v</span>
            <span className="text-accent">i</span>
          </h1>
          <p className="text-gray-300 text-lg mb-8">
            {t("heroSub")}
          </p>

          <form action="/search" method="get" className="flex gap-2 max-w-md mx-auto px-4">
            <input
              type="text"
              name="q"
              placeholder={t("searchPlaceholder")}
              className="flex-1 bg-dark-card border border-dark-border rounded-full px-5 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary"
            />
            <button
              type="submit"
              className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-full font-bold transition-colors"
            >
              {t("searchButton")}
            </button>
          </form>
        </div>
      </section>

      {/* エリアから探す */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-xl font-bold text-accent mb-6 flex items-center gap-2">
          {t("browseByArea")}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {PREFECTURES.map((pref) => (
            <div key={pref.name} className="bg-dark-card border border-dark-border rounded-xl p-4 hover:border-primary transition-all hover:shadow-lg hover:shadow-primary/10">
              <Link href={`/area/${pref.name}`} className="flex items-center gap-2 mb-3 group">
                <span className="text-2xl">{pref.icon}</span>
                <span className="text-white font-bold group-hover:text-primary transition-colors">
                  {pref.name}
                </span>
              </Link>
              <div className="flex flex-wrap gap-1.5">
                {pref.areas.map((area) => (
                  <Link
                    key={area}
                    href={`/area/${area}`}
                    className="text-xs text-gray-400 hover:text-primary bg-dark rounded px-2 py-1 transition-colors"
                  >
                    {area}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-6">
          <Link href="/stores" className="text-gray-400 hover:text-primary text-sm transition-colors">
            すべての店舗を見る →
          </Link>
        </div>
      </section>

      {/* 新着店舗 */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-accent flex items-center gap-2">
            {t("newStores")}
          </h2>
          <Link href="/stores" className="text-primary hover:text-primary-hover text-sm transition-colors">
            {t("viewAll")}
          </Link>
        </div>

        {stores && stores.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {stores.map((store) => (
              <StoreCard key={store.id} store={store} casts={castsByStore[store.id]} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-dark-card rounded-2xl border border-dark-border">
            <div className="text-5xl mb-4">🍹</div>
            <p className="text-gray-400 text-lg mb-2">{t("noStores")}</p>
            <p className="text-gray-500 text-sm">
              Supabaseを設定して店舗を追加してみましょう！
            </p>
          </div>
        )}
      </section>

      {/* サイトニュース・コラム */}
      {siteNews && siteNews.length > 0 && (
        <section className="w-full pb-12">
          <div className="max-w-6xl mx-auto px-4 mb-5 flex items-center justify-between">
            <h2 className="text-xl font-bold text-accent flex items-center gap-2">
              {t("newsColumn")}
            </h2>
            <Link href="/blog" className="text-primary hover:text-primary-hover text-sm transition-colors">
              {t("readMore")}
            </Link>
          </div>

          {/* 最大3件を縦に並べる（左：正方形画像、右：テキスト） */}
          <div className="divide-y divide-dark-border border-y border-dark-border">
            {siteNews.slice(0, 3).map((post) => (
              <Link key={post.id} href={`/blog/${post.id}`} className="block w-full group">
                <div className="flex h-44 md:h-56 bg-dark-card group-hover:bg-dark transition-colors overflow-hidden">
                  {/* 左：正方形画像 */}
                  <div className="relative w-44 h-44 md:w-56 md:h-56 shrink-0">
                    {post.thumbnail_url ? (
                      <Image
                        src={post.thumbnail_url}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        unoptimized
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-950 via-slate-900 to-pink-950 flex items-center justify-center text-5xl">
                        {post.category === "news" ? "📰" : post.category === "column" ? "✍️" : "🎉"}
                      </div>
                    )}
                  </div>
                  {/* 右：テキスト */}
                  <div className="flex-1 flex flex-col justify-center px-6 md:px-10 py-5">
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${CATEGORY_COLORS[post.category]}`}>
                        {CATEGORY_EMOJI[post.category]} {tc(post.category)}
                      </span>
                      <span className="text-gray-500 text-xs">
                        {new Date(post.created_at).toLocaleDateString("ja-JP")}
                      </span>
                    </div>
                    <h3 className="text-white font-black text-base md:text-xl leading-tight group-hover:text-primary transition-colors mb-2">
                      {post.title}
                    </h3>
                    <p className="text-gray-400 text-sm line-clamp-2 leading-relaxed hidden md:block">
                      {post.body}
                    </p>
                    <span className="text-primary text-xs mt-3 group-hover:underline">続きを読む →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
    </>
  );
}
