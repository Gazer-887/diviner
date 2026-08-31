#!/usr/bin/env pwsh
# ============================================================
# Diviner · 备份清理脚本
# 用法：pwsh scripts/clean-backups.ps1
# 功能：扫描 .next.bak* / .next.old / out.bak* / out.old 等历史
#       构建产物备份目录，按大小排序列出，由用户确认后删除
# 警告：删除不可逆 —— 确认列表无误再输入 y
# ============================================================

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set |  -Location $root

Write-Host "`n[Diviner] 备份目录扫描 ...`n" -ForegroundColor Cyan

$patterns = @('.next.bak*', '.next.old', 'out.bak*', 'out.old')
$targets  = @()
foreach ($p in $patterns) {
    Get-ChildItem -Path $root -Filter $p -Directory -ErrorAction SilentlyContinue | ForEach-Object {
        $size = (Get-ChildItem -Path $_.FullName -Recurse -File -ErrorAction SilentlyContinue |
                 Measure-Object -Property Length -Sum).Sum
        $targets += [PSCustomObject]@{
            Name = $_.Name
            Size = $size
            Path = $_.FullName
        }
    }
}

if ($targets.Count -eq 0) {
    Write-Host "没有发现备份目录，无需清理。" -ForegroundColor Green
    exit 0
}

$targets | Sort-Object Size -Descending | Format-Table Name, @{N="Size(MB)";E={[math]::Round($_.Size/1MB,1)}}, Path -AutoSize

$total = ($targets | Measure-Object -Property Size -Sum).Sum
Write-Host ("总大小：{0:N1} MB（{1:N2} GB）" -f ($total/1MB), ($total/1GB)) -ForegroundColor Yellow

Write-Host "`n所有目录均在 .gitignore 内（/.next*/、/out*/），删除不影响 git 仓库。" -ForegroundColor Gray

$answer = Read-Host "`n确认删除以上全部备份目录？输入 y 继续，其他键取消"
if ($answer -ne 'y') {
    Write-Host "已取消，未删除任何文件。" -ForegroundColor Yellow
    exit 0
}

foreach ($t in $targets) {
    Write-Host "  删除 $($t.Name) ..." -ForegroundColor Red
    Remove-Item -Path $t.Path -Recurse -Force -ErrorAction SilentlyContinue
}

Write-Host "`n[完成] 已清理 $($targets.Count) 个备份目录" -ForegroundColor Green