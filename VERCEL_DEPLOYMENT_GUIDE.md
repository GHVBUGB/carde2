# Vercel 部署指南

## 环境变量配置

在Vercel部署之前，需要在Vercel控制台中配置以下环境变量：

### 必需的环境变量

1. **Supabase配置**
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

2. **Remove.bg API**
   ```
   REMOVE_BG_API_KEY=your_remove_bg_api_key
   ```

3. **JWT密钥**
   ```
   JWT_SECRET=your_jwt_secret_key
   ```

4. **邮件配置**
   ```
   SMTP_HOST=smtp.exmail.qq.com
   SMTP_PORT=465
   SMTP_USER=no-reply@51talk.com
   SMTP_PASS=your_smtp_password
   SMTP_FROM=51Talk 名片平台 <no-reply@51talk.com>
   ```

5. **管理员配置**
   ```
   ADMIN_EMAIL=admin@51talk.com
   ```

6. **应用配置**
   ```
   NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
   ```

## 配置步骤

1. 登录Vercel控制台
2. 选择你的项目
3. 进入Settings > Environment Variables
4. 添加上述所有环境变量
5. 重新部署项目

## 注意事项

- 所有以 `NEXT_PUBLIC_` 开头的变量会在客户端暴露，请确保不包含敏感信息
- `SUPABASE_SERVICE_ROLE_KEY` 是服务端密钥，具有管理员权限，请妥善保管
- 部署后请测试所有功能是否正常工作

## 故障排除

如果构建失败，请检查：
1. 所有必需的环境变量是否已配置
2. 环境变量值是否正确
3. Supabase项目是否正常运行
4. API密钥是否有效
