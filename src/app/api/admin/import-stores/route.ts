// Google Places APIで店舗を検索してDBに自動登録するAPI

import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

// カテゴリ → 検索キーワードのマッピング
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

  // Google Places Text Search API
  const placesUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&language=ja&key=${GOOGLE_API_KEY}`;
  const placesRes = await fetch(placesUrl);
  const placesData = await placesRes.json();

  if (!placesData.results || placesData.results.length === 0) {
    return NextResponse.json({ added: 0, skipped: 0, message: "店舗が見つかりませんでした" });
  }

  // 既存店舗の名前・住所を取得して重複チェック用に使用
  const { data: existingStores } = await supabase
    .from("stores")
    .select("name, address");
  const existingNames = new Set((existingStores ?? []).map((s) => s.name?.trim().toLowerCase()));
  const existingAddresses = new Set((existingStores ?? []).map((s) => s.address?.trim()).filter(Boolean));

  let added = 0;
  let skipped = 0;
  const addedStores: string[] = [];

  for (const place of placesData.results) {
    const name: string = place.name ?? "";
    const address: string = place.formatted_address ?? "";

    // 重複チェック（名前または住所が一致したらスキップ）
    if (
      existingNames.has(name.trim().toLowerCase()) ||
      (address && existingAddresses.has(address.trim()))
    ) {
      skipped++;
      continue;
    }

    // Place Details APIで電話番号・営業時間を取得
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
    }
  }

  return NextResponse.json({
    added,
    skipped,
    addedStores,
    message: `${added}件追加、${skipped}件はすでに登録済みのためスキップしました`,
  });
}
