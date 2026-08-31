import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 静态导出：MVP 全前端占卜逻辑，部署到腾讯云系静态托管（CDN + HTTPS）
  // 二期如需 Node API（用户数据/统计），改回默认并迁移 CloudBase 云托管
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true, // 静态导出下图片不走 next/image 优化，MVP 阶段用原生 img
  },
};

export default nextConfig;
