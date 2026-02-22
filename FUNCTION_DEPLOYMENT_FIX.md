# Supabase 函数部署修复指南

## 问题分析

经过检查，我发现了导致 Supabase API 无法访问的问题：

### 1. 函数部署不匹配
- **代码中的函数路径**：所有路由都以 `/make-server-08a91c5a/` 开头
- **实际部署的函数**：可能被部署为 `server` 函数（基于目录名称）
- **访问路径**：应该是 `https://nanyeperznosnxqbawvf.supabase.co/functions/v1/server/...`

### 2. 函数代码问题
- 代码使用 `Deno.serve(app.fetch)`，表明这是 Deno 函数
- 路由前缀 `/make-server-08a91c5a/` 可能与实际部署的函数名称冲突

## 解决方案

### 方案 1：修改代码中的路由前缀

#### 步骤 1：修改 index.tsx 文件
```typescript
// 将所有路由前缀从 /make-server-08a91c5a/ 改为 /

// 例如：
// 原代码
app.get("/make-server-08a91c5a/health", (c) => {
  return c.json({ status: "ok" });
});

// 修改为
app.get("/health", (c) => {
  return c.json({ status: "ok" });
});

// 同样修改其他所有路由...
```

#### 步骤 2：重新部署函数
1. 在 Supabase 控制台中，进入 **Functions** 部分
2. 找到 `server` 函数
3. 点击 **Deploy** 按钮重新部署
4. 等待部署完成

### 方案 2：使用正确的函数访问路径

如果不想修改代码，可以使用正确的访问路径：

```bash
# 正确的访问路径格式
https://nanyeperznosnxqbawvf.supabase.co/functions/v1/server/make-server-08a91c5a/...

# 例如：
# 测试健康检查
curl https://nanyeperznosnxqbawvf.supabase.co/functions/v1/server/make-server-08a91c5a/health

# 测试股票数据
curl https://nanyeperznosnxqbawvf.supabase.co/functions/v1/server/make-server-08a91c5a/stock/600519

# 测试 watchlist
curl https://nanyeperznosnxqbawvf.supabase.co/functions/v1/server/make-server-08a91c5a/watchlist
```

### 方案 3：修改前端代码中的 API 调用路径

如果使用方案 2，需要修改前端代码中的 API 调用路径：

