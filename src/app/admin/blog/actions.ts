"use server";

import Anthropic from "@anthropic-ai/sdk";

type GenerateResult =
  | { ok: true; title: string; body: string; thumbnail_url: string | null }
  | { ok: false; error: string };

export type StoreInfo = {
  name: string;
  area: string | null;
  category: string | null;
  address: string | null;
  nearest_station: string | null;
  open_hours: string | null;
  regular_holiday: string | null;
  min_price: number | null;
  max_price: number | null;
  price_system: string | null;
  first_visit_budget: string | null;
  description: string | null;
  slug: string;
  website_url: string | null;
};

// Wikipedia APIからエリア情報を取得（無料・APIキー不要）
async function fetchAreaContext(area: string): Promise<string> {
  try {
    const res = await fetch(
      `https://ja.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(area)}`,
      { headers: { "User-Agent": "東海NIGHT/1.0" } }
    );
    if (!res.ok) return "";
    const data = await res.json() as { extract?: string };
    return data.extract ?? "";
  } catch {
    return "";
  }
}

// Unsplash APIからサムネイル画像を取得（UNSPLASH_ACCESS_KEYが必要）
async function fetchThumbnail(area: string | null): Promise<string | null> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) return null;
  const query = area ? `${area} nightlife bar japan` : "japan nightlife bar";
  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`,
      { headers: { Authorization: `Client-ID ${accessKey}` } }
    );
    if (!res.ok) return null;
    const data = await res.json() as { results: { urls: { regular: string } }[] };
    const results = data.results ?? [];
    if (results.length === 0) return null;
    // ランダムに1枚選ぶ（毎回違う画像になるように）
    const picked = results[Math.floor(Math.random() * results.length)];
    return picked?.urls?.regular ?? null;
  } catch {
    return null;
  }
}

export async function generateBlogDraft(
  keyword: string,
  area: string | null
): Promise<GenerateResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { ok: false, error: "ANTHROPIC_API_KEY が設定されていません。" };
  }

  const [areaWikiText, thumbnail_url] = await Promise.all([
    area ? fetchAreaContext(area) : Promise.resolve(""),
    fetchThumbnail(area),
  ]);

  const areaContext = area
    ? `対象エリアは「${area}」です。${areaWikiText ? `\n\n【${area}の情報】\n${areaWikiText.slice(0, 400)}` : ""}`
    : "全国向けの記事です。";

  // JSON形式をやめて区切り文字方式にする（文字列の途中切れを防ぐ）
  const prompt = `あなたはフィリピンパブ情報サイト「東海NIGHT」のライターです。
SEO対策された高品質なブログ記事を書いてください。

## 記事テーマ
${keyword}

## エリア情報
${areaContext}

## 執筆条件
- 文字数: 2000〜3000文字
- 読者: フィリピンパブに初めて行く20〜50代男性
- トーン: 親しみやすく実用的
- マークダウン記法を使う（## で大見出し、### で小見出し、**テキスト** で太字）
- 段落の間は空行を入れる
- 具体的な数字（料金・時間）を含める
- 構成: リード文 → ## 見出し1（概要）→ ## 見出し2（楽しみ方）→ ## 見出し3（料金・マナー）→ ## まとめ

## 出力形式（厳守）
以下の形式で出力してください。JSONは使わないこと。

TITLE: ここにタイトル（35〜45文字）
===BODY===
ここに本文（マークダウン形式）`;

  try {
    const client = new Anthropic({ apiKey });
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = message.content[0].type === "text" ? message.content[0].text.trim() : "";

    // TITLE: と ===BODY=== で分割して解析
    const titleMatch = raw.match(/TITLE:\s*(.+)/);
    const bodyMatch = raw.match(/===BODY===\s*([\s\S]+)/);

    const title = titleMatch?.[1]?.trim() ?? "";
    const body = bodyMatch?.[1]?.trim() ?? "";

    if (!title || !body) {
      return { ok: false, error: "AIの応答形式が不正でした。もう一度試してください。" };
    }

    return { ok: true, title, body, thumbnail_url };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: "生成に失敗しました: " + msg };
  }
}

// 店舗情報をもとに「行ってみた」体験談記事を生成
export async function generateStoreBlogDraft(store: StoreInfo): Promise<GenerateResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return { ok: false, error: "ANTHROPIC_API_KEY が設定されていません。" };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tokai-night.com";
  const storePageUrl = `${siteUrl}/stores/${store.slug}`;

  const priceText = store.min_price && store.max_price
    ? `${store.min_price.toLocaleString()}円〜${store.max_price.toLocaleString()}円`
    : store.min_price ? `${store.min_price.toLocaleString()}円〜` : "要確認";

  const storeContext = `
店舗名: ${store.name}
エリア: ${store.area ?? ""}
カテゴリ: ${store.category ?? ""}
住所: ${store.address ?? "不明"}
最寄り駅: ${store.nearest_station ?? "不明"}
営業時間: ${store.open_hours ?? "不明"}
定休日: ${store.regular_holiday ?? "不定休"}
料金目安: ${priceText}
料金システム: ${store.price_system ?? "不明"}
初回予算感: ${store.first_visit_budget ?? "不明"}
店舗説明: ${store.description ?? ""}
公式サイト: ${store.website_url ?? "なし"}
東海NIGHTの店舗ページURL: ${storePageUrl}
`.trim();

  const thumbnail_url = await fetchThumbnail(store.area);

  const prompt = `あなたはナイトライフ情報サイト「東海NIGHT」のライターです。
以下の店舗に実際に行ったような体験談ブログ記事を書いてください。

## 店舗情報
${storeContext}

## 執筆条件
- 文字数: 2000〜3000文字
- 読者: その店舗に行くか迷っている20〜50代男性
- トーン: 実際に行った人のリアルな体験談風、友人に話すような自然な文体
- マークダウン記法を使う（## で大見出し、### で小見出し、**テキスト** で太字）
- 段落の間は空行を入れる
- 料金・雰囲気・スタッフ・お酒・おすすめポイントを具体的に書く
- 記事の最後に必ず以下の内部リンクを入れる:
  [${store.name}の詳細・予約はこちら](${storePageUrl})
- 構成: キャッチーなリード文 → ## 店舗の雰囲気 → ## スタッフ・キャスト → ## 料金・システム → ## こんな人におすすめ → ## まとめ＋内部リンク

## 出力形式（厳守）
TITLE: ここにタイトル（35〜50文字、「行ってみた」「レポート」「体験談」などを含める）
===BODY===
ここに本文（マークダウン形式）`;

  try {
    const client = new Anthropic({ apiKey });
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = message.content[0].type === "text" ? message.content[0].text.trim() : "";
    const titleMatch = raw.match(/TITLE:\s*(.+)/);
    const bodyMatch = raw.match(/===BODY===\s*([\s\S]+)/);
    const title = titleMatch?.[1]?.trim() ?? "";
    const body = bodyMatch?.[1]?.trim() ?? "";

    if (!title || !body) {
      return { ok: false, error: "AIの応答形式が不正でした。もう一度試してください。" };
    }

    return { ok: true, title, body, thumbnail_url };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: "生成に失敗しました: " + msg };
  }
}
