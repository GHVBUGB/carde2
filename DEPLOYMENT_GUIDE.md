# 51Talk数字名片平台 - 部署指南

## 🚀 部署方案概览

本项目支持多种部署方式，推荐按优先级选择：

1. **Vercel部署** (推荐) - 最简单，适合快速上线
2. **Docker部署** - 适合自有服务器
3. **传统服务器部署** - 适合VPS或云服务器

---

## 方案一：Vercel部署 (推荐)

### 1. 准备工作

#### 1.1 注册Vercel账号
- 访问 [vercel.com](https://vercel.com)
- 使用GitHub账号注册（推荐）

#### 1.2 准备环境变量
创建 `.env.production` 文件：
```env
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Remove.bg API 配置
REMOVE_BG_API_KEY=your_remove_bg_api_key

# JWT 密钥 (生成一个强密码)
JWT_SECRET=your_very_strong_jwt_secret_key_here

# 51Talk 邮箱配置
SMTP_HOST=smtp.exmail.qq.com
SMTP_PORT=465
SMTP_USER=no-reply@51talk.com
SMTP_PASS=your_smtp_password
SMTP_FROM=51Talk 名片平台 <no-reply@51talk.com>

# 管理员告警邮箱
ADMIN_EMAIL=admin@51talk.com

# 应用配置 (部署后更新为实际域名)
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

### 2. 部署步骤

#### 2.1 推送代码到GitHub
```bash
# 初始化Git仓库（如果还没有）
git init
git add .
git commit -m "Initial commit"

# 创建GitHub仓库并推送
git remote add origin https://github.com/your-username/your-repo.git
git push -u origin main
```

#### 2.2 在Vercel中导入项目
1. 登录Vercel控制台
2. 点击 "New Project"
3. 选择你的GitHub仓库
4. 点击 "Import"

#### 2.3 配置环境变量
在Vercel项目设置中：
1. 进入 "Settings" → "Environment Variables"
2. 添加所有环境变量（参考上面的 `.env.production`）
3. 确保所有变量都设置为 "Production" 环境

#### 2.4 部署配置
Vercel会自动检测到Next.js项目，使用以下配置：
- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### 3. 自定义域名（可选）
1. 在Vercel项目设置中进入 "Domains"
2. 添加你的自定义域名
3. 按照提示配置DNS记录

---

## 方案二：Docker部署

### 1. 优化Dockerfile

我已经为你准备了优化的Dockerfile，支持多阶段构建和最佳实践。

### 2. 构建和运行

#### 2.1 构建Docker镜像
```bash
# 构建镜像
docker build -t 51talk-business-card .

# 查看镜像
docker images
```

#### 2.2 运行容器
```bash
# 创建环境变量文件
cat > .env.production << EOF
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
REMOVE_BG_API_KEY=your_remove_bg_api_key
JWT_SECRET=your_jwt_secret
SMTP_HOST=smtp.exmail.qq.com
SMTP_PORT=465
SMTP_USER=no-reply@51talk.com
SMTP_PASS=your_smtp_password
SMTP_FROM=51Talk 名片平台 <no-reply@51talk.com>
ADMIN_EMAIL=admin@51talk.com
NEXT_PUBLIC_APP_URL=http://localhost:3000
EOF

# 运行容器
docker run -d \
  --name 51talk-business-card \
  --env-file .env.production \
  -p 3000:3000 \
  51talk-business-card
```

#### 2.3 使用Docker Compose（推荐）
创建 `docker-compose.yml`：
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    env_file:
      - .env.production
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

运行：
```bash
docker-compose up -d
```

---

## 方案三：传统服务器部署

### 1. 服务器要求
- **操作系统**: Ubuntu 20.04+ / CentOS 8+
- **Node.js**: 18.0+
- **内存**: 最少2GB，推荐4GB+
- **存储**: 最少10GB可用空间

### 2. 安装Node.js
```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# CentOS/RHEL
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs
```

### 3. 部署应用
```bash
# 克隆项目
git clone https://github.com/your-username/your-repo.git
cd your-repo

# 安装依赖
npm install

# 构建项目
npm run build

# 安装PM2进程管理器
npm install -g pm2

# 创建PM2配置文件
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: '51talk-business-card',
    script: 'npm',
    args: 'start',
    cwd: '/path/to/your/project',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_file: '.env.production',
    log_file: './logs/combined.log',
    out_file: './logs/out.log',
    error_file: './logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm Z',
    merge_logs: true,
    max_memory_restart: '1G',
    restart_delay: 4000,
    max_restarts: 10,
    min_uptime: '10s'
  }]
}
EOF

