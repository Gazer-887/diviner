// 主题注册表：四套主题的定义与展示信息
// CSS 变量实际值见 src/app/globals.css 的 [data-theme] 覆盖段

export type ThemeKey = "star" | "zen" | "guo" | "cyb";

export interface ThemeMeta {
  label: string;
  desc: string;
}

export const THEMES: Record<ThemeKey, ThemeMeta> = {
  star: { label: "暗夜星辰", desc: "神秘深邃" },
  zen: { label: "禅意水墨", desc: "素雅留白" },
  guo: { label: "国潮红金", desc: "华彩大气" },
  cyb: { label: "赛博玄学", desc: "前卫霓虹" },
};

export const DEFAULT_THEME: ThemeKey = "star";

export const THEME_KEYS = Object.keys(THEMES) as ThemeKey[];
