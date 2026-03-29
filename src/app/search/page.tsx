// 検索結果ページ

import { createClient } from "@/lib/supabase/server";
import { StoreCard } from "@/components/store/StoreCard";
import Link from "next/link";
import type { Metadata } from "next";
import type { Store } from "@/types/database";

type Props = {
  searchParams: Promise<{ q?: string }>;
};

export const metadata: Metadata = {
  title: "検索結果",
};

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const supabase = await createClient();

  let stores: Store[] | null = null;
  if (q && q.trim()) {
    const { data } = await supabase
      .from("stores")
      .select("*")
      .eq("is_published", true)
      .eq("is_approved", true)
      .or(`name.ilike.%${q}%,description.ilike.%${q}%,area.ilike.%${q}%,address.ilike.%${q}%`)
      .order("created_at", { ascending: false });
    stores = data as Store[] | null;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <nav className="text-sm text-gray-400 mb-6">
        <Link href="/" className="hover:text-primary">トップ</Link>
        <span className="mx-2">›</span>
        <span className="text-white">検索結果</span>
      </nav>

      <h1 className="text-2xl font-black text-white mb-2">
        🔍 &quot;{q}&quot; の検索結果
      </h1>
      <p className="text-gray-400 text-sm mb-8">
        {stores ? `${stores.length}件見つかりました` : "キーワードを入力してください"}
      </p>

      {/* 検索フォーム */}
      <form action="/search" method="get" className="flex gap-2 mb-10 max-w-lg">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="店舗名・エリアで検索..."
          className="flex-1 bg-dark-card border border-dark-border rounded-full px-5 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary"
        />
        <button
          type="submit"
          className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-full font-bold transition-colors"
        >
          検索
        </button>
      </form>

      {stores && stores.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {stores.map((store) => (
            <StoreCard key={store.id} store={store} />
          ))}
        </div>
      ) : q ? (
        <div className="text-center py-20 bg-dark-card rounded-2xl border border-dark-border">
          <div className="text-5xl mb-4">😢</div>
          <p className="text-gray-400">&quot;{q}&quot; に一致する店舗が見つかりませんでした</p>
        </div>
      ) : null}
    </div>
  );
}
