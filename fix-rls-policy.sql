-- 修复用户访问权限问题 - RLS策略更新
-- 解决用户登录后无法查看其他用户名片信息的问题

-- 删除现有的过于严格的策略
DROP POLICY IF EXISTS "Users can view own profile" ON users;

-- 创建新的策略：允许查看公开信息（名片展示需要的字段）
CREATE POLICY "Users can view public profile info" ON users
  FOR SELECT USING (true);

-- 保持用户只能更新自己信息的策略
-- 这个策略应该已经存在，如果不存在则创建
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- 保持管理员可以管理所有用户的策略
-- 这个策略应该已经存在，如果不存在则创建
CREATE POLICY "Service role can manage all users" ON users
  FOR ALL USING (auth.role() = 'service_role');

-- 如果需要更细粒度的控制，可以创建一个视图来限制敏感信息
-- 但目前先允许查看所有字段，因为名片展示需要这些信息

-- 验证策略是否正确应用
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

-- 完成提示
SELECT 'RLS policy updated successfully! Users can now view public profile information.' as message;