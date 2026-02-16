@echo off

REM 设置颜色
echo [[92mINFO[0m] 开始推送更改到 GitHub...

REM 检查当前目录是否为 Git 仓库
if not exist ".git" (
    echo [[91mERROR[0m] 当前目录不是 Git 仓库！
    pause
    exit /b 1
)

REM 检查是否有修改
for /f %%i in ('git status --porcelain') do (
    set "has_changes=1"
    goto :has_changes
)

echo [[93mWARNING[0m] 没有检测到任何修改，跳过推送。
pause
exit /b 0

:has_changes

REM 添加所有修改的文件
echo [[92mINFO[0m] 添加所有修改的文件...
git add .

if %errorlevel% neq 0 (
    echo [[91mERROR[0m] 添加文件失败！
    pause
    exit /b 1
)

REM 生成时间戳作为提交消息
for /f "tokens=1-4 delims=/: " %%a in ('echo %time%') do set "time_str=%%a-%%b-%%c"
set "commit_msg=Auto-update from Figma - %date% %time_str%"

echo [[92mINFO[0m] 提交更改，提交消息：%commit_msg%
git commit -m "%commit_msg%"

if %errorlevel% neq 0 (
    echo [[91mERROR[0m] 提交失败！
    pause
    exit /b 1
)

REM 推送到远程仓库
echo [[92mINFO[0m] 推送到 GitHub...
git push origin main

if %errorlevel% neq 0 (
    echo [[91mERROR[0m] 推送失败！
    pause
    exit /b 1
)

echo [[92mSUCCESS[0m] 成功推送到 GitHub！
pause
exit /b 0