// サイト管理者 - 全店舗管理（承認・停止）

import { createClient } from "@/lib/supabase/server";
import { StoreApprovalClient } from "@/components/admin/StoreApprovalClient";
import { BulkStoreActions } from "@/components/admin/BulkStoreActions";
import { AdminStoreSearch } from "@/components/admin/AdminStoreSearch";
import Link from "next/link";
import { Suspense } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "店舗管理" };

export default async function AdminStoresPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; area?: string }>;
}) {
  const { q, category, area } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("stores")
    .select("id, slug, name, area, category, address, phone, open_hours, description, is_published, is_approved, created_at, owner_id")
    .order("is_approved", { ascending: true })
    .order("created_at", { ascending: false });

  if (q) {
    query = query.ilike("name", `%${q}%`);
  }
  if (category) {
    query = query.eq("category", category);
  }
  if (area) {
    query = query.ilike("area", `%${area}%`);
  }

  const { data: stores } = await query;

  // オーナーのメールアドレスを取得
  const ownerIds = (stores ?? []).map((s) => s.owner_id).filter(Boolean);
  const emailMap: Record<string, string> = {};
  if (ownerIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id")
      .in("id", ownerIds);
    (profiles ?? []).forEach((p) => { emailMap[p.id] = ""; });
  }

  const pending = (stores ?? []).filter((s) => !s.is_approved);
  const approved = (stores ?? []).filter((s) => s.is_approved);
  const totalCount = (stores ?? []).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-white">🏪 店舗管理</h1>
        <Link
          href="/admin/stores/new"
          className="bg-primary hover:bg-primary-hover text-white font-bold px-5 py-2.5 rounded-lg text-sm transition-colors"
        >
          ＋ 新規店舗を追加
        </Link>
      </div>

      {/* 検索・フィルター */}
      <Suspense fallback={null}>
        <AdminStoreSearch />
      </Suspense>

      {/* 検索結果数 */}
      {(q || category || area) && (
        <p className="text-gray-400 text-sm mb-4">
          {area && <span className="text-accent font-bold">{area}</span>}
          {area && category && " × "}
          {category && <span className="text-primary font-bold">{category}</span>}
          {(area || category) && q && " × "}
          {q && <span className="text-white font-bold">「{q}」</span>}
          {" の検索結果："}
          <span className="text-white font-bold">{totalCount}件</span>
        </p>
      )}

      {/* 一括操作 */}
      <BulkStoreActions stores={(stores ?? []).map((s) => ({
        id: s.id,
        name: s.name,
        area: s.area,
        is_approved: s.is_approved,
        is_published: s.is_published,
        owner_id: s.owner_id,
      }))} />

      {/* 審査待ち */}
      {pending.length > 0 && (
        <div className="mb-10">
          <h2 className="text-accent font-bold mb-4 flex items-center gap-2">
            <span className="bg-yellow-500 text-black text-xs px-2 py-0.5 rounded-full font-black">{pending.length}</span>
            審査待ち
          </h2>
          <div className="space-y-3">
            {pending.map((store) => (
              <StoreApprovalClient key={store.id} store={{ ...store, owner_email: emailMap[store.owner_id ?? ""] ?? null }} />
            ))}
          </div>
        </div>
      )}

      {/* 承認済み */}
      <div>
        <h2 className="text-gray-400 font-bold mb-4 text-sm">
          承認済み ({approved.length}件)
        </h2>
        {approved.length > 0 ? (
          <div className="space-y-3">
            {approved.map((store) => (
              <StoreApprovalClient key={store.id} store={{ ...store, owner_email: emailMap[store.owner_id ?? ""] ?? null }} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 text-sm">
            {q || category ? "条件に一致する承認済み店舗はありません" : "承認済みの店舗はありません"}
          </div>
        )}
      </div>
    </div>
  );
}
