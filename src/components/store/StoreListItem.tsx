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

          {/* SNSアイコン */}
          {(store.instagram_url || store.twitter_url || store.tiktok_url || store.website_url) && (
            <div className="flex items-center gap-3 mb-3">
              {store.instagram_url && (
                <span onClick={(e) => { e.preventDefault(); window.open(store.instagram_url!, "_blank"); }}
                  className="text-pink-400 hover:text-pink-300 transition-colors cursor-pointer" title="Instagram">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </span>
              )}
              {store.twitter_url && (
                <span onClick={(e) => { e.preventDefault(); window.open(store.twitter_url!, "_blank"); }}
                  className="text-gray-300 hover:text-white transition-colors cursor-pointer" title="X (Twitter)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </span>
              )}
              {store.tiktok_url && (
                <span onClick={(e) => { e.preventDefault(); window.open(store.tiktok_url!, "_blank"); }}
                  className="text-gray-300 hover:text-white transition-colors cursor-pointer" title="TikTok">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.2 8.2 0 004.79 1.52V6.75a4.85 4.85 0 01-1.02-.06z"/>
                  </svg>
                </span>
              )}
              {store.website_url && (
                <span onClick={(e) => { e.preventDefault(); window.open(store.website_url!, "_blank"); }}
                  className="text-gray-400 hover:text-white transition-colors cursor-pointer" title="公式サイト">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
                  </svg>
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
