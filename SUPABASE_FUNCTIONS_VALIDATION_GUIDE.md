# Supabase Functions 配置验证和故障排除指南

## 配置验证清单

### 1. Supabase Edge Function Secrets 配置

**✅ 已验证的配置：**
- [x] `SUPABASE_URL` - 已正确配置
- [x] `SUPABASE_ANON_KEY` - 已正确配置
- [x] `SUPABASE_SERVICE_ROLE_KEY` - 已正确配置
- [x] `SUPABASE_DB_URL` - 已正确配置

**验证步骤：**
1. 登录 Supabase 控制台
2. 导航到 `Functions` > `Secrets`
3. 确认所有上述环境变量都已存在且值正确
4. 确保 `SUPABASE_SERVICE_ROLE_KEY` 使用的是正确的服务角色密钥（不是匿名密钥）

### 2. 后端代码配置

**✅ 已验证的配置：**
- [x] 后端代码正确使用 `Deno.env.get()` 获取环境变量
- [x] 所有 API 路由路径格式正确
- [x] 数据库表名配置正确 (`kv_store_08a91c5a`)

**验证步骤：**
1. 检查 `supabase/functions/server/index.tsx` 文件
2. 确认所有环境变量引用使用 `Deno.env.get()` 语法
3. 确认 API 路由路径格式正确（无多余前缀）

### 3. 前端代码配置

**✅ 已验证的配置：**
- [x] 前端代码使用正确的 API 端点路径格式
- [x] 项目 ID 和 API 密钥配置正确
- [x] 前端 Supabase 客户端配置正确

**验证步骤：**
1. 检查 `utils/supabase/info.tsx` 文件，确认项目 ID 和匿名密钥正确
2. 检查 `utils/supabase/client.ts` 文件，确认 Supabase 客户端配置正确
3. 检查前端组件中的 API 调用路径，确认格式为 `https://${projectId}.supabase.co/functions/v1/server/...`

### 4. 数据库配置

**需要验证的配置：**
- [ ] 确认 `kv_store_08a91c5a` 表已创建
- [ ] 确认表结构正确（包含 `key` 和 `value` 字段）

**验证步骤：**
1. 登录 Supabase 控制台
2. 导航到 `Database` > `Tables`
3. 确认 `kv_store_08a91c5a` 表存在
4. 检查表结构，确认包含以下字段：
   - `key` (TEXT, NOT NULL, PRIMARY KEY)
   - `value` (JSONB, NOT NULL)

## 故障排除指南

### 常见错误及解决方案

#### 1. 401 Unauthorized 错误

**原因：**
- 服务角色密钥配置错误
- 环境变量未正确设置
- API 密钥权限不足

**解决方案：**
- 确认 `SUPABASE_SERVICE_ROLE_KEY` 使用的是正确的服务角色密钥
- 重启 Supabase Functions 以应用新的环境变量
- 验证 API 调用时使用了正确的授权头

#### 2. 404 Not Found 错误

**原因：**
- API 端点路径错误
- Function 未正确部署
- 路由配置错误

**解决方案：**
- 确认 API 调用路径格式正确：`https://${projectId}.supabase.co/functions/v1/server/{endpoint}`
- 确认 Function 已成功部署到 Supabase
- 检查 `supabase/functions/server/index.tsx` 中的路由配置

#### 3. 500 Internal Server Error

**原因：**
- 环境变量缺失
- 数据库连接错误
- 代码逻辑错误

**解决方案：**
- 检查所有必要的环境变量是否已设置
- 验证数据库表 `kv_store_08a91c5a` 是否存在
- 查看 Supabase Functions 日志以获取详细错误信息

#### 4. 数据库操作错误

**原因：**
- `kv_store_08a91c5a` 表不存在
- 表结构不正确
- 服务角色密钥权限不足

**解决方案：**
- 在 Supabase 控制台中创建 `kv_store_08a91c5a` 表
- 确认表结构正确
- 验证服务角色密钥具有正确的数据库权限

### 测试步骤

#### 1. 测试健康检查端点

