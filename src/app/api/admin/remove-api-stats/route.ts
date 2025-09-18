import { NextRequest, NextResponse } from 'next/server'
import { RemoveApiLogger } from '@/lib/remove-api-logger'

export async function GET(req: NextRequest) {
  try {
    // 获取查询参数
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    const type = searchParams.get('type') || 'overall' // overall, today, user

    let stats

    switch (type) {
      case 'today':
        stats = await RemoveApiLogger.getTodayUsageStats()
        break
      case 'user':
        if (!userId) {
          return NextResponse.json(
            { error: '缺少用户ID参数' },
            { status: 400 }
          )
        }
        stats = await RemoveApiLogger.getUserUsageStats(userId)
        break
      case 'overall':
      default:
        stats = await RemoveApiLogger.getOverallUsageStats()
        break
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      type,
      data: stats
    })

  } catch (error) {
    console.error('获取Remove API统计失败:', error)
    return NextResponse.json(
      { 
        success: false,
        error: '获取统计数据失败',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, dailyLimit = 5 } = body

    if (!userId) {
      return NextResponse.json(
        { error: '缺少用户ID参数' },
        { status: 400 }
      )
    }

    // 检查用户使用限制
    const usageLimit = await RemoveApiLogger.checkUserUsageLimit(userId, dailyLimit)
    
    // 获取用户使用统计
    const userStats = await RemoveApiLogger.getUserUsageStats(userId)

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      data: {
        usageLimit,
        userStats
      }
    })

  } catch (error) {
    console.error('检查用户使用限制失败:', error)
    return NextResponse.json(
      { 
        success: false,
        error: '检查使用限制失败',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
