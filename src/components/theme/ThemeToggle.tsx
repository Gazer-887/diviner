"use client";

import { useTheme } from "./ThemeProvider";
import { THEMES, THEME_KEYS } from "@/lib/theme/themes";

// 主题切换器：胶囊形分段按钮，选中项用主题色高亮
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div
      className="flex items-center gap-0.5 rounded-full border px-1 py-1"
      style={{ borderColor: "var(--border)" }}
      aria-label="切换主题"
    >
      {THEME_KEYS.map((k) => (
        <button
          key={k}
          type="button"
          onClick={() => setTheme(k)}
          className="rounded-full px-2.5 py-1 text-xs transition-colors sm:px-3"
          style={
            theme === k
              ? { background: "var(--accent)", color: "var(--bg)", fontWeight: 500 }
              : { color: "var(--text-sub)" }
          }
          aria-pressed={theme === k}
        >
          {THEMES[k].label}
        </button>
      ))}
    </div>
  );
}
