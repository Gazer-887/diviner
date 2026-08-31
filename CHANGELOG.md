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

### 修复

- SWC 原生二进制损坏（重装 @next/swc-win32-x64-msvc）；node_modules 移动损坏（npm ci 重装）（2026-08-31）
- .gitignore 备份目录改用通配（/.next*/、/node_modules*、/out*），避免 .next.old/out.old 等变名漏忽略（2026-08-31）
