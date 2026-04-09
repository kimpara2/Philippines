// よくある質問（FAQ）ページ — FAQPage JSON-LDでリッチスニペット狙い

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "よくある質問（FAQ）| 東海NIGHT",
  description:
    "フィリピンパブ・スナックとは何か、料金・システム・初めての方の疑問をまとめました。浜松・東海エリアの夜遊び情報サイト 東海NIGHT のよくある質問ページです。",
  keywords: ["フィリピンパブ", "スナック", "よくある質問", "FAQ", "料金", "システム", "初めて", "浜松 フィリピンパブ", "浜松 スナック"],
};

const FAQS = [
  {
    q: "フィリピンパブとは何ですか？",
    a: "フィリピンパブとは、フィリピン人女性スタッフが接客をするお酒を楽しむお店です。カラオケや会話を楽しみながらお酒を飲む「接客スタイルのバー」で、日本各地で人気があります。スタッフはフィリピン語（タガログ語）や英語、日本語を話せる方が多く、異文化交流も楽しめます。",
  },
  {
    q: "フィリピンパブの料金相場はいくらですか？",
    a: "お店によって異なりますが、一般的にはシステム料（席料）1,000〜3,000円＋ドリンク代が基本です。スタッフのドリンクをオーダーする「同伴ドリンク」制度があるお店も多く、1時間あたり3,000〜8,000円程度が目安です。詳しくは各店舗のページをご確認ください。",
  },
  {
    q: "初めてでも一人で入れますか？",
    a: "はい、初めての方・一人でのご来店でも大歓迎のお店がほとんどです。スタッフが丁寧に案内してくれるので、安心してお越しください。事前にお店に電話で「初めてですが…」と一言添えると、よりスムーズです。",
  },
  {
    q: "フィリピン人スタッフとはどんな話をするのですか？",
    a: "出身地・家族のこと・フィリピンの文化・旅行の話など、様々な会話が楽しめます。スタッフは日本語を話せる方が多く、カラオケを一緒に楽しんだり、お酒を飲みながら気軽におしゃべりするのがフィリピンパブの醍醐味です。",
  },
  {
    q: "何時から何時まで営業していますか？",
    a: "お店によって異なりますが、一般的に夜20時〜翌朝5時頃まで営業しているお店が多いです。各店舗のページに営業時間を掲載していますので、事前にご確認ください。",
  },
  {
    q: "予約は必要ですか？",
    a: "ほとんどのお店は予約なしでも入れますが、週末や連休は混みやすいので事前に電話予約することをおすすめします。お目当てのキャストさんをご希望の場合は、事前予約が確実です。",
  },
  {
    q: "ドレスコードはありますか？",
    a: "基本的にドレスコードはなく、普段着でお越しいただけます。ただし、一部のお店ではサンダル・短パンなどカジュアルすぎる服装をお断りしている場合もあります。不安な場合はお店にお問い合わせください。",
  },
  {
    q: "クレジットカードは使えますか？",
    a: "現金のみのお店が多いですが、最近はカード・電子マネー対応のお店も増えています。各店舗のページや、直接お店へのお問い合わせでご確認ください。",
  },
  {
    q: "お店はどうやって選べばいいですか？",
    a: "東海NIGHTでは、エリア・口コミ評価・在籍キャスト情報で絞り込んで選ぶことができます。口コミや評価を参考にしながら、自分の好みに合ったお店を探してみてください。",
  },
  {
    q: "口コミを投稿するにはどうすればいいですか？",
    a: "会員登録（無料）後、各店舗のページから口コミを投稿できます。星評価とコメントで、他のユーザーのお店選びに役立ててください。",
  },
  {
    q: "スナックとフィリピンパブの違いは何ですか？",
    a: "スナックはカウンター越しにママやスタッフと会話・カラオケを楽しむ日本の大衆バーで、料金は比較的リーズナブルです。フィリピンパブはフィリピン人女性スタッフが接客するスタイルで、カラオケや異文化交流が楽しめます。どちらもアットホームな雰囲気が特徴で、常連客が多いのも共通点です。",
  },
  {
    q: "浜松のフィリピンパブはどこで探せますか？",
    a: "東海NIGHTの「浜松エリア」ページで、浜松市内のフィリピンパブを一覧でチェックできます。料金・営業時間・在籍キャスト情報も掲載しているので、お好みの店舗をすぐに見つけられます。",
  },
  {
    q: "浜松のスナックはどこで探せますか？",
    a: "東海NIGHTの浜松エリアページでカテゴリを「スナック」に絞り込むと、浜松市内のスナックを一覧で確認できます。浜松駅周辺のアットホームなスナックを探すならぜひご利用ください。",
  },
  {
    q: "浜松の夜遊びスポットを教えてください。",
    a: "浜松市はフィリピンパブ・スナック・ガールズバー・バーなど多彩な夜遊びスポットが揃うエリアです。浜松駅周辺には多くのお店が集まっており、東海NIGHTでは浜松の掲載店舗をエリア・ジャンル別に検索できます。",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.a,
    },
  })),
};

export default function FaqPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* パンくずリスト */}
      <nav className="text-xs text-gray-500 mb-6 flex items-center gap-1.5">
        <Link href="/" className="hover:text-primary transition-colors">トップ</Link>
        <span>›</span>
        <span className="text-gray-300">よくある質問</span>
      </nav>

      <h1 className="text-3xl font-black text-white mb-2">よくある質問（FAQ）</h1>
      <p className="text-gray-400 text-sm mb-10">
        フィリピンパブに関するよくある疑問をまとめました。初めての方もぜひ参考にしてください。
      </p>

      <div className="space-y-4">
        {FAQS.map((faq, i) => (
          <div
            key={i}
            className="bg-dark-card border border-dark-border rounded-xl overflow-hidden"
          >
            {/* 質問 */}
            <div className="flex items-start gap-4 px-6 py-5 bg-dark-card">
              <span className="text-primary font-black text-xl shrink-0 mt-0.5">Q</span>
              <p className="text-white font-bold text-base leading-snug">{faq.q}</p>
            </div>
            {/* 回答 */}
            <div className="flex items-start gap-4 px-6 py-5 bg-dark border-t border-dark-border">
              <span className="text-accent font-black text-xl shrink-0 mt-0.5">A</span>
              <p className="text-gray-300 text-sm leading-relaxed">{faq.a}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CTAセクション */}
      <div className="mt-12 bg-dark-card border border-dark-border rounded-2xl p-8 text-center">
        <p className="text-gray-300 mb-4 font-bold">お近くのフィリピンパブを探してみませんか？</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/stores"
            className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-full font-bold transition-colors text-sm"
          >
            🏪 店舗一覧を見る
          </Link>
          <Link
            href="/ranking"
            className="bg-dark border border-dark-border hover:border-primary text-gray-300 hover:text-white px-6 py-3 rounded-full font-bold transition-colors text-sm"
          >
            🏆 人気ランキングを見る
          </Link>
        </div>
      </div>
    </div>
  );
}
