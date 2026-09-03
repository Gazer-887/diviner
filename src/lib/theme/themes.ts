// 主题注册表：四套主题的定义与展示信息
// CSS 变量实际值见 src/app/globals.css 的 [data-theme] 覆盖段

export type ThemeKey = "star" | "zen" | "cyb" | "chun";

export interface ThemeMeta {
  label: string;
  /** 移动端紧凑展示（2 字），375px 视口下 4 个按钮能装下 */
  short: string;
  desc: string;
}

export const THEMES: Record<ThemeKey, ThemeMeta> = {
  star: { label: "月明青山", short: "明月", desc: "黑金映月" },
  zen: { label: "红豆生思", short: "红豆", desc: "水墨寄情" },
  cyb: { label: "似天在水", short: "水天", desc: "霓虹幻境" },
  chun: { label: "昔我往矣", short: "春晓", desc: "杨柳春风" },
};

export const DEFAULT_THEME: ThemeKey = "star";

export const THEME_KEYS = Object.keys(THEMES) as ThemeKey[];
