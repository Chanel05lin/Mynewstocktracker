# Supabase API 访问问题排查指南

本指南将帮助您解决 `https://nanyeperznosnxqbawvf.supabase.co/` 无法访问的问题。

## 1. 网络连接验证

### 步骤 1：检查基本网络连接
```bash
# 测试网络连接
ping google.com

# 测试 DNS 解析
nslookup nanyeperznosnxqbawvf.supabase.co

# 测试 HTTP 访问
curl -v https://nanyeperznosnxqbawvf.supabase.co/
```

### 步骤 2：检查防火墙和代理设置
- 确认您的网络没有防火墙阻止对 Supabase 的访问
- 检查是否使用了代理服务器，可能需要配置代理设置
- 尝试使用不同的网络环境（如手机热点）

## 2. Supabase 项目状态验证

### 步骤 1：检查 Supabase 项目状态
1. 打开 Supabase 控制台：`https://supabase.com/dashboard`
2. 登录您的账户
3. 找到您的项目：`NewStockTracker`
4. 确认项目状态是否为 **Active**

### 步骤 2：检查项目是否过期
- 确认您的 Supabase 计划是否有效
- 检查是否有未支付的账单
- 确认项目是否被暂停或删除

## 3. API 配置验证

### 步骤 1：验证项目 ID
- 确认项目 ID 正确：`nanyeperznosnxqbawvf`
- 检查 URL 格式是否正确：`https://[project-id].supabase.co`

### 步骤 2：验证 API 密钥
1. 在 Supabase 控制台中，进入 **Project Settings** → **API**
2. 切换到 **Legacy anon, service_role API keys** 标签
3. 确认 `anon` 密钥与代码中的 `publicAnonKey` 一致
4. 检查密钥是否过期

### 步骤 3：测试 API 端点
```bash
# 测试基本 API 访问
curl -v https://nanyeperznosnxqbawvf.supabase.co/rest/v1/

# 测试使用 API 密钥的访问
curl -v https://nanyeperznosnxqbawvf.supabase.co/rest/v1/ \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hbnllcGVyem5vc254cWJhd3ZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5OTk4MjUsImV4cCI6MjA4NjU3NTgyNX0.BfI4DMbJHWqloBfX1mv4hqz73tFh0-qtKzzqQDHIfDY"

# 测试认证端点
curl -v https://nanyeperznosnxqbawvf.supabase.co/auth/v1/user \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hbnllcGVyem5vc254cWJhd3ZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5OTk4MjUsImV4cCI6MjA4NjU3NTgyNX0.BfI4DMbJHWqloBfX1mv4hqz73tFh0-qtKzzqQDHIfDY"
```

## 4. 函数部署验证

### 步骤 1：检查 Supabase Functions
1. 在 Supabase 控制台中，进入 **Functions** 部分
2. 确认 `make-server-08a91c5a` 函数已存在
3. 检查函数状态是否为 **Deployed**

### 步骤 2：测试函数调用
```bash
# 测试函数调用
curl -v https://nanyeperznosnxqbawvf.supabase.co/functions/v1/make-server-08a91c5a/portfolio \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hbnllcGVyem5vc254cWJhd3ZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5OTk4MjUsImV4cCI6MjA4NjU3NTgyNX0.BfI4DMbJHWqloBfX1mv4hqz73tFh0-qtKzzqQDHIfDY" \
  -H "X-User-Id: test-user"
```

## 5. CORS 配置验证

### 步骤 1：检查 CORS 设置
1. 在 Supabase 控制台中，进入 **Authentication** → **Settings**
2. 在 **Site URL** 部分，添加您的部署 URL：
   - `https://mystockdailyreminder.vercel.app`
   - `http://localhost:5173` (用于本地开发)
3. 保存更改

### 步骤 2：验证 CORS 响应头
```bash
# 测试 CORS 响应头
curl -v -X OPTIONS https://nanyeperznosnxqbawvf.supabase.co/functions/v1/make-server-08a91c5a/portfolio \
  -H "Origin: https://mystockdailyreminder.vercel.app" \
  -H "Access-Control-Request-Method: GET"
```

