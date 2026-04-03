// Google Places APIで店舗を検索してDBに自動登録するAPI（最大60件）

import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

const CATEGORY_KEYWORDS: Record<string, string> = {
  フィリピンパブ: "フィリピンパブ",
  スナック: "スナック",
  ガールズバー: "ガールズバー",
  バー: "バー",
  キャバクラ: "キャバクラ",
};

function generateSlug(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 40)
    .trim();
  return (base || "store") + "-" + Date.now();
}

// Places Text Search APIを呼び出す（ページトークン対応）
async function fetchPlacesPage(query: string, pageToken?: string): Promise<{ results: any[]; nextPageToken?: string }> {
  let url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&language=ja&key=${GOOGLE_API_KEY}`;
  if (pageToken) url += `&pagetoken=${encodeURIComponent(pageToken)}`;
  const res = await fetch(url);
  const data = await res.json();
  return {
    results: data.results ?? [],
    nextPageToken: data.next_page_token,
  };
}

export async function POST(req: Request) {
  const supabase = await createClient();

  // 管理者チェック
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { area, category } = await req.json();
  if (!area || !category) return NextResponse.json({ error: "area and category are required" }, { status: 400 });

  const keyword = CATEGORY_KEYWORDS[category] ?? category;
  const query = `${area} ${keyword}`;

  // 最大3ページ（60件）取得
  const allResults: any[] = [];
  let pageToken: string | undefined = undefined;

  for (let page = 0; page < 3; page++) {
    // 2ページ目以降はGoogle側のページ生成待ちが必要（約2秒）
    if (page > 0 && pageToken) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    const { results, nextPageToken } = await fetchPlacesPage(query, pageToken);
    allResults.push(...results);

    if (!nextPageToken) break;
    pageToken = nextPageToken;
  }

  if (allResults.length === 0) {
    return NextResponse.json({ added: 0, skipped: 0, message: "店舗が見つかりませんでした" });
  }

  // 既存店舗の重複チェック用データ取得
  const { data: existingStores } = await supabase
    .from("stores")
    .select("name, address");
  const existingNames = new Set((existingStores ?? []).map((s) => s.name?.trim().toLowerCase()));
  const existingAddresses = new Set((existingStores ?? []).map((s) => s.address?.trim()).filter(Boolean));

  let added = 0;
  let skipped = 0;
  const addedStores: string[] = [];

  for (const place of allResults) {
    const name: string = place.name ?? "";
    const address: string = place.formatted_address ?? "";

    // 重複チェック
    if (
      existingNames.has(name.trim().toLowerCase()) ||
      (address && existingAddresses.has(address.trim()))
    ) {
      skipped++;
      continue;
    }

    // Place Details APIで詳細情報取得
    let phone: string | null = null;
    let openHours: string | null = null;
    let website: string | null = null;

    if (place.place_id) {
      const detailUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=formatted_phone_number,opening_hours,website&language=ja&key=${GOOGLE_API_KEY}`;
      const detailRes = await fetch(detailUrl);
      const detailData = await detailRes.json();
      const detail = detailData.result ?? {};
      phone = detail.formatted_phone_number ?? null;
      website = detail.website ?? null;
      if (detail.opening_hours?.weekday_text) {
        openHours = detail.opening_hours.weekday_text.join(" / ");
      }
    }

    const slug = generateSlug(name);

    const { error } = await supabase.from("stores").insert({
      slug,
      name,
      area,
      category,
      address: address || null,
      phone,
      open_hours: openHours,
      website_url: website,
      is_published: false,
      is_approved: false,
      owner_id: null,
    });

    if (!error) {
      added++;
      addedStores.push(name);
      existingNames.add(name.trim().toLowerCase());
      existingAddresses.add(address.trim());
    }
  }

  return NextResponse.json({
    added,
    skipped,
    total: allResults.length,
    addedStores,
    message: `${allResults.length}件中 ${added}件追加、${skipped}件はすでに登録済みのためスキップしました`,
  });
}
