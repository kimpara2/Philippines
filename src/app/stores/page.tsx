// 店舗一覧ページ

import { createClient } from "@/lib/supabase/server";
import { StoreListItem } from "@/components/store/StoreListItem";
import Link from "next/link";
import type { Metadata } from "next";
import type { Store, CastPreview } from "@/types/database";

export const metadata: Metadata = {
  title: "店舗一覧",
  description: "全国のフィリピンパブ・スナック一覧",
};

const AREAS = [
  "すすきの", "仙台",
  "新宿", "池袋", "六本木", "錦糸町", "上野", "横浜", "川崎",
  "栄", "錦", "浜松", "静岡",
  "なんば", "心斎橋", "梅田", "北新地", "神戸", "京都",
  "広島", "松山",
  "中洲", "天神", "熊本", "那覇",
];

type SearchParams = {
  area?: string;
  q?: string;
};

type Props = {
  searchParams: Promise<SearchParams>;
};

export default async function StoresPage({ searchParams }: Props) {
  const { area, q } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("stores")
    .select("*")
    .eq("is_published", true)
    .eq("is_approved", true);

  // エリアフィルター
  if (area) {
    query = query.eq("area", area);
  }

  // キーワード検索
  if (q) {
    query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%`);
  }

  const { data: storesRaw } = await query;
  // 管理者追加店舗（owner_id = null）を先頭に、それ以外はランダム順
  const allStores = (storesRaw as Store[] | null) ?? [];
  const adminStores = allStores.filter((s) => s.owner_id === null);
  const otherStores = allStores.filter((s) => s.owner_id !== null).sort(() => Math.random() - 0.5);
  const stores = [...adminStores, ...otherStores];

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

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-black text-white mb-2">
        🏪 店舗一覧
        {area && <span className="text-primary ml-2">— {area}</span>}
      </h1>
      <p className="text-gray-400 text-sm mb-8">
        {stores?.length ?? 0}件の店舗が見つかりました
      </p>

      {/* エリアフィルター */}
      <div className="flex flex-wrap gap-2 mb-8">
        <Link
          href="/stores"
          className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${
            !area
              ? "bg-primary text-white"
              : "bg-dark-card border border-dark-border text-gray-300 hover:border-primary"
          }`}
        >
          すべて
        </Link>
        {AREAS.map((a) => (
          <Link
            key={a}
            href={`/stores?area=${a}`}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${
              area === a
                ? "bg-primary text-white"
                : "bg-dark-card border border-dark-border text-gray-300 hover:border-primary"
            }`}
          >
            {a}
          </Link>
        ))}
      </div>

      {/* 店舗リスト */}
      {stores && stores.length > 0 ? (
        <div className="flex flex-col gap-4">
          {stores.map((store) => (
            <StoreListItem key={store.id} store={store} casts={castsByStore[store.id]} photos={photosByStore[store.id]} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-dark-card rounded-2xl border border-dark-border">
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-gray-400 text-lg">
            {q || area ? "条件に合う店舗が見つかりませんでした" : "店舗がまだ登録されていません"}
          </p>
        </div>
      )}
    </div>
  );
}
