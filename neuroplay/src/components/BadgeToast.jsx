// src/components/BadgeToast.jsx
import { useEffect, useState } from "react";
import { BADGES } from "../hooks/useGameState";

export default function BadgeToast({ badgeId, onDone }) {
  const [visible, setVisible] = useState(true);
  const badge = BADGES.find((b) => b.id === badgeId);

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(onDone, 300);
    }, 2800);
    return () => clearTimeout(t);
  }, [onDone]);

  if (!badge) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 32,
        left: "50%",
        transform: `translateX(-50%) translateY(${visible ? 0 : "80px"})`,
        opacity: visible ? 1 : 0,
        transition: "all 0.35s cubic-bezier(0.34,1.56,0.64,1)",
        background: "#1e1b4b",
        color: "#fff",
        borderRadius: 18,
        padding: "14px 24px",
        display: "flex",
        alignItems: "center",
        gap: 14,
        boxShadow: "0 8px 32px rgba(99,102,241,0.35)",
        zIndex: 1000,
        minWidth: 260,
      }}
    >
      <span style={{ fontSize: 36 }}>{badge.icon}</span>
      <div>
        <div style={{ fontSize: 11, color: "#a5b4fc", fontWeight: 600, letterSpacing: 1 }}>
          BADGE UNLOCKED
        </div>
        <div style={{ fontSize: 16, fontWeight: 700 }}>{badge.label}</div>
        <div style={{ fontSize: 12, color: "#c7d2fe" }}>{badge.desc}</div>
      </div>
    </div>
  );
}