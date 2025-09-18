-- ============================================
-- 51Talk 名片平台 - Remove API 使用记录表
-- 专门记录用户使用抠图API的详细行为统计
-- ============================================

-- 1. 创建 remove_api_logs 表
CREATE TABLE IF NOT EXISTS remove_api_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_email VARCHAR(255) NOT NULL,
  user_name VARCHAR(100),
  
  -- API调用信息
  api_provider VARCHAR(50) NOT NULL DEFAULT 'remove_bg', -- remove_bg, local_advanced, local_simple
  request_method VARCHAR(10) NOT NULL DEFAULT 'POST',
  endpoint VARCHAR(100) NOT NULL DEFAULT '/api/remove-bg',
  
  -- 图片处理信息
  original_file_size INTEGER, -- 原始文件大小（字节）
  original_file_type VARCHAR(50), -- 原始文件类型
  processed_file_size INTEGER, -- 处理后文件大小（字节）
  processing_time INTEGER, -- 处理时间（毫秒）
  
  -- 请求信息
  ip_address VARCHAR(45),
  user_agent TEXT,
  session_id VARCHAR(100),
  
  -- 结果信息
  success BOOLEAN NOT NULL DEFAULT TRUE,
  error_message TEXT,
  error_code VARCHAR(50),
  
  -- 配额和限制信息
  daily_usage_count INTEGER DEFAULT 1, -- 当日使用次数
  monthly_usage_count INTEGER DEFAULT 1, -- 当月使用次数
  
  -- 时间戳
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_remove_api_logs_user_id ON remove_api_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_remove_api_logs_user_email ON remove_api_logs(user_email);
CREATE INDEX IF NOT EXISTS idx_remove_api_logs_created_at ON remove_api_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_remove_api_logs_success ON remove_api_logs(success);
CREATE INDEX IF NOT EXISTS idx_remove_api_logs_api_provider ON remove_api_logs(api_provider);

