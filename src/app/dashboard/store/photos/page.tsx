"use client";

// 店舗写真管理（最大5枚アップロード・削除）

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";

const MAX_PHOTOS = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

type Photo = {
  id: string;
  url: string;
  caption: string | null;
  sort_order: number;
  storagePath: string; // storage内のパス（削除に使う）
};

export default function StorePhotosPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  // ストアIDと写真一覧を取得
  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: store } = await supabase
        .from("stores")
        .select("id")
        .eq("owner_id", user.id)
        .single();

      if (!store) {
        setLoading(false);
        return;
      }
      setStoreId(store.id);
      await fetchPhotos(store.id);
      setLoading(false);
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchPhotos(sid: string) {
    const { data } = await supabase
      .from("store_photos")
      .select("id, url, caption, sort_order")
      .eq("store_id", sid)
      .order("sort_order");

    const mapped: Photo[] = (data ?? []).map((p) => {
      // URLからストレージパスを逆算
      // URL例: .../store-images/photos/{storeId}/{filename}
      const parts = p.url.split("/store-images/");
      const storagePath = parts.length > 1 ? parts[1] : "";
      return { ...p, storagePath };
    });
    setPhotos(mapped);
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !storeId) return;

    setError(null);
    setSuccess(null);

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("JPG・PNG・WEBPのみアップロードできます");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError("ファイルサイズは5MB以下にしてください");
      return;
    }
    if (photos.length >= MAX_PHOTOS) {
      setError(`写真は最大${MAX_PHOTOS}枚までです`);
      return;
    }

    setUploading(true);

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const filename = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    const storagePath = `photos/${storeId}/${filename}`;

    const { error: uploadError } = await supabase.storage
      .from("store-images")
      .upload(storagePath, file, { upsert: false });

    if (uploadError) {
      setError("アップロードに失敗しました: " + uploadError.message);
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from("store-images")
      .getPublicUrl(storagePath);

    const nextOrder = photos.length > 0
      ? Math.max(...photos.map((p) => p.sort_order)) + 1
      : 0;

    const { error: insertError } = await supabase
      .from("store_photos")
      .insert({
        store_id: storeId,
        url: publicUrl,
        sort_order: nextOrder,
        caption: null,
      });

    if (insertError) {
      // DBエラーならストレージも削除
      await supabase.storage.from("store-images").remove([storagePath]);
      setError("データ保存に失敗しました: " + insertError.message);
      setUploading(false);
      return;
    }

    setSuccess("写真をアップロードしました");
    await fetchPhotos(storeId);
    setUploading(false);

    // input をリセット（同じファイルを再選択できるように）
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleDelete(photo: Photo) {
    if (!storeId) return;
    setDeletingId(photo.id);
    setError(null);
    setSuccess(null);

    // ストレージから削除
    if (photo.storagePath) {
      await supabase.storage.from("store-images").remove([photo.storagePath]);
    }

    // DBから削除
    const { error: deleteError } = await supabase
      .from("store_photos")
      .delete()
      .eq("id", photo.id);

    if (deleteError) {
      setError("削除に失敗しました: " + deleteError.message);
    } else {
      setSuccess("写真を削除しました");
      await fetchPhotos(storeId);
    }
    setDeletingId(null);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">読み込み中...</div>
      </div>
    );
  }

  const remaining = MAX_PHOTOS - photos.length;
  const canUpload = remaining > 0 && !uploading;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-black text-white">📸 店舗写真</h1>
        <span className="text-gray-400 text-sm">
          <span className={photos.length >= MAX_PHOTOS ? "text-red-400 font-bold" : "text-white font-bold"}>
            {photos.length}
          </span>
          /{MAX_PHOTOS}枚
        </span>
      </div>
      <p className="text-gray-400 text-sm mb-8">
        店舗詳細ページのスライドショーに使用されます。最大{MAX_PHOTOS}枚まで登録できます。
      </p>

      {/* エラー / 成功メッセージ */}
      {error && (
        <div className="mb-4 bg-red-900/30 border border-red-500/50 text-red-300 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 bg-green-900/30 border border-green-500/50 text-green-300 rounded-xl px-4 py-3 text-sm">
          {success}
        </div>
      )}

      {/* 写真グリッド */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* 既存の写真 */}
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="relative aspect-square rounded-xl overflow-hidden bg-dark-card border border-dark-border group"
          >
            <Image
              src={photo.url}
              alt={photo.caption ?? "店舗写真"}
              fill
              className="object-cover"
              unoptimized
            />
            {/* 削除ボタン（ホバーで表示） */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center">
              <button
                onClick={() => handleDelete(photo)}
                disabled={deletingId === photo.id}
                className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-600 hover:bg-red-500 text-white text-xs px-3 py-1.5 rounded-lg font-bold disabled:opacity-50"
              >
                {deletingId === photo.id ? "削除中..." : "🗑 削除"}
              </button>
            </div>
            {/* 番号バッジ */}
            <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded-full">
              {photo.sort_order + 1}
            </div>
          </div>
        ))}

        {/* アップロードボタン（最大枚数未満のとき） */}
        {canUpload && (
          <label className="aspect-square rounded-xl border-2 border-dashed border-dark-border hover:border-primary/60 bg-dark-card cursor-pointer flex flex-col items-center justify-center gap-2 transition-colors group">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleFileSelect}
              disabled={uploading}
            />
            {uploading ? (
              <>
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-primary text-xs font-bold">アップロード中</span>
              </>
            ) : (
              <>
                <span className="text-3xl text-gray-500 group-hover:text-primary transition-colors">＋</span>
                <span className="text-gray-500 group-hover:text-primary text-xs transition-colors text-center px-2">
                  写真を追加
                  <br />
                  <span className="text-gray-600">（あと{remaining}枚）</span>
                </span>
              </>
            )}
          </label>
        )}

        {/* 上限到達メッセージ */}
        {photos.length >= MAX_PHOTOS && (
          <div className="aspect-square rounded-xl border border-dark-border bg-dark-card/50 flex flex-col items-center justify-center gap-1">
            <span className="text-gray-500 text-xs text-center px-2">上限{MAX_PHOTOS}枚<br />に達しました</span>
          </div>
        )}
      </div>

      {/* ヒント */}
      <div className="mt-8 bg-dark-card border border-dark-border rounded-xl p-4 text-xs text-gray-400 space-y-1">
        <div>• 対応形式：JPG・PNG・WEBP（1ファイル最大5MB）</div>
        <div>• 写真はスライドショー形式で4秒ごとに自動切り替わります</div>
        <div>• 削除した写真は復元できません</div>
      </div>
    </div>
  );
}
