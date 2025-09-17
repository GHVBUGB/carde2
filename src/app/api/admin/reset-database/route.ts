import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { ApiLogger } from '@/lib/api-logger'

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    const supabase = createAdminClient()
    
    // 执行数据库重置操作
    console.log('开始重置数据库...')
    
    // 清空API日志表
    const { error: clearLogsError } = await supabase
      .from('api_logs')
      .delete()
      .neq('id', 0) // 删除所有记录
    
    if (clearLogsError) {
      console.error('清空api_logs表失败:', clearLogsError)
    } else {
      console.log('api_logs表已清空')
    }
    
    // 清空用户统计表（如果存在）
    const { error: clearStatsError } = await supabase
      .from('usage_stats')
      .delete()
      .neq('id', 0)
    
    if (clearStatsError) {
      console.log('usage_stats表不存在或清空失败:', clearStatsError.message)
    } else {
      console.log('usage_stats表已清空')
    }
    
    // 记录重置操作日志
    await ApiLogger.logApiCall(
      '/api/admin/reset-database',
      'POST',
      200,
      Date.now() - startTime,
      undefined,
      { operation: 'database_reset', tables_cleared: ['api_logs', 'usage_stats'] },
      request
    )
    
    return NextResponse.json({
      success: true,
      message: '数据库重置成功',
      data: {
        cleared_tables: ['api_logs', 'usage_stats'],
        reset_time: new Date().toISOString(),
        processing_time: Date.now() - startTime
      }
    })
    
  } catch (error) {
    console.error('数据库重置失败:', error)
    
    // 记录错误日志
    await ApiLogger.logApiCall(
      '/api/admin/reset-database',
      'POST',
      500,
      Date.now() - startTime,
      undefined,
      { operation: 'database_reset', error: error instanceof Error ? error.message : 'Unknown error' },
      request
    )
    
    return NextResponse.json({
      success: false,
      message: '数据库重置失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    success: false,
    message: '请使用POST方法重置数据库'
  }, { status: 405 })
}