// URLから店舗情報をAIで抽出するAPI

import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: Request) {
  const supabase = await createClient();

  // 管理者チェック
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { url } = await req.json();
  if (!url) return NextResponse.json({ error: "URLが必要です" }, { status: 400 });

  // ページHTMLを取得
  let html = "";
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "ja,en;q=0.9",
      },
      signal: AbortSignal.timeout(10000),
    });
    html = await res.text();
  } catch {
    return NextResponse.json({ error: "ページの取得に失敗しました。URLを確認してください。" }, { status: 400 });
  }

  // HTMLからテキストのみ抽出（タグを除去、上限8000文字）
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 8000);

  // Claudeで店舗情報を抽出
  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `以下のウェブページのテキストから夜の店舗情報を抽出してください。
情報が見つからない場合はnullにしてください。
必ずJSONのみを返してください（マークダウンなし）。

抽出するフィールド:
- name: 店舗名
- name_kana: 店舗名のふりがな
- area: エリア（栄/錦/大須/名古屋/浜松/静岡市/沼津/岐阜市/四日市 のどれか）
- category: カテゴリ（フィリピンパブ/スナック/ガールズバー/バー/キャバクラ のどれか）
- address: 住所
- nearest_station: 最寄り駅（例：浜松駅 徒歩5分）
- phone: 電話番号
- open_hours: 営業時間
- regular_holiday: 定休日
- min_price: 料金下限（数値のみ、円）
- max_price: 料金上限（数値のみ、円）
- price_system: 料金システムの説明（文章）
- first_visit_budget: 初回予算感（文章）
- description: 店舗説明文
- website_url: 公式サイトURL
- twitter_url: TwitterまたはXのURL
- instagram_url: InstagramのURL

ページテキスト:
${text}`,
      },
    ],
  });

  const raw = message.content[0].type === "text" ? message.content[0].text : "";
  const cleaned = raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  try {
    const data = JSON.parse(cleaned);
    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json({ error: "情報の抽出に失敗しました", raw }, { status: 500 });
  }
}
