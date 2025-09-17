-- 数据库重置脚本
-- 清空所有用户数据和日志数据，保留表结构

-- 清空API日志表
DELETE FROM api_logs;

-- 清空用户统计表（如果存在）
DELETE FROM usage_stats WHERE true;

-- 清空用户表（保留管理员账户）
DELETE FROM auth.users WHERE email != 'admin@example.com';

-- 重置序列（如果有自增ID）
ALTER SEQUENCE IF EXISTS api_logs_id_seq RESTART WITH 1;

-- 确保api_logs表结构正确
CREATE TABLE IF NOT EXISTS api_logs (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    action_type VARCHAR(50) NOT NULL, -- 'register', 'background_removal', 'api_call'
    endpoint VARCHAR(255),
    method VARCHAR(10),
    status_code INTEGER,
    response_time INTEGER, -- 响应时间（毫秒）
    user_agent TEXT,
    ip_address INET,
    request_body JSONB,
    response_body JSONB,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_api_logs_user_id ON api_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_api_logs_action_type ON api_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_api_logs_created_at ON api_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_api_logs_endpoint ON api_logs(endpoint);

-- 插入测试数据重置完成的日志
INSERT INTO api_logs (action_type, endpoint, method, status_code, created_at)
VALUES ('system', '/admin/reset-database', 'POST', 200, NOW());

COMMIT;