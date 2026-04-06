// キャスト一覧ページ

import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

const ALL_AREAS = [
  "浜松", "静岡市", "沼津",
  "栄", "錦", "大須", "名古屋",
  "岐阜市",
  "四日市",
];

type Props = {
  searchParams: Promise<{ area?: string; all?: string }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { area } = await searchParams;
  const title = area ? `${area}の女の子一覧` : "おすすめ女子一覧";
  const description = area
    ? `${area}のフィリピンパブ・スナック在籍キャスト一覧。かわいい女の子が勢揃い。`
    : "東海エリアのフィリピンパブ・スナック在籍キャスト一覧。おすすめの女の子をピックアップ。";
  return { title, description };
}

export default async function CastListPage({ searchParams }: Props) {
  const { area, all } = await searchParams;
  const supabase = await createClient();

  // store の area でフィルタするため join が必要
  // cast_members → stores を結合して取得
  let query = supabase
    .from("cast_members")
    .select(`
      id, name, age, nationality, profile_image_url, description, is_featured,
      stores!inner(slug, name, area, category, is_published, is_approved)
    `)
    .eq("is_active", true)
    .eq("stores.is_published", true)
    .eq("stores.is_approved", true)
    .order("is_featured", { ascending: false })
    .order("sort_order");

  // エリア指定
  if (area) {
    query = query.ilike("stores.area", `%${area}%`);
  }

  // 「すべて見る」でなければおすすめのみ（上位20件）
  if (!all) {
    query = query.eq("is_featured", true).limit(30);
  } else {
    query = query.limit(100);
  }

  const { data: castsRaw } = await query;

  type CastRow = {
    id: string;
    name: string;
    age: number | null;
    nationality: string | null;
    profile_image_url: string | null;
    description: string | null;
    is_featured: boolean;
    stores: { slug: string; name: string; area: string | null; category: string | null };
  };

  const casts = (castsRaw ?? []) as unknown as CastRow[];

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* パンくず */}
      <nav className="text-sm text-gray-400 mb-6">
        <Link href="/" className="hover:text-primary">トップ</Link>
        <span className="mx-2">›</span>
        <span className="text-white">{area ? `${area}の女の子一覧` : "おすすめ女子一覧"}</span>
      </nav>

      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <span>💕</span>
            {area ? `${area}の女の子一覧` : "おすすめ女子一覧"}
          </h1>
          <p className="text-gray-400 text-sm mt-1">{casts.length}人掲載中</p>
        </div>
        {/* おすすめ ↔ すべて切り替え */}
        <div className="flex gap-2">
          <Link
            href={area ? `/cast?area=${encodeURIComponent(area)}` : "/cast"}
            className={`text-xs px-4 py-2 rounded-full font-bold border transition-colors ${
              !all ? "bg-primary border-primary text-white" : "border-dark-border text-gray-400 hover:border-primary hover:text-white"
            }`}
          >
            ★ おすすめ
          </Link>
          <Link
            href={area ? `/cast?area=${encodeURIComponent(area)}&all=1` : "/cast?all=1"}
            className={`text-xs px-4 py-2 rounded-full font-bold border transition-colors ${
              all ? "bg-primary border-primary text-white" : "border-dark-border text-gray-400 hover:border-primary hover:text-white"
            }`}
          >
            すべて
          </Link>
        </div>
      </div>

      {/* エリアフィルター */}
      <div className="flex flex-wrap gap-2 mb-8">
        <Link
          href={all ? "/cast?all=1" : "/cast"}
          className={`text-xs px-3 py-1.5 rounded-full font-bold border transition-colors ${
            !area ? "bg-accent border-accent text-black" : "border-dark-border text-gray-400 hover:border-accent/60 hover:text-white"
          }`}
        >
          すべてのエリア
        </Link>
        {ALL_AREAS.map((a) => (
          <Link
            key={a}
            href={`/cast?area=${encodeURIComponent(a)}${all ? "&all=1" : ""}`}
            className={`text-xs px-3 py-1.5 rounded-full font-bold border transition-colors ${
              area === a ? "bg-accent border-accent text-black" : "border-dark-border text-gray-400 hover:border-accent/60 hover:text-white"
            }`}
          >
            {a}
          </Link>
        ))}
      </div>

      {/* キャストグリッド */}
      {casts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {casts.map((cast) => (
            <Link
              key={cast.id}
              href={`/stores/${cast.stores.slug}/cast/${cast.id}`}
              className="group"
            >
              <div className="bg-dark-card border border-dark-border hover:border-primary rounded-xl overflow-hidden transition-all hover:shadow-lg hover:shadow-primary/10">
                {/* 写真 */}
                <div className="relative aspect-[3/4] bg-dark overflow-hidden">
                  {cast.profile_image_url ? (
                    <Image
                      src={cast.profile_image_url}
                      alt={cast.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl">👩</div>
                  )}
                  {cast.is_featured && (
                    <div className="absolute top-2 left-2">
                      <span className="bg-primary text-white text-xs font-black px-2 py-0.5 rounded-full">★ おすすめ</span>
                    </div>
                  )}
                </div>

                {/* 情報 */}
                <div className="p-3">
                  <div className="text-white font-bold text-sm group-hover:text-primary transition-colors truncate">
                    {cast.name}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {cast.age && <span className="text-gray-400 text-xs">{cast.age}歳</span>}
                    {cast.nationality && <span className="text-gray-400 text-xs">🇵🇭</span>}
                  </div>
                  <div className="text-gray-500 text-xs mt-1 truncate">{cast.stores.name}</div>
                  {cast.stores.area && (
                    <div className="text-gray-600 text-xs truncate">📍 {cast.stores.area}</div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-dark-card border border-dark-border rounded-2xl">
          <div className="text-5xl mb-4">👩</div>
          <p className="text-gray-400">
            {area ? `${area}エリアのキャストは現在いません` : "おすすめキャストはまだいません"}
          </p>
        </div>
      )}
    </div>
  );
}
