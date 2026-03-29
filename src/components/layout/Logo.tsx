export function Logo() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 210 48"
      fill="none"
      className="h-10 w-auto"
      aria-label="フィリピンパブNavi"
    >
      {/* ── ナビゲーションピン ── */}
      <path
        d="M20 2C13.37 2 8 7.37 8 14C8 23.5 20 40 20 40C20 40 32 23.5 32 14C32 7.37 26.63 2 20 2Z"
        fill="#db2777"
      />
      {/* ピン内の円（グラス背景） */}
      <circle cx="20" cy="14" r="6" fill="#be185d" />

      {/* カクテルグラス（ピン内） */}
      {/* グラスの三角形 */}
      <path d="M15.5 10L24.5 10L21 17L19 17Z" fill="white" />
      {/* ステム */}
      <line x1="20" y1="17" x2="20" y2="20.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
      {/* ベース */}
      <line x1="17" y1="20.5" x2="23" y2="20.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
      {/* チェリー */}
      <circle cx="24" cy="10" r="1.8" fill="#facc15" />

      {/* ── テキスト ── */}
      {/* フィリピンパブ（小） */}
      <text
        x="42"
        y="17"
        fontFamily="'Noto Sans JP', sans-serif"
        fontSize="12"
        fontWeight="700"
        fill="#94a3b8"
        letterSpacing="1"
      >
        フィリピンパブ
      </text>

      {/* Navi（大） */}
      <text
        x="41"
        y="40"
        fontFamily="'Noto Sans JP', Arial, sans-serif"
        fontSize="26"
        fontWeight="900"
        fill="#db2777"
        letterSpacing="-0.5"
      >
        Na
        <tspan fill="#facc15">v</tspan>
        i
      </text>
    </svg>
  );
}
