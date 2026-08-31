import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "塔罗占卜",
  description:
    "七十八张塔罗牌 · 单张指引 / 三张过去现在未来牌阵 · 关键词解读与综合释义。传统文化娱乐参考。",
  openGraph: { url: "/tarot" },
};

export default function TarotLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}