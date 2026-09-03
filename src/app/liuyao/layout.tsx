import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "六爻八卦",
  description:
    "铜钱摇卦 · 六爻起卦 · 动爻变卦。本卦卦辞、变卦趋势与事业/感情/财运/健康四维断语。传统文化娱乐参考。",
  openGraph: { url: "/liuyao" },
};

export default function LiuyaoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
