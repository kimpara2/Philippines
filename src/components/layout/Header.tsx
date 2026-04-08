"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Logo } from "./Logo";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useTranslations } from "next-intl";
import { MapPin, Menu, X, Briefcase } from "lucide-react";

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
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* スマホ用ドロップダウンメニュー */}
      {menuOpen && (
        <div className="md:hidden bg-dark-card border-t border-dark-border px-4 py-4 space-y-3">
          <Link href="/stores" className="block text-gray-300 hover:text-primary py-2" onClick={() => setMenuOpen(false)}>
            {t("storeList")}
          </Link>
          {[
            { href: "/area/愛知", label: "愛知" },
            { href: "/area/静岡", label: "静岡" },
            { href: "/area/岐阜", label: "岐阜" },
            { href: "/area/三重", label: "三重" },
          ].map(({ href, label }) => (
            <Link key={href} href={href} className="flex items-center gap-2 text-gray-300 hover:text-primary py-2" onClick={() => setMenuOpen(false)}>
              <MapPin size={14} className="shrink-0" />
              {label}
            </Link>
          ))}
          <Link href="/blog" className="block text-gray-300 hover:text-primary py-2" onClick={() => setMenuOpen(false)}>
            {t("column")}
          </Link>
          <Link href="/recruit" className="flex items-center gap-2 text-pink-300 hover:text-pink-200 py-2 font-bold" onClick={() => setMenuOpen(false)}>
            <Briefcase size={15} className="shrink-0" />
            求人情報
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
