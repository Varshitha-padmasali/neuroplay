// src/components/SessionSummary.jsx
import { DIFFICULTY } from "../hooks/useAdaptiveEngine";

export default function SessionSummary({ sessionStats, difficulty, score, gameType, onPlayAgain, onMenu }) {
  const { attempts, correct, responseTimes } = sessionStats;
  const accuracy    = attempts > 0 ? Math.round((correct / attempts) * 100) : 0;
  const avgResponse = responseTimes.length
    ? (responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length / 1000).toFixed(1)
    : "—";

  const config = DIFFICULTY[difficulty] || DIFFICULTY[1];

  // Performance tier
  const tier =
    accuracy >= 85 ? { label: "Excellent! 🌟", color: "#10b981" }
  : accuracy >= 65 ? { label: "Good job! 💪",  color: "#6366f1" }
  : accuracy >= 45 ? { label: "Keep going! 📈", color: "#f59e0b" }
  :                  { label: "Don't give up! ❤️", color: "#ef4444" };

  const bars = [
    { label: "Accuracy",      value: accuracy,                     max: 100, unit: "%",  color: "#6366f1" },
    { label: "Speed score",   value: Math.max(0, 100 - (parseFloat(avgResponse) * 20 || 0)), max: 100, unit: "pts", color: "#34d399" },
    { label: "Attempts made", value: Math.min(attempts, 20),        max: 20,  unit: "",   color: "#fb923c" },
  ];

  return (
    <div style={{ maxWidth: 420, margin: "0 auto", padding: "8px 4px", fontFamily: "'Segoe UI', sans-serif" }}>
      {/* Trophy + tier */}
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div style={{ fontSize: 56, marginBottom: 4 }}>🏁</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: tier.color }}>{tier.label}</div>
        <div style={{ fontSize: 14, color: "#6b7280", marginTop: 4 }}>
          {gameType === "focus" ? "🎯 Focus Tap" : "🔤 Word Builder"} · {config.label} level
        </div>
      </div>

      {/* Score pill */}
      <div style={{
        background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
        color: "#fff", borderRadius: 20,
        padding: "16px 0", textAlign: "center",
        marginBottom: 20,
      }}>
        <div style={{ fontSize: 13, opacity: 0.85, letterSpacing: 1 }}>FINAL SCORE</div>
        <div style={{ fontSize: 48, fontWeight: 800 }}>{score}</div>
        <div style={{ fontSize: 12, opacity: 0.75 }}>points earned</div>
      </div>

      {/* Stat bars */}
      <div style={{ marginBottom: 20 }}>
        {bars.map((bar) => (
          <div key={bar.label} style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 5 }}>
              <span style={{ color: "#4b5563", fontWeight: 600 }}>{bar.label}</span>
              <span style={{ fontWeight: 700, color: bar.color }}>
                {bar.label === "Speed score"
                  ? `${Math.max(0, 100 - Math.round(parseFloat(avgResponse) * 20 || 0))}`
                  : bar.label === "Accuracy"
                  ? accuracy
                  : attempts}{bar.unit}
              </span>
            </div>
            <div style={{ height: 10, background: "#f3f4f6", borderRadius: 5, overflow: "hidden" }}>
              <div style={{
                width: `${(bar.value / bar.max) * 100}%`,
                height: "100%", background: bar.color,
                borderRadius: 5, transition: "width 0.8s ease",
              }}/>
            </div>
          </div>
        ))}
      </div>

      {/* Quick stats row */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
        gap: 8, marginBottom: 24,
      }}>
        {[
          { icon: "✅", label: "Correct",  value: correct   },
          { icon: "❌", label: "Wrong",    value: attempts - correct },
          { icon: "⚡", label: "Avg time", value: `${avgResponse}s` },
        ].map((s) => (
          <div key={s.label} style={{
            background: "#f9fafb", border: "1px solid #e5e7eb",
            borderRadius: 12, padding: "10px 6px", textAlign: "center",
          }}>
            <div style={{ fontSize: 20 }}>{s.icon}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#1f2937" }}>{s.value}</div>
            <div style={{ fontSize: 11, color: "#9ca3af" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={onMenu} style={{
          flex: 1, padding: "13px 0", borderRadius: 12,
          border: "1px solid #e5e7eb", background: "#f9fafb",
          color: "#374151", fontWeight: 700, fontSize: 15, cursor: "pointer",
        }}>
          🏠 Menu
        </button>
        <button onClick={onPlayAgain} style={{
          flex: 2, padding: "13px 0", borderRadius: 12,
          border: "none", background: "#6366f1",
          color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer",
        }}>
          🔄 Play Again
        </button>
      </div>
    </div>
  );
}