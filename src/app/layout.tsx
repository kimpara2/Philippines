import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  variable: "--font-noto-sans-jp",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "フィリピンパブNavi | 全国のフィリピンパブ情報",
    template: "%s | フィリピンパブNavi",
  },
  description:
    "全国のフィリピンパブ・スナック情報を網羅！東京・大阪・名古屋など全国の店舗一覧・キャスト紹介・口コミ・アクセスなど充実の情報をお届けします。",
  keywords: ["フィリピンパブ", "全国", "スナック", "キャスト", "フィリピン", "東京", "大阪", "名古屋"],
  verification: {
    google: "5sf8lHm6vRigWQL6t6HZDTpmxIuQnHacZ3aU9JuQp48",
  },
  openGraph: {
    title: "フィリピンパブNavi | 全国のフィリピンパブ情報",
    description: "全国のフィリピンパブ・スナック情報を網羅！",
    locale: "ja_JP",
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} className={notoSansJP.variable}>
      <head>
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-1QT0ET9GN6" />
        <script dangerouslySetInnerHTML={{ __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-1QT0ET9GN6');
        `}} />
      </head>
      <body className="bg-dark text-white min-h-screen flex flex-col">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
