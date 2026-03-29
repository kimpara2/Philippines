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
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-64px)]">
      {/* モバイル：横スクロールナビ / PC：左サイドバー */}
      <aside className="w-full md:w-56 bg-dark-card border-b md:border-b-0 md:border-r border-dark-border md:shrink-0">
        <div className="hidden md:block p-4 border-b border-dark-border">
          <div className="text-red-400 font-bold text-sm">🔐 サイト管理者</div>
          <div className="text-gray-400 text-xs mt-0.5 truncate">{user.email}</div>
        </div>
        {/* モバイル：横スクロールタブ */}
        <nav className="md:hidden flex overflow-x-auto gap-1 p-2 scrollbar-hide">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-gray-300 hover:bg-dark hover:text-primary transition-colors whitespace-nowrap bg-dark/50">
              <span>{item.icon}</span><span>{item.label}</span>
            </Link>
          ))}
        </nav>
        {/* PC：縦ナビ */}
        <nav className="hidden md:block p-3 space-y-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:bg-dark hover:text-primary transition-colors">
              <span>{item.icon}</span><span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-4 md:p-8 overflow-auto min-w-0">{children}</main>
    </div>
  );
}
