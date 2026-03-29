// キャスト一覧ページ

import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CastCard } from "@/components/cast/CastCard";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: store } = await supabase.from("stores").select("name").eq("slug", slug).single();
  return { title: store ? `${store.name} - キャスト一覧` : "キャスト一覧" };
}

export default async function CastListPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: store } = await supabase
    .from("stores")
    .select("id, name")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!store) notFound();

  const { data: casts } = await supabase
    .from("cast_members")
    .select("*")
    .eq("store_id", store.id)
    .eq("is_active", true)
    .order("sort_order");

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* パンくず */}
      <nav className="text-sm text-gray-400 mb-6">
        <Link href="/" className="hover:text-primary">トップ</Link>
        <span className="mx-2">›</span>
        <Link href="/stores" className="hover:text-primary">店舗一覧</Link>
        <span className="mx-2">›</span>
        <Link href={`/stores/${slug}`} className="hover:text-primary">{store.name}</Link>
        <span className="mx-2">›</span>
        <span className="text-white">キャスト</span>
      </nav>

      <h1 className="text-2xl font-black text-white mb-2">
        👩 {store.name}のキャスト
      </h1>
      <p className="text-gray-400 text-sm mb-8">{casts?.length ?? 0}名在籍中</p>

      {casts && casts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {casts.map((cast) => (
            <CastCard key={cast.id} cast={cast} storeSlug={slug} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-dark-card rounded-2xl border border-dark-border">
          <div className="text-5xl mb-4">👩</div>
          <p className="text-gray-400">キャスト情報は現在準備中です</p>
        </div>
      )}
    </div>
  );
}
