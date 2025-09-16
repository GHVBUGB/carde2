#!/usr/bin/env node

/**
 * 用户行为模拟脚本
 * 用于测试管理员系统是否能正确记录和显示用户活动
 */

const BASE_URL = 'http://localhost:3000';

// 模拟用户数据
const TEST_USERS = [
  { email: 'ahmed.teacher@51talk.com', name: 'Ahmed Al-Fawaz', title: 'شريك النمو الرئيسي' },
  { email: 'sara.coach@51talk.com', name: 'Sara Mohamed', title: 'مستشار النمو الذهبي' },
  { email: 'karim.mentor@51talk.com', name: 'كريم', title: 'مسؤول الخدمة خمس نجوم' },
  { email: 'fatima.guide@51talk.com', name: 'Fatima Ali', title: 'مسؤول الملاحة التعليمية' },
  { email: 'omar.advisor@51talk.com', name: 'Omar Hassan', title: 'شريك النمو الرئيسي' }
];

// 模拟操作类型
const ACTIONS = [
  { type: 'login', weight: 10 },
  { type: 'download', weight: 8 },
  { type: 'remove_background', weight: 5 },
  { type: 'card_create', weight: 3 },
  { type: 'register', weight: 1 }
];

function log(message) {
  console.log(`[${new Date().toLocaleString()}] ${message}`);
}

function getRandomUser() {
  return TEST_USERS[Math.floor(Math.random() * TEST_USERS.length)];
}

function getRandomAction() {
  const totalWeight = ACTIONS.reduce((sum, action) => sum + action.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const action of ACTIONS) {
    random -= action.weight;
    if (random <= 0) {
      return action.type;
    }
  }
  return 'login';
}

async function simulateAction(action, user) {
  try {
    const response = await fetch(`${BASE_URL}/api/test/simulate-action`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: action,
        user_id: `user_${user.email.split('@')[0]}`,
        details: {
          user_email: user.email,
          user_name: user.name,
          user_title: user.title,
          simulation: true,
          timestamp: new Date().toISOString(),
          // 根据操作类型添加特定details
          ...(action === 'download' && {
            file_format: Math.random() > 0.5 ? 'png' : 'jpg',
            file_size: Math.floor(Math.random() * 1000000) + 500000,
            export_type: 'dom_export'
          }),
          ...(action === 'remove_background' && {
            processing_time: Math.floor(Math.random() * 5000) + 1000,
            image_size: Math.floor(Math.random() * 2000000) + 500000,
            success: Math.random() > 0.1 // 90% 成功率
          }),
          ...(action === 'card_create' && {
            card_type: 'business',
            template: 'default',
            background_image: '/底图.png'
          })
        }
      })
    });

    if (response.ok) {
      const result = await response.json();
      log(`✅ ${action} - ${user.name} (${user.email})`);
      return true;
    } else {
      log(`❌ ${action} failed - ${user.name}: ${response.status}`);
      return false;
    }
  } catch (error) {
    log(`❌ ${action} error - ${user.name}: ${error.message}`);
    return false;
  }
}

async function getStats() {
  try {
    const response = await fetch(`${BASE_URL}/api/admin/stats`);
    if (response.ok) {
      const stats = await response.json();
      log(`📊 当前统计: 用户${stats.totalUsers} | 下载${stats.totalDownloads} | API${stats.totalApiCalls} | 今日注册${stats.todayRegistrations}`);
      return stats;
    }
  } catch (error) {
    log(`❌ 获取统计失败: ${error.message}`);
  }
  return null;
}

async function checkAlerts() {
  try {
    const response = await fetch(`${BASE_URL}/api/admin/today-stats`);
    if (response.ok) {
      const data = await response.json();
      if (data.alerts && data.alerts.length > 0) {
        log(`🚨 发现警报: ${data.alerts.map(a => a.message).join(', ')}`);
      } else {
        log(`✅ 无警报`);
      }
      return data.alerts || [];
    }
  } catch (error) {
    log(`❌ 检查警报失败: ${error.message}`);
  }
  return [];
}

async function simulateBatch(count = 10) {
  log(`🎭 开始模拟 ${count} 个用户行为...`);
  
  let successCount = 0;
  
  for (let i = 0; i < count; i++) {
    const user = getRandomUser();
    const action = getRandomAction();
    
    const success = await simulateAction(action, user);
    if (success) successCount++;
    
    // 随机延迟 200-1000ms
    await new Promise(resolve => setTimeout(resolve, Math.random() * 800 + 200));
  }
  
  log(`🎉 批量模拟完成: ${successCount}/${count} 成功`);
  return successCount;
}

async function simulateHighUsage() {
  log(`⚡ 模拟高使用量场景（触发警报测试）...`);
  
  // 短时间内大量下载和抠图操作
  const user = getRandomUser();
  for (let i = 0; i < 8; i++) {
    await simulateAction('download', user);
    await simulateAction('remove_background', user);
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  log(`🚨 高使用量模拟完成，等待2秒后检查警报...`);
  await new Promise(resolve => setTimeout(resolve, 2000));
  await checkAlerts();
}

async function main() {
  log(`🚀 管理员系统测试开始`);
  log(`📡 目标服务器: ${BASE_URL}`);
  
  // 获取初始统计
  log(`\n📊 === 初始状态 ===`);
  await getStats();
  await checkAlerts();
  
  // 模拟正常用户行为
  log(`\n🎭 === 模拟正常用户行为 ===`);
  await simulateBatch(15);
  
  // 等待一秒后检查统计
  await new Promise(resolve => setTimeout(resolve, 1000));
  log(`\n📊 === 正常模拟后统计 ===`);
  await getStats();
  
  // 模拟高使用量
  log(`\n⚡ === 模拟高使用量场景 ===`);
  await simulateHighUsage();
  
  // 最终统计
  await new Promise(resolve => setTimeout(resolve, 1000));
  log(`\n📊 === 最终统计 ===`);
  await getStats();
  await checkAlerts();
  
  log(`\n✅ 测试完成！请访问管理员面板查看结果:`);
  log(`   - 管理员登录: ${BASE_URL}/admin/login`);
  log(`   - 管理员面板: ${BASE_URL}/admin/dashboard`);
  log(`   - 管理员密码: GhJ2537652940`);
}

// 如果是直接运行脚本
if (require.main === module) {
  main().catch(error => {
    console.error('❌ 脚本执行失败:', error);
    process.exit(1);
  });
}

module.exports = {
  simulateAction,
  simulateBatch,
  simulateHighUsage,
  getStats,
  checkAlerts
};
