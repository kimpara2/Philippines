"use client";

// 管理画面 - お知らせ・イベント投稿

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { NewsPost } from "@/types/database";

export default function DashboardNewsPage() {
  const [storeId, setStoreId] = useState<string | null>(null);
  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", body: "", event_date: "" });
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: store } = await supabase.from("stores").select("id").eq("owner_id", user.id).single();
      if (!store) return;
      setStoreId(store.id);
      const { data } = await supabase.from("news_posts").select("*").eq("store_id", store.id).order("created_at", { ascending: false });
      setPosts(data ?? []);
    }
    load();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!storeId) return;
    setSaving(true);

    const { data } = await supabase.from("news_posts").insert({
      store_id: storeId,
      title: form.title,
      body: form.body,
      event_date: form.event_date || null,
      is_published: true,
    }).select().single();

    if (data) {
      setPosts([data, ...posts]);
      setForm({ title: "", body: "", event_date: "" });
      setShowForm(false);
    }
    setSaving(false);
  }

  async function deletePost(id: string) {
    if (!confirm("このお知らせを削除しますか？")) return;
    await supabase.from("news_posts").delete().eq("id", id);
    setPosts(posts.filter(p => p.id !== id));
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-black text-white">📢 お知らせ管理</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-full font-bold transition-colors text-sm"
        >
          ＋ 投稿する
        </button>
      </div>

      {/* 投稿フォーム */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-dark-card border border-dark-border rounded-xl p-6 mb-8 space-y-4">
          <h2 className="text-accent font-bold">新しいお知らせ</h2>

          <div>
            <label className="text-gray-400 text-sm block mb-1.5">タイトル *</label>
            <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required
              placeholder="例：今週末はハロウィンイベント開催！"
              className="w-full bg-dark border border-dark-border rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-primary" />
          </div>

          <div>
            <label className="text-gray-400 text-sm block mb-1.5">内容 *</label>
            <textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} required rows={5}
              placeholder="お知らせの内容を書いてください"
              className="w-full bg-dark border border-dark-border rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-primary resize-none" />
          </div>

          <div>
            <label className="text-gray-400 text-sm block mb-1.5">イベント日（任意）</label>
            <input type="date" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })}
              className="bg-dark border border-dark-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary" />
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={saving}
              className="bg-primary hover:bg-primary-hover disabled:opacity-50 text-white px-6 py-2.5 rounded-lg font-bold transition-colors text-sm">
              {saving ? "投稿中..." : "📢 投稿する"}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="text-gray-400 hover:text-white px-6 py-2.5 rounded-lg text-sm transition-colors">
              キャンセル
            </button>
          </div>
        </form>
      )}

      {/* お知らせ一覧 */}
      {posts.length > 0 ? (
        <div className="space-y-3">
          {posts.map((post) => (
            <div key={post.id} className="bg-dark-card border border-dark-border rounded-xl p-5">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-white font-bold">{post.title}</h3>
                <button onClick={() => deletePost(post.id)}
                  className="text-red-400 hover:text-red-300 text-xs ml-3 shrink-0 transition-colors">
                  削除
                </button>
              </div>
              {post.event_date && (
                <div className="text-accent text-xs mb-2 font-bold">
                  📅 {new Date(post.event_date).toLocaleDateString("ja-JP")}
                </div>
              )}
              <p className="text-gray-300 text-sm whitespace-pre-line">{post.body}</p>
              <div className="text-gray-500 text-xs mt-3">
                投稿日: {new Date(post.created_at).toLocaleDateString("ja-JP")}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-dark-card border border-dark-border rounded-2xl">
          <div className="text-5xl mb-4">📢</div>
          <p className="text-gray-400">お知らせがまだありません</p>
        </div>
      )}
    </div>
  );
}
