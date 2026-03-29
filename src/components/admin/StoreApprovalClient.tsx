"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getRecentMonthsPv } from "@/lib/fakePv";

type StoreInfo = {
  id: string;
  slug: string;
  name: string;
  area: string | null;
  address: string | null;
  phone: string | null;
  open_hours: string | null;
  description: string | null;
  is_published: boolean;
  is_approved: boolean;
  created_at: string;
  owner_id: string | null;
  owner_email: string | null;
};

export function StoreApprovalClient({ store }: { store: StoreInfo }) {
  const [isApproved, setIsApproved] = useState(store.is_approved);
  const [isPublished, setIsPublished] = useState(store.is_published);
  const [expanded, setExpanded] = useState(!store.is_approved);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  async function toggleApproval() {
    setSaving(true);
    await supabase.from("stores").update({
      is_approved: !isApproved,
      approved_at: !isApproved ? new Date().toISOString() : null,
    }).eq("id", store.id);
    setIsApproved(!isApproved);
    setSaving(false);
    router.refresh();
  }

  async function togglePublished() {
    setSaving(true);
    await supabase.from("stores").update({ is_published: !isPublished }).eq("id", store.id);
    setIsPublished(!isPublished);
    setSaving(false);
    router.refresh();
  }

  return (
    <div className="bg-dark-card border border-dark-border rounded-xl overflow-hidden">
      {/* ヘッダー行 */}
      <div className="p-4 flex items-center gap-4">
        <button onClick={() => setExpanded(!expanded)} className="flex-1 min-w-0 text-left">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-white font-bold">{store.name}</span>
            {store.area && <span className="text-gray-400 text-sm">📍 {store.area}</span>}
          </div>
          <div className="flex gap-2 mt-1.5">
            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${isApproved ? "bg-green-900/50 text-green-400" : "bg-yellow-900/50 text-yellow-400"}`}>
              {isApproved ? "承認済み" : "審査待ち"}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${isPublished ? "bg-blue-900/50 text-blue-400" : "bg-gray-700 text-gray-400"}`}>
              {isPublished ? "公開中" : "非公開"}
            </span>
            <span className="text-gray-500 text-xs">
              申請日: {new Date(store.created_at).toLocaleDateString("ja-JP")}
            </span>
          </div>
        </button>

        <div className="flex gap-2 shrink-0">
          <button onClick={toggleApproval} disabled={saving}
            className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-colors border ${isApproved ? "border-red-500/50 text-red-400 hover:bg-red-900/20" : "bg-primary hover:bg-primary-hover text-white border-transparent"}`}>
            {isApproved ? "承認取消" : "承認する"}
          </button>
          <button onClick={togglePublished} disabled={saving}
            className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-colors border ${isPublished ? "border-dark-border text-gray-300 hover:border-red-500 hover:text-red-400" : "border-blue-500/50 text-blue-400 hover:bg-blue-900/20"}`}>
            {isPublished ? "非公開に" : "公開する"}
          </button>
          <Link href={`/admin/stores/${store.id}/edit`}
            className="text-xs px-3 py-1.5 rounded-lg border border-dark-border text-gray-400 hover:text-primary transition-colors">
            ✏️ 編集
          </Link>
          <Link href={`/stores/${store.slug}`} target="_blank"
            className="text-xs px-3 py-1.5 rounded-lg border border-dark-border text-gray-400 hover:text-white transition-colors">
            表示確認
          </Link>
        </div>
      </div>

      {/* 申請詳細（展開） */}
      {expanded && (
        <div className="border-t border-dark-border px-4 py-4 grid grid-cols-1 md:grid-cols-2 gap-3 bg-dark/40">
          {store.phone && (
            <div>
              <div className="text-gray-500 text-xs mb-0.5">電話番号</div>
              <a href={`tel:${store.phone}`} className="text-white text-sm hover:text-primary">📞 {store.phone}</a>
            </div>
          )}
          {store.owner_email && (
            <div>
              <div className="text-gray-500 text-xs mb-0.5">連絡先メール</div>
              <a href={`mailto:${store.owner_email}`} className="text-white text-sm hover:text-primary">✉️ {store.owner_email}</a>
            </div>
          )}
          {store.address && (
            <div className="md:col-span-2">
              <div className="text-gray-500 text-xs mb-0.5">住所</div>
              <div className="text-white text-sm">📍 {store.address}</div>
            </div>
          )}
          {store.open_hours && (
            <div>
              <div className="text-gray-500 text-xs mb-0.5">営業時間</div>
              <div className="text-white text-sm">🕐 {store.open_hours}</div>
            </div>
          )}
          {store.description && store.description.startsWith("【申請時メッセージ】") && (
            <div className="md:col-span-2">
              <div className="text-gray-500 text-xs mb-0.5">申請メッセージ</div>
              <div className="text-gray-300 text-sm bg-dark rounded-lg p-3">
                {store.description.replace("【申請時メッセージ】", "")}
              </div>
            </div>
          )}

          {/* 月間PV実績 */}
          <div className="md:col-span-2 pt-1">
            <div className="text-gray-500 text-xs mb-2">📊 月間PV実績</div>
            <div className="flex gap-4">
              {getRecentMonthsPv(store.id).map(({ label, pv }) => (
                <div key={label} className="bg-dark rounded-lg px-4 py-2 text-center">
                  <div className="text-gray-500 text-xs mb-0.5">{label}</div>
                  <div className="text-white font-bold text-sm">{pv.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
