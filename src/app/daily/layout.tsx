import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "每日运势",
  description:
    "今日吉凶 · 宜忌指引 · 分项指数（事业/财运/感情/健康）· 幸运色数字方位。传统文化娱乐参考。",
  openGraph: { url: "/daily" },
};

export default function DailyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}