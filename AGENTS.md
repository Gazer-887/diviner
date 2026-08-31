# AGENTS.md — AI 代理协作约定

> 本文件依据全局规范 `~/.workbuddy/NORMS.md`（WorkBuddy 适配版）编写。
> 全局行为规范（工作流/质量门禁/环境/Git）以 NORMS.md 为准，本文件只记录项目特定约定。

## 项目概述

- 定位：待补充（初始化于 2026-08-31）
- 技术栈：待定
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

## 工作方式（NORMS 七步流程）

澄清 → 计划 → 计划验证 → 分工 → 落盘 → 交叉验证 → 交付

- 恢复项目：先读 `NOTEBOOK/` + `PLAN/` + `.workbuddy/memory/`
- 任务真相源：WorkBuddy TaskList；NOTEBOOK 用于知识沉淀
- 每完成子任务 → 立即更新 `NOTEBOOK/progress.md`
