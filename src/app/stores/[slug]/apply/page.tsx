"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function ApplyPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", age: "", phone: "", email: "", message: "" });
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setError("");
    const res = await fetch(`/api/stores/${slug}/apply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSending(false);
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      setError(json.error ?? "送信に失敗しました。もう一度お試しください。");
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-6">🎉</div>
        <h1 className="text-2xl font-black text-white mb-3">応募を受け付けました！</h1>
        <p className="text-gray-400 mb-8">
          ご応募ありがとうございます。<br />
          お店からご連絡をお待ちください。
        </p>
        <Link href={`/stores/${slug}`} className="bg-primary hover:bg-primary-hover text-white font-bold px-6 py-3 rounded-full transition-colors">
          店舗ページに戻る
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <nav className="text-sm text-gray-400 mb-6">
        <Link href="/" className="hover:text-primary">トップ</Link>
        <span className="mx-2">›</span>
        <Link href={`/stores/${slug}`} className="hover:text-primary">店舗詳細</Link>
        <span className="mx-2">›</span>
        <span className="text-white">採用応募</span>
      </nav>

      <h1 className="text-2xl font-black text-white mb-2">💼 採用に応募する</h1>
      <p className="text-gray-400 text-sm mb-8">必要事項を入力してお送りください。お店から直接ご連絡いたします。</p>

      {error && (
        <div className="mb-6 p-4 bg-red-900/30 border border-red-700 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="text-gray-400 text-sm block mb-1.5">お名前 <span className="text-red-400">*</span></label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="山田 花子"
            className="w-full bg-dark-card border border-dark-border rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-primary"
          />
        </div>

        <div>
          <label className="text-gray-400 text-sm block mb-1.5">年齢</label>
          <input
            type="text"
            value={form.age}
            onChange={(e) => setForm({ ...form, age: e.target.value })}
            placeholder="例：25歳"
            className="w-full bg-dark-card border border-dark-border rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-primary"
          />
        </div>

        <div>
          <label className="text-gray-400 text-sm block mb-1.5">電話番号 <span className="text-red-400">*</span></label>
          <input
            type="tel"
            required
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="090-0000-0000"
            className="w-full bg-dark-card border border-dark-border rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-primary"
          />
        </div>

        <div>
          <label className="text-gray-400 text-sm block mb-1.5">メールアドレス</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="example@email.com"
            className="w-full bg-dark-card border border-dark-border rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-primary"
          />
        </div>

        <div>
          <label className="text-gray-400 text-sm block mb-1.5">メッセージ・質問など</label>
          <textarea
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            rows={4}
            placeholder="勤務希望日・経験・質問など自由にどうぞ"
            className="w-full bg-dark-card border border-dark-border rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-primary resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={sending}
          className="w-full bg-primary hover:bg-primary-hover disabled:opacity-50 text-white font-black py-3.5 rounded-xl text-lg transition-colors"
        >
          {sending ? "送信中..." : "📩 応募する"}
        </button>
      </form>

      <p className="text-gray-500 text-xs mt-6 text-center">
        送信した情報は当店舗の採用担当のみ確認できます。
      </p>
    </div>
  );
}
