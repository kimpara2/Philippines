// トップページ

import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { StoreCard } from "@/components/store/StoreCard";
import { RecruitBanner } from "@/components/recruit/RecruitBanner";
import { FeaturedCastSection } from "@/components/cast/FeaturedCastSection";
import type { Store, CastPreview } from "@/types/database";
import { getTranslations } from "next-intl/server";
import { Wine, GlassWater, Gem, Users, Martini, Mountain, Castle, Waves, Map, MapPin } from "lucide-react";
// Wine/GlassWater/Gem/Martini still used in genre section
import type { LucideIcon } from "lucide-react";

// 東海エリア一覧
const PREFECTURES: { name: string; Icon: LucideIcon; areas: string[] }[] = [
  { name: "愛知", Icon: Map,      areas: ["栄", "錦", "大須", "名古屋"] },
  { name: "静岡", Icon: Mountain, areas: ["浜松", "静岡市", "沼津"] },
  { name: "岐阜", Icon: Castle,   areas: ["岐阜市"] },
  { name: "三重", Icon: Waves,    areas: ["四日市"] },
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

  // おすすめキャストを取得（最大5人）
  const { data: featuredCastsRaw } = await supabase
    .from("cast_members")
    .select(`
      id, name, age, nationality, profile_image_url, description,
      stores!inner(slug, name, area, category)
    `)
    .eq("is_featured", true)
    .eq("is_active", true)
    .eq("stores.is_published", true)
    .eq("stores.is_approved", true)
    .order("sort_order")
    .limit(5);

  type FeaturedCastRaw = {
    id: string; name: string; age: number | null; nationality: string | null;
    profile_image_url: string | null; description: string | null;
    stores: { slug: string; name: string; area: string | null; category: string | null };
  };
  const featuredCasts = ((featuredCastsRaw ?? []) as unknown as FeaturedCastRaw[]).map((c) => ({
    ...c, store: c.stores,
  }));

  // 求人掲載数を取得
  const { count: recruitCount } = await supabase
    .from("stores")
    .select("id", { count: "exact", head: true })
    .eq("is_published", true)
    .eq("is_approved", true)
    .eq("recruit_enabled", true);

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
    "name": "東海NIGHT",
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
      <section className="relative py-24 px-4 text-center overflow-hidden">
        {/* 背景画像 */}
        <Image
          src="/hero.png"
          alt="東海NIGHT ヒーロー背景"
          fill
          className="object-cover object-center"
          priority
          unoptimized
        />
        {/* 暗めのオーバーレイ */}
        <div className="absolute inset-0 bg-black/50" />

        <div className="relative max-w-2xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-black mb-4 drop-shadow-lg">
            <span className="text-white">東海</span>
            <span className="text-accent">NIGHT</span>
          </h1>
          <p className="text-gray-200 text-lg mb-8 drop-shadow">
            {t("heroSub")}
          </p>

          <form action="/search" method="get" className="flex gap-2 max-w-md mx-auto px-4">
            <input
              type="text"
              name="q"
              placeholder={t("searchPlaceholder")}
              className="flex-1 bg-black/50 backdrop-blur border border-white/20 rounded-full px-5 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-primary"
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
          <MapPin size={20} className="text-accent" />
          {t("browseByArea")}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {PREFECTURES.map(({ name, Icon, areas }) => (
            <div key={name} className="bg-dark-card border border-dark-border rounded-xl p-4 hover:border-primary transition-all hover:shadow-lg hover:shadow-primary/10">
              <Link href={`/area/${name}`} className="flex items-center gap-2 mb-3 group">
                <Icon size={18} className="text-primary shrink-0" />
                <span className="text-white font-bold group-hover:text-primary transition-colors">
                  {name}
                </span>
              </Link>
              <div className="flex flex-wrap gap-1.5">
                {areas.map((area) => (
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

      {/* 求人バナー */}
      <section className="max-w-6xl mx-auto px-4 pb-8">
        <RecruitBanner count={recruitCount ?? 0} />
      </section>

      {/* ジャンルから探す */}
      <section className="max-w-6xl mx-auto px-4 pb-12">
        <h2 className="text-xl font-bold text-accent mb-6 flex items-center gap-2">
          <Martini size={20} />
          ジャンルから探す
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { name: "フィリピンパブ", Icon: Wine,       desc: "フィリピン人キャスト在籍" },
            { name: "スナック",       Icon: GlassWater, desc: "ママと気軽に一杯" },
            { name: "ガールズバー",   Icon: Users,      desc: "カジュアルに楽しむ" },
            { name: "バー",           Icon: Martini,    desc: "大人の夜の定番" },
            { name: "キャバクラ",     Icon: Gem,        desc: "ラグジュアリーな夜" },
          ].map(({ name, Icon, desc }) => (
            <Link
              key={name}
              href={`/stores?category=${encodeURIComponent(name)}`}
              className="bg-dark-card border border-dark-border rounded-xl p-4 hover:border-primary hover:shadow-lg hover:shadow-primary/10 transition-all group text-center"
            >
              <div className="flex justify-center mb-3">
                <Icon size={32} className="text-primary group-hover:text-accent transition-colors" />
              </div>
              <div className="text-white font-bold text-sm group-hover:text-primary transition-colors mb-1">{name}</div>
              <div className="text-gray-500 text-xs">{desc}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* おすすめ女子 */}
      {featuredCasts.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 pb-12">
          <FeaturedCastSection casts={featuredCasts} />
        </section>
      )}

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
            <div className="flex justify-center mb-4"><Wine size={52} className="text-primary opacity-40" /></div>
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
