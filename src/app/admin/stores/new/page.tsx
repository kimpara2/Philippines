"use client";

// 管理者 - 新規店舗直接追加

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

const ALL_AREAS = [
  { pref: "愛知", areas: ["栄", "錦", "大須", "名古屋"] },
  { pref: "静岡", areas: ["浜松", "静岡市", "沼津"] },
  { pref: "岐阜", areas: ["岐阜市"] },
  { pref: "三重", areas: ["四日市"] },
];

const CATEGORIES = [
  "フィリピンパブ",
  "スナック",
  "ガールズバー",
  "バー",
  "キャバクラ",
];

function generateSlug(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 30) || "store";
  return `${base}-${Date.now()}`;
}

// 画像プレビュー付きファイル選択コンポーネント
function ImagePicker({
  label,
  hint,
  aspectClass,
  file,
  onChange,
}: {
  label: string;
  hint: string;
  aspectClass: string;
  file: File | null;
  onChange: (f: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [sizeError, setSizeError] = useState("");

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setSizeError("");
    if (!f) { setPreview(null); onChange(null); return; }
    if (f.size > 5 * 1024 * 1024) {
      setSizeError("5MB以下のファイルを選択してください");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(f);
    onChange(f);
  }

  function handleRemove() {
    setPreview(null);
    onChange(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-400 text-xs">{label}</span>
        <span className="text-gray-600 text-xs">{hint} / JPG・PNG・WEBP / 5MB以下</span>
      </div>
      <label
        className={`relative ${aspectClass} w-full bg-dark border-2 border-dashed border-dark-border rounded-xl overflow-hidden cursor-pointer hover:border-primary transition-colors group block`}
        onClick={() => inputRef.current?.click()}
      >
        {preview ? (
          <>
            <Image src={preview} alt={label} fill className="object-cover" unoptimized />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white text-sm font-bold">クリックして変更</span>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-500 group-hover:text-gray-300 transition-colors">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs">クリックして画像を選択</span>
          </div>
        )}
      </label>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFile}
        className="hidden"
      />
      <div className="flex items-center justify-between mt-1.5 min-h-[18px]">
        {sizeError && <span className="text-red-400 text-xs">{sizeError}</span>}
        {preview && (
          <button type="button" onClick={handleRemove} className="text-xs text-red-400 hover:text-red-300 ml-auto">
            選択解除
          </button>
        )}
      </div>
    </div>
  );
}

export default function AdminNewStorePage() {
  const router = useRouter();
  const supabase = createClient();
  const [saving, setSaving] = useState(false);
  const [savingMsg, setSavingMsg] = useState("");
  const [error, setError] = useState("");
  const [scrapeUrl, setScrapeUrl] = useState("");
  const [scraping, setScraping] = useState(false);
  const [scrapeMsg, setScrapeMsg] = useState("");

  // 画像ファイル
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const [form, setForm] = useState({
    name: "",
    name_kana: "",
    area: "",
    category: "フィリピンパブ",
    address: "",
    nearest_station: "",
    phone: "",
    open_hours: "",
    regular_holiday: "",
    min_price: "",
    max_price: "",
    price_system: "",
    first_visit_budget: "",
    description: "",
    website_url: "",
    twitter_url: "",
    instagram_url: "",
    tiktok_url: "",
    is_published: true,
  });

  function set(key: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleScrape() {
    if (!scrapeUrl.trim()) return;
    setScraping(true);
    setScrapeMsg("");
    try {
      const res = await fetch("/api/admin/scrape-store", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: scrapeUrl }),
      });
      const json = await res.json();
      if (!res.ok) { setScrapeMsg("❌ " + (json.error ?? "取得失敗")); return; }
      const d = json.data;
      setForm((prev) => ({
        ...prev,
        name: d.name ?? prev.name,
        name_kana: d.name_kana ?? prev.name_kana,
        area: d.area ?? prev.area,
        category: d.category ?? prev.category,
        address: d.address ?? prev.address,
        nearest_station: d.nearest_station ?? prev.nearest_station,
        phone: d.phone ?? prev.phone,
        open_hours: d.open_hours ?? prev.open_hours,
        regular_holiday: d.regular_holiday ?? prev.regular_holiday,
        min_price: d.min_price?.toString() ?? prev.min_price,
        max_price: d.max_price?.toString() ?? prev.max_price,
        price_system: d.price_system ?? prev.price_system,
        first_visit_budget: d.first_visit_budget ?? prev.first_visit_budget,
        description: d.description ?? prev.description,
        website_url: d.website_url ?? prev.website_url,
        twitter_url: d.twitter_url ?? prev.twitter_url,
        instagram_url: d.instagram_url ?? prev.instagram_url,
        tiktok_url: d.tiktok_url ?? prev.tiktok_url,
      }));
      setScrapeMsg("✅ 情報を自動入力しました。内容を確認してください。");
    } catch {
      setScrapeMsg("❌ 通信エラーが発生しました");
    } finally {
      setScraping(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setError("店舗名は必須です"); return; }
    if (!form.area) { setError("エリアを選択してください"); return; }

    setSaving(true);
    setError("");
    setSavingMsg("店舗情報を保存中...");

    const slug = generateSlug(form.name);

    // Step 1: 店舗レコードを作成
    const { data: inserted, error: insertError } = await supabase.from("stores").insert({
      slug,
      name: form.name.trim(),
      name_kana: form.name_kana.trim() || null,
      area: form.area,
      category: form.category || "フィリピンパブ",
      address: form.address.trim() || null,
      nearest_station: form.nearest_station.trim() || null,
      phone: form.phone.trim() || null,
      open_hours: form.open_hours.trim() || null,
      regular_holiday: form.regular_holiday.trim() || null,
      min_price: form.min_price ? parseInt(form.min_price) : null,
      max_price: form.max_price ? parseInt(form.max_price) : null,
      price_system: form.price_system.trim() || null,
      first_visit_budget: form.first_visit_budget.trim() || null,
      description: form.description.trim() || null,
      website_url: form.website_url.trim() || null,
      twitter_url: form.twitter_url.trim() || null,
      instagram_url: form.instagram_url.trim() || null,
      tiktok_url: form.tiktok_url.trim() || null,
      is_approved: true,
      is_published: form.is_published,
      owner_id: null,
    }).select("id").single();

    if (insertError) {
      setError(insertError.message);
      setSaving(false);
      setSavingMsg("");
      return;
    }

    const storeId = inserted.id;

    // Step 2: 画像アップロード（選択されている場合のみ）
    const imageUpdates: Record<string, string> = {};

    if (coverFile) {
      setSavingMsg("カバー画像をアップロード中...");
      const ext = coverFile.name.split(".").pop();
      const path = `${storeId}/cover_image_url.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("store-images")
        .upload(path, coverFile, { upsert: true });
      if (!upErr) {
        const { data: { publicUrl } } = supabase.storage.from("store-images").getPublicUrl(path);
        imageUpdates.cover_image_url = publicUrl;
      }
    }

    if (logoFile) {
      setSavingMsg("ロゴ画像をアップロード中...");
      const ext = logoFile.name.split(".").pop();
      const path = `${storeId}/logo_url.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("store-images")
        .upload(path, logoFile, { upsert: true });
      if (!upErr) {
        const { data: { publicUrl } } = supabase.storage.from("store-images").getPublicUrl(path);
        imageUpdates.logo_url = publicUrl;
      }
    }

    // Step 3: 画像URLをDBに保存
    if (Object.keys(imageUpdates).length > 0) {
      setSavingMsg("画像情報を保存中...");
      await supabase.from("stores").update(imageUpdates).eq("id", storeId);
    }

    setSaving(false);
    setSavingMsg("");
    router.push("/admin/stores");
  }

  const inputCls = "w-full bg-dark border border-dark-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary";
  const labelCls = "block text-gray-400 text-xs mb-1";

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/stores" className="text-gray-400 hover:text-primary text-sm">← 戻る</Link>
        <h1 className="text-2xl font-black text-white">🏪 新規店舗を追加</h1>
      </div>

      {/* URLから自動入力 */}
      <div className="bg-primary/10 border border-primary/40 rounded-xl p-4 mb-6">
        <p className="text-primary font-bold text-sm mb-3">🤖 URLから自動入力（ポケパラ・ショコラ・スナックナビなど）</p>
        <div className="flex gap-2">
          <input
            type="url"
            value={scrapeUrl}
            onChange={(e) => setScrapeUrl(e.target.value)}
            placeholder="https://www.pokepara.com/shop/..."
            className="flex-1 bg-dark border border-dark-border rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-primary text-sm"
          />
          <button
            type="button"
            onClick={handleScrape}
            disabled={scraping || !scrapeUrl.trim()}
            className="shrink-0 bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-5 py-2.5 rounded-lg text-sm transition-colors"
          >
            {scraping ? "取得中..." : "自動入力"}
          </button>
        </div>
        {scrapeMsg && (
          <p className={`mt-2 text-sm ${scrapeMsg.startsWith("✅") ? "text-green-400" : "text-red-400"}`}>
            {scrapeMsg}
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* ▼ 画像セクション */}
        <div className="bg-dark-card border border-dark-border rounded-xl p-4 space-y-4">
          <p className="text-gray-400 text-xs font-bold">🖼️ 店舗画像（任意）</p>

          {/* カバー画像 */}
          <ImagePicker
            label="カバー画像（店舗詳細ページのメイン画像）"
            hint="推奨 1200×400px 横長"
            aspectClass="aspect-[3/1]"
            file={coverFile}
            onChange={setCoverFile}
          />

          {/* ロゴ */}
          <div className="flex gap-4 items-start">
            <div className="w-40 shrink-0">
              <ImagePicker
                label="ロゴ画像"
                hint="推奨 400×400px"
                aspectClass="aspect-square"
                file={logoFile}
                onChange={setLogoFile}
              />
            </div>
            <div className="text-gray-500 text-xs pt-8 leading-relaxed">
              ロゴは店舗一覧カードの<br />左上に表示されます
            </div>
          </div>
        </div>

        {/* 店舗名 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>店舗名 <span className="text-red-400">*</span></label>
            <input className={inputCls} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="クラブ マニラ 新宿店" />
          </div>
          <div>
            <label className={labelCls}>店舗名（かな）</label>
            <input className={inputCls} value={form.name_kana} onChange={(e) => set("name_kana", e.target.value)} placeholder="くらぶ まにら しんじゅくてん" />
          </div>
        </div>

        {/* エリア・カテゴリ */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>エリア <span className="text-red-400">*</span></label>
            <select className={inputCls} value={form.area} onChange={(e) => set("area", e.target.value)}>
              <option value="">-- エリアを選択 --</option>
              {ALL_AREAS.map(({ pref, areas }) => (
                <optgroup key={pref} label={pref}>
                  <option value={pref}>{pref}（県）</option>
                  {areas.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>カテゴリ <span className="text-red-400">*</span></label>
            <select className={inputCls} value={form.category} onChange={(e) => set("category", e.target.value)}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 住所・最寄り駅 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>住所</label>
            <input className={inputCls} value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="東京都新宿区歌舞伎町1-2-3" />
          </div>
          <div>
            <label className={labelCls}>最寄り駅</label>
            <input className={inputCls} value={form.nearest_station} onChange={(e) => set("nearest_station", e.target.value)} placeholder="新宿駅 徒歩5分" />
          </div>
        </div>

        {/* 電話 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>電話番号</label>
            <input className={inputCls} value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="03-1234-5678" />
          </div>
        </div>

        {/* 営業時間・定休日 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>営業時間</label>
            <input className={inputCls} value={form.open_hours} onChange={(e) => set("open_hours", e.target.value)} placeholder="20:00〜翌4:00" />
          </div>
          <div>
            <label className={labelCls}>定休日</label>
            <input className={inputCls} value={form.regular_holiday} onChange={(e) => set("regular_holiday", e.target.value)} placeholder="不定休" />
          </div>
        </div>

        {/* 料金 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>料金（下限）¥</label>
            <input className={inputCls} type="number" value={form.min_price} onChange={(e) => set("min_price", e.target.value)} placeholder="5000" />
          </div>
          <div>
            <label className={labelCls}>料金（上限）¥</label>
            <input className={inputCls} type="number" value={form.max_price} onChange={(e) => set("max_price", e.target.value)} placeholder="15000" />
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className={labelCls}>料金システム</label>
            <textarea className={`${inputCls} h-24 resize-y`} value={form.price_system} onChange={(e) => set("price_system", e.target.value)} placeholder="例：セット料金制（90分飲み放題＋指名料込み）&#10;延長30分ごとに2,000円追加" />
          </div>
          <div>
            <label className={labelCls}>初回予算感</label>
            <textarea className={`${inputCls} h-24 resize-y`} value={form.first_visit_budget} onChange={(e) => set("first_visit_budget", e.target.value)} placeholder="例：1万円〜1.5万円&#10;（セット料金8,000円＋指名料2,000円＋チップ程度）" />
          </div>
        </div>

        {/* 説明文 */}
        <div>
          <label className={labelCls}>店舗説明</label>
          <textarea className={`${inputCls} h-28 resize-none`} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="店舗の雰囲気やおすすめポイントを入力してください" />
        </div>

        {/* SNS・URL */}
        <div className="space-y-3">
          <div>
            <label className={labelCls}>🌐 公式サイト URL</label>
            <input className={inputCls} value={form.website_url} onChange={(e) => set("website_url", e.target.value)} placeholder="https://example.com" />
          </div>
          <div>
            <label className={labelCls}>🐦 Twitter / X URL</label>
            <input className={inputCls} value={form.twitter_url} onChange={(e) => set("twitter_url", e.target.value)} placeholder="https://twitter.com/..." />
          </div>
          <div>
            <label className={labelCls}>📸 Instagram URL</label>
            <input className={inputCls} value={form.instagram_url} onChange={(e) => set("instagram_url", e.target.value)} placeholder="https://instagram.com/..." />
          </div>
          <div>
            <label className={labelCls}>🎵 TikTok URL</label>
            <input className={inputCls} value={form.tiktok_url} onChange={(e) => set("tiktok_url", e.target.value)} placeholder="https://tiktok.com/@..." />
          </div>
        </div>

        {/* 公開設定 */}
        <div className="flex items-center gap-3 bg-dark-card border border-dark-border rounded-lg px-4 py-3">
          <input
            type="checkbox"
            id="is_published"
            checked={form.is_published}
            onChange={(e) => set("is_published", e.target.checked)}
            className="w-4 h-4 accent-primary"
          />
          <label htmlFor="is_published" className="text-white text-sm cursor-pointer">
            追加と同時に公開する（チェックを外すと非公開で保存）
          </label>
        </div>

        {error && (
          <div className="text-red-400 text-sm bg-red-900/20 border border-red-500/30 rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-2 items-center">
          <button
            type="submit"
            disabled={saving}
            className="bg-primary hover:bg-primary-hover text-white font-bold px-8 py-3 rounded-lg transition-colors disabled:opacity-50"
          >
            {saving ? "保存中..." : "店舗を追加する"}
          </button>
          {savingMsg && (
            <span className="text-gray-400 text-xs animate-pulse">{savingMsg}</span>
          )}
          {!saving && (
            <Link href="/admin/stores" className="px-6 py-3 rounded-lg border border-dark-border text-gray-400 hover:text-white text-sm transition-colors">
              キャンセル
            </Link>
          )}
        </div>
      </form>
    </div>
  );
}
