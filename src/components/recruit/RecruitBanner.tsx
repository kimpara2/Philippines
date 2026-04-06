import Link from "next/link";

type Props = {
  area?: string; // 指定するとそのエリアの求人ページへ
  count?: number;
};

export function RecruitBanner({ area, count }: Props) {
  const href = area
    ? `/recruit?area=${encodeURIComponent(area)}`
    : "/recruit";

  const label = area ? `${area}の求人情報` : "求人情報";

  return (
    <Link
      href={href}
      className="group flex items-center justify-between gap-4 bg-gradient-to-r from-pink-950/60 to-purple-950/60 hover:from-pink-900/70 hover:to-purple-900/70 border border-pink-500/40 hover:border-pink-400/70 rounded-2xl px-6 py-5 transition-all"
    >
      <div className="flex items-center gap-4">
        <div className="text-4xl">💼</div>
        <div>
          <div className="text-pink-300 font-black text-lg group-hover:text-pink-200 transition-colors">
            {label}はこちら
          </div>
          <div className="text-gray-400 text-sm mt-0.5">
            {count !== undefined && count > 0
              ? `現在${count}件の求人を掲載中`
              : "キャスト・スタッフ募集中のお店"}
          </div>
        </div>
      </div>
      <div className="shrink-0 bg-pink-500 group-hover:bg-pink-400 text-white font-black px-5 py-2.5 rounded-xl text-sm transition-colors">
        求人を見る →
      </div>
    </Link>
  );
}
