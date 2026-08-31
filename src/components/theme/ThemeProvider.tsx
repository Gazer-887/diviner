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

// 惰性初始化：SSR/静态导出时取默认，客户端首渲读 localStorage（避免 set-state-in-effect）
function readInitialTheme(): ThemeKey {
  if (typeof window === "undefined") return DEFAULT_THEME;
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as ThemeKey | null;
    return saved && THEME_KEYS.includes(saved) ? saved : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeKey>(readInitialTheme);

  // 主题变更 → 写 DOM 属性（触发 CSS 变量切换）+ 持久化（无 setState，不触发额外渲染）
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // localStorage 不可用时静默降级（隐私模式等）
    }
  }, [theme]);

  return <Ctx.Provider value={{ theme, setTheme }}>{children}</Ctx.Provider>;
}

export const useTheme = () => useContext(Ctx);
