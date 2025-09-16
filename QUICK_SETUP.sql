-- ============================================
-- 51Talk 管理员系统 - 快速建表脚本
-- 支持2000+用户行为数据记录
-- 复制此脚本到 Supabase SQL Editor 执行
-- ============================================

-- 🗄️ 主要数据表
CREATE TABLE IF NOT EXISTS api_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL,
  action VARCHAR(50) NOT NULL,
  details JSONB DEFAULT '{}',
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 📊 使用统计表
CREATE TABLE IF NOT EXISTS usage_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL,
  action_type VARCHAR(50) NOT NULL,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 🚨 系统警报表
CREATE TABLE IF NOT EXISTS system_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ⚡ 性能索引（支持2000用户高并发）
CREATE INDEX IF NOT EXISTS idx_api_logs_user_action ON api_logs(user_id, action);
CREATE INDEX IF NOT EXISTS idx_api_logs_date ON api_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_logs_today ON api_logs(created_at) WHERE created_at >= CURRENT_DATE;
CREATE INDEX IF NOT EXISTS idx_usage_stats_user ON usage_stats(user_id, action_type);
CREATE INDEX IF NOT EXISTS idx_usage_stats_date ON usage_stats(created_at DESC);

-- 🧪 插入测试数据（验证系统工作）
INSERT INTO api_logs (user_id, action, details) VALUES
  ('test_user_001', 'login', '{"name": "كريم", "test": true}'),
  ('test_user_002', 'download', '{"format": "png", "size": 856492}'),
  ('test_user_003', 'remove_background', '{"time": 2500, "success": true}'),
  ('test_user_004', 'download', '{"format": "jpg", "size": 742156}'),
  ('test_user_005', 'card_create', '{"template": "business"}');

-- 📅 今日数据（用于今日统计测试）
INSERT INTO api_logs (user_id, action, details, created_at) VALUES
  ('today_user_001', 'download', '{"today": true}', NOW()),
  ('today_user_002', 'download', '{"today": true}', NOW() - INTERVAL '1 hour'),
  ('today_user_003', 'remove_background', '{"today": true}', NOW() - INTERVAL '2 hours'),
  ('today_user_004', 'download', '{"today": true}', NOW() - INTERVAL '30 minutes'),
  ('today_user_005', 'login', '{"today": true}', NOW() - INTERVAL '10 minutes');

-- 📊 查看创建结果
SELECT 
  'api_logs 总记录' as info, 
  COUNT(*)::text as count 
FROM api_logs
UNION ALL
SELECT 
  'usage_stats 总记录', 
  COUNT(*)::text 
FROM usage_stats
UNION ALL
SELECT 
  '今日API调用', 
  COUNT(*)::text 
FROM api_logs 
WHERE created_at >= CURRENT_DATE;

-- 📈 今日行为统计
SELECT 
  action as 行为类型,
  COUNT(*) as 次数,
  COUNT(DISTINCT user_id) as 用户数
FROM api_logs 
WHERE created_at >= CURRENT_DATE 
GROUP BY action 
ORDER BY COUNT(*) DESC;
