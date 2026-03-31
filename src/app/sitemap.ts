import { createClient } from "@/lib/supabase/server";
import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";

const ALL_AREAS = [
  "愛知", "栄", "錦", "大須", "名古屋",
  "静岡", "浜松", "静岡市", "沼津",
  "岐阜", "岐阜市",
  "三重", "四日市",
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
