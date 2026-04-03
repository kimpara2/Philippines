"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Store = {
  id: string;
  name: string;
  area: string | null;
  is_approved: boolean;
  is_published: boolean;
  owner_id: string | null;
};

export function BulkStoreActions({ stores }: { stores: Store[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // オーナーなし（AIインポート・管理者追加）の店舗のみ対象
  const noOwnerStores = stores.filter((s) => !s.owner_id);
  const pendingStores = stores.filter((s) => !s.is_approved);

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function selectAll() {
    setSelectedIds(new Set(noOwnerStores.map((s) => s.id)));
  }

  function selectNone() {
    setSelectedIds(new Set());
  }

  async function bulkApproveAndPublish() {
    if (selectedIds.size === 0) { setMsg("店舗を選択してください"); return; }
    setLoading(true);
    setMsg("");
    const ids = Array.from(selectedIds);
    const res = await fetch("/api/admin/bulk-stores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "approve_publish", ids }),
    });
    const json = await res.json();
    setLoading(false);
    if (!res.ok) { setMsg("❌ エラー: " + (json.error ?? "不明")); return; }
    setMsg(`✅ ${ids.length}件を承認・公開しました`);
    setSelectedIds(new Set());
    router.refresh();
  }

  async function bulkDelete() {
    if (selectedIds.size === 0) { setMsg("店舗を選択してください"); return; }
    setLoading(true);
    setMsg("");
    const ids = Array.from(selectedIds);
    const res = await fetch("/api/admin/bulk-stores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", ids }),
    });
    const json = await res.json();
    setLoading(false);
    setShowDeleteConfirm(false);
    if (!res.ok) { setMsg("❌ エラー: " + (json.error ?? "不明")); return; }
    setMsg(`🗑️ ${ids.length}件を削除しました`);
    setSelectedIds(new Set());
    router.refresh();
  }

  if (noOwnerStores.length === 0) return null;

  return (
    <div className="mb-8 bg-dark-card border border-accent/30 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">⚡</span>
        <h2 className="text-white font-bold text-sm">一括操作</h2>
        <span className="text-xs text-accent bg-accent/10 px-2 py-0.5 rounded-full">
          AIインポート・管理者追加 {noOwnerStores.length}件
        </span>
      </div>

      {/* 店舗チェックリスト */}
      <div className="max-h-64 overflow-y-auto space-y-1.5 mb-4 pr-1">
        {noOwnerStores.map((store) => (
          <label key={store.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-dark cursor-pointer">
            <input
              type="checkbox"
              checked={selectedIds.has(store.id)}
              onChange={() => toggleSelect(store.id)}
              className="w-4 h-4 accent-primary"
            />
            <span className="text-white text-sm flex-1">{store.name}</span>
            <span className="text-gray-500 text-xs">{store.area}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${store.is_approved ? "bg-green-900/40 text-green-400" : "bg-yellow-900/40 text-yellow-400"}`}>
              {store.is_approved ? "承認済" : "未承認"}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${store.is_published ? "bg-blue-900/40 text-blue-400" : "bg-gray-800 text-gray-500"}`}>
              {store.is_published ? "公開中" : "非公開"}
            </span>
          </label>
        ))}
      </div>

      {/* 選択コントロール */}
      <div className="flex items-center gap-3 mb-4 text-xs">
        <button onClick={selectAll} className="text-primary hover:underline">全て選択</button>
        <button onClick={selectNone} className="text-gray-400 hover:underline">選択解除</button>
        <span className="text-gray-500">{selectedIds.size}件選択中</span>
      </div>

      {/* アクションボタン */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={bulkApproveAndPublish}
          disabled={loading || selectedIds.size === 0}
          className="bg-green-700 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-5 py-2.5 rounded-lg text-sm transition-colors"
        >
          {loading ? "処理中..." : `✅ 選択した${selectedIds.size}件を承認・公開`}
        </button>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          disabled={loading || selectedIds.size === 0}
          className="bg-red-900/50 hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed text-red-300 font-bold px-5 py-2.5 rounded-lg text-sm transition-colors border border-red-700/50"
        >
          🗑️ 選択した{selectedIds.size}件を削除
        </button>
      </div>

      {msg && <p className="mt-3 text-sm text-gray-300">{msg}</p>}

      {/* 削除確認モーダル */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
          <div className="bg-dark-card border border-red-700 rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-white font-bold text-lg mb-2">🗑️ 削除の確認</h3>
            <p className="text-gray-400 text-sm mb-5">
              選択した<span className="text-red-400 font-bold">{selectedIds.size}件</span>の店舗を削除します。この操作は元に戻せません。
            </p>
            <div className="flex gap-3">
              <button
                onClick={bulkDelete}
                disabled={loading}
                className="flex-1 bg-red-700 hover:bg-red-600 disabled:opacity-50 text-white font-bold py-2.5 rounded-lg text-sm transition-colors"
              >
                {loading ? "削除中..." : "削除する"}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-dark border border-dark-border text-gray-300 font-bold py-2.5 rounded-lg text-sm transition-colors"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
