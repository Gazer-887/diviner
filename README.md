# Diviner

> 项目定位：待补充 —— 初始化于 2026-08-31

## 目录结构

```
D:\Diviner\
├── README.md            # 项目说明（本文件）
├── CHANGELOG.md         # 变更记录
├── AGENTS.md            # AI 代理协作约定
├── requirements.txt     # Python 依赖
├── .gitignore           # Git 忽略规则（含 NOTEBOOK/ PLAN/ .workbuddy/）
├── .gitattributes       # 换行符 / 二进制标记规范
├── .editorconfig        # 编辑器统一规范
├── .env.example         # 环境变量模板
├── src/                 # 源码
├── docs/                # 文档
├── tests/               # 测试
├── scripts/             # 辅助脚本
├── resources/           # 非代码资源
├── NOTEBOOK/            # 开发笔记（不入 git）
├── PLAN/                # 实施计划（不入 git）
└── .workbuddy/          # WorkBuddy 内部数据（不入 git）
```

## 快速开始

（待项目落地后补充）

## 开发约定

- **Git 默认分支**：`master`
- **提交信息**：`<type>: <中文描述>`，type ∈ `chore / feat / fix / docs / refactor / perf / test`
- **提交署名**：附 `Co-Authored-By: Anan (WorkBuddy) <noreply@local>`
- **换行符**：代码统一 LF、`.bat` 保持 CRLF，由 `.gitattributes` 强制
- **不入 git**：`NOTEBOOK/`、`PLAN/`、`.workbuddy/`（开发过程笔记与平台数据）
- **变更记录**：有意义的变更同步更新 `CHANGELOG.md`

## 许可证

待定（当前未选择开源协议）
