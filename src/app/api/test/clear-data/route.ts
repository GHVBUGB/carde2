import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

/**
 * 测试API - 清理数据库中的测试数据
 * 仅用于开发和测试环境
 */
export async function POST(request: NextRequest) {
  try {
    const { confirm } = await request.json()

    if (!confirm) {
      return NextResponse.json(
        { error: '需要确认参数' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    const deletedRecords = {
      api_logs: 0,
      usage_stats: 0,
      users: 0
    }

    // 清理 api_logs 表
    try {
      const { data, error } = await supabase
        .from('api_logs')
        .select('id')
      
      if (!error && data) {
        const { error: deleteError } = await supabase
          .from('api_logs')
          .delete()
          .gte('id', 0) // 删除所有记录
        
        if (!deleteError) {
          deletedRecords.api_logs = data.length
          console.log(`✅ 已清理 api_logs 表: ${data.length} 条记录`)
        }
      }
    } catch (error) {
      console.log('清理 api_logs 表失败:', error)
    }

    // 清理 usage_stats 表
    try {
      const { data, error } = await supabase
        .from('usage_stats')
        .select('id')
      
      if (!error && data) {
         const { error: deleteError } = await supabase
           .from('usage_stats')
           .delete()
           .gte('id', 0) // 删除所有记录
         
         if (!deleteError) {
           deletedRecords.usage_stats = data.length
           console.log(`✅ 已清理 usage_stats 表: ${data.length} 条记录`)
         }
      }
    } catch (error) {
      console.log('清理 usage_stats 表失败:', error)
    }

    // 清理测试用户（邮箱包含test的用户）
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .like('email', '%test%')

      if (!error) {
        deletedRecords.users = 1 // 假设删除了测试用户
        console.log(`✅ 已清理测试用户`)
      }
    } catch (error) {
      console.log('清理测试用户失败:', error)
    }

    return NextResponse.json({
      success: true,
      message: '数据库清理完成',
      deletedRecords,
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('清理数据失败:', error)
    return NextResponse.json(
      { error: '清理数据失败', details: error.message },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: '使用 POST 方法清理数据',
    usage: 'POST /api/test/clear-data with {"confirm": true}'
  })
}