// 利用規約ページ

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "利用規約 | 東海NIGHT",
  description: "東海NIGHTの利用規約です。サービスをご利用の前にお読みください。",
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* パンくずリスト */}
      <nav className="text-xs text-gray-500 mb-6 flex items-center gap-1.5">
        <Link href="/" className="hover:text-primary transition-colors">トップ</Link>
        <span>›</span>
        <span className="text-gray-300">利用規約</span>
      </nav>

      <h1 className="text-2xl font-black text-white mb-2">利用規約</h1>
      <p className="text-gray-500 text-xs mb-10">最終更新日：2026年1月1日</p>

      <div className="space-y-8 text-gray-300 text-sm leading-relaxed">

        <section>
          <h2 className="text-white font-bold text-base mb-3">第1条（適用）</h2>
          <p>
            本規約は、東海NIGHT（以下「当サイト」）が提供するサービスの利用条件を定めるものです。
            当サイトを利用するすべてのユーザーは、本規約に同意したものとみなします。
          </p>
        </section>

        <section>
          <h2 className="text-white font-bold text-base mb-3">第2条（利用登録）</h2>
          <p>
            一部のサービス（口コミ投稿・店舗掲載申請等）のご利用には会員登録が必要です。
            登録情報は正確かつ最新の内容を記載してください。
            虚偽の情報による登録はアカウントを停止する場合があります。
          </p>
        </section>

        <section>
          <h2 className="text-white font-bold text-base mb-3">第3条（禁止事項）</h2>
          <p>当サイトの利用にあたり、以下の行為を禁止します。</p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-gray-400">
            <li>法令または公序良俗に違反する行為</li>
            <li>他のユーザーや第三者への誹謗中傷・名誉毀損</li>
            <li>虚偽の情報・口コミの投稿</li>
            <li>スパム・広告目的での利用</li>
            <li>当サイトのサーバーへの過度な負荷をかける行為</li>
            <li>当サイトのコンテンツを無断で複製・転載する行為</li>
            <li>他のユーザーのアカウントへの不正アクセス</li>
            <li>当サイトの運営を妨害する行為</li>
          </ul>
        </section>

        <section>
          <h2 className="text-white font-bold text-base mb-3">第4条（投稿コンテンツ）</h2>
          <p>
            ユーザーが投稿した口コミ・コメント等のコンテンツの著作権は投稿者に帰属しますが、
            当サイトはこれらをサービス改善・宣伝目的で無償で利用できるものとします。
            当サイトは、規約に違反するコンテンツを予告なく削除することができます。
          </p>
        </section>

        <section>
          <h2 className="text-white font-bold text-base mb-3">第5条（店舗掲載について）</h2>
          <p>
            店舗情報の掲載には審査があり、当サイトが不適切と判断した場合は掲載をお断りまたは停止することがあります。
            掲載情報の正確性については店舗オーナーが責任を持ち、当サイトは掲載情報の正確性を保証しません。
          </p>
        </section>

        <section>
          <h2 className="text-white font-bold text-base mb-3">第6条（免責事項）</h2>
          <p>
            当サイトは、掲載情報の正確性・完全性・最新性を保証しません。
            当サイトの利用または利用不能により生じた損害について、当サイトは責任を負いません。
            リンク先の外部サイトの内容についても、当サイトは責任を負いません。
          </p>
        </section>

        <section>
          <h2 className="text-white font-bold text-base mb-3">第7条（サービスの変更・終了）</h2>
          <p>
            当サイトは、ユーザーへの事前通知なくサービスの内容を変更、または提供を終了することがあります。
            これによりユーザーに生じた損害について、当サイトは責任を負いません。
          </p>
        </section>

        <section>
          <h2 className="text-white font-bold text-base mb-3">第8条（規約の変更）</h2>
          <p>
            当サイトは、必要に応じて本規約を変更することがあります。
            変更後に当サイトを利用した場合、変更後の規約に同意したものとみなします。
          </p>
        </section>

        <section>
          <h2 className="text-white font-bold text-base mb-3">第9条（準拠法・管轄裁判所）</h2>
          <p>
            本規約は日本法に準拠し、当サイトに関する紛争については、日本の裁判所を専属的合意管轄とします。
          </p>
        </section>

      </div>

      <div className="mt-10 pt-6 border-t border-dark-border flex gap-4">
        <Link href="/" className="text-primary hover:underline text-sm">← トップページに戻る</Link>
        <Link href="/privacy" className="text-gray-400 hover:text-primary hover:underline text-sm">プライバシーポリシー</Link>
      </div>
    </div>
  );
}
