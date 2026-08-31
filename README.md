# Diviner

> 多主题风格、去古板化的现代占卜算卦网站 —— 八字 / 姓名 / 每日运势 / 塔罗 / 抽签解签
> 定位：传统文化 × 娱乐参考 | 技术栈：Next.js 15 + TypeScript | 部署：腾讯云系

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

```bash
# 依赖安装（Node 22+）
npm install
# 开发服务
npm run dev
# 构建（静态导出）
npm run build
```

详见 `PLAN/plan1_占卜网站开发执行方案.md`（开发笔记，不入 git）。

## 开发约定

- **Git 默认分支**：`master`
- **提交信息**：`<type>: <中文描述>`，type ∈ `chore / feat / fix / docs / refactor / perf / test`
- **提交署名**：附 `Co-Authored-By: Anan (WorkBuddy) <noreply@local>`
- **换行符**：代码统一 LF、`.bat` 保持 CRLF，由 `.gitattributes` 强制
- **不入 git**：`NOTEBOOK/`、`PLAN/`、`.workbuddy/`（开发过程笔记与平台数据）
- **变更记录**：有意义的变更同步更新 `CHANGELOG.md`

## 许可证

待定（当前未选择开源协议）
