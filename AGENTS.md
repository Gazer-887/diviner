# AGENTS.md — AI 代理协作约定

> 本文件依据全局规范 `~/.workbuddy/NORMS.md`（WorkBuddy 适配版）编写。
> 全局行为规范（工作流/质量门禁/环境/Git）以 NORMS.md 为准，本文件只记录项目特定约定。

## 项目概述

- 定位：多主题占卜算卦网站（八字/姓名/每日运势/塔罗/抽签解签），娱乐参考定位
- 技术栈：Next.js 16（App Router）+ React 19 + TypeScript + Tailwind 4 + lunar-javascript（八字/姓名引擎）
- Python 环境：`ai_env`（`D:\MiniConda3\envs\ai_env`，NORMS 强制统一使用）

## 目录约定

```
D:\Diviner\
├── src/          # 源码
├── docs/         # 文档（ADR 建议放 docs/adr/）
├── tests/        # 测试
├── scripts/      # 辅助脚本
├── resources/    # 非代码资源
├── NOTEBOOK/     # 开发笔记（progress/problem/decisions/learnings）※ 不入 git
├── PLAN/         # 实施计划 planN_中文关键字.md ※ 不入 git
└── .workbuddy/   # WorkBuddy 内部数据（memory 等）※ 不入 git
```

## 工程规范（NORMS 强制）

- **Git 默认分支**：`master`
- **提交信息**：`<type>: <中文描述>`，type ∈ chore/feat/fix/docs/refactor/perf/test
- **提交署名**：末尾附 `Co-Authored-By: Anan (WorkBuddy) <noreply@local>`
- **提交工具**：优先 `/commit`、`/commit-push-pr` 技能；查询操作无需确认，修改操作需用户确认
- **换行符**：代码 LF、`.bat` CRLF，由 `.gitattributes` 强制
- **不入 git**：`NOTEBOOK/`、`PLAN/`、`.workbuddy/`（已写入 .gitignore）
- **环境变量**：`.env` 不入库，模板 `.env.example`
- **变更记录**：有意义的变更同步更新 `CHANGELOG.md`
- **构建**：CI/标准环境用 `npm run build`；WorkBuddy 宿主（safe-delete 钩子拦 Turbopack 缓存清理）本地构建用 `npm run build:local`（webpack 模式）
- **网络**：本机 npm/git 直连易 ECONNRESET，需 `--proxy=socks5://127.0.0.1:7897`（详见 NOTEBOOK/learnings.md L2）
- **测试**：`npm test`（Vitest，引擎单测在 tests/）

## 工作方式（NORMS 七步流程）

澄清 → 计划 → 计划验证 → 分工 → 落盘 → 交叉验证 → 交付

- 恢复项目：先读 `NOTEBOOK/` + `PLAN/` + `.workbuddy/memory/`
- 任务真相源：WorkBuddy TaskList；NOTEBOOK 用于知识沉淀
- 每完成子任务 → 立即更新 `NOTEBOOK/progress.md`

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
