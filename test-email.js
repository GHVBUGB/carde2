// 邮箱发送测试脚本
// 运行命令: node test-email.js

const nodemailer = require('nodemailer');
require('dotenv').config({ path: '.env.local' });

async function testEmailSending() {
  console.log('开始测试邮箱发送功能...\n');

  // 检查环境变量
  const requiredEnvVars = [
    'SMTP_HOST',
    'SMTP_PORT', 
    'SMTP_USER',
    'SMTP_PASS',
    'SMTP_FROM'
  ];

  console.log('检查环境变量:');
  for (const envVar of requiredEnvVars) {
    const value = process.env[envVar];
    if (value && !value.includes('your_')) {
      console.log(`✅ ${envVar}: ${value.substring(0, 10)}...`);
    } else {
      console.log(`❌ ${envVar}: 未配置或使用默认值`);
    }
  }
  console.log('');

  // 创建邮件传输器
  const transporter = nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: parseInt(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // 验证连接
  try {
    console.log('验证SMTP连接...');
    await transporter.verify();
    console.log('✅ SMTP连接验证成功\n');
  } catch (error) {
    console.error('❌ SMTP连接验证失败:', error.message);
    return;
  }

  // 发送测试邮件
  const testEmail = process.env.SMTP_USER; // 发送给自己
  const testCode = Math.random().toString().slice(2, 8);

  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: testEmail,
    subject: `51Talk 名片平台 - 测试验证码: ${testCode}`,
    html: `
      <div style="font-family: Arial, 'Microsoft YaHei', Helvetica, sans-serif; line-height:1.6; color:#1f2937;">
        <h2 style="margin:0 0 12px;">51Talk 数字名片平台 - 测试邮件</h2>
        <p>这是一封测试邮件，验证码为：</p>
        <p style="font-size:24px; font-weight:bold; letter-spacing:4px; color:#ef4f24;">${testCode}</p>
        <p>如果您收到此邮件，说明邮箱配置正确！</p>
        <hr style="border:none; border-top:1px solid #e5e7eb; margin:16px 0;" />
        <p style="font-size:12px; color:#6b7280;">测试时间: ${new Date().toLocaleString()}</p>
      </div>
    `,
  };

  try {
    console.log(`发送测试邮件到: ${testEmail}`);
    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ 邮件发送成功!');
    console.log(`邮件ID: ${info.messageId}`);
    
    // 如果是测试邮箱，显示预览链接
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`邮件预览链接: ${previewUrl}`);
    }
    
  } catch (error) {
    console.error('❌ 邮件发送失败:', error.message);
  }
}

// 运行测试
testEmailSending().catch(console.error);
