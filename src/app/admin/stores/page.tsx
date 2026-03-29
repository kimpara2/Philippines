// サイト管理者 - 全店舗管理（承認・停止）

import { createClient } from "@/lib/supabase/server";
import { StoreApprovalClient } from "@/components/admin/StoreApprovalClient";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "店舗管理" };

export default async function AdminStoresPage() {
  const supabase = await createClient();

  const { data: stores } = await supabase
    .from("stores")
    .select("id, slug, name, area, address, phone, open_hours, description, is_published, is_approved, created_at, owner_id")
    .order("is_approved", { ascending: true })
    .order("created_at", { ascending: false });

  // オーナーのメールアドレスを取得
  const ownerIds = (stores ?? []).map((s) => s.owner_id).filter(Boolean);
  const emailMap: Record<string, string> = {};
  if (ownerIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id")
      .in("id", ownerIds);
    // auth.usersのemailはsupabase admin APIが必要なため、ここではprofile IDのみ使用
    (profiles ?? []).forEach((p) => { emailMap[p.id] = ""; });
  }

  const pending = (stores ?? []).filter((s) => !s.is_approved);
  const approved = (stores ?? []).filter((s) => s.is_approved);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-black text-white">🏪 店舗管理</h1>
        <Link
          href="/admin/stores/new"
          className="bg-primary hover:bg-primary-hover text-white font-bold px-5 py-2.5 rounded-lg text-sm transition-colors"
        >
          ＋ 新規店舗を追加
        </Link>
      </div>

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
        <h2 className="text-gray-400 font-bold mb-4 text-sm">承認済み ({approved.length}件)</h2>
        {approved.length > 0 ? (
          <div className="space-y-3">
            {approved.map((store) => (
              <StoreApprovalClient key={store.id} store={{ ...store, owner_email: emailMap[store.owner_id ?? ""] ?? null }} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 text-sm">承認済みの店舗はありません</div>
        )}
      </div>
    </div>
  );
}
