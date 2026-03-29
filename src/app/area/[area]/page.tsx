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
  東京:  ["新宿", "池袋", "六本木", "錦糸町", "上野"],
  大阪:  ["なんば", "心斎橋", "梅田", "北新地"],
  神奈川: ["横浜", "川崎"],
  愛知:  ["栄", "錦", "大須"],
  静岡:  ["浜松", "静岡市", "沼津"],
  北海道: ["すすきの", "札幌"],
  福岡:  ["中洲", "天神", "博多"],
  兵庫:  ["神戸", "三宮"],
  京都:  ["木屋町", "先斗町"],
  広島:  ["流川", "紙屋町"],
  宮城:  ["国分町", "仙台"],
  沖縄:  ["松山", "栄町"],
};

type Props = {
  params: Promise<{ area: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { area } = await params;
  const decodedArea = decodeURIComponent(area);
  const subAreas = PREFECTURE_AREAS[decodedArea];
  const searchAreas = subAreas ? [decodedArea, ...subAreas] : [decodedArea];

  const supabase = await createClient();
  const { count } = await supabase
    .from("stores")
    .select("*", { count: "exact", head: true })
    .in("area", searchAreas)
    .eq("is_published", true)
    .eq("is_approved", true);

  const countText = count ? `${count}件掲載中` : "";
  const title = `${decodedArea}のフィリピンパブ一覧${count ? `【${count}件】` : ""}`;
  const description = `${decodedArea}のフィリピンパブ・スナック情報${countText}。${decodedArea}でフィリピンパブをお探しなら「フィリピンパブどっと混む！！」へ。営業時間・料金・アクセス・キャスト情報も充実。`;

  return {
    title,
    description,
    openGraph: {
      title: `${title} | フィリピンパブどっと混む！！`,
      description,
    },
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/area/${area}`,
    },
  };
}

export default async function AreaPage({ params }: Props) {
  const { area } = await params;
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

  const { data: storesRaw } = await supabase
    .from("stores")
    .select("*")
    .in("area", searchAreas)
    .eq("is_published", true)
    .eq("is_approved", true);
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

  // エリア別ブログ記事を取得
  const { data: areaNewsRaw } = await supabase
    .from("site_news")
    .select("id, title, body, category, thumbnail_url, created_at")
    .eq("area", decodedArea)
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(3);
  const areaNews = areaNewsRaw as AreaNews[] | null;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const jsonLd = JSON.stringify([
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "トップ", item: siteUrl },
        { "@type": "ListItem", position: 2, name: "店舗一覧", item: siteUrl + "/stores" },
        { "@type": "ListItem", position: 3, name: decodedArea + "のフィリピンパブ" },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: decodedArea + "のフィリピンパブ一覧",
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

      <h1 className="text-2xl font-black text-white mb-2">
        📍 {decodedArea}のフィリピンパブ
      </h1>
      <p className="text-gray-400 text-sm mb-8">{stores?.length ?? 0}件掲載中</p>

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
            <h2 className="text-lg font-bold text-accent">📝 {decodedArea}のフィリピンパブ情報</h2>
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