#### 步骤 1：修改所有 API 调用
```typescript
// 原代码
const response = await fetch(
  `https://${projectId}.supabase.co/functions/v1/make-server-08a91c5a/${endpoint}/${searchQuery}`,
  {
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`
    }
  }
);

// 修改为
const response = await fetch(
  `https://${projectId}.supabase.co/functions/v1/server/make-server-08a91c5a/${endpoint}/${searchQuery}`,
  {
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`
    }
  }
);
```

## 推荐解决方案

**推荐使用方案 1**，因为：
1. 更简洁的 API 路径
2. 避免路径冗余（不需要 `/server/make-server-08a91c5a/` 这样的双重前缀）
3. 更符合标准的 API 设计

## 详细修改步骤

### 修改 index.tsx 文件

1. **打开** `supabase/functions/server/index.tsx` 文件
2. **替换**所有路由前缀：
   - 将 `/make-server-08a91c5a/health` 改为 `/health`
   - 将 `/make-server-08a91c5a/auth/signup` 改为 `/auth/signup`
   - 将 `/make-server-08a91c5a/stock/:code` 改为 `/stock/:code`
   - 将 `/make-server-08a91c5a/hk-stock/:code` 改为 `/hk-stock/:code`
   - 将 `/make-server-08a91c5a/watchlist` 改为 `/watchlist`
   - 将 `/make-server-08a91c5a/transactions` 改为 `/transactions`
   - 将 `/make-server-08a91c5a/portfolio` 改为 `/portfolio`

3. **修改**前端代码中的 API 调用路径：
   - 将 `https://${projectId}.supabase.co/functions/v1/make-server-08a91c5a/` 改为 `https://${projectId}.supabase.co/functions/v1/server/`

### 重新部署函数

1. **登录** Supabase 控制台
2. **进入** Functions 部分
3. **选择** `server` 函数
4. **点击** Deploy 按钮
5. **等待**部署完成
6. **测试**函数是否可访问

## 测试命令

### 测试健康检查
```bash
curl -v https://nanyeperznosnxqbawvf.supabase.co/functions/v1/server/health
```

### 测试股票数据
```bash
curl -v https://nanyeperznosnxqbawvf.supabase.co/functions/v1/server/stock/600519
```

### 测试 watchlist
```bash
curl -v https://nanyeperznosnxqbawvf.supabase.co/functions/v1/server/watchlist \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hbnllcGVyem5vc254cWJhd3ZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5OTk4MjUsImV4cCI6MjA4NjU3NTgyNX0.BfI4DMbJHWqloBfX1mv4hqz73tFh0-qtKzzqQDHIfDY" \
  -H "X-User-Id: test-user"
```

### 测试 portfolio
```bash
curl -v https://nanyeperznosnxqbawvf.supabase.co/functions/v1/server/portfolio \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hbnllcGVyem5vc254cWJhd3ZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5OTk4MjUsImV4cCI6MjA4NjU3NTgyNX0.BfI4DMbJHWqloBfX1mv4hqz73tFh0-qtKzzqQDHIfDY" \
  -H "X-User-Id: test-user"
```

## 前端代码修改

### 修改 Holdings.tsx
```typescript
// 原代码
const watchlistResponse = await fetch(
  `https://${projectId}.supabase.co/functions/v1/make-server-08a91c5a/watchlist`,
  {
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`,
      ...getAuthHeaders()
    }
  }
);

// 修改为
const watchlistResponse = await fetch(
  `https://${projectId}.supabase.co/functions/v1/server/watchlist`,
  {
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`,
      ...getAuthHeaders()
    }
  }
);

// 同样修改其他 API 调用...
```

### 修改 AddStockModal.tsx
```typescript
// 原代码
const response = await fetch(
  `https://${projectId}.supabase.co/functions/v1/make-server-08a91c5a/${endpoint}/${searchQuery}`,
  {
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`
    }
  }
);

// 修改为
const response = await fetch(
  `https://${projectId}.supabase.co/functions/v1/server/${endpoint}/${searchQuery}`,
  {
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`
    }
  }
);
```

### 修改 StockDetail.tsx
```typescript
// 原代码
const stockResponse = await fetch(
  `https://${projectId}.supabase.co/functions/v1/make-server-08a91c5a/${endpoint}/${stockCode}`,
  {
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`
    }
  }
);

// 修改为
const stockResponse = await fetch(
  `https://${projectId}.supabase.co/functions/v1/server/${endpoint}/${stockCode}`,
  {
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`
    }
  }
);

// 同样修改其他 API 调用...
```

### 修改 TransactionForm.tsx
```typescript
// 原代码
const url = isEditing
  ? `https://${projectId}.supabase.co/functions/v1/make-server-08a91c5a/transactions/${editTransaction.id}`
  : `https://${projectId}.supabase.co/functions/v1/make-server-08a91c5a/transactions`;

// 修改为
const url = isEditing
  ? `https://${projectId}.supabase.co/functions/v1/server/transactions/${editTransaction.id}`
  : `https://${projectId}.supabase.co/functions/v1/server/transactions`;
```

### 修改 Analysis.tsx
```typescript
// 原代码
const response = await fetch(
  `https://${projectId}.supabase.co/functions/v1/make-server-08a91c5a/transactions`,
  {
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`,
      ...getAuthHeaders()
    }
  }
);

// 修改为
const response = await fetch(
  `https://${projectId}.supabase.co/functions/v1/server/transactions`,
  {
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`,
      ...getAuthHeaders()
    }
  }
);

// 同样修改其他 API 调用...
```

## 验证修复

1. **重新部署** Supabase 函数
2. **修改**前端代码中的 API 调用路径
3. **测试** API 访问
4. **构建**前端项目
5. **部署**到 Vercel
6. **验证**网站是否正常访问

## 常见问题排查

### 1. 函数部署失败
**解决方案**：
- 检查函数代码是否有语法错误
- 确认 Deno 版本是否兼容
- 检查环境变量是否正确设置

### 2. API 调用仍然失败
**解决方案**：
- 确认函数部署状态
- 检查 API 路径是否正确
- 验证 API 密钥是否有效
- 查看函数日志获取详细错误信息

### 3. 前端构建失败
**解决方案**：
- 检查所有 API 路径修改是否正确
- 确认依赖项是否安装
- 验证 TypeScript 类型是否正确

## 结论

通过修改函数路由前缀和前端 API 调用路径，您应该能够解决 Supabase API 无法访问的问题。如果问题仍然存在，请参考 Supabase 文档或联系支持团队获取进一步帮助。