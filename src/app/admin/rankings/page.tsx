"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

const AREAS = [
  "すすきの", "仙台",
  "新宿", "池袋", "六本木", "錦糸町", "上野", "横浜", "川崎",
  "栄", "錦", "浜松", "静岡",
  "なんば", "心斎橋", "梅田", "北新地", "神戸", "京都",
  "広島", "松山",
  "中洲", "天神", "熊本", "那覇",
];

type Store = { id: string; name: string; area: string | null };
type Ranking = { rank: number; store_id: string };

export default function AdminRankingsPage() {
  const supabase = createClient();
  const [selectedArea, setSelectedArea] = useState(AREAS[0]);
  const [areaStores, setAreaStores] = useState<Store[]>([]);
  const [rankings, setRankings] = useState<Record<number, string>>({}); // rank -> store_id
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const loadData = useCallback(async () => {
    const [{ data: stores }, { data: ranks }] = await Promise.all([
      supabase.from("stores").select("id, name, area").eq("area", selectedArea).eq("is_published", true).eq("is_approved", true).order("name"),
      supabase.from("store_rankings").select("rank, store_id").eq("area", selectedArea).order("rank"),
    ]);
    setAreaStores((stores as Store[]) ?? []);
    const rankMap: Record<number, string> = {};
    ((ranks as Ranking[]) ?? []).forEach(({ rank, store_id }) => { rankMap[rank] = store_id; });
    setRankings(rankMap);
  }, [selectedArea, supabase]);

  useEffect(() => { loadData(); }, [loadData]);

  async function handleSave() {
    setSaving(true);
    // 既存削除 → 新規挿入
    await supabase.from("store_rankings").delete().eq("area", selectedArea);
    const inserts = Object.entries(rankings)
      .filter(([, store_id]) => store_id)
      .map(([rank, store_id]) => ({ area: selectedArea, rank: Number(rank), store_id }));
    if (inserts.length > 0) {
      await supabase.from("store_rankings").insert(inserts);
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const setRank = (rank: number, storeId: string) => {
    setRankings((prev) => {
      const next = { ...prev };
      // 同じ店舗が他の順位にいたら解除
      Object.keys(next).forEach((k) => {
        if (next[Number(k)] === storeId && Number(k) !== rank) delete next[Number(k)];
      });
      if (storeId) next[rank] = storeId;
      else delete next[rank];
      return next;
    });
  };

  return (
    <div>
      <h1 className="text-2xl font-black text-white mb-6">🏆 ランキング管理</h1>

      {/* エリア選択 */}
      <div className="mb-6">
        <label className="text-gray-400 text-sm block mb-2">エリアを選択</label>
        <select
          value={selectedArea}
          onChange={(e) => setSelectedArea(e.target.value)}
          className="bg-dark border border-dark-border rounded-lg px-4 py-2 text-white"
        >
          {AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      {areaStores.length === 0 ? (
        <div className="bg-dark-card border border-dark-border rounded-xl p-8 text-center text-gray-400">
          {selectedArea}エリアに承認済みの店舗がありません
        </div>
      ) : (
        <>
          <div className="bg-dark-card border border-dark-border rounded-xl p-6 mb-6">
            <p className="text-gray-400 text-sm mb-4">
              各順位に店舗を選択してください（最大20位まで）。空白にするとその順位はスキップされます。
            </p>
            <div className="space-y-2">
              {Array.from({ length: 20 }, (_, i) => i + 1).map((rank) => (
                <div key={rank} className="flex items-center gap-3">
                  <div className="w-10 text-right">
                    <span className={`font-black text-lg ${rank === 1 ? "text-yellow-400" : rank === 2 ? "text-gray-300" : rank === 3 ? "text-amber-600" : "text-gray-500"}`}>
                      {rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `${rank}位`}
                    </span>
                  </div>
                  <select
                    value={rankings[rank] ?? ""}
                    onChange={(e) => setRank(rank, e.target.value)}
                    className="flex-1 bg-dark border border-dark-border rounded-lg px-3 py-2 text-white text-sm"
                  >
                    <option value="">― 選択してください ―</option>
                    {areaStores.map((store) => (
                      <option key={store.id} value={store.id}>{store.name}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-primary hover:bg-primary-hover disabled:opacity-50 text-white px-8 py-3 rounded-lg font-bold transition-colors"
          >
            {saving ? "保存中..." : saved ? "✅ 保存しました！" : "💾 ランキングを保存"}
          </button>
        </>
      )}
    </div>
  );
}
