"use client";

// 店舗リスト表示コンポーネント（縦並び・全幅画像スライドショー付き）

import Link from "next/link";
import Image from "next/image";
import type { Store, CastPreview } from "@/types/database";
import { useTranslations } from "next-intl";
import { StoreCardSlideshow } from "./StoreCardSlideshow";

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

  // カバー画像 + 追加写真をまとめて配列に
  const allImages: string[] = [
    ...(store.cover_image_url ? [store.cover_image_url] : []),
    ...(photos ?? []),
  ];

  return (
    <Link href={`/stores/${store.slug}`} className="block group">
      <div className="bg-dark-card group-hover:bg-dark border border-dark-border group-hover:border-primary transition-colors overflow-hidden rounded-xl">

        {/* 上：全幅スライドショー */}
        <div className="relative">
          {store.area && (
            <div className="absolute top-2 left-2 z-10">
              <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full font-bold">
                {store.area}
              </span>
            </div>
          )}
          <StoreCardSlideshow images={allImages} storeName={store.name} />
        </div>

        {/* 下：テキスト情報 */}
        <div className="px-4 py-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-white font-black text-base md:text-lg leading-tight group-hover:text-primary transition-colors">
              {store.name}
            </h3>
            <svg className="w-4 h-4 text-gray-600 group-hover:text-primary transition-colors shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>

          {store.description && (
            <p className="text-gray-400 text-sm line-clamp-2 mt-1">
              {store.description}
            </p>
          )}

          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
            {store.address && (
              <span className="text-gray-400 text-xs flex items-center gap-1">
                <span>📍</span>
                <span className="line-clamp-1">{store.address}</span>
              </span>
            )}
            {store.open_hours && (
              <span className="text-gray-400 text-xs flex items-center gap-1">
                <span>🕐</span>{store.open_hours}
              </span>
            )}
            {priceText && (
              <span className="text-accent text-xs font-bold flex items-center gap-1">
                <span>💰</span>{priceText}
              </span>
            )}
          </div>

          {/* キャスト写真 */}
          {casts && casts.length > 0 && (
            <div className="flex items-center gap-2 mt-2.5">
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
