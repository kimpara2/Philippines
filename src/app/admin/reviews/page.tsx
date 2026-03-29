// サイト管理者 - 口コミ管理

import { createClient } from "@/lib/supabase/server";
import { AdminReviewClient } from "@/components/admin/AdminReviewClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "口コミ管理" };

export default async function AdminReviewsPage() {
  const supabase = await createClient();

  const { data: reviews } = await supabase
    .from("reviews")
    .select("id, rating, title, body, is_approved, created_at, store_id, user_id, stores(name), profiles(display_name)")
    .order("is_approved", { ascending: true })
    .order("created_at", { ascending: false });

  const pending = (reviews ?? []).filter((r) => !r.is_approved);
  const approved = (reviews ?? []).filter((r) => r.is_approved);

  return (
    <div>
      <h1 className="text-2xl font-black text-white mb-8">💬 口コミ管理</h1>

      {pending.length > 0 && (
        <div className="mb-10">
          <h2 className="text-accent font-bold mb-4 flex items-center gap-2">
            <span className="bg-yellow-500 text-black text-xs px-2 py-0.5 rounded-full font-black">{pending.length}</span>
            承認待ち
          </h2>
          <div className="space-y-3">
            {pending.map((r) => (
              <AdminReviewClient key={r.id} review={r as never} />
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-gray-400 font-bold mb-4 text-sm">承認済み ({approved.length}件)</h2>
        {approved.length > 0 ? (
          <div className="space-y-3">
            {approved.map((r) => (
              <AdminReviewClient key={r.id} review={r as never} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 text-sm">承認済みの口コミはありません</div>
        )}
      </div>
    </div>
  );
}
