// 店舗一覧ページ

import { createClient } from "@/lib/supabase/server";
import { StoreListItem } from "@/components/store/StoreListItem";
import Link from "next/link";
import type { Metadata } from "next";
import type { Store, CastPreview } from "@/types/database";

export const metadata: Metadata = {
  title: "店舗一覧",
  description: "東海エリアのフィリピンパブ・スナック・ガールズバー・バー・キャバクラ一覧",
};

const AREAS = [
  "栄", "錦", "大須", "名古屋",
  "浜松", "静岡市", "沼津",
  "岐阜市",
  "四日市",
];

const CATEGORIES = [
  "フィリピンパブ",
  "スナック",
  "ガールズバー",
  "バー",
  "キャバクラ",
];

type SearchParams = {
  area?: string;
  q?: string;
  category?: string;
};

type Props = {
  searchParams: Promise<SearchParams>;
};

export default async function StoresPage({ searchParams }: Props) {
  const { area, q, category } = await searchParams;
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

  // カテゴリフィルター
  if (category) {
    query = query.eq("category", category);
  }

  // キーワード検索
  if (q) {
    query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%`);
  }

  // 管理者ユーザーのIDを取得
  const { data: adminProfiles } = await supabase
    .from("profiles")
    .select("id")
    .eq("role", "admin");
  const adminIds = new Set((adminProfiles ?? []).map((p: { id: string }) => p.id));

  const { data: storesRaw } = await query;
  // 管理者の店舗を先頭に、それ以外はランダム順
  const allStores = (storesRaw as Store[] | null) ?? [];
  const adminStores = allStores.filter((s) => s.owner_id && adminIds.has(s.owner_id));
  const otherStores = allStores.filter((s) => !s.owner_id || !adminIds.has(s.owner_id)).sort(() => Math.random() - 0.5);
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
        {category && <span className="text-primary ml-2">— {category}</span>}
        {area && <span className="text-primary ml-2">— {area}</span>}
      </h1>
      <p className="text-gray-400 text-sm mb-8">
        {stores?.length ?? 0}件の店舗が見つかりました
      </p>

      {/* カテゴリフィルター */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Link
          href={area ? `/stores?area=${area}` : "/stores"}
          className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${
            !category
              ? "bg-primary text-white"
              : "bg-dark-card border border-dark-border text-gray-300 hover:border-primary"
          }`}
        >
          すべて
        </Link>
        {CATEGORIES.map((c) => (
          <Link
            key={c}
            href={`/stores?category=${encodeURIComponent(c)}${area ? `&area=${area}` : ""}`}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${
              category === c
                ? "bg-primary text-white"
                : "bg-dark-card border border-dark-border text-gray-300 hover:border-primary"
            }`}
          >
            {c}
          </Link>
        ))}
      </div>

      {/* エリアフィルター */}
      <div className="flex flex-wrap gap-2 mb-8">
        <Link
          href={category ? `/stores?category=${encodeURIComponent(category)}` : "/stores"}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
            !area
              ? "bg-accent text-dark"
              : "bg-dark-card border border-dark-border text-gray-400 hover:border-accent"
          }`}
        >
          全エリア
        </Link>
        {AREAS.map((a) => (
          <Link
            key={a}
            href={`/stores?area=${a}${category ? `&category=${encodeURIComponent(category)}` : ""}`}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
              area === a
                ? "bg-accent text-dark"
                : "bg-dark-card border border-dark-border text-gray-400 hover:border-accent"
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
