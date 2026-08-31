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
$envId = Read-Host "请输入 CloudBase 环境 ID（首次部署留空创建新环境）"
if ([string]::IsNullOrWhiteSpace($envId)) {
    Write-Host "首次部署：请先在 CloudBase 控制台创建环境，然后重新运行此脚本。" -ForegroundColor Yellow
    Write-Host "或参考 DEPLOY.md 中的 EdgeOne Pages 流程。" -ForegroundColor Yellow
    exit 0
}

tcb hosting deploy out -e $envId
if ($LASTEXITCODE -ne 0) {
    Write-Host "部署失败。" -ForegroundColor Red
    exit 1
}

Write-Host "`n[完成] 部署成功" -ForegroundColor Green
Write-Host "访问：https://$envId.tcloudbaseapp.com" -ForegroundColor Cyan