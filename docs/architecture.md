# Diviner · 架构说明

> 项目：灵犀占卜 | 更新：2026-09-01（阶段 0-6 完成，CloudBase 已上线）
> 关联：`README.md`（入口）、`DEPLOY.md`（部署）、`src/lib/engines/types.ts`（引擎契约）、`src/app/api/README.md`（二期扩展）

## 1. 总体架构

**纯前端静态站点 + 五引擎本地计算**（无后端、无数据库、无构建期数据依赖）：

```
浏览器 (React 19 客户端组件)
   │  用户输入
   ▼
占卜引擎层 (src/lib/engines/)          ← 五套独立引擎，纯函数，确定性
   │  引擎内部使用各自内容库 + 确定性 RNG
   ▼
内容库 (src/lib/data/)                 ← 笔画库(752) / 塔罗(78) / 签文(40) / 运势文案 / 生肖
   │
   ▼
结果 → 页面渲染 (src/app/*/page.tsx) → ResultCard 展示
```

- 打包方式：Next.js 16.3.3 App Router，`output: "export"` 静态导出 → `out/` 纯静态目录，任意静态托管可跑
- 运行时：页面均为客户端交互组件；无 Server Components 数据获取，`_next/static` 随导出内联
- 主题：CSS 变量 + 防闪烁内联脚本 + `localStorage.diviner-theme` 持久化（4 套主题注册表 `src/lib/theme/`）

## 2. 引擎设计要点

| 引擎 | 路由 | 确定性来源 | 契约（types.ts） |
|---|---|---|---|
| 八字 bazi | `/bazi` | lunar-javascript 真太阳时四柱 + 五行统计 | Pillar[] / ElementCount / Reading |
| 姓名 name | `/name` | 笔画库 → 五格(天/人/地/外/总) 数理吉凶 + 三才 | NameResult |
| 运势 daily | `/daily` | 属相 + 日期 FNV-1a 哈希 → 当日固定结果 | DailyFortune |
| 塔罗 tarot | `/tarot` | mulberry32 洗牌（同种子确定性） | TarotReading（单张/三张牌阵） |
| 抽签 lottery | `/lottery` | mulberry32 摇签 → 40 签均匀 | LotteryResult |

统一约定（阶段 2 子代理交叉验收结论）：

- **同输入同结果**：运势按"属相+日期"确定性；塔罗/抽签暴露种子参数便于测试
- **内容与逻辑分离**：文案/牌面/签诗全部在 `data/`，引擎不含硬编码展示文案
- **统一类型契约**：`engines/types.ts` 是页面与引擎的唯一接口，页面不直接 import 内容库

## 3. 质量保障（阶段 5）

- 48 个单元测试（各引擎自证式：合法性/边界/字段完整性）
- `tests/cross-validate.test.ts` 29 项**独立真值交叉验证**——用外部数学约束校验引擎（干支奇偶配对 / 五行恒为 8 / 塔罗 78 牌 10000 次分布均匀 / 40 签均匀 / 运势跨天差异），不依赖引擎自身逻辑
- 浏览器真实点击回归（agent-browser + CDP）：桌面 + 移动端 375px 全页面

## 4. 部署与线上（阶段 6）

- 平台：腾讯云 CloudBase 静态托管，环境 `suanmingde-d0g9p1ora0e30c601`（个人版 / ap-shanghai）
- 线上：https://suanmingde-d0g9p1ora0e30c601-1451544835.tcloudbaseapp.com
- 流程：`npm run build:local`（webpack，绕宿主 safe-delete）→ `pwsh scripts/deploy.ps1`
- 已知限制与域名方案：见 `DEPLOY.md`（测试域名提示页需自定义域名 + ICP 备案去除）

## 5. 二期扩展点（预留）

- `src/app/api/*`：占位 README 已列接口草案（分享卡片预览 / 访问统计 / 用户收藏），接 CloudBase 云函数 + 云数据库即可，无需改页面架构
- 分享卡 OG 图：`NEXT_PUBLIC_SITE_URL` 注入 sitemap/OG，上线后按域名重建
- 若上 EdgeOne Pages：控制台配置构建命令 `npm run build:local`、输出目录 `out`、Node 22
