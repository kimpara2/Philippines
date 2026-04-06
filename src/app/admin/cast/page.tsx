// 管理者 - おすすめキャスト管理

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { FeaturedToggleButton } from "@/components/admin/FeaturedToggleButton";

export const metadata: Metadata = { title: "おすすめキャスト管理" };

const ALL_AREAS = [
  "浜松", "静岡市", "沼津",
  "栄", "錦", "大須", "名古屋",
  "岐阜市", "四日市",
];

type Props = {
  searchParams: Promise<{ area?: string; q?: string }>;
};

export default async function AdminCastPage({ searchParams }: Props) {
  const { area, q } = await searchParams;
  const supabase = await createClient();

  // 管理者チェック
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/dashboard");

  let query = supabase
    .from("cast_members")
    .select(`
      id, name, age, nationality, profile_image_url, is_featured, is_active,
      stores!inner(slug, name, area, category)
    `)
    .eq("is_active", true)
    .eq("stores.is_published", true)
    .eq("stores.is_approved", true)
    .order("is_featured", { ascending: false })
    .order("sort_order")
    .limit(200);

  if (area) query = (query as any).ilike("stores.area", `%${area}%`);
  if (q) query = (query as any).ilike("name", `%${q}%`);

  const { data: castsRaw } = await query;

  type CastRow = {
    id: string;
    name: string;
    age: number | null;
    nationality: string | null;
    profile_image_url: string | null;
    is_featured: boolean;
    is_active: boolean;
    stores: { slug: string; name: string; area: string | null; category: string | null };
  };

  const casts = (castsRaw ?? []) as unknown as CastRow[];
  const featuredCount = casts.filter((c) => c.is_featured).length;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <h1 className="text-2xl font-black text-white">💕 おすすめキャスト管理</h1>
        <span className="bg-primary/20 text-primary text-xs font-black px-3 py-1 rounded-full">
          おすすめ中 {featuredCount}人
        </span>
      </div>

      {/* 検索・エリアフィルター */}
      <div className="mb-6 space-y-3">
        <form method="get" className="flex gap-2">
          {area && <input type="hidden" name="area" value={area} />}
          <input
            type="search"
            name="q"
            placeholder="🔍 キャスト名で検索..."
            defaultValue={q ?? ""}
            className="flex-1 bg-dark-card border border-dark-border rounded-lg px-4 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-primary"
          />
          <button type="submit" className="bg-primary hover:bg-primary-hover text-white px-4 py-2.5 rounded-lg text-sm font-bold">検索</button>
        </form>

        <div className="flex flex-wrap gap-2">
          <Link href="/admin/cast" className={`text-xs px-3 py-1.5 rounded-full font-bold border transition-colors ${!area ? "bg-primary border-primary text-white" : "border-dark-border text-gray-400 hover:border-primary/50"}`}>
            すべて
          </Link>
          {ALL_AREAS.map((a) => (
            <Link key={a} href={`/admin/cast?area=${encodeURIComponent(a)}`} className={`text-xs px-3 py-1.5 rounded-full font-bold border transition-colors ${area === a ? "bg-primary border-primary text-white" : "border-dark-border text-gray-400 hover:border-primary/50"}`}>
              {a}
            </Link>
          ))}
        </div>
      </div>

      <p className="text-gray-500 text-sm mb-5">
        ⭐ をONにするとTOPページ・エリアページの「おすすめ女子」欄に表示されます
      </p>

      {/* キャストリスト */}
      {casts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {casts.map((cast) => (
            <div key={cast.id} className={`bg-dark-card border rounded-xl overflow-hidden transition-all ${cast.is_featured ? "border-primary/60" : "border-dark-border"}`}>
              {/* 写真 */}
              <div className="relative aspect-[3/4] bg-dark overflow-hidden">
                {cast.profile_image_url ? (
                  <Image src={cast.profile_image_url} alt={cast.name} fill className="object-cover" unoptimized />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl">👩</div>
                )}
                {cast.is_featured && (
                  <div className="absolute top-2 left-2">
                    <span className="bg-primary text-white text-xs font-black px-2 py-0.5 rounded-full">★ おすすめ中</span>
                  </div>
                )}
              </div>

              {/* 情報 */}
              <div className="p-3">
                <div className="text-white font-bold text-sm truncate">{cast.name}</div>
                <div className="text-gray-500 text-xs truncate mt-0.5">{cast.stores.name}</div>
                {cast.stores.area && (
                  <div className="text-gray-600 text-xs">📍 {cast.stores.area}</div>
                )}
                <div className="mt-3">
                  <FeaturedToggleButton castId={cast.id} isFeatured={cast.is_featured} />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-dark-card border border-dark-border rounded-2xl">
          <div className="text-5xl mb-4">👩</div>
          <p className="text-gray-400">
            {area || q ? "条件に一致するキャストはいません" : "キャストがまだ登録されていません"}
          </p>
        </div>
      )}
    </div>
  );
}
