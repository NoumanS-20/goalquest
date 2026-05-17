"use client";
import * as React from "react";

type Theme = "light" | "dark";
const ThemeCtx = React.createContext<{ theme: Theme; toggle: () => void }>({
  theme: "light",
  toggle: () => {},
});

function readInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const stored = window.localStorage.getItem("gq-theme") as Theme | null;
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Lazy initial state — runs only on first client render
  const [theme, setTheme] = React.useState<Theme>(readInitialTheme);

  // Sync the html.dark class. setState during effect is fine here because
  // we're updating an external system (the DOM), not React state.
  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const toggle = React.useCallback(() => {
    setTheme((t) => {
      const next: Theme = t === "light" ? "dark" : "light";
      window.localStorage.setItem("gq-theme", next);
      return next;
    });
  }, []);

  const value = React.useMemo(() => ({ theme, toggle }), [theme, toggle]);
  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

export const useTheme = () => React.useContext(ThemeCtx);
