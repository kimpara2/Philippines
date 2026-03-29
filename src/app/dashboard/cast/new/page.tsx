"use client";

// 管理画面 - キャスト追加ページ

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function NewCastPage() {
  const [storeId, setStoreId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    name_kana: "",
    age: "",
    nationality: "フィリピン",
    description: "",
    height: "",
    blood_type: "",
    hobbies: "",
    sort_order: "0",
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    async function loadStore() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("stores").select("id").eq("owner_id", user.id).single();
      if (data) setStoreId(data.id);
    }
    loadStore();
  }, []);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError("5MB以下の画像を選択してください"); return; }
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!storeId) return;
    setSaving(true);
    setError("");

    const { data: newCast, error: insertError } = await supabase.from("cast_members").insert({
      store_id: storeId,
      name: form.name,
      name_kana: form.name_kana || null,
      age: form.age ? Number(form.age) : null,
      nationality: form.nationality || null,
      description: form.description || null,
      height: form.height ? Number(form.height) : null,
      blood_type: form.blood_type || null,
      hobbies: form.hobbies || null,
      sort_order: Number(form.sort_order) || 0,
      is_active: true,
    }).select("id").single();

    if (insertError || !newCast) {
      setError("追加に失敗しました");
      setSaving(false);
      return;
    }

    // 画像アップロード
    if (imageFile) {
      const ext = imageFile.name.split(".").pop();
      const path = `casts/${newCast.id}/profile.${ext}`;
      const { error: uploadError } = await supabase.storage.from("store-images").upload(path, imageFile, { upsert: true });
      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage.from("store-images").getPublicUrl(path);
        await supabase.from("cast_members").update({ profile_image_url: publicUrl }).eq("id", newCast.id);
      }
    }

    router.push("/dashboard/cast");
  }

  return (
    <div className="max-w-xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/dashboard/cast" className="text-gray-400 hover:text-white text-sm">← 戻る</Link>
        <h1 className="text-2xl font-black text-white">👩 キャストを追加</h1>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3 mb-5 text-red-400 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* プロフィール画像 */}
        <div className="bg-dark-card border border-dark-border rounded-xl p-6">
          <h2 className="text-accent font-bold mb-4">プロフィール画像</h2>
          <div
            className="relative w-40 h-40 mx-auto rounded-full overflow-hidden bg-dark border-2 border-dashed border-dark-border cursor-pointer hover:border-primary transition-colors group"
            onClick={() => fileInputRef.current?.click()}
          >
            {previewUrl ? (
              <>
                <Image src={previewUrl} alt="プレビュー" fill className="object-cover" unoptimized />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white text-xs font-bold">変更</span>
                </div>
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-500 group-hover:text-gray-300 transition-colors">
                <span className="text-4xl">👩</span>
                <span className="text-xs text-center">クリックして<br />画像を選択</span>
              </div>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} className="hidden" />
          <p className="text-center text-xs text-gray-500 mt-2">JPG・PNG・WEBP / 5MB以下</p>
        </div>

        <div className="bg-dark-card border border-dark-border rounded-xl p-6 space-y-4">
          <h2 className="text-accent font-bold">基本情報</h2>

          <div>
            <label className="text-gray-400 text-sm block mb-1.5">源氏名 *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              placeholder="例：マリア"
              className="w-full bg-dark border border-dark-border rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="text-gray-400 text-sm block mb-1.5">ふりがな</label>
            <input
              type="text"
              value={form.name_kana}
              onChange={(e) => setForm({ ...form, name_kana: e.target.value })}
              placeholder="まりあ"
              className="w-full bg-dark border border-dark-border rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-gray-400 text-sm block mb-1.5">年齢</label>
              <input type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} placeholder="25" min="18" max="60"
                className="w-full bg-dark border border-dark-border rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="text-gray-400 text-sm block mb-1.5">身長（cm）</label>
              <input type="number" value={form.height} onChange={(e) => setForm({ ...form, height: e.target.value })} placeholder="160"
                className="w-full bg-dark border border-dark-border rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-primary" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-gray-400 text-sm block mb-1.5">国籍</label>
              <select value={form.nationality} onChange={(e) => setForm({ ...form, nationality: e.target.value })}
                className="w-full bg-dark border border-dark-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary">
                <option value="フィリピン">フィリピン</option>
                <option value="日本">日本</option>
                <option value="その他">その他</option>
              </select>
            </div>
            <div>
              <label className="text-gray-400 text-sm block mb-1.5">血液型</label>
              <select value={form.blood_type} onChange={(e) => setForm({ ...form, blood_type: e.target.value })}
                className="w-full bg-dark border border-dark-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary">
                <option value="">選択</option>
                <option value="A">A型</option>
                <option value="B">B型</option>
                <option value="O">O型</option>
                <option value="AB">AB型</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-gray-400 text-sm block mb-1.5">趣味</label>
            <input type="text" value={form.hobbies} onChange={(e) => setForm({ ...form, hobbies: e.target.value })} placeholder="例：カラオケ、ダンス"
              className="w-full bg-dark border border-dark-border rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-primary" />
          </div>

          <div>
            <label className="text-gray-400 text-sm block mb-1.5">自己紹介文</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4}
              placeholder="キャストの自己紹介を書いてください"
              className="w-full bg-dark border border-dark-border rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-primary resize-none" />
          </div>

          <div>
            <label className="text-gray-400 text-sm block mb-1.5">表示順（小さい数字が先）</label>
            <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
              className="w-full bg-dark border border-dark-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary" />
          </div>
        </div>

        <button type="submit" disabled={saving}
          className="w-full bg-primary hover:bg-primary-hover disabled:opacity-50 text-white py-3 rounded-lg font-bold transition-colors">
          {saving ? "追加中..." : "✨ キャストを追加する"}
        </button>
      </form>
    </div>
  );
}
