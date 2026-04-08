import Link from "next/link";
import { Logo } from "./Logo";
import { MapPin, Store, Trophy, Newspaper, HelpCircle, Mail, LogIn, UserPlus, Settings } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-dark-card border-t border-dark-border mt-16">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* ロゴ・説明 */}
          <div>
            <div className="mb-3">
              <Logo />
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              全国のフィリピンパブ・スナック情報を網羅。
              お店選びの参考にどうぞ！
            </p>
          </div>

          {/* エリアリンク */}
          <div>
            <h3 className="text-accent font-bold mb-3 text-sm">エリアから探す</h3>
            <ul className="space-y-2">
              {["東京", "大阪", "名古屋", "静岡", "横浜", "福岡"].map((area) => (
                <li key={area}>
                  <Link
                    href={`/area/${area}`}
                    className="text-gray-400 hover:text-primary text-sm transition-colors flex items-center gap-2"
                  >
                    <MapPin size={13} className="shrink-0" />
                    {area}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* サイトリンク */}
          <div>
            <h3 className="text-accent font-bold mb-3 text-sm">サイトメニュー</h3>
            <ul className="space-y-2">
              {[
                { href: "/stores",       icon: Store,     label: "店舗一覧" },
                { href: "/ranking",      icon: Trophy,    label: "人気ランキング" },
                { href: "/blog",         icon: Newspaper, label: "ニュース・コラム" },
                { href: "/faq",          icon: HelpCircle,label: "よくある質問" },
                { href: "/contact",      icon: Mail,      label: "お問い合わせ" },
                { href: "/auth/login",   icon: LogIn,     label: "ログイン" },
                { href: "/auth/register",icon: UserPlus,  label: "会員登録" },
                { href: "/dashboard",    icon: Settings,  label: "店舗管理画面" },
              ].map(({ href, icon: Icon, label }) => (
                <li key={href}>
                  <Link href={href} className="text-gray-400 hover:text-primary text-sm transition-colors flex items-center gap-2">
                    <Icon size={13} className="shrink-0" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-dark-border pt-6 flex flex-col items-center gap-3">
          <div className="flex gap-4 text-xs text-gray-600">
            <Link href="/privacy" className="hover:text-gray-400 transition-colors">プライバシーポリシー</Link>
            <span>|</span>
            <Link href="/terms" className="hover:text-gray-400 transition-colors">利用規約</Link>
            <span>|</span>
            <Link href="/faq" className="hover:text-gray-400 transition-colors">よくある質問</Link>
            <span>|</span>
            <Link href="/contact" className="hover:text-gray-400 transition-colors">お問い合わせ</Link>
          </div>
          <div className="text-center text-gray-500 text-xs">
            © 2026 東海NIGHT All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