-- 3. 创建复合索引用于统计查询
CREATE INDEX IF NOT EXISTS idx_remove_api_logs_user_date ON remove_api_logs(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_remove_api_logs_date_success ON remove_api_logs(created_at, success);

-- 4. 创建用户每日使用统计视图
CREATE OR REPLACE VIEW user_daily_remove_api_stats AS
SELECT 
  user_id,
  user_email,
  user_name,
  DATE(created_at) as usage_date,
  COUNT(*) as total_calls,
  COUNT(CASE WHEN success = true THEN 1 END) as successful_calls,
  COUNT(CASE WHEN success = false THEN 1 END) as failed_calls,
  COUNT(CASE WHEN api_provider = 'remove_bg' THEN 1 END) as remove_bg_calls,
  COUNT(CASE WHEN api_provider = 'local_advanced' THEN 1 END) as local_advanced_calls,
  COUNT(CASE WHEN api_provider = 'local_simple' THEN 1 END) as local_simple_calls,
  AVG(processing_time) as avg_processing_time,
  SUM(original_file_size) as total_file_size_processed,
  MIN(created_at) as first_call_time,
  MAX(created_at) as last_call_time
FROM remove_api_logs
GROUP BY user_id, user_email, user_name, DATE(created_at)
ORDER BY usage_date DESC, total_calls DESC;

-- 5. 创建用户月度使用统计视图
CREATE OR REPLACE VIEW user_monthly_remove_api_stats AS
SELECT 
  user_id,
  user_email,
  user_name,
  DATE_TRUNC('month', created_at) as usage_month,
  COUNT(*) as total_calls,
  COUNT(CASE WHEN success = true THEN 1 END) as successful_calls,
  COUNT(CASE WHEN success = false THEN 1 END) as failed_calls,
  COUNT(CASE WHEN api_provider = 'remove_bg' THEN 1 END) as remove_bg_calls,
  COUNT(CASE WHEN api_provider = 'local_advanced' THEN 1 END) as local_advanced_calls,
  COUNT(CASE WHEN api_provider = 'local_simple' THEN 1 END) as local_simple_calls,
  AVG(processing_time) as avg_processing_time,
  SUM(original_file_size) as total_file_size_processed,
  MIN(created_at) as first_call_time,
  MAX(created_at) as last_call_time
FROM remove_api_logs
GROUP BY user_id, user_email, user_name, DATE_TRUNC('month', created_at)
ORDER BY usage_month DESC, total_calls DESC;

-- 6. 创建总体统计视图
CREATE OR REPLACE VIEW remove_api_overall_stats AS
SELECT 
  DATE(created_at) as stat_date,
  COUNT(*) as total_calls,
  COUNT(CASE WHEN success = true THEN 1 END) as successful_calls,
  COUNT(CASE WHEN success = false THEN 1 END) as failed_calls,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(CASE WHEN api_provider = 'remove_bg' THEN 1 END) as remove_bg_calls,
  COUNT(CASE WHEN api_provider = 'local_advanced' THEN 1 END) as local_advanced_calls,
  COUNT(CASE WHEN api_provider = 'local_simple' THEN 1 END) as local_simple_calls,
  AVG(processing_time) as avg_processing_time,
  SUM(original_file_size) as total_file_size_processed
FROM remove_api_logs
GROUP BY DATE(created_at)
ORDER BY stat_date DESC;

-- 7. 创建用户使用排行榜视图
CREATE OR REPLACE VIEW user_remove_api_leaderboard AS
SELECT 
  user_id,
  user_email,
  user_name,
  COUNT(*) as total_calls,
  COUNT(CASE WHEN success = true THEN 1 END) as successful_calls,
  COUNT(CASE WHEN api_provider = 'remove_bg' THEN 1 END) as remove_bg_calls,
  AVG(processing_time) as avg_processing_time,
  MIN(created_at) as first_usage,
  MAX(created_at) as last_usage,
  RANK() OVER (ORDER BY COUNT(*) DESC) as usage_rank
FROM remove_api_logs
GROUP BY user_id, user_email, user_name
ORDER BY total_calls DESC;

-- 8. 创建触发器函数：自动更新 updated_at 字段
CREATE OR REPLACE FUNCTION update_remove_api_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. 创建触发器
DROP TRIGGER IF EXISTS trigger_update_remove_api_logs_updated_at ON remove_api_logs;
CREATE TRIGGER trigger_update_remove_api_logs_updated_at
  BEFORE UPDATE ON remove_api_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_remove_api_logs_updated_at();

-- 10. 创建函数：获取用户当日使用次数
CREATE OR REPLACE FUNCTION get_user_daily_remove_api_count(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  daily_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO daily_count
  FROM remove_api_logs
  WHERE user_id = user_uuid
    AND DATE(created_at) = CURRENT_DATE;
  
  RETURN COALESCE(daily_count, 0);
END;
$$ LANGUAGE plpgsql;

-- 11. 创建函数：获取用户当月使用次数
CREATE OR REPLACE FUNCTION get_user_monthly_remove_api_count(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  monthly_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO monthly_count
  FROM remove_api_logs
  WHERE user_id = user_uuid
    AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE);
  
  RETURN COALESCE(monthly_count, 0);
END;
$$ LANGUAGE plpgsql;

-- 12. 创建函数：检查用户是否超过使用限制
CREATE OR REPLACE FUNCTION check_user_remove_api_limit(user_uuid UUID, daily_limit INTEGER DEFAULT 5)
RETURNS BOOLEAN AS $$
DECLARE
  daily_count INTEGER;
BEGIN
  SELECT get_user_daily_remove_api_count(user_uuid) INTO daily_count;
  
  RETURN daily_count < daily_limit;
END;
$$ LANGUAGE plpgsql;

-- 13. 设置行级安全策略（RLS）
ALTER TABLE remove_api_logs ENABLE ROW LEVEL SECURITY;

-- 14. 创建RLS策略：用户只能查看自己的记录
CREATE POLICY "Users can view own remove api logs" ON remove_api_logs
FOR SELECT USING (user_id = auth.uid());

-- 15. 创建RLS策略：管理员可以查看所有记录
CREATE POLICY "Admins can view all remove api logs" ON remove_api_logs
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- 16. 创建RLS策略：服务端可以插入记录
CREATE POLICY "Service can insert remove api logs" ON remove_api_logs
FOR INSERT WITH CHECK (true);

-- 17. 插入一些示例数据（可选）
-- INSERT INTO remove_api_logs (user_id, user_email, user_name, api_provider, original_file_size, processing_time, success)
-- VALUES 
--   ('3b1cc4d2-a2c7-4954-84d1-49065c617568', 'guhongji@51talk.com', 'guhongji', 'remove_bg', 1024000, 2500, true),
--   ('3b1cc4d2-a2c7-4954-84d1-49065c617568', 'guhongji@51talk.com', 'guhongji', 'remove_bg', 2048000, 3200, true);

-- 18. 创建注释
COMMENT ON TABLE remove_api_logs IS '用户抠图API使用记录表，记录详细的API调用信息';
COMMENT ON COLUMN remove_api_logs.api_provider IS 'API提供商：remove_bg, local_advanced, local_simple';
COMMENT ON COLUMN remove_api_logs.processing_time IS '处理时间（毫秒）';
COMMENT ON COLUMN remove_api_logs.daily_usage_count IS '当日使用次数';
COMMENT ON COLUMN remove_api_logs.monthly_usage_count IS '当月使用次数';

-- 完成提示
SELECT 'Remove API日志表创建完成！' as status;
