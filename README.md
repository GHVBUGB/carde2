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
- **💾 智能导出工具**：
  - **DOM-to-image + 外部API优化**：新一代智能导出系统
    - DOM基础导出：使用dom-to-image进行高质量DOM转图片
    - 外部API画质优化：集成免费画质优化API（Waifu2x、Real-ESRGAN、Hugging Face）
    - 本地Canvas优化：API不可用时自动使用本地2倍放大优化
    - 三级降级保护：外部API → 本地优化 → 原图下载
    - 智能格式支持：PNG(透明)/JPEG(白底)自适应
  - **一键高清导出**：完全自动化的导出流程
    - 设备像素比适配：自动适配不同设备的显示密度
    - 资源等待机制：确保图片和字体完全加载
    - 实时状态反馈：详细的处理步骤和进度提示
    - 错误恢复机制：多重保障确保导出成功
  - **技术特色**：
    - 外部免费API：集成多个免费画质优化服务
    - 本地优化算法：Canvas高质量渲染技术
    - 降级保护机制：确保在任何情况下都能成功导出

### 管理员功能
- **📊 实时监控面板**：用户注册、登录、API使用情况实时监控
- **🚨 智能告警系统**：超过阈值自动邮件提醒管理员
  - 抠图API调用 > 5次/天
  - 名片下载 > 5次/天  
  - 新用户注册 > 5个/天
- **👥 用户管理系统**：详细的用户信息和使用统计
- **🔧 布局管理**：控制模块位置锁定/解锁状态
- **📧 邮件通知**：异常使用情况自动邮件提醒
- **📈 数据可视化**：图表展示平台使用趋势

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

# SMTP 邮件发送（用于注册验证码和管理员告警）
SMTP_HOST=smtp.exmail.qq.com
SMTP_PORT=465
SMTP_USER=no-reply@51talk.com
SMTP_PASS=your_smtp_password
SMTP_FROM=51Talk 名片平台 <no-reply@51talk.com>

# 管理员邮箱（接收告警通知）
ADMIN_EMAIL=admin@51talk.com

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
- `GET /api/admin/monitor` - 实时监控数据
- `POST /api/admin/send-alert` - 发送告警邮件
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

1. **管理员登录**
   - 访问 `/admin/login` 进入管理员登录页面
   - 使用51Talk管理员邮箱账号登录
   - 系统验证管理员权限后进入管理面板

2. **实时监控**
   - 查看平台使用情况实时统计
   - 监控用户注册、登录和API调用数据
   - 自动检测异常使用模式并告警

3. **告警管理**
   - 系统自动监控关键指标：
     * 抠图API调用超过5次/天
     * 名片下载超过5次/天
     * 新用户注册超过5个/天
   - 触发条件时自动发送邮件通知
   - 支持手动触发告警检查

4. **用户管理**
   - 查看所有用户详细信息和使用统计
   - 监控个人用户的API使用频次
   - 识别高频使用用户和异常行为

5. **数据分析**
   - 查看用户注册趋势图表
   - 分析热门职位分布
   - 监控平台活动统计

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

### v1.4.1 (2024-01-26) - 头像白色边框修复
- ✅ 修复下载出来的头衔带有白色圆圈框的问题
- ✅ 移除HTML组件中头像的白色边框CSS类（border-4 border-white）
- ✅ 移除Canvas导出功能中头像的白色边框绘制代码
- ✅ 修复所有导出格式（PNG、JPEG、Canvas等）的头像显示问题
- ✅ 保持头像的圆形裁剪和阴影效果，仅移除白色边框
- ✅ 涉及文件：business-card-preview.tsx、improved-business-card-preview.tsx、clean-draggable-card.tsx、draggable-business-card-preview.tsx、canvas-perfect-export.tsx、modern-web-export.tsx

### v1.3.0 (2024-01-16) - 实时数据系统
- ✅ 创建真实API数据端点：`/api/admin/stats`、`/api/admin/today-stats`
- ✅ 管理员面板连接真实数据库数据
- ✅ 实现30秒自动刷新机制
- ✅ 添加API活动记录系统（`ApiLogger`类）
- ✅ 智能数据模拟：无真实数据时生成合理统计
- ✅ 优化告警系统性能和准确性

### v1.4.0 (2024-01-25) - 智能导出系统
- ✅ 全新DOM-to-image + 外部API优化导出系统
- ✅ 集成多个免费画质优化API（Waifu2x、Real-ESRGAN、Hugging Face）
- ✅ 三级降级保护机制：外部API → 本地优化 → 原图下载
- ✅ 本地Canvas 2倍高清优化算法
- ✅ 设备像素比自动适配，支持各种显示密度
- ✅ 智能格式支持：PNG透明背景/JPEG白色背景
- ✅ 完整的状态反馈和错误恢复机制
- ✅ 集成到编辑页面，一键高清导出

### v1.3.0 (2024-01-20) - 外部API优化导出
- ✅ 删除复杂的AI增强模块，简化用户界面
- ✅ 实现外部API优化导出功能
- ✅ 完全基于DOM原始版本，确保布局不变
- ✅ 新增外部API调用接口 `/api/external-optimize`
- ✅ 本地算法降级机制，提高系统稳定性
- ✅ 严格保持350x500像素的原始尺寸
- ✅ 优化阿拉伯语文字渲染质量

### v1.2.0 (2024-01-15)
- ✅ 完整管理员系统上线
- ✅ 实时监控面板和用户管理
- ✅ 智能告警邮件系统
- ✅ DOM导出功能优化
- ✅ 精简导出选项（仅保留DOM导出）

### v1.1.0 (2024-01-10)
- ✅ 管理员权限体系
- ✅ 用户统计和监控
- ✅ 邮件通知系统

### v1.0.0 (2024-01-05)
- ✅ 初始版本发布
- ✅ 基础名片编辑功能
- ✅ 阿里邮箱认证系统
- ✅ 头像AI抠图功能

---

**版权所有 © 2024 51Talk Online Education. All rights reserved.**
#   c a r d e 2 
 
 