# 启动应用
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 4. 配置Nginx反向代理
```bash
# 安装Nginx
sudo apt update
sudo apt install nginx

# 创建配置文件
sudo tee /etc/nginx/sites-available/51talk-business-card << EOF
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# 启用站点
sudo ln -s /etc/nginx/sites-available/51talk-business-card /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 🔧 数据库配置

### 1. Supabase设置

#### 1.1 创建Supabase项目
1. 访问 [supabase.com](https://supabase.com)
2. 创建新项目
3. 记录项目URL和API密钥

#### 1.2 执行数据库初始化脚本
在Supabase SQL编辑器中执行以下脚本：

```sql
-- 用户表
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100),
  avatar_url TEXT,
  title VARCHAR(50) CHECK (title IN ('首席成长伙伴', '金牌成长顾问', '五星服务官', '学习领航官')),
  students_served INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  phone VARCHAR(20),
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 布局配置表
CREATE TABLE layout_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  module_name VARCHAR(50) NOT NULL,
  x_position INTEGER DEFAULT 0,
  y_position INTEGER DEFAULT 0,
  z_index INTEGER DEFAULT 0,
  is_locked BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 使用统计表
CREATE TABLE usage_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  action_type VARCHAR(50) NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- API日志表
CREATE TABLE api_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  endpoint VARCHAR(255) NOT NULL,
  method VARCHAR(10) NOT NULL,
  status_code INTEGER,
  response_time INTEGER,
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_usage_stats_user_id ON usage_stats(user_id);
CREATE INDEX idx_usage_stats_action_type ON usage_stats(action_type);
CREATE INDEX idx_api_logs_endpoint ON api_logs(endpoint);
CREATE INDEX idx_api_logs_created_at ON api_logs(created_at);

-- 插入默认布局配置
INSERT INTO layout_config (module_name, x_position, y_position, z_index, is_locked) VALUES
('avatar', 50, 50, 1, true),
('name', 50, 200, 2, true),
('title', 50, 250, 3, true),
('stats', 50, 300, 4, true),
('contact', 50, 400, 5, true);

-- 创建管理员用户（请替换为实际的管理员邮箱）
INSERT INTO users (email, name, is_admin) VALUES 
('admin@51talk.com', '系统管理员', true);
```

### 2. 配置存储桶
在Supabase控制台中：
1. 进入 "Storage"
2. 创建名为 "avatars" 的存储桶
3. 设置公开访问权限
4. 配置CORS策略

---

## 🔐 安全配置

### 1. 环境变量安全
- 使用强密码作为JWT_SECRET
- 定期轮换API密钥
- 不要在代码中硬编码敏感信息

### 2. 数据库安全
- 启用Row Level Security (RLS)
- 配置适当的访问策略
- 定期备份数据

### 3. 应用安全
- 启用HTTPS
- 配置安全头
- 实施速率限制

---

## 📊 监控和日志

### 1. 应用监控
```bash
# 查看PM2状态
pm2 status

# 查看日志
pm2 logs 51talk-business-card

# 监控资源使用
pm2 monit
```

### 2. 系统监控
```bash
# 安装htop
sudo apt install htop

# 监控系统资源
htop

# 查看磁盘使用
df -h

# 查看内存使用
free -h
```

---

## 🚨 故障排除

### 常见问题

#### 1. 构建失败
```bash
# 清理缓存
npm run clean
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### 2. 环境变量问题
- 检查所有必需的环境变量是否设置
- 确保变量名拼写正确
- 验证API密钥是否有效

#### 3. 数据库连接问题
- 检查Supabase项目状态
- 验证数据库URL和密钥
- 确认网络连接正常

#### 4. 邮件发送失败
- 检查SMTP配置
- 验证邮箱凭据
- 确认防火墙设置

---

## 📞 技术支持

如果在部署过程中遇到问题，请：

1. 检查日志文件
2. 验证环境变量配置
3. 确认数据库连接
4. 联系技术支持团队

---

## 🎉 部署完成检查清单

- [ ] 代码已推送到Git仓库
- [ ] 环境变量已正确配置
- [ ] 数据库已初始化
- [ ] 应用已成功构建
- [ ] 服务已启动并运行
- [ ] 域名已配置（如适用）
- [ ] SSL证书已安装（如适用）
- [ ] 监控已设置
- [ ] 备份策略已实施

恭喜！你的51Talk数字名片平台已成功部署上线！🎊

