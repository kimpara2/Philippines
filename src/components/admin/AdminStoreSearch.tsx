"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";

const CATEGORIES = ["フィリピンパブ", "スナック", "ガールズバー", "キャバクラ", "その他"];

const AREAS = ["愛知", "栄", "錦", "大須", "名古屋", "静岡", "浜松", "静岡市", "沼津", "岐阜", "岐阜市", "三重", "四日市"];

export function AdminStoreSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentQ = searchParams.get("q") ?? "";
  const currentCategory = searchParams.get("category") ?? "";
  const currentArea = searchParams.get("area") ?? "";

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
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-gray-500 text-xs w-12 shrink-0">種別</span>
        <button
          onClick={() => update("category", "")}
          className={`text-xs px-3 py-1.5 rounded-full font-bold transition-colors border ${
            !currentCategory ? "bg-primary border-primary text-white" : "border-dark-border text-gray-400 hover:border-primary/50 hover:text-white"
          }`}
        >
          すべて
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => update("category", currentCategory === cat ? "" : cat)}
            className={`text-xs px-3 py-1.5 rounded-full font-bold transition-colors border ${
              currentCategory === cat
                ? "bg-primary border-primary text-white"
                : "border-dark-border text-gray-400 hover:border-primary/50 hover:text-white"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 地域フィルター */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-gray-500 text-xs w-12 shrink-0">地域</span>
        <button
          onClick={() => update("area", "")}
          className={`text-xs px-3 py-1.5 rounded-full font-bold transition-colors border ${
            !currentArea ? "bg-accent border-accent text-black" : "border-dark-border text-gray-400 hover:border-accent/50 hover:text-white"
          }`}
        >
          すべて
        </button>
        {AREAS.map((area) => (
          <button
            key={area}
            onClick={() => update("area", currentArea === area ? "" : area)}
            className={`text-xs px-3 py-1.5 rounded-full font-bold transition-colors border ${
              currentArea === area
                ? "bg-accent border-accent text-black"
                : "border-dark-border text-gray-400 hover:border-accent/50 hover:text-white"
            }`}
          >
            {area}
          </button>
        ))}
      </div>
    </div>
  );
}
