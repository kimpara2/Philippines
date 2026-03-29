"use client";

// 口コミ承認・返信コンポーネント（管理画面用）

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { StarRating } from "@/components/ui/StarRating";

type ReviewWithProfile = {
  id: string;
  rating: number;
  title: string | null;
  body: string;
  is_approved: boolean;
  owner_reply: string | null;
  created_at: string;
  visit_date: string | null;
  profiles: { display_name: string | null } | null;
};

export function ReviewApprovalClient({ review }: { review: ReviewWithProfile }) {
  const [approved, setApproved] = useState(review.is_approved);
  const [reply, setReply] = useState(review.owner_reply ?? "");
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  async function toggleApproval() {
    setSaving(true);
    await supabase.from("reviews").update({ is_approved: !approved }).eq("id", review.id);
    setApproved(!approved);
    setSaving(false);
    router.refresh();
  }

  async function saveReply() {
    setSaving(true);
    await supabase.from("reviews").update({
      owner_reply: reply || null,
      owner_replied_at: reply ? new Date().toISOString() : null,
    }).eq("id", review.id);
    setSaving(false);
    setShowReplyForm(false);
    router.refresh();
  }

  const userName = review.profiles?.display_name ?? "匿名さん";

  return (
    <div className={`bg-dark-card border rounded-xl p-5 ${approved ? "border-dark-border" : "border-yellow-500/40"}`}>
      {/* ヘッダー */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <StarRating rating={review.rating} size="sm" />
          <div className="text-gray-400 text-sm mt-1">
            <span className="text-white font-medium">{userName}</span>
            <span className="ml-2">{new Date(review.created_at).toLocaleDateString("ja-JP")}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-1 rounded-full font-bold ${approved ? "bg-green-900/50 text-green-400" : "bg-yellow-900/50 text-yellow-400"}`}>
            {approved ? "承認済み" : "未承認"}
          </span>
          <button
            onClick={toggleApproval}
            disabled={saving}
            className={`text-xs px-3 py-1.5 rounded-full font-bold transition-colors ${approved ? "border border-red-500/50 text-red-400 hover:bg-red-900/20" : "bg-primary hover:bg-primary-hover text-white"}`}
          >
            {approved ? "承認取消" : "承認する"}
          </button>
        </div>
      </div>

      {/* 本文 */}
      {review.title && <h4 className="font-bold text-white mb-1">{review.title}</h4>}
      <p className="text-gray-300 text-sm leading-relaxed">{review.body}</p>

      {/* 既存のオーナー返信 */}
      {review.owner_reply && !showReplyForm && (
        <div className="mt-3 bg-dark border border-primary/30 rounded-lg p-3">
          <div className="text-primary text-xs font-bold mb-1">🏪 オーナー返信済み</div>
          <p className="text-gray-300 text-sm">{review.owner_reply}</p>
        </div>
      )}

      {/* 返信フォーム */}
      {showReplyForm && (
        <div className="mt-3 space-y-2">
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            rows={3}
            placeholder="口コミへの返信を書いてください..."
            className="w-full bg-dark border border-dark-border rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-primary text-sm resize-none"
          />
          <div className="flex gap-2">
            <button onClick={saveReply} disabled={saving}
              className="bg-primary hover:bg-primary-hover disabled:opacity-50 text-white px-4 py-1.5 rounded-lg text-sm font-bold transition-colors">
              {saving ? "保存中..." : "返信を保存"}
            </button>
            <button onClick={() => setShowReplyForm(false)}
              className="text-gray-400 hover:text-white px-4 py-1.5 rounded-lg text-sm transition-colors">
              キャンセル
            </button>
          </div>
        </div>
      )}

      {/* 返信ボタン */}
      {!showReplyForm && (
        <button
          onClick={() => setShowReplyForm(true)}
          className="mt-3 text-primary hover:underline text-xs"
        >
          {review.owner_reply ? "返信を編集する" : "返信を書く"}
        </button>
      )}
    </div>
  );
}
