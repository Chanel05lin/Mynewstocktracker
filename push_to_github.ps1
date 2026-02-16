Write-Host "[INFO] 开始推送更改到 GitHub..." -ForegroundColor Green

# 检查当前目录是否为 Git 仓库
if (-not (Test-Path ".git")) {
    Write-Host "[ERROR] 当前目录不是 Git 仓库！" -ForegroundColor Red
    Read-Host "按 Enter 键退出..."
    exit 1
}

# 检查是否有修改
$changes = git status --porcelain
if (-not $changes) {
    Write-Host "[WARNING] 没有检测到任何修改，跳过推送。" -ForegroundColor Yellow
    Read-Host "按 Enter 键退出..."
    exit 0
}

# 添加所有修改的文件
Write-Host "[INFO] 添加所有修改的文件..." -ForegroundColor Green
git add .

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] 添加文件失败！" -ForegroundColor Red
    Read-Host "按 Enter 键退出..."
    exit 1
}

# 生成时间戳作为提交消息
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$commit_msg = "Auto-update from Figma - $timestamp"

Write-Host "[INFO] 提交更改，提交消息：$commit_msg" -ForegroundColor Green
git commit -m "$commit_msg"

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] 提交失败！" -ForegroundColor Red
    Read-Host "按 Enter 键退出..."
    exit 1
}

# 推送到远程仓库
Write-Host "[INFO] 推送到 GitHub..." -ForegroundColor Green
git push origin main

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] 推送失败！" -ForegroundColor Red
    Read-Host "按 Enter 键退出..."
    exit 1
}

Write-Host "[SUCCESS] 成功推送到 GitHub！" -ForegroundColor Green
Read-Host "按 Enter 键退出..."
exit 0