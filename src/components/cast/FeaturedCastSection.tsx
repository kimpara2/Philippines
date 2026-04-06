import Link from "next/link";
import Image from "next/image";

export type FeaturedCast = {
  id: string;
  name: string;
  age: number | null;
  nationality: string | null;
  profile_image_url: string | null;
  description: string | null;
  store: {
    slug: string;
    name: string;
    area: string | null;
    category: string | null;
  };
};

type Props = {
  casts: FeaturedCast[];
  area?: string; // エリアページの場合
};

export function FeaturedCastSection({ casts, area }: Props) {
  if (casts.length === 0) return null;

  const allHref = area
    ? `/cast?area=${encodeURIComponent(area)}`
    : "/cast";

  return (
    <section>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-black text-white flex items-center gap-2">
          <span className="text-2xl">💕</span>
          {area ? `${area}のおすすめ女子` : "おすすめ女子"}
        </h2>
        <Link
          href={allHref}
          className="text-primary hover:text-primary-hover text-sm font-bold transition-colors"
        >
          すべて見る →
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {casts.map((cast) => (
          <Link
            key={cast.id}
            href={`/stores/${cast.store.slug}/cast/${cast.id}`}
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
                  <div className="w-full h-full flex items-center justify-center text-5xl">
                    👩
                  </div>
                )}
                {/* おすすめバッジ */}
                <div className="absolute top-2 left-2">
                  <span className="bg-primary text-white text-xs font-black px-2 py-0.5 rounded-full">
                    ★ おすすめ
                  </span>
                </div>
              </div>

              {/* 情報 */}
              <div className="p-3">
                <div className="text-white font-bold text-sm group-hover:text-primary transition-colors truncate">
                  {cast.name}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                  {cast.age && (
                    <span className="text-gray-400 text-xs">{cast.age}歳</span>
                  )}
                  {cast.nationality && (
                    <span className="text-gray-400 text-xs">🇵🇭</span>
                  )}
                </div>
                <div className="text-gray-500 text-xs mt-1 truncate">
                  {cast.store.name}
                </div>
                {cast.store.area && (
                  <div className="text-gray-600 text-xs truncate">
                    📍 {cast.store.area}
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
