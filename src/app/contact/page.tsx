"use client";

import { useState } from "react";
import Link from "next/link";
import type { Metadata } from "next";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", body: "" });
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.subject || !form.body) {
      setError("すべての項目を入力してください");
      return;
    }
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setDone(true);
    } catch {
      setError("送信に失敗しました。時間をおいて再度お試しください。");
    } finally {
      setSending(false);
    }
  }

  const inputCls = "w-full bg-dark border border-dark-border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors";

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <nav className="text-sm text-gray-400 mb-6">
        <Link href="/" className="hover:text-primary">トップ</Link>
        <span className="mx-2">›</span>
        <span className="text-white">お問い合わせ</span>
      </nav>

      <h1 className="text-2xl font-black text-white mb-2">📩 お問い合わせ</h1>
      <p className="text-gray-400 text-sm mb-8">
        店舗掲載のご依頼・ご質問・ご意見はこちらからお送りください。通常2〜3営業日以内にご返信いたします。
      </p>

      {done ? (
        <div className="bg-green-900/30 border border-green-700 rounded-2xl p-8 text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-white font-bold text-lg mb-2">送信完了しました</h2>
          <p className="text-gray-400 text-sm mb-6">お問い合わせありがとうございます。2〜3営業日以内にご返信いたします。</p>
          <Link href="/" className="inline-block bg-primary hover:bg-primary-hover text-white font-bold px-8 py-3 rounded-full transition-colors text-sm">
            トップへ戻る
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-dark-card border border-dark-border rounded-2xl p-6 space-y-5">
          <div>
            <label className="text-gray-400 text-sm block mb-1.5">お名前 <span className="text-red-400">*</span></label>
            <input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="山田 太郎" />
          </div>
          <div>
            <label className="text-gray-400 text-sm block mb-1.5">メールアドレス <span className="text-red-400">*</span></label>
            <input className={inputCls} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="example@email.com" />
          </div>
          <div>
            <label className="text-gray-400 text-sm block mb-1.5">件名 <span className="text-red-400">*</span></label>
            <input className={inputCls} value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="例：店舗掲載のご依頼" />
          </div>
          <div>
            <label className="text-gray-400 text-sm block mb-1.5">お問い合わせ内容 <span className="text-red-400">*</span></label>
            <textarea className={`${inputCls} h-36 resize-y`} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} placeholder="お問い合わせ内容をご記入ください" />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={sending}
            className="w-full bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-colors"
          >
            {sending ? "送信中..." : "送信する"}
          </button>

          <p className="text-gray-500 text-xs text-center">
            送信内容は<Link href="/privacy" className="text-primary hover:underline">プライバシーポリシー</Link>に基づき管理されます。
          </p>
        </form>
      )}
    </div>
  );
}
