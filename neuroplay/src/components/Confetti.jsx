// src/components/Confetti.jsx
import { useEffect, useState } from "react";

const COLORS = ["#6366f1","#34d399","#fbbf24","#f472b6","#60a5fa","#fb923c"];

function randomBetween(a, b) { return a + Math.random() * (b - a); }

export default function Confetti({ trigger }) {
  const [pieces, setPieces] = useState([]);

  useEffect(() => {
    if (!trigger) return;
    setPieces(
      Array.from({ length: 32 }, (_, i) => ({
        id: i,
        x: randomBetween(10, 90),      // % from left
        color: COLORS[i % COLORS.length],
        size: randomBetween(7, 13),
        delay: randomBetween(0, 0.4),
        duration: randomBetween(0.9, 1.5),
        rotate: randomBetween(0, 360),
      }))
    );
    const t = setTimeout(() => setPieces([]), 2000);
    return () => clearTimeout(t);
  }, [trigger]);

  if (pieces.length === 0) return null;

  return (
    <>
      <style>{`
        @keyframes confettiFall {
          0%   { transform: translateY(-10px) rotate(0deg);   opacity: 1; }
          100% { transform: translateY(160px) rotate(720deg); opacity: 0; }
        }
      `}</style>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, overflow: "hidden", pointerEvents: "none", height: 180, zIndex: 50 }}>
        {pieces.map((p) => (
          <div
            key={p.id}
            style={{
              position: "absolute",
              left: `${p.x}%`,
              top: 0,
              width: p.size,
              height: p.size,
              borderRadius: p.id % 3 === 0 ? "50%" : 2,
              background: p.color,
              animation: `confettiFall ${p.duration}s ${p.delay}s ease-in forwards`,
            }}
          />
        ))}
      </div>
    </>
  );
}