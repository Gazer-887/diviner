"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { DEFAULT_THEME, THEME_KEYS, type ThemeKey } from "@/lib/theme/themes";

interface ThemeCtx {
  theme: ThemeKey;
  setTheme: (t: ThemeKey) => void;
}

const Ctx = createContext<ThemeCtx>({
  theme: DEFAULT_THEME,
  setTheme: () => {},
});

const STORAGE_KEY = "diviner-theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeKey>(DEFAULT_THEME);

  // 挂载后从 localStorage 恢复用户选择
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as ThemeKey | null;
    if (saved && THEME_KEYS.includes(saved)) setTheme(saved);
  }, []);

  // 主题变更 → 写 DOM 属性（触发 CSS 变量切换）+ 持久化
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  return <Ctx.Provider value={{ theme, setTheme }}>{children}</Ctx.Provider>;
}

export const useTheme = () => useContext(Ctx);
