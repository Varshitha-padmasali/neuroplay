import { useState, useEffect } from "react";
import { useGameState } from "./hooks/useGameState";
import { useTheme } from "./hooks/useTheme";
import FocusTapGame from "./components/FocusTapGame";
import WordBuilderGame from "./components/WordBuilderGame";
import ProgressDashboard from "./components/ProgressDashboard";
import BadgeToast from "./components/BadgeToast";
import SettingsPanel from "./components/SettingsPanel";

const TABS = [
  { id: "focus",    label: "🎯", name: "Focus Tap"   },
  { id: "word",     label: "🔤", name: "Word Builder" },
  { id: "progress", label: "📊", name: "Progress"    },
];

export default function App() {
  const [activeTab, setActiveTab]     = useState("focus");
  const [toastQueue, setToastQueue]   = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const { state, recordGame, resetAll } = useGameState();
  const { theme, toggle } = useTheme();

  // Badge toasts
  useEffect(() => {
    if (state._newlyUnlocked?.length > 0) {
      setToastQueue((q) => [...q, ...state._newlyUnlocked]);
    }
  }, [state._newlyUnlocked]);

  // Apply dyslexia font globally
  const fontFamily = theme.dyslexiaFont
    ? "'OpenDyslexic', 'Segoe UI', sans-serif"
    : "'Segoe UI', sans-serif";

  // Focus mode palette
  const bg      = theme.focusMode ? "#f8f8f6" : "#f5f3ff";
  const cardBg  = theme.focusMode ? "#ffffff" : "#ffffff";
  const accent  = theme.focusMode ? "#4b5563" : "#6366f1";

  return (
    <div style={{ minHeight: "100vh", background: bg, paddingBottom: 80, fontFamily, transition: "background 0.4s" }}>

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div style={{
        background: cardBg, borderBottom: "1px solid #e5e7eb",
        padding: "14px 20px", display: "flex",
        alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: accent, margin: 0 }}>
          🧠 NeuroPlay
        </h1>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 13, color: "#6b7280" }}>⚡ {state.totalXP} XP</span>
          <span style={{ background: "#eef2ff", color: accent, borderRadius: 20, padding: "3px 10px", fontSize: 12, fontWeight: 700 }}>
            🔥 {state.currentStreak}
          </span>
          <button
            onClick={() => setShowSettings(true)}
            style={{ background: "#f3f4f6", border: "none", borderRadius: 10, padding: "6px 10px", cursor: "pointer", fontSize: 16 }}
          >⚙️</button>
        </div>
      </div>

      {/* ── Accessibility hint strip (shows when a mode is active) ── */}
      {(theme.dyslexiaFont || theme.focusMode) && (
        <div style={{
          background: theme.focusMode ? "#f1f5f9" : "#eef2ff",
          borderBottom: "1px solid #e5e7eb",
          padding: "6px 20px", fontSize: 12,
          color: "#6b7280", textAlign: "center",
          display: "flex", justifyContent: "center", gap: 16,
        }}>
          {theme.dyslexiaFont && <span>🔡 Dyslexia font ON</span>}
          {theme.focusMode    && <span>🧘 Focus mode ON</span>}
        </div>
      )}

      {/* ── Game Card ───────────────────────────────────────────────── */}
      <div style={{
        background: cardBg, borderRadius: 24,
        maxWidth: 520, margin: "24px auto 0",
        padding: "24px 16px",
        boxShadow: theme.focusMode
          ? "0 2px 12px rgba(0,0,0,0.06)"
          : "0 4px 24px rgba(99,102,241,0.08)",
        transition: "box-shadow 0.4s",
        position: "relative", overflow: "hidden",
      }}>
        {activeTab === "focus" && (
          <FocusTapGame
            onGameEnd={(score) => recordGame({ gameType: "focus", score })}
            focusMode={theme.focusMode}
          />
        )}
        {activeTab === "word" && (
          <WordBuilderGame
            onGameEnd={(score, wordsSpelled) =>
              recordGame({ gameType: "word", score, wordsSpelled })
            }
            dyslexiaFont={theme.dyslexiaFont}
          />
        )}
        {activeTab === "progress" && (
          <ProgressDashboard state={state} onReset={resetAll} />
        )}
      </div>

      {/* ── Bottom Tab Bar ──────────────────────────────────────────── */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        background: "#fff", borderTop: "1px solid #e5e7eb",
        display: "flex", justifyContent: "space-around",
        padding: "10px 0 14px", zIndex: 100,
      }}>
        {TABS.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{
                display: "flex", flexDirection: "column",
                alignItems: "center", gap: 3,
                background: "none", border: "none",
                cursor: "pointer", padding: "4px 20px",
              }}
            >
              <span style={{ fontSize: 24 }}>{tab.label}</span>
              <span style={{ fontSize: 11, fontWeight: active ? 700 : 400, color: active ? accent : "#9ca3af" }}>
                {tab.name}
              </span>
              {active && (
                <div style={{ width: 4, height: 4, borderRadius: "50%", background: accent, marginTop: 1 }}/>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Settings modal ──────────────────────────────────────────── */}
      {showSettings && (
        <SettingsPanel theme={theme} toggle={toggle} onClose={() => setShowSettings(false)} />
      )}

      {/* ── Badge toast ─────────────────────────────────────────────── */}
      {toastQueue.length > 0 && (
        <BadgeToast badgeId={toastQueue[0]} onDone={() => setToastQueue((q) => q.slice(1))} />
      )}
    </div>
  );
}