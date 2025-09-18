import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { RemoveApiLogger } from '@/lib/remove-api-logger'

export async function GET(req: NextRequest) {
  try {
    // 使用管理员客户端，确保在无登录会话和RLS开启时也能读取真实数据
    const supabase = createAdminClient()

    // 获取当前日期的开始和结束时间（使用UTC时间确保时区一致性）
    const now = new Date()
    
    // 获取北京时间的今日开始和结束时间
    const beijingTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Shanghai"}))
    const todayStartBeijing = new Date(beijingTime.getFullYear(), beijingTime.getMonth(), beijingTime.getDate(), 0, 0, 0, 0)
    const todayEndBeijing = new Date(beijingTime.getFullYear(), beijingTime.getMonth(), beijingTime.getDate() + 1, 0, 0, 0, 0)
    
    // 转换为UTC时间用于数据库查询
    const todayStart = new Date(todayStartBeijing.getTime() - (8 * 60 * 60 * 1000)).toISOString() // 减去8小时时差
    const todayEnd = new Date(todayEndBeijing.getTime() - (8 * 60 * 60 * 1000)).toISOString()
    
    console.log('🕐 时间范围调试:', {
      now: now.toISOString(),
      localTime: now.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }),
      beijingTime: beijingTime.toISOString(),
      todayStart,
      todayEnd,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    })

    // 1. 获取总用户数 (使用Service Role绕过RLS)
    const { data: allUsers, error: usersError } = await supabase
      .from('users')
      .select('id, email, created_at, last_login')
      .order('created_at', { ascending: false })

    if (usersError) {
      console.error('Error fetching users:', usersError)
    }

    // 2. 获取今日新注册用户
    console.log('查询今日注册用户，时间范围:', { todayStart, todayEnd })
    const { data: todayUsers, error: todayUsersError } = await supabase
      .from('users')
      .select('id, email, created_at')
      .gte('created_at', todayStart)
      .lt('created_at', todayEnd)

    console.log('今日注册用户查询结果:', { 
      count: todayUsers?.length || 0, 
      users: todayUsers?.map(u => ({ email: u.email, created_at: u.created_at })) || [],
      error: todayUsersError 
    })

    if (todayUsersError) {
      console.error('Error fetching today users:', todayUsersError)
    }

    // 3. 获取最近7天活跃用户（有登录记录的）
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const { data: activeUsers, error: activeUsersError } = await supabase
      .from('users')
      .select('id')
      .gte('last_login', sevenDaysAgo)

    if (activeUsersError) {
      console.error('Error fetching active users:', activeUsersError)
    }

    // 4. 获取下载统计（从用户活动日志或API调用记录）
    // 注意：这里需要根据你的实际表结构调整
    let totalDownloads = 0
    let todayDownloads = 0
    let totalApiCalls = 0
    let todayApiCalls = 0
    let removeBgCalls = 0
    let todayRemoveBg = 0

    // 尝试从API调用日志表获取数据（如果存在）
    try {
      const { data: apiLogs, error: apiLogsError } = await supabase
        .from('api_logs')
        .select('action, created_at')
        .order('created_at', { ascending: false })

      if (!apiLogsError && apiLogs) {
        console.log('API日志统计调试:')
        console.log('总记录数:', apiLogs.length)
        console.log('时间范围:', { todayStart, todayEnd })
        
        // 过滤今日记录
        const todayRecords = apiLogs.filter(log => {
          const logTime = new Date(log.created_at)
          return logTime >= todayStart && logTime < todayEnd
        })
        
        console.log('今日记录:', todayRecords.map(r => ({ action: r.action, created_at: r.created_at })))
        
        // 统计API调用次数
        const apiCallsCount = apiLogs.length
        const downloadCount = apiLogs.filter(log => log.action === 'download').length
        const removeBgCount = apiLogs.filter(log => 
          log.action === 'remove_background' || log.action === 'remove_bg_api'
        ).length
        
        // 统计今日数据
         const todayApiCallsCount = todayRecords.length
         const todayDownloadsCount = todayRecords.filter(log => log.action === 'download').length
         const todayRemoveBgCount = todayRecords.filter(log => 
           log.action === 'remove_background' || log.action === 'remove_bg_api'
         ).length
         
         totalApiCalls = apiCallsCount
         totalDownloads = downloadCount
         removeBgCalls = removeBgCount
         todayApiCalls = todayApiCallsCount
         todayDownloads = todayDownloadsCount
         todayRemoveBg = todayRemoveBgCount
        
        // 如果 api_logs 存在但为空，降级到 usage_stats 统计
        if (apiLogs.length === 0) {
          throw new Error('api_logs empty, fallback to usage_stats')
        }
      }
    } catch (error) {
      console.log('API logs table not found, trying usage_stats table...')
      
      // 尝试从 usage_stats 表获取数据
      try {
        const { data: usageStats, error: usageError } = await supabase
          .from('usage_stats')
          .select('action_type, created_at')

        if (!usageError && usageStats) {
          console.log('✅ 找到 usage_stats 数据:', usageStats.length, '条记录')
          totalApiCalls = usageStats.length
          todayApiCalls = usageStats.filter(stat => stat.created_at >= todayStart && stat.created_at < todayEnd).length
          
          // 统计下载和抠图（适配 usage_stats 字段名）
          totalDownloads = usageStats.filter(stat => stat.action_type === 'download').length
          todayDownloads = usageStats.filter(stat => 
            stat.action_type === 'download' && 
            stat.created_at >= todayStart && 
            stat.created_at < todayEnd
          ).length
          
          // 抠图：兼容 action_type 命名差异
          removeBgCalls = usageStats.filter(stat => 
            stat.action_type === 'remove_background' || stat.action_type === 'remove_bg_api'
          ).length
          todayRemoveBg = usageStats.filter(stat => 
            (stat.action_type === 'remove_background' || stat.action_type === 'remove_bg_api') && 
            stat.created_at >= todayStart && 
            stat.created_at < todayEnd
          ).length
        } else {
          throw new Error('Usage stats table not accessible')
        }
      } catch (usageError) {
        console.log('Usage stats table also not found, returning zero values for testing')
        // 测试模式：返回0值以便观察实时记录
        totalDownloads = 0
        todayDownloads = 0
        totalApiCalls = 0
        todayApiCalls = 0
        removeBgCalls = 0
        todayRemoveBg = 0
      }
    }

    // 5. 获取用户详细统计（使用真实数据）
    const recentUsers = await Promise.all((allUsers || []).slice(0, 50).map(async (user) => {
      // 获取每个用户的真实统计数据
      let downloadCount = 0
      let removeBgCount = 0
      let totalApiCalls = 0
      let loginCount = 0

      try {
        // 优先从新的 remove_api_logs 表获取抠图统计
        try {
          const removeApiStats = await RemoveApiLogger.getUserUsageStats(user.id)
          removeBgCount = removeApiStats.totalCalls
        } catch (removeApiError) {
          console.log(`从 remove_api_logs 获取用户 ${user.id} 抠图统计失败，降级到 usage_stats:`, removeApiError)
        }

        // 从 usage_stats 表获取其他统计数据
        const { data: userStats } = await supabase
          .from('usage_stats')
          .select('action_type, created_at')
          .eq('user_id', user.id)

        if (userStats) {
          downloadCount = userStats.filter(stat => stat.action_type === 'download').length
          // 如果新的 remove_api_logs 表没有数据，则使用 usage_stats 的抠图统计
          if (removeBgCount === 0) {
            removeBgCount = userStats.filter(stat => 
              stat.action_type === 'remove_background' || stat.action_type === 'remove_bg_api'
            ).length
          }
          totalApiCalls = userStats.length
          loginCount = userStats.filter(stat => stat.action_type === 'login').length
        }
      } catch (error) {
        console.log(`获取用户 ${user.id} 统计数据失败:`, error)
      }

      return {
        id: user.id,
        name: user.email?.split('@')[0] || '未知用户',
        email: user.email,
        title: '51Talk员工',
        created_at: user.created_at,
        last_login: user.last_login || user.created_at,
        download_count: downloadCount,
        remove_bg_count: removeBgCount,
        total_api_calls: totalApiCalls,
        login_count: loginCount || 1 // 至少登录1次
      }
    }))

    // 重新计算总体统计数据（基于用户详细数据）
    const realTotalDownloads = recentUsers.reduce((sum, user) => sum + user.download_count, 0)
    const realTotalApiCalls = recentUsers.reduce((sum, user) => sum + user.total_api_calls, 0)
    const realRemoveBgCalls = recentUsers.reduce((sum, user) => sum + user.remove_bg_count, 0)

    // 构建响应数据
    const responseData = {
      totalUsers: allUsers?.length || 0,
      activeUsers: activeUsers?.length || 0,
      totalDownloads: realTotalDownloads || totalDownloads,
      totalApiCalls: realTotalApiCalls || totalApiCalls,
      removeBgCalls: realRemoveBgCalls || removeBgCalls,
      todayRegistrations: todayUsers?.length || 0,
      todayDownloads,
      todayApiCalls,
      todayRemoveBg,
      recentUsers,
      lastUpdated: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      data: responseData,
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('Admin stats API error:', error)
    
    // 返回错误但包含备用数据
    return NextResponse.json({
      success: false,
      error: error.message,
      data: {
        totalUsers: 0,
        activeUsers: 0,
        totalDownloads: 0,
        totalApiCalls: 0,
        removeBgCalls: 0,
        todayRegistrations: 0,
        todayDownloads: 0,
        todayApiCalls: 0,
        todayRemoveBg: 0,
        recentUsers: [],
        lastUpdated: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}