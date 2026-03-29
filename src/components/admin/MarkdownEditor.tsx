"use client";

import { useRef, useState } from "react";
import Image from "next/image";

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
};

type UnsplashPhoto = {
  id: string;
  regular: string;
  thumb: string;
  alt: string;
};

function wrapSelection(
  textarea: HTMLTextAreaElement,
  value: string,
  onChange: (v: string) => void,
  prefix: string,
  suffix = "",
  placeholder = "テキスト"
) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = value.slice(start, end) || placeholder;
  const newText = value.slice(0, start) + prefix + selected + suffix + value.slice(end);
  onChange(newText);
  requestAnimationFrame(() => {
    textarea.focus();
    const newCursor = start + prefix.length + selected.length + suffix.length;
    textarea.setSelectionRange(newCursor, newCursor);
  });
}

function insertLinePrefix(
  textarea: HTMLTextAreaElement,
  value: string,
  onChange: (v: string) => void,
  prefix: string
) {
  const start = textarea.selectionStart;
  const lineStart = value.lastIndexOf("\n", start - 1) + 1;
  const newText = value.slice(0, lineStart) + prefix + value.slice(lineStart);
  onChange(newText);
  requestAnimationFrame(() => {
    textarea.focus();
    const newPos = start + prefix.length;
    textarea.setSelectionRange(newPos, newPos);
  });
}

