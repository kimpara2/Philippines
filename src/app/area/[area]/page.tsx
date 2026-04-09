// エリア別店舗一覧ページ

import { createClient } from "@/lib/supabase/server";
import { StoreListItem } from "@/components/store/StoreListItem";
import { RecruitBanner } from "@/components/recruit/RecruitBanner";
import { FeaturedCastSection, type FeaturedCast } from "@/components/cast/FeaturedCastSection";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import type { Store, CastPreview } from "@/types/database";

const CATEGORY_EMOJI: Record<string, string> = {
  news: "📰",
  column: "✍️",
  event: "🎉",
};

type AreaNews = {
  id: string;
  title: string;
  body: string;
  category: string;
  thumbnail_url: string | null;
  created_at: string;
};

// 県名 → 配下エリアのマッピング
const PREFECTURE_AREAS: Record<string, string[]> = {
  愛知:  ["栄", "錦", "大須", "名古屋"],
  静岡:  ["浜松", "静岡市", "沼津"],
  岐阜:  ["岐阜市"],
  三重:  ["四日市"],
};

const CATEGORIES = ["フィリピンパブ", "スナック", "ガールズバー", "バー", "キャバクラ"];

// エリア別SEO紹介文（カテゴリなし）
const AREA_SEO_TEXT: Record<string, string> = {
  浜松: "浜松市のフィリピンパブ・スナック・ガールズバー・バー情報を東海NIGHTが厳選してご紹介。浜松駅周辺を中心に、フィリピーナが在籍する本格フィリピンパブ、アットホームなスナック、おしゃれなガールズバーなど多彩な夜遊びスポットが揃っています。浜松でのナイトライフ情報はここでチェック！",
  名古屋: "名古屋市のフィリピンパブ・スナック・ガールズバー情報をお届け。栄・錦・大須エリアの人気店を厳選掲載中。",
  静岡市: "静岡市のフィリピンパブ・スナック・ガールズバー情報を掲載。静岡駅周辺の夜遊び情報をまとめてチェック。",
  沼津: "沼津のフィリピンパブ・スナック・ガールズバー情報を掲載。沼津駅周辺の夜遊びスポットをご紹介。",
  岐阜市: "岐阜市のフィリピンパブ・スナック・ガールズバー情報を掲載。岐阜駅周辺の夜遊び情報をチェック。",
  四日市: "四日市のフィリピンパブ・スナック・ガールズバー情報を掲載。三重県四日市の夜遊びスポットをご紹介。",
};

