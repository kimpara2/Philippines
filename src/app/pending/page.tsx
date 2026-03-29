// 審査待ちページ（未承認店舗がログイン後にリダイレクトされる）

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Logo } from "@/components/layout/Logo";

export default async function PendingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  // すでに承認されていたらdashboardへ
  const { data: store } = await supabase
    .from("stores")
    .select("name, is_approved, area, phone")
    .eq("owner_id", user.id)
    .single();

  if (store?.is_approved) redirect("/dashboard");

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Logo />
        </div>

        <div className="bg-dark-card border border-dark-border rounded-2xl p-8 text-center">
          <div className="text-5xl mb-4">⏳</div>
          <h1 className="text-xl font-black text-white mb-2">審査中です</h1>
          <p className="text-gray-400 text-sm leading-relaxed mb-6">
            掲載申請を受け付けました。<br />
            運営が内容を確認次第、承認いたします。<br />
            承認後はこのページからログインできます。
          </p>

          {store && (
            <div className="bg-dark rounded-xl p-4 text-left space-y-2 mb-6">
              <div className="text-gray-500 text-xs font-bold mb-1">申請内容</div>
              <div className="text-sm text-white font-bold">🏪 {store.name}</div>
              {store.area && <div className="text-sm text-gray-400">📍 {store.area}</div>}
              {store.phone && <div className="text-sm text-gray-400">📞 {store.phone}</div>}
              <div className="text-xs text-yellow-400 mt-2 font-bold">審査待ち</div>
            </div>
          )}

          <p className="text-gray-500 text-xs mb-6">
            承認されると、店舗情報の編集・キャスト登録などができるようになります。
          </p>

          <form action="/auth/signout" method="post">
            <Link
              href="/auth/login"
              className="text-gray-400 hover:text-primary text-sm transition-colors"
            >
              別のアカウントでログイン
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
}
