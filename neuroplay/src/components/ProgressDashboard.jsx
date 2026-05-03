// src/components/ProgressDashboard.jsx
import { getLevelInfo, LEVELS, BADGES } from "../hooks/useGameState";

// ── Mini bar chart for game history ───────────────────────────────────────
function HistoryChart({ history }) {
  if (!history || history.length === 0)
    return (
      <p style={{ color: "#9ca3af", fontSize: 13, textAlign: "center" }}>
        No games yet — play your first game!
      </p>
    );

  const max = Math.max(...history.map((h) => h.score), 1);
  const recent = history.slice(0, 10).reverse();

  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 5, height: 64 }}>
      {recent.map((entry, i) => (
        <div
          key={i}
          title={`${entry.gameType === "focus" ? "🎯" : "🔤"} ${entry.score} pts`}
          style={{
            flex: 1,
            height: `${Math.max(8, (entry.score / max) * 64)}px`,
            borderRadius: "4px 4px 0 0",
            background: entry.gameType === "focus" ? "#818cf8" : "#34d399",
            transition: "height 0.4s ease",
            cursor: "default",
          }}
        />
      ))}
    </div>
  );
}

// ── XP progress bar ────────────────────────────────────────────────────────
function XPBar({ progress, xpIntoLevel, xpNeeded, next }) {
  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 12,
          color: "#6b7280",
          marginBottom: 6,
        }}
      >
        <span>{xpIntoLevel} XP</span>
        <span>{next ? `${xpNeeded} XP to ${next.title}` : "Max level!"}</span>
      </div>
      <div
        style={{
          height: 12,
          background: "#e5e7eb",
          borderRadius: 6,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${progress * 100}%`,
            height: "100%",
            background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
            borderRadius: 6,
            transition: "width 0.6s ease",
          }}
        />
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
export default function ProgressDashboard({ state, onReset }) {
  const { current, next, progress, xpIntoLevel, xpNeeded } = getLevelInfo(
    state.totalXP
  );

  const statCards = [
    { label: "Total XP",       value: state.totalXP,        icon: "⚡" },
    { label: "Games Played",   value: state.gamesPlayed,    icon: "🎮" },
    { label: "Best Streak",    value: `${state.bestStreak}🔥`, icon: "🏅" },
    { label: "Words Spelled",  value: state.wordsSpelled,   icon: "📚" },
    { label: "Focus Best",     value: `${state.focusHighScore}pts`, icon: "🎯" },
    { label: "Word Best",      value: `${state.wordHighScore}pts`,  icon: "🔤" },
  ];

  return (
    <div
      style={{
        maxWidth: 460,
        margin: "0 auto",
        padding: 24,
        fontFamily: "'Segoe UI', sans-serif",
      }}
    >
      <h2 style={{ textAlign: "center", fontSize: 22, fontWeight: 700, marginBottom: 20 }}>
        📊 My Progress
      </h2>

      {/* ── Level card ────────────────────────────────────────────────── */}
      <div
        style={{
          background: "#f5f3ff",
          border: "2px solid #c4b5fd",
          borderRadius: 18,
          padding: "20px 24px",
          marginBottom: 20,
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 48, marginBottom: 4 }}>{current.badge}</div>
        <div style={{ fontSize: 20, fontWeight: 800, color: "#4f46e5" }}>
          Level {current.level} — {current.title}
        </div>
        <div style={{ color: "#6b7280", fontSize: 13, marginBottom: 14 }}>
          {state.totalXP} total XP
        </div>
        <XPBar
          progress={progress}
          xpIntoLevel={xpIntoLevel}
          xpNeeded={xpNeeded}
          next={next}
        />
      </div>

      {/* ── Stat grid ─────────────────────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 10,
          marginBottom: 20,
        }}
      >
        {statCards.map((card) => (
          <div
            key={card.label}
            style={{
              background: "#f9fafb",
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              padding: "12px 8px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 20, marginBottom: 4 }}>{card.icon}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#1f2937" }}>
              {card.value}
            </div>
            <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>
              {card.label}
            </div>
          </div>
        ))}
      </div>

      {/* ── Recent activity chart ─────────────────────────────────────── */}
      <div
        style={{
          background: "#f9fafb",
          border: "1px solid #e5e7eb",
          borderRadius: 14,
          padding: "16px 16px 8px",
          marginBottom: 20,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <span style={{ fontWeight: 600, fontSize: 14 }}>Recent Games</span>
          <div style={{ display: "flex", gap: 10, fontSize: 12, color: "#6b7280" }}>
            <span>
              <span style={{ color: "#818cf8" }}>█</span> Focus
            </span>
            <span>
              <span style={{ color: "#34d399" }}>█</span> Words
            </span>
          </div>
        </div>
        <HistoryChart history={state.history} />
      </div>

      {/* ── Badges ───────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 20 }}>
        <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 12 }}>
          Badges ({state.unlockedBadges.length}/{BADGES.length})
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 8,
          }}
        >
          {BADGES.map((badge) => {
            const unlocked = state.unlockedBadges.includes(badge.id);
            return (
              <div
                key={badge.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: "1px solid",
                  borderColor: unlocked ? "#a5b4fc" : "#e5e7eb",
                  background: unlocked ? "#eef2ff" : "#f9fafb",
                  opacity: unlocked ? 1 : 0.5,
                  transition: "all 0.3s",
                }}
              >
                <span style={{ fontSize: 22, filter: unlocked ? "none" : "grayscale(1)" }}>
                  {badge.icon}
                </span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: unlocked ? "#3730a3" : "#9ca3af" }}>
                    {badge.label}
                  </div>
                  <div style={{ fontSize: 11, color: "#9ca3af" }}>{badge.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Level roadmap ─────────────────────────────────────────────── */}
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 12 }}>
          Level Roadmap
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {LEVELS.map((lv) => {
            const reached = state.totalXP >= lv.minXP;
            const isCurrent = lv.level === current.level;
            return (
              <div
                key={lv.level}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "8px 14px",
                  borderRadius: 10,
                  border: "1px solid",
                  borderColor: isCurrent ? "#6366f1" : "#e5e7eb",
                  background: isCurrent ? "#eef2ff" : reached ? "#f0fdf4" : "#f9fafb",
                }}
              >
                <span style={{ fontSize: 20 }}>{lv.badge}</span>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 14, fontWeight: isCurrent ? 700 : 500, color: reached ? "#1f2937" : "#9ca3af" }}>
                    Level {lv.level} — {lv.title}
                  </span>
                </div>
                <span style={{ fontSize: 12, color: "#6b7280" }}>
                  {lv.minXP} XP
                </span>
                {reached && <span style={{ fontSize: 16 }}>✅</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Reset button (for testing) */}
      <div style={{ textAlign: "center" }}>
        <button
          onClick={onReset}
          style={{
            padding: "8px 20px",
            borderRadius: 10,
            border: "1px solid #fca5a5",
            background: "#fff1f2",
            color: "#b91c1c",
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          🗑 Reset Progress
        </button>
      </div>
    </div>
  );
}