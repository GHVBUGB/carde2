import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

/**
 * 测试API - 模拟用户行为记录
 * 仅用于测试管理员系统是否正常工作
 */
export async function POST(request: NextRequest) {
  try {
    const { action, user_id, details } = await request.json()

    if (!action) {
      return NextResponse.json(
        { error: '缺少action参数' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // 记录到usage_stats表（如果存在）
    try {
      const { data, error } = await supabase
        .from('usage_stats')
        .insert({
          user_id: user_id || 'test-user',
          action_type: action,
          details: {
            ...details,
            test_simulation: true,
            timestamp: new Date().toISOString(),
            ip_address: request.headers.get('x-forwarded-for') || 'test-ip',
            user_agent: request.headers.get('user-agent') || 'test-agent'
          }
        })

      if (error) {
        console.log('Usage_stats table not available:', error)
      } else {
        console.log('✅ 已记录到usage_stats:', { action, user_id })
      }
    } catch (usageError) {
      console.log('Usage_stats insert failed:', usageError)
    }

    // 记录到api_logs表（如果存在）
    try {
      const { data, error } = await supabase
        .from('api_logs')
        .insert({
          user_id: user_id || 'test-user',
          action: action,
          details: {
            ...details,
            test_simulation: true,
            timestamp: new Date().toISOString()
          },
          ip_address: request.headers.get('x-forwarded-for') || 'test-ip',
          user_agent: request.headers.get('user-agent') || 'test-agent'
        })

      if (error) {
        console.log('API_logs table not available:', error)
      } else {
        console.log('✅ 已记录到api_logs:', { action, user_id })
      }
    } catch (apiError) {
      console.log('API_logs insert failed:', apiError)
    }

    // 如果是注册模拟，创建测试用户
    if (action === 'register') {
      try {
        const { data, error } = await supabase
          .from('users')
          .insert({
            email: `test-${Date.now()}@51talk.com`,
            name: details?.name || `测试用户${Date.now()}`,
            title: details?.title || 'شريك النمو الرئيسي',
            created_at: new Date().toISOString()
          })

        if (!error) {
          console.log('✅ 已创建测试用户')
        }
      } catch (userError) {
        console.log('创建测试用户失败:', userError)
      }
    }

    return NextResponse.json({
      success: true,
      message: `${action} action simulated successfully`,
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('Simulate action error:', error)
    return NextResponse.json(
      { error: '模拟操作失败', details: error.message },
      { status: 500 }
    )
  }
}

// 获取当前模拟数据统计
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    
    // 获取模拟数据统计
    const { data: usageStats } = await supabase
      .from('usage_stats')
      .select('action_type, created_at')
      .eq('details->>test_simulation', 'true')

    const { data: apiLogs } = await supabase
      .from('api_logs')
      .select('action, created_at')
      .eq('details->>test_simulation', 'true')

    return NextResponse.json({
      success: true,
      usage_stats: usageStats?.length || 0,
      api_logs: apiLogs?.length || 0,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Get simulation stats error:', error)
    return NextResponse.json(
      { error: '获取模拟统计失败' },
      { status: 500 }
    )
  }
}