// エリア × カテゴリ別SEO紹介文
const AREA_CATEGORY_SEO_TEXT: Record<string, Record<string, string>> = {
  浜松: {
    フィリピンパブ: "浜松市のフィリピンパブを東海NIGHTで探そう。フィリピーナが在籍する本格フィリピンパブを浜松駅周辺で厳選掲載。料金・営業時間・キャスト情報も確認できます。",
    スナック: "浜松市のスナックを東海NIGHTで探そう。浜松駅周辺のアットホームなスナックをご紹介。ママや女性スタッフとカラオケや会話が楽しめるお店を掲載中。",
    ガールズバー: "浜松市のガールズバーを東海NIGHTで探そう。浜松駅周辺のおしゃれなガールズバーを掲載。女の子スタッフと気軽に飲めるお店を探すならここで。",
    バー: "浜松市のバーを東海NIGHTで探そう。浜松駅周辺のこだわりバーからカジュアルに飲めるお店まで掲載中。",
    キャバクラ: "浜松市のキャバクラを東海NIGHTで探そう。浜松エリアの人気キャバクラを掲載。料金・在籍キャスト情報をチェックしてから来店できます。",
  },
  名古屋: {
    フィリピンパブ: "名古屋のフィリピンパブを東海NIGHTで探そう。栄・錦・大須エリアのフィリピンパブを厳選掲載。フィリピーナが在籍する人気店の料金・営業時間・キャスト情報を確認できます。",
    スナック: "名古屋のスナックを東海NIGHTで探そう。栄・錦エリアのアットホームなスナックをご紹介。ママや女の子スタッフとカラオケや会話が楽しめるお店を掲載中。",
    ガールズバー: "名古屋のガールズバーを東海NIGHTで探そう。栄・錦・大須エリアのおしゃれなガールズバーを厳選掲載。",
    バー: "名古屋のバーを東海NIGHTで探そう。栄・錦エリアのこだわりバーからカジュアルに飲めるお店まで掲載中。",
    キャバクラ: "名古屋のキャバクラを東海NIGHTで探そう。栄・錦エリアの人気キャバクラを掲載。料金・キャスト情報をチェックして来店できます。",
  },
  栄: {
    フィリピンパブ: "名古屋・栄エリアのフィリピンパブを東海NIGHTで探そう。栄周辺のフィリピンパブを厳選掲載。料金・営業時間・キャスト情報を確認できます。",
    スナック: "名古屋・栄エリアのスナックを東海NIGHTで探そう。栄周辺のアットホームなスナックを掲載中。",
    ガールズバー: "名古屋・栄エリアのガールズバーを東海NIGHTで探そう。栄周辺のおしゃれなガールズバーを掲載。",
    バー: "名古屋・栄エリアのバーを東海NIGHTで探そう。栄周辺のこだわりバーを掲載中。",
    キャバクラ: "名古屋・栄エリアのキャバクラを東海NIGHTで探そう。栄周辺の人気キャバクラを掲載中。",
  },
  錦: {
    フィリピンパブ: "名古屋・錦エリアのフィリピンパブを東海NIGHTで探そう。錦周辺のフィリピンパブを厳選掲載。料金・キャスト情報も確認できます。",
    スナック: "名古屋・錦エリアのスナックを東海NIGHTで探そう。錦周辺のアットホームなスナックを掲載中。",
    ガールズバー: "名古屋・錦エリアのガールズバーを東海NIGHTで探そう。錦周辺のおしゃれなガールズバーを掲載。",
    バー: "名古屋・錦エリアのバーを東海NIGHTで探そう。錦周辺の人気バーを掲載中。",
    キャバクラ: "名古屋・錦エリアのキャバクラを東海NIGHTで探そう。錦周辺の人気キャバクラを掲載中。",
  },
  大須: {
    フィリピンパブ: "名古屋・大須エリアのフィリピンパブを東海NIGHTで探そう。大須周辺のフィリピンパブを厳選掲載。",
    スナック: "名古屋・大須エリアのスナックを東海NIGHTで探そう。大須周辺のアットホームなスナックを掲載中。",
    ガールズバー: "名古屋・大須エリアのガールズバーを東海NIGHTで探そう。大須周辺のガールズバーを掲載中。",
    バー: "名古屋・大須エリアのバーを東海NIGHTで探そう。大須周辺のバーを掲載中。",
    キャバクラ: "名古屋・大須エリアのキャバクラを東海NIGHTで探そう。大須周辺のキャバクラを掲載中。",
  },
  静岡市: {
    フィリピンパブ: "静岡市のフィリピンパブを東海NIGHTで探そう。静岡駅周辺のフィリピンパブを厳選掲載。フィリピーナが在籍するお店の料金・営業時間・キャスト情報を確認できます。",
    スナック: "静岡市のスナックを東海NIGHTで探そう。静岡駅周辺のアットホームなスナックをご紹介。ママや女性スタッフとカラオケが楽しめるお店を掲載中。",
    ガールズバー: "静岡市のガールズバーを東海NIGHTで探そう。静岡駅周辺のガールズバーを厳選掲載。",
    バー: "静岡市のバーを東海NIGHTで探そう。静岡駅周辺のおすすめバーを掲載中。",
    キャバクラ: "静岡市のキャバクラを東海NIGHTで探そう。静岡エリアの人気キャバクラを掲載中。",
  },
  沼津: {
    フィリピンパブ: "沼津のフィリピンパブを東海NIGHTで探そう。沼津駅周辺のフィリピンパブを厳選掲載。料金・営業時間・キャスト情報を確認できます。",
    スナック: "沼津のスナックを東海NIGHTで探そう。沼津駅周辺のアットホームなスナックを掲載中。",
    ガールズバー: "沼津のガールズバーを東海NIGHTで探そう。沼津駅周辺のガールズバーを掲載中。",
    バー: "沼津のバーを東海NIGHTで探そう。沼津駅周辺のおすすめバーを掲載中。",
    キャバクラ: "沼津のキャバクラを東海NIGHTで探そう。沼津エリアの人気キャバクラを掲載中。",
  },
  岐阜市: {
    フィリピンパブ: "岐阜市のフィリピンパブを東海NIGHTで探そう。岐阜駅周辺のフィリピンパブを厳選掲載。フィリピーナが在籍するお店の料金・キャスト情報を確認できます。",
    スナック: "岐阜市のスナックを東海NIGHTで探そう。岐阜駅周辺のアットホームなスナックを掲載中。",
    ガールズバー: "岐阜市のガールズバーを東海NIGHTで探そう。岐阜駅周辺のガールズバーを掲載中。",
    バー: "岐阜市のバーを東海NIGHTで探そう。岐阜駅周辺のおすすめバーを掲載中。",
    キャバクラ: "岐阜市のキャバクラを東海NIGHTで探そう。岐阜エリアの人気キャバクラを掲載中。",
  },
  四日市: {
    フィリピンパブ: "四日市のフィリピンパブを東海NIGHTで探そう。四日市駅周辺のフィリピンパブを厳選掲載。料金・キャスト情報を確認できます。",
    スナック: "四日市のスナックを東海NIGHTで探そう。四日市駅周辺のアットホームなスナックを掲載中。",
    ガールズバー: "四日市のガールズバーを東海NIGHTで探そう。四日市駅周辺のガールズバーを掲載中。",
    バー: "四日市のバーを東海NIGHTで探そう。四日市駅周辺のおすすめバーを掲載中。",
    キャバクラ: "四日市のキャバクラを東海NIGHTで探そう。三重県四日市エリアの人気キャバクラを掲載中。",
  },
};