export function MarkdownEditor({ value, onChange, placeholder, rows = 16 }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [savedCursor, setSavedCursor] = useState(0); // モーダルを開く前のカーソル位置を保存
  const [imgQuery, setImgQuery] = useState("");
  const [imgResults, setImgResults] = useState<UnsplashPhoto[]>([]);
  const [imgLoading, setImgLoading] = useState(false);
  const [imgError, setImgError] = useState("");

  async function searchImages() {
    if (!imgQuery.trim()) return;
    setImgLoading(true);
    setImgError("");
    try {
      const res = await fetch(`/api/unsplash?q=${encodeURIComponent(imgQuery)}`);
      const data = await res.json() as { photos?: UnsplashPhoto[]; error?: string };
      if (data.error) { setImgError(data.error); return; }
      setImgResults(data.photos ?? []);
    } catch {
      setImgError("検索に失敗しました");
    } finally {
      setImgLoading(false);
    }
  }

  function insertImage(photo: UnsplashPhoto) {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = savedCursor; // 保存したカーソル位置を使う
    const imgMd = `\n![${photo.alt || "画像"}](${photo.regular})\n`;
    const newText = value.slice(0, start) + imgMd + value.slice(start);
    onChange(newText);
    setShowImageModal(false);
    setImgResults([]);
    setImgQuery("");
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(start + imgMd.length, start + imgMd.length);
    });
  }

  return (
    <div className="border border-dark-border rounded-lg overflow-hidden focus-within:border-primary transition-colors">
      {/* ツールバー */}
      <div className="flex items-center gap-1 px-3 py-2 bg-dark border-b border-dark-border flex-wrap">
        <span className="text-gray-500 text-xs mr-1">書式：</span>

        <button type="button" title="大見出し（ピンク）"
          onClick={() => textareaRef.current && insertLinePrefix(textareaRef.current, value, onChange, "## ")}
          className="px-2.5 py-1 rounded text-sm hover:bg-dark-card transition-colors border border-transparent hover:border-dark-border text-pink-400 font-black">
          H2
        </button>

        <button type="button" title="小見出し（黄色）"
          onClick={() => textareaRef.current && insertLinePrefix(textareaRef.current, value, onChange, "### ")}
          className="px-2.5 py-1 rounded text-sm hover:bg-dark-card transition-colors border border-transparent hover:border-dark-border text-yellow-400 font-bold">
          H3
        </button>

        <button type="button" title="太字"
          onClick={() => textareaRef.current && wrapSelection(textareaRef.current, value, onChange, "**", "**", "太字テキスト")}
          className="px-2.5 py-1 rounded text-sm hover:bg-dark-card transition-colors border border-transparent hover:border-dark-border font-black text-white">
          B
        </button>

        <button type="button" title="斜体"
          onClick={() => textareaRef.current && wrapSelection(textareaRef.current, value, onChange, "*", "*", "斜体テキスト")}
          className="px-2.5 py-1 rounded text-sm hover:bg-dark-card transition-colors border border-transparent hover:border-dark-border italic text-gray-300">
          I
        </button>

        <button type="button" title="区切り線"
          onClick={() => {
            const ta = textareaRef.current;
            if (!ta) return;
            const start = ta.selectionStart;
            const newText = value.slice(0, start) + "\n\n---\n\n" + value.slice(start);
            onChange(newText);
            requestAnimationFrame(() => { ta.focus(); ta.setSelectionRange(start + 7, start + 7); });
          }}
          className="px-2.5 py-1 rounded text-sm hover:bg-dark-card transition-colors border border-transparent hover:border-dark-border text-gray-400">
          ―
        </button>

        <button type="button" title="空行を挿入"
          onClick={() => {
            const ta = textareaRef.current;
            if (!ta) return;
            const start = ta.selectionStart;
            const newText = value.slice(0, start) + "\n\n" + value.slice(start);
            onChange(newText);
            requestAnimationFrame(() => { ta.focus(); ta.setSelectionRange(start + 2, start + 2); });
          }}
          className="px-2.5 py-1 rounded text-sm hover:bg-dark-card transition-colors border border-transparent hover:border-dark-border text-gray-400">
          ↵
        </button>

        {/* 画像挿入ボタン */}
        <button type="button" title="Unsplash画像を挿入"
          onClick={() => {
            // カーソル位置を保存してからモーダルを開く
            setSavedCursor(textareaRef.current?.selectionStart ?? value.length);
            setShowImageModal(true);
          }}
          className="px-2.5 py-1 rounded text-sm hover:bg-dark-card transition-colors border border-transparent hover:border-primary text-primary font-bold">
          📷 画像
        </button>

        <div className="ml-auto">
          <span className="text-gray-600 text-xs">{value.length.toLocaleString()}文字</span>
        </div>
      </div>

      {/* テキストエリア */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full bg-dark-card px-4 py-3 text-white placeholder-gray-500 focus:outline-none resize-y text-sm leading-relaxed font-mono"
      />

      {/* ヒント */}
      <div className="px-3 py-2 bg-dark border-t border-dark-border">
        <p className="text-gray-600 text-xs">
          ## 大見出し　### 小見出し　**太字**　*斜体*　--- 区切り線　📷 Unsplash画像を挿入
        </p>
      </div>

      {/* 画像検索モーダル */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setShowImageModal(false)}>
          <div className="bg-dark-card border border-dark-border rounded-xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-dark-border">
              <h3 className="text-white font-bold">📷 Unsplash画像を挿入</h3>
              <button onClick={() => setShowImageModal(false)} className="text-gray-400 hover:text-white text-xl">×</button>
            </div>

            <div className="p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={imgQuery}
                  onChange={(e) => setImgQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && searchImages()}
                  placeholder="例: japan bar, nightlife, tokyo night"
                  className="flex-1 bg-dark border border-dark-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary"
                  autoFocus
                />
                <button onClick={searchImages} disabled={imgLoading}
                  className="bg-primary hover:bg-primary-hover disabled:opacity-50 text-white font-bold px-4 py-2 rounded-lg text-sm transition-colors">
                  {imgLoading ? "検索中..." : "検索"}
                </button>
              </div>
              {imgError && <p className="text-red-400 text-xs mt-2">{imgError}</p>}
            </div>

            <div className="overflow-y-auto flex-1 px-4 pb-4">
              {imgResults.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {imgResults.map((photo) => (
                    <button key={photo.id} type="button"
                      onClick={() => insertImage(photo)}
                      className="relative aspect-video rounded-lg overflow-hidden hover:ring-2 hover:ring-primary transition-all group">
                      <Image src={photo.thumb} alt={photo.alt} fill className="object-cover group-hover:scale-105 transition-transform" unoptimized />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <span className="text-white text-xs font-bold opacity-0 group-hover:opacity-100">挿入</span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : !imgLoading && (
                <p className="text-gray-500 text-sm text-center py-8">キーワードを入力して検索してください</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
