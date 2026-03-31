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
    default: "夜トカイ | 東海の夜遊びガイド",
    template: "%s | 夜トカイ",
  },
  description:
    "東海（愛知・静岡・岐阜・三重）のフィリピンパブ・スナック・ガールズバー・バー・キャバクラ情報を網羅！浜松・名古屋・静岡市など東海エリアの夜遊び情報をお届けします。",
  keywords: ["フィリピンパブ", "スナック", "ガールズバー", "キャバクラ", "バー", "東海", "愛知", "静岡", "浜松", "名古屋"],
  verification: {
    google: "5sf8lHm6vRigWQL6t6HZDTpmxIuQnHacZ3aU9JuQp48",
  },
  openGraph: {
    title: "夜トカイ | 東海の夜遊びガイド",
    description: "東海エリアのフィリピンパブ・スナック・ガールズバー・バー・キャバクラ情報を網羅！",
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
