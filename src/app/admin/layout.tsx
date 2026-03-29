// サイト管理者画面レイアウト（adminロールのみアクセス可）

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  // adminロールか確認
  const { data: profileRaw } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  const profile = profileRaw as { role: string } | null;

  if (profile?.role !== "admin") redirect("/");

  const navItems = [
    { href: "/admin", label: "ダッシュボード", icon: "🏠" },
    { href: "/admin/stores", label: "店舗管理・申請", icon: "🏪" },
    { href: "/admin/status", label: "掲載状況一覧", icon: "📊" },
    { href: "/admin/reviews", label: "口コミ管理", icon: "💬" },
    { href: "/admin/users", label: "ユーザー管理", icon: "👥" },
    { href: "/admin/blog", label: "サイトニュース管理", icon: "📝" },
  ];

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      <aside className="w-56 bg-dark-card border-r border-dark-border shrink-0">
        <div className="p-4 border-b border-dark-border">
          <div className="text-red-400 font-bold text-sm">🔐 サイト管理者</div>
          <div className="text-gray-400 text-xs mt-0.5 truncate">{user.email}</div>
        </div>
        <nav className="p-3 space-y-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:bg-dark hover:text-primary transition-colors">
              <span>{item.icon}</span><span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}
