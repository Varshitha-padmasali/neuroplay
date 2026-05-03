// src/components/WordBuilderGame.jsx
import { useState, useEffect, useCallback } from "react";
import { WORD_LEVELS } from "../data/words";

// ── Audio via Web Speech API (no library needed) ──────────────────────────
function speak(text) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel(); // stop any ongoing speech
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.85;   // slightly slower — easier for dyslexic learners
  utterance.pitch = 1.1;
  window.speechSynthesis.speak(utterance);
}

// ── Shuffle helper ─────────────────────────────────────────────────────────
function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

// ── Build letter tile objects from a word ─────────────────────────────────
function buildTiles(word) {
  return shuffle(
    word.split("").map((letter, i) => ({
      id: `${letter}-${i}`,
      letter,
    }))
  );
}

// ── Pick a random word from a given level ─────────────────────────────────
function pickWord(level) {
  const pool = WORD_LEVELS[level] || WORD_LEVELS[1];
  return pool[Math.floor(Math.random() * pool.length)];
}

// ══════════════════════════════════════════════════════════════════════════
export default function WordBuilderGame({ onGameEnd }) {
  const [level, setLevel]           = useState(1);
  const [phase, setPhase]           = useState("idle");   // idle|playing|correct|wrong|done
  const [current, setCurrent]       = useState(null);     // { word, hint, speak }
  const [bank, setBank]             = useState([]);        // remaining letter tiles
  const [answer, setAnswer]         = useState([]);        // placed letter tiles
  const [score, setScore]           = useState(0);
  const [wordsCompleted, setWordsCompleted] = useState(0);
  const [shake, setShake]           = useState(false);
  const WORDS_PER_GAME = 5;

  // ── Start / next word ────────────────────────────────────────────────────
  const startRound = useCallback((currentLevel, currentScore, completed) => {
    const wordObj = pickWord(currentLevel);
    setCurrent(wordObj);
    setBank(buildTiles(wordObj.word));
    setAnswer([]);
    setPhase("playing");
    // Auto-pronounce the word when it appears
    setTimeout(() => speak(wordObj.speak), 300);
  }, []);

  function startGame() {
    setScore(0);
    setWordsCompleted(0);
    startRound(level, 0, 0);
  }

  // ── Place a letter from bank → answer ────────────────────────────────────
  function placeLetter(tile) {
    if (phase !== "playing") return;
    setAnswer((a) => [...a, tile]);
    setBank((b) => b.filter((t) => t.id !== tile.id));
  }

  // ── Remove a letter from answer → back to bank ───────────────────────────
  function removeLetter(tile) {
    if (phase !== "playing") return;
    setBank((b) => [...b, tile]);
    setAnswer((a) => a.filter((t) => t.id !== tile.id));
  }

  // ── Check answer ──────────────────────────────────────────────────────────
  function checkAnswer() {
    if (answer.length !== current.word.length) return;
    const built = answer.map((t) => t.letter).join("");
    if (built === current.word) {
      const points = level * 20;
      const newScore = score + points;
      const newCompleted = wordsCompleted + 1;
      setScore(newScore);
      setWordsCompleted(newCompleted);
      setPhase("correct");
      speak("Correct! Well done!");
      setTimeout(() => {
        if (newCompleted >= WORDS_PER_GAME) {
          setPhase("done");
          if (onGameEnd) onGameEnd(score, newCompleted);
        } else {
          // Level up every 2 correct words, max level 3
          const newLevel = Math.min(3, Math.ceil(newCompleted / 2));
          setLevel(newLevel);
          startRound(newLevel, newScore, newCompleted);
        }
      }, 1500);
    } else {
      setPhase("wrong");
      setShake(true);
      speak("Try again!");
      setTimeout(() => {
        setShake(false);
        // Reset answer back to bank, reshuffle
        setBank(buildTiles(current.word));
        setAnswer([]);
        setPhase("playing");
        speak(current.speak); // re-pronounce the word
      }, 1200);
    }
  }

  // ── Clear answer ──────────────────────────────────────────────────────────
  function clearAnswer() {
    setBank(buildTiles(current.word));
    setAnswer([]);
  }

  // ── Keyboard support: Enter = check, Backspace = remove last ─────────────
  useEffect(() => {
    if (phase !== "playing") return;
    function onKey(e) {
      if (e.key === "Enter") checkAnswer();
      if (e.key === "Backspace" && answer.length > 0) {
        removeLetter(answer[answer.length - 1]);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, answer, checkAnswer]);

  // ── Styles ────────────────────────────────────────────────────────────────
  const S = {
    wrap: {
      maxWidth: 460,
      margin: "0 auto",
      padding: 28,
      fontFamily: "'Segoe UI', sans-serif",
      textAlign: "center",
    },
    title: { fontSize: 22, fontWeight: 700, marginBottom: 4 },
    subtitle: { color: "#6b7280", marginBottom: 20, fontSize: 15 },
    hud: {
      display: "flex",
      justifyContent: "space-between",
      background: "#f3f4f6",
      borderRadius: 12,
      padding: "10px 20px",
      marginBottom: 20,
    },
    hudItem: { fontWeight: 700, fontSize: 16 },
    hint: { fontSize: 64, margin: "12px 0 4px" },
    levelBadge: (lv) => ({
      display: "inline-block",
      padding: "3px 14px",
      borderRadius: 20,
      fontSize: 12,
      fontWeight: 700,
      background: lv === 1 ? "#d1fae5" : lv === 2 ? "#fef3c7" : "#fee2e2",
      color:      lv === 1 ? "#065f46" : lv === 2 ? "#92400e" : "#991b1b",
      marginBottom: 16,
    }),
    // Answer zone
    answerZone: {
      minHeight: 72,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      gap: 8,
      background: "#f0fdf4",
      border: "2px dashed #86efac",
      borderRadius: 16,
      padding: "12px 16px",
      marginBottom: 12,
      flexWrap: "wrap",
      animation: shake ? "shake 0.4s ease" : "none",
    },
    emptyHint: { color: "#9ca3af", fontSize: 14, userSelect: "none" },
    // Letter tile
    tile: (inAnswer, isCorrect, isWrong) => ({
      width: 52,
      height: 60,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 26,
      fontWeight: 800,
      // Dyslexia-friendly: OpenDyslexic-style rounded, high contrast
      fontFamily: "'Trebuchet MS', sans-serif",
      borderRadius: 10,
      cursor: "pointer",
      border: "none",
      transition: "transform 0.1s ease, background 0.2s",
      background: isCorrect
        ? "#6ee7b7"
        : isWrong
        ? "#fca5a5"
        : inAnswer
        ? "#6366f1"
        : "#e0e7ff",
      color: inAnswer ? "#fff" : "#3730a3",
      boxShadow: inAnswer
        ? "0 4px 0 #4338ca"
        : "0 4px 0 #c7d2fe",
      transform: "translateY(0)",
    }),
    // Bank zone
    bankZone: {
      minHeight: 72,
      display: "flex",
      justifyContent: "center",
      gap: 8,
      flexWrap: "wrap",
      padding: "12px 8px",
      marginBottom: 20,
    },
    // Buttons row
    btnRow: {
      display: "flex",
      gap: 10,
      justifyContent: "center",
      marginBottom: 16,
    },
    btn: (color) => ({
      padding: "12px 28px",
      borderRadius: 12,
      border: "none",
      fontSize: 15,
      fontWeight: 700,
      cursor: "pointer",
      background: color === "primary" ? "#6366f1" : "#f3f4f6",
      color: color === "primary" ? "#fff" : "#374151",
    }),
    // Pronounce button
    speakBtn: {
      display: "flex",
      alignItems: "center",
      gap: 6,
      margin: "0 auto 20px",
      padding: "9px 22px",
      borderRadius: 24,
      border: "2px solid #a5b4fc",
      background: "#eef2ff",
      color: "#4338ca",
      fontSize: 14,
      fontWeight: 600,
      cursor: "pointer",
    },
    feedback: (type) => ({
      fontSize: 20,
      fontWeight: 700,
      color: type === "correct" ? "#10b981" : "#ef4444",
      marginBottom: 12,
      minHeight: 28,
    }),
    progress: {
      display: "flex",
      gap: 6,
      justifyContent: "center",
      marginBottom: 20,
    },
    dot: (filled) => ({
      width: 12,
      height: 12,
      borderRadius: "50%",
      background: filled ? "#6366f1" : "#e5e7eb",
      transition: "background 0.3s",
    }),
  };

  return (
    <div style={S.wrap}>
      {/* Shake keyframes injected via style tag */}
      <style>{`
        @keyframes shake {
          0%,100%{transform:translateX(0)}
          20%{transform:translateX(-8px)}
          40%{transform:translateX(8px)}
          60%{transform:translateX(-6px)}
          80%{transform:translateX(6px)}
        }
        button:hover { opacity: 0.88; transform: translateY(-1px); }
      `}</style>

      <h2 style={S.title}>🔤 Word Builder</h2>
      <p style={S.subtitle}>Arrange the letters to spell the word!</p>

      {/* ── IDLE ─────────────────────────────────────────────────────────── */}
      {phase === "idle" && (
        <div>
          <p style={{ color: "#4b5563", marginBottom: 12 }}>
            You'll see a picture clue 🖼️ and hear the word 🔊<br />
            then arrange the letters to spell it!
          </p>
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 13, color: "#9ca3af", marginBottom: 8 }}>Choose starting level:</p>
            {[1, 2, 3].map((lv) => (
              <button
                key={lv}
                onClick={() => setLevel(lv)}
                style={{
                  ...S.btn(level === lv ? "primary" : "secondary"),
                  marginRight: 8,
                  padding: "8px 20px",
                }}
              >
                {lv === 1 ? "🟢 Easy" : lv === 2 ? "🟡 Medium" : "🔴 Hard"}
              </button>
            ))}
          </div>
          <button onClick={startGame} style={S.btn("primary")}>
            Start Game
          </button>
        </div>
      )}

      {/* ── PLAYING / CORRECT / WRONG ─────────────────────────────────────── */}
      {(phase === "playing" || phase === "correct" || phase === "wrong") && current && (
        <>
          {/* HUD */}
          <div style={S.hud}>
            <span style={S.hudItem}>⭐ {score} pts</span>
            <span style={S.hudItem}>
              {wordsCompleted}/{WORDS_PER_GAME} words
            </span>
            <span style={{ ...S.levelBadge(level) }}>
              Level {level}
            </span>
          </div>

          {/* Progress dots */}
          <div style={S.progress}>
            {Array.from({ length: WORDS_PER_GAME }).map((_, i) => (
              <div key={i} style={S.dot(i < wordsCompleted)} />
            ))}
          </div>

          {/* Emoji hint + pronounce */}
          <div style={S.hint}>{current.hint}</div>
          <button style={S.speakBtn} onClick={() => speak(current.speak)}>
            🔊 Hear the word
          </button>

          {/* Feedback line */}
          <div style={S.feedback(phase)}>
            {phase === "correct" && "✅ Correct! Amazing!"}
            {phase === "wrong" && "❌ Not quite — try again!"}
          </div>

          {/* Answer zone */}
          <div style={S.answerZone}>
            {answer.length === 0 ? (
              <span style={S.emptyHint}>Tap letters below to build the word</span>
            ) : (
              answer.map((tile) => (
                <button
                  key={tile.id}
                  style={S.tile(true, phase === "correct", phase === "wrong")}
                  onClick={() => removeLetter(tile)}
                >
                  {tile.letter}
                </button>
              ))
            )}
          </div>

          {/* Letter bank */}
          <div style={S.bankZone}>
            {bank.map((tile) => (
              <button
                key={tile.id}
                style={S.tile(false, false, false)}
                onClick={() => placeLetter(tile)}
              >
                {tile.letter}
              </button>
            ))}
          </div>

          {/* Action buttons */}
          <div style={S.btnRow}>
            <button style={S.btn("secondary")} onClick={clearAnswer}>
              🔄 Reset
            </button>
            <button
              style={{
                ...S.btn("primary"),
                opacity: answer.length === current.word.length ? 1 : 0.4,
                cursor: answer.length === current.word.length ? "pointer" : "not-allowed",
              }}
              onClick={checkAnswer}
              disabled={answer.length !== current.word.length}
            >
              ✅ Check
            </button>
          </div>

          <p style={{ fontSize: 12, color: "#9ca3af" }}>
            Tip: Press Enter to check, Backspace to remove last letter
          </p>
        </>
      )}

      {/* ── DONE ─────────────────────────────────────────────────────────── */}
      {phase === "done" && (
        <div>
          <div style={{ fontSize: 64, marginBottom: 8 }}>🎉</div>
          <h3 style={{ fontSize: 24, fontWeight: 700 }}>
            You finished! Score: {score}
          </h3>
          <p style={{ color: "#6b7280", marginBottom: 24 }}>
            {score >= 80
              ? "Word wizard! Absolutely brilliant! 🌟"
              : score >= 50
              ? "Great reading skills! Keep it up! 📚"
              : "Nice try — every word gets easier! 💪"}
          </p>
          <div style={S.btnRow}>
            <button
              style={S.btn("secondary")}
              onClick={() => setPhase("idle")}
            >
              Change Level
            </button>
            <button style={S.btn("primary")} onClick={startGame}>
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}