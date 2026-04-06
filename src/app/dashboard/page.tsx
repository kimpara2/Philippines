// 管理ダッシュボード トップ

import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import type { Metadata } from "next";
import type { Store } from "@/types/database";
import { getTranslations } from "next-intl/server";

export const metadata: Metadata = { title: "管理ダッシュボード" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const t = await getTranslations("dashboard");

  const { data: myStoresRaw } = await supabase
    .from("stores")
    .select("id, name, is_published, is_approved")
    .eq("owner_id", user!.id);
  const myStores = myStoresRaw as Pick<Store, "id" | "name" | "is_published" | "is_approved">[] | null;

  const storeId = myStores?.[0]?.id;

  let castCount = 0, reviewCount = 0, pendingReviewCount = 0, newApplicationCount = 0;
  if (storeId) {
    const [casts, reviews, pendingReviews, newApps] = await Promise.all([
      supabase.from("cast_members").select("id", { count: "exact" }).eq("store_id", storeId).eq("is_active", true),
      supabase.from("reviews").select("id", { count: "exact" }).eq("store_id", storeId).eq("is_approved", true),
      supabase.from("reviews").select("id", { count: "exact" }).eq("store_id", storeId).eq("is_approved", false),
      supabase.from("applications").select("id", { count: "exact" }).eq("store_id", storeId).eq("is_read", false),
    ]);
    castCount = casts.count ?? 0;
    reviewCount = reviews.count ?? 0;
    pendingReviewCount = pendingReviews.count ?? 0;
    newApplicationCount = newApps.count ?? 0;
  }

  const quickLinks = [
    { href: "/dashboard/store", icon: "🏪", label: t("editStoreInfo"), desc: t("editStoreInfoDesc") },
    { href: "/dashboard/cast", icon: "👩", label: t("manageCast"), desc: t("manageCastDesc") },
    { href: "/dashboard/reviews", icon: "💬", label: t("manageReviews"), desc: t("manageReviewsDesc") },
    { href: "/dashboard/news", icon: "📢", label: t("postNews"), desc: t("postNewsDesc") },
    { href: "/dashboard/applications", icon: "💼", label: "採用応募管理", desc: newApplicationCount > 0 ? `新着 ${newApplicationCount}件あります` : "応募者の確認・連絡" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-black text-white mb-8">{t("dashboard")}</h1>

      {myStores && myStores.length > 0 ? (
        <>
          {/* 店舗ステータス */}
          <div className="bg-dark-card border border-dark-border rounded-xl p-5 mb-8">
            <h2 className="text-accent font-bold mb-3">{t("myStores")}</h2>
            {myStores.map((store) => (
              <div key={store.id} className="flex items-center justify-between">
                <div>
                  <div className="text-white font-bold">{store.name}</div>
                  <div className="flex gap-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${store.is_published ? "bg-green-900/50 text-green-400" : "bg-gray-700 text-gray-400"}`}>
                      {store.is_published ? t("published") : t("unpublished")}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${store.is_approved ? "bg-blue-900/50 text-blue-400" : "bg-yellow-900/50 text-yellow-400"}`}>
                      {store.is_approved ? t("approved") : t("pendingApproval")}
                    </span>
                  </div>
                </div>
                <Link href={`/stores/${myStores[0]?.id}`} className="text-primary text-sm hover:underline">
                  {t("viewPublicPage")}
                </Link>
              </div>
            ))}
          </div>

          {/* 統計カード */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
            <div className="bg-dark-card border border-dark-border rounded-xl p-5 text-center">
              <div className="text-3xl font-black text-primary">{castCount}</div>
              <div className="text-gray-400 text-sm mt-1">{t("activeCast")}</div>
            </div>
            <div className="bg-dark-card border border-dark-border rounded-xl p-5 text-center">
              <div className="text-3xl font-black text-accent">{reviewCount}</div>
              <div className="text-gray-400 text-sm mt-1">{t("approvedReviews")}</div>
            </div>
            <div className="bg-dark-card border border-dark-border rounded-xl p-5 text-center">
              <div className={`text-3xl font-black ${pendingReviewCount > 0 ? "text-red-400" : "text-green-400"}`}>
                {pendingReviewCount}
              </div>
              <div className="text-gray-400 text-sm mt-1">{t("pendingReviews")}</div>
              {pendingReviewCount > 0 && (
                <Link href="/dashboard/reviews" className="text-red-400 text-xs hover:underline mt-1 inline-block">
                  {t("checkReviews")}
                </Link>
              )}
            </div>
            <Link href="/dashboard/applications" className="bg-dark-card border border-dark-border rounded-xl p-5 text-center hover:border-primary transition-colors">
              <div className={`text-3xl font-black ${newApplicationCount > 0 ? "text-primary" : "text-gray-400"}`}>
                {newApplicationCount}
              </div>
              <div className="text-gray-400 text-sm mt-1">新着応募</div>
              {newApplicationCount > 0 && (
                <div className="text-primary text-xs mt-1">確認する →</div>
              )}
            </Link>
          </div>

          {/* クイックリンク */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickLinks.map((item) => (
              <Link key={item.href} href={item.href} className="bg-dark-card border border-dark-border hover:border-primary rounded-xl p-5 transition-all group">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <div className="text-white font-bold group-hover:text-primary transition-colors">{item.label}</div>
                    <div className="text-gray-400 text-sm">{item.desc}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-20 bg-dark-card border border-dark-border rounded-2xl">
          <div className="text-5xl mb-4">🏪</div>
          <h2 className="text-xl font-bold text-white mb-2">{t("noStore")}</h2>
          <p className="text-gray-400 text-sm mb-6">{t("noStoreDesc")}</p>
          <Link href="/dashboard/store" className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-full font-bold transition-colors">
            {t("registerStore")}
          </Link>
        </div>
      )}
    </div>
  );
}
