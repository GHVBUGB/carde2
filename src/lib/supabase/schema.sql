-- 51Talk 员工数字名片平台数据库架构

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100),
  avatar_url TEXT,
  title VARCHAR(50) CHECK (title IN ('首席成长伙伴', '金牌成长顾问', '五星服务官', '学习领航官')),
  students_served INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  phone VARCHAR(20),
  is_admin BOOLEAN DEFAULT false,
  
  -- 新增业务能力字段
  teacher_screening BOOLEAN DEFAULT false,    -- 外教筛选
  feedback_ability BOOLEAN DEFAULT false,     -- 学情反馈
  planning_ability BOOLEAN DEFAULT false,     -- 计划制定
  resource_sharing BOOLEAN DEFAULT false,     -- 学习资源分享
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 布局配置表
CREATE TABLE IF NOT EXISTS layout_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  module_name VARCHAR(50) NOT NULL,
  x_position INTEGER DEFAULT 0,
  y_position INTEGER DEFAULT 0,
  z_index INTEGER DEFAULT 0,
  is_locked BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 使用统计表
CREATE TABLE IF NOT EXISTS usage_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  action_type VARCHAR(50) NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 验证码表（用于邮箱验证）
CREATE TABLE IF NOT EXISTS verification_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  code VARCHAR(10) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
CREATE INDEX IF NOT EXISTS idx_usage_stats_user_id ON usage_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_stats_action_type ON usage_stats(action_type);
CREATE INDEX IF NOT EXISTS idx_usage_stats_created_at ON usage_stats(created_at);
CREATE INDEX IF NOT EXISTS idx_verification_codes_email ON verification_codes(email);
CREATE INDEX IF NOT EXISTS idx_verification_codes_code ON verification_codes(code);
CREATE INDEX IF NOT EXISTS idx_verification_codes_expires_at ON verification_codes(expires_at);

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为 users 表添加更新时间触发器
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at 
BEFORE UPDATE ON users 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 插入默认布局配置
INSERT INTO layout_config (module_name, x_position, y_position, z_index, is_locked) VALUES
('avatar', 50, 50, 1, true),
('name', 200, 50, 2, true),
('title', 200, 100, 3, true),
('stats', 50, 150, 4, true),
('abilities', 50, 200, 5, true),
('contact', 50, 250, 6, true)
ON CONFLICT DO NOTHING;

-- 创建存储桶（如果不存在）
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT DO NOTHING;

-- 设置存储桶策略
-- 允许用户上传头像
CREATE POLICY "Users can upload avatars" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- 允许用户更新自己的头像
CREATE POLICY "Users can update own avatars" ON storage.objects
FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 允许用户删除自己的头像
CREATE POLICY "Users can delete own avatars" ON storage.objects
FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 允许所有人查看头像
CREATE POLICY "Anyone can view avatars" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

-- 行级安全策略

-- users 表策略
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 用户可以查看所有用户的基本信息（用于名片展示）
CREATE POLICY "Users can view all profiles" ON users
FOR SELECT USING (true);

-- 用户只能更新自己的信息
CREATE POLICY "Users can update own profile" ON users
FOR UPDATE USING (auth.uid() = id);

-- 用户可以插入自己的信息（注册时）
CREATE POLICY "Users can insert own profile" ON users
FOR INSERT WITH CHECK (auth.uid() = id);

-- 管理员可以查看和管理所有用户
CREATE POLICY "Admins can manage all users" ON users
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- layout_config 表策略
ALTER TABLE layout_config ENABLE ROW LEVEL SECURITY;

-- 所有认证用户可以查看布局配置
CREATE POLICY "Authenticated users can view layout config" ON layout_config
FOR SELECT USING (auth.role() = 'authenticated');

-- 只有管理员可以修改布局配置
CREATE POLICY "Only admins can modify layout config" ON layout_config
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- usage_stats 表策略
ALTER TABLE usage_stats ENABLE ROW LEVEL SECURITY;

-- 用户可以查看自己的使用统计
CREATE POLICY "Users can view own stats" ON usage_stats
FOR SELECT USING (auth.uid() = user_id);

-- 用户可以插入自己的使用统计
CREATE POLICY "Users can insert own stats" ON usage_stats
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 管理员可以查看所有统计
CREATE POLICY "Admins can view all stats" ON usage_stats
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- verification_codes 表策略
ALTER TABLE verification_codes ENABLE ROW LEVEL SECURITY;

-- 只有服务端可以操作验证码（通过服务端密钥）
-- 这里我们不设置策略，通过API路由来控制访问

-- 创建一些有用的视图

-- 用户统计视图
CREATE OR REPLACE VIEW user_stats_summary AS
SELECT 
  u.id,
  u.name,
  u.email,
  u.title,
  u.created_at,
  COUNT(s.id) as total_actions,
  MAX(s.created_at) as last_action_at,
  COUNT(CASE WHEN s.action_type = 'download' THEN 1 END) as download_count,
  COUNT(CASE WHEN s.action_type = 'login' THEN 1 END) as login_count
FROM users u
LEFT JOIN usage_stats s ON u.id = s.user_id
GROUP BY u.id, u.name, u.email, u.title, u.created_at;

-- 每日统计视图
CREATE OR REPLACE VIEW daily_stats AS
SELECT 
  DATE(created_at) as date,
  action_type,
  COUNT(*) as count
FROM usage_stats
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at), action_type
ORDER BY date DESC, action_type;

-- 创建函数：获取用户完整信息
CREATE OR REPLACE FUNCTION get_user_profile(user_id UUID)
RETURNS TABLE (
  id UUID,
  email VARCHAR,
  name VARCHAR,
  avatar_url TEXT,
  title VARCHAR,
  students_served INTEGER,
  rating DECIMAL,
  phone VARCHAR,
  teacher_screening BOOLEAN,
  feedback_ability BOOLEAN,
  planning_ability BOOLEAN,
  resource_sharing BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id, u.email, u.name, u.avatar_url, u.title, 
    u.students_served, u.rating, u.phone,
    u.teacher_screening, u.feedback_ability, 
    u.planning_ability, u.resource_sharing,
    u.created_at, u.updated_at
  FROM users u
  WHERE u.id = user_id;
END;
$$;

-- 创建函数：清理过期验证码
CREATE OR REPLACE FUNCTION cleanup_expired_verification_codes()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM verification_codes 
  WHERE expires_at < NOW() OR used = true;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- 创建定时任务清理过期验证码（需要 pg_cron 扩展）
-- SELECT cron.schedule('cleanup-verification-codes', '0 0 * * *', 'SELECT cleanup_expired_verification_codes();');

COMMENT ON TABLE users IS '用户信息表，存储51Talk员工的基本信息和业务能力';
COMMENT ON TABLE layout_config IS '布局配置表，控制名片模块的位置和锁定状态';
COMMENT ON TABLE usage_stats IS '使用统计表，记录用户的操作行为';
COMMENT ON TABLE verification_codes IS '验证码表，用于邮箱验证';

COMMENT ON COLUMN users.teacher_screening IS '外教筛选能力';
COMMENT ON COLUMN users.feedback_ability IS '学情反馈能力';
COMMENT ON COLUMN users.planning_ability IS '计划制定能力';
COMMENT ON COLUMN users.resource_sharing IS '学习资源分享能力';
