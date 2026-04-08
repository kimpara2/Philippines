export function Logo() {
  return (
    <div className="flex items-center gap-3 select-none">
      {/* ── アイコンマーク ── */}
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-10 w-10 shrink-0"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="tn-bg" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1a0a38" />
            <stop offset="100%" stopColor="#090f2a" />
          </linearGradient>
          <radialGradient id="tn-moon-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fcd34d" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* 背景 */}
        <rect width="48" height="48" rx="11" fill="url(#tn-bg)" />

        {/* 月のグロー */}
        <circle cx="26" cy="14" r="12" fill="url(#tn-moon-glow)" />

        {/* 三日月（アンバー） */}
        <circle cx="26" cy="14" r="9" fill="#f59e0b" />
        {/* 月を切り抜く円（背景色と同色） */}
        <circle cx="30" cy="11" r="8" fill="#120826" />

        {/* 星 */}
        <circle cx="9"  cy="11" r="1.3" fill="#f59e0b" fillOpacity="0.75" />
        <circle cx="39" cy="9"  r="1.0" fill="white"   fillOpacity="0.55" />
        <circle cx="6"  cy="20" r="0.8" fill="white"   fillOpacity="0.4"  />
        <circle cx="43" cy="18" r="0.7" fill="#f59e0b" fillOpacity="0.5"  />

        {/* 都市シルエット */}
        <rect x="2"  y="31" width="6"  height="17" rx="1.5" fill="white" fillOpacity="0.88" />
        <rect x="10" y="25" width="8"  height="23" rx="1.5" fill="white" fillOpacity="0.96" />
        <rect x="20" y="33" width="5"  height="15" rx="1.5" fill="white" fillOpacity="0.78" />
        <rect x="27" y="27" width="7"  height="21" rx="1.5" fill="white" fillOpacity="0.92" />
        <rect x="36" y="34" width="6"  height="14" rx="1.5" fill="white" fillOpacity="0.72" />

        {/* 窓のアクセント（点灯） */}
        <rect x="13" y="29" width="2" height="2" rx="0.5" fill="#fcd34d" fillOpacity="0.8" />
        <rect x="13" y="33" width="2" height="2" rx="0.5" fill="#fcd34d" fillOpacity="0.5" />
        <rect x="29" y="31" width="2" height="2" rx="0.5" fill="#fcd34d" fillOpacity="0.7" />
        <rect x="4"  y="34" width="2" height="2" rx="0.5" fill="#fcd34d" fillOpacity="0.45" />

        {/* 地平線ライン */}
        <line x1="0" y1="47.5" x2="48" y2="47.5" stroke="white" strokeOpacity="0.12" strokeWidth="1" />
      </svg>

      {/* ── テキスト（HTML/CSSで本来のフォントを使用） ── */}
      <div className="flex flex-col leading-none">
        <div className="flex items-baseline">
          <span
            className="text-white font-black tracking-tight"
            style={{ fontSize: "1.45rem", lineHeight: 1 }}
          >
            東海
          </span>
          <span
            className="text-amber-400 font-black tracking-widest"
            style={{ fontSize: "1.45rem", lineHeight: 1, letterSpacing: "0.06em" }}
          >
            NIGHT
          </span>
        </div>
        <span
          className="text-slate-500 font-semibold"
          style={{ fontSize: "0.48rem", letterSpacing: "0.22em", marginTop: "4px" }}
        >
          TOKAI-NIGHT.COM
        </span>
      </div>
    </div>
  );
}
