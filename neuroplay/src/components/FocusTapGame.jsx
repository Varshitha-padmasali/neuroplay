// src/components/FocusTapGame.jsx
import { useState, useEffect, useRef } from "react";

// The "correct" symbol the player must tap
const TARGET_SYMBOL = "⭐";

// Pool of distractors
const DISTRACTORS = ["🔶", "🔷", "🔺", "🟣", "🟤", "🔴", "🟡"];

// How many symbols appear on screen at once
const GRID_SIZE = 9;

// Game duration in seconds
const GAME_DURATION = 30;

// --- Helper: build a fresh grid ---
function buildGrid() {
  const positions = Array.from({ length: GRID_SIZE }, (_, i) => i);
  // Pick 2–4 random positions for the target
  const targetCount = Math.floor(Math.random() * 3) + 2;
  const targetPositions = new Set();
  while (targetPositions.size < targetCount) {
    targetPositions.add(Math.floor(Math.random() * GRID_SIZE));
  }
  return positions.map((i) => ({
    id: i,
    symbol: targetPositions.has(i)
      ? TARGET_SYMBOL
      : DISTRACTORS[Math.floor(Math.random() * DISTRACTORS.length)],
    tapped: false,
  }));
}

export default function FocusTapGame({ onGameEnd }) {
  const [phase, setPhase] = useState("idle"); // idle | playing | done
  const [grid, setGrid] = useState([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [feedback, setFeedback] = useState(null); // "correct" | "wrong"
  const timerRef = useRef(null);

  // --- Start game ---
  function startGame() {
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setGrid(buildGrid());
    setPhase("playing");
  }

  // --- Countdown timer ---
  useEffect(() => {
    if (phase !== "playing") return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setPhase("done");
          if (onGameEnd) onGameEnd(score); 
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase]);

  // --- Refresh grid every 4 seconds so symbols shuffle ---
  useEffect(() => {
    if (phase !== "playing") return;
    const id = setInterval(() => setGrid(buildGrid()), 4000);
    return () => clearInterval(id);
  }, [phase]);

  // --- Handle a tap ---
  function handleTap(cell) {
    if (phase !== "playing" || cell.tapped) return;

    const isCorrect = cell.symbol === TARGET_SYMBOL;
    setScore((s) => (isCorrect ? s + 10 : Math.max(0, s - 5)));
    setFeedback(isCorrect ? "correct" : "wrong");
    setTimeout(() => setFeedback(null), 400);

    // Mark cell as tapped so it dims
    setGrid((g) =>
      g.map((c) => (c.id === cell.id ? { ...c, tapped: true } : c))
    );
  }

  // --- Styles (inline, ADHD-friendly: high contrast, no clutter) ---
  const containerStyle = {
    maxWidth: 420,
    margin: "0 auto",
    padding: 24,
    fontFamily: "'Segoe UI', sans-serif",
    textAlign: "center",
  };

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 12,
    margin: "24px 0",
  };

  const cellStyle = (cell) => ({
    fontSize: 48,
    padding: 16,
    borderRadius: 16,
    cursor: cell.tapped ? "default" : "pointer",
    background: cell.tapped ? "#e5e7eb" : "#f9fafb",
    border: "2px solid #e5e7eb",
    opacity: cell.tapped ? 0.3 : 1,
    transition: "all 0.15s ease",
    userSelect: "none",
  });

  const timerColor = timeLeft <= 10 ? "#ef4444" : "#10b981";

  return (
    <div style={containerStyle}>
      {/* Header */}
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
        🎯 Focus Tap
      </h2>
      <p style={{ color: "#6b7280", marginBottom: 16 }}>
        Tap only <strong>{TARGET_SYMBOL}</strong> — ignore everything else!
      </p>

      {/* Idle state */}
      {phase === "idle" && (
        <button
          onClick={startGame}
          style={{
            background: "#6366f1",
            color: "#fff",
            border: "none",
            borderRadius: 12,
            padding: "14px 36px",
            fontSize: 18,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Start Game
        </button>
      )}

      {/* Playing state */}
      {phase === "playing" && (
        <>
          {/* HUD */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "#f3f4f6",
              borderRadius: 12,
              padding: "10px 20px",
            }}
          >
            <span style={{ fontWeight: 700, fontSize: 18 }}>
              ⭐ {score} pts
            </span>
            <span
              style={{ fontWeight: 700, fontSize: 18, color: timerColor }}
            >
              ⏱ {timeLeft}s
            </span>
          </div>

          {/* Feedback flash */}
          {feedback && (
            <div
              style={{
                margin: "8px 0",
                fontSize: 18,
                fontWeight: 700,
                color: feedback === "correct" ? "#10b981" : "#ef4444",
              }}
            >
              {feedback === "correct" ? "✓ +10" : "✗ −5"}
            </div>
          )}

          {/* Symbol grid */}
          <div style={gridStyle}>
            {grid.map((cell) => (
              <button
                key={cell.id}
                style={cellStyle(cell)}
                onClick={() => handleTap(cell)}
              >
                {cell.symbol}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Done state */}
      {phase === "done" && (
        <div>
          <div style={{ fontSize: 56, marginBottom: 8 }}>🏆</div>
          <h3 style={{ fontSize: 24, fontWeight: 700 }}>
            Time's up! You scored {score} points
          </h3>
          <p style={{ color: "#6b7280", marginBottom: 20 }}>
            {score >= 80
              ? "Amazing focus! 🌟"
              : score >= 40
              ? "Good effort! Keep practicing 💪"
              : "Don't give up — try again! 🎯"}
          </p>
          <button
            onClick={startGame}
            style={{
              background: "#6366f1",
              color: "#fff",
              border: "none",
              borderRadius: 12,
              padding: "14px 36px",
              fontSize: 18,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
}