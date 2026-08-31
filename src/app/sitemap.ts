import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://diviner.example.com";

// output: export 模式下 metadata routes 必须显式声明为静态
export const dynamic = "force-static";

// 静态导出下 next build 会预渲染 sitemap.xml
// 覆盖五个玩法 + 首页
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const routes = ["", "/bazi", "/name", "/daily", "/tarot", "/lottery"];
  return routes.map((r) => ({
    url: `${SITE_URL}${r}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: r === "" ? 1 : 0.8,
  }));
}