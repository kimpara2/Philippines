"use client";

// 店舗情報編集ページ

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { Store } from "@/types/database";
import { ImageUploadSection } from "@/components/dashboard/ImageUploadSection";

export default function DashboardStorePage() {
  const [store, setStore] = useState<Partial<Store>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    async function loadStore() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("stores")
        .select("*")
        .eq("owner_id", user.id)
        .single();

      if (data) setStore(data);
      setLoading(false);
    }
    loadStore();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (store.id) {
      // 更新
      const { error } = await supabase
        .from("stores")
        .update({
          name: store.name,
          name_kana: store.name_kana,
          description: store.description,
          area: store.area,
          address: store.address,
          phone: store.phone,
          open_hours: store.open_hours,
          regular_holiday: store.regular_holiday,
          min_price: store.min_price,
          max_price: store.max_price,
          website_url: store.website_url,
          twitter_url: store.twitter_url,
          instagram_url: store.instagram_url,
        })
        .eq("id", store.id);

      setMessage(error ? "保存に失敗しました" : "保存しました！");
    } else {
      // 新規作成
      const slug = (store.name ?? "store")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") || `store-${Date.now()}`;

      const { data, error } = await supabase.from("stores").insert({
        name: store.name ?? "新しい店舗",
        slug,
        owner_id: user.id,
        is_published: false,
        is_approved: false,
      }).select().single();

      if (data) setStore(data);
      setMessage(error ? "作成に失敗しました" : "店舗を作成しました！");
    }

    setSaving(false);
    router.refresh();
  }

  if (loading) {
    return <div className="text-gray-400">読み込み中...</div>;
  }

  const AREAS = [
    "すすきの（札幌）", "仙台",
    "新宿", "池袋", "六本木", "錦糸町", "上野", "横浜", "川崎",
    "栄（名古屋）", "錦（名古屋）", "浜松", "静岡",
    "なんば", "心斎橋", "梅田", "北新地", "神戸", "京都",
    "広島", "松山",
    "中洲（福岡）", "天神（福岡）", "熊本", "那覇",
    "その他",
  ];

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-black text-white mb-8">🏪 店舗情報編集</h1>

      {/* 画像アップロード */}
      <div className="bg-dark-card border border-dark-border rounded-xl p-6 space-y-6 mb-6">
        <h2 className="text-accent font-bold">📷 画像設定</h2>
        {store.id ? (
          <>
            <ImageUploadSection
              storeId={store.id}
              currentUrl={store.cover_image_url ?? null}
              field="cover_image_url"
              label="カバー画像（バナー・カード）"
              recommendedSize="1200×630px"
              aspectClass="aspect-[1200/630]"
            />
            <ImageUploadSection
              storeId={store.id}
              currentUrl={store.logo_url ?? null}
              field="logo_url"
              label="ロゴ画像"
              recommendedSize="400×400px"
              aspectClass="aspect-square max-w-[200px]"
            />
          </>
        ) : (
          <div className="text-center py-8 text-gray-500 text-sm">
            <p>先に下の「基本情報」を保存すると画像をアップロードできます</p>
          </div>
        )}
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg text-sm font-bold ${message.includes("失敗") ? "bg-red-900/30 text-red-400" : "bg-green-900/30 text-green-400"}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* 基本情報 */}
        <div className="bg-dark-card border border-dark-border rounded-xl p-6 space-y-4">
          <h2 className="text-accent font-bold">基本情報</h2>

          <div>
            <label className="text-gray-400 text-sm block mb-1.5">店舗名 *</label>
            <input
              type="text"
              value={store.name ?? ""}
              onChange={(e) => setStore({ ...store, name: e.target.value })}
              required
              placeholder="例：クラブ・トロピカル"
              className="w-full bg-dark border border-dark-border rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="text-gray-400 text-sm block mb-1.5">店舗名（ふりがな）</label>
            <input
              type="text"
              value={store.name_kana ?? ""}
              onChange={(e) => setStore({ ...store, name_kana: e.target.value })}
              placeholder="例：くらぶとろぴかる"
              className="w-full bg-dark border border-dark-border rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="text-gray-400 text-sm block mb-1.5">エリア</label>
            <select
              value={store.area ?? ""}
              onChange={(e) => setStore({ ...store, area: e.target.value })}
              className="w-full bg-dark border border-dark-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary"
            >
              <option value="">選択してください</option>
              {AREAS.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-gray-400 text-sm block mb-1.5">店舗説明</label>
            <textarea
              value={store.description ?? ""}
              onChange={(e) => setStore({ ...store, description: e.target.value })}
              rows={4}
              placeholder="お店の雰囲気・特徴などを書いてください"
              className="w-full bg-dark border border-dark-border rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-primary resize-none"
            />
          </div>
        </div>

        {/* アクセス情報 */}
        <div className="bg-dark-card border border-dark-border rounded-xl p-6 space-y-4">
          <h2 className="text-accent font-bold">アクセス情報</h2>

          <div>
            <label className="text-gray-400 text-sm block mb-1.5">住所</label>
            <input
              type="text"
              value={store.address ?? ""}
              onChange={(e) => setStore({ ...store, address: e.target.value })}
              placeholder="例：東京都新宿区歌舞伎町1-1-1"
              className="w-full bg-dark border border-dark-border rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="text-gray-400 text-sm block mb-1.5">電話番号</label>
            <input
              type="tel"
              value={store.phone ?? ""}
              onChange={(e) => setStore({ ...store, phone: e.target.value })}
              placeholder="例：03-0000-0000"
              className="w-full bg-dark border border-dark-border rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="text-gray-400 text-sm block mb-1.5">営業時間</label>
            <input
              type="text"
              value={store.open_hours ?? ""}
              onChange={(e) => setStore({ ...store, open_hours: e.target.value })}
              placeholder="例：19:00〜翌3:00"
              className="w-full bg-dark border border-dark-border rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="text-gray-400 text-sm block mb-1.5">定休日</label>
            <input
              type="text"
              value={store.regular_holiday ?? ""}
              onChange={(e) => setStore({ ...store, regular_holiday: e.target.value })}
              placeholder="例：日曜日、祝日"
              className="w-full bg-dark border border-dark-border rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* 料金情報 */}
        <div className="bg-dark-card border border-dark-border rounded-xl p-6 space-y-4">
          <h2 className="text-accent font-bold">料金情報</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-gray-400 text-sm block mb-1.5">最低価格（円）</label>
              <input
                type="number"
                value={store.min_price ?? ""}
                onChange={(e) => setStore({ ...store, min_price: Number(e.target.value) || null })}
                placeholder="3000"
                className="w-full bg-dark border border-dark-border rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-gray-400 text-sm block mb-1.5">最高価格（円）</label>
              <input
                type="number"
                value={store.max_price ?? ""}
                onChange={(e) => setStore({ ...store, max_price: Number(e.target.value) || null })}
                placeholder="8000"
                className="w-full bg-dark border border-dark-border rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* SNS情報 */}
        <div className="bg-dark-card border border-dark-border rounded-xl p-6 space-y-4">
          <h2 className="text-accent font-bold">SNS・Webサイト</h2>

          <div>
            <label className="text-gray-400 text-sm block mb-1.5">公式サイトURL</label>
            <input
              type="url"
              value={store.website_url ?? ""}
              onChange={(e) => setStore({ ...store, website_url: e.target.value })}
              placeholder="https://..."
              className="w-full bg-dark border border-dark-border rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="text-gray-400 text-sm block mb-1.5">Twitter / X URL</label>
            <input
              type="url"
              value={store.twitter_url ?? ""}
              onChange={(e) => setStore({ ...store, twitter_url: e.target.value })}
              placeholder="https://twitter.com/..."
              className="w-full bg-dark border border-dark-border rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="text-gray-400 text-sm block mb-1.5">Instagram URL</label>
            <input
              type="url"
              value={store.instagram_url ?? ""}
              onChange={(e) => setStore({ ...store, instagram_url: e.target.value })}
              placeholder="https://instagram.com/..."
              className="w-full bg-dark border border-dark-border rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-primary hover:bg-primary-hover disabled:opacity-50 text-white py-3 rounded-lg font-bold transition-colors"
        >
          {saving ? "保存中..." : "💾 保存する"}
        </button>
      </form>
    </div>
  );
}
