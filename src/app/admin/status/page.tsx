// サイト管理者 - 掲載状況一覧（申請日・承認日・経過日数）

import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "掲載状況一覧" };

function daysSince(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const diff = Date.now() - new Date(dateStr).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function DaysLabel({ days, className }: { days: number; className?: string }) {
  const color =
    days <= 30 ? "text-gray-300" : days <= 90 ? "text-yellow-400" : "text-red-400";
  return <span className={`${color} ${className ?? ""}`}>{days}日経過</span>;
}

export default async function AdminStatusPage() {
  const supabase = await createClient();

  const { data: stores } = await supabase
    .from("stores")
    .select("id, slug, name, area, is_published, is_approved, created_at, approved_at")
    .order("created_at", { ascending: false });

  const rows = (stores ?? []).map((s) => ({
    ...s,
    appliedDays: daysSince(s.created_at),
    approvedDays: daysSince(s.approved_at ?? null),
  }));

  const total = rows.length;
  const approvedCount = rows.filter((r) => r.is_approved).length;
  const publishedCount = rows.filter((r) => r.is_published).length;
  const pendingCount = rows.filter((r) => !r.is_approved).length;

  return (
    <div>
      <h1 className="text-2xl font-black text-white mb-2">📊 掲載状況一覧</h1>
      <p className="text-gray-400 text-sm mb-6">全店舗の申請日・承認日・経過日数を一括確認できます</p>

      {/* サマリー */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <div className="bg-dark-card border border-dark-border rounded-xl p-4 text-center">
          <div className="text-3xl font-black text-white">{total}</div>
          <div className="text-gray-400 text-xs mt-1">総店舗数</div>
        </div>
        <div className="bg-dark-card border border-yellow-900/40 rounded-xl p-4 text-center">
          <div className="text-3xl font-black text-yellow-400">{pendingCount}</div>
          <div className="text-gray-400 text-xs mt-1">審査待ち</div>
        </div>
        <div className="bg-dark-card border border-green-900/40 rounded-xl p-4 text-center">
          <div className="text-3xl font-black text-green-400">{approvedCount}</div>
          <div className="text-gray-400 text-xs mt-1">承認済み</div>
        </div>
        <div className="bg-dark-card border border-blue-900/40 rounded-xl p-4 text-center">
          <div className="text-3xl font-black text-blue-400">{publishedCount}</div>
          <div className="text-gray-400 text-xs mt-1">公開中</div>
        </div>
      </div>

      {/* テーブル */}
      <div className="bg-dark-card border border-dark-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-border text-gray-400 text-xs">
                <th className="text-left px-4 py-3 font-semibold">店舗名</th>
                <th className="text-left px-4 py-3 font-semibold">エリア</th>
                <th className="text-left px-4 py-3 font-semibold">ステータス</th>
                <th className="text-left px-4 py-3 font-semibold">申請日</th>
                <th className="text-left px-4 py-3 font-semibold">申請から</th>
                <th className="text-left px-4 py-3 font-semibold">承認日</th>
                <th className="text-left px-4 py-3 font-semibold">承認から</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((store, i) => {
                const statusLabel = store.is_published
                  ? "公開中"
                  : store.is_approved
                  ? "承認済み"
                  : "審査待ち";
                const statusClass = store.is_published
                  ? "bg-blue-900/50 text-blue-400"
                  : store.is_approved
                  ? "bg-green-900/50 text-green-400"
                  : "bg-yellow-900/50 text-yellow-400";

                return (
                  <tr
                    key={store.id}
                    className={`border-b border-dark-border/50 hover:bg-dark/40 transition-colors ${
                      i % 2 === 0 ? "" : "bg-dark/20"
                    }`}
                  >
                    {/* 店舗名 */}
                    <td className="px-4 py-3">
                      <span className="text-white font-semibold">{store.name}</span>
                    </td>

                    {/* エリア */}
                    <td className="px-4 py-3 text-gray-400">
                      {store.area ?? "—"}
                    </td>

                    {/* ステータス */}
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${statusClass}`}>
                        {statusLabel}
                      </span>
                    </td>

                    {/* 申請日 */}
                    <td className="px-4 py-3 text-gray-300 whitespace-nowrap">
                      {new Date(store.created_at).toLocaleDateString("ja-JP")}
                    </td>

                    {/* 申請からの経過 */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      {store.appliedDays !== null ? (
                        <DaysLabel days={store.appliedDays} />
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </td>

                    {/* 承認日 */}
                    <td className="px-4 py-3 text-gray-300 whitespace-nowrap">
                      {store.approved_at
                        ? new Date(store.approved_at).toLocaleDateString("ja-JP")
                        : <span className="text-gray-500">未承認</span>}
                    </td>

                    {/* 承認からの経過 */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      {store.approvedDays !== null ? (
                        <DaysLabel days={store.approvedDays} />
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </td>

                    {/* リンク */}
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Link
                          href={`/admin/stores`}
                          className="text-xs px-2 py-1 rounded-lg border border-dark-border text-gray-400 hover:text-white transition-colors whitespace-nowrap"
                        >
                          管理
                        </Link>
                        <Link
                          href={`/stores/${store.slug}`}
                          target="_blank"
                          className="text-xs px-2 py-1 rounded-lg border border-dark-border text-gray-400 hover:text-white transition-colors whitespace-nowrap"
                        >
                          表示
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                    店舗データがありません
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 凡例 */}
        <div className="px-4 py-3 border-t border-dark-border/50 flex items-center gap-6 text-xs text-gray-500">
          <span>経過日数の色：</span>
          <span className="text-gray-300">● 30日以内</span>
          <span className="text-yellow-400">● 31〜90日</span>
          <span className="text-red-400">● 91日以上</span>
        </div>
      </div>
    </div>
  );
}
