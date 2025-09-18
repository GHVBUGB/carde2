# 🗄️ Remove API 日志系统部署指南

## 📋 概述

本指南将帮助您部署新的Remove API日志系统，该系统专门记录用户使用抠图API的详细行为统计。

## 🎯 功能特性

### ✅ 新增功能
- **专门的数据库表**：`remove_api_logs` 表记录详细的API调用信息
- **使用限制检查**：自动检查用户每日使用次数限制
- **详细统计信息**：记录处理时间、文件大小、API提供商等
- **多种统计视图**：支持总体、今日、用户、月度统计
- **兼容性保证**：与现有系统完全兼容

### 📊 记录的数据
- 用户信息（ID、邮箱、姓名）
- API调用信息（提供商、方法、端点）
- 图片处理信息（文件大小、类型、处理时间）
- 请求信息（IP地址、用户代理、会话ID）
- 结果信息（成功/失败、错误信息）
- 配额信息（每日/每月使用次数）

## 🚀 部署步骤

### 第1步：创建数据库表

在Supabase SQL编辑器中执行以下脚本：

```sql
-- 执行 create-remove-api-logging-table.sql 文件中的所有内容
```

或者直接复制 `create-remove-api-logging-table.sql` 文件的内容到Supabase SQL编辑器执行。

### 第2步：验证表创建

执行以下查询验证表是否创建成功：

```sql
-- 检查表是否存在
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'remove_api_logs';

-- 检查表结构
\d remove_api_logs;

-- 检查视图是否创建
SELECT viewname 
FROM pg_views 
WHERE viewname LIKE '%remove_api%';
```

### 第3步：测试API功能

1. 打开 `test-remove-api-logging.html` 测试页面
2. 点击"检查表状态"按钮验证表是否可访问
3. 测试各种统计功能

### 第4步：验证现有功能

1. 测试抠图功能是否正常工作
2. 检查管理员面板是否显示正确的统计
3. 验证使用限制是否生效

## 📁 新增文件说明

### 数据库相关
- `create-remove-api-logging-table.sql` - 数据库表创建脚本
- `REMOVE_API_LOGGING_SETUP.md` - 本部署指南

### 代码文件
- `src/lib/remove-api-logger.ts` - Remove API日志记录类
- `src/app/api/admin/remove-api-stats/route.ts` - 新的统计API端点

### 测试文件
- `test-remove-api-logging.html` - 完整的测试页面

### 修改的文件
- `src/app/api/remove-bg/route.ts` - 更新API调用逻辑
- `src/app/api/admin/stats/route.ts` - 更新管理员统计

## 🔧 配置说明

### 环境变量
无需新增环境变量，使用现有的Supabase配置。

### 使用限制
- 默认每日限制：5次抠图
- 可在代码中调整限制次数
- 支持按用户设置不同限制

### API端点
- `GET /api/admin/remove-api-stats?type=overall` - 获取总体统计
- `GET /api/admin/remove-api-stats?type=today` - 获取今日统计
- `GET /api/admin/remove-api-stats?type=user&userId=xxx` - 获取用户统计
- `POST /api/admin/remove-api-stats` - 检查用户使用限制

## 📊 数据库表结构

### remove_api_logs 表
```sql
CREATE TABLE remove_api_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_email VARCHAR(255) NOT NULL,
  user_name VARCHAR(100),
  api_provider VARCHAR(50) NOT NULL DEFAULT 'remove_bg',
  request_method VARCHAR(10) NOT NULL DEFAULT 'POST',
  endpoint VARCHAR(100) NOT NULL DEFAULT '/api/remove-bg',
  original_file_size INTEGER,
  original_file_type VARCHAR(50),
  processed_file_size INTEGER,
  processing_time INTEGER,
  ip_address VARCHAR(45),
  user_agent TEXT,
  session_id VARCHAR(100),
  success BOOLEAN NOT NULL DEFAULT TRUE,
  error_message TEXT,
  error_code VARCHAR(50),
  daily_usage_count INTEGER DEFAULT 1,
  monthly_usage_count INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 统计视图
- `user_daily_remove_api_stats` - 用户每日统计
- `user_monthly_remove_api_stats` - 用户月度统计
- `remove_api_overall_stats` - 总体统计
- `user_remove_api_leaderboard` - 用户排行榜

## 🧪 测试验证

### 功能测试
1. **抠图功能测试**
   - 上传图片进行抠图
   - 验证是否记录到新表
   - 检查使用限制是否生效

2. **统计功能测试**
   - 使用测试页面验证各种统计
   - 对比新旧统计数据
   - 验证实时更新

3. **管理员面板测试**
   - 检查面板显示是否正确
   - 验证数据刷新机制
   - 测试告警功能

### 性能测试
- 验证大量数据下的查询性能
- 测试索引是否有效
- 检查内存使用情况

## 🔍 故障排除

### 常见问题

1. **表创建失败**
   - 检查Supabase权限
   - 确认SQL语法正确
   - 查看错误日志

2. **API调用失败**
   - 检查环境变量配置
   - 验证数据库连接
   - 查看控制台错误

3. **统计数据不准确**
   - 检查时区设置
   - 验证查询逻辑
   - 对比新旧数据

### 调试方法
1. 使用测试页面进行功能验证
2. 查看浏览器控制台错误
3. 检查Supabase日志
4. 使用SQL查询验证数据

## 📈 监控和维护

### 定期维护
- 清理过期日志数据
- 优化查询性能
- 更新统计视图

### 监控指标
- API调用成功率
- 平均处理时间
- 用户使用分布
- 错误率统计

## 🎉 部署完成

部署完成后，您将获得：

✅ **精确的抠图使用统计**  
✅ **用户使用限制控制**  
✅ **详细的API调用日志**  
✅ **多种统计视图**  
✅ **完整的测试工具**  

现在您可以更准确地跟踪和管理用户的抠图API使用情况了！

---

**部署完成后，请记得：**
1. 测试所有功能是否正常
2. 验证管理员面板显示
3. 检查使用限制是否生效
4. 定期监控系统运行状态
