import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Theme = "light" | "dark" | "system";
const STORAGE_KEY = "urbanfix-theme";

type ThemeCtx = {
  theme: Theme;
  resolved: "light" | "dark";
  setTheme: (t: Theme) => void;
};

const Ctx = createContext<ThemeCtx | null>(null);

function apply(theme: Theme): "light" | "dark" {
  if (typeof document === "undefined") return "light";
  const sys = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  const resolved = theme === "system" ? sys : theme;
  document.documentElement.classList.toggle("dark", resolved === "dark");
  document.documentElement.style.colorScheme = resolved;
  return resolved;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [resolved, setResolved] = useState<"light" | "dark">("light");

  useEffect(() => {
    const stored = (localStorage.getItem(STORAGE_KEY) as Theme | null) ?? "system";
    setThemeState(stored);
    setResolved(apply(stored));
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      const t = (localStorage.getItem(STORAGE_KEY) as Theme | null) ?? "system";
      if (t === "system") setResolved(apply("system"));
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const setTheme = (t: Theme) => {
    localStorage.setItem(STORAGE_KEY, t);
    setThemeState(t);
    setResolved(apply(t));
  };

  return <Ctx.Provider value={{ theme, resolved, setTheme }}>{children}</Ctx.Provider>;
}

export function useTheme() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useTheme must be used within ThemeProvider");
  return v;
}

// Inline script to run before hydration and prevent FOUC. Reads the same
// storage key and applies the .dark class on <html> based on the saved
// preference (or system when unset).
export const themeInitScript = `(function(){try{var k=${JSON.stringify(STORAGE_KEY)};var s=localStorage.getItem(k)||'system';var d=window.matchMedia('(prefers-color-scheme: dark)').matches;var r=s==='dark'||(s==='system'&&d);var e=document.documentElement;if(r)e.classList.add('dark');e.style.colorScheme=r?'dark':'light';}catch(_){}})();`;
