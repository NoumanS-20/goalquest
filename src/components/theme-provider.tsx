"use client";
import * as React from "react";

type Theme = "light" | "dark";
const ThemeCtx = React.createContext<{ theme: Theme; toggle: () => void }>({
  theme: "light",
  toggle: () => {},
});

function readInitialTheme(): Theme {
  return "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Lazy initial state — runs only on first client render
  const [theme, setTheme] = React.useState<Theme>(readInitialTheme);

  // Sync the html.dark class. setState during effect is fine here because
  // we're updating an external system (the DOM), not React state.
  React.useEffect(() => {
    document.documentElement.classList.remove("dark");
    window.localStorage.setItem("gq-theme", "light");
  }, [theme]);

  const toggle = React.useCallback(() => {
    setTheme("light");
  }, []);

  const value = React.useMemo(() => ({ theme, toggle }), [theme, toggle]);
  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

export const useTheme = () => React.useContext(ThemeCtx);
