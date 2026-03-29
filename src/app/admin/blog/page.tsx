"use client";

// 管理者 - サイト全体ニュース・コラム管理

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { generateBlogDraft } from "./actions";
import { MarkdownEditor } from "@/components/admin/MarkdownEditor";

type SiteNews = {
  id: string;
  title: string;
  body: string;
  category: "news" | "column" | "event";
  thumbnail_url: string | null;
  area: string | null;
  is_published: boolean;
  created_at: string;
};

const CATEGORY_LABELS: Record<string, string> = {
  news: "📰 ニュース",
  column: "✍️ コラム",
  event: "🎉 イベント",
};

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

const EMPTY_FORM = { title: "", body: "", category: "news" as const, thumbnail_url: null as string | null, area: null as string | null };

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<SiteNews[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<SiteNews | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState("");
  const [aiKeyword, setAiKeyword] = useState("");
  const [aiArea, setAiArea] = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiError, setAiError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  async function handleAiGenerate() {
    if (!aiKeyword.trim()) { setAiError("キーワードを入力してください"); return; }
    setAiGenerating(true);
    setAiError("");
    const result = await generateBlogDraft(aiKeyword.trim(), aiArea || null);
    setAiGenerating(false);
    if (!result.ok) { setAiError(result.error); return; }
    setEditing(null);
    setForm({ title: result.title, body: result.body, category: "column" as "news" | "column" | "event", thumbnail_url: result.thumbnail_url ?? null, area: aiArea || null });
    setUploadMsg("");
    setShowForm(true);
  }

  useEffect(() => { load(); }, []);

  async function load() {
    const { data } = await supabase
      .from("site_news")
      .select("*")
      .order("created_at", { ascending: false });
    setPosts(data ?? []);
  }

  function openNew() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setUploadMsg("");
    setShowForm(true);
  }

  function openEdit(post: SiteNews) {
    setEditing(post);
    setForm({ title: post.title, body: post.body, category: post.category, thumbnail_url: post.thumbnail_url, area: post.area ?? null });
    setUploadMsg("");
    setShowForm(true);
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setUploadMsg("5MB以下の画像を選択してください"); return; }

    setUploading(true);
    setUploadMsg("");
    const ext = file.name.split(".").pop();
    const filePath = `blog/${Date.now()}.${ext}`;

    const { error } = await supabase.storage.from("store-images").upload(filePath, file, { upsert: true });
    if (error) { setUploadMsg("アップロード失敗: " + error.message); setUploading(false); return; }

    const { data: { publicUrl } } = supabase.storage.from("store-images").getPublicUrl(filePath);
    setForm((f) => ({ ...f, thumbnail_url: publicUrl }));
    setUploadMsg("アップロード完了！");
    setUploading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    if (editing) {
      await supabase.from("site_news").update({
        title: form.title,
        body: form.body,
        category: form.category,
        thumbnail_url: form.thumbnail_url,
        area: form.area || null,
        updated_at: new Date().toISOString(),
      }).eq("id", editing.id);
    } else {
      await supabase.from("site_news").insert({
        title: form.title,
        body: form.body,
        category: form.category,
        thumbnail_url: form.thumbnail_url,
        area: form.area || null,
        is_published: false,
      });
    }

    setSaving(false);
    setShowForm(false);
    load();
  }

  async function togglePublish(post: SiteNews) {
    await supabase.from("site_news").update({ is_published: !post.is_published }).eq("id", post.id);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("この記事を削除しますか？")) return;
    await supabase.from("site_news").delete().eq("id", id);
    load();
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-white">📝 サイトニュース管理</h1>
        <button onClick={openNew}
          className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-full font-bold transition-colors text-sm">
          ＋ 新規投稿
        </button>
      </div>

      {/* AI下書き生成パネル */}
      <div className="bg-gradient-to-br from-purple-950/50 to-slate-900/80 border border-purple-500/30 rounded-xl p-5 mb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">🤖</span>
          <h2 className="text-white font-bold text-sm">AI下書き生成</h2>
          <span className="text-xs text-purple-400 bg-purple-900/40 px-2 py-0.5 rounded-full border border-purple-500/30">Claude AI</span>
        </div>
        <p className="text-gray-400 text-xs mb-4">記事テーマを入力するとAIがSEO対策済みの下書きを生成します。内容を確認・編集してから公開してください。</p>
        <div className="flex gap-3 flex-wrap">
          <input
            type="text"
            value={aiKeyword}
            onChange={(e) => setAiKeyword(e.target.value)}
            placeholder="例：新宿フィリピンパブの楽しみ方、初めてのフィリピンパブガイド"
            className="flex-1 min-w-0 bg-dark border border-dark-border rounded-lg px-4 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-purple-500"
            onKeyDown={(e) => { if (e.key === "Enter") handleAiGenerate(); }}
          />
          <select
            value={aiArea}
            onChange={(e) => setAiArea(e.target.value)}
            className="bg-dark border border-dark-border rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500 shrink-0"
          >
            <option value="">全国向け</option>
            {ALL_AREAS.map(({ pref, areas }) => (
              <optgroup key={pref} label={pref}>
                <option value={pref}>{pref}</option>
                {areas.map((a) => <option key={a} value={a}>{a}</option>)}
              </optgroup>
            ))}
          </select>
          <button
            onClick={handleAiGenerate}
            disabled={aiGenerating}
            className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold px-5 py-2.5 rounded-lg text-sm transition-colors whitespace-nowrap flex items-center gap-2"
          >
            {aiGenerating ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                生成中...
              </>
            ) : "✨ 下書きを生成"}
          </button>
        </div>
        {aiError && (
          <p className="text-red-400 text-xs mt-3">{aiError}</p>
        )}
      </div>

      {/* フォーム */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-dark-card border border-dark-border rounded-xl p-6 mb-8 space-y-4">
          <h2 className="text-accent font-bold">{editing ? "記事を編集" : "新規記事"}</h2>

          {/* カテゴリ */}
          <div className="flex gap-3">
            {(["news", "column", "event"] as const).map((cat) => (
              <button key={cat} type="button"
                onClick={() => setForm({ ...form, category: cat })}
                className={`px-4 py-1.5 rounded-full text-sm font-bold transition-colors border ${form.category === cat ? "bg-primary text-white border-transparent" : "border-dark-border text-gray-400 hover:border-primary"}`}>
                {CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>

          {/* タイトル */}
          <div>
            <label className="text-gray-400 text-sm block mb-1.5">タイトル *</label>
            <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required
              placeholder="例：全国フィリピンパブ情報まとめ2025"
              className="w-full bg-dark border border-dark-border rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-primary" />
          </div>

          {/* サムネイル画像 */}
          <div>
            <label className="text-gray-400 text-sm block mb-1.5">サムネイル画像（任意）</label>
            <div
              className="relative w-full aspect-[16/7] bg-dark border-2 border-dashed border-dark-border rounded-xl overflow-hidden cursor-pointer hover:border-primary transition-colors group"
              onClick={() => fileInputRef.current?.click()}
            >
              {form.thumbnail_url ? (
                <>
                  <Image src={form.thumbnail_url} alt="サムネイル" fill className="object-cover" unoptimized />
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
                  <span className="text-sm">クリックして画像を選択</span>
                  <span className="text-xs">推奨：1200×525px / JPG・PNG・WEBP / 5MB以下</span>
                </div>
              )}
              {uploading && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                  <span className="text-white text-sm">アップロード中...</span>
                </div>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageUpload} className="hidden" />
            <div className="flex items-center justify-between mt-1.5">
              {uploadMsg && (
                <span className={`text-xs font-bold ${uploadMsg.includes("失敗") ? "text-red-400" : "text-green-400"}`}>
                  {uploadMsg}
                </span>
              )}
              {form.thumbnail_url && (
                <button type="button" onClick={() => setForm({ ...form, thumbnail_url: null })}
                  className="text-xs text-red-400 hover:text-red-300 ml-auto">
                  画像を削除
                </button>
              )}
            </div>
          </div>

          {/* 対象エリア */}
          <div>
            <label className="text-gray-400 text-sm block mb-1.5">対象エリア（任意）</label>
            <select
              value={form.area ?? ""}
              onChange={(e) => setForm({ ...form, area: e.target.value || null })}
              className="w-full bg-dark border border-dark-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary"
            >
              <option value="">全国向け（エリア指定なし）</option>
              {ALL_AREAS.map(({ pref, areas }) => (
                <optgroup key={pref} label={pref}>
                  <option value={pref}>{pref}（都道府県全体）</option>
                  {areas.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </optgroup>
              ))}
            </select>
            <p className="text-gray-500 text-xs mt-1">エリアを指定すると、そのエリアページにもこの記事が表示されます</p>
          </div>

          {/* 本文 */}
          <div>
            <label className="text-gray-400 text-sm block mb-1.5">本文 *</label>
            <MarkdownEditor
              value={form.body}
              onChange={(v) => setForm({ ...form, body: v })}
              placeholder={"## 見出しを入力\n\n本文を書いてください。\n\n### 小見出し\n\n段落ごとに空行を入れると読みやすくなります。"}
              rows={18}
            />
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={saving}
              className="bg-primary hover:bg-primary-hover disabled:opacity-50 text-white px-6 py-2.5 rounded-lg font-bold transition-colors text-sm">
              {saving ? "保存中..." : "💾 保存する"}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="text-gray-400 hover:text-white px-6 py-2.5 rounded-lg text-sm">
              キャンセル
            </button>
          </div>
        </form>
      )}

      {/* 記事一覧 */}
      {posts.length > 0 ? (
        <div className="space-y-3">
          {posts.map((post) => (
            <div key={post.id} className="bg-dark-card border border-dark-border rounded-xl overflow-hidden">
              <div className="flex items-start gap-4 p-4">
                {/* サムネイル */}
                {post.thumbnail_url && (
                  <div className="relative w-20 h-14 rounded-lg overflow-hidden shrink-0 bg-dark">
                    <Image src={post.thumbnail_url} alt={post.title} fill className="object-cover" unoptimized />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs text-gray-400">{CATEGORY_LABELS[post.category]}</span>
                    {post.area && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-primary/20 text-primary border border-primary/30">
                        📍 {post.area}
                      </span>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${post.is_published ? "bg-green-900/50 text-green-400" : "bg-gray-700 text-gray-400"}`}>
                      {post.is_published ? "公開中" : "下書き"}
                    </span>
                  </div>
                  <div className="text-white font-bold text-sm">{post.title}</div>
                  <div className="text-gray-500 text-xs mt-1">
                    {new Date(post.created_at).toLocaleDateString("ja-JP")}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => togglePublish(post)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-bold border transition-colors ${post.is_published ? "border-red-500/50 text-red-400 hover:bg-red-900/20" : "border-green-500/50 text-green-400 hover:bg-green-900/20"}`}>
                    {post.is_published ? "非公開に" : "公開する"}
                  </button>
                  <button onClick={() => openEdit(post)}
                    className="text-xs px-3 py-1.5 rounded-lg border border-dark-border text-gray-300 hover:border-primary hover:text-primary transition-colors">
                    編集
                  </button>
                  <button onClick={() => handleDelete(post.id)}
                    className="text-xs px-3 py-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-900/20 transition-colors">
                    削除
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-dark-card border border-dark-border rounded-2xl">
          <div className="text-5xl mb-4">📝</div>
          <p className="text-gray-400">記事がまだありません</p>
        </div>
      )}
    </div>
  );
}
