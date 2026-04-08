export default function LogoPreviewPage() {
  return (
    <div style={{ background: "#05010f", minHeight: "100vh", padding: "60px 40px", display: "flex", flexDirection: "column", gap: "80px", alignItems: "center" }}>

      {/* ======= A: 東海NIGHT 縦スタック ======= */}
      <div style={{ textAlign: "center" }}>
        <p style={{ color: "#444", fontSize: 11, letterSpacing: 3, marginBottom: 24, fontFamily: "Arial" }}>OPTION A — 縦スタック</p>
        <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 2, background: "#0e0820", padding: "32px 56px", borderRadius: 20, border: "1px solid #1e103a" }}>
          {/* アイコン */}
          <svg viewBox="0 0 80 56" width="120" height="84" fill="none">
            <defs>
              <radialGradient id="gA" cx="50%" cy="40%" r="55%">
                <stop offset="0%" stopColor="#fcd34d" stopOpacity="0.2"/>
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0"/>
              </radialGradient>
            </defs>
            <circle cx="40" cy="22" r="22" fill="url(#gA)"/>
            <circle cx="40" cy="22" r="16" fill="#f59e0b"/>
            <circle cx="48" cy="17" r="14" fill="#0e0820"/>
            <circle cx="18" cy="12" r="2" fill="#f59e0b" fillOpacity="0.7"/>
            <circle cx="66" cy="9"  r="1.5" fill="white" fillOpacity="0.5"/>
            <circle cx="12" cy="28" r="1"   fill="white" fillOpacity="0.35"/>
            <rect x="4"  y="38" width="8"  height="18" rx="1.5" fill="white" fillOpacity="0.9"/>
            <rect x="15" y="32" width="10" height="24" rx="1.5" fill="white" fillOpacity="0.95"/>
            <rect x="28" y="40" width="7"  height="16" rx="1.5" fill="white" fillOpacity="0.8"/>
            <rect x="38" y="34" width="9"  height="22" rx="1.5" fill="white" fillOpacity="0.88"/>
            <rect x="50" y="41" width="7"  height="15" rx="1.5" fill="white" fillOpacity="0.75"/>
            <rect x="60" y="36" width="8"  height="20" rx="1.5" fill="white" fillOpacity="0.85"/>
            <rect x="17" y="35" width="2.5" height="2.5" rx="0.5" fill="#fcd34d" fillOpacity="0.9"/>
            <rect x="41" y="38" width="2.5" height="2.5" rx="0.5" fill="#fcd34d" fillOpacity="0.8"/>
            <rect x="62" y="39" width="2.5" height="2.5" rx="0.5" fill="#fcd34d" fillOpacity="0.7"/>
          </svg>
          {/* テキスト */}
          <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginTop: 8 }}>
            <span style={{ fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 900, fontSize: 52, color: "white", lineHeight: 1, letterSpacing: -1 }}>東海</span>
            <span style={{ fontFamily: "Arial Black, Arial, sans-serif", fontWeight: 900, fontSize: 52, color: "#f59e0b", lineHeight: 1, letterSpacing: 6 }}>NIGHT</span>
          </div>
          <span style={{ fontFamily: "Arial, sans-serif", fontSize: 10, color: "#475569", letterSpacing: 4, marginTop: 6 }}>TOKAI-NIGHT.COM</span>
        </div>
      </div>

      {/* ======= B: 横並び・ラインアクセント ======= */}
      <div style={{ textAlign: "center" }}>
        <p style={{ color: "#444", fontSize: 11, letterSpacing: 3, marginBottom: 24, fontFamily: "Arial" }}>OPTION B — 横並び＋ライン</p>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 20, background: "#0e0820", padding: "28px 48px", borderRadius: 20, border: "1px solid #1e103a" }}>
          <svg viewBox="0 0 56 56" width="72" height="72" fill="none">
            <defs>
              <radialGradient id="gB" cx="50%" cy="45%" r="55%">
                <stop offset="0%" stopColor="#fcd34d" stopOpacity="0.25"/>
                <stop offset="100%" stopColor="transparent"/>
              </radialGradient>
              <clipPath id="cB"><circle cx="28" cy="28" r="26"/></clipPath>
            </defs>
            <circle cx="28" cy="28" r="27" fill="#160530"/>
            <circle cx="28" cy="28" r="27" fill="none" stroke="#f59e0b" strokeWidth="0.8" strokeOpacity="0.3"/>
            <circle cx="28" cy="22" r="16" fill="url(#gB)"/>
            <circle cx="28" cy="22" r="12" fill="#f59e0b"/>
            <circle cx="35" cy="17" r="10.5" fill="#160530"/>
            <circle cx="14" cy="13" r="1.5" fill="#f59e0b" fillOpacity="0.7"/>
            <circle cx="45" cy="11" r="1.2" fill="white" fillOpacity="0.45"/>
            <g clipPath="url(#cB)">
              <rect x="2"  y="36" width="7"  height="20" rx="1.5" fill="white" fillOpacity="0.88"/>
              <rect x="11" y="30" width="9"  height="26" rx="1.5" fill="white" fillOpacity="0.95"/>
              <rect x="22" y="38" width="6"  height="18" rx="1.5" fill="white" fillOpacity="0.78"/>
              <rect x="30" y="32" width="8"  height="24" rx="1.5" fill="white" fillOpacity="0.9"/>
              <rect x="40" y="37" width="6"  height="19" rx="1.5" fill="white" fillOpacity="0.75"/>
              <rect x="48" y="33" width="7"  height="23" rx="1.5" fill="white" fillOpacity="0.83"/>
              <rect x="13" y="33" width="2" height="2" rx="0.4" fill="#fcd34d" fillOpacity="0.9"/>
              <rect x="32" y="35" width="2" height="2" rx="0.4" fill="#fcd34d" fillOpacity="0.8"/>
            </g>
          </svg>
          {/* 縦線 */}
          <div style={{ width: 1, height: 60, background: "linear-gradient(to bottom, transparent, #f59e0b55, transparent)" }}/>
          {/* テキスト */}
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
              <span style={{ fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 900, fontSize: 42, color: "white", lineHeight: 1 }}>東海</span>
              <span style={{ fontFamily: "Arial Black, Arial, sans-serif", fontWeight: 900, fontSize: 42, color: "#f59e0b", lineHeight: 1, letterSpacing: 5 }}>NIGHT</span>
            </div>
            <span style={{ fontFamily: "Arial, sans-serif", fontSize: 9, color: "#475569", letterSpacing: "0.3em" }}>TOKAI-NIGHT.COM</span>
          </div>
        </div>
      </div>

      {/* ======= C: 新名称案「YORU」シンプル ======= */}
      <div style={{ textAlign: "center" }}>
        <p style={{ color: "#444", fontSize: 11, letterSpacing: 3, marginBottom: 24, fontFamily: "Arial" }}>OPTION C — 名称変更案「YORU（夜）」</p>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 24, background: "#0e0820", padding: "28px 56px", borderRadius: 20, border: "1px solid #1e103a" }}>
          {/* 「夜」漢字アイコン */}
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg, #1a0535, #0a1525)", border: "2px solid #f59e0b44", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 900, fontSize: 40, color: "#f59e0b", lineHeight: 1 }}>夜</span>
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 2 }}>
              <span style={{ fontFamily: "Arial Black, Arial, sans-serif", fontWeight: 900, fontSize: 50, color: "white", lineHeight: 1, letterSpacing: 3 }}>YORU</span>
            </div>
            <div style={{ color: "#94a3b8", fontSize: 12, letterSpacing: "0.25em", marginTop: 4, fontFamily: "Arial" }}>東海ナイトガイド</div>
            <div style={{ color: "#475569", fontSize: 9, letterSpacing: "0.35em", marginTop: 2, fontFamily: "Arial" }}>TOKAI NIGHTLIFE GUIDE</div>
          </div>
        </div>
      </div>

      {/* ======= D: プレミアム横長バージョン ======= */}
      <div style={{ textAlign: "center" }}>
        <p style={{ color: "#444", fontSize: 11, letterSpacing: 3, marginBottom: 24, fontFamily: "Arial" }}>OPTION D — プレミアム横長</p>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 0, background: "#0e0820", padding: "0", borderRadius: 20, border: "1px solid #1e103a", overflow: "hidden" }}>
          {/* 左：アンバー帯 */}
          <div style={{ background: "#f59e0b", width: 8, alignSelf: "stretch" }}/>
          <div style={{ display: "flex", alignItems: "center", gap: 20, padding: "24px 44px" }}>
            <svg viewBox="0 0 48 48" width="56" height="56" fill="none">
              <circle cx="24" cy="19" r="13" fill="#f59e0b"/>
              <circle cx="30" cy="14" r="11.5" fill="#0e0820"/>
              <circle cx="10" cy="10" r="1.8" fill="#f59e0b" fillOpacity="0.7"/>
              <circle cx="42" cy="8"  r="1.3" fill="white" fillOpacity="0.4"/>
              <rect x="2"  y="33" width="6"  height="15" rx="1" fill="white" fillOpacity="0.88"/>
              <rect x="10" y="27" width="8"  height="21" rx="1" fill="white" fillOpacity="0.95"/>
              <rect x="20" y="35" width="5"  height="13" rx="1" fill="white" fillOpacity="0.78"/>
              <rect x="27" y="29" width="7"  height="19" rx="1" fill="white" fillOpacity="0.9"/>
              <rect x="36" y="34" width="5"  height="14" rx="1" fill="white" fillOpacity="0.75"/>
              <rect x="43" y="31" width="5"  height="17" rx="1" fill="white" fillOpacity="0.82"/>
            </svg>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
                <span style={{ fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 900, fontSize: 44, color: "white", lineHeight: 1, letterSpacing: -1 }}>東海</span>
                <span style={{ fontFamily: "Arial Black, Arial, sans-serif", fontWeight: 900, fontSize: 44, color: "#f59e0b", lineHeight: 1, letterSpacing: 4, marginLeft: 6 }}>NIGHT</span>
              </div>
              <div style={{ color: "#374151", fontSize: 9, letterSpacing: "0.4em", marginTop: 5, fontFamily: "Arial", borderTop: "1px solid #1e2a3a", paddingTop: 5 }}>TOKAI NIGHTLIFE GUIDE</div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
