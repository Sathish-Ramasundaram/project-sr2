import { useEffect, useState } from "react";
import MoonIcon from "./icons/MoonIcon";
import SunIcon from "./icons/SunIcon";

type Theme = "light" | "dark";

const THEME_STORAGE_KEY = "sr-store-theme";

function getInitialTheme(): Theme {
  if (typeof window === "undefined") {
    return "light";
  }

  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  return savedTheme === "dark" ? "dark" : "light";
}

function ThemeToggleButton() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const isDark = theme === "dark";

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", isDark);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [isDark, theme]);

  return (
    <button
      type="button"
      onClick={() => setTheme((currentTheme) => (currentTheme === "light" ? "dark" : "light"))}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="rounded-md p-2 transition-colors hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-500 dark:hover:bg-slate-700 dark:focus:ring-slate-300"
    >
      {isDark ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
    </button>
  );
}

export default ThemeToggleButton;