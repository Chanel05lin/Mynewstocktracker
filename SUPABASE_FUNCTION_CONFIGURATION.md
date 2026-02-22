# Supabase Functions 配置指南

本指南将帮助您正确配置 Supabase Functions，解决当前遇到的 401 未授权错误问题。

## 1. 环境变量配置

### 问题分析
- 函数代码中使用了以下环境变量：
  ```typescript
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );
  ```
- 这些环境变量可能未在 Supabase Functions 中设置，导致认证失败

### 解决方案

#### 步骤 1：获取必要的环境变量
1. 登录 Supabase 控制台：`https://supabase.com/dashboard/project/nanyeperznosnxqbawvf`
2. 进入 **Settings** → **API**
3. 复制以下信息：
   - **Project URL**：`https://nanyeperznosnxqbawvf.supabase.co`
   - **Service Role Key**：点击 "View Service Role Key" 并复制

#### 步骤 2：在 Supabase Functions 中设置环境变量
1. 进入 **Functions** → **server** → **Settings**
2. 在 **Environment Variables** 部分，添加以下变量：
   - **Key**：`SUPABASE_URL`
   - **Value**：您的 Project URL
   - **Key**：`SUPABASE_SERVICE_ROLE_KEY`
   - **Value**：您的 Service Role Key
3. 点击 "Save Changes"

## 2. 函数代码优化

### 问题分析
- 使用了 `jsr:@supabase/supabase-js@2.49.8` 格式，可能与 Supabase Functions 环境不完全兼容
- 缺少适当的错误处理

### 解决方案

#### 步骤 1：修改依赖导入方式
```typescript
// 原代码
const { createClient } = await import("jsr:@supabase/supabase-js@2.49.8");

// 修改为
import { createClient } from '@supabase/supabase-js';
```

#### 步骤 2：添加环境变量检查
```typescript
// 在函数开始处添加
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing environment variables');
  return c.json({ error: 'Internal server error - missing configuration' }, 500);
}

// 然后使用这些变量
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
```

## 3. 权限配置

### 问题分析
- 401 错误可能是因为函数缺少必要的权限
- Service Role Key 需要有适当的权限才能创建用户

### 解决方案

#### 步骤 1：验证 Service Role Key 权限
1. 确保您使用的是 **Service Role Key**（不是 Anon Key 或 Service Key）
2. Service Role Key 应该具有完全的权限，包括用户管理权限

#### 步骤 2：检查数据库权限
1. 进入 **Authentication** → **Policies**
2. 确保用户表的权限设置正确
3. 对于 `auth.users` 表，Service Role 应该有完全权限

## 4. 函数部署

### 步骤 1：重新部署函数
1. 进入 **Functions** → **server**
2. 点击 **Deploy** 按钮
3. 等待部署完成

### 步骤 2：测试函数

#### 测试健康检查端点
```bash
curl -v https://nanyeperznosnxqbawvf.supabase.co/functions/v1/server/health
```

#### 测试股票数据端点
```bash
curl -v https://nanyeperznosnxqbawvf.supabase.co/functions/v1/server/stock/600519
```

#### 测试用户注册端点
```bash
curl -v -X POST https://nanyeperznosnxqbawvf.supabase.co/functions/v1/server/auth/signup \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hbnllcGVyem5vc254cWJhd3ZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5OTk4MjUsImV4cCI6MjA4NjU3NTgyNX0.BfI4DMbJHWqloBfX1mv4hqz73tFh0-qtKzzqQDHIfDY" \
  -d '{"email": "test@example.com", "password": "password123"}'
```

## 5. 日志和监控

### 步骤 1：查看函数日志
1. 进入 **Functions** → **server** → **Logs**
2. 查看最近的日志，寻找错误信息
3. 特别注意与环境变量、认证相关的错误

### 步骤 2：监控函数调用
1. 进入 **Functions** → **server** → **Invocations**
2. 查看最近的调用记录
3. 检查每个调用的状态码和响应时间

## 6. 常见问题排查

### 问题 1：环境变量未设置
**症状**：
- 函数返回 500 错误
- 日志中显示 "Missing environment variables"

**解决方案**：
- 按照本指南第 1 节设置环境变量
- 确保变量名称完全匹配
- 重新部署函数

### 问题 2：Service Role Key 无效
**症状**：
- 函数返回 401 或 403 错误
- 日志中显示认证失败

**解决方案**：
- 确认使用的是正确的 Service Role Key
- 检查 Service Role Key 是否过期
- 重新生成 Service Role Key 并更新环境变量

### 问题 3：依赖项问题
**症状**：
- 函数部署失败
- 日志中显示依赖项错误

**解决方案**：
- 使用 Supabase Functions 支持的依赖项格式
- 避免使用 Deno 特定的包管理器格式
- 确保依赖项版本兼容

### 问题 4：权限不足
**症状**：
- 函数返回 403 错误
- 日志中显示权限不足

**解决方案**：
- 确保 Service Role Key 具有适当的权限
- 检查数据库策略设置
- 验证用户表权限

## 7. 代码优化建议

### 7.1 优化错误处理
```typescript
// 原代码
const { data, error } = await supabase.auth.admin.createUser({...});

if (error) {
  console.error('Signup error:', error);
  return c.json({ error: error.message }, 400);
}

// 优化后
const { data, error } = await supabase.auth.admin.createUser({...});

if (error) {
  console.error('Signup error:', error);
  return c.json({ 
    error: error.message, 
    details: error.details 
  }, error.status || 400);
}
```

### 7.2 优化依赖导入
```typescript
// 原代码
const { createClient } = await import("jsr:@supabase/supabase-js@2.49.8");

// 优化后
import { createClient } from '@supabase/supabase-js';
```

### 7.3 添加请求验证
```typescript
// 添加到每个端点的开始
const validateRequest = (c, requiredFields) => {
  const body = c.req.json();
  const missingFields = requiredFields.filter(field => !body[field]);
  
  if (missingFields.length > 0) {
    return c.json({ 
      error: `Missing required fields: ${missingFields.join(', ')}` 
    }, 400);
  }
  
  return null;
};

// 使用示例
app.post("/auth/signup", async (c) => {
  const validationError = validateRequest(c, ['email', 'password']);
  if (validationError) return validationError;
  
  // 继续处理请求
});
```

## 8. 完整的函数配置清单

### ✅ 环境变量
- [ ] `SUPABASE_URL`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`

### ✅ 依赖项
- [ ] `@supabase/supabase-js`
- [ ] `hono`
- [ ] `hono/cors`
- [ ] `hono/logger`

### ✅ 权限
- [ ] Service Role Key 权限
- [ ] 数据库表权限
- [ ] 认证权限

### ✅ 测试
- [ ] 健康检查端点
- [ ] 股票数据端点
- [ ] 用户注册端点
- [ ] 观察列表端点
- [ ] 交易记录端点
- [ ] 投资组合端点

## 9. 联系支持

如果以上步骤无法解决问题，您可以联系 Supabase 支持：

1. **访问支持页面**：https://supabase.com/support
2. **提供以下信息**：
   - 项目 ID：`nanyeperznosnxqbawvf`
   - 函数名称：`server`
   - 具体错误信息
   - 您尝试过的解决方案
   - 函数日志

## 10. 结论

通过正确配置环境变量、优化代码和设置适当的权限，您应该能够解决 Supabase Functions 的 401 错误问题。如果问题仍然存在，请参考本指南的故障排除部分或联系 Supabase 支持团队获取进一步帮助。