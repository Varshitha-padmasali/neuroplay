// src/components/PerformanceHUD.jsx
// Shows live accuracy + avg response time during a game session

export default function PerformanceHUD({ sessionStats, difficulty, config }) {
    const { attempts, correct, responseTimes } = sessionStats;
    if (attempts === 0) return null;
    const accuracy    = Math.round((correct / attempts) * 100);
    const avgResponse = responseTimes.length
      ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
      : 0;
    // Colour-code accuracy
    const accColor = accuracy >= 80 ? "#10b981" : accuracy >= 50 ? "#f59e0b" : "#ef4444";
    return (
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "center",
        background: "#f9fafb", border: "1px solid #e5e7eb",
        borderRadius: 10, padding: "7px 14px",
        fontSize: 12, marginBottom: 10,
      }}>
        {/* Accuracy */}
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span>🎯</span>
          <span style={{ fontWeight: 700, color: accColor }}>{accuracy}%</span>
          <span style={{ color: "#9ca3af" }}>accuracy</span>
        </div>
  
        {/* Difficulty badge */}
        <div style={{
          padding: "2px 10px", borderRadius: 12,
          background: config.color + "33",
          color: "#374151", fontWeight: 700, fontSize: 11,
        }}>
          {config.label}
        </div>
        {/* Response time */}
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span>⚡</span>
          <span style={{ fontWeight: 700, color: "#6366f1" }}>
            {avgResponse > 0 ? `${(avgResponse / 1000).toFixed(1)}s` : "—"}
          </span>
          <span style={{ color: "#9ca3af" }}>avg</span>
        </div>
      </div>
    );
  }