import { createClient } from "@/lib/supabase/server";
import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";

const ALL_AREAS = [
  "東京", "新宿", "池袋", "六本木", "錦糸町", "上野",
  "神奈川", "横浜", "川崎",
  "愛知", "栄", "錦", "大須",
  "静岡", "浜松", "静岡市", "沼津",
  "北海道", "すすきの", "札幌",
  "福岡", "中洲", "天神", "博多",
  "兵庫", "神戸", "三宮",
  "京都", "木屋町", "先斗町",
  "広島", "流川", "紙屋町",
  "宮城", "国分町", "仙台",
  "沖縄", "松山", "栄町",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();
  const { data: stores } = await supabase
    .from("stores")
    .select("slug, updated_at")
    .eq("is_published", true)
    .eq("is_approved", true);

  const storeUrls: MetadataRoute.Sitemap = (stores ?? []).map((store) => ({
    url: `${SITE_URL}/stores/${store.slug}`,
    lastModified: store.updated_at,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const areaUrls: MetadataRoute.Sitemap = ALL_AREAS.map((area) => ({
    url: `${SITE_URL}/area/${encodeURIComponent(area)}`,
    changeFrequency: "daily",
    priority: 0.7,
  }));

  return [
    { url: SITE_URL, changeFrequency: "daily", priority: 1.0 },
    { url: `${SITE_URL}/stores`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/ranking`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/blog`, changeFrequency: "daily", priority: 0.7 },
    { url: `${SITE_URL}/faq`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/terms`, changeFrequency: "yearly", priority: 0.3 },
    ...areaUrls,
    ...storeUrls,
  ];
}
