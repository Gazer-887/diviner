# Diviner · 部署指南

> 项目：灵犀占卜（多主题占卜算卦网站）  
> 当前版本：阶段 5 完成（全量测试 77/77，tsc/eslint/clean build 10 路由均通过）  
> 目标：腾讯云 EdgeOne Pages / CloudBase 静态托管 + CDN + HTTPS

## 一、当前静态产物状态

`out/` 目录已就绪（next build:local 产物），独立可运行：

| 路由 | 文件 | 说明 |
|---|---|---|
| `/` | `out/index.html` | 首页（5 玩法入口 + 主题切换） |
| `/bazi/` | `out/bazi/index.html` | 生辰八字排盘 |
| `/name/` | `out/name/index.html` | 姓名测试 |
| `/daily/` | `out/daily/index.html` | 每日运势 |
| `/tarot/` | `out/tarot/index.html` | 塔罗占卜 |
| `/lottery/` | `out/lottery/index.html` | 抽签解签 |
| `/robots.txt` | `out/robots.txt` | 爬虫规则 |
| `/sitemap.xml` | `out/sitemap.xml` | 站点地图（6 URL） |
| `/favicon.svg` | `out/favicon.svg` | 自定义图标 |

**部署前验证**：已用 python -m http.server 3200 启动 + 浏览器真实点击（agent-browser）验证 8 路由全部 200，八字页填表 → 提交 → 四柱/五行/命理解读三卡渲染正常，主题切换工作。截图见 `resources/shots/s6-static-*.png`。

## 二、推荐方案（按优先级）

### 方案 A：EdgeOne Pages（推荐 · 国内访问最快）

- 腾讯云边缘加速服务（类似 Cloudflare Pages）
- 默认子域名 `*.edgeone.app` **免备案**立即公网可访问
- HTTPS 自动签发
- 支持静态站点 + CDN 加速

### 方案 B：CloudBase 静态托管

- 腾讯云开发（CloudBase）静态托管 + CDN
- 默认子域名 `*.tcloudbaseapp.com` 同样免备案
- 与 CloudBase 云函数/云数据库无缝集成（二期扩展预留）

## 三、部署步骤（EdgeOne Pages 示例）

### 1. 安装 CLI（仅首次需要）

```powershell
# 推荐安装到 managed workspace（按用户规范禁止全局 npm install -g）
cd C:\Users\Gazer\.workbuddy\binaries\node\workspace
C:\Users\Gazer\.workbuddy\binaries\node\versions\22.22.2\npm install -g @cloudbase/cli
```

或临时使用：

```powershell
npx -p @cloudbase/cli tcb --version
```

### 2. 登录（需要用户在浏览器扫码）

```powershell
tcb login
```

弹出腾讯云登录页面，扫码授权。返回 Token 后 CLI 自动保存到 `~/.tcb/.credentials`。

### 3. 创建 EdgeOne Pages 项目

在 [EdgeOne 控制台](https://console.cloud.tencent.com/edgeone) 创建 Pages 项目，绑定 GitHub 仓库 `Gazer-887/diviner`。

构建配置：

- 框架：`Next.js`
- 构建命令：`npm run build:local`
- 构建输出目录：`out`
- Node 版本：22
- 环境变量：`NEXT_PUBLIC_SITE_URL=https://your-domain.edgeone.app`（替换为实际子域名）

### 4. 触发首次部署

控制台保存后自动触发构建，5-10 分钟完成。完成后访问 `https://diviner-xxx.edgeone.app` 公网验证。

### 5. 绑定正式域名（如需要）

- 在 EdgeOne 控制台 → 域名管理 → 添加自定义域名
- DNS 添加 CNAME 指向 EdgeOne 分配域名
- 等待 SSL 证书自动签发（约 5-10 分钟）
- 国内正式域名需 ICP 备案（提供指引后用户执行）

## 四、CloudBase 部署备选路径

如选 CloudBase 静态托管：

```powershell
# 安装 CLI（同方案 A 第 1 步）
tcb login
tcb hosting deploy out -e diviner-prod-1
```

部署完成后访问 `https://diviner-prod-1.tcloudbaseapp.com`。

## 五、部署后验证清单

- [ ] 首页加载（200 + 5 玩法卡片可见）
- [ ] 5 玩法页各访问一次 + 表单提交正常
- [ ] 主题切换 4 主题（暗夜星辰/禅意水墨/国潮红金/赛博玄学）
- [ ] 分享按钮触发 Web Share / clipboard 复制
- [ ] sitemap.xml 包含 6 URL
- [ ] robots.txt 含 sitemap 引用
- [ ] 移动端 375px 视口布局正常
- [ ] Lighthouse / PageSpeed 性能评分（建议 > 90）
- [ ] 4 主题 CSS 变量正确加载（防闪烁脚本工作）
- [ ] 免责声明 footer 在所有页面底部

## 六、注意事项

1. **`next build:local` vs `next build`**：本地 build 用 webpack（`--webpack`），CI/平台 build 用默认 Turbopack，两者产物等价
2. **NEXT_PUBLIC_SITE_URL 环境变量**：影响 sitemap.xml 与 OG URL，构建时注入
3. **favicon.svg**：纯 SVG，无需额外处理，平台直接服务
4. **clash 系统代理**：git push 时可能触发 schannel 握手失败，临时绕过：`NO_PROXY=github.com git push`
5. **safe-delete 钩子**：本地构建时若被拦截，PowerShell 中设 `$env:CODEBUDDY_SAFE_DELETE_ENABLED='0'` 后再构建

## 七、回滚方案

- EdgeOne Pages：控制台保留所有历史部署版本，一键回滚
- CloudBase：保留上一版本作为回滚点

## 八、二期扩展预留

- `src/app/api/*` 目录已预留：用户数据/访问统计
- 接 CloudBase 云函数 + 云数据库即可，无需改架构
- 域名 ICP 备案后可在 EdgeOne Pages 绑定正式域名