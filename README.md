# 51Talk员工数字名片制作平台

## 项目概述

这是一个专为51Talk内部员工设计的数字名片制作平台，提供统一的品牌形象展示和专业的业务名片生成功能。

## 主要功能

### 用户功能
- **📧 阿里邮箱认证**：使用51Talk阿里邮箱进行注册和登录
- **👤 个人信息管理**：编辑姓名、选择头衔（首席成长伙伴
金牌成长顾问
五星服务官
学习领航官）、
已服务学员数、
好评率、
外教筛选、
学情反馈、
计划制定、
学习资源分享、
电话
- **🖼️ 智能头像处理**：上传头像并使用AI自动抠图
- **🎨 拖拽式布局**：自定义名片模块位置（管理员解锁后）
- **👀 实时预览**：即时查看名片效果
- **💾 多格式导出**：支持多种格式的名片图片导出

### 管理员功能
- **📊 数据统计面板**：用户使用情况、API调用、下载数据统计
- **🔧 布局管理**：控制模块位置锁定/解锁状态
- **👥 用户管理**：查看用户列表和行为记录

## 技术架构

### 前端技术栈
- **框架**：Next.js 14 (App Router)
- **语言**：TypeScript
- **UI库**：Tailwind CSS + Shadcn/ui
- **状态管理**：Zustand
- **拖拽功能**：@dnd-kit/core
- **图片处理**：fabric.js
- **HTTP客户端**：fetch API

### 后端技术栈
- **数据库**：Supabase (PostgreSQL)
- **认证**：Supabase Auth + JWT
- **图片处理**：Remove.bg API
- **文件存储**：Supabase Storage

## 快速开始

### 环境要求
- Node.js 18+
- npm 或 yarn
- Supabase账号
- Remove.bg API密钥

### 安装步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd card2
```

2. **安装依赖**
```bash
npm install
```

3. **环境变量配置**
创建 `.env.local` 文件：
```env
# Supabase配置


SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key

# Remove.bg API
REMOVE_BG_API_KEY=your_remove_bg_api_key

# JWT密钥
JWT_SECRET=your_jwt_secret

# SMTP 邮件发送（用于注册验证码）
SMTP_HOST=smtp.example.com
SMTP_PORT=465
SMTP_USER=no-reply@example.com
SMTP_PASS=your_smtp_password
SMTP_FROM=51Talk 名片平台 <no-reply@example.com>

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. **数据库初始化**
在Supabase中执行以下SQL脚本：
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

-- 创建索引
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_usage_stats_user_id ON usage_stats(user_id);
CREATE INDEX idx_usage_stats_action_type ON usage_stats(action_type);
```

5. **启动开发服务器**
```bash
npm run dev
```

项目将在 `http://localhost:3000` 启动。

## 项目结构

```
src/
├── app/                    # Next.js 14 App Router
│   ├── (auth)/            # 认证相关页面
│   ├── dashboard/         # 用户面板
│   ├── admin/             # 管理员面板
│   ├── api/               # API路由
│   ├── globals.css        # 全局样式
│   ├── layout.tsx         # 根布局
│   └── page.tsx           # 首页
├── components/            # 组件库
│   ├── ui/                # 基础UI组件
│   ├── auth/              # 认证组件
│   ├── editor/            # 名片编辑器
│   ├── drag/              # 拖拽组件
│   └── admin/             # 管理组件
├── lib/                   # 工具函数和配置
│   ├── supabase/          # Supabase客户端
│   ├── auth/              # 认证逻辑
│   ├── utils.ts           # 通用工具
│   └── types.ts           # TypeScript类型
├── hooks/                 # 自定义React Hooks
├── store/                 # 状态管理
└── styles/                # 样式文件
```

## API接口文档

### 认证接口
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/verify` - 邮箱验证
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/logout` - 用户登出

### 用户接口
- `GET /api/user/profile` - 获取用户信息
- `PUT /api/user/profile` - 更新用户信息
- `POST /api/user/avatar` - 上传头像

### 名片接口
- `GET /api/card/preview` - 获取名片预览
- `POST /api/card/export` - 导出名片

### 管理接口
- `GET /api/admin/stats` - 获取统计数据
- `GET /api/admin/users` - 获取用户列表
- `PUT /api/admin/layout` - 更新布局配置

## 使用说明

### 用户使用流程

1. **注册/登录**
   - 使用51Talk阿里邮箱注册账号
   - 系统将向您的企业邮箱发送6位验证码，请在10分钟内完成验证
   - 已注册用户直接登录

2. **编辑个人信息**
   - 上传个人头像（自动AI抠图）
   - 填写姓名和联系方式
   - 选择职位头衔（4个固定选项）
   - 录入业绩数据（服务学员数、评分等）

3. **定制名片布局**
   - 管理员解锁后可拖拽调整模块位置
   - 实时预览名片效果
   - 保存个性化布局

4. **导出名片**
   - 选择导出格式
   - 下载高质量名片图片
   - 分享至社交平台或邮件

### 管理员使用流程

1. **数据监控**
   - 查看用户注册和活跃度统计
   - 监控API调用频次和成功率
   - 分析名片下载和使用数据

2. **布局管理**
   - 设置默认名片布局
   - 控制模块拖拽权限
   - 批量更新布局配置

3. **用户管理**
   - 查看所有用户列表
   - 查询用户行为记录
   - 管理用户权限

## 部署指南

### 生产环境部署

1. **构建项目**
```bash
npm run build
```

2. **部署到Vercel**
```bash
npm install -g vercel
vercel --prod
```

3. **环境变量配置**
在Vercel控制台中配置所有必要的环境变量。

### Docker部署

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 开发指南

### 代码规范
- 使用TypeScript进行类型检查
- 遵循ESLint和Prettier配置
- 组件使用函数式组件和Hooks
- API使用Server Actions优先

### 提交规范
```
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式调整
refactor: 代码重构
test: 测试相关
chore: 工程化改动
```

## 常见问题

### Q: 为什么只能使用51Talk邮箱注册？
A: 这是内部员工专用平台，通过邮箱域名验证确保只有公司员工可以使用。

### Q: 头像上传失败怎么办？
A: 请检查图片格式（支持JPG、PNG）和大小（不超过5MB），确保网络连接正常。

### Q: 名片导出质量不高怎么办？
A: 系统支持高分辨率导出，建议使用高质量头像，并检查浏览器设置。

### Q: 拖拽功能无法使用？
A: 拖拽功能需要管理员解锁，请联系管理员开启相关权限。

## 支持与反馈

如有问题或建议，请通过以下方式联系：
- 内部工单系统
- 邮件：tech-support@51talk.com
- 企业微信技术支持群

## 更新日志

### v1.0.0 (2024-01-15)
- 初始版本发布
- 基础名片编辑功能
- 阿里邮箱认证系统
- 头像AI抠图功能

---

**版权所有 © 2024 51Talk Online Education. All rights reserved.**
#   c a r d e 2  
 