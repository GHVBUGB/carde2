-- 创建 API 日志表
-- 在 Supabase SQL Editor 中执行此脚本

CREATE TABLE IF NOT EXISTS api_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255), -- 允许测试用户ID
  action VARCHAR(50) NOT NULL,
  details JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_api_logs_user_id ON api_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_api_logs_action ON api_logs(action);
CREATE INDEX IF NOT EXISTS idx_api_logs_created_at ON api_logs(created_at);

-- 插入一些测试数据来验证系统
INSERT INTO api_logs (user_id, action, details) VALUES
  ('test-user-001', 'login', '{"simulation": true, "user_name": "كريم"}'),
  ('test-user-002', 'download', '{"simulation": true, "file_format": "png", "file_size": 856492}'),
  ('test-user-003', 'remove_background', '{"simulation": true, "processing_time": 3247, "success": true}'),
  ('test-user-004', 'download', '{"simulation": true, "file_format": "jpg", "file_size": 742156}'),
  ('test-user-005', 'card_create', '{"simulation": true, "card_type": "business"}');

-- 验证数据插入
SELECT 
  action,
  COUNT(*) as count,
  MIN(created_at) as earliest,
  MAX(created_at) as latest
FROM api_logs 
GROUP BY action 
ORDER BY count DESC;