const PAGE_SIZE = 12;

// エリア × カテゴリ別FAQ
const AREA_FAQS: Record<string, Array<{ q: string; a: string }>> = {
  浜松: [
    { q: "浜松のフィリピンパブの料金相場はいくらですか？", a: "浜松のフィリピンパブはシステム料1,000〜3,000円＋ドリンク代が基本で、1時間あたり3,000〜8,000円程度が目安です。お店によって異なるため、各店舗ページの料金情報をご確認ください。" },
    { q: "浜松のフィリピンパブは初めてでも入れますか？", a: "はい、浜松のほとんどのフィリピンパブは初めての方・一人でのご来店を歓迎しています。事前にお店へ「初めてですが」と一言伝えると安心です。" },
    { q: "浜松のスナックはどんな雰囲気ですか？", a: "浜松のスナックはアットホームな雰囲気のお店が多く、ママや女性スタッフとカラオケや会話を楽しめます。常連客も多く、初めての方でも入りやすいお店がほとんどです。" },
    { q: "浜松で夜遊びするならどのエリアがおすすめですか？", a: "浜松駅周辺（浜松駅北口・田町エリア）にフィリピンパブ・スナック・ガールズバーが集中しており、徒歩で複数のお店を回りやすく初めての方にもおすすめです。" },
  ],
  名古屋: [
    { q: "名古屋のフィリピンパブの料金相場は？", a: "名古屋のフィリピンパブはシステム料1,000〜3,000円＋ドリンク代が基本。1時間4,000〜10,000円程度が目安です。" },
    { q: "名古屋のスナックはどこに多いですか？", a: "名古屋のスナックは栄・錦エリアに多く集まっています。アットホームなお店から高級志向まで幅広い選択肢があります。" },
    { q: "名古屋のガールズバーはどのエリアが多いですか？", a: "名古屋のガールズバーは栄・錦・大須エリアに多く集まっています。おしゃれなお店から気軽に入れるお店まで揃っています。" },
  ],
  静岡市: [
    { q: "静岡市のフィリピンパブはどこで探せますか？", a: "東海NIGHTの静岡市エリアページで静岡駅周辺のフィリピンパブを一覧で確認できます。" },
    { q: "静岡市のスナックの特徴は？", a: "静岡市のスナックはアットホームな雰囲気で、ママや女性スタッフとカラオケや会話が楽しめます。" },
  ],
  沼津: [
    { q: "沼津のフィリピンパブはどこで探せますか？", a: "東海NIGHTの沼津エリアページで沼津駅周辺のフィリピンパブを一覧で確認できます。" },
    { q: "沼津でおすすめの夜遊びスポットは？", a: "沼津ではフィリピンパブ・スナック・ガールズバーが揃っています。東海NIGHTで口コミや評価を参考にお気に入りのお店を見つけてください。" },
  ],
};

