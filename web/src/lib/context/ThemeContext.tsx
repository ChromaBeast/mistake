"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function readStoredTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  try {
    const saved = localStorage.getItem("mistake_theme");
    if (saved === "light" || saved === "dark" || saved === "system") return saved;
  } catch {
    /* storage unavailable */
  }
  return "dark";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    setThemeState(readStoredTheme());
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const isDarkActive =
        theme === "dark" || (theme === "system" && media.matches);
      setIsDark(isDarkActive);
      document.documentElement.classList.toggle("dark", isDarkActive);
    };
    apply();
    localStorage.setItem("mistake_theme", theme);
    const onManualChange = () => setThemeState(readStoredTheme());
    window.addEventListener("mistake-theme-change", onManualChange);
    if (theme === "system") {
      media.addEventListener("change", apply);
      return () => {
        media.removeEventListener("change", apply);
        window.removeEventListener("mistake-theme-change", onManualChange);
      };
    }
    return () => window.removeEventListener("mistake-theme-change", onManualChange);
  }, [theme]);

  const setTheme = (t: Theme) => setThemeState(t);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
