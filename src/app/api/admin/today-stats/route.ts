import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  try {
    // 检查环境变量是否存在
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.warn('Supabase环境变量未配置，返回默认数据')
      return NextResponse.json({
        success: true,
        data: {
          todayNewUsers: 0,
          todayDownloads: 0,
          todayApiCalls: 0,
          todayRemoveBg: 0,
          alerts: [],
          alertCount: 0,
          hasAlerts: false,
          lastUpdated: new Date().toISOString(),
          dateRange: {
            start: new Date().toISOString(),
            end: new Date().toISOString()
          }
        },
        timestamp: new Date().toISOString()
      })
    }

    // 使用管理员客户端，保证没有会话也能读取统计
    const supabase = createAdminClient()

    // 获取当前日期的开始和结束时间（使用UTC时间避免时区问题）
    const now = new Date()
    const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())).toISOString()
    const todayEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1)).toISOString()
    
    console.log('Today range:', { todayStart, todayEnd, currentTime: now.toISOString() })

    // 1. 获取今日新注册用户数
    const { data: todayNewUsers, error: newUsersError } = await supabase
      .from('users')
      .select('id')
      .gte('created_at', todayStart)
      .lt('created_at', todayEnd)

    if (newUsersError) {
      console.error('Error fetching today new users:', newUsersError)
    }

    // 2. 获取今日活动统计
    let todayDownloads = 0
    let todayApiCalls = 0
    let todayRemoveBg = 0

    try {
      // 尝试从API日志表获取今日数据
      const { data: todayLogs, error: logsError } = await supabase
        .from('api_logs')
        .select('action, created_at')
        .gte('created_at', todayStart)
        .lt('created_at', todayEnd)

      if (!logsError && todayLogs) {
        todayApiCalls = todayLogs.length
        todayDownloads = todayLogs.filter(log => log.action === 'download').length
        todayRemoveBg = todayLogs.filter(log => log.action === 'remove_background').length

        // api_logs 存在但无数据时，降级到 usage_stats
        if (todayLogs.length === 0) {
          throw new Error('api_logs empty, fallback to usage_stats')
        }
      }
    } catch (error) {
      try {
        // 降级：从 usage_stats 读取
        const { data: usageToday, error: usageErr } = await supabase
          .from('usage_stats')
          .select('action_type, created_at')
          .gte('created_at', todayStart)
          .lt('created_at', todayEnd)

        if (!usageErr && usageToday) {
          todayApiCalls = usageToday.length
          todayDownloads = usageToday.filter(s => s.action_type === 'download').length
          todayRemoveBg = usageToday.filter(s => s.action_type === 'remove_background' || s.action_type === 'remove_bg_api').length
        } else {
          throw new Error('usage_stats not accessible')
        }
      } catch (fallbackErr) {
        console.log('API logs and usage_stats unavailable, returning zero values for testing')
        // 测试模式：返回0值以便观察实时记录
        todayDownloads = 0
        todayApiCalls = 0
        todayRemoveBg = 0
      }
    }

    // 3. 检查告警条件
    const alerts: any[] = []

    // 检查新注册用户数
    const newUsersCount = todayNewUsers?.length || 0
    if (newUsersCount > 5) {
      alerts.push({
        type: 'new_registrations',
        level: 'warning',
        message: `今日新注册用户已达 ${newUsersCount} 个，超过预设阈值 5 个`,
        count: newUsersCount,
        threshold: 5
      })
    }

    // 检查抠图API调用次数
    if (todayRemoveBg > 5) {
      alerts.push({
        type: 'remove_bg_api_limit',
        level: 'critical',
        message: `今日抠图API调用已达 ${todayRemoveBg} 次，超过预设阈值 5 次`,
        count: todayRemoveBg,
        threshold: 5
      })
    }

    // 检查下载次数
    if (todayDownloads > 5) {
      alerts.push({
        type: 'download_limit',
        level: 'warning',
        message: `今日下载次数已达 ${todayDownloads} 次，超过预设阈值 5 次`,
        count: todayDownloads,
        threshold: 5
      })
    }

    // 检查总API调用次数
    if (todayApiCalls > 20) {
      alerts.push({
        type: 'high_api_usage',
        level: 'info',
        message: `今日API调用次数已达 ${todayApiCalls} 次，使用量较高`,
        count: todayApiCalls,
        threshold: 20
      })
    }

    const responseData = {
      todayNewUsers: newUsersCount,
      todayDownloads,
      todayApiCalls,
      todayRemoveBg,
      alerts,
      alertCount: alerts.length,
      hasAlerts: alerts.length > 0,
      lastUpdated: new Date().toISOString(),
      dateRange: {
        start: todayStart,
        end: todayEnd
      }
    }

    return NextResponse.json({
      success: true,
      data: responseData,
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('Today stats API error:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message,
      data: {
        todayNewUsers: 0,
        todayDownloads: 0,
        todayApiCalls: 0,
        todayRemoveBg: 0,
        alerts: [{
          type: 'api_error',
          level: 'critical',
          message: '无法获取今日统计数据，请检查数据库连接'
        }],
        alertCount: 1,
        hasAlerts: true,
        lastUpdated: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}