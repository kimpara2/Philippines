"use client";

import { useState } from "react";
import Link from "next/link";

const AREAS = [
  "栄", "錦", "大須", "名古屋",
  "浜松", "静岡市", "沼津",
  "岐阜市",
  "四日市",
];

const CATEGORIES = ["フィリピンパブ", "スナック", "ガールズバー", "バー", "キャバクラ"];

type Result = {
  added: number;
  skipped: number;
  addedStores: string[];
  message: string;
};

export default function ImportPage() {
  const [area, setArea] = useState(AREAS[0]);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");

  async function handleImport() {
    setLoading(true);
    setResult(null);
    setError("");

    try {
      const res = await fetch("/api/admin/import-stores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ area, category }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "エラーが発生しました");
      } else {
        setResult(data);
      }
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <nav className="text-sm text-gray-400 mb-6">
        <Link href="/admin" className="hover:text-primary">管理者トップ</Link>
        <span className="mx-2">›</span>
        <span className="text-white">AI店舗インポート</span>
      </nav>

      <h1 className="text-2xl font-black text-white mb-2">🤖 AI店舗インポート</h1>
      <p className="text-gray-400 text-sm mb-8">
        Google Places APIで未登録の店舗を自動検索してDBに追加します。
        追加された店舗は<span className="text-accent font-bold">非公開・未承認</span>状態で登録されるので、確認後に公開してください。
      </p>

      <div className="bg-dark-card border border-dark-border rounded-xl p-6 space-y-5">
        <div>
          <label className="text-gray-400 text-sm block mb-2">エリア</label>
          <select
            value={area}
            onChange={(e) => setArea(e.target.value)}
            className="w-full bg-dark border border-dark-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary"
          >
            {AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>

        <div>
          <label className="text-gray-400 text-sm block mb-2">カテゴリ</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-dark border border-dark-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary"
          >
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <button
          onClick={handleImport}
          disabled={loading}
          className="w-full bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-colors"
        >
          {loading ? "🔍 検索・登録中..." : "🚀 AI検索して未登録店舗を追加"}
        </button>
      </div>

      {error && (
        <div className="mt-6 bg-red-900/30 border border-red-700 rounded-xl p-4 text-red-300 text-sm">
          ❌ {error}
        </div>
      )}

      {result && (
        <div className="mt-6 bg-dark-card border border-dark-border rounded-xl p-6">
          <p className="text-white font-bold mb-3">
            {result.added > 0 ? "✅" : "ℹ️"} {result.message}
          </p>
          {result.addedStores.length > 0 && (
            <div>
              <p className="text-gray-400 text-sm mb-2">追加された店舗：</p>
              <ul className="space-y-1">
                {result.addedStores.map((name) => (
                  <li key={name} className="text-white text-sm flex items-center gap-2">
                    <span className="text-primary">＋</span>{name}
                  </li>
                ))}
              </ul>
              <div className="mt-4">
                <Link
                  href="/admin/stores"
                  className="inline-block bg-accent hover:bg-accent-hover text-dark font-bold px-5 py-2.5 rounded-lg text-sm transition-colors"
                >
                  店舗管理画面で確認・公開する →
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
