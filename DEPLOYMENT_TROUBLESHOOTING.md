// 旧路径
`https://nanyeperznosnxqbawvf.supabase.co/functions/v1/server/...`

// 新路径
`https://tgfroechmxiirzngeyjg.supabase.co/functions/v1/server/...`// 旧路径
`https://nanyeperznosnxqbawvf.supabase.co/functions/v1/server/...`

// 新路径
`https://tgfroechmxiirzngeyjg.supabase.co/functions/v1/server/...`# 部署问题排查指南

本指南将帮助您一步一步验证 GitHub、Supabase、Vercel 和 Figma 的配置，找出部署后服务器无法访问的问题所在。

## 1. GitHub 配置验证

### 步骤 1：检查仓库状态
```bash
# 检查当前分支和远程仓库
git branch
git remote -v

# 检查最近的提交
git log --oneline -n 5

# 检查工作区状态
git status
```

### 步骤 2：验证仓库连接
1. 打开浏览器访问您的 GitHub 仓库：`https://github.com/Chanel05lin/Mynewstocktracker`
2. 确认仓库存在且包含正确的文件
3. 检查最近的提交是否已推送到远程仓库

### 步骤 3：检查分支配置
- 确认默认分支是否为 `main`
- 确认 Vercel 部署配置是否指向正确的分支

## 2. Supabase 配置验证

### 步骤 1：检查 Supabase 项目配置
1. 打开 Supabase 控制台：`https://supabase.com/dashboard/project/nanyeperznosnxqbawvf`
2. 验证项目状态是否正常
3. 检查 API 设置中的项目 ID 和匿名密钥

### 步骤 2：验证环境变量
检查 `utils/supabase/info.tsx` 文件：
```typescript
export const projectId = "nanyeperznosnxqbawvf"
export const publicAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hbnllcGVyem5vc254cWJhd3ZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5OTk4MjUsImV4cCI6MjA4NjU3NTgyNX0.BfI4DMbJHWqloBfX1mv4hqz73tFh0-qtKzzqQDHIfDY"
```

### 步骤 3：验证函数部署
1. 检查 `supabase/functions/server/` 目录下的函数
2. 确认函数已成功部署到 Supabase
3. 测试函数是否可以正常调用

### 步骤 4：检查数据库配置
- 确认必要的表结构已创建
- 验证 RLS (Row Level Security) 配置
- 检查数据库连接权限

## 3. Vercel 配置验证

### 步骤 1：检查 Vercel 项目状态
1. 打开 Vercel 控制台：`https://vercel.com/chanel05lins-projects/mystockdailyreminder`
2. 检查最近的部署状态
3. 查看部署日志，寻找错误信息

### 步骤 2：验证部署配置
- 确认构建命令：`npm run build`
- 确认输出目录：`dist`
- 确认框架设置：`vite`
- 检查环境变量配置

### 步骤 3：测试部署链接
1. 访问部署的 URL：`https://mystockdailyreminder.vercel.app/`
2. 检查浏览器控制台是否有错误
3. 检查网络请求是否成功

### 步骤 4：检查域名配置（如果有）
- 确认域名已正确配置
- 验证 SSL 证书状态
- 检查 DNS 记录

## 4. Figma 集成验证

### 步骤 1：检查 Figma 项目
1. 打开 Figma 项目：`https://www.figma.com/make/u2MLve3Rg9lOdfZ0fdY5ed/Stock-Track?p=f&t=jJHwYhBwRfkpzdS2-0`
2. 确认项目状态正常
3. 检查最近的更新是否正确导出

### 步骤 2：验证 Figma 到 GitHub 的集成
- 确认 Figma 更改已正确推送到 GitHub
- 检查导出的代码是否符合预期
- 验证文件结构是否正确

### 步骤 3：检查代码同步
- 确认 Figma 导出的代码与本地代码一致
- 检查是否有未提交的更改
- 验证所有必要的文件都已包含

## 5. 应用代码验证

### 步骤 1：检查构建过程
```bash
# 安装依赖
npm install

# 构建项目
npm run build

# 检查构建输出
ls -la dist/
```

### 步骤 2：验证路径配置
- 确认所有导入路径使用相对路径
- 检查 `vite.config.ts` 中的别名配置
- 验证 `index.html` 中的脚本路径

### 步骤 3：测试本地开发服务器
```bash
# 启动开发服务器
npm run dev

# 访问本地地址
# http://localhost:5173/
```

