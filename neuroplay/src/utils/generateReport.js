// src/utils/generateReport.js
// Generates a printable PDF progress report using jsPDF
// No backend needed — runs entirely in the browser

import { jsPDF } from "jspdf";
import { getLevelInfo, LEVELS, BADGES } from "../hooks/useGameState";

// ── Colour palette ──────────────────────────────────────────────────────────
const C = {
  purple:     [99,  102, 241],
  purpleLight:[238, 242, 255],
  green:      [52,  211, 153],
  amber:      [251, 191,  36],
  red:        [248, 113, 113],
  dark:       [31,   41,  55],
  mid:        [107, 114, 128],
  light:      [243, 244, 246],
  white:      [255, 255, 255],
  border:     [229, 231, 235],
};

// ── Helpers ─────────────────────────────────────────────────────────────────
function hex(rgb) {
  return `#${rgb.map((v) => v.toString(16).padStart(2,"0")).join("")}`;
}

function drawRoundRect(doc, x, y, w, h, r, fillRgb, strokeRgb) {
  if (fillRgb)   { doc.setFillColor(...fillRgb);   }
  if (strokeRgb) { doc.setDrawColor(...strokeRgb); } else { doc.setDrawColor(255,255,255); }
  doc.roundedRect(x, y, w, h, r, r, fillRgb ? (strokeRgb ? "FD" : "F") : "D");
}

function drawBar(doc, x, y, w, h, pct, fillRgb) {
  // Background
  drawRoundRect(doc, x, y, w, h, h/2, C.light);
  // Fill
  const fillW = Math.max(0, Math.min(1, pct)) * w;
  if (fillW > 0) {
    drawRoundRect(doc, x, y, fillW, h, h/2, fillRgb);
  }
}

