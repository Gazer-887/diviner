import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "生辰八字排盘",
  description:
    "输入出生时间，排四柱八字，析五行分布，判性格之趋向与流年之吉凶。传统文化娱乐参考。",
  openGraph: { url: "/bazi" },
};

export default function BaziLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}