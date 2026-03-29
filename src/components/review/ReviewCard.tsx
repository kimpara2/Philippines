// 口コミカードコンポーネント

import { StarRating } from "@/components/ui/StarRating";
import type { ReviewWithProfile } from "@/types/database";

type ReviewCardProps = {
  review: ReviewWithProfile;
};

export function ReviewCard({ review }: ReviewCardProps) {
  const userName = review.profiles?.display_name ?? "匿名さん";

  return (
    <div className="bg-dark-card border border-dark-border rounded-xl p-5">
      {/* ヘッダー（評価・投稿者・日付） */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <StarRating rating={review.rating} />
          <div className="text-gray-400 text-sm mt-1">
            <span className="font-medium text-white">{userName}</span>
            {review.visit_date && (
              <span className="ml-2">
                訪問日: {new Date(review.visit_date).toLocaleDateString("ja-JP")}
              </span>
            )}
          </div>
        </div>
        <div className="text-gray-500 text-xs">
          {new Date(review.created_at).toLocaleDateString("ja-JP")}
        </div>
      </div>

      {/* タイトル */}
      {review.title && (
        <h4 className="font-bold text-white mb-2">{review.title}</h4>
      )}

      {/* 本文 */}
      <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
        {review.body}
      </p>

      {/* オーナー返信 */}
      {review.owner_reply && (
        <div className="mt-4 bg-dark border border-primary/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-primary text-xs font-bold">🏪 オーナーからの返信</span>
            {review.owner_replied_at && (
              <span className="text-gray-500 text-xs">
                {new Date(review.owner_replied_at).toLocaleDateString("ja-JP")}
              </span>
            )}
          </div>
          <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
            {review.owner_reply}
          </p>
        </div>
      )}
    </div>
  );
}
