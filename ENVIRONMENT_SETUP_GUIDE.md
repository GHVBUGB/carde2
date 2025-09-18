# 🔧 环境变量配置完整指南

## 📋 配置步骤概览

1. **创建Supabase项目**
2. **获取Remove.bg API密钥**
3. **生成JWT密钥**
4. **配置SMTP邮件服务**
5. **创建环境变量文件**
6. **测试配置**

---

## 第一步：创建Supabase项目

### 1.1 注册Supabase账号
1. 访问 [supabase.com](https://supabase.com)
2. 点击 "Start your project"
3. 使用GitHub账号注册（推荐）

### 1.2 创建新项目
1. 点击 "New Project"
2. 选择组织（或创建新组织）
3. 填写项目信息：
   - **Name**: `51talk-business-card`
   - **Database Password**: 生成强密码（保存好）
   - **Region**: 选择离用户最近的区域（如 `Asia Southeast (Singapore)`）
4. 点击 "Create new project"
5. 等待项目创建完成（约2-3分钟）

### 1.3 获取API密钥
1. 在项目控制台，点击左侧菜单的 **"Settings"**
2. 选择 **"API"**
3. 复制以下信息：
   ```
   Project URL: https://your-project-id.supabase.co
   anon public: your_supabase_anon_key
   service_role secret: your_supabase_service_role_key
   ```

---

## 第二步：获取Remove.bg API密钥

### 2.1 注册Remove.bg账号
1. 访问 [remove.bg/api](https://www.remove.bg/api)
2. 点击 "Get API Key"
3. 注册账号（免费版每月50张图片）

### 2.2 获取API密钥
1. 登录后进入控制台
2. 复制API密钥：`your_remove_bg_api_key`

---

## 第三步：生成JWT密钥

### 3.1 使用命令行生成（推荐）
```bash
# Windows PowerShell
[System.Web.Security.Membership]::GeneratePassword(32, 0)

# 或者使用OpenSSL（如果已安装）
openssl rand -base64 32
```

### 3.2 在线生成
访问 [jwt.io](https://jwt.io) 或使用在线随机密码生成器

**示例JWT密钥**：`Kj8mN2pQ9vR5tY7uI3oP6sD1fG4hJ8kL2nM5qW8eR1tY4uI7oP0sD3fG6hJ9kL`

---

## 第四步：配置SMTP邮件服务

### 4.1 51Talk企业邮箱配置
如果你有51Talk企业邮箱：
```
SMTP_HOST=smtp.exmail.qq.com
SMTP_PORT=465
SMTP_USER=no-reply@51talk.com
SMTP_PASS=你的企业邮箱密码
```

### 4.2 使用其他SMTP服务
如果使用其他邮件服务：

**Gmail配置**：
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

**阿里云邮箱配置**：
```
SMTP_HOST=smtp.aliyun.com
SMTP_PORT=465
SMTP_USER=your-email@aliyun.com
SMTP_PASS=your-password
```

---

## 第五步：创建环境变量文件

### 5.1 复制模板文件
```bash
# 复制模板文件
cp env.production.template .env.production
```

### 5.2 编辑配置文件
打开 `.env.production` 文件，替换以下占位符：

```env
# Supabase配置
NEXT_PUBLIC_SUPABASE_URL=https://your-actual-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Remove.bg API
REMOVE_BG_API_KEY=your_actual_remove_bg_api_key

# JWT密钥
JWT_SECRET=your_actual_jwt_secret_key

# SMTP配置
SMTP_HOST=smtp.exmail.qq.com
SMTP_PORT=465
SMTP_USER=no-reply@51talk.com
SMTP_PASS=your_actual_smtp_password
SMTP_FROM=51Talk 名片平台 <no-reply@51talk.com>

# 管理员邮箱
ADMIN_EMAIL=admin@51talk.com

# 应用URL（部署后更新）
NEXT_PUBLIC_APP_URL=https://your-project-name.vercel.app
```

---

## 第六步：初始化数据库

### 6.1 执行数据库脚本
1. 在Supabase控制台，点击左侧菜单的 **"SQL Editor"**
2. 点击 "New query"
3. 复制 `database-init-production.sql` 的内容
4. 粘贴到编辑器中
5. 点击 "Run" 执行脚本

### 6.2 验证表创建
执行以下查询验证表是否创建成功：
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

应该看到以下表：
- `api_logs`
- `layout_config`
- `system_config`
- `usage_stats`
- `users`

---

## 第七步：测试配置

### 7.1 本地测试
```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 7.2 测试API端点
访问以下URL测试配置：
- `http://localhost:3000/api/health` - 健康检查
- `http://localhost:3000/api/remove-bg` - Remove.bg API测试

### 7.3 测试数据库连接
访问：`http://localhost:3000/test-connection`

---

## 🚀 Vercel部署配置

### 在Vercel中配置环境变量
1. 登录Vercel控制台
2. 选择你的项目
3. 进入 **"Settings"** → **"Environment Variables"**
4. 添加所有环境变量（参考上面的配置）
5. 确保所有变量都设置为 **"Production"** 环境

### 环境变量列表（Vercel配置）
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
REMOVE_BG_API_KEY
JWT_SECRET
SMTP_HOST
SMTP_PORT
SMTP_USER
SMTP_PASS
SMTP_FROM
ADMIN_EMAIL
NEXT_PUBLIC_APP_URL
```

---

## 🔍 配置验证清单

- [ ] Supabase项目已创建
- [ ] API密钥已获取并配置
- [ ] Remove.bg API密钥已配置
- [ ] JWT密钥已生成并配置
- [ ] SMTP邮件服务已配置
- [ ] 数据库表已创建
- [ ] 本地测试通过
- [ ] Vercel环境变量已配置

---

## 🚨 常见问题解决

### 问题1：Supabase连接失败
**错误信息**：`Invalid API key`
**解决方案**：
- 检查API密钥是否正确复制
- 确认项目URL格式正确
- 验证项目是否已激活

### 问题2：Remove.bg API失败
**错误信息**：`API key not found`
**解决方案**：
- 检查API密钥是否正确
- 确认账号是否已激活
- 检查免费额度是否用完

### 问题3：邮件发送失败
**错误信息**：`SMTP connection failed`
**解决方案**：
- 检查SMTP服务器地址和端口
- 确认邮箱密码正确
- 检查防火墙设置

### 问题4：数据库表不存在
**错误信息**：`relation does not exist`
**解决方案**：
- 执行数据库初始化脚本
- 检查RLS策略是否正确
- 确认Service Role Key权限

---

## 📞 技术支持

如果在配置过程中遇到问题：
1. 检查错误日志
2. 验证环境变量配置
3. 测试各个服务连接
4. 参考本文档的故障排除部分

配置完成后，你的51Talk数字名片平台就可以成功部署到Vercel了！🎉
