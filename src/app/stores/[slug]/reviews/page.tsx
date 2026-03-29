// 口コミページ（一覧 + 投稿フォーム）

import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ReviewCard } from "@/components/review/ReviewCard";
import { ReviewFormClient } from "@/components/review/ReviewFormClient";
import type { ReviewWithProfile } from "@/types/database";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: store } = await supabase.from("stores").select("name").eq("slug", slug).single();
  return { title: store ? `${store.name} - 口コミ` : "口コミ" };
}

export default async function ReviewsPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: store } = await supabase
    .from("stores")
    .select("id, name")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!store) notFound();

  // ログイン状態を確認
  const { data: { user } } = await supabase.auth.getUser();

  const { data: reviews } = await supabase
    .from("reviews")
    .select("*, profiles(display_name, avatar_url)")
    .eq("store_id", store.id)
    .eq("is_approved", true)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* パンくず */}
      <nav className="text-sm text-gray-400 mb-6">
        <Link href="/" className="hover:text-primary">トップ</Link>
        <span className="mx-2">›</span>
        <Link href={`/stores/${slug}`} className="hover:text-primary">{store.name}</Link>
        <span className="mx-2">›</span>
        <span className="text-white">口コミ</span>
      </nav>

      <h1 className="text-2xl font-black text-white mb-8">
        💬 {store.name} の口コミ
      </h1>

      {/* 口コミ投稿フォーム（ログイン済みのみ） */}
      {user ? (
        <div className="mb-10">
          <h2 className="text-accent font-bold mb-4">口コミを書く</h2>
          <ReviewFormClient storeId={store.id} />
        </div>
      ) : (
        <div className="mb-10 bg-dark-card border border-dark-border rounded-xl p-6 text-center">
          <p className="text-gray-400 mb-3">口コミを投稿するにはログインが必要です</p>
          <Link
            href="/auth/login"
            className="bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded-full font-bold transition-colors text-sm"
          >
            ログインして口コミを書く
          </Link>
        </div>
      )}

      {/* 口コミ一覧 */}
      {reviews && reviews.length > 0 ? (
        <div className="space-y-4">
          {(reviews as ReviewWithProfile[]).map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-dark-card rounded-2xl border border-dark-border">
          <div className="text-5xl mb-4">💬</div>
          <p className="text-gray-400">まだ口コミがありません</p>
          <p className="text-gray-500 text-sm mt-1">最初の口コミを書いてみましょう！</p>
        </div>
      )}
    </div>
  );
}
