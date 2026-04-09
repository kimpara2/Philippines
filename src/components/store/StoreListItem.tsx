"use client";

// 店舗リスト表示コンポーネント（縦並び・全幅画像スライドショー付き）

import Link from "next/link";
import Image from "next/image";
import type { Store, CastPreview } from "@/types/database";
import { useTranslations } from "next-intl";
import { StoreCardSlideshow } from "./StoreCardSlideshow";

const CATEGORY_COLORS: Record<string, string> = {
  フィリピンパブ: "bg-pink-600",
  スナック: "bg-purple-600",
  ガールズバー: "bg-fuchsia-600",
  バー: "bg-blue-600",
  キャバクラ: "bg-rose-600",
};

export function StoreListItem({
  store,
  casts,
  photos,
}: {
  store: Store;
  casts?: CastPreview[];
  photos?: string[];
}) {
  const t = useTranslations("store");

  const priceText =
    store.min_price && store.max_price
      ? `¥${store.min_price.toLocaleString()}〜¥${store.max_price.toLocaleString()}`
      : store.min_price
      ? `¥${store.min_price.toLocaleString()}〜`
      : null;

  const allImages: string[] = [
    ...(store.cover_image_url ? [store.cover_image_url] : []),
    ...(photos ?? []),
  ];

  const categoryColor = store.category ? (CATEGORY_COLORS[store.category] ?? "bg-gray-600") : null;

  return (
    <Link href={`/stores/${store.slug}`} className="block group">
      <div className="bg-dark-card group-hover:bg-dark border border-dark-border group-hover:border-primary transition-colors overflow-hidden rounded-xl">

        {/* 上：全幅スライドショー */}
        <div className="relative">
          {/* エリア・カテゴリバッジ */}
          <div className="absolute top-2 left-2 z-10 flex gap-1.5 flex-wrap">
            {store.area && (
              <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full font-bold">
                {store.area}
              </span>
            )}
            {store.category && categoryColor && (
              <span className={`${categoryColor} text-white text-xs px-2 py-0.5 rounded-full font-bold`}>
                {store.category}
              </span>
            )}
          </div>
          {/* 求人中バッジ */}
          {store.recruit_enabled && (
            <div className="absolute top-2 right-2 z-10">
              <span className="bg-pink-500 text-white text-xs px-2 py-0.5 rounded-full font-bold animate-pulse">
                求人中
              </span>
            </div>
          )}
          <StoreCardSlideshow images={allImages} storeName={store.name} />
        </div>

        {/* 下：テキスト情報 */}
        <div className="px-4 py-4">
          {/* 店舗名 */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="text-white font-black text-base md:text-lg leading-tight group-hover:text-primary transition-colors">
              {store.name_kana ? (
                <ruby>
                  {store.name}
                  <rt className="text-[10px] font-normal tracking-wide">{store.name_kana}</rt>
                </ruby>
              ) : store.name}
            </h3>
            <svg className="w-4 h-4 text-gray-600 group-hover:text-primary transition-colors shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>

          {/* 説明文 */}
          {store.description && (
            <p className="text-gray-400 text-sm line-clamp-3 mb-3 leading-relaxed">
              {store.description}
            </p>
          )}

          {/* 基本情報グリッド */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 mb-3">
            {store.address && (
              <span className="text-gray-400 text-xs flex items-start gap-1.5">
                <span className="shrink-0 mt-0.5">📍</span>
                <span>{store.address}</span>
              </span>
            )}
            {store.nearest_station && (
              <span className="text-gray-400 text-xs flex items-center gap-1.5">
                <span>🚉</span>
                <span>{store.nearest_station}</span>
              </span>
            )}
            {store.open_hours && (
              <span className="text-gray-400 text-xs flex items-center gap-1.5">
                <span>🕐</span>
                <span>{store.open_hours}</span>
              </span>
            )}
            {store.regular_holiday && (
              <span className="text-gray-400 text-xs flex items-center gap-1.5">
                <span>📅</span>
                <span>定休日：{store.regular_holiday}</span>
              </span>
            )}
            {priceText && (
              <span className="text-accent text-xs font-bold flex items-center gap-1.5">
                <span>💰</span>
                <span>{priceText}</span>
              </span>
            )}
            {store.phone && (
              <span className="text-gray-400 text-xs flex items-center gap-1.5">
                <span>📞</span>
                <span>{store.phone}</span>
              </span>
            )}
          </div>

          {/* 料金システム・初回予算 */}
          {(store.price_system || store.first_visit_budget) && (
            <div className="bg-dark rounded-lg px-3 py-2 mb-3 flex flex-wrap gap-x-4 gap-y-1">
              {store.price_system && (
                <span className="text-gray-300 text-xs">
                  <span className="text-gray-500">料金システム：</span>{store.price_system}
                </span>
              )}
              {store.first_visit_budget && (
                <span className="text-gray-300 text-xs">
                  <span className="text-gray-500">初回予算目安：</span>{store.first_visit_budget}
                </span>
              )}
            </div>
          )}

          {/* キャスト写真 */}
          {casts && casts.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {casts.slice(0, 7).map((cast) => (
                  <div key={cast.id} className="relative w-8 h-8 rounded-full overflow-hidden bg-pink-950 border-2 border-dark-card shrink-0">
                    {cast.profile_image_url ? (
                      <Image src={cast.profile_image_url} alt={cast.name} fill className="object-cover" unoptimized />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-sm">👩</div>
                    )}
                  </div>
                ))}
              </div>
              <span className="text-gray-500 text-xs">{casts.length}{t("castCount")}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
