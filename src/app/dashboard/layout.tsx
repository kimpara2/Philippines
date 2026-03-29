// 管理画面の共通レイアウト（サイドバー付き）

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  const isAdmin = (profile as { role: string } | null)?.role === "admin";

  if (!isAdmin) {
    const { data: store } = await supabase
      .from("stores")
      .select("is_approved")
      .eq("owner_id", user.id)
      .single();
    if (!store?.is_approved) redirect("/pending");
  }

  const t = await getTranslations("dashboard");

  const navItems = [
    { href: "/dashboard", label: t("dashboard"), icon: "🏠" },
    { href: "/dashboard/store", label: t("storeInfo"), icon: "🏪" },
    { href: "/dashboard/store/photos", label: t("photoManagement"), icon: "📸" },
    { href: "/dashboard/cast", label: t("castManagement"), icon: "👩" },
    { href: "/dashboard/reviews", label: t("reviewManagement"), icon: "💬" },
    { href: "/dashboard/news", label: t("news"), icon: "📢" },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-64px)]">
      {/* サイドバー */}
      <aside className="w-full md:w-56 bg-dark-card border-b md:border-b-0 md:border-r border-dark-border md:shrink-0">
        <div className="hidden md:block p-4 border-b border-dark-border">
          <div className="text-primary font-bold text-sm">⚙️ {t("title")}</div>
          <div className="text-gray-400 text-xs mt-0.5 truncate">{user.email}</div>
        </div>

        {/* モバイル：横スクロールナビ */}
        <nav className="md:hidden flex overflow-x-auto gap-1 p-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-gray-300 hover:bg-dark hover:text-primary transition-colors whitespace-nowrap bg-dark/50"
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
          {isAdmin && (
            <Link
              href="/admin"
              className="flex items-center gap-1.5 px-3 py-2 text-xs text-red-400 font-bold whitespace-nowrap bg-red-900/10 rounded-lg"
            >
              🔐 管理者
            </Link>
          )}
          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-2 text-xs text-gray-500 whitespace-nowrap bg-dark/50 rounded-lg"
          >
            ← サイトへ
          </Link>
        </nav>

        {/* PC：縦ナビ */}
        <nav className="hidden md:block p-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:bg-dark hover:text-primary transition-colors"
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="hidden md:block absolute bottom-4 left-0 w-56 px-3 space-y-1">
          {isAdmin && (
            <Link
              href="/admin"
              className="flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 font-bold transition-colors bg-red-900/10 rounded-lg"
            >
              {t("adminPanel")}
            </Link>
          )}
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-primary transition-colors"
          >
            {t("backToSite")}
          </Link>
        </div>
      </aside>

      {/* メインコンテンツ */}
      <main className="flex-1 p-4 md:p-8 overflow-auto min-w-0">{children}</main>
    </div>
  );
}
