// 管理画面 - キャスト一覧管理

import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import type { Store, CastMember } from "@/types/database";

export const metadata: Metadata = { title: "キャスト管理" };

export default async function DashboardCastPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: myStoreRaw } = await supabase
    .from("stores")
    .select("id, slug, name")
    .eq("owner_id", user!.id)
    .single();
  const myStore = myStoreRaw as Pick<Store, "id" | "slug" | "name"> | null;

  const { data: castsRaw } = myStore
    ? await supabase
        .from("cast_members")
        .select("*")
        .eq("store_id", myStore.id)
        .order("sort_order")
    : { data: null };
  const casts = castsRaw as CastMember[] | null;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-black text-white">👩 キャスト管理</h1>
        {myStore && (
          <Link
            href="/dashboard/cast/new"
            className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-full font-bold transition-colors text-sm"
          >
            ＋ キャストを追加
          </Link>
        )}
      </div>

      {!myStore ? (
        <div className="text-center py-16 bg-dark-card border border-dark-border rounded-2xl">
          <p className="text-gray-400">先に店舗情報を登録してください</p>
          <Link href="/dashboard/store" className="text-primary mt-2 inline-block hover:underline text-sm">
            店舗を登録する →
          </Link>
        </div>
      ) : casts && casts.length > 0 ? (
        <div className="grid grid-cols-1 gap-3">
          {casts.map((cast) => (
            <div
              key={cast.id}
              className="bg-dark-card border border-dark-border rounded-xl p-4 flex items-center gap-4"
            >
              {/* サムネイル */}
              <div className="relative w-16 h-16 rounded-full overflow-hidden bg-dark-border shrink-0">
                {cast.profile_image_url ? (
                  <Image src={cast.profile_image_url} alt={cast.name} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">👩</div>
                )}
              </div>

              {/* 情報 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-white font-bold">{cast.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${cast.is_active ? "bg-green-900/50 text-green-400" : "bg-gray-700 text-gray-400"}`}>
                    {cast.is_active ? "在籍中" : "退籍"}
                  </span>
                </div>
                <div className="text-gray-400 text-sm mt-0.5">
                  {cast.age && `${cast.age}歳`}
                  {cast.nationality && ` / ${cast.nationality}`}
                </div>
              </div>

              {/* 操作ボタン */}
              <div className="flex gap-2 shrink-0">
                <Link
                  href={`/dashboard/cast/${cast.id}`}
                  className="bg-dark border border-dark-border hover:border-primary text-gray-300 hover:text-primary px-3 py-1.5 rounded-lg text-sm transition-colors"
                >
                  編集
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-dark-card border border-dark-border rounded-2xl">
          <div className="text-5xl mb-4">👩</div>
          <p className="text-gray-400 mb-4">キャストがまだ登録されていません</p>
          <Link
            href="/dashboard/cast/new"
            className="bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-full font-bold transition-colors text-sm"
          >
            最初のキャストを追加する
          </Link>
        </div>
      )}
    </div>
  );
}
