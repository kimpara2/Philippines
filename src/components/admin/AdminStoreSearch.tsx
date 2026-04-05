"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";

const CATEGORIES = [
  "すべて",
  "フィリピンパブ",
  "スナック",
  "ガールズバー",
  "キャバクラ",
  "その他",
];

export function AdminStoreSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentQ = searchParams.get("q") ?? "";
  const currentCategory = searchParams.get("category") ?? "";

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  return (
    <div className="mb-6 space-y-3">
      {/* 店舗名検索 */}
      <input
        type="search"
        placeholder="🔍 店舗名で検索..."
        defaultValue={currentQ}
        onChange={(e) => update("q", e.target.value)}
        className="w-full bg-dark-card border border-dark-border rounded-lg px-4 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-primary"
      />

      {/* カテゴリフィルター */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => {
          const active = cat === "すべて" ? !currentCategory : currentCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => update("category", cat === "すべて" ? "" : cat)}
              className={`text-xs px-3 py-1.5 rounded-full font-bold transition-colors border ${
                active
                  ? "bg-primary border-primary text-white"
                  : "border-dark-border text-gray-400 hover:border-primary/50 hover:text-white"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
}
