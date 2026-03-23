import React, { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'sr-store-theme';

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') {
    return 'light';
  }

  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);

  if (savedTheme === 'light' || savedTheme === 'dark') {
    return savedTheme;
  }

  return 'light';
}

function ThemeToggleButton() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme());
  const isDark = theme === 'dark'; // This line creates a boolean variable (true or false) by comparing the value of theme.

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', isDark);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  return (
    <button
      type="button"
      onClick={() =>
        setTheme((currentTheme) =>
          currentTheme === 'light' ? 'dark' : 'light'
        )
      }
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="inline-flex h-9 w-9 items-center justify-center rounded-md transition-colors hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-500 dark:hover:bg-slate-700 dark:focus:ring-slate-300"
    >
      <span
        className="inline-flex h-5 w-5 items-center justify-center text-base leading-none text-slate-800 dark:text-white"
        aria-hidden="true"
      >
        {isDark ? '☼' : '◐'}
      </span>
    </button>
  );
}

export default ThemeToggleButton;
