# Diviner · 灵犀占卜

> 多主题风格、去古板化的现代占卜算卦网站 —— 八字 / 姓名 / 每日运势 / 塔罗 / 抽签解签
> 定位：传统文化 × 娱乐参考 | 技术栈：Next.js 16 + React 19 + TypeScript | 部署：腾讯云 EdgeOne Pages

## 项目状态

**MVP 全阶段完成**（2026-09-01）：

| 阶段 | 内容 | 测试 |
|---|---|---|
| 0 脚手架 | Next.js 16 + 静态导出 + GitHub 私有仓库 | — |
| 1 设计系统 | 4 套主题（暗夜星辰/禅意水墨/国潮红金/赛博玄学）+ 首页 + 主题切换 | 浏览器截图 |
| 2 占卜引擎 | 五引擎（八字/姓名/运势/塔罗/抽签）+ 内容库（752 字笔画 / 78 塔罗 / 40 签 / 12 生肖） | 48 单元测试 |
| 3 五玩法页面 | `/bazi` `/name` `/daily` `/tarot` `/lottery` + 公共组件（PageShell/Field/Button/ResultCard） + 动画体系 | 浏览器交互回归 |
| 4 打磨 | SEO（sitemap/robots/favicon）+ ShareButton（Web Share + clipboard）+ 响应式 + prefers-reduced-motion + 免责声明 | 移动端 375px 全页截图 |
| 5 测试交叉验证 | `tests/cross-validate.test.ts` 29 项独立真值验证（干支合法性/五行守恒/塔罗分布/抽签分布/运势确定性） + 边界条件 | **77 测试全绿** |
| 6 部署准备 | 静态产物 `out/` 独立运行验证 + DEPLOY.md 部署指南（EdgeOne Pages / CloudBase） | 待用户扫码认证后一键部署 |

## 目录结构

```
D:\Diviner\
├── README.md            # 项目说明（本文件）
├── DEPLOY.md            # 部署指南（EdgeOne Pages / CloudBase）
├── CHANGELOG.md         # 变更记录
├── AGENTS.md            # AI 代理协作约定
├── requirements.txt     # Python 依赖
├── package.json         # 依赖与脚本
├── tsconfig.json        # TypeScript 配置
├── next.config.ts       # Next.js 配置（output: "export"）
├── vitest.config.ts     # Vitest 配置
├── eslint.config.mjs    # ESLint 配置
├── .gitignore           # Git 忽略规则
├── .gitattributes       # 换行符 / 二进制标记规范
├── .editorconfig        # 编辑器统一规范
├── .env.example         # 环境变量模板
├── public/              # 静态资源（favicon.svg 等）
├── src/                 # 源码
│   ├── app/             # Next.js App Router
│   │   ├── api/         # 二期扩展预留（README 占位）
│   │   ├── bazi/        # 生辰八字
│   │   ├── name/        # 姓名测试
│   │   ├── daily/       # 每日运势
│   │   ├── tarot/       # 塔罗占卜
│   │   ├── lottery/     # 抽签解签
│   │   ├── not-found.tsx# 自定义 404
│   │   ├── sitemap.ts   # sitemap.xml
│   │   ├── robots.ts    # robots.txt
│   │   └── globals.css  # 全局样式 + 动画体系
│   ├── components/      # 公共组件（theme/ + ui/）
│   ├── lib/             # 引擎 + 内容库 + 类型契约
│   │   ├── engines/     # 五套占卜引擎
│   │   ├── data/        # 笔画库/塔罗/签文/运势文案
│   │   ├── theme/       # 主题注册表
│   │   └── engines/types.ts  # 统一类型契约
│   └── ...
├── tests/               # 测试
│   ├── bazi.test.ts     # 八字单元测试（5 项）
│   ├── name.test.ts     # 姓名单元测试（13 项）
│   ├── daily.test.ts    # 运势单元测试（11 项）
│   ├── tarot.test.ts    # 塔罗单元测试（10 项）
│   ├── lottery.test.ts  # 抽签单元测试（9 项）
│   └── cross-validate.test.ts # 独立真值交叉验证（29 项）
├── scripts/             # 辅助脚本
├── docs/                # 文档
├── resources/           # 非代码资源
│   ├── shots/           # 阶段验证截图（s0-s6）
│   └── README.md
├── NOTEBOOK/            # 开发笔记（不入 git）
├── PLAN/                # 实施计划（不入 git）
└── .workbuddy/          # WorkBuddy 内部数据（不入 git）
```

## 快速开始

```bash
# 依赖安装（Node 22+）
npm install

# 开发服务（http://localhost:3000）
npm run dev

# 构建（webpack，绕宿主 safe-delete shim）
npm run build:local

# 测试（77 用例全绿）
npm test

# 代码质量
npx tsc --noEmit
npx eslint .
```

## 部署

详见 `DEPLOY.md`：

- **首选**：腾讯云 EdgeOne Pages（默认 `*.edgeone.app` 子域名免备案）
- **备选**：腾讯云 CloudBase 静态托管（`*.tcloudbaseapp.com`）
- **MVP**：静态产物 `out/` 已就绪，可独立托管

## 设计系统

四套主题通过 CSS 变量热切，支持系统主题持久化（`localStorage.diviner-theme`）：

| 主题 | 标签 | 风格 |
|---|---|---|
| 暗夜星辰 | 星辰 | 深紫底 + 金色 accent（默认） |
| 禅意水墨 | 水墨 | 浅米底 + 墨绿 accent |
| 国潮红金 | 红金 | 朱红底 + 金色 accent |
| 赛博玄学 | 玄学 | 深青底 + 荧光蓝 accent |

## 开发约定

- **Git 默认分支**：`master`
- **提交信息**：`<type>: <中文描述>`，type ∈ `chore / feat / fix / docs / refactor / perf / test`
- **提交署名**：附 `Co-Authored-By: Anan (WorkBuddy) <noreply@local>`
- **换行符**：代码统一 LF、`.bat` 保持 CRLF，由 `.gitattributes` 强制
- **不入 git**：`NOTEBOOK/`、`PLAN/`、`.workbuddy/`（开发过程笔记与平台数据）
- **变更记录**：有意义的变更同步更新 `CHANGELOG.md`

## 经验教训索引

详见 `NOTEBOOK/learnings.md`（项目本地，不入 git）。关键教训摘要：

- **L9**：3D 翻牌动画优先用 CSS transition 替代 keyframe animation（Chrome 152 nested preserve-3d backface 误判）
- **L11**：构建前必停 dev server → mv .next → build（dev server 锁目录导致 mv Permission denied）
- **L15**：PowerShell 中 `$env:CODEBUDDY_SAFE_DELETE_ENABLED='0'` 可关闭 safe-delete shim
- **L16**：`NO_PROXY=github.com git push` 绕过 Clash 代理导致的 schannel TLS 握手失败

## 许可证

待定（当前未选择开源协议）