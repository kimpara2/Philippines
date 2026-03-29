// 管理画面 - 口コミ管理（承認・オーナー返信）

import { createClient } from "@/lib/supabase/server";
import { ReviewApprovalClient } from "@/components/review/ReviewApprovalClient";
import type { Metadata } from "next";
import type { Store } from "@/types/database";

export const metadata: Metadata = { title: "口コミ管理" };

export default async function DashboardReviewsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: myStoreRaw } = await supabase
    .from("stores")
    .select("id")
    .eq("owner_id", user!.id)
    .single();
  const myStore = myStoreRaw as Pick<Store, "id"> | null;

  const { data: reviewsRaw } = myStore
    ? await supabase
        .from("reviews")
        .select("*, profiles(display_name)")
        .eq("store_id", myStore.id)
        .order("created_at", { ascending: false })
    : { data: null };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const reviews = reviewsRaw as any[] | null;

  return (
    <div>
      <h1 className="text-2xl font-black text-white mb-8">💬 口コミ管理</h1>

      {!myStore ? (
        <div className="text-center py-16 bg-dark-card border border-dark-border rounded-2xl">
          <p className="text-gray-400">先に店舗情報を登録してください</p>
        </div>
      ) : reviews && reviews.length > 0 ? (
        <div className="space-y-4">
          <div className="flex gap-4 text-sm text-gray-400 mb-2">
            <span>全{reviews.length}件</span>
            <span className="text-red-400">未承認: {reviews.filter(r => !r.is_approved).length}件</span>
            <span className="text-green-400">承認済み: {reviews.filter(r => r.is_approved).length}件</span>
          </div>
          {reviews.map((review) => (
            <ReviewApprovalClient key={review.id} review={review} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-dark-card border border-dark-border rounded-2xl">
          <div className="text-5xl mb-4">💬</div>
          <p className="text-gray-400">口コミがまだありません</p>
        </div>
      )}
    </div>
  );
}
