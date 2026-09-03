#!/usr/bin/env pwsh
# ============================================================
# Diviner · 腾讯云部署脚本（CloudBase / EdgeOne Pages 通用）
# 用法：pwsh scripts/deploy.ps1
# 前置：DEPLOY.md 中的 CLI 安装步骤
# ============================================================

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

# 关闭 safe-delete shim（L15 教训：构建前必须设）
$env:CODEBUDDY_SAFE_DELETE_ENABLED = '0'

# 已上线环境（2026-09-01 CloudBase CLI 部署）；回车即用默认值
$defaultEnvId = 'suanmingde-d0g9p1ora0e30c601'

# 预置遥测开关，跳过无 TTY 下 tcb 的「是否收集使用数据」卡死询问（L17）
$usageFile = Join-Path $env:USERPROFILE '.config\.cloudbase\usage.json'
try {
    if (-not (Test-Path (Split-Path $usageFile))) {
        New-Item -ItemType Directory -Path (Split-Path $usageFile) -Force | Out-Null
    }
    Set-Content -Path $usageFile -Value '{"agreeCollect": false}' -Encoding UTF8
} catch { Write-Host "（跳过 usage.json 预置：$($_.Exception.Message)）" -ForegroundColor DarkGray }

Write-Host "`n[Diviner] 部署流程`n" -ForegroundColor Cyan

# 1. 干净构建
Write-Host "[1/4] 干净构建 ..." -ForegroundColor Yellow
if (Test-Path out) {
    Remove-Item -Path out -Recurse -Force -ErrorAction SilentlyContinue
}
npm run build:local
if ($LASTEXITCODE -ne 0) {
    Write-Host "构建失败，请检查上方错误。" -ForegroundColor Red
    exit 1
}

# 2. 验证 out/ 完整性
Write-Host "`n[2/4] 验证 out/ 完整性 ..." -ForegroundColor Yellow
$routes = @('/', '/bazi/', '/name/', '/daily/', '/tarot/', '/lottery/', '/robots.txt', '/sitemap.xml')
$allOk = $true
foreach ($r in $routes) {
    $f = Join-Path "out" ($r.TrimStart('/'))
    if ($r -eq '/') { $f = 'out/index.html' }
    if (Test-Path $f) {
        Write-Host "  OK  $r" -ForegroundColor Green
    } else {
        Write-Host "  缺失 $r" -ForegroundColor Red
        $allOk = $false
    }
}
if (-not $allOk) {
    Write-Host "out/ 不完整，请检查构建日志。" -ForegroundColor Red
    exit 1
}

# 3. 登录
Write-Host "`n[3/4] 腾讯云登录（请在浏览器扫码）..." -ForegroundColor Yellow
tcb login
if ($LASTEXITCODE -ne 0) {
    Write-Host "登录失败，请重试。" -ForegroundColor Red
    exit 1
}

# 4. 部署
Write-Host "`n[4/4] 部署 out/ 到腾讯云静态托管 ..." -ForegroundColor Yellow
$envId = Read-Host "请输入 CloudBase 环境 ID（默认 $defaultEnvId，直接回车）"
if ([string]::IsNullOrWhiteSpace($envId)) {
    $envId = $defaultEnvId
}

tcb hosting deploy out -e $envId
if ($LASTEXITCODE -ne 0) {
    Write-Host "部署失败。" -ForegroundColor Red
    exit 1
}

Write-Host "`n[完成] 部署成功" -ForegroundColor Green
Write-Host "访问：https://$envId.tcloudbaseapp.com" -ForegroundColor Cyan