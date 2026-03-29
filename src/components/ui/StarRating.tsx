// 星評価コンポーネント（1〜5の星で評価を表示）

type StarRatingProps = {
  rating: number;  // 1〜5
  size?: "sm" | "md" | "lg";
};

export function StarRating({ rating, size = "md" }: StarRatingProps) {
  const sizeClass = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-xl",
  }[size];

  return (
    <div className={`flex gap-0.5 ${sizeClass}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className={star <= rating ? "text-accent" : "text-gray-600"}>
          ★
        </span>
      ))}
    </div>
  );
}
