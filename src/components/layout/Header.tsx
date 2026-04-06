"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Logo } from "./Logo";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useTranslations } from "next-intl";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const t = useTranslations("header");

  async function handleLogout() {
    await supabase.auth.signOut();
    router.refresh();
    router.push("/");
  }

  return (
    <header className="bg-dark-card border-b border-dark-border sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* ロゴ */}
        <Link href="/" className="flex items-center">
          <Logo />
        </Link>

        {/* 右側：言語切り替え + ログイン・登録ボタン */}
        <div className="hidden md:flex items-center gap-3">
          <LanguageSwitcher />
          <Link href="/auth/login" className="text-gray-300 hover:text-white text-sm transition-colors">
            {t("storeLogin")}
          </Link>
          <Link href="/auth/register" className="bg-primary hover:bg-primary-hover text-white text-sm px-4 py-2 rounded-full transition-colors font-bold">
            {t("applyListing")}
          </Link>
        </div>

        {/* スマホ用：言語切り替え + ハンバーガーメニュー */}
        <div className="md:hidden flex items-center gap-2">
          <LanguageSwitcher />
          <button
            className="text-gray-300 hover:text-white"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={t("menuAriaLabel")}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* スマホ用ドロップダウンメニュー */}
      {menuOpen && (
        <div className="md:hidden bg-dark-card border-t border-dark-border px-4 py-4 space-y-3">
          <Link href="/stores" className="block text-gray-300 hover:text-primary py-2" onClick={() => setMenuOpen(false)}>
            {t("storeList")}
          </Link>
          <Link href="/area/愛知" className="block text-gray-300 hover:text-primary py-2" onClick={() => setMenuOpen(false)}>
            📍 愛知
          </Link>
          <Link href="/area/静岡" className="block text-gray-300 hover:text-primary py-2" onClick={() => setMenuOpen(false)}>
            📍 静岡
          </Link>
          <Link href="/area/岐阜" className="block text-gray-300 hover:text-primary py-2" onClick={() => setMenuOpen(false)}>
            📍 岐阜
          </Link>
          <Link href="/area/三重" className="block text-gray-300 hover:text-primary py-2" onClick={() => setMenuOpen(false)}>
            📍 三重
          </Link>
          <Link href="/blog" className="block text-gray-300 hover:text-primary py-2" onClick={() => setMenuOpen(false)}>
            {t("column")}
          </Link>
          <Link href="/recruit" className="block text-pink-300 hover:text-pink-200 py-2 font-bold" onClick={() => setMenuOpen(false)}>
            💼 求人情報
          </Link>
          <hr className="border-dark-border" />
          <Link href="/auth/login" className="block text-gray-300 hover:text-white py-2" onClick={() => setMenuOpen(false)}>
            {t("storeLogin")}
          </Link>
          <Link href="/auth/register" className="block bg-primary text-white text-center py-2 rounded-full font-bold" onClick={() => setMenuOpen(false)}>
            {t("applyListing")}
          </Link>
        </div>
      )}
    </header>
  );
}
