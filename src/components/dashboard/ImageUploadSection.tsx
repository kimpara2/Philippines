"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

type Props = {
  storeId: string;
  currentUrl: string | null;
  field: "cover_image_url" | "logo_url";
  label: string;
  recommendedSize: string;
  aspectClass: string; // Tailwind class for aspect ratio container
};

export function ImageUploadSection({ storeId, currentUrl, field, label, recommendedSize, aspectClass }: Props) {
  const [preview, setPreview] = useState<string | null>(currentUrl);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // ファイルサイズチェック（5MB以下）
    if (file.size > 5 * 1024 * 1024) {
      setMessage("ファイルサイズは5MB以下にしてください");
      return;
    }

    // プレビュー表示
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    setUploading(true);
    setMessage("");

    const ext = file.name.split(".").pop();
    const filePath = `${storeId}/${field}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("store-images")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      setMessage("アップロードに失敗しました。Storageの設定を確認してください。");
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from("store-images")
      .getPublicUrl(filePath);

    const { error: updateError } = await supabase
      .from("stores")
      .update({ [field]: publicUrl })
      .eq("id", storeId);

    if (updateError) {
      setMessage("DB更新に失敗しました");
    } else {
      setMessage("アップロード完了！");
    }

    setUploading(false);
  }

  async function handleDelete() {
    if (!confirm("画像を削除しますか？")) return;
    setUploading(true);
    await supabase.from("stores").update({ [field]: null }).eq("id", storeId);
    setPreview(null);
    setMessage("削除しました");
    setUploading(false);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-gray-400 text-sm font-medium">{label}</label>
        <span className="text-gray-600 text-xs">推奨サイズ：{recommendedSize} / JPG・PNG・WEBP / 5MB以下</span>
      </div>

      {/* プレビュー */}
      <div
        className={`relative ${aspectClass} w-full bg-dark border-2 border-dashed border-dark-border rounded-xl overflow-hidden cursor-pointer hover:border-primary transition-colors group`}
        onClick={() => inputRef.current?.click()}
      >
        {preview ? (
          <>
            <Image src={preview} alt={label} fill className="object-cover" unoptimized />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white text-sm font-bold">クリックして変更</span>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-500 group-hover:text-gray-300 transition-colors">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm">クリックして画像を選択</span>
            <span className="text-xs">{recommendedSize}</span>
          </div>
        )}

        {uploading && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
            <div className="text-white text-sm">アップロード中...</div>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="flex items-center justify-between mt-2">
        {message && (
          <span className={`text-xs font-bold ${message.includes("失敗") ? "text-red-400" : "text-green-400"}`}>
            {message}
          </span>
        )}
        {preview && !uploading && (
          <button onClick={handleDelete} className="text-xs text-red-400 hover:text-red-300 ml-auto">
            画像を削除
          </button>
        )}
      </div>
    </div>
  );
}