type Props = {
  params: Promise<{ area: string }>;
  searchParams: Promise<{ category?: string; page?: string }>;
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { area } = await params;
  const { category, page } = await searchParams;
  const decodedArea = decodeURIComponent(area);
  const currentPage = Math.max(1, parseInt(page ?? "1"));
  const subAreas = PREFECTURE_AREAS[decodedArea];
  const searchAreas = subAreas ? [decodedArea, ...subAreas] : [decodedArea];

  const supabase = await createClient();
  let countQuery = supabase
    .from("stores")
    .select("*", { count: "exact", head: true })
    .in("area", searchAreas)
    .eq("is_published", true)
    .eq("is_approved", true);
  if (category) countQuery = countQuery.eq("category", category);
  const { count } = await countQuery;

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);
  const genre = category ?? "夜遊びスポット";
  const pageLabel = currentPage > 1 ? ` (${currentPage}ページ目)` : "";
  const title = `${decodedArea}の${genre}一覧${count ? `【${count}件】` : ""}${pageLabel}`;
  const description = category
    ? `${decodedArea}の${category}${count ? `${count}件` : ""}を掲載。営業時間・料金・アクセス情報を東海NIGHTでチェック。`
    : `${decodedArea}のフィリピンパブ・スナック・ガールズバー・バー・キャバクラ${count ? `${count}件` : ""}を掲載。東海NIGHTで${decodedArea}の夜遊び情報を探そう。`;

  const areaKeywords = decodedArea === "浜松"
    ? ["フィリピンパブ 浜松", "浜松 フィリピンパブ", "浜松市 フィリピンパブ", "浜松 スナック", "浜松 ガールズバー", "浜松 夜遊び", "浜松市 夜遊び"]
    : [`フィリピンパブ ${decodedArea}`, `${decodedArea} フィリピンパブ`, `${decodedArea} スナック`, `${decodedArea} 夜遊び`];

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const baseUrl = `${siteUrl}/area/${area}${category ? `?category=${encodeURIComponent(category)}` : ""}`;
  const pageParam = (p: number) => category ? `&page=${p}` : `?page=${p}`;

  return {
    title,
    description,
    keywords: areaKeywords,
    openGraph: { title: `${title} | 東海NIGHT`, description },
    alternates: {
      canonical: currentPage === 1 ? baseUrl : `${baseUrl}${pageParam(currentPage)}`,
      ...(currentPage > 1 ? { prev: currentPage === 2 ? baseUrl : `${baseUrl}${pageParam(currentPage - 1)}` } : {}),
      ...(currentPage < totalPages ? { next: `${baseUrl}${pageParam(currentPage + 1)}` } : {}),
    },
  };
}

