"use client";

// 管理画面 - キャスト編集ページ

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { CastMember } from "@/types/database";

export default function EditCastPage() {
  const { id } = useParams<{ id: string }>();
  const [cast, setCast] = useState<Partial<CastMember>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("cast_members").select("*").eq("id", id).single();
      if (data) {
        setCast(data);
        setPreviewUrl(data.profile_image_url ?? null);
      }
      setLoading(false);
    }
    load();
  }, [id]);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setMessage("5MB以下の画像を選択してください"); return; }

    setUploading(true);
    setMessage("");
    const ext = file.name.split(".").pop();
    const path = `casts/${id}/profile.${ext}`;

    const { error: uploadError } = await supabase.storage.from("store-images").upload(path, file, { upsert: true });
    if (uploadError) { setMessage("アップロード失敗: " + uploadError.message); setUploading(false); return; }

    const { data: { publicUrl } } = supabase.storage.from("store-images").getPublicUrl(path);
    await supabase.from("cast_members").update({ profile_image_url: publicUrl }).eq("id", id);
    setCast((c) => ({ ...c, profile_image_url: publicUrl }));
    setPreviewUrl(publicUrl);
    setMessage("画像をアップロードしました！");
    setUploading(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from("cast_members").update({
      name: cast.name,
      name_kana: cast.name_kana,
      age: cast.age,
      nationality: cast.nationality,
      description: cast.description,
      height: cast.height,
      blood_type: cast.blood_type,
      hobbies: cast.hobbies,
      sort_order: cast.sort_order,
      is_active: cast.is_active,
    }).eq("id", id);
    setSaving(false);
    setMessage(error ? "保存に失敗しました" : "保存しました！");
  }

  async function handleDelete() {
    if (!confirm(`「${cast.name}」を削除しますか？`)) return;
    setDeleting(true);
    await supabase.from("cast_members").delete().eq("id", id);
    router.push("/dashboard/cast");
  }

  if (loading) return <div className="text-gray-400">読み込み中...</div>;

  return (
    <div className="max-w-xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/dashboard/cast" className="text-gray-400 hover:text-white text-sm">← 戻る</Link>
        <h1 className="text-2xl font-black text-white">✏️ キャスト編集</h1>
      </div>

      {message && (
        <div className={`mb-5 p-4 rounded-lg text-sm font-bold ${message.includes("失敗") ? "bg-red-900/30 text-red-400" : "bg-green-900/30 text-green-400"}`}>
          {message}
        </div>
      )}

      {/* プロフィール画像 */}
      <div className="bg-dark-card border border-dark-border rounded-xl p-6 mb-5">
        <h2 className="text-accent font-bold mb-4">プロフィール画像</h2>
        <div className="flex items-center gap-6">
          <div
            className="relative w-28 h-28 rounded-full overflow-hidden bg-dark border-2 border-dashed border-dark-border cursor-pointer hover:border-primary transition-colors group shrink-0"
            onClick={() => fileInputRef.current?.click()}
          >
            {previewUrl ? (
              <>
                <Image src={previewUrl} alt={cast.name ?? ""} fill className="object-cover" unoptimized />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white text-xs font-bold">変更</span>
                </div>
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-3xl text-gray-500 group-hover:text-gray-300 transition-colors">
                👩
              </div>
            )}
            {uploading && (
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                <span className="text-white text-xs">...</span>
              </div>
            )}
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-2">クリックして画像を変更</p>
            <p className="text-gray-500 text-xs">JPG・PNG・WEBP / 5MB以下</p>
          </div>
        </div>
        <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageUpload} className="hidden" />
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        <div className="bg-dark-card border border-dark-border rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-accent font-bold">基本情報</h2>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={cast.is_active ?? true} onChange={(e) => setCast({ ...cast, is_active: e.target.checked })} className="w-4 h-4 accent-primary" />
              <span className="text-sm text-gray-300">在籍中</span>
            </label>
          </div>

          <div>
            <label className="text-gray-400 text-sm block mb-1.5">源氏名 *</label>
            <input type="text" value={cast.name ?? ""} onChange={(e) => setCast({ ...cast, name: e.target.value })} required
              className="w-full bg-dark border border-dark-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary" />
          </div>

          <div>
            <label className="text-gray-400 text-sm block mb-1.5">ふりがな</label>
            <input type="text" value={cast.name_kana ?? ""} onChange={(e) => setCast({ ...cast, name_kana: e.target.value })}
              className="w-full bg-dark border border-dark-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-gray-400 text-sm block mb-1.5">年齢</label>
              <input type="number" value={cast.age ?? ""} onChange={(e) => setCast({ ...cast, age: Number(e.target.value) || null })} min="18" max="60"
                className="w-full bg-dark border border-dark-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="text-gray-400 text-sm block mb-1.5">身長（cm）</label>
              <input type="number" value={cast.height ?? ""} onChange={(e) => setCast({ ...cast, height: Number(e.target.value) || null })}
                className="w-full bg-dark border border-dark-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-gray-400 text-sm block mb-1.5">国籍</label>
              <select value={cast.nationality ?? ""} onChange={(e) => setCast({ ...cast, nationality: e.target.value })}
                className="w-full bg-dark border border-dark-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary">
                <option value="フィリピン">フィリピン</option>
                <option value="日本">日本</option>
                <option value="その他">その他</option>
              </select>
            </div>
            <div>
              <label className="text-gray-400 text-sm block mb-1.5">血液型</label>
              <select value={cast.blood_type ?? ""} onChange={(e) => setCast({ ...cast, blood_type: e.target.value })}
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
            <input type="text" value={cast.hobbies ?? ""} onChange={(e) => setCast({ ...cast, hobbies: e.target.value })}
              className="w-full bg-dark border border-dark-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary" />
          </div>

          <div>
            <label className="text-gray-400 text-sm block mb-1.5">自己紹介文</label>
            <textarea value={cast.description ?? ""} onChange={(e) => setCast({ ...cast, description: e.target.value })} rows={4}
              className="w-full bg-dark border border-dark-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary resize-none" />
          </div>

          <div>
            <label className="text-gray-400 text-sm block mb-1.5">表示順</label>
            <input type="number" value={cast.sort_order ?? 0} onChange={(e) => setCast({ ...cast, sort_order: Number(e.target.value) })}
              className="w-full bg-dark border border-dark-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary" />
          </div>
        </div>

        <button type="submit" disabled={saving}
          className="w-full bg-primary hover:bg-primary-hover disabled:opacity-50 text-white py-3 rounded-lg font-bold transition-colors">
          {saving ? "保存中..." : "💾 保存する"}
        </button>
      </form>

      <div className="mt-6 pt-6 border-t border-dark-border">
        <button onClick={handleDelete} disabled={deleting}
          className="w-full bg-transparent border border-red-500/50 hover:bg-red-900/20 text-red-400 py-3 rounded-lg font-bold transition-colors text-sm">
          {deleting ? "削除中..." : "🗑️ このキャストを削除する"}
        </button>
      </div>
    </div>
  );
}
