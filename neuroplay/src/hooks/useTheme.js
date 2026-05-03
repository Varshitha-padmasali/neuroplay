// src/hooks/useTheme.js
// Controls two accessibility toggles:
//   1. Dyslexia Font  — switches to OpenDyslexic (easier letter recognition)
//   2. Focus Mode     — muted palette, reduced animations (ADHD-friendly)

import { useState, useEffect } from "react";

const THEME_KEY = "neuroplay_theme";

function defaultTheme() {
  return { dyslexiaFont: false, focusMode: false };
}

export function useTheme() {
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      return saved ? JSON.parse(saved) : defaultTheme();
    } catch {
      return defaultTheme();
    }
  });

  // Persist
  useEffect(() => {
    localStorage.setItem(THEME_KEY, JSON.stringify(theme));
  }, [theme]);

  // Inject OpenDyslexic from CDN when toggle is on
  useEffect(() => {
    const id = "dyslexic-font-link";
    let link = document.getElementById(id);
    if (theme.dyslexiaFont) {
      if (!link) {
        link = document.createElement("link");
        link.id = id;
        link.rel = "stylesheet";
        link.href =
          "https://fonts.cdnfonts.com/css/opendyslexic";
        document.head.appendChild(link);
      }
    } else {
      if (link) link.remove();
    }
  }, [theme.dyslexiaFont]);

  const toggle = (key) =>
    setTheme((t) => ({ ...t, [key]: !t[key] }));

  return { theme, toggle };
}