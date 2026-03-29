// キャスト個人ページ

import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ slug: string; id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: cast } = await supabase.from("cast_members").select("name").eq("id", id).single();
  return { title: cast?.name ?? "キャスト" };
}

export default async function CastDetailPage({ params }: Props) {
  const { slug, id } = await params;
  const supabase = await createClient();

  const { data: store } = await supabase
    .from("stores")
    .select("id, name")
    .eq("slug", slug)
    .single();

  if (!store) notFound();

  const { data: cast } = await supabase
    .from("cast_members")
    .select("*")
    .eq("id", id)
    .eq("store_id", store.id)
    .eq("is_active", true)
    .single();

  if (!cast) notFound();

  const { data: photos } = await supabase
    .from("cast_photos")
    .select("*")
    .eq("cast_id", cast.id)
    .order("sort_order");

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* パンくず */}
      <nav className="text-sm text-gray-400 mb-6">
        <Link href="/" className="hover:text-primary">トップ</Link>
        <span className="mx-2">›</span>
        <Link href={`/stores/${slug}`} className="hover:text-primary">{store.name}</Link>
        <span className="mx-2">›</span>
        <Link href={`/stores/${slug}/cast`} className="hover:text-primary">キャスト</Link>
        <span className="mx-2">›</span>
        <span className="text-white">{cast.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* プロフィール画像 */}
        <div className="relative h-80 md:h-96 rounded-2xl overflow-hidden bg-dark-card">
          {cast.profile_image_url ? (
            <Image
              src={cast.profile_image_url}
              alt={cast.name}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-8xl">👩</span>
            </div>
          )}
        </div>

        {/* プロフィール情報 */}
        <div>
          <h1 className="text-3xl font-black text-white mb-1">{cast.name}</h1>
          {cast.name_kana && (
            <p className="text-gray-400 text-sm mb-4">{cast.name_kana}</p>
          )}

          <div className="bg-dark-card border border-dark-border rounded-xl p-4 space-y-3 mb-4">
            {cast.age && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">年齢</span>
                <span className="text-white font-bold">{cast.age}歳</span>
              </div>
            )}
            {cast.nationality && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">国籍</span>
                <span className="text-white font-bold">🇵🇭 {cast.nationality}</span>
              </div>
            )}
            {cast.height && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">身長</span>
                <span className="text-white font-bold">{cast.height}cm</span>
              </div>
            )}
            {cast.blood_type && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">血液型</span>
                <span className="text-white font-bold">{cast.blood_type}型</span>
              </div>
            )}
            {cast.hobbies && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">趣味</span>
                <span className="text-white font-bold">{cast.hobbies}</span>
              </div>
            )}
          </div>

          {cast.description && (
            <div>
              <h2 className="text-accent font-bold text-sm mb-2">💌 自己紹介</h2>
              <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                {cast.description}
              </p>
            </div>
          )}

          <div className="mt-6">
            <Link
              href={`/stores/${slug}`}
              className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-full font-bold transition-colors inline-block text-center w-full text-sm"
            >
              🏪 {store.name}の詳細を見る
            </Link>
          </div>
        </div>
      </div>

      {/* サブ写真 */}
      {photos && photos.length > 0 && (
        <div className="mt-10">
          <h2 className="text-accent font-bold mb-4">📷 フォトギャラリー</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {photos.map((photo) => (
              <div key={photo.id} className="relative h-40 rounded-xl overflow-hidden bg-dark-card">
                <Image src={photo.url} alt={cast.name} fill className="object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
