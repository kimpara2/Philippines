"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import type { StorePhoto } from "@/types/database";

type Props = {
  photos: StorePhoto[];
  storeName?: string;
};

export function PhotoSlideshow({ photos, storeName = "店舗写真" }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const goNext = useCallback(() => {
    setCurrentIndex((i) => (i + 1) % photos.length);
  }, [photos.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex((i) => (i - 1 + photos.length) % photos.length);
  }, [photos.length]);

  // 4秒ごとに自動切り替え
  useEffect(() => {
    if (photos.length <= 1 || isPaused) return;
    const timer = setInterval(goNext, 4000);
    return () => clearInterval(timer);
  }, [photos.length, isPaused, goNext]);

  if (photos.length === 0) return null;

  const current = photos[currentIndex];

  return (
    <div
      className="relative w-full aspect-video rounded-2xl overflow-hidden bg-dark-card select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* 画像レイヤー（opacity フェード） */}
      {photos.map((photo, i) => (
        <div
          key={photo.id}
          className={`absolute inset-0 transition-opacity duration-700 ${
            i === currentIndex ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={photo.url}
            alt={photo.caption ?? storeName}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      ))}

      {/* キャプション */}
      {current.caption && (
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent px-4 py-4 z-10">
          <p className="text-white text-sm font-medium">{current.caption}</p>
        </div>
      )}

      {/* 前後ボタン（2枚以上の場合のみ） */}
      {photos.length > 1 && (
        <>
          <button
            onClick={goPrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/50 hover:bg-black/75 text-white flex items-center justify-center transition-colors backdrop-blur-sm"
            aria-label="前の写真"
          >
            ‹
          </button>
          <button
            onClick={goNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/50 hover:bg-black/75 text-white flex items-center justify-center transition-colors backdrop-blur-sm"
            aria-label="次の写真"
          >
            ›
          </button>
        </>
      )}

      {/* ドットインジケーター（2枚以上） */}
      {photos.length > 1 && (
        <div className="absolute bottom-4 inset-x-0 flex justify-center gap-1.5 z-20">
          {photos.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i === currentIndex
                  ? "bg-white scale-125"
                  : "bg-white/40 hover:bg-white/70"
              }`}
              aria-label={`写真 ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* 枚数バッジ */}
      <div className="absolute top-3 right-3 z-20 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full backdrop-blur-sm">
        {currentIndex + 1} / {photos.length}
      </div>
    </div>
  );
}
