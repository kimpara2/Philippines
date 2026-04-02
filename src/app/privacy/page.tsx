// プライバシーポリシーページ

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "プライバシーポリシー | 東海NIGHT",
  description: "東海NIGHTのプライバシーポリシー（個人情報の取り扱いについて）です。",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* パンくずリスト */}
      <nav className="text-xs text-gray-500 mb-6 flex items-center gap-1.5">
        <Link href="/" className="hover:text-primary transition-colors">トップ</Link>
        <span>›</span>
        <span className="text-gray-300">プライバシーポリシー</span>
      </nav>

      <h1 className="text-2xl font-black text-white mb-2">プライバシーポリシー</h1>
      <p className="text-gray-500 text-xs mb-10">最終更新日：2026年1月1日</p>

      <div className="prose prose-invert max-w-none space-y-8 text-gray-300 text-sm leading-relaxed">

        <section>
          <h2 className="text-white font-bold text-base mb-3">1. 基本方針</h2>
          <p>
            東海NIGHT（以下「当サイト」）は、ユーザーの個人情報の保護を重要な責務と考え、
            個人情報の保護に関する法律（個人情報保護法）をはじめとする法令を遵守し、
            適切に取り扱います。
          </p>
        </section>

        <section>
          <h2 className="text-white font-bold text-base mb-3">2. 収集する情報</h2>
          <p>当サイトでは、以下の情報を収集する場合があります。</p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-gray-400">
            <li>メールアドレス（会員登録・お問い合わせ時）</li>
            <li>氏名・店舗名・住所・電話番号（店舗掲載申請時）</li>
            <li>投稿内容（口コミ・レビュー・コメント）</li>
            <li>アクセスログ（IPアドレス、ブラウザ情報、閲覧ページ等）</li>
            <li>Cookie情報（言語設定・セッション管理）</li>
          </ul>
        </section>

        <section>
          <h2 className="text-white font-bold text-base mb-3">3. 利用目的</h2>
          <p>収集した情報は、以下の目的で利用します。</p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-gray-400">
            <li>会員サービスの提供・管理</li>
            <li>店舗掲載サービスの提供</li>
            <li>お問い合わせへの対応</li>
            <li>サービスの改善・新機能の開発</li>
            <li>利用規約違反への対応</li>
            <li>メールマガジン・お知らせの送信（同意した場合のみ）</li>
          </ul>
        </section>

        <section>
          <h2 className="text-white font-bold text-base mb-3">4. 第三者への提供</h2>
          <p>
            当サイトは、以下の場合を除き、個人情報を第三者に提供しません。
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-gray-400">
            <li>ユーザーの同意がある場合</li>
            <li>法令に基づく場合</li>
            <li>人の生命・身体・財産の保護のために必要な場合</li>
          </ul>
        </section>

        <section>
          <h2 className="text-white font-bold text-base mb-3">5. Cookieの使用</h2>
          <p>
            当サイトでは、利便性向上のためCookieを使用しています。
            言語設定の保存、ログイン状態の維持等に利用します。
            ブラウザの設定によりCookieを無効にすることができますが、
            一部機能が利用できなくなる場合があります。
          </p>
        </section>

        <section>
          <h2 className="text-white font-bold text-base mb-3">6. セキュリティ</h2>
          <p>
            当サイトは、個人情報への不正アクセス・紛失・破損・改ざん・漏洩を防ぐため、
            適切なセキュリティ対策を実施しています。
            パスワードは暗号化して保存し、通信はSSL/TLSにより暗号化されます。
          </p>
        </section>

        <section>
          <h2 className="text-white font-bold text-base mb-3">7. 個人情報の開示・訂正・削除</h2>
          <p>
            ユーザーは、ご自身の個人情報について開示・訂正・削除を請求することができます。
            ご希望の場合は、お問い合わせフォームよりご連絡ください。
          </p>
        </section>

        <section>
          <h2 className="text-white font-bold text-base mb-3">8. プライバシーポリシーの変更</h2>
          <p>
            当サイトは、必要に応じてプライバシーポリシーを変更することがあります。
            重要な変更がある場合はサイト上でお知らせします。
          </p>
        </section>

        <section>
          <h2 className="text-white font-bold text-base mb-3">9. お問い合わせ</h2>
          <p>
            個人情報の取り扱いに関するお問い合わせは、当サイトのお問い合わせフォームよりご連絡ください。
          </p>
        </section>
      </div>

      <div className="mt-10 pt-6 border-t border-dark-border">
        <Link href="/" className="text-primary hover:underline text-sm">← トップページに戻る</Link>
      </div>
    </div>
  );
}
