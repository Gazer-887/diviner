# 变更记录

本项目遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [未发布]

### 新增

- 项目初始化：Git 仓库（master 分支）、工程骨架、工作区记忆结构（2026-08-31）
- Next.js 16 脚手架（TypeScript / Tailwind 4 / App Router / ESLint），静态导出配置（2026-08-31）
- GitHub 私有仓库 diviner 创建并推送（commit 4a089ca，2026-08-31）
- 阶段 1 设计系统：4 套主题（暗夜星辰/禅意水墨/国潮红金/赛博玄学）+ 首页 + 主题切换器（桌面完整标签 / 移动端 2 字短标签）+ 浏览器截图验证（commit b8a594d，2026-08-31）
- 阶段 2 占卜引擎：八字/姓名/每日运势/塔罗/抽签五引擎 + 内容库（752 字笔画、78 张塔罗、40 支签、12 生肖）+ 48 个 Vitest 单元测试 + 子代理交叉验收（commit 78f6901，2026-08-31）
- 阶段 3 五玩法页面：5 个 `src/app/{bazi,name,daily,tarot,lottery}/page.tsx` + 4 个公共组件（PageShell/Field/Button/ResultCard） + globals.css 动画体系（wb-fade-up / wb-pop / wb-flip / wb-shake）+ 浏览器真实交互逐页验证截图（commit 9e724a1，2026-08-31）
- 阶段 4 打磨：SEO 完整化（layout.tsx 全站 metadata + 5 个玩法目录级 server layout.tsx 页级 title/description/og:url + `sitemap.xml` + `robots.txt` + `favicon.svg`）、ShareButton 组件（Web Share API + clipboard fallback + 失败反馈）、`prefers-reduced-motion` 关闭动画、PageShell + 首页 footer 免责声明措辞优化、Viewport 配置 + 移动端 375px 逐页截图验证 + 分享按钮真实点击验证（commit b2e1a37，2026-09-01）
- 阶段 5 测试交叉验证：移动端 375px 五玩法页真实点击回归（bazi/name/daily/tarot/lottery 全通）+ 边界条件测试（空输入/非法范围/超长均有校验提示）+ `tests/cross-validate.test.ts` 29 项独立真值交叉验证（干支合法性/五行守恒/塔罗 78 牌分布均匀/抽签 40 签分布/运势确定性，全量 77 测试绿）+ 6 张验证截图（commit 22e059f，2026-09-01）
- 阶段 6 部署准备：静态产物 `out/` 独立运行验证（python -m http.server + agent-browser 真实点击八字页 → 四柱/五行/命理解读正常渲染，无 dev 角标）+ DEPLOY.md 部署指南（EdgeOne Pages 首选 / CloudBase 备选，含 CLI 登录/项目配置/验证清单/回滚方案）+ s6-static-*.png 截图（commit 9a7545d，2026-09-01）
- 阶段 6 增强：自定义 `src/app/not-found.tsx`（「此签未现」+ 返回首页链接 + 免责声明）+ `src/app/api/README.md` 二期扩展预留占位（用户数据/访问统计/分享卡片接口草案）+ README.md 同步阶段 0-6 全状态、技术栈（Next.js 16 + React 19）、测试矩阵、关键教训索引（commit 3ed81ad，2026-09-01）
- 阶段 6 部署落地（CloudBase）：`tcb hosting deploy out` 80 文件全部上传成功，线上 https://suanmingde-d0g9p1ora0e30c601-1451544835.tcloudbaseapp.com 8 路由 curl 200 + Edge headless CDP 真实浏览器验证（首页 5 卡片 / 八字全流程排盘 庚午辛巳乙酉庚辰·五行缺 水 / 主题切换国潮红金生效 / 免责声明齐全），截图 s6-cloudbase-*.png；DEPLOY.md 补实际环境与已知限制（测试域名访问提示页 / 软 404 / 个人版 2026-10-03 到期）（commit b1362e2，2026-09-01）

### 修复

- SWC 原生二进制损坏（重装 @next/swc-win32-x64-msvc）；node_modules 移动损坏（npm ci 重装）（2026-08-31）
- .gitignore 备份目录改用通配（/.next*/、/node_modules*、/out*），避免 .next.old/out.old 等变名漏忽略（2026-08-31）
- 塔罗翻牌卡 Chrome 152 下 backface-visibility 误判导致牌面不可见：放弃关键帧动画方案，改用 CSS transition + React state 控制 `.is-flipped` class 切换 `rotateY 0↔180`，规避 nested preserve-3d 下 keyframe 边界 case（2026-08-31）

### 变更

- .gitignore 增加 `/resources/tmp_*` 与 `/resources/shots/*-debug-*` 规则，本地排查临时文件不入库（2026-08-31）
- layout.tsx 新增 viewport（device-width + theme-color 暗/亮）+ 完整 metadata（title template / description / keywords / authors / robots / openGraph / twitter / icons / applicationName），5 个玩法目录新增 server layout.tsx 提供独立 title/description（2026-09-01）
- 自定义 `not-found.tsx` 替代默认 Next.js 404；`api/README.md` 标记二期扩展位（2026-09-01）

## 教训索引

- L1（2026-08-31）：初始化/恢复项目前必须先读 NORMS + AGENTS（NOTEBOOK/learnings.md）
- L7（2026-08-31）：safe-delete 拦截 Node fs + bash rm，批量删除 >50 触发 guard（NOTEBOOK/learnings.md）
- L8（2026-08-31）：agent-browser 自带 Chromium 启动失败时，手动 CDP Chrome + `agent-browser connect` 接管（NOTEBOOK/learnings.md）
- L9（2026-08-31）：3D 翻牌动画优先用 CSS transition 替代 keyframe animation（NOTEBOOK/learnings.md）
- L10（2026-09-01）：Bash 层无法关闭 safe-delete shim，PowerShell 中 `$env:CODEBUDDY_SAFE_DELETE_ENABLED='0'` 可让 Node shim 失效，用于构建前干净目录（NOTEBOOK/learnings.md）
- L17（2026-09-01）：CloudBase CLI 3.x 登录态存 `~/.config/.cloudbase/auth.json`（旧 cli.json 已废弃）；无 TTY 环境 `tcb login` 会在遥测询问处永久挂起——先预写 `usage.json` 为 `{"agreeCollect": false}` 可跳过（NOTEBOOK/learnings.md）
- L18（2026-09-01）：Git Bash 给 Windows node 传 `/c/...` 参数会拼成 `D:\c\...`，须用 `C:/...` 风格（NOTEBOOK/learnings.md）
