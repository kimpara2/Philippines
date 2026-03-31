"use server";

import Anthropic from "@anthropic-ai/sdk";

type GenerateResult =
  | { ok: true; title: string; body: string; thumbnail_url: string | null }
  | { ok: false; error: string };

// Wikipedia APIからエリア情報を取得（無料・APIキー不要）
async function fetchAreaContext(area: string): Promise<string> {
  try {
    const res = await fetch(
      `https://ja.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(area)}`,
      { headers: { "User-Agent": "夜トカイ/1.0" } }
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
  const prompt = `あなたはフィリピンパブ情報サイト「夜トカイ」のライターです。
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
