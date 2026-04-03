// サイト管理者ダッシュボード

import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "サイト管理者ダッシュボード" };

export default async function AdminPage() {
  const supabase = await createClient();

  const [storeResult, userResult, reviewResult, pendingResult] = await Promise.all([
    supabase.from("stores").select("id", { count: "exact" }),
    supabase.from("profiles").select("id", { count: "exact" }),
    supabase.from("reviews").select("id", { count: "exact" }).eq("is_approved", true),
    supabase.from("stores").select("id", { count: "exact" }).eq("is_approved", false),
  ]);

  const stats = [
    { label: "掲載店舗数", value: storeResult.count ?? 0, icon: "🏪", color: "text-primary" },
    { label: "登録ユーザー数", value: userResult.count ?? 0, icon: "👥", color: "text-accent" },
    { label: "承認済み口コミ", value: reviewResult.count ?? 0, icon: "💬", color: "text-green-400" },
    { label: "承認待ち店舗", value: pendingResult.count ?? 0, icon: "⏳", color: "text-yellow-400" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-black text-white mb-8">🔐 サイト管理者ダッシュボード</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-dark-card border border-dark-border rounded-xl p-5 text-center">
            <div className="text-3xl mb-1">{stat.icon}</div>
            <div className={`text-3xl font-black ${stat.color}`}>{stat.value}</div>
            <div className="text-gray-400 text-sm mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/admin/stores" className="bg-dark-card border border-dark-border hover:border-primary rounded-xl p-5 transition-all group">
          <div className="text-2xl mb-2">🏪</div>
          <div className="text-white font-bold group-hover:text-primary">店舗管理</div>
          <div className="text-gray-400 text-sm">新規店舗の承認・停止</div>
        </Link>
        <Link href="/admin/import" className="bg-dark-card border border-primary/40 hover:border-primary rounded-xl p-5 transition-all group">
          <div className="text-2xl mb-2">🤖</div>
          <div className="text-white font-bold group-hover:text-primary">AI店舗インポート</div>
          <div className="text-gray-400 text-sm">Google Placesから未登録店舗を自動追加</div>
        </Link>
        <Link href="/admin/contacts" className="bg-dark-card border border-dark-border hover:border-primary rounded-xl p-5 transition-all group">
          <div className="text-2xl mb-2">📩</div>
          <div className="text-white font-bold group-hover:text-primary">お問い合わせ管理</div>
          <div className="text-gray-400 text-sm">受信した問い合わせの確認・返信</div>
        </Link>
        <Link href="/admin/users" className="bg-dark-card border border-dark-border hover:border-primary rounded-xl p-5 transition-all group">
          <div className="text-2xl mb-2">👥</div>
          <div className="text-white font-bold group-hover:text-primary">ユーザー管理</div>
          <div className="text-gray-400 text-sm">ロール変更・アカウント管理</div>
        </Link>
      </div>
    </div>
  );
}
