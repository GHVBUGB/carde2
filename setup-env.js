#!/usr/bin/env node

/**
 * 环境变量配置助手脚本
 * 帮助快速配置生产环境变量
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

console.log('🔧 51Talk数字名片平台 - 环境变量配置助手\n');

// 生成JWT密钥
function generateJWTSecret() {
  return crypto.randomBytes(32).toString('base64');
}

// 环境变量模板
const envTemplate = `# 51Talk数字名片平台 - 生产环境配置
# 自动生成于: ${new Date().toISOString()}

# ===========================================
# Supabase 数据库配置
# ===========================================
# 请替换为你的实际Supabase项目信息
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# ===========================================
# Remove.bg API 配置
# ===========================================
# 从 https://www.remove.bg/api 获取
REMOVE_BG_API_KEY=your_remove_bg_api_key_here

# ===========================================
# JWT 安全配置
# ===========================================
# 自动生成的强密码
JWT_SECRET=${generateJWTSecret()}

# ===========================================
# 51Talk 企业邮箱配置
# ===========================================
SMTP_HOST=smtp.exmail.qq.com
SMTP_PORT=465
SMTP_USER=no-reply@51talk.com
SMTP_PASS=your_smtp_password_here
SMTP_FROM=51Talk 名片平台 <no-reply@51talk.com>

# ===========================================
# 管理员配置
# ===========================================
ADMIN_EMAIL=admin@51talk.com

# ===========================================
# 应用配置
# ===========================================
NEXT_PUBLIC_APP_URL=https://your-project-name.vercel.app

# ===========================================
# 可选配置
# ===========================================
LOG_LEVEL=info
DEBUG=false
API_TIMEOUT=30000
MAX_FILE_SIZE=5242880
SESSION_TIMEOUT=3600
`;

// 创建环境变量文件
function createEnvFile() {
  const envPath = path.join(process.cwd(), '.env.production');
  
  try {
    fs.writeFileSync(envPath, envTemplate);
    console.log('✅ 已创建 .env.production 文件');
    console.log('📍 文件位置:', envPath);
    console.log('\n📝 接下来请编辑此文件，填入你的实际配置值：');
    console.log('   1. Supabase项目URL和API密钥');
    console.log('   2. Remove.bg API密钥');
    console.log('   3. SMTP邮件服务密码');
    console.log('   4. 应用URL（部署后更新）');
    console.log('\n🔐 JWT密钥已自动生成，请妥善保存！');
    
  } catch (error) {
    console.error('❌ 创建环境变量文件失败:', error.message);
    process.exit(1);
  }
}

// 显示配置指南
function showConfigGuide() {
  console.log('\n📋 配置指南：');
  console.log('1. Supabase配置：');
  console.log('   - 访问 https://supabase.com');
  console.log('   - 创建新项目');
  console.log('   - 在 Settings > API 中获取密钥');
  
  console.log('\n2. Remove.bg API：');
  console.log('   - 访问 https://www.remove.bg/api');
  console.log('   - 注册账号获取API密钥');
  
  console.log('\n3. SMTP邮件服务：');
  console.log('   - 使用51Talk企业邮箱');
  console.log('   - 或配置其他SMTP服务');
  
  console.log('\n4. 数据库初始化：');
  console.log('   - 在Supabase SQL Editor中执行 database-init-production.sql');
  
  console.log('\n5. 测试配置：');
  console.log('   - 运行 npm run dev');
  console.log('   - 访问 http://localhost:3000/api/health');
}

// 主函数
function main() {
  console.log('🚀 开始配置环境变量...\n');
  
  // 检查是否已存在配置文件
  const envPath = path.join(process.cwd(), '.env.production');
  if (fs.existsSync(envPath)) {
    console.log('⚠️  检测到已存在 .env.production 文件');
    console.log('   是否要覆盖？(y/N)');
    
    // 在Node.js中，我们可以使用readline来获取用户输入
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    rl.question('', (answer) => {
      if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
        createEnvFile();
        showConfigGuide();
      } else {
        console.log('✅ 保持现有配置文件不变');
      }
      rl.close();
    });
  } else {
    createEnvFile();
    showConfigGuide();
  }
}

// 运行脚本
if (require.main === module) {
  main();
}

module.exports = { generateJWTSecret, createEnvFile };
