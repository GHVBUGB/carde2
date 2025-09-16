import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import nodemailer from 'nodemailer'

// 邮件发送器配置
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.exmail.qq.com',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
})

// 管理员邮箱（从环境变量获取）
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@51talk.com'

interface AlertData {
  type: string
  data: any
  timestamp: string
}

export async function POST(req: NextRequest) {
  try {
    const alertData: AlertData = await req.json()
    
    // 验证请求权限（可以添加JWT验证）
    const authHeader = req.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // 对于内部调用，先跳过验证
      // return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 检查是否在短时间内已发送过相同类型的告警（防止邮件轰炸）
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const supabase = createServerClient()
    const { data: recentAlerts } = await supabase
      .from('usage_stats')
      .select('*')
      .eq('action_type', 'email_alert')
      .gte('created_at', oneHourAgo)
      .like('details', `%"type":"${alertData.type}"%`)

    if (recentAlerts && recentAlerts.length > 0) {
      return NextResponse.json({ 
        message: 'Alert already sent recently', 
        skipped: true 
      })
    }

    // 生成邮件内容
    const emailContent = generateEmailContent(alertData)
    
    // 发送邮件
    await transporter.sendMail({
      from: process.env.SMTP_FROM || '51Talk名片平台 <no-reply@51talk.com>',
      to: ADMIN_EMAIL,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text
    })

    // 记录告警发送
    await supabase
      .from('usage_stats')
      .insert({
        user_id: null,
        action_type: 'email_alert',
        details: {
          type: alertData.type,
          data: alertData.data,
          sent_to: ADMIN_EMAIL,
          timestamp: alertData.timestamp
        }
      })

    return NextResponse.json({ 
      success: true, 
      message: 'Alert sent successfully' 
    })

  } catch (error: any) {
    console.error('Failed to send alert:', error)
    return NextResponse.json(
      { error: 'Failed to send alert', details: error.message },
      { status: 500 }
    )
  }
}

function generateEmailContent(alertData: AlertData) {
  const { type, data, timestamp } = alertData
  const formattedTime = new Date(timestamp).toLocaleString('zh-CN')

  let subject = ''
  let content = ''

  switch (type) {
    case 'remove_bg_api_limit':
      subject = '🚨 51Talk名片平台 - 抠图API使用超限提醒'
      content = `
        <h2>抠图API使用超限提醒</h2>
        <p><strong>触发时间：</strong>${formattedTime}</p>
        <p><strong>当前调用次数：</strong>${data.count} 次</p>
        <p><strong>限制阈值：</strong>5 次/天</p>
        <p><strong>详情：</strong>${data.details}</p>
        <p>请及时关注API使用情况，如有异常请立即处理。</p>
      `
      break

    case 'download_limit':
      subject = '🚨 51Talk名片平台 - 名片下载超限提醒'
      content = `
        <h2>名片下载超限提醒</h2>
        <p><strong>触发时间：</strong>${formattedTime}</p>
        <p><strong>当前下载次数：</strong>${data.count} 次</p>
        <p><strong>限制阈值：</strong>5 次/天</p>
        <p><strong>详情：</strong>${data.details}</p>
        <p>请关注平台使用情况，确保服务正常运行。</p>
      `
      break

    case 'new_registrations':
      subject = '📈 51Talk名片平台 - 新用户注册超限提醒'
      content = `
        <h2>新用户注册超限提醒</h2>
        <p><strong>触发时间：</strong>${formattedTime}</p>
        <p><strong>今日新注册用户：</strong>${data.count} 个</p>
        <p><strong>限制阈值：</strong>5 个/天</p>
        <p><strong>新用户列表：</strong></p>
        <ul>
          ${data.users.map((user: any) => `
            <li>${user.name || '未设置'} (${user.email}) - ${new Date(user.created_at).toLocaleString('zh-CN')}</li>
          `).join('')}
        </ul>
        <p>新用户注册活跃，请关注平台运行状况。</p>
      `
      break

    case 'high_api_usage':
      subject = '⚠️ 51Talk名片平台 - API使用量异常提醒'
      content = `
        <h2>API使用量异常提醒</h2>
        <p><strong>触发时间：</strong>${formattedTime}</p>
        <p><strong>当前API调用次数：</strong>${data.count} 次</p>
        <p><strong>异常描述：</strong>${data.details}</p>
        <p>检测到异常的API使用模式，请及时检查。</p>
      `
      break

    default:
      subject = '🔔 51Talk名片平台 - 系统告警'
      content = `
        <h2>系统告警</h2>
        <p><strong>告警类型：</strong>${type}</p>
        <p><strong>触发时间：</strong>${formattedTime}</p>
        <p><strong>详情：</strong>${JSON.stringify(data, null, 2)}</p>
      `
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
        .content { background: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }
        .footer { margin-top: 20px; padding: 10px; text-align: center; color: #666; font-size: 12px; }
        .alert { background: #fff3cd; border: 1px solid #ffeaa7; padding: 10px; border-radius: 5px; margin: 10px 0; }
        h2 { color: #e74c3c; margin-top: 0; }
        ul { margin: 10px 0; padding-left: 20px; }
        li { margin: 5px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>51Talk名片平台监控系统</h1>
        </div>
        <div class="content">
          ${content}
          <div class="alert">
            <strong>注意：</strong>这是系统自动发送的监控邮件，请及时处理相关问题。
          </div>
        </div>
        <div class="footer">
          <p>51Talk名片平台管理系统 | 发送时间: ${formattedTime}</p>
          <p>如有问题，请联系技术支持团队</p>
        </div>
      </div>
    </body>
    </html>
  `

  const text = content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()

  return { subject, html, text }
}
