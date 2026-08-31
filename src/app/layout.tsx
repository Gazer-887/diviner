import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

export const metadata: Metadata = {
  title: "灵犀占卜 · 八字塔罗运势",
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
      {/* 首屏防闪烁：在 hydration 前应用已保存主题 */}
      <Script id="theme-init" strategy="beforeInteractive">
        {`try{var t=localStorage.getItem("diviner-theme");if(t){document.documentElement.dataset.theme=t}}catch(e){}`}
      </Script>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
