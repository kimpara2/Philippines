"use client";

// 口コミ投稿フォーム（クライアントコンポーネント）

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type ReviewFormClientProps = {
  storeId: string;
};

export function ReviewFormClient({ storeId }: ReviewFormClientProps) {
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [visitDate, setVisitDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;

    setSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("reviews").insert({
      store_id: storeId,
      user_id: user.id,
      rating,
      title: title.trim() || null,
      body: body.trim(),
      visit_date: visitDate || null,
      is_approved: false,  // 管理者が承認してから公開
    });

    setSubmitting(false);
    if (!error) {
      setSuccess(true);
      setTitle("");
      setBody("");
      setVisitDate("");
      setRating(5);
      router.refresh();
    }
  }

  if (success) {
    return (
      <div className="bg-dark-card border border-green-500/30 rounded-xl p-6 text-center">
        <div className="text-4xl mb-2">✅</div>
        <p className="text-green-400 font-bold">口コミを投稿しました！</p>
        <p className="text-gray-400 text-sm mt-1">管理者の承認後に公開されます</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-dark-card border border-dark-border rounded-xl p-5 space-y-4">
      {/* 星評価 */}
      <div>
        <label className="text-gray-400 text-sm block mb-2">評価 *</label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className={`text-2xl transition-transform hover:scale-110 ${star <= rating ? "text-accent" : "text-gray-600"}`}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      {/* タイトル */}
      <div>
        <label className="text-gray-400 text-sm block mb-2">タイトル（任意）</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="例：雰囲気が最高でした！"
          className="w-full bg-dark border border-dark-border rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-primary text-sm"
        />
      </div>

      {/* 本文 */}
      <div>
        <label className="text-gray-400 text-sm block mb-2">口コミ内容 *</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
          placeholder="お店の感想を書いてください"
          required
          className="w-full bg-dark border border-dark-border rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-primary text-sm resize-none"
        />
      </div>

      {/* 訪問日 */}
      <div>
        <label className="text-gray-400 text-sm block mb-2">訪問日（任意）</label>
        <input
          type="date"
          value={visitDate}
          onChange={(e) => setVisitDate(e.target.value)}
          className="bg-dark border border-dark-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary text-sm"
        />
      </div>

      <button
        type="submit"
        disabled={submitting || !body.trim()}
        className="w-full bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-lg font-bold transition-colors"
      >
        {submitting ? "送信中..." : "口コミを投稿する"}
      </button>
    </form>
  );
}
