import React, { createContext, useContext, useEffect, useState } from "react";
import { LOCAL_STORAGE_KEYS } from "@/utils/constant";

const ThemeContext = createContext(undefined);

export const ThemeProvider = ({ children, defaultTheme = "system" }) => {
  const [theme, setThemeState] = useState(() => {
    const storedTheme = localStorage.getItem(LOCAL_STORAGE_KEYS.THEME);
    return storedTheme || defaultTheme;
  });

  const [actualTheme, setActualTheme] = useState("light");

  useEffect(() => {
    const updateActualTheme = () => {
      if (theme === "system") {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
          .matches
          ? "dark"
          : "light";
        setActualTheme(systemTheme);
      } else {
        setActualTheme(theme);
      }
    };

    updateActualTheme();

    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = () => updateActualTheme();

      mediaQuery.addEventListener("change", handler);
      return () => mediaQuery.removeEventListener("change", handler);
    }
  }, [theme]);

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove("light", "dark");
    root.classList.add(actualTheme);
  }, [actualTheme]);

  const setTheme = (newTheme) => {
    setThemeState(newTheme);
    localStorage.setItem(LOCAL_STORAGE_KEYS.THEME, newTheme);
  };

  const toggleTheme = () => {
    const newTheme = actualTheme === "light" ? "dark" : "light";
    setTheme(newTheme);
  };

  const value = {
    theme,
    setTheme,
    toggleTheme,
    actualTheme,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
