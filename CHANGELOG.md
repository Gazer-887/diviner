# 变更记录

本项目遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [未发布]

### 新增

- 项目初始化：Git 仓库（master 分支）、工程骨架、工作区记忆结构（2026-08-31）
- Next.js 16 脚手架（TypeScript / Tailwind 4 / App Router / ESLint），静态导出配置（2026-08-31）
- GitHub 私有仓库 diviner 创建并推送（commit 4a089ca，2026-08-31）
- 阶段 1 设计系统：4 套主题（暗夜星辰/禅意水墨/国潮红金/赛博玄学）+ 首页 + 主题切换器 + 浏览器截图验证（commit b8a594d，2026-08-31）
- 阶段 2 占卜引擎：八字/姓名/每日运势/塔罗/抽签五引擎 + 内容库（752 字笔画、78 张塔罗、40 支签、12 生肖）+ 48 个 Vitest 单元测试 + 子代理交叉验收（commit 78f6901，2026-08-31）
- 阶段 3 五玩法页面：5 个 `src/app/{bazi,name,daily,tarot,lottery}/page.tsx` + 4 个公共组件（PageShell/Field/Button/ResultCard） + globals.css 动画体系（wb-fade-up / wb-pop / wb-flip / wb-shake）+ 浏览器真实交互逐页验证截图（commit 9e724a1，2026-08-31）
- 阶段 4 打磨：SEO 完整化（layout.tsx 全站 metadata + 5 个玩法 layout.tsx 页级 title/description/og:url + sitemap.xml + robots.txt + favicon.svg）、ShareButton 组件（Web Share API + clipboard fallback + 失败反馈）、prefers-reduced-motion 关闭动画、PageShell + 首页 footer 措辞优化（明确不构成医疗/投资/婚恋/决策依据）、ThemeToggle 移动端 2 字短标签适配、Viewport 配置 + 移动端 375px 逐页截图验证（commit 待定，2026-08-31）

### 修复

- SWC 原生二进制损坏（重装 @next/swc-win32-x64-msvc）；node_modules 移动损坏（npm ci 重装）（2026-08-31）
- .gitignore 备份目录改用通配（/.next*/、/node_modules*、/out*），避免 .next.old/out.old 等变名漏忽略（2026-08-31）
- 塔罗翻牌卡 Chrome 152 下 backface-visibility 误判导致牌面不可见：放弃关键帧动画方案，改用 CSS transition + React state 控制 `.is-flipped` class 切换 `rotateY 0↔180`，规避 nested preserve-3d 下 keyframe 边界 case（2026-08-31）

### 变更

- .gitignore 增加 `/resources/tmp_*` 与 `/resources/shots/*-debug-*` 规则，本地排查临时文件不入库（2026-08-31）
- 主题注册表新增 `short` 字段（2 字移动端标签）；ThemeToggle 用 sm:hidden / sm:inline 双标签切换（2026-08-31）
- layout.tsx 新增 viewport（device-width + theme-color 暗/亮）+ 完整 metadata（title template / description / keywords / authors / robots / openGraph / twitter / icons / applicationName），sitemap.ts 与 robots.ts 增加 `export const dynamic = "force-static"` 适配 `output: export` 模式（2026-08-31）
