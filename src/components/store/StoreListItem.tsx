"use client";

// 店舗リスト表示コンポーネント（横幅いっぱい・縦並び用）

import Link from "next/link";
import Image from "next/image";
import type { Store, CastPreview } from "@/types/database";
import { useTranslations } from "next-intl";

export function StoreListItem({ store, casts }: { store: Store; casts?: CastPreview[] }) {
  const t = useTranslations("store");

  const priceText =
    store.min_price && store.max_price
      ? `¥${store.min_price.toLocaleString()}〜¥${store.max_price.toLocaleString()}`
      : store.min_price
      ? `¥${store.min_price.toLocaleString()}〜`
      : null;

  return (
    <Link href={`/stores/${store.slug}`} className="block group">
      <div className="flex h-36 md:h-44 bg-dark-card group-hover:bg-dark border-b border-dark-border group-hover:border-primary transition-colors overflow-hidden">
        {/* 左：正方形画像 */}
        <div className="relative w-36 h-36 md:w-44 md:h-44 shrink-0">
          {store.cover_image_url ? (
            <Image
              src={store.cover_image_url}
              alt={store.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="absolute inset-0 bg-dark-border flex items-center justify-center text-4xl">
              🍹
            </div>
          )}
          {store.area && (
            <div className="absolute top-2 left-2">
              <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full font-bold">
                {store.area}
              </span>
            </div>
          )}
        </div>

        {/* 右：テキスト */}
        <div className="flex-1 flex flex-col justify-center px-5 md:px-8 py-4 min-w-0">
          <h3 className="text-white font-black text-base md:text-xl leading-tight group-hover:text-primary transition-colors mb-1.5">
            {store.name}
          </h3>
          {store.description && (
            <p className="text-gray-400 text-sm line-clamp-2 mb-3 hidden md:block">
              {store.description}
            </p>
          )}
          <div className="flex flex-wrap gap-x-4 gap-y-1">
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

        {/* 右端：矢印 */}
        <div className="flex items-center pr-5 md:pr-8 shrink-0 text-gray-600 group-hover:text-primary transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
