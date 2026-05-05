// src/components/DifficultyNudge.jsx
import { useEffect, useState } from "react";

export default function DifficultyNudge({ recommendation, onAccept, onDismiss }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (recommendation) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [recommendation]);

  if (!recommendation) return null;

  const isHarder = recommendation === "harder";

  return (
    <>
      <style>{`
        @keyframes slideDown {
          from { transform: translateY(-20px); opacity: 0; }
          to   { transform: translateY(0);     opacity: 1; }
        }
      `}</style>
      <div style={{
        animation: "slideDown 0.35s cubic-bezier(0.34,1.56,0.64,1)",
        background: isHarder ? "#eef2ff" : "#fefce8",
        border: `2px solid ${isHarder ? "#a5b4fc" : "#fde68a"}`,
        borderRadius: 16, padding: "14px 16px",
        marginBottom: 16, display: "flex",
        alignItems: "center", gap: 12,
      }}>
        <span style={{ fontSize: 28 }}>{isHarder ? "🚀" : "🌱"}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: isHarder ? "#3730a3" : "#92400e" }}>
            {isHarder ? "You're doing great!" : "Let's slow it down a bit"}
          </div>
          <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
            {isHarder
              ? "Ready to try a harder level? 💪"
              : "An easier level might feel better right now 😊"}
          </div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={onAccept} style={{
            padding: "7px 14px", borderRadius: 10, border: "none",
            background: isHarder ? "#6366f1" : "#f59e0b",
            color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer",
          }}>
            Yes!
          </button>
          <button onClick={onDismiss} style={{
            padding: "7px 10px", borderRadius: 10, border: "1px solid #e5e7eb",
            background: "#fff", color: "#6b7280", fontSize: 13, cursor: "pointer",
          }}>
            ✕
          </button>
        </div>
      </div>
    </>
  );
}