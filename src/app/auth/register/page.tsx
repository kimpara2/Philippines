"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/layout/Logo";
import { registerStore } from "./actions";

const AREAS = [
  "新宿", "池袋", "六本木", "錦糸町", "上野",
  "横浜", "川崎",
  "栄（名古屋）", "錦（名古屋）",
  "浜松", "静岡",
  "なんば", "心斎橋", "梅田", "北新地", "神戸", "京都",
  "すすきの（札幌）",
  "中洲（福岡）", "天神（福岡）",
  "広島", "那覇", "仙台", "その他",
];

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [storeName, setStoreName] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [area, setArea] = useState("");
  const [address, setAddress] = useState("");
  const [openHours, setOpenHours] = useState("");
  const [message, setMessage] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await registerStore({
      storeName,
      contactName,
      contactEmail,
      password,
      phone,
      area,
      address,
      openHours,
      message,
    });

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setDone(true);
  }

  if (done) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center bg-dark-card border border-dark-border rounded-2xl p-10">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-xl font-bold text-white mb-3">申請完了！</h2>
          <p className="text-gray-400 text-sm leading-relaxed mb-6">
            <span className="text-white font-bold">「{storeName}」</span> の掲載申請を受け付けました。
            <br /><br />
            内容を確認の上、<span className="text-white font-bold">担当者よりご連絡いたします</span>。<br />
            しばらくお待ちください。
          </p>
          <div className="p-4 bg-dark rounded-xl text-left text-sm space-y-2 mb-6">
            <div className="text-gray-500 text-xs font-bold">申請内容</div>
            <div className="text-white">🏪 {storeName}</div>
            <div className="text-gray-400">✉️ {contactEmail}</div>
            <div className="text-yellow-400 font-bold text-xs mt-2">⏳ 審査待ち</div>
          </div>
          <Link href="/auth/login"
            className="block w-full bg-primary hover:bg-primary-hover text-white py-3 rounded-lg font-bold transition-colors text-center">
            ログインページへ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="flex justify-center mb-8">
          <Logo />
        </div>

        <div className="bg-dark-card border border-dark-border rounded-2xl p-8">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-white">店舗掲載申請</h2>
            <p className="text-gray-400 text-sm mt-1">審査後、店舗情報を編集できます</p>
          </div>

          {/* ステップインジケーター */}
          <div className="flex items-center gap-2 mb-8">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${step >= s ? "bg-primary text-white" : "bg-dark border border-dark-border text-gray-500"}`}>
                  {s}
                </div>
                <div className={`h-0.5 flex-1 ml-2 ${s === 1 ? (step > 1 ? "bg-primary" : "bg-dark-border") : "hidden"}`} />
              </div>
            ))}
            <div className="text-gray-400 text-xs ml-2">
              {step === 1 ? "店舗情報" : "アカウント設定"}
            </div>
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3 mb-5 text-red-400 text-sm">
              {error}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="text-gray-400 text-sm block mb-1.5">店舗名 *</label>
                <input type="text" value={storeName} onChange={(e) => setStoreName(e.target.value)} required
                  placeholder="例：クラブ・トロピカル"
                  className="w-full bg-dark border border-dark-border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary" />
              </div>

              <div>
                <label className="text-gray-400 text-sm block mb-1.5">エリア *</label>
                <select value={area} onChange={(e) => setArea(e.target.value)} required
                  className="w-full bg-dark border border-dark-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary">
                  <option value="">選択してください</option>
                  {AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>

              <div>
                <label className="text-gray-400 text-sm block mb-1.5">住所 *</label>
                <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} required
                  placeholder="例：東京都新宿区歌舞伎町1-1-1 ビル3F"
                  className="w-full bg-dark border border-dark-border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary" />
              </div>

              <div>
                <label className="text-gray-400 text-sm block mb-1.5">電話番号 *</label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required
                  placeholder="例：03-0000-0000"
                  className="w-full bg-dark border border-dark-border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary" />
              </div>

              <div>
                <label className="text-gray-400 text-sm block mb-1.5">連絡先メールアドレス *</label>
                <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} required
                  placeholder="example@email.com"
                  className="w-full bg-dark border border-dark-border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary" />
              </div>

              <div>
                <label className="text-gray-400 text-sm block mb-1.5">営業時間</label>
                <input type="text" value={openHours} onChange={(e) => setOpenHours(e.target.value)}
                  placeholder="例：19:00〜翌5:00"
                  className="w-full bg-dark border border-dark-border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary" />
              </div>

              <div>
                <label className="text-gray-400 text-sm block mb-1.5">運営へのメッセージ（任意）</label>
                <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3}
                  placeholder="掲載希望の背景やご要望など"
                  className="w-full bg-dark border border-dark-border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary resize-none" />
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!storeName || !area || !address || !phone || !contactEmail) {
                    setError("店舗名・エリア・住所・電話番号・メールアドレスは必須です");
                    return;
                  }
                  setError("");
                  setStep(2);
                }}
                className="w-full bg-primary hover:bg-primary-hover text-white py-3 rounded-lg font-bold transition-colors mt-2"
              >
                次へ →
              </button>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="text-gray-400 text-sm block mb-1.5">担当者名 *</label>
                <input type="text" value={contactName} onChange={(e) => setContactName(e.target.value)} required
                  placeholder="例：山田 太郎"
                  className="w-full bg-dark border border-dark-border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary" />
              </div>

              <div>
                <label className="text-gray-400 text-sm block mb-1.5">パスワード（8文字以上）*</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8}
                  placeholder="ログイン用パスワードを設定"
                  className="w-full bg-dark border border-dark-border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary" />
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)}
                  className="flex-1 border border-dark-border text-gray-300 hover:text-white py-3 rounded-lg font-bold transition-colors">
                  ← 戻る
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white py-3 rounded-lg font-bold transition-colors">
                  {loading ? "申請中..." : "掲載を申請する"}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-dark-border text-center">
            <p className="text-gray-400 text-sm">
              すでにアカウントをお持ちの方は{" "}
              <Link href="/auth/login" className="text-primary hover:underline font-bold">
                店舗ログイン
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