export default async function AreaPage({ params, searchParams }: Props) {
  const { area } = await params;
  const { category, page } = await searchParams;
  const currentPage = Math.max(1, parseInt(page ?? "1"));
  const offset = (currentPage - 1) * PAGE_SIZE;
  const decodedArea = decodeURIComponent(area);
  const supabase = await createClient();

  // 県名の場合は配下エリアも含めて検索
  const subAreas = PREFECTURE_AREAS[decodedArea];
  const searchAreas = subAreas ? [decodedArea, ...subAreas] : [decodedArea];

  // 管理者ユーザーのIDを取得
  const { data: adminProfilesArea } = await supabase
    .from("profiles")
    .select("id")
    .eq("role", "admin");
  const adminIdsArea = new Set((adminProfilesArea ?? []).map((p: { id: string }) => p.id));

  // 全件取得してページネーション（管理者優先のソートが必要なため全件取得）
  let storeQuery = supabase
    .from("stores")
    .select("*")
    .in("area", searchAreas)
    .eq("is_published", true)
    .eq("is_approved", true);
  if (category) storeQuery = storeQuery.eq("category", category);
  const { data: storesRaw } = await storeQuery;
  const allAreaStores = (storesRaw as Store[] | null) ?? [];
  const adminAreaStores = allAreaStores.filter((s) => s.owner_id && adminIdsArea.has(s.owner_id));
  const otherAreaStores = allAreaStores.filter((s) => !s.owner_id || !adminIdsArea.has(s.owner_id)).sort(() => Math.random() - 0.5);
  const allStoresSorted = [...adminAreaStores, ...otherAreaStores];
  const totalCount = allStoresSorted.length;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const stores = allStoresSorted.slice(offset, offset + PAGE_SIZE);

  // キャスト写真・店舗写真を取得
  const storeIds = (stores ?? []).map((s) => s.id);
  const [castsRaw, photosRaw] = storeIds.length > 0
    ? await Promise.all([
        supabase.from("cast_members").select("id, store_id, name, profile_image_url").in("store_id", storeIds).eq("is_active", true).order("sort_order").then(r => r.data),
        supabase.from("store_photos").select("store_id, url").in("store_id", storeIds).order("sort_order").then(r => r.data),
      ])
    : [null, null];

  const castsByStore: Record<string, CastPreview[]> = {};
  (castsRaw ?? []).forEach((c) => {
    const cast = c as CastPreview;
    if (!castsByStore[cast.store_id]) castsByStore[cast.store_id] = [];
    castsByStore[cast.store_id].push(cast);
  });

  const photosByStore: Record<string, string[]> = {};
  (photosRaw ?? []).forEach((p: { store_id: string; url: string }) => {
    if (!photosByStore[p.store_id]) photosByStore[p.store_id] = [];
    photosByStore[p.store_id].push(p.url);
  });

  // エリアのおすすめキャストを取得（最大5人）
  const { data: featuredCastsRaw } = await supabase
    .from("cast_members")
    .select(`
      id, name, age, nationality, profile_image_url, description,
      stores!inner(slug, name, area, category)
    `)
    .eq("is_featured", true)
    .eq("is_active", true)
    .in("stores.area", searchAreas)
    .eq("stores.is_published", true)
    .eq("stores.is_approved", true)
    .order("sort_order")
    .limit(5);

  const featuredCasts: FeaturedCast[] = ((featuredCastsRaw ?? []) as any[]).map((c) => ({
    id: c.id, name: c.name, age: c.age, nationality: c.nationality,
    profile_image_url: c.profile_image_url, description: c.description,
    store: c.stores,
  }));

  // エリア別求人数を取得
  const { count: recruitCount } = await supabase
    .from("stores")
    .select("id", { count: "exact", head: true })
    .in("area", searchAreas)
    .eq("is_published", true)
    .eq("is_approved", true)
    .eq("recruit_enabled", true);

  // エリア別ブログ記事を取得（カテゴリ指定時はタイトルでジャンル絞り込み）
  let newsQuery = supabase
    .from("site_news")
    .select("id, title, body, category, thumbnail_url, created_at")
    .eq("area", decodedArea)
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(3);
  if (category) newsQuery = newsQuery.ilike("title", `%${category}%`);
  const { data: areaNewsRaw } = await newsQuery;
  const areaNews = areaNewsRaw as AreaNews[] | null;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const pageLabel = `${decodedArea}の${category ?? "夜遊びスポット"}`;
  const jsonLdList = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "トップ", item: siteUrl },
        { "@type": "ListItem", position: 2, name: "店舗一覧", item: siteUrl + "/stores" },
        { "@type": "ListItem", position: 3, name: pageLabel },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: pageLabel + "一覧",
      itemListElement: (stores ?? []).map((store, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: store.name,
        url: siteUrl + "/stores/" + store.slug,
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: pageLabel + "一覧 | 東海NIGHT",
      description: `${decodedArea}のフィリピンパブ・スナック・ガールズバー情報を掲載。${stores?.length ?? 0}件掲載中。`,
      url: siteUrl + "/area/" + area,
      inLanguage: "ja",
      about: {
        "@type": "Place",
        name: decodedArea,
        address: { "@type": "PostalAddress", addressRegion: decodedArea, addressCountry: "JP" },
      },
    },
  ];
  const jsonLd = JSON.stringify(jsonLdList);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />
      <nav className="text-sm text-gray-400 mb-6">
        <Link href="/" className="hover:text-primary">トップ</Link>
        <span className="mx-2">›</span>
        <Link href="/stores" className="hover:text-primary">店舗一覧</Link>
        <span className="mx-2">›</span>
        <span className="text-white">{decodedArea}</span>
      </nav>

      <div className="flex items-start justify-between gap-4 mb-2">
        <h1 className="text-2xl font-black text-white">
          {decodedArea}{category ? `の${category}` : "の夜遊びスポット"}一覧
        </h1>
        <Link
          href={`/ranking/${encodeURIComponent(decodedArea)}`}
          className="shrink-0 flex items-center gap-2 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/50 text-yellow-400 font-bold text-sm px-4 py-2.5 rounded-xl transition-colors"
        >
          🏆 ランキングを見る
        </Link>
      </div>
      <p className="text-gray-400 text-sm mb-2">{stores?.length ?? 0}件掲載中</p>
      {(() => {
        const catText = category && AREA_CATEGORY_SEO_TEXT[decodedArea]?.[category];
        const areaText = !category && AREA_SEO_TEXT[decodedArea];
        const text = catText || areaText;
        return text ? (
          <p className="text-gray-400 text-sm mb-6 leading-relaxed">{text}</p>
        ) : <div className="mb-6" />;
      })()}

      {/* カテゴリフィルター */}
      <div className="flex flex-wrap gap-2 mb-8">
        <Link
          href={`/area/${area}`}
          className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${
            !category ? "bg-primary text-white" : "bg-dark-card border border-dark-border text-gray-300 hover:border-primary"
          }`}
        >
          すべて
        </Link>
        {CATEGORIES.map((c) => (
          <Link
            key={c}
            href={`/area/${area}?category=${encodeURIComponent(c)}`}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${
              category === c ? "bg-primary text-white" : "bg-dark-card border border-dark-border text-gray-300 hover:border-primary"
            }`}
          >
            {c}
          </Link>
        ))}
      </div>

      {stores && stores.length > 0 ? (
        <div className="flex flex-col gap-4">
          {stores.map((store) => (
            <StoreListItem key={store.id} store={store} casts={castsByStore[store.id]} photos={photosByStore[store.id]} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-dark-card rounded-2xl border border-dark-border">
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-gray-400">{decodedArea}エリアの店舗はまだ登録されていません</p>
        </div>
      )}

      {/* ページネーション */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          {currentPage > 1 && (
            <Link
              href={`/area/${area}${category ? `?category=${encodeURIComponent(category)}&` : "?"}page=${currentPage - 1}`}
              className="px-4 py-2 rounded-full bg-dark-card border border-dark-border text-gray-300 hover:border-primary hover:text-white text-sm font-bold transition-colors"
            >← 前へ</Link>
          )}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/area/${area}${category ? `?category=${encodeURIComponent(category)}&` : "?"}page=${p}`}
              className={`w-9 h-9 flex items-center justify-center rounded-full text-sm font-bold transition-colors ${
                p === currentPage ? "bg-primary text-white" : "bg-dark-card border border-dark-border text-gray-300 hover:border-primary hover:text-white"
              }`}
            >{p}</Link>
          ))}
          {currentPage < totalPages && (
            <Link
              href={`/area/${area}${category ? `?category=${encodeURIComponent(category)}&` : "?"}page=${currentPage + 1}`}
              className="px-4 py-2 rounded-full bg-dark-card border border-dark-border text-gray-300 hover:border-primary hover:text-white text-sm font-bold transition-colors"
            >次へ →</Link>
          )}
        </div>
      )}

      {/* 関連カテゴリへのクロスリンク */}
      <div className="mt-10">
        <h2 className="text-sm font-bold text-gray-400 mb-3">{decodedArea}の他のカテゴリも見る</h2>
        <div className="flex flex-wrap gap-2">
          <Link href={`/area/${area}`} className="px-4 py-2 rounded-full bg-dark-card border border-dark-border text-gray-300 hover:border-primary hover:text-white text-sm font-bold transition-colors">
            すべて
          </Link>
          {CATEGORIES.filter((c) => c !== category).map((c) => (
            <Link key={c} href={`/area/${area}?category=${encodeURIComponent(c)}`}
              className="px-4 py-2 rounded-full bg-dark-card border border-dark-border text-gray-300 hover:border-primary hover:text-white text-sm font-bold transition-colors">
              {decodedArea}の{c}
            </Link>
          ))}
        </div>
      </div>

      {/* おすすめ女子 */}
      {featuredCasts.length > 0 && (
        <div className="mt-10">
          <FeaturedCastSection casts={featuredCasts} area={decodedArea} />
        </div>
      )}

      {/* 求人バナー */}
      <div className="mt-10">
        <RecruitBanner area={decodedArea} count={recruitCount ?? 0} />
      </div>

      {/* エリア別ブログ記事 */}
      {areaNews && areaNews.length > 0 && (
        <div className="mt-12">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-accent">📝 {decodedArea}の{category ?? "夜遊び"}コラム</h2>
            <Link href="/blog" className="text-primary text-sm hover:underline">すべての記事を見る →</Link>
          </div>
          <div className="divide-y divide-dark-border border border-dark-border rounded-xl overflow-hidden">
            {areaNews.map((post) => (
              <Link key={post.id} href={`/blog/${post.id}`} className="flex items-center gap-4 p-4 bg-dark-card hover:bg-dark transition-colors group">
                <div className="relative w-20 h-16 rounded-lg overflow-hidden shrink-0 bg-dark">
                  {post.thumbnail_url ? (
                    <Image src={post.thumbnail_url} alt={post.title} fill className="object-cover" unoptimized />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-950 to-slate-900 flex items-center justify-center text-2xl">
                      {CATEGORY_EMOJI[post.category] ?? "📝"}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-bold text-sm group-hover:text-primary transition-colors line-clamp-2">{post.title}</div>
                  <div className="text-gray-500 text-xs mt-1">{new Date(post.created_at).toLocaleDateString("ja-JP")}</div>
                </div>
                <span className="text-primary text-xs shrink-0">→</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* エリア別FAQセクション */}
      {AREA_FAQS[decodedArea] && (
        <div className="mt-12">
          <h2 className="text-lg font-bold text-white mb-4">
            {decodedArea}{category ? `の${category}` : ""}についてよくある質問
          </h2>
          <div className="space-y-3">
            {AREA_FAQS[decodedArea].map((faq, i) => (
              <div key={i} className="bg-dark-card border border-dark-border rounded-xl overflow-hidden">
                <div className="flex items-start gap-3 px-5 py-4">
                  <span className="text-primary font-black text-lg shrink-0">Q</span>
                  <p className="text-white font-bold text-sm leading-snug">{faq.q}</p>
                </div>
                <div className="flex items-start gap-3 px-5 py-4 bg-dark border-t border-dark-border">
                  <span className="text-accent font-black text-lg shrink-0">A</span>
                  <p className="text-gray-300 text-sm leading-relaxed">{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <Link href="/faq" className="text-primary text-sm hover:underline">
              その他よくある質問を見る →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
