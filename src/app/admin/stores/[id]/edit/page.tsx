"use client";

// 管理者 - 店舗編集（情報 + 画像アップロード）

import { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

const ALL_AREAS = [
  { pref: "東京", areas: ["新宿", "池袋", "六本木", "錦糸町", "上野"] },
  { pref: "大阪", areas: ["なんば", "心斎橋", "梅田", "北新地"] },
  { pref: "神奈川", areas: ["横浜", "川崎"] },
  { pref: "愛知", areas: ["栄", "錦", "大須"] },
  { pref: "静岡", areas: ["浜松", "静岡市", "沼津"] },
  { pref: "北海道", areas: ["すすきの", "札幌"] },
  { pref: "福岡", areas: ["中洲", "天神", "博多"] },
  { pref: "兵庫", areas: ["神戸", "三宮"] },
  { pref: "京都", areas: ["木屋町", "先斗町"] },
  { pref: "広島", areas: ["流川", "紙屋町"] },
  { pref: "宮城", areas: ["国分町", "仙台"] },
  { pref: "沖縄", areas: ["松山", "栄町"] },
];

type StoreData = {
  id: string;
  name: string;
  name_kana: string | null;
  area: string;
  address: string | null;
  phone: string | null;
  open_hours: string | null;
  regular_holiday: string | null;
  min_price: number | null;
  max_price: number | null;
  description: string | null;
  website_url: string | null;
  twitter_url: string | null;
  instagram_url: string | null;
  cover_image_url: string | null;
  logo_url: string | null;
  is_published: boolean;
};

// 画像アップロードコンポーネント（storeIdがある場合のみ使用）
function ImageUploader({
  storeId,
  field,
  label,
  currentUrl,
  recommendedSize,
  aspectClass,
  onUploaded,
}: {
  storeId: string;
  field: "cover_image_url" | "logo_url";
  label: string;
  currentUrl: string | null;
  recommendedSize: string;
  aspectClass: string;
  onUploaded: (url: string | null) => void;
}) {
  const supabase = createClient();
  const [preview, setPreview] = useState<string | null>(currentUrl);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setMessage("5MB以下のファイルを選択してください");
      return;
    }

    // プレビュー
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    setUploading(true);
    setMessage("");

    const ext = file.name.split(".").pop();
    const filePath = `${storeId}/${field}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("store-images")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      setMessage("アップロード失敗：" + uploadError.message);
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from("store-images")
      .getPublicUrl(filePath);

    const { error: updateError } = await supabase
      .from("stores")
      .update({ [field]: publicUrl })
      .eq("id", storeId);

    if (updateError) {
      setMessage("DB更新失敗：" + updateError.message);
    } else {
      setMessage("アップロード完了！");
      onUploaded(publicUrl);
    }
    setUploading(false);
  }

  async function handleDelete() {
    if (!confirm("画像を削除しますか？")) return;
    setUploading(true);
    await supabase.from("stores").update({ [field]: null }).eq("id", storeId);
    setPreview(null);
    onUploaded(null);
    setMessage("削除しました");
    setUploading(false);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-gray-300 text-sm font-medium">{label}</label>
        <span className="text-gray-600 text-xs">推奨：{recommendedSize} / JPG・PNG・WEBP / 5MB以下</span>
      </div>

      <label className={`relative ${aspectClass} w-full bg-dark border-2 border-dashed border-dark-border rounded-xl overflow-hidden cursor-pointer hover:border-primary transition-colors group block`}>
        {preview ? (
          <>
            <Image src={preview} alt={label} fill className="object-cover" unoptimized />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white text-sm font-bold">クリックして変更</span>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-500 group-hover:text-gray-300 transition-colors">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm">クリックして画像を選択</span>
            <span className="text-xs text-gray-600">{recommendedSize}</span>
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-10">
            <div className="text-white text-sm">アップロード中...</div>
          </div>
        )}
        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFile} className="hidden" />
      </label>

      <div className="flex items-center justify-between mt-2 min-h-[20px]">
        {message && (
          <span className={`text-xs font-bold ${message.includes("失敗") ? "text-red-400" : "text-green-400"}`}>
            {message}
          </span>
        )}
        {preview && !uploading && (
          <button type="button" onClick={handleDelete} className="text-xs text-red-400 hover:text-red-300 ml-auto">
            画像を削除
          </button>
        )}
      </div>
    </div>
  );
}

export default function AdminStoreEditPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();
  const storeId = params.id as string;
  const isNew = searchParams.get("new") === "1";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [store, setStore] = useState<StoreData | null>(null);

  const [form, setForm] = useState({
    name: "",
    name_kana: "",
    area: "",
    address: "",
    phone: "",
    open_hours: "",
    regular_holiday: "",
    min_price: "",
    max_price: "",
    description: "",
    website_url: "",
    twitter_url: "",
    instagram_url: "",
    is_published: true,
  });

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("stores")
        .select("*")
        .eq("id", storeId)
        .single();

      if (error || !data) {
        setError("店舗が見つかりません");
        setLoading(false);
        return;
      }

      const s = data as StoreData;
      setStore(s);
      setForm({
        name: s.name ?? "",
        name_kana: s.name_kana ?? "",
        area: s.area ?? "",
        address: s.address ?? "",
        phone: s.phone ?? "",
        open_hours: s.open_hours ?? "",
        regular_holiday: s.regular_holiday ?? "",
        min_price: s.min_price?.toString() ?? "",
        max_price: s.max_price?.toString() ?? "",
        description: s.description ?? "",
        website_url: s.website_url ?? "",
        twitter_url: s.twitter_url ?? "",
        instagram_url: s.instagram_url ?? "",
        is_published: s.is_published ?? true,
      });
      setLoading(false);
    }
    load();
  }, [storeId]); // eslint-disable-line react-hooks/exhaustive-deps

  function set(key: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setError("店舗名は必須です"); return; }
    if (!form.area) { setError("エリアを選択してください"); return; }

    setSaving(true);
    setError("");
    setSuccess("");

    const { error: updateError } = await supabase.from("stores").update({
      name: form.name.trim(),
      name_kana: form.name_kana.trim() || null,
      area: form.area,
      address: form.address.trim() || null,
      phone: form.phone.trim() || null,
      open_hours: form.open_hours.trim() || null,
      regular_holiday: form.regular_holiday.trim() || null,
      min_price: form.min_price ? parseInt(form.min_price) : null,
      max_price: form.max_price ? parseInt(form.max_price) : null,
      description: form.description.trim() || null,
      website_url: form.website_url.trim() || null,
      twitter_url: form.twitter_url.trim() || null,
      instagram_url: form.instagram_url.trim() || null,
      is_published: form.is_published,
    }).eq("id", storeId);

    setSaving(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setSuccess("保存しました！");
    setTimeout(() => setSuccess(""), 3000);
  }

  const inputCls = "w-full bg-dark border border-dark-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary";
  const labelCls = "block text-gray-400 text-xs mb-1";

  if (loading) {
    return <div className="text-gray-400 text-sm">読み込み中...</div>;
  }

  if (!store) {
    return <div className="text-red-400 text-sm">{error || "店舗が見つかりません"}</div>;
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/stores" className="text-gray-400 hover:text-primary text-sm">← 店舗一覧</Link>
        <h1 className="text-2xl font-black text-white">🏪 店舗を編集</h1>
      </div>

      {/* 新規追加後の案内 */}
      {isNew && (
        <div className="bg-green-900/30 border border-green-500/40 rounded-xl px-5 py-4 mb-6">
          <p className="text-green-400 font-bold text-sm">✅ 店舗を追加しました！</p>
          <p className="text-green-300 text-xs mt-1">続けて画像をアップロードしてください。後でもアップロードできます。</p>
        </div>
      )}

      {/* 画像アップロードセクション */}
      <div className="bg-dark-card border border-dark-border rounded-xl p-5 mb-6 space-y-5">
        <h2 className="text-white font-bold text-sm flex items-center gap-2">
          🖼️ 店舗画像
        </h2>

        {/* カバー画像 */}
        <ImageUploader
          storeId={storeId}
          field="cover_image_url"
          label="カバー画像（店舗詳細ページのメイン画像）"
          currentUrl={store.cover_image_url}
          recommendedSize="1200×400px 横長"
          aspectClass="aspect-[3/1]"
          onUploaded={(url) => setStore((prev) => prev ? { ...prev, cover_image_url: url } : prev)}
        />

        {/* ロゴ */}
        <ImageUploader
          storeId={storeId}
          field="logo_url"
          label="ロゴ画像（店舗カードに表示）"
          currentUrl={store.logo_url}
          recommendedSize="400×400px 正方形"
          aspectClass="aspect-square max-w-[200px]"
          onUploaded={(url) => setStore((prev) => prev ? { ...prev, logo_url: url } : prev)}
        />
      </div>

      {/* 店舗情報編集フォーム */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <h2 className="text-white font-bold text-sm flex items-center gap-2">📝 店舗情報</h2>

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

        {/* エリア */}
        <div>
          <label className={labelCls}>エリア <span className="text-red-400">*</span></label>
          <select className={inputCls} value={form.area} onChange={(e) => set("area", e.target.value)}>
            <option value="">-- エリアを選択 --</option>
            {ALL_AREAS.map(({ pref, areas }) => (
              <optgroup key={pref} label={pref}>
                <option value={pref}>{pref}（都道府県）</option>
                {areas.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* 住所・電話 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>住所</label>
            <input className={inputCls} value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="東京都新宿区歌舞伎町1-2-3" />
          </div>
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
            公開する（チェックを外すと非公開）
          </label>
        </div>

        {error && (
          <div className="text-red-400 text-sm bg-red-900/20 border border-red-500/30 rounded-lg px-4 py-3">
            {error}
          </div>
        )}
        {success && (
          <div className="text-green-400 text-sm bg-green-900/20 border border-green-500/30 rounded-lg px-4 py-3">
            ✅ {success}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-primary hover:bg-primary-hover text-white font-bold px-8 py-3 rounded-lg transition-colors disabled:opacity-50"
          >
            {saving ? "保存中..." : "変更を保存する"}
          </button>
          <Link href="/admin/stores" className="px-6 py-3 rounded-lg border border-dark-border text-gray-400 hover:text-white text-sm transition-colors flex items-center">
            店舗一覧へ
          </Link>
        </div>
      </form>
    </div>
  );
}
