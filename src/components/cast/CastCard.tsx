// キャストカードコンポーネント

import Link from "next/link";
import Image from "next/image";
import type { CastMember } from "@/types/database";

type CastCardProps = {
  cast: CastMember;
  storeSlug: string;
};

export function CastCard({ cast, storeSlug }: CastCardProps) {
  return (
    <Link href={`/stores/${storeSlug}/cast/${cast.id}`}>
      <div className="bg-dark-card border border-dark-border rounded-xl overflow-hidden hover:border-primary transition-all duration-200 hover:shadow-lg hover:shadow-primary/10 group text-center">
        {/* プロフィール画像 */}
        <div className="relative h-56 bg-dark-border overflow-hidden">
          {cast.profile_image_url ? (
            <Image
              src={cast.profile_image_url}
              alt={cast.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-6xl">👩</span>
            </div>
          )}
        </div>

        {/* キャスト情報 */}
        <div className="p-4">
          <h3 className="font-bold text-white text-lg mb-1 group-hover:text-primary transition-colors">
            {cast.name}
          </h3>

          <div className="flex justify-center gap-3 text-xs text-gray-400">
            {cast.age && <span>{cast.age}歳</span>}
            {cast.nationality && <span>🇵🇭 {cast.nationality}</span>}
          </div>

          {cast.description && (
            <p className="text-gray-400 text-xs mt-2 line-clamp-2">
              {cast.description}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
