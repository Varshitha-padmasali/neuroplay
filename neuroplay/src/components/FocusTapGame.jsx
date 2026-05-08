// src/components/FocusTapGame.jsx  (Step 5 — adaptive version)
import { useState, useEffect, useRef } from "react";
import { useAdaptiveEngine, DIFFICULTY } from "../hooks/useAdaptiveEngine";
import DifficultyNudge from "./DifficultyNudge";
import PerformanceHUD from "./PerformanceHUD";
import SessionSummary from "./SessionSummary";
import Confetti from "./Confetti";

const TARGET_SYMBOL = "⭐";
const DISTRACTORS   = ["🔶","🔷","🔺","🟣","🟤","🔴","🟡","🔸","🔹","🟠"];

function buildGrid(gridSize, targetCount) {
  const positions = Array.from({ length: gridSize }, (_, i) => i);
  const targetPositions = new Set();
  while (targetPositions.size < Math.min(targetCount, gridSize - 1)) {
    targetPositions.add(Math.floor(Math.random() * gridSize));
  }
  return positions.map((i) => ({
    id: i,
    symbol: targetPositions.has(i)
      ? TARGET_SYMBOL
      : DISTRACTORS[Math.floor(Math.random() * DISTRACTORS.length)],
    tapped: false,
  }));
}

export default function FocusTapGame({ onGameEnd, focusMode }) {
  const {
    difficulty, config, recommendation,
    sessionStats, markStart, checkAndAdjust,
    applyDifficulty, resetSession,
  } = useAdaptiveEngine(1);

  const [phase, setPhase]       = useState("idle");
  const [grid, setGrid]         = useState([]);
  const [score, setScore]       = useState(0);
  const [timeLeft, setTimeLeft] = useState(config.gameDuration);
  const [feedback, setFeedback] = useState(null);
  const [confetti, setConfetti] = useState(false);
  const timerRef                = useRef(null);
  const scoreRef                = useRef(0);  // keep score accessible in closure

  // Keep scoreRef in sync
  useEffect(() => { scoreRef.current = score; }, [score]);

  function startGame() {
    resetSession();
    scoreRef.current = 0;
    setScore(0);
    setTimeLeft(config.gameDuration);
    setGrid(buildGrid(config.gridSize, config.targetCount));
    setPhase("playing");
    markStart();
  }

  // Countdown
  useEffect(() => {
    if (phase !== "playing") return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setConfetti(true);
          setPhase("summary");
          if (onGameEnd) onGameEnd(scoreRef.current);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase]);

  // Grid refresh at adaptive rate
  useEffect(() => {
    if (phase !== "playing") return;
    const id = setInterval(() => {
      setGrid(buildGrid(config.gridSize, config.targetCount));
      markStart();
    }, config.refreshRate);
    return () => clearInterval(id);
  }, [phase, config.gridSize, config.targetCount, config.refreshRate, markStart]);

  function handleTap(cell) {
    if (phase !== "playing" || cell.tapped) return;
    const isCorrect = cell.symbol === TARGET_SYMBOL;
    const delta = isCorrect ? 10 : -5;
    setScore((s) => Math.max(0, s + delta));
    setFeedback(isCorrect ? "correct" : "wrong");
    setTimeout(() => { setFeedback(null); markStart(); }, 400);
    setGrid((g) => g.map((c) => c.id === cell.id ? { ...c, tapped: true } : c));

    // Feed the engine
    checkAndAdjust(isCorrect);
  }

  const cols   = config.gridSize === 12 ? 4 : 3;
  const accent = focusMode ? "#4b5563" : "#6366f1";

  return (
    <div style={{ maxWidth: 440, margin: "0 auto", padding: 24, fontFamily: "'Segoe UI', sans-serif", textAlign: "center" }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>🎯 Focus Tap</h2>
      <p style={{ color: "#6b7280", marginBottom: 16 }}>
        Tap only <strong>{TARGET_SYMBOL}</strong> — ignore everything else!
      </p>

      {phase === "idle" && (
        <button onClick={startGame} style={{ background: accent, color: "#fff", border: "none", borderRadius: 12, padding: "14px 36px", fontSize: 18, fontWeight: 600, cursor: "pointer" }}>
          Start Game
        </button>
      )}

      {phase === "playing" && (
        <>
          {/* Adaptive nudge */}
          {recommendation && (
            <DifficultyNudge
              recommendation={recommendation}
              onAccept={() => applyDifficulty(recommendation)}
              onDismiss={() => applyDifficulty(null)}
            />
          )}

          {/* HUD */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f3f4f6", borderRadius: 12, padding: "10px 20px", marginBottom: 8 }}>
            <span style={{ fontWeight: 700, fontSize: 18 }}>⭐ {score} pts</span>
            <span style={{ fontWeight: 700, fontSize: 18, color: timeLeft <= 10 ? "#ef4444" : "#10b981" }}>⏱ {timeLeft}s</span>
          </div>

          {/* Live performance HUD */}
          <PerformanceHUD sessionStats={sessionStats} difficulty={difficulty} config={config} />

          {/* Feedback */}
          {feedback && (
            <div style={{ margin: "6px 0", fontSize: 18, fontWeight: 700, color: feedback === "correct" ? "#10b981" : "#ef4444" }}>
              {feedback === "correct" ? "✓ +10" : "✗ −5"}
            </div>
          )}

          {/* Grid */}
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 10, margin: "16px 0" }}>
            {grid.map((cell) => (
              <button key={cell.id} onClick={() => handleTap(cell)} style={{
                fontSize: cols === 4 ? 36 : 44, padding: 12, borderRadius: 14,
                cursor: cell.tapped ? "default" : "pointer",
                background: cell.tapped ? "#e5e7eb" : "#f9fafb",
                border: "2px solid #e5e7eb",
                opacity: cell.tapped ? 0.25 : 1,
                transition: "opacity 0.15s",
                userSelect: "none",
              }}>
                {cell.symbol}
              </button>
            ))}
          </div>
        </>
      )}

      {phase === "summary" && (
        <div style={{ position: "relative" }}>
          <Confetti trigger={confetti} />
          <SessionSummary
            sessionStats={sessionStats}
            difficulty={difficulty}
            score={score}
            gameType="focus"
            onPlayAgain={startGame}
            onMenu={() => setPhase("idle")}
          />
        </div>
      )}
    </div>
  );
}