## 6. DNS 和网络服务验证

### 步骤 1：检查 DNS 解析
```bash
# 使用不同的 DNS 服务器测试
nslookup nanyeperznosnxqbawvf.supabase.co 8.8.8.8
nslookup nanyeperznosnxqbawvf.supabase.co 1.1.1.1
```

### 步骤 2：检查 Supabase 服务状态
- 访问 Supabase 状态页面：`https://status.supabase.com/`
- 确认所有服务是否正常运行
- 检查是否有计划维护或服务中断

## 7. 常见错误及解决方案

### 错误类型：连接超时
**可能原因**：
- 网络连接问题
- 防火墙阻止
- Supabase 服务中断

**解决方案**：
- 检查网络连接
- 尝试使用不同网络
- 等待 Supabase 服务恢复

### 错误类型：401 Unauthorized
**可能原因**：
- API 密钥无效
- 密钥过期
- 权限不足

**解决方案**：
- 验证 API 密钥
- 生成新的 API 密钥
- 检查权限设置

### 错误类型：403 Forbidden
**可能原因**：
- CORS 配置错误
- RLS 策略问题
- IP 限制

**解决方案**：
- 检查 CORS 设置
- 验证 RLS 策略
- 检查 IP 限制设置

### 错误类型：404 Not Found
**可能原因**：
- 项目 ID 错误
- 端点不存在
- 函数未部署

**解决方案**：
- 验证项目 ID
- 检查端点路径
- 重新部署函数

## 8. 高级诊断

### 步骤 1：使用在线工具测试
- 使用 https://www.webpagetest.org/ 测试访问
- 使用 https://pingdom.com/ 测试可用性
- 使用 https://dnschecker.org/ 测试 DNS 解析

### 步骤 2：检查代码配置
1. 验证 `utils/supabase/info.tsx` 中的配置：
   ```typescript
   export const projectId = "nanyeperznosnxqbawvf"
export const publicAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hbnllcGVyem5vc254cWJhd3ZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5OTk4MjUsImV4cCI6MjA4NjU3NTgyNX0.BfI4DMbJHWqloBfX1mv4hqz73tFh0-qtKzzqQDHIfDY"
   ```

2. 验证 `utils/supabase/client.ts` 中的客户端创建：
   ```typescript
   import { createClient } from '@supabase/supabase-js'
   import { projectId, publicAnonKey } from './info'

   const supabaseUrl = `https://${projectId}.supabase.co`
   const supabaseAnonKey = publicAnonKey

   export const supabase = createClient(supabaseUrl, supabaseAnonKey)
   ```

### 步骤 3：重新部署 Supabase 函数
1. 在 Supabase 控制台中，进入 **Functions**
2. 找到 `make-server-08a91c5a` 函数
3. 点击 **Deploy** 按钮重新部署
4. 等待部署完成后测试访问

## 9. 联系 Supabase 支持

如果以上步骤无法解决问题，您可以联系 Supabase 支持：

1. **访问支持页面**：https://supabase.com/support
2. **提供以下信息**：
   - 项目 ID：`nanyeperznosnxqbawvf`
   - 具体错误信息
   - 您尝试过的解决方案
   - 网络环境描述

## 10. 临时解决方案

如果 Supabase API 持续无法访问，您可以考虑：

1. **使用本地模拟数据**：
   - 在应用中添加模拟数据
   - 暂时绕过 API 调用

2. **检查代码中的错误处理**：
   - 添加适当的错误处理
   - 显示友好的错误信息给用户

3. **等待并监控**：
   - 有时 Supabase 服务可能会有短暂的中断
   - 持续监控服务状态页面

## 结论

通过系统性地检查网络连接、Supabase 项目配置、API 密钥、CORS 设置等，您应该能够找到并解决 Supabase API 无法访问的问题。如果问题仍然存在，请不要犹豫联系 Supabase 支持团队获取进一步帮助。