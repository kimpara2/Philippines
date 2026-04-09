// 求人一覧ページ

import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

const ALL_AREAS = [
  "浜松", "静岡市", "沼津", "静岡",
  "栄", "錦", "大須", "名古屋", "愛知",
  "岐阜市", "岐阜",
  "四日市", "三重",
];

const ALL_CATEGORIES = ["フィリピンパブ", "スナック", "ガールズバー", "バー", "キャバクラ"];

// 職種別SEOテキスト
const CATEGORY_SEO_TEXT: Record<string, string> = {
  フィリピンパブ: "フィリピンパブのスタッフ求人を掲載中。未経験・日本語不問のお店も多く、フレンドリーな環境で働けます。シフト自由・日払い対応など働きやすい条件が揃っています。",
  スナック: "スナックのスタッフ・ママ求人を掲載中。アットホームな雰囲気のお店が多く、未経験の方も歓迎。自分のペースで無理なく働けるお店を探せます。",
  ガールズバー: "ガールズバーのスタッフ求人を掲載中。おしゃれな空間で楽しく働けるお店をご紹介。未経験OK・短時間勤務可能な求人も多数掲載。",
  バー: "バースタッフの求人を掲載中。カクテル・お酒の知識が活かせるお店から未経験歓迎のお店まで幅広く掲載しています。",
  キャバクラ: "キャバクラスタッフ・キャストの求人を掲載中。高収入・日払い対応・送迎ありの好条件求人をご紹介。",
};

// エリア×職種のSEOテキスト（浜松特化）
const AREA_CATEGORY_SEO_TEXT: Record<string, Record<string, string>> = {
  浜松: {
    フィリピンパブ: "浜松市のフィリピンパブ求人を掲載中。浜松駅周辺のフィリピンパブでスタッフを募集しています。未経験・日本語不問のお店も多く、しっかり稼げる環境が揃っています。",
    スナック: "浜松市のスナック求人を掲載中。浜松のアットホームなスナックで一緒に働きませんか？未経験歓迎・シフト自由・日払い対応のお店も多数。",
    ガールズバー: "浜松市のガールズバー求人を掲載中。浜松駅周辺のおしゃれなガールズバーでスタッフを募集。未経験OK・短時間勤務可能。",
  },
};

