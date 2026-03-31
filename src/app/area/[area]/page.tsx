// エリア別店舗一覧ページ

import { createClient } from "@/lib/supabase/server";
import { StoreListItem } from "@/components/store/StoreListItem";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import type { Store, CastPreview } from "@/types/database";

const CATEGORY_EMOJI: Record<string, string> = {
  news: "📰",
  column: "✍️",
  event: "🎉",
};

type AreaNews = {
  id: string;
  title: string;
  body: string;
  category: string;
  thumbnail_url: string | null;
  created_at: string;
};

// 県名 → 配下エリアのマッピング
const PREFECTURE_AREAS: Record<string, string[]> = {
  愛知:  ["栄", "錦", "大須", "名古屋"],
  静岡:  ["浜松", "静岡市", "沼津"],
  岐阜:  ["岐阜市"],
  三重:  ["四日市"],
};

const CATEGORIES = ["フィリピンパブ", "スナック", "ガールズバー", "バー", "キャバクラ"];

type Props = {
  params: Promise<{ area: string }>;
  searchParams: Promise<{ category?: string }>;
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { area } = await params;
  const { category } = await searchParams;
  const decodedArea = decodeURIComponent(area);
  const subAreas = PREFECTURE_AREAS[decodedArea];
  const searchAreas = subAreas ? [decodedArea, ...subAreas] : [decodedArea];

  const supabase = await createClient();
  let countQuery = supabase
    .from("stores")
    .select("*", { count: "exact", head: true })
    .in("area", searchAreas)
    .eq("is_published", true)
    .eq("is_approved", true);
  if (category) countQuery = countQuery.eq("category", category);
  const { count } = await countQuery;

  const genre = category ?? "夜遊びスポット";
  const title = `${decodedArea}の${genre}一覧${count ? `【${count}件】` : ""}`;
  const description = category
    ? `${decodedArea}の${category}${count ? `${count}件` : ""}を掲載。営業時間・料金・アクセス情報を夜トカイでチェック。`
    : `${decodedArea}のフィリピンパブ・スナック・ガールズバー・バー・キャバクラ${count ? `${count}件` : ""}を掲載。夜トカイで${decodedArea}の夜遊び情報を探そう。`;

  return {
    title,
    description,
    openGraph: {
      title: `${title} | 夜トカイ`,
      description,
    },
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/area/${area}${category ? `?category=${encodeURIComponent(category)}` : ""}`,
    },
  };
}

export default async function AreaPage({ params, searchParams }: Props) {
  const { area } = await params;
  const { category } = await searchParams;
  const decodedArea = decodeURIComponent(area);
  const supabase = await createClient();

  // 県名の場合は配下エリアも含めて検索
  const subAreas = PREFECTURE_AREAS[decodedArea];
  const searchAreas = subAreas ? [decodedArea, ...subAreas] : [decodedArea];

  // 管理者ユーザーのIDを取得
  const { data: adminProfilesArea } = await supabase
    .from("profiles")
    .select("id")
    .eq("role", "admin");
  const adminIdsArea = new Set((adminProfilesArea ?? []).map((p: { id: string }) => p.id));

  let storeQuery = supabase
    .from("stores")
    .select("*")
    .in("area", searchAreas)
    .eq("is_published", true)
    .eq("is_approved", true);
  if (category) storeQuery = storeQuery.eq("category", category);
  const { data: storesRaw } = await storeQuery;
  // 管理者の店舗を先頭に、それ以外はランダム順
  const allAreaStores = (storesRaw as Store[] | null) ?? [];
  const adminAreaStores = allAreaStores.filter((s) => s.owner_id && adminIdsArea.has(s.owner_id));
  const otherAreaStores = allAreaStores.filter((s) => !s.owner_id || !adminIdsArea.has(s.owner_id)).sort(() => Math.random() - 0.5);
  const stores = [...adminAreaStores, ...otherAreaStores];

  // キャスト写真・店舗写真を取得
  const storeIds = (stores ?? []).map((s) => s.id);
  const [castsRaw, photosRaw] = storeIds.length > 0
    ? await Promise.all([
        supabase.from("cast_members").select("id, store_id, name, profile_image_url").in("store_id", storeIds).eq("is_active", true).order("sort_order").then(r => r.data),
        supabase.from("store_photos").select("store_id, url").in("store_id", storeIds).order("sort_order").then(r => r.data),
      ])
    : [null, null];

  const castsByStore: Record<string, CastPreview[]> = {};
  (castsRaw ?? []).forEach((c) => {
    const cast = c as CastPreview;
    if (!castsByStore[cast.store_id]) castsByStore[cast.store_id] = [];
    castsByStore[cast.store_id].push(cast);
  });

  const photosByStore: Record<string, string[]> = {};
  (photosRaw ?? []).forEach((p: { store_id: string; url: string }) => {
    if (!photosByStore[p.store_id]) photosByStore[p.store_id] = [];
    photosByStore[p.store_id].push(p.url);
  });

  // エリア別ブログ記事を取得（カテゴリ指定時はタイトル検索でも絞り込み）
  let newsQuery = supabase
    .from("site_news")
    .select("id, title, body, category, thumbnail_url, created_at")
    .eq("area", decodedArea)
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(3);
  const { data: areaNewsRaw } = await newsQuery;
  const areaNews = areaNewsRaw as AreaNews[] | null;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const pageLabel = `${decodedArea}の${category ?? "夜遊びスポット"}`;
  const jsonLd = JSON.stringify([
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "トップ", item: siteUrl },
        { "@type": "ListItem", position: 2, name: "店舗一覧", item: siteUrl + "/stores" },
        { "@type": "ListItem", position: 3, name: pageLabel },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: pageLabel + "一覧",
      itemListElement: (stores ?? []).map((store, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: store.name,
        url: siteUrl + "/stores/" + store.slug,
      })),
    },
  ]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />
      <nav className="text-sm text-gray-400 mb-6">
        <Link href="/" className="hover:text-primary">トップ</Link>
        <span className="mx-2">›</span>
        <Link href="/stores" className="hover:text-primary">店舗一覧</Link>
        <span className="mx-2">›</span>
        <span className="text-white">{decodedArea}</span>
      </nav>

      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-white mb-2">
            📍 {decodedArea}{category ? `の${category}` : "の夜遊びスポット"}
          </h1>
          <p className="text-gray-400 text-sm">{stores?.length ?? 0}件掲載中</p>
        </div>
        <Link
          href={`/ranking/${encodeURIComponent(decodedArea)}`}
          className="shrink-0 flex items-center gap-2 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/50 text-yellow-400 font-bold text-sm px-4 py-2.5 rounded-xl transition-colors"
        >
          🏆 ランキングを見る
        </Link>
      </div>

      {/* カテゴリフィルター */}
      <div className="flex flex-wrap gap-2 mb-8">
        <Link
          href={`/area/${area}`}
          className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${
            !category ? "bg-primary text-white" : "bg-dark-card border border-dark-border text-gray-300 hover:border-primary"
          }`}
        >
          すべて
        </Link>
        {CATEGORIES.map((c) => (
          <Link
            key={c}
            href={`/area/${area}?category=${encodeURIComponent(c)}`}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${
              category === c ? "bg-primary text-white" : "bg-dark-card border border-dark-border text-gray-300 hover:border-primary"
            }`}
          >
            {c}
          </Link>
        ))}
      </div>

      {stores && stores.length > 0 ? (
        <div className="flex flex-col gap-4">
          {stores.map((store) => (
            <StoreListItem key={store.id} store={store} casts={castsByStore[store.id]} photos={photosByStore[store.id]} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-dark-card rounded-2xl border border-dark-border">
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-gray-400">{decodedArea}エリアの店舗はまだ登録されていません</p>
        </div>
      )}

      {/* エリア別ブログ記事 */}
      {areaNews && areaNews.length > 0 && (
        <div className="mt-12">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-accent">📝 {decodedArea}の{category ?? "夜遊び"}コラム</h2>
            <Link href="/blog" className="text-primary text-sm hover:underline">すべての記事を見る →</Link>
          </div>
          <div className="divide-y divide-dark-border border border-dark-border rounded-xl overflow-hidden">
            {areaNews.map((post) => (
              <Link key={post.id} href={`/blog/${post.id}`} className="flex items-center gap-4 p-4 bg-dark-card hover:bg-dark transition-colors group">
                <div className="relative w-20 h-16 rounded-lg overflow-hidden shrink-0 bg-dark">
                  {post.thumbnail_url ? (
                    <Image src={post.thumbnail_url} alt={post.title} fill className="object-cover" unoptimized />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-950 to-slate-900 flex items-center justify-center text-2xl">
                      {CATEGORY_EMOJI[post.category] ?? "📝"}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-bold text-sm group-hover:text-primary transition-colors line-clamp-2">{post.title}</div>
                  <div className="text-gray-500 text-xs mt-1">{new Date(post.created_at).toLocaleDateString("ja-JP")}</div>
                </div>
                <span className="text-primary text-xs shrink-0">→</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
