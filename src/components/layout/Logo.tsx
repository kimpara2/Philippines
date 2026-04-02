export function Logo() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 240 48"
      fill="none"
      className="h-10 w-auto"
      aria-label="東海NIGHT"
    >
      {/* ── アイコン背景 ── */}
      <rect x="1" y="1" width="46" height="46" rx="10" fill="#1e1b4b" />

      {/* ── 建物シルエット ── */}
      <rect x="7" y="28" width="7" height="18" rx="1" fill="white" fillOpacity="0.85" />
      <rect x="16" y="22" width="8" height="24" rx="1" fill="white" fillOpacity="0.9" />
      <rect x="26" y="30" width="6" height="16" rx="1" fill="white" fillOpacity="0.8" />
      <rect x="34" y="34" width="6" height="12" rx="1" fill="white" fillOpacity="0.75" />

      {/* ── 三日月 ── */}
      <circle cx="20" cy="13" r="7" fill="#f59e0b" />
      <circle cx="24" cy="10" r="6.5" fill="#1e1b4b" />

      {/* ── 星 ── */}
      <circle cx="35" cy="11" r="1.5" fill="#f59e0b" fillOpacity="0.9" />
      <circle cx="10" cy="18" r="1" fill="white" fillOpacity="0.7" />
      <circle cx="30" cy="17" r="0.8" fill="white" fillOpacity="0.8" />

      {/* ── メインテキスト ── */}
      {/* 東海（白） */}
      <text
        x="58"
        y="35"
        fontFamily="'Noto Sans JP', sans-serif"
        fontSize="25"
        fontWeight="900"
        fill="white"
      >
        東海
      </text>
      {/* NIGHT（アンバーゴールド） */}
      <text
        x="112"
        y="35"
        fontFamily="'Arial Black', Arial, sans-serif"
        fontSize="25"
        fontWeight="900"
        fill="#f59e0b"
        letterSpacing="1"
      >
        NIGHT
      </text>

      {/* ── サブテキスト ── */}
      <text
        x="58"
        y="47"
        fontFamily="Arial, sans-serif"
        fontSize="8.5"
        fontWeight="500"
        fill="#94a3b8"
        letterSpacing="2"
      >
        TOKAI-NIGHT.COM
      </text>
    </svg>
  );
}
