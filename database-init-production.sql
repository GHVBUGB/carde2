-- 51Talk数字名片平台 - 生产环境数据库初始化脚本
-- 在 Supabase SQL 编辑器中执行此脚本

-- ===========================================
-- 启用必要的扩展
-- ===========================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ===========================================
-- 用户表
-- ===========================================
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100),
  avatar_url TEXT,
  title VARCHAR(50) CHECK (title IN ('首席成长伙伴', '金牌成长顾问', '五星服务官', '学习领航官')),
  students_served INTEGER DEFAULT 0 CHECK (students_served >= 0),
  rating DECIMAL(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  phone VARCHAR(20),
  is_admin BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- 布局配置表
-- ===========================================
CREATE TABLE IF NOT EXISTS layout_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  module_name VARCHAR(50) NOT NULL UNIQUE,
  x_position INTEGER DEFAULT 0,
  y_position INTEGER DEFAULT 0,
  z_index INTEGER DEFAULT 0,
  is_locked BOOLEAN DEFAULT true,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- 使用统计表
-- ===========================================
CREATE TABLE IF NOT EXISTS usage_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  action_type VARCHAR(50) NOT NULL,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- API日志表
-- ===========================================
CREATE TABLE IF NOT EXISTS api_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  endpoint VARCHAR(255) NOT NULL,
  method VARCHAR(10) NOT NULL,
  status_code INTEGER,
  response_time INTEGER,
  user_agent TEXT,
  ip_address INET,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  request_body JSONB,
  response_body JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- 系统配置表
-- ===========================================
CREATE TABLE IF NOT EXISTS system_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  config_key VARCHAR(100) UNIQUE NOT NULL,
  config_value TEXT,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- 创建索引
-- ===========================================
-- 用户表索引
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON users(is_admin);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login_at);

-- 使用统计表索引
CREATE INDEX IF NOT EXISTS idx_usage_stats_user_id ON usage_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_stats_action_type ON usage_stats(action_type);
CREATE INDEX IF NOT EXISTS idx_usage_stats_created_at ON usage_stats(created_at);

-- API日志表索引
CREATE INDEX IF NOT EXISTS idx_api_logs_endpoint ON api_logs(endpoint);
CREATE INDEX IF NOT EXISTS idx_api_logs_created_at ON api_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_api_logs_user_id ON api_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_api_logs_status_code ON api_logs(status_code);

-- 系统配置表索引
CREATE INDEX IF NOT EXISTS idx_system_config_key ON system_config(config_key);
CREATE INDEX IF NOT EXISTS idx_system_config_public ON system_config(is_public);

-- ===========================================
-- 创建更新时间触发器函数
-- ===========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为需要的表添加更新时间触发器
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_layout_config_updated_at BEFORE UPDATE ON layout_config
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_config_updated_at BEFORE UPDATE ON system_config
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- 插入默认数据
-- ===========================================

-- 插入默认布局配置
INSERT INTO layout_config (module_name, x_position, y_position, z_index, is_locked, is_visible) VALUES
('avatar', 50, 50, 1, true, true),
('name', 50, 200, 2, true, true),
('title', 50, 250, 3, true, true),
('stats', 50, 300, 4, true, true),
('contact', 50, 400, 5, true, true)
ON CONFLICT (module_name) DO NOTHING;

-- 插入系统配置
INSERT INTO system_config (config_key, config_value, description, is_public) VALUES
('app_name', '51Talk数字名片平台', '应用名称', true),
('app_version', '1.4.0', '应用版本', true),
('maintenance_mode', 'false', '维护模式', false),
('max_avatar_size', '5242880', '最大头像文件大小（字节）', true),
('allowed_avatar_types', 'image/jpeg,image/png,image/webp', '允许的头像文件类型', true),
('email_verification_required', 'true', '是否需要邮箱验证', false),
('admin_notification_threshold', '5', '管理员告警阈值', false)
ON CONFLICT (config_key) DO NOTHING;

-- 创建默认管理员用户（请替换为实际的管理员邮箱）
-- 注意：首次部署时请修改为实际的管理员邮箱
INSERT INTO users (email, name, is_admin, is_active) VALUES 
('admin@51talk.com', '系统管理员', true, true)
ON CONFLICT (email) DO NOTHING;

-- ===========================================
-- 启用行级安全策略 (RLS)
-- ===========================================

-- 启用RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_logs ENABLE ROW LEVEL SECURITY;

-- 用户表策略
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- 使用统计表策略
CREATE POLICY "Users can view their own stats" ON usage_stats
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all stats" ON usage_stats
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- API日志表策略
CREATE POLICY "Admins can view all API logs" ON api_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- ===========================================
-- 创建有用的视图
-- ===========================================

-- 用户统计视图
CREATE OR REPLACE VIEW user_stats_view AS
SELECT 
    u.id,
    u.email,
    u.name,
    u.title,
    u.students_served,
    u.rating,
    u.is_admin,
    u.created_at,
    u.last_login_at,
    COUNT(us.id) as total_actions,
    COUNT(CASE WHEN us.action_type = 'avatar_upload' THEN 1 END) as avatar_uploads,
    COUNT(CASE WHEN us.action_type = 'card_export' THEN 1 END) as card_exports,
    COUNT(CASE WHEN us.action_type = 'login' THEN 1 END) as login_count
FROM users u
LEFT JOIN usage_stats us ON u.id = us.user_id
GROUP BY u.id, u.email, u.name, u.title, u.students_served, u.rating, u.is_admin, u.created_at, u.last_login_at;

-- 每日统计视图
CREATE OR REPLACE VIEW daily_stats_view AS
SELECT 
    DATE(created_at) as date,
    COUNT(CASE WHEN action_type = 'register' THEN 1 END) as new_registrations,
    COUNT(CASE WHEN action_type = 'login' THEN 1 END) as logins,
    COUNT(CASE WHEN action_type = 'avatar_upload' THEN 1 END) as avatar_uploads,
    COUNT(CASE WHEN action_type = 'card_export' THEN 1 END) as card_exports
FROM usage_stats
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- ===========================================
-- 创建清理旧数据的函数
-- ===========================================

-- 清理30天前的API日志
CREATE OR REPLACE FUNCTION cleanup_old_api_logs()
RETURNS void AS $$
BEGIN
    DELETE FROM api_logs 
    WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- 清理90天前的使用统计
CREATE OR REPLACE FUNCTION cleanup_old_usage_stats()
RETURNS void AS $$
BEGIN
    DELETE FROM usage_stats 
    WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- ===========================================
-- 完成提示
-- ===========================================
-- 数据库初始化完成！
-- 
-- 下一步：
-- 1. 在 Supabase 控制台中配置存储桶
-- 2. 设置邮箱验证模板
-- 3. 配置 CORS 策略
-- 4. 测试数据库连接


