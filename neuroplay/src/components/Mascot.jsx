// src/components/Mascot.jsx
// A simple CSS-animated mascot that reacts to game state
import { useEffect, useState } from "react";

const MOODS = {
  idle:    { face: "🤖", msg: "Ready to play?",          bounce: false },
  playing: { face: "👀", msg: "Stay focused!",            bounce: true  },
  correct: { face: "🥳", msg: "Nailed it!",               bounce: true  },
  wrong:   { face: "😅", msg: "Almost — try again!",      bounce: false },
  done:    { face: "🏆", msg: "You crushed it!",          bounce: true  },
};

export default function Mascot({ mood = "idle" }) {
  const [visible, setVisible] = useState(true);
  const current = MOODS[mood] || MOODS.idle;

  // Re-animate on mood change
  useEffect(() => {
    setVisible(false);
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, [mood]);

  return (
    <>
      <style>{`
        @keyframes bounce {
          0%,100% { transform: translateY(0); }
          40%      { transform: translateY(-10px); }
          60%      { transform: translateY(-6px); }
        }
        @keyframes popIn {
          from { transform: scale(0.6); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }
        .mascot-face {
          animation: ${current.bounce ? "bounce 0.7s ease infinite" : "popIn 0.25s ease"};
        }
      `}</style>
      <div style={{
        display: "flex", flexDirection: "column",
        alignItems: "center", gap: 4, marginBottom: 12,
        opacity: visible ? 1 : 0, transition: "opacity 0.08s",
      }}>
        <span className="mascot-face" style={{ fontSize: 40, display: "block" }}>
          {current.face}
        </span>
        <span style={{
          fontSize: 12, color: "#6b7280",
          background: "#f3f4f6", borderRadius: 20,
          padding: "2px 12px",
        }}>
          {current.msg}
        </span>
      </div>
    </>
  );
}