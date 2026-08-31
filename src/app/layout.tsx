import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Diviner · 占卜",
  description:
    "多主题占卜算卦网站——生辰八字、姓名测试、每日运势、塔罗、抽签解签。传统文化，娱乐参考。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