### 步骤 4：检查关键文件
- `package.json`：依赖和脚本配置
- `vercel.json`：Vercel 部署配置
- `vite.config.ts`：Vite 构建配置
- `src/main.tsx`：应用入口
- `src/app/App.tsx`：主应用组件

## 6. 网络与安全验证

### 步骤 1：检查网络连接
- 验证服务器可以访问 Supabase API
- 检查防火墙设置
- 测试网络延迟和稳定性

### 步骤 2：验证 CORS 配置
- 检查 Supabase 项目的 CORS 设置
- 确认 Vercel 部署的 CORS 配置
- 测试跨域请求是否正常

### 步骤 3：检查认证配置
- 验证 Supabase 认证设置
- 检查 JWT 配置
- 测试用户注册和登录功能

## 7. 常见问题排查

### 问题 1：Vercel 部署失败
**症状**：部署日志显示构建错误
**排查步骤**：
- 检查依赖安装是否成功
- 验证构建命令是否正确
- 查看具体的错误信息
- 测试本地构建是否成功

### 问题 2：应用无法加载
**症状**：访问部署 URL 显示空白页面或错误
**排查步骤**：
- 检查浏览器控制台错误
- 验证网络请求是否成功
- 检查 Supabase 连接是否正常
- 测试 API 调用是否失败

### 问题 3：API 调用失败
**症状**：应用加载但功能无法使用
**排查步骤**：
- 检查 Supabase 函数是否部署成功
- 验证 API 密钥是否正确
- 测试函数调用是否返回正确数据
- 检查认证状态是否有效

### 问题 4：路由问题
**症状**：页面刷新后显示 404 错误
**排查步骤**：
- 检查 `vercel.json` 中的重写配置
- 验证 Vite 路由设置
- 测试不同路径的访问

## 8. 高级诊断

### 步骤 1：使用 Vercel 调试工具
- 启用 Vercel 项目的调试模式
- 查看详细的部署日志
- 检查环境变量值

### 步骤 2：测试 API 端点
```bash
# 测试 Supabase 函数
curl -X GET "https://nanyeperznosnxqbawvf.supabase.co/functions/v1/make-server-08a91c5a/portfolio" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hbnllcGVyem5vc254cWJhd3ZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5OTk4MjUsImV4cCI6MjA4NjU3NTgyNX0.BfI4DMbJHWqloBfX1mv4hqz73tFh0-qtKzzqQDHIfDY" \
  -H "X-User-Id: test-user"
```

### 步骤 3：检查服务状态
- 访问 Supabase 状态页面：`https://status.supabase.com/`
- 检查 Vercel 状态页面：`https://vercel.status.com/`
- 确认相关服务是否正常运行

## 9. 解决方案汇总

### 快速修复步骤
1. **重新部署**：在 Vercel 控制台手动触发重新部署
2. **检查环境变量**：确保所有必要的环境变量已配置
3. **验证分支**：确认 Vercel 部署指向正确的分支
4. **测试本地构建**：确保本地构建成功后再部署
5. **检查网络连接**：验证服务器可以访问所有必要的 API

### 常见错误及解决方案

| 错误类型 | 可能原因 | 解决方案 |
|---------|---------|--------|
| 构建失败 | 依赖问题 | 重新安装依赖并测试构建 |
| 页面空白 | 路径错误 | 修复导入路径和配置 |
| API 错误 | 认证失败 | 检查 API 密钥和认证配置 |
| 404 错误 | 路由配置 | 检查重写规则和路由设置 |
| 网络错误 | CORS 配置 | 检查跨域设置 |

## 10. 联系支持

如果以上步骤无法解决问题，您可以：

1. **Supabase 支持**：
   - 访问 https://supabase.com/support
   - 提供项目 ID 和具体错误信息

2. **Vercel 支持**：
   - 访问 https://vercel.com/support
   - 提供部署 ID 和错误日志

3. **Figma 支持**：
   - 访问 https://help.figma.com/hc/en-us
   - 提供项目链接和导出问题描述

## 结论

通过系统性地检查 GitHub、Supabase、Vercel 和 Figma 的配置，您应该能够找到并解决部署后服务器无法访问的问题。本指南提供了全面的排查步骤，帮助您快速定位问题所在。

如果您在执行过程中遇到任何困难，请随时参考本指南的相关部分，或联系相应服务的支持团队获取帮助。