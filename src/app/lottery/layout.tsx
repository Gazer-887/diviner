import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "抽签解签",
  description:
    "四十签 · 一事一签 · 心诚则灵。所求之事、解曰、行事指引，传统签诗配白话解读。传统文化娱乐参考。",
  openGraph: { url: "/lottery" },
};

export default function LotteryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}