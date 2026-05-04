// src/hooks/useAdaptiveEngine.js
// Tracks performance signals and outputs a difficulty recommendation
// Works for BOTH games — FocusTap and WordBuilder

import { useState, useRef, useCallback } from "react";

// ── Difficulty config per level ────────────────────────────────────────────
export const DIFFICULTY = {
  1: {
    label:          "Easy",
    color:          "#86efac",
    // FocusTap settings
    gridSize:       9,
    targetCount:    3,       // how many correct symbols on screen
    refreshRate:    5000,    // ms between grid shuffles
    gameDuration:   45,      // seconds
    // WordBuilder settings
    wordLevel:      1,
    hintVisible:    true,    // show emoji hint
    autoSpeak:      true,    // auto-pronounce word
  },
  2: {
    label:          "Medium",
    color:          "#fcd34d",
    gridSize:       9,
    targetCount:    2,
    refreshRate:    3500,
    gameDuration:   35,
    wordLevel:      2,
    hintVisible:    true,
    autoSpeak:      true,
  },
  3: {
    label:          "Hard",
    color:          "#fb923c",
    gridSize:       12,      // 4×3 grid
    targetCount:    2,
    refreshRate:    2500,
    gameDuration:   30,
    wordLevel:      3,
    hintVisible:    false,   // no emoji hint — harder
    autoSpeak:      false,   // must tap 🔊 manually
  },
  4: {
    label:          "Expert",
    color:          "#f87171",
    gridSize:       12,
    targetCount:    1,
    refreshRate:    2000,
    gameDuration:   25,
    wordLevel:      3,
    hintVisible:    false,
    autoSpeak:      false,
  },
};

// ── Thresholds that trigger difficulty changes ─────────────────────────────
const RULES = {
  // If accuracy > 85% AND avg response < 1.5s → too easy → bump up
  tooEasy:   { minAccuracy: 0.85, maxResponseMs: 1500 },
  // If accuracy < 50% OR avg response > 4s     → too hard → drop down
  tooHard:   { maxAccuracy: 0.50, minResponseMs: 4000 },
};

// Minimum attempts before we adjust (avoid reacting to 1 data point)
const MIN_SAMPLES = 5;

export function useAdaptiveEngine(initialDifficulty = 1) {
  const [difficulty, setDifficulty]       = useState(initialDifficulty);
  const [recommendation, setRecommendation] = useState(null); // "easier"|"harder"|null
  const [sessionStats, setSessionStats]   = useState({
    attempts: 0, correct: 0, totalResponseMs: 0,
    responseTimes: [],   // rolling window of last 10
    accuracyHistory: [], // rolling window of last 10
  });

  const roundStartTime = useRef(null);

  // ── Call this when a new question/symbol appears ──────────────────────
  const markStart = useCallback(() => {
    roundStartTime.current = performance.now();
  }, []);

  // ── Call this when the user responds (correct or wrong) ──────────────
  const recordAttempt = useCallback((isCorrect) => {
    const responseMs = roundStartTime.current
      ? performance.now() - roundStartTime.current
      : 2000;

    setSessionStats((prev) => {
      const newAttempts  = prev.attempts + 1;
      const newCorrect   = prev.correct + (isCorrect ? 1 : 0);
      const newTotalMs   = prev.totalResponseMs + responseMs;

      // Rolling windows (last 10)
      const responseTimes    = [...prev.responseTimes, responseMs].slice(-10);
      const accuracyHistory  = [...prev.accuracyHistory, isCorrect ? 1 : 0].slice(-10);

      return {
        attempts:        newAttempts,
        correct:         newCorrect,
        totalResponseMs: newTotalMs,
        responseTimes,
        accuracyHistory,
      };
    });
  }, []);

  // ── Analyse and maybe adjust difficulty ──────────────────────────────
  const analyse = useCallback((currentStats, currentDifficulty) => {
    const { attempts, correct, responseTimes, accuracyHistory } = currentStats;
    if (attempts < MIN_SAMPLES) return null;

    const accuracy    = correct / attempts;
    const avgResponse = responseTimes.reduce((a, b) => a + b, 0) / (responseTimes.length || 1);

    // Recent trend: last 5 accuracy
    const recentAcc = accuracyHistory.slice(-5).reduce((a, b) => a + b, 0) / 5;

    let recommendation = null;

    if (
      recentAcc >= RULES.tooEasy.minAccuracy &&
      avgResponse <= RULES.tooEasy.maxResponseMs &&
      currentDifficulty < 4
    ) {
      recommendation = "harder";
    } else if (
      (recentAcc <= RULES.tooHard.maxAccuracy ||
        avgResponse >= RULES.tooHard.minResponseMs) &&
      currentDifficulty > 1
    ) {
      recommendation = "easier";
    }

    return { accuracy, avgResponse, recentAcc, recommendation };
  }, []);

  // ── Apply a difficulty change ─────────────────────────────────────────
  const applyDifficulty = useCallback((direction) => {
    setDifficulty((d) => {
      const next = direction === "harder" ? Math.min(4, d + 1) : Math.max(1, d - 1);
      return next;
    });
    // Reset rolling windows after adjustment so we don't over-correct
    setSessionStats((prev) => ({
      ...prev,
      responseTimes:   [],
      accuracyHistory: [],
    }));
    setRecommendation(null);
  }, []);

  // ── Called after each attempt — runs full analysis ────────────────────
  const checkAndAdjust = useCallback((isCorrect, currentDifficultyOverride) => {
    const responseMs = roundStartTime.current
      ? performance.now() - roundStartTime.current
      : 2000;

    let result = null;

    setSessionStats((prev) => {
      const newAttempts  = prev.attempts + 1;
      const newCorrect   = prev.correct + (isCorrect ? 1 : 0);
      const newTotalMs   = prev.totalResponseMs + responseMs;
      const responseTimes   = [...prev.responseTimes, responseMs].slice(-10);
      const accuracyHistory = [...prev.accuracyHistory, isCorrect ? 1 : 0].slice(-10);

      const next = {
        attempts: newAttempts, correct: newCorrect,
        totalResponseMs: newTotalMs, responseTimes, accuracyHistory,
      };

      result = analyse(next, currentDifficultyOverride ?? difficulty);
      return next;
    });

    // Defer state update so setState above settles first
    setTimeout(() => {
      if (result?.recommendation) {
        setRecommendation(result.recommendation);
      }
    }, 0);

    return result;
  }, [difficulty, analyse]);

  // ── Reset for a new game session ──────────────────────────────────────
  const resetSession = useCallback(() => {
    setSessionStats({
      attempts: 0, correct: 0, totalResponseMs: 0,
      responseTimes: [], accuracyHistory: [],
    });
    setRecommendation(null);
  }, []);

  const config = DIFFICULTY[difficulty] || DIFFICULTY[1];

  return {
    difficulty,
    config,
    recommendation,   // "easier" | "harder" | null
    sessionStats,
    markStart,
    checkAndAdjust,
    applyDifficulty,
    resetSession,
  };
}