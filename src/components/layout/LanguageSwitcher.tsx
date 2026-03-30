"use client";

import { useState } from "react";
import { useLocale } from "next-intl";

const LANGS = [
  { code: "ja", label: "日本語", flag: "🇯🇵" },
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "tl", label: "Filipino", flag: "🇵🇭" },
] as const;

export function LanguageSwitcher() {
  const currentLocale = useLocale();
  const [open, setOpen] = useState(false);

  function switchLocale(code: string) {
    document.cookie = `locale=${code}; path=/; max-age=31536000; SameSite=Lax`;
    window.location.href = window.location.pathname + window.location.search;
  }

  const current = LANGS.find((l) => l.code === currentLocale) ?? LANGS[0];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-sm text-gray-300 hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-dark border border-transparent hover:border-dark-border"
        aria-label="言語切り替え / Language"
      >
        <span>{current.flag}</span>
        <span className="hidden sm:inline text-xs">{current.label}</span>
        <svg className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <>
          {/* 背景クリックで閉じる */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-50 bg-dark-card border border-dark-border rounded-xl shadow-xl overflow-hidden min-w-[140px]">
            {LANGS.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setOpen(false);
                  switchLocale(lang.code);
                }}
                className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors hover:bg-dark text-left ${
                  lang.code === currentLocale
                    ? "text-primary font-bold bg-dark/40"
                    : "text-gray-300"
                }`}
              >
                <span>{lang.flag}</span>
                <span>{lang.label}</span>
                {lang.code === currentLocale && (
                  <span className="ml-auto text-primary text-xs">✓</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
