import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "姓名测试",
  description:
    "五格剖象数理、三才配置吉凶，从姓名笔画推演命理吉凶与运势走向。传统文化娱乐参考。",
  openGraph: { url: "/name" },
};

export default function NameLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}