type Props = {
  searchParams: Promise<{ area?: string; category?: string }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { area, category } = await searchParams;
  const areaLabel = area ?? "東海エリア";
  const categoryLabel = category ?? "ナイトワーク";
  const title = area || category
    ? `${areaLabel}の${categoryLabel}求人情報`
    : "東海エリアの求人情報";
  const description = area || category
    ? `${areaLabel}の${categoryLabel}求人を掲載。給与・待遇・シフトを確認して気軽に応募できます。未経験歓迎の求人も多数。`
    : "東海エリア（浜松・静岡・名古屋・岐阜）のフィリピンパブ・スナック・ガールズバー等の求人情報一覧。未経験歓迎の求人も多数。";
  const keywords = [
    ...(area ? [`${area} 求人`, `${area} ${categoryLabel} 求人`] : []),
    ...(category ? [`${category} 求人`, `${category} バイト`] : []),
    "フィリピンパブ 求人", "スナック 求人", "ガールズバー 求人", "東海 夜職",
  ];
  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/recruit${area ? `?area=${encodeURIComponent(area)}` : ""}${category ? `${area ? "&" : "?"}category=${encodeURIComponent(category)}` : ""}`,
    },
  };
}

export default async function RecruitPage({ searchParams }: Props) {
  const { area, category } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("stores")
    .select("id, slug, name, area, category, cover_image_url, recruit_title, recruit_salary, recruit_hours, recruit_benefits, recruit_pr")
    .eq("is_published", true)
    .eq("is_approved", true)
    .eq("recruit_enabled", true)
    .order("created_at", { ascending: false });

  if (area) query = query.ilike("area", `%${area}%`);
  if (category) query = query.eq("category", category);

  const { data: stores } = await query;
  const storeList = stores ?? [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* パンくず */}
      <nav className="text-sm text-gray-400 mb-6">
        <Link href="/" className="hover:text-primary">トップ</Link>
        <span className="mx-2">›</span>
        <span className="text-white">求人情報</span>
        {area && (
          <>
            <span className="mx-2">›</span>
            <span className="text-white">{area}</span>
          </>
        )}
      </nav>

      <div className="mb-4">
        <h1 className="text-2xl font-black text-white mb-2">
          💼 {area || category ? `${area ?? "東海エリア"}の${category ?? "ナイトワーク"}求人` : "東海エリアの求人情報"}
        </h1>
        <p className="text-gray-400 text-sm mb-3">
          {storeList.length > 0 ? `${storeList.length}件の求人を掲載中` : "現在掲載中の求人はありません"}
        </p>
        {(() => {
          const text = (area && category && AREA_CATEGORY_SEO_TEXT[area]?.[category])
            || (category && CATEGORY_SEO_TEXT[category]);
          return text ? <p className="text-gray-400 text-sm mb-4 leading-relaxed">{text}</p> : null;
        })()}
      </div>

      {/* 職種フィルター */}
      <div className="flex flex-wrap gap-2 mb-3">
        <Link href={area ? `/recruit?area=${encodeURIComponent(area)}` : "/recruit"}
          className={`text-xs px-3 py-1.5 rounded-full font-bold border transition-colors ${!category ? "bg-pink-500 border-pink-500 text-white" : "border-dark-border text-gray-400 hover:border-pink-400/60 hover:text-white"}`}
        >すべて</Link>
        {ALL_CATEGORIES.map((c) => (
          <Link key={c}
            href={`/recruit?${area ? `area=${encodeURIComponent(area)}&` : ""}category=${encodeURIComponent(c)}`}
            className={`text-xs px-3 py-1.5 rounded-full font-bold border transition-colors ${category === c ? "bg-pink-500 border-pink-500 text-white" : "border-dark-border text-gray-400 hover:border-pink-400/60 hover:text-white"}`}
          >{c}</Link>
        ))}
      </div>

      {/* エリアフィルター */}
      <div className="flex flex-wrap gap-2 mb-8">
        <Link href={category ? `/recruit?category=${encodeURIComponent(category)}` : "/recruit"}
          className={`text-xs px-3 py-1.5 rounded-full font-bold border transition-colors ${!area ? "bg-purple-600 border-purple-600 text-white" : "border-dark-border text-gray-400 hover:border-purple-400/60 hover:text-white"}`}
        >全エリア</Link>
        {ALL_AREAS.map((a) => (
          <Link key={a}
            href={`/recruit?area=${encodeURIComponent(a)}${category ? `&category=${encodeURIComponent(category)}` : ""}`}
            className={`text-xs px-3 py-1.5 rounded-full font-bold border transition-colors ${area === a ? "bg-purple-600 border-purple-600 text-white" : "border-dark-border text-gray-400 hover:border-purple-400/60 hover:text-white"}`}
          >{a}</Link>
        ))}
      </div>

      {/* 求人リスト */}
      {storeList.length > 0 ? (
        <div className="space-y-5">
          {storeList.map((store) => (
            <div
              key={store.id}
              className="bg-dark-card border border-dark-border hover:border-pink-500/50 rounded-2xl overflow-hidden transition-all"
            >
              {/* 店舗ヘッダー */}
              <div className="flex items-center gap-4 p-5 border-b border-dark-border">
                <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-dark shrink-0">
                  {store.cover_image_url ? (
                    <Image src={store.cover_image_url} alt={store.name} fill className="object-cover" unoptimized />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">🍹</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link href={`/stores/${store.slug}`} className="text-white font-black text-lg hover:text-primary transition-colors">
                      {store.name}
                    </Link>
                    {store.category && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-purple-900/40 text-purple-300 font-bold">{store.category}</span>
                    )}
                    {store.area && (
                      <span className="text-gray-400 text-sm">📍 {store.area}</span>
                    )}
                  </div>
                  {store.recruit_title && (
                    <div className="text-pink-300 font-bold text-sm mt-0.5">{store.recruit_title}</div>
                  )}
                </div>
              </div>

              {/* 求人詳細 */}
              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {store.recruit_salary && (
                  <div>
                    <div className="text-gray-500 text-xs mb-1">💰 給与・報酬</div>
                    <div className="text-white text-sm whitespace-pre-wrap">{store.recruit_salary}</div>
                  </div>
                )}
                {store.recruit_hours && (
                  <div>
                    <div className="text-gray-500 text-xs mb-1">🕐 勤務時間・シフト</div>
                    <div className="text-white text-sm whitespace-pre-wrap">{store.recruit_hours}</div>
                  </div>
                )}
                {store.recruit_benefits && (
                  <div className="sm:col-span-2">
                    <div className="text-gray-500 text-xs mb-1">🎁 待遇・福利厚生</div>
                    <div className="text-white text-sm whitespace-pre-wrap">{store.recruit_benefits}</div>
                  </div>
                )}
                {store.recruit_pr && (
                  <div className="sm:col-span-2 bg-dark rounded-xl p-4">
                    <div className="text-accent text-xs font-bold mb-1">✨ お店からのメッセージ</div>
                    <div className="text-gray-200 text-sm whitespace-pre-wrap">{store.recruit_pr}</div>
                  </div>
                )}
              </div>

              {/* 応募ボタン */}
              <div className="px-5 pb-5 flex gap-3">
                <Link
                  href={`/stores/${store.slug}/apply`}
                  className="flex-1 text-center bg-pink-600 hover:bg-pink-500 text-white font-black py-3 rounded-xl transition-colors"
                >
                  📩 この店舗に応募する
                </Link>
                <Link
                  href={`/stores/${store.slug}`}
                  className="border border-dark-border hover:border-primary text-gray-400 hover:text-white font-bold px-4 py-3 rounded-xl text-sm transition-colors"
                >
                  店舗詳細
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-dark-card border border-dark-border rounded-2xl">
          <div className="text-5xl mb-4">📭</div>
          <p className="text-gray-400">
            {area ? `${area}エリアの求人は現在ありません` : "現在掲載中の求人はありません"}
          </p>
          {area && (
            <Link href="/recruit" className="text-primary text-sm hover:underline mt-3 inline-block">
              すべてのエリアの求人を見る →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
