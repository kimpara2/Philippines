"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type ReviewInfo = {
  id: string;
  rating: number;
  title: string | null;
  body: string;
  is_approved: boolean;
  created_at: string;
  stores: { name: string } | null;
  profiles: { display_name: string | null } | null;
};

const STARS = ["", "★", "★★", "★★★", "★★★★", "★★★★★"];

export function AdminReviewClient({ review }: { review: ReviewInfo }) {
  const [isApproved, setIsApproved] = useState(review.is_approved);
  const [deleted, setDeleted] = useState(false);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  async function toggleApproval() {
    setSaving(true);
    await supabase.from("reviews").update({ is_approved: !isApproved }).eq("id", review.id);
    setIsApproved(!isApproved);
    setSaving(false);
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm("この口コミを削除しますか？")) return;
    setSaving(true);
    await supabase.from("reviews").delete().eq("id", review.id);
    setDeleted(true);
    setSaving(false);
    router.refresh();
  }

  if (deleted) return null;

  return (
    <div className="bg-dark-card border border-dark-border rounded-xl p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-accent text-sm font-bold">{STARS[review.rating]}</span>
            <span className="text-white text-sm font-bold">{review.title ?? "（タイトルなし）"}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${isApproved ? "bg-green-900/50 text-green-400" : "bg-yellow-900/50 text-yellow-400"}`}>
              {isApproved ? "承認済み" : "未承認"}
            </span>
          </div>
          <p className="text-gray-300 text-sm leading-relaxed mb-2 line-clamp-3">{review.body}</p>
          <div className="flex gap-3 text-xs text-gray-500">
            <span>🏪 {review.stores?.name ?? "不明"}</span>
            <span>👤 {review.profiles?.display_name ?? "匿名"}</span>
            <span>{new Date(review.created_at).toLocaleDateString("ja-JP")}</span>
          </div>
        </div>

        <div className="flex gap-2 shrink-0">
          <button onClick={toggleApproval} disabled={saving}
            className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-colors border ${isApproved ? "border-red-500/50 text-red-400 hover:bg-red-900/20" : "bg-primary hover:bg-primary-hover text-white border-transparent"}`}>
            {isApproved ? "承認取消" : "承認する"}
          </button>
          <button onClick={handleDelete} disabled={saving}
            className="text-xs px-3 py-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-900/20 transition-colors font-bold">
            削除
          </button>
        </div>
      </div>
    </div>
  );
}
