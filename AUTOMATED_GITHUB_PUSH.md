# Figma 代码自动推送到 GitHub 指南

本指南将帮助您实现每次从 Figma 修改代码后，自动将更改推送到 GitHub 仓库。

## 准备工作

### 1. 确保已完成的设置
- ✅ 已初始化 Git 仓库
- ✅ 已关联到 GitHub 远程仓库
- ✅ 已创建 `.gitignore` 文件

### 2. 检查远程仓库连接
```bash
git remote -v
```

您应该看到类似以下输出：
```
origin  https://github.com/Chanel05lin/Mystockdailyreminder.git (fetch)
origin  https://github.com/Chanel05lin/Mystockdailyreminder.git (push)
```

## 自动化推送方案

### 方案 1：使用批处理脚本（适合 Windows 用户）

#### 使用方法：
1. **双击运行** `push_to_github.bat` 文件
2. 脚本会自动：
   - 检查是否有修改
   - 添加所有修改的文件
   - 生成带时间戳的提交消息
   - 推送到 GitHub

#### 优势：
- 操作简单，双击即可执行
- 适合不熟悉命令行的用户

### 方案 2：使用 PowerShell 脚本（功能更强大）

#### 使用方法：
1. **右键点击** `push_to_github.ps1` 文件
2. 选择 **"使用 PowerShell 运行"**
3. 脚本会自动执行与批处理脚本相同的操作

#### 优势：
- 颜色输出更清晰
- 错误处理更完善

## 自动化工作流建议

### 推荐工作流程：
1. **从 Figma 导出/修改代码**
2. **保存修改**
3. **双击运行** `push_to_github.bat` 或 `push_to_github.ps1`
4. **等待推送完成**
5. **在 Vercel 上查看自动部署状态**

### 注意事项：

1. **首次运行可能需要认证**：
   - 如果是第一次推送，Git 可能会要求您输入 GitHub 用户名和密码
   - 建议使用 GitHub 个人访问令牌（Personal Access Token）进行认证

2. **确保网络连接正常**：
   - 推送需要稳定的网络连接
   - 如果网络不稳定，推送可能会失败

3. **不要修改不需要的文件**：
   - 脚本会添加所有修改的文件
   - 确保只修改您需要的文件

4. **定期检查推送状态**：
   - 推送完成后，建议登录 GitHub 检查是否成功
   - 查看 Vercel 部署状态是否正常

## 常见问题排查

### 1. 推送失败，提示 "fatal: not a git repository"
- **原因**：当前目录不是 Git 仓库
- **解决**：确保在项目根目录运行脚本

### 2. 推送失败，提示 "Permission denied"
- **原因**：Git 认证失败
- **解决**：重新输入正确的 GitHub 凭据或使用个人访问令牌

### 3. 推送失败，提示 "Updates were rejected"
- **原因**：远程仓库有本地没有的更改
- **解决**：手动运行 `git pull origin main` 拉取最新更改，然后再运行脚本

### 4. 没有检测到修改
- **原因**：文件可能没有被正确保存或修改
- **解决**：确保文件已保存，然后再次运行脚本

## 高级选项

### 自定义提交消息
如果您想自定义提交消息，可以修改脚本中的 `commit_msg` 变量：

#### 批处理脚本：
```batch
set "commit_msg=Your custom commit message"
```

#### PowerShell 脚本：
```powershell
$commit_msg = "Your custom commit message"
```

### 推送分支
如果您想推送到不同的分支，可以修改脚本中的分支名称：

#### 批处理脚本：
```batch
git push origin your-branch-name
```

#### PowerShell 脚本：
```powershell
git push origin your-branch-name
```

## 总结

通过使用这些自动化脚本，您可以：
- ✅ 减少手动操作步骤
- ✅ 确保代码及时同步到 GitHub
- ✅ 实现从 Figma 到 GitHub 的无缝工作流
- ✅ 自动触发 Vercel 部署

祝您使用愉快！ 🚀