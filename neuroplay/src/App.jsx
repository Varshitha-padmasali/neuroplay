// src/App.jsx
import { useState, useEffect } from "react";
import { useGameState } from "./hooks/useGameState";
import FocusTapGame from "./components/FocusTapGame";
import WordBuilderGame from "./components/WordBuilderGame";
import ProgressDashboard from "./components/ProgressDashboard";
import BadgeToast from "./components/BadgeToast";

const TABS = [
  { id: "focus",    label: "🎯",  name: "Focus Tap"  },
  { id: "word",     label: "🔤",  name: "Word Builder" },
  { id: "progress", label: "📊",  name: "Progress"   },
];

export default function App() {
  const [activeTab, setActiveTab]   = useState("focus");
  const [toastQueue, setToastQueue] = useState([]);  // badge IDs to show
  const { state, recordGame, resetAll } = useGameState();

  // Watch for newly unlocked badges and queue them as toasts
  useEffect(() => {
    if (state._newlyUnlocked && state._newlyUnlocked.length > 0) {
      setToastQueue((q) => [...q, ...state._newlyUnlocked]);
    }
  }, [state._newlyUnlocked]);

  function dismissToast() {
    setToastQueue((q) => q.slice(1));
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f3ff",
        paddingBottom: 80,
        fontFamily: "'Segoe UI', sans-serif",
      }}
    >
      {/* ── App Header ────────────────────────────────────────────────── */}
      <div
        style={{
          background: "#fff",
          borderBottom: "1px solid #e5e7eb",
          padding: "14px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#4f46e5", margin: 0 }}>
          🧠 NeuroPlay
        </h1>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 13, color: "#6b7280" }}>
            ⚡ {state.totalXP} XP
          </span>
          <span
            style={{
              background: "#eef2ff",
              color: "#4f46e5",
              borderRadius: 20,
              padding: "3px 10px",
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            🔥 {state.currentStreak}
          </span>
        </div>
      </div>

      {/* ── Game Panel ────────────────────────────────────────────────── */}
      <div
        style={{
          background: "#fff",
          borderRadius: 24,
          maxWidth: 520,
          margin: "24px auto 0",
          padding: "24px 16px",
          boxShadow: "0 4px 24px rgba(99,102,241,0.08)",
        }}
      >
        {activeTab === "focus" && (
          <FocusTapGame
            onGameEnd={(score) =>
              recordGame({ gameType: "focus", score })
            }
          />
        )}
        {activeTab === "word" && (
          <WordBuilderGame
            onGameEnd={(score, wordsSpelled) =>
              recordGame({ gameType: "word", score, wordsSpelled })
            }
          />
        )}
        {activeTab === "progress" && (
          <ProgressDashboard state={state} onReset={resetAll} />
        )}
      </div>

      {/* ── Bottom Tab Bar ─────────────────────────────────────────────── */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          background: "#fff",
          borderTop: "1px solid #e5e7eb",
          display: "flex",
          justifyContent: "space-around",
          padding: "10px 0 14px",
          zIndex: 100,
        }}
      >
        {TABS.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 3,
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "4px 20px",
              }}
            >
              <span style={{ fontSize: 24 }}>{tab.label}</span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: active ? 700 : 400,
                  color: active ? "#6366f1" : "#9ca3af",
                }}
              >
                {tab.name}
              </span>
              {active && (
                <div
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: "50%",
                    background: "#6366f1",
                    marginTop: 1,
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* ── Badge toast ───────────────────────────────────────────────── */}
      {toastQueue.length > 0 && (
        <BadgeToast badgeId={toastQueue[0]} onDone={dismissToast} />
      )}
    </div>
  );
}