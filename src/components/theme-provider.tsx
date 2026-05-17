"use client";
import * as React from "react";

type Theme = "light" | "dark";
const ThemeCtx = React.createContext<{ theme: Theme; toggle: () => void }>({
  theme: "light",
  toggle: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = React.useState<Theme>("light");

  React.useEffect(() => {
    const stored = localStorage.getItem("gq-theme") as Theme | null;
    const prefers = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const initial = stored || prefers;
    setTheme(initial);
    document.documentElement.classList.toggle("dark", initial === "dark");
  }, []);

  const toggle = React.useCallback(() => {
    setTheme((t) => {
      const next = t === "light" ? "dark" : "light";
      document.documentElement.classList.toggle("dark", next === "dark");
      localStorage.setItem("gq-theme", next);
      return next;
    });
  }, []);

  return <ThemeCtx.Provider value={{ theme, toggle }}>{children}</ThemeCtx.Provider>;
}

export const useTheme = () => React.useContext(ThemeCtx);