// ── Main export ──────────────────────────────────────────────────────────────
export function generateReport(state, studentName = "Student") {
  const doc   = new jsPDF({ unit: "mm", format: "a4" });
  const W     = 210;   // page width
  const PAD   = 18;    // horizontal padding
  const CW    = W - PAD * 2;  // content width
  let   y     = 0;

  const { current: lvl, next, progress } = getLevelInfo(state.totalXP);

  // ── Page 1 ───────────────────────────────────────────────────────────────

  // Header band
  doc.setFillColor(...C.purple);
  doc.rect(0, 0, W, 38, "F");

  doc.setTextColor(...C.white);
  doc.setFontSize(20);
  doc.setFont("helvetica","bold");
  doc.text("NeuroPlay", PAD, 16);

  doc.setFontSize(10);
  doc.setFont("helvetica","normal");
  doc.text("Learning Progress Report", PAD, 23);

  // Date + student
  const today = new Date().toLocaleDateString("en-IN", { day:"numeric", month:"long", year:"numeric" });
  doc.setFontSize(9);
  doc.text(`Student: ${studentName}`, PAD, 30);
  doc.text(`Generated: ${today}`, W - PAD, 30, { align: "right" });

  y = 48;

  // ── Level card ────────────────────────────────────────────────────────────
  drawRoundRect(doc, PAD, y, CW, 28, 4, C.purpleLight, C.border);
  doc.setTextColor(...C.purple);
  doc.setFontSize(13);
  doc.setFont("helvetica","bold");
  doc.text(`Level ${lvl.level} — ${lvl.title}`, PAD + 6, y + 9);

  doc.setFontSize(9);
  doc.setFont("helvetica","normal");
  doc.setTextColor(...C.mid);
  doc.text(`${state.totalXP} XP total`, PAD + 6, y + 16);

  // XP bar
  drawBar(doc, PAD + 6, y + 20, CW - 60, 4, progress, C.purple);
  doc.setFontSize(8);
  doc.text(
    next ? `${next.minXP - state.totalXP} XP to ${next.title}` : "Max level reached!",
    PAD + CW - 54,
    y + 24,
    { align: "right" }
  );

  y += 36;

  // ── Stats grid (2 × 3) ────────────────────────────────────────────────────
  const stats = [
    { label: "Games Played",  value: state.gamesPlayed,        icon: "Gm" },
    { label: "Best Streak",   value: `${state.bestStreak}`,    icon: "Sk" },
    { label: "Words Spelled", value: state.wordsSpelled,       icon: "Wd" },
    { label: "Focus Best",    value: `${state.focusHighScore}`, icon: "Fc" },
    { label: "Word Best",     value: `${state.wordHighScore}`,  icon: "Wb" },
    { label: "Badges",        value: `${state.unlockedBadges.length}/${BADGES.length}`, icon: "Bg" },
  ];

  const cellW = (CW - 8) / 3;
  const cellH = 20;
  stats.forEach((s, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const cx  = PAD + col * (cellW + 4);
    const cy  = y + row * (cellH + 4);
    drawRoundRect(doc, cx, cy, cellW, cellH, 3, C.light, C.border);
    doc.setTextColor(...C.dark);
    doc.setFontSize(13);
    doc.setFont("helvetica","bold");
    doc.text(String(s.value), cx + cellW / 2, cy + 10, { align: "center" });
    doc.setFontSize(7.5);
    doc.setFont("helvetica","normal");
    doc.setTextColor(...C.mid);
    doc.text(s.label, cx + cellW / 2, cy + 16, { align: "center" });
  });

  y += 2 * (cellH + 4) + 10;

  // ── Recent game history chart ─────────────────────────────────────────────
  doc.setFontSize(11);
  doc.setFont("helvetica","bold");
  doc.setTextColor(...C.dark);
  doc.text("Recent Game Scores", PAD, y);
  y += 6;

  const recent  = (state.history || []).slice(0, 12).reverse();
  const chartH  = 36;
  const chartW  = CW;
  const maxScore = Math.max(...recent.map((r) => r.score), 1);

  // Chart background
  drawRoundRect(doc, PAD, y, chartW, chartH + 10, 3, C.light);

  if (recent.length === 0) {
    doc.setFontSize(9);
    doc.setTextColor(...C.mid);
    doc.text("No games played yet", PAD + chartW / 2, y + chartH / 2 + 5, { align: "center" });
  } else {
    const barW   = Math.min(10, (chartW - 12) / recent.length - 2);
    const gap    = (chartW - 12) / recent.length;
    recent.forEach((entry, i) => {
      const bh  = Math.max(3, (entry.score / maxScore) * chartH);
      const bx  = PAD + 6 + i * gap + (gap - barW) / 2;
      const by  = y + chartH + 4 - bh;
      const col = entry.gameType === "focus" ? C.purple : C.green;
      drawRoundRect(doc, bx, by, barW, bh, 1.5, col);
    });
  }

  y += chartH + 18;

  // Legend
  doc.setFillColor(...C.purple);
  doc.rect(PAD, y - 4, 6, 4, "F");
  doc.setFontSize(8);
  doc.setFont("helvetica","normal");
  doc.setTextColor(...C.mid);
  doc.text("Focus Tap", PAD + 8, y);

  doc.setFillColor(...C.green);
  doc.rect(PAD + 46, y - 4, 6, 4, "F");
  doc.text("Word Builder", PAD + 54, y);

  y += 12;

  // ── Badges section ───────────────────────────────────────────────────────
  doc.setFontSize(11);
  doc.setFont("helvetica","bold");
  doc.setTextColor(...C.dark);
  doc.text("Badges Earned", PAD, y);
  y += 6;

  const badgeCols = 2;
  const badgeW    = (CW - 4) / badgeCols;
  BADGES.forEach((badge, i) => {
    const unlocked = state.unlockedBadges.includes(badge.id);
    const col = i % badgeCols;
    const row = Math.floor(i / badgeCols);
    const bx  = PAD + col * (badgeW + 4);
    const by  = y + row * 14;

    drawRoundRect(
      doc, bx, by, badgeW - 2, 12, 2,
      unlocked ? C.purpleLight : C.light,
      unlocked ? C.purple      : C.border
    );

    doc.setFontSize(8.5);
    doc.setFont("helvetica", unlocked ? "bold" : "normal");
    doc.setTextColor(...(unlocked ? C.purple : C.mid));
    doc.text(
      `${unlocked ? "✓" : "○"} ${badge.label}`,
      bx + 4, by + 7.5
    );
    doc.setFontSize(7);
    doc.setFont("helvetica","normal");
    doc.setTextColor(...C.mid);
    doc.text(badge.desc, bx + badgeW - 4, by + 7.5, { align: "right" });
  });

  y += Math.ceil(BADGES.length / badgeCols) * 14 + 8;

  // ── Page 2: Teacher Notes ─────────────────────────────────────────────────
  doc.addPage();

  // Header band
  doc.setFillColor(...C.purple);
  doc.rect(0, 0, W, 28, "F");
  doc.setTextColor(...C.white);
  doc.setFontSize(14);
  doc.setFont("helvetica","bold");
  doc.text("Teacher / Parent Notes", PAD, 18);

  y = 42;

  // Strengths analysis
  const focusAcc  = state.focusHighScore > 80  ? "strong" : state.focusHighScore > 40 ? "developing" : "needs support";
  const wordAcc   = state.wordHighScore  > 80  ? "strong" : state.wordHighScore  > 40 ? "developing" : "needs support";
  const streakMsg = state.bestStreak >= 5 ? "Excellent consistency — plays regularly" : state.bestStreak >= 2 ? "Building a routine — encourage daily play" : "Just getting started — needs more practice sessions";

  const observations = [
    `Attention & Focus (Focus Tap):  ${focusAcc.toUpperCase()} — best score ${state.focusHighScore} pts`,
    `Reading & Word Recognition:     ${wordAcc.toUpperCase()} — best score ${state.wordHighScore} pts`,
    `Engagement Consistency:         ${streakMsg}`,
    `Total vocabulary practice:      ${state.wordsSpelled} words spelled correctly`,
  ];

  doc.setFontSize(11);
  doc.setFont("helvetica","bold");
  doc.setTextColor(...C.dark);
  doc.text("Automated Observations", PAD, y);
  y += 8;

  observations.forEach((obs) => {
    drawRoundRect(doc, PAD, y, CW, 10, 2, C.light);
    doc.setFontSize(8.5);
    doc.setFont("helvetica","normal");
    doc.setTextColor(...C.dark);
    doc.text(obs, PAD + 4, y + 7);
    y += 13;
  });

  y += 8;

  // Recommendations
  const recs = [];
  if (focusAcc === "needs support")   recs.push("Increase Focus Tap sessions to at least 3 per day to build attention span.");
  if (focusAcc === "developing")      recs.push("Try Medium difficulty in Focus Tap — student is ready to be challenged.");
  if (focusAcc === "strong")          recs.push("Focus Tap performance is excellent. Maintain current difficulty.");
  if (wordAcc  === "needs support")   recs.push("Encourage use of the audio button (🔊) before attempting to spell each word.");
  if (wordAcc  === "developing")      recs.push("Introduce Level 2 words — student shows readiness for 4-letter words.");
  if (wordAcc  === "strong")          recs.push("Consider enabling hard mode (no emoji hints) to further challenge reading skills.");
  if (state.bestStreak < 2)          recs.push("Set a daily reminder for the student to play at least one game.");
  if (recs.length === 0)             recs.push("Student is performing well across all areas. Keep up the great work!");

  doc.setFontSize(11);
  doc.setFont("helvetica","bold");
  doc.setTextColor(...C.dark);
  doc.text("Recommendations", PAD, y);
  y += 8;

  recs.forEach((rec, i) => {
    doc.setFontSize(9);
    doc.setFont("helvetica","normal");
    doc.setTextColor(...C.dark);
    const lines = doc.splitTextToSize(`${i + 1}. ${rec}`, CW - 4);
    drawRoundRect(doc, PAD, y, CW, lines.length * 5.5 + 6, 2, C.purpleLight, C.border);
    doc.text(lines, PAD + 4, y + 6);
    y += lines.length * 5.5 + 10;
  });

  y += 6;

  // Hand-written notes area
  doc.setFontSize(11);
  doc.setFont("helvetica","bold");
  doc.setTextColor(...C.dark);
  doc.text("Additional Notes (hand-written)", PAD, y);
  y += 6;

  drawRoundRect(doc, PAD, y, CW, 60, 3, C.white, C.border);
  // Ruled lines inside the notes box
  for (let li = 1; li <= 6; li++) {
    doc.setDrawColor(...C.border);
    doc.setLineWidth(0.3);
    doc.line(PAD + 4, y + li * 9, PAD + CW - 4, y + li * 9);
  }

  y += 70;

  // Signature row
  const sigFields = ["Teacher Signature", "Parent Signature", "Date"];
  const sigW = CW / sigFields.length;
  sigFields.forEach((label, i) => {
    const sx = PAD + i * (sigW + 3);
    doc.setDrawColor(...C.dark);
    doc.setLineWidth(0.4);
    doc.line(sx, y + 14, sx + sigW - 6, y + 14);
    doc.setFontSize(8);
    doc.setFont("helvetica","normal");
    doc.setTextColor(...C.mid);
    doc.text(label, sx, y + 19);
  });

  // Footer
  doc.setFontSize(7.5);
  doc.setTextColor(...C.mid);
  doc.text(
    "Generated by NeuroPlay · Helping ADHD & Dyslexia learners thrive",
    W / 2, 287, { align: "center" }
  );

  // Save
  doc.save(`NeuroPlay_Report_${studentName.replace(/\s+/g, "_")}.pdf`);
}