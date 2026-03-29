"use client";

// 店舗カードコンポーネント（店舗一覧ページなどで使う）

import Link from "next/link";
import Image from "next/image";
import type { Store, CastPreview } from "@/types/database";
import { useTranslations } from "next-intl";

type StoreCardProps = {
  store: Store;
  casts?: CastPreview[];
};

export function StoreCard({ store, casts }: StoreCardProps) {
  const t = useTranslations("store");

  const priceText =
    store.min_price && store.max_price
      ? `¥${store.min_price.toLocaleString()}〜¥${store.max_price.toLocaleString()}`
      : store.min_price
      ? `¥${store.min_price.toLocaleString()}〜`
      : t("priceUnknown");

  return (
    <Link href={`/stores/${store.slug}`}>
      <div className="bg-dark-card border border-dark-border rounded-xl overflow-hidden hover:border-primary transition-all duration-200 hover:shadow-lg hover:shadow-primary/10 group flex flex-col">
        {/* カバー画像 */}
        <div className="relative h-48 bg-dark-border overflow-hidden">
          {store.cover_image_url ? (
            <Image
              src={store.cover_image_url}
              alt={store.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-5xl">🍹</span>
            </div>
          )}
          {store.area && (
            <div className="absolute top-2 left-2">
              <span className="bg-primary text-white text-xs px-2 py-1 rounded-full font-bold">
                {store.area}
              </span>
            </div>
          )}
        </div>

        {/* キャスト写真ストリップ */}
        {casts && casts.length > 0 && (
          <div className="px-4 pt-3 pb-1 flex items-center gap-2">
            <div className="flex -space-x-2.5">
              {casts.slice(0, 6).map((cast) => (
                <div key={cast.id} className="relative w-10 h-10 rounded-full overflow-hidden bg-pink-950 border-2 border-dark-card shrink-0">
                  {cast.profile_image_url ? (
                    <Image src={cast.profile_image_url} alt={cast.name} fill className="object-cover" unoptimized />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-base">👩</div>
                  )}
                </div>
              ))}
            </div>
            <span className="text-gray-400 text-xs">{casts.length}{t("castCount")}</span>
          </div>
        )}

        {/* 店舗情報 */}
        <div className="px-4 pb-4 pt-2 flex-1">
          <h3 className="font-bold text-white text-lg leading-tight mb-1 group-hover:text-primary transition-colors">
            {store.name}
          </h3>
          {store.description && (
            <p className="text-gray-400 text-sm mb-3 line-clamp-2">
              {store.description}
            </p>
          )}
          <div className="space-y-1.5">
            {store.address && (
              <div className="flex items-start gap-1.5 text-xs text-gray-400">
                <span className="mt-0.5 shrink-0">📍</span>
                <span className="line-clamp-1">{store.address}</span>
              </div>
            )}
            {store.open_hours && (
              <div className="flex items-start gap-1.5 text-xs text-gray-400">
                <span className="mt-0.5 shrink-0">🕐</span>
                <span>{store.open_hours}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 text-xs text-accent font-bold">
              <span>💰</span>
              <span>{priceText}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
