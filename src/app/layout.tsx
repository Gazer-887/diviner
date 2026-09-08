import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

const SITE_NAME = "卜兮";
const SITE_DESCRIPTION =
  "卜兮——多主题占卜算卦网站，生辰八字、姓名测试、每日运势、塔罗、抽签解签、六爻八卦。传统文化娱乐参考，不构成任何决策依据。";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://diviner-zdrpazbh.edgeone.cool";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0c0a18" },
    { media: "(prefers-color-scheme: light)", color: "#f8f4ec" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} · 八字塔罗运势`,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "占卜",
    "八字",
    "姓名测试",
    "每日运势",
    "塔罗",
    "抽签",
    "五行",
    "十二生肖",
    "传统文化",
    "卜兮",
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} · 八字塔罗运势`,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary",
    title: `${SITE_NAME} · 八字塔罗运势`,
    description: SITE_DESCRIPTION,
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
  },
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