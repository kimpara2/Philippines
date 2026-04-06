// 採用応募一覧（店舗オーナー用）

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { ApplicationReadButton } from "@/components/dashboard/ApplicationReadButton";

export const metadata: Metadata = { title: "採用応募一覧" };

export default async function ApplicationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // 自分の店舗を取得
  const { data: store } = await supabase
    .from("stores")
    .select("id, name")
    .eq("owner_id", user.id)
    .single();

  if (!store) {
    return (
      <div className="text-center py-20 text-gray-500">
        <p>店舗情報が登録されていません</p>
      </div>
    );
  }

  // 応募一覧を取得（新しい順）
  const { data: applications } = await supabase
    .from("applications")
    .select("*")
    .eq("store_id", store.id)
    .order("created_at", { ascending: false });

  const unreadCount = (applications ?? []).filter((a) => !a.is_read).length;

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-8">
        <h1 className="text-2xl font-black text-white">💼 採用応募一覧</h1>
        {unreadCount > 0 && (
          <span className="bg-red-500 text-white text-xs font-black px-2.5 py-1 rounded-full">
            NEW {unreadCount}件
          </span>
        )}
      </div>

      {applications && applications.length > 0 ? (
        <div className="space-y-4">
          {applications.map((app) => (
            <div
              key={app.id}
              className={`bg-dark-card border rounded-xl p-5 ${!app.is_read ? "border-primary/60" : "border-dark-border"}`}
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  {!app.is_read && (
                    <span className="bg-primary text-white text-xs font-black px-2 py-0.5 rounded-full">NEW</span>
                  )}
                  <span className="text-white font-black text-lg">{app.name}</span>
                  {app.age && <span className="text-gray-400 text-sm">{app.age}</span>}
                </div>
                <span className="text-gray-500 text-xs shrink-0">
                  {new Date(app.created_at).toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <div>
                  <div className="text-gray-500 text-xs mb-0.5">📞 電話番号</div>
                  <a href={`tel:${app.phone}`} className="text-primary font-bold hover:underline">
                    {app.phone}
                  </a>
                </div>
                {app.email && (
                  <div>
                    <div className="text-gray-500 text-xs mb-0.5">✉️ メール</div>
                    <a href={`mailto:${app.email}`} className="text-primary hover:underline text-sm">
                      {app.email}
                    </a>
                  </div>
                )}
              </div>

              {app.message && (
                <div className="bg-dark rounded-lg p-3 mb-3">
                  <div className="text-gray-500 text-xs mb-1">💬 メッセージ</div>
                  <div className="text-gray-200 text-sm whitespace-pre-wrap">{app.message}</div>
                </div>
              )}

              <div className="flex gap-3 mt-3">
                <a
                  href={`tel:${app.phone}`}
                  className="flex-1 text-center bg-primary hover:bg-primary-hover text-white font-bold py-2 rounded-lg text-sm transition-colors"
                >
                  📞 電話する
                </a>
                {app.email && (
                  <a
                    href={`mailto:${app.email}?subject=【採用】ご応募ありがとうございます`}
                    className="flex-1 text-center border border-dark-border hover:border-primary text-gray-300 hover:text-white font-bold py-2 rounded-lg text-sm transition-colors"
                  >
                    ✉️ メール返信
                  </a>
                )}
                {!app.is_read && (
                  <ApplicationReadButton applicationId={app.id} />
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-dark-card border border-dark-border rounded-2xl">
          <div className="text-5xl mb-4">📭</div>
          <p className="text-gray-400">まだ応募はありません</p>
          <p className="text-gray-500 text-sm mt-2">採用情報を掲載すると応募が届きます</p>
        </div>
      )}
    </div>
  );
}
