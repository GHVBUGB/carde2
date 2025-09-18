# Vercel 部署问题修复指南

## 问题描述
部署时出现错误：`Error: supabaseUrl is required.`

## 问题原因
1. 环境变量 `NEXT_PUBLIC_SUPABASE_URL` 和 `SUPABASE_SERVICE_ROLE_KEY` 未在 Vercel 中正确配置
2. 代码中使用了 placeholder 值作为默认值，导致构建时 Supabase 客户端初始化失败

## 修复内容

### 1. 代码修复
已修复以下文件中的 Supabase 客户端初始化问题：
- `src/app/api/admin/import-config/route.ts`
- `src/lib/supabase/server.ts`
- `src/app/api/log-download/route.ts`

修复方式：
- 移除了 placeholder 默认值
- 添加了环境变量验证
- 在环境变量缺失时抛出明确的错误信息

### 2. 环境变量配置

#### 在 Vercel 中设置以下环境变量：

**必需的 Supabase 配置：**
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

**其他必需配置：**
```
REMOVE_BG_API_KEY=your_remove_bg_api_key
JWT_SECRET=your_jwt_secret_key
SMTP_HOST=smtp.exmail.qq.com
SMTP_PORT=465
SMTP_USER=no-reply@51talk.com
SMTP_PASS=your_smtp_password
SMTP_FROM=51Talk 名片平台 <no-reply@51talk.com>
ADMIN_EMAIL=admin@51talk.com
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
LOG_LEVEL=info
```

## 部署步骤

### 1. 在 Vercel Dashboard 中配置环境变量
1. 进入项目设置 → Environment Variables
2. 添加上述所有环境变量
3. 确保选择正确的环境（Production, Preview, Development）

### 2. 重新部署
1. 推送代码到 GitHub
2. 或在 Vercel Dashboard 中手动触发重新部署

### 3. 验证部署
部署成功后，访问以下端点验证：
- `/api/admin/stats` - 管理员统计
- `/api/test-connection` - 数据库连接测试

## 注意事项

1. **环境变量优先级**：确保在 Vercel 中设置的环境变量值正确
2. **Supabase 配置**：从 Supabase 项目设置中获取正确的 URL 和密钥
3. **安全性**：不要在代码中硬编码敏感信息
4. **构建时验证**：现在代码会在构建时验证必需的环境变量

## 故障排除

如果仍然遇到问题：

1. **检查环境变量**：确保所有必需的环境变量都已设置
2. **查看构建日志**：检查 Vercel 构建日志中的具体错误信息
3. **验证 Supabase 连接**：确保 Supabase 项目正常运行且密钥有效
4. **清除缓存**：在 Vercel 中清除构建缓存后重新部署

## 联系支持
如果问题持续存在，请提供：
- Vercel 构建日志
- 环境变量配置截图（隐藏敏感信息）
- 具体的错误信息