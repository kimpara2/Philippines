import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

type Props = { params: Promise<{ area: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { area } = await params;
  const decodedArea = decodeURIComponent(area);
  return {
    title: `${decodedArea}のフィリピンパブ ランキングTOP20`,
    description: `${decodedArea}エリアのフィリピンパブおすすめランキング。厳選TOP20を紹介します。`,
  };
}

type RankingRow = {
  rank: number;
  store: {
    id: string;
    slug: string;
    name: string;
    area: string | null;
    address: string | null;
    open_hours: string | null;
    min_price: number | null;
    max_price: number | null;
    cover_image_url: string | null;
    description: string | null;
  };
};

export default async function RankingAreaPage({ params }: Props) {
  const { area } = await params;
  const decodedArea = decodeURIComponent(area);
  const supabase = await createClient();

  const { data: rankingsRaw } = await supabase
    .from("store_rankings")
    .select(`
      rank,
      store:stores(id, slug, name, area, address, open_hours, min_price, max_price, cover_image_url, description)
    `)
    .eq("area", decodedArea)
    .order("rank");

  const rankings = (rankingsRaw as unknown as RankingRow[]) ?? [];

  const rankBadge = (rank: number) => {
    if (rank === 1) return <span className="text-3xl">🥇</span>;
    if (rank === 2) return <span className="text-3xl">🥈</span>;
    if (rank === 3) return <span className="text-3xl">🥉</span>;
    return <span className="text-lg font-black text-gray-400">{rank}位</span>;
  };

  const rankBg = (rank: number) => {
    if (rank === 1) return "border-yellow-400/50 bg-yellow-400/5";
    if (rank === 2) return "border-gray-300/50 bg-gray-300/5";
    if (rank === 3) return "border-amber-600/50 bg-amber-600/5";
    return "border-dark-border";
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* パンくず */}
      <nav className="text-sm text-gray-400 mb-6">
        <Link href="/" className="hover:text-primary">トップ</Link>
        <span className="mx-2">›</span>
        <Link href={`/area/${encodeURIComponent(decodedArea)}`} className="hover:text-primary">{decodedArea}</Link>
        <span className="mx-2">›</span>
        <span className="text-white">ランキング</span>
      </nav>

      <h1 className="text-2xl font-black text-white mb-1">
        🏆 {decodedArea}のフィリピンパブ ランキング
      </h1>
      <p className="text-gray-400 text-sm mb-8">編集部が厳選したTOP{rankings.length}をご紹介</p>

      {rankings.length === 0 ? (
        <div className="bg-dark-card border border-dark-border rounded-2xl p-12 text-center">
          <div className="text-5xl mb-4">🏆</div>
          <p className="text-gray-400">ランキングはまだ公開されていません</p>
          <Link href={`/area/${encodeURIComponent(decodedArea)}`} className="text-primary hover:underline text-sm mt-4 inline-block">
            ← {decodedArea}の店舗一覧を見る
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {rankings.map(({ rank, store }) => (
            <Link key={store.id} href={`/stores/${store.slug}`}>
              <div className={`bg-dark-card border rounded-xl overflow-hidden hover:border-primary transition-all duration-200 ${rankBg(rank)}`}>
                <div className="flex gap-4 p-4">
                  {/* 順位バッジ */}
                  <div className="w-14 shrink-0 flex flex-col items-center justify-center">
                    {rankBadge(rank)}
                  </div>

                  {/* カバー画像 */}
                  <div className="relative w-24 h-24 md:w-32 md:h-32 shrink-0 rounded-lg overflow-hidden bg-dark-border">
                    {store.cover_image_url ? (
                      <Image
                        src={store.cover_image_url}
                        alt={store.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl">🍹</div>
                    )}
                  </div>

                  {/* 店舗情報 */}
                  <div className="flex-1 min-w-0">
                    <h2 className="font-black text-white text-lg leading-tight mb-1 truncate">
                      {store.name}
                    </h2>
                    {store.description && (
                      <p className="text-gray-400 text-sm line-clamp-2 mb-2">{store.description}</p>
                    )}
                    <div className="space-y-0.5">
                      {store.address && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                          <span>📍</span><span className="truncate">{store.address}</span>
                        </div>
                      )}
                      {store.open_hours && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                          <span>🕐</span><span>{store.open_hours}</span>
                        </div>
                      )}
                      {(store.min_price || store.max_price) && (
                        <div className="flex items-center gap-1.5 text-xs text-accent font-bold">
                          <span>💰</span>
                          <span>
                            {store.min_price ? `¥${store.min_price.toLocaleString()}` : ""}
                            {store.min_price && store.max_price ? "〜" : ""}
                            {store.max_price ? `¥${store.max_price.toLocaleString()}` : ""}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-8 text-center">
        <Link
          href={`/area/${encodeURIComponent(decodedArea)}`}
          className="text-primary hover:underline text-sm"
        >
          ← {decodedArea}の全店舗を見る
        </Link>
      </div>
    </div>
  );
}
