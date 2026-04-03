import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "お問い合わせ管理" };

type ContactMessage = {
  id: string;
  name: string;
  email: string;
  subject: string;
  body: string;
  is_read: boolean;
  created_at: string;
};

export default async function AdminContactsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });

  const messages = (data ?? []) as ContactMessage[];
  const unreadCount = messages.filter((m) => !m.is_read).length;

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white">📩 お問い合わせ管理</h1>
          {unreadCount > 0 && (
            <p className="text-accent text-sm mt-1">未読 {unreadCount}件</p>
          )}
        </div>
      </div>

      {messages.length === 0 ? (
        <div className="bg-dark-card border border-dark-border rounded-2xl p-12 text-center">
          <div className="text-5xl mb-4">📭</div>
          <p className="text-gray-400">お問い合わせはまだありません</p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => (
            <div key={msg.id} className={`bg-dark-card border rounded-xl p-5 ${!msg.is_read ? "border-primary/50" : "border-dark-border"}`}>
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  {!msg.is_read && (
                    <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full font-bold">NEW</span>
                  )}
                  <span className="text-white font-bold">{msg.subject}</span>
                </div>
                <span className="text-gray-500 text-xs shrink-0">
                  {new Date(msg.created_at).toLocaleString("ja-JP")}
                </span>
              </div>
              <div className="flex items-center gap-3 mb-3 text-sm">
                <span className="text-gray-400">👤 {msg.name}</span>
                <a href={`mailto:${msg.email}`} className="text-primary hover:underline">
                  ✉️ {msg.email}
                </a>
              </div>
              <p className="text-gray-300 text-sm whitespace-pre-wrap bg-dark rounded-lg p-3 border border-dark-border">
                {msg.body}
              </p>
              <div className="mt-3 flex gap-3">
                <a
                  href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject)}`}
                  className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors"
                >
                  ↩️ 返信する
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
