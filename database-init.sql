-- 51Talk 名片平台数据库初始化脚本
-- 请在 Supabase SQL Editor 中执行此脚本

-- 启用必要的扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  title VARCHAR(255),
  phone VARCHAR(50),
  students_served INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0.00,
  avatar_url TEXT,
  teacher_screening BOOLEAN DEFAULT false,
  feedback_ability BOOLEAN DEFAULT false,
  planning_ability BOOLEAN DEFAULT false,
  resource_sharing BOOLEAN DEFAULT false,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 验证码表
CREATE TABLE IF NOT EXISTS verification_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  code VARCHAR(10) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 使用统计表
CREATE TABLE IF NOT EXISTS usage_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  action_type VARCHAR(50) NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 布局配置表
CREATE TABLE IF NOT EXISTS layout_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_name VARCHAR(100) NOT NULL,
  x_position INTEGER DEFAULT 0,
  y_position INTEGER DEFAULT 0,
  z_index INTEGER DEFAULT 0,
  is_locked BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_verification_codes_email ON verification_codes(email);
CREATE INDEX IF NOT EXISTS idx_verification_codes_expires ON verification_codes(expires_at);
CREATE INDEX IF NOT EXISTS idx_usage_stats_user_id ON usage_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_stats_action_type ON usage_stats(action_type);
CREATE INDEX IF NOT EXISTS idx_usage_stats_created_at ON usage_stats(created_at);

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为用户表添加更新时间触发器
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- 为布局配置表添加更新时间触发器
CREATE TRIGGER update_layout_config_updated_at 
  BEFORE UPDATE ON layout_config 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- 插入默认布局配置
INSERT INTO layout_config (module_name, x_position, y_position, z_index, is_locked) VALUES
  ('avatar', 50, 50, 1, true),
  ('name', 200, 50, 2, true),
  ('title', 200, 100, 3, true),
  ('stats', 50, 150, 4, true),
  ('abilities', 50, 200, 5, true),
  ('contact', 50, 250, 6, true)
ON CONFLICT DO NOTHING;

-- 设置 RLS (Row Level Security) 策略
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE layout_config ENABLE ROW LEVEL SECURITY;

-- 用户表策略：用户只能访问自己的数据，管理员可以访问所有数据
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Service role can manage all users" ON users
  FOR ALL USING (auth.role() = 'service_role');

-- 验证码表策略：任何人都可以插入和查询验证码（用于注册流程）
CREATE POLICY "Anyone can insert verification codes" ON verification_codes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can select verification codes" ON verification_codes
  FOR SELECT USING (true);

CREATE POLICY "Service role can manage verification codes" ON verification_codes
  FOR ALL USING (auth.role() = 'service_role');

-- 使用统计表策略：用户只能查看自己的统计，管理员可以查看所有
CREATE POLICY "Users can view own stats" ON usage_stats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all stats" ON usage_stats
  FOR ALL USING (auth.role() = 'service_role');

-- 布局配置表策略：所有人都可以读取，只有服务角色可以修改
CREATE POLICY "Anyone can view layout config" ON layout_config
  FOR SELECT USING (true);

CREATE POLICY "Service role can manage layout config" ON layout_config
  FOR ALL USING (auth.role() = 'service_role');

-- 创建清理过期验证码的函数
CREATE OR REPLACE FUNCTION cleanup_expired_codes()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM verification_codes 
  WHERE expires_at < NOW() OR used = true;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- 创建定时清理任务（需要 pg_cron 扩展）
-- 注意：这需要在 Supabase 中手动设置 cron job
-- SELECT cron.schedule('cleanup-expired-codes', '0 * * * *', 'SELECT cleanup_expired_codes();');

-- 完成提示
SELECT 'Database initialization completed successfully!' as message;
