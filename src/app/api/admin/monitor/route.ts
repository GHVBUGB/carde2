import { NextRequest, NextResponse } from 'next/server'
import { adminStatsService } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  try {
    // 获取今日统计数据
    const [overviewStats, usageStats, recentUsers] = await Promise.all([
      adminStatsService.getOverviewStats(),
      adminStatsService.getUsageStatistics(),
      adminStatsService.getRecentUsersWithStats(100)
    ])

    // 检查告警条件
    const alerts: any[] = []

    // 1. 检查今日注册用户数
    if (overviewStats.todayRegistrations > 5) {
      alerts.push({
        type: 'new_registrations',
        level: 'warning',
        message: `今日新注册用户已达 ${overviewStats.todayRegistrations} 个，超过预设阈值 5 个`,
        count: overviewStats.todayRegistrations,
        threshold: 5
      })
    }

    // 2. 检查今日抠图API调用次数
    if (usageStats.removeBgCallsToday > 5) {
      alerts.push({
        type: 'remove_bg_api_limit',
        level: 'critical',
        message: `今日抠图API调用已达 ${usageStats.removeBgCallsToday} 次，超过预设阈值 5 次`,
        count: usageStats.removeBgCallsToday,
        threshold: 5
      })
    }

    // 3. 检查今日下载次数
    if (usageStats.downloadsToday > 5) {
      alerts.push({
        type: 'download_limit',
        level: 'warning',
        message: `今日下载次数已达 ${usageStats.downloadsToday} 次，超过预设阈值 5 次`,
        count: usageStats.downloadsToday,
        threshold: 5
      })
    }

    // 4. 检查个人用户异常使用情况
    const highUsageUsers = recentUsers.filter(user => 
      user.remove_bg_count > 3 || user.download_count > 3
    )

    if (highUsageUsers.length > 0) {
      alerts.push({
        type: 'high_individual_usage',
        level: 'info',
        message: `发现 ${highUsageUsers.length} 个用户使用频次较高`,
        users: highUsageUsers.slice(0, 5), // 只显示前5个
        count: highUsageUsers.length
      })
    }

    // 5. 检查总API调用是否异常
    if (usageStats.totalApiCalls > 100) {
      alerts.push({
        type: 'high_api_usage',
        level: 'info',
        message: `总API调用次数已达 ${usageStats.totalApiCalls} 次`,
        count: usageStats.totalApiCalls
      })
    }

    // 返回监控结果
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      stats: {
        overview: overviewStats,
        usage: usageStats,
        userCount: recentUsers.length
      },
      alerts,
      alertCount: alerts.length,
      hasAlerts: alerts.length > 0
    })

  } catch (error: any) {
    console.error('Monitor API error:', error)
    return NextResponse.json(
      { 
        error: 'Monitor failed', 
        details: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

// POST 方法用于手动触发告警检查和邮件发送
export async function POST(req: NextRequest) {
  try {
    const { forceAlert = false } = await req.json()

    // 获取监控数据
    const response = await GET(req)
    const monitorData = await response.json()

    if (!monitorData.success) {
      throw new Error('Failed to get monitor data')
    }

    const { alerts } = monitorData

    // 发送告警邮件
    const emailPromises = alerts.map(async (alert: any) => {
      // 只发送critical和warning级别的告警，或者强制发送
      if (alert.level === 'critical' || alert.level === 'warning' || forceAlert) {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/admin/send-alert`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              type: alert.type,
              data: alert,
              timestamp: new Date().toISOString()
            })
          })

          if (response.ok) {
            return { type: alert.type, sent: true }
          } else {
            return { type: alert.type, sent: false, error: 'HTTP error' }
          }
        } catch (error: any) {
          return { type: alert.type, sent: false, error: error.message }
        }
      }
      return { type: alert.type, sent: false, reason: 'Level not critical' }
    })

    const emailResults = await Promise.all(emailPromises)

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      alerts,
      emailResults,
      sentEmails: emailResults.filter(r => r.sent).length
    })

  } catch (error: any) {
    console.error('Monitor POST error:', error)
    return NextResponse.json(
      { 
        error: 'Monitor POST failed', 
        details: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

