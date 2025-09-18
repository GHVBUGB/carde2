# 用户访问权限问题修复指南

## 问题描述

用户反映部署上线后，登录用户在查看名片时需要访问权限，无法正常查看其他用户的名片信息。

## 问题原因分析

通过代码分析发现，问题的根本原因是数据库的 **RLS (Row Level Security) 策略过于严格**：

### 当前问题策略
```sql
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);
```

这个策略只允许用户查看自己的信息，但在名片展示场景中，用户需要能够查看其他用户的公开名片信息。

### 影响范围
- 用户无法查看其他用户的名片
- 名片展示功能受限
- 公开信息无法正常展示

## 解决方案

### 1. 修改 RLS 策略

创建新的策略允许所有认证用户查看公开信息：

```sql
-- 删除过于严格的策略
DROP POLICY IF EXISTS "Users can view own profile" ON users;

-- 创建新策略：允许查看公开信息
CREATE POLICY "Users can view public profile info" ON users
  FOR SELECT USING (true);
```

### 2. 保持数据安全

虽然允许查看公开信息，但仍然保持以下安全策略：
- 用户只能更新自己的信息
- 管理员可以管理所有用户
- 敏感信息（如email）在应用层控制显示

### 3. 应用修复

执行以下步骤应用修复：

1. **在 Supabase SQL Editor 中执行修复脚本**：
   ```bash
   # 执行 fix-rls-policy.sql 文件中的 SQL 语句
   ```

2. **验证策略是否正确应用**：
   ```sql
   SELECT 
     schemaname,
     tablename,
     policyname,
     permissive,
     roles,
     cmd,
     qual,
     with_check
   FROM pg_policies 
   WHERE tablename = 'users';
   ```

3. **测试功能**：
   - 登录不同用户账号
   - 尝试查看其他用户的名片信息
   - 确认可以正常显示公开信息

## 安全考虑

### 保护的信息
- 用户只能修改自己的信息
- 管理员权限仍然受到保护
- 服务角色权限不变

### 公开的信息
名片展示需要的字段：
- `name` - 姓名
- `title` - 职位
- `avatar_url` - 头像
- `students_served` - 服务学员数
- `rating` - 评分
- `teacher_screening` - 教师筛选能力
- `feedback_ability` - 反馈能力
- `planning_ability` - 规划能力
- `resource_sharing` - 资源分享能力

### 敏感信息处理
如果需要进一步保护敏感信息（如 email, phone），可以：
1. 在应用层控制显示
2. 创建专门的视图
3. 使用更细粒度的 RLS 策略

## 测试验证

修复后需要验证：
1. ✅ 用户可以查看其他用户的名片信息
2. ✅ 用户仍然只能修改自己的信息
3. ✅ 管理员权限正常
4. ✅ 名片展示功能正常工作

## 部署说明

1. 在 Supabase 控制台的 SQL Editor 中执行 `fix-rls-policy.sql`
2. 验证策略更新成功
3. 测试应用功能
4. 监控是否有其他相关问题

## 预防措施

为避免类似问题：
1. 在设计 RLS 策略时考虑所有使用场景
2. 区分公开信息和私人信息
3. 在开发环境充分测试权限策略
4. 建立权限策略的文档和测试用例

---

**修复完成后，用户应该能够正常查看其他用户的名片信息，同时保持数据安全性。**