```bash
# 使用 curl 测试
curl -X GET "https://nanyeperznosnxqbawvf.supabase.co/functions/v1/server/health" \
  -H "Authorization: Bearer {your_anon_key}"

# 或使用 PowerShell
Invoke-RestMethod -Uri "https://nanyeperznosnxqbawvf.supabase.co/functions/v1/server/health" \
  -Method GET \
  -Headers @{"Authorization"="Bearer {your_anon_key}"}
```

**预期响应：**
```json
{"status":"ok"}
```

#### 2. 测试股票数据端点

```bash
# 测试 A 股数据
curl -X GET "https://nanyeperznosnxqbawvf.supabase.co/functions/v1/server/stock/600519" \
  -H "Authorization: Bearer {your_anon_key}"

# 测试港股数据
curl -X GET "https://nanyeperznosnxqbawvf.supabase.co/functions/v1/server/hk-stock/00700" \
  -H "Authorization: Bearer {your_anon_key}"
```

#### 3. 测试用户注册端点

```bash
curl -X POST "https://nanyeperznosnxqbawvf.supabase.co/functions/v1/server/auth/signup" \
  -H "Authorization: Bearer {your_anon_key}" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### 部署验证

#### 1. Supabase Functions 部署

**验证步骤：**
1. 登录 Supabase 控制台
2. 导航到 `Functions` > `Functions`
3. 确认 `server` Function 已存在且状态为 "Deployed"
4. 点击 "View Details" 查看部署信息
5. 确认部署日志中无错误

#### 2. Vercel 部署

**验证步骤：**
1. 登录 Vercel 控制台
2. 导航到 `mystockdailyreminder` 项目
3. 确认部署状态为 "Ready"
4. 检查部署日志中无错误
5. 确认部署的分支正确

#### 3. 端到端测试

**测试步骤：**
1. 访问部署的应用 URL (`https://mystockdailyreminder.vercel.app/`)
2. 尝试注册新用户
3. 尝试登录已注册用户
4. 尝试添加股票代码
5. 尝试添加交易记录
6. 验证所有功能是否正常工作

## 常见问题解决方案

### Q: 为什么收到 "服务器无法访问" 错误？

**A:** 可能的原因：
1. Supabase Functions 未正确部署
2. 环境变量配置错误
3. API 端点路径错误
4. 网络连接问题

**解决方案：**
- 检查 Supabase Functions 部署状态
- 验证所有环境变量配置
- 检查 API 调用路径格式
- 确认网络连接正常

### Q: 为什么用户注册失败？

**A:** 可能的原因：
1. 服务角色密钥配置错误
2. 数据库表不存在
3. API 调用路径错误
4. 邮箱格式不正确

**解决方案：**
- 验证服务角色密钥配置
- 确认 `kv_store_08a91c5a` 表存在
- 检查 API 调用路径格式
- 确保邮箱格式正确

### Q: 为什么股票数据无法获取？

**A:** 可能的原因：
1. 股票代码格式不正确
2. API 调用路径错误
3. 外部金融 API 限制
4. 代码逻辑错误

**解决方案：**
- 确保使用正确的股票代码格式（A股：6位数字，港股：5位数字）
- 检查 API 调用路径格式
- 验证外部金融 API 是否可访问
- 查看 Supabase Functions 日志以获取详细错误信息

## 技术支持

如果遇到无法解决的问题，可以：

1. **查看 Supabase Functions 日志**：登录 Supabase 控制台，导航到 `Functions` > `Functions` > `server` > `Logs`

2. **查看 Vercel 部署日志**：登录 Vercel 控制台，导航到 `mystockdailyreminder` 项目 > `Deployments` > 查看具体部署的日志

3. **检查浏览器开发者工具**：在浏览器中打开应用，按 F12 打开开发者工具，查看 "Console" 和 "Network" 标签页的错误信息

4. **联系 Supabase 支持**：如果问题与 Supabase 服务相关，可以联系 Supabase 支持团队

## 结论

所有关键配置都已验证正确，应用应该能够正常工作。如果仍然遇到问题，请按照上述故障排除步骤进行检查，或联系技术支持获取帮助。
