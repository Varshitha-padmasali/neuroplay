// src/hooks/useGameState.js
// Shared gamification hook — used by both FocusTapGame and WordBuilderGame
// Persists progress to localStorage so it survives page refreshes

import { useState, useEffect, useCallback } from "react";

// ── XP level thresholds ───────────────────────────────────────────────────
export const LEVELS = [
  { level: 1, title: "Beginner",   minXP: 0,    badge: "🌱", color: "#86efac" },
  { level: 2, title: "Explorer",   minXP: 100,  badge: "🔍", color: "#93c5fd" },
  { level: 3, title: "Challenger", minXP: 250,  badge: "⚡", color: "#fcd34d" },
  { level: 4, title: "Pro",        minXP: 500,  badge: "🚀", color: "#f9a8d4" },
  { level: 5, title: "Champion",   minXP: 1000, badge: "🏆", color: "#fb923c" },
];

// ── Badges unlocked by achievements ───────────────────────────────────────
export const BADGES = [
  { id: "first_focus",  label: "First Tap",     icon: "🎯", desc: "Complete your first Focus Tap game"   },
  { id: "first_word",   label: "First Word",     icon: "🔤", desc: "Complete your first Word Builder game" },
  { id: "score_100",    label: "Century",        icon: "💯", desc: "Score 100+ points in a single game"   },
  { id: "score_200",    label: "Double Century", icon: "🌟", desc: "Score 200+ points in a single game"   },
  { id: "streak_3",     label: "On Fire",        icon: "🔥", desc: "Play 3 games in a row"                },
  { id: "words_10",     label: "Word Wizard",    icon: "📚", desc: "Spell 10 words correctly"             },
  { id: "focus_master", label: "Focus Master",   icon: "🧠", desc: "Score 80+ in Focus Tap"              },
];

const STORAGE_KEY = "neuroplay_state";

// ── Default state ──────────────────────────────────────────────────────────
function defaultState() {
  return {
    totalXP: 0,
    gamesPlayed: 0,
    currentStreak: 0,
    bestStreak: 0,
    wordsSpelled: 0,
    unlockedBadges: [],
    history: [],          // last 20 game results
    focusHighScore: 0,
    wordHighScore: 0,
  };
}

// ── Derive level from XP ───────────────────────────────────────────────────
export function getLevelInfo(xp) {
  let current = LEVELS[0];
  let next = LEVELS[1];
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXP) {
      current = LEVELS[i];
      next = LEVELS[i + 1] || null;
      break;
    }
  }
  const xpIntoLevel = xp - current.minXP;
  const xpNeeded = next ? next.minXP - current.minXP : 1;
  const progress = next ? Math.min(1, xpIntoLevel / xpNeeded) : 1;
  return { current, next, progress, xpIntoLevel, xpNeeded };
}

// ══════════════════════════════════════════════════════════════════════════
export function useGameState() {
  const [state, setState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...defaultState(), ...JSON.parse(saved) } : defaultState();
    } catch {
      return defaultState();
    }
  });

  // Persist to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // ── Record a completed game ──────────────────────────────────────────────
  const recordGame = useCallback(({ gameType, score, wordsSpelled = 0 }) => {
    setState((prev) => {
      const newXP           = prev.totalXP + score;
      const newGames        = prev.gamesPlayed + 1;
      const newStreak       = prev.currentStreak + 1;
      const newBestStreak   = Math.max(prev.bestStreak, newStreak);
      const newWordsSpelled = prev.wordsSpelled + wordsSpelled;
      const newFocusHS      = gameType === "focus" ? Math.max(prev.focusHighScore, score) : prev.focusHighScore;
      const newWordHS       = gameType === "word"  ? Math.max(prev.wordHighScore,  score) : prev.wordHighScore;

      // ── Check badge unlocks ────────────────────────────────────────────
      const earned = new Set(prev.unlockedBadges);
      if (gameType === "focus") earned.add("first_focus");
      if (gameType === "word")  earned.add("first_word");
      if (score >= 100)         earned.add("score_100");
      if (score >= 200)         earned.add("score_200");
      if (newStreak >= 3)       earned.add("streak_3");
      if (newWordsSpelled >= 10) earned.add("words_10");
      if (gameType === "focus" && score >= 80) earned.add("focus_master");

      const newlyUnlocked = [...earned].filter(
        (b) => !prev.unlockedBadges.includes(b)
      );

      // ── History entry (keep last 20) ───────────────────────────────────
      const historyEntry = {
        gameType,
        score,
        date: new Date().toISOString(),
      };
      const newHistory = [historyEntry, ...prev.history].slice(0, 20);

      return {
        ...prev,
        totalXP:        newXP,
        gamesPlayed:    newGames,
        currentStreak:  newStreak,
        bestStreak:     newBestStreak,
        wordsSpelled:   newWordsSpelled,
        focusHighScore: newFocusHS,
        wordHighScore:  newWordHS,
        unlockedBadges: [...earned],
        history:        newHistory,
        _newlyUnlocked: newlyUnlocked,   // transient — used for toast
      };
    });
  }, []);

  // ── Reset streak (called when user skips a day — optional) ──────────────
  const resetStreak = useCallback(() => {
    setState((prev) => ({ ...prev, currentStreak: 0 }));
  }, []);

  // ── Full reset (dev/testing) ───────────────────────────────────────────
  const resetAll = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState(defaultState());
  }, []);

  return { state, recordGame, resetStreak, resetAll, getLevelInfo };
}