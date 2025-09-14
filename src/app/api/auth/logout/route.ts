import { NextRequest, NextResponse } from 'next/server'
import { createRouteClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteClient()

    // 获取当前用户
    const { data: { user } } = await supabase.auth.getUser()

    // 执行登出
    const { error } = await supabase.auth.signOut()

    if (error) {
      return NextResponse.json(
        { error: '登出失败' },
        { status: 500 }
      )
    }

    // 记录登出统计
    if (user) {
      await supabase
        .from('usage_stats')
        .insert({
          user_id: user.id,
          action_type: 'logout',
          details: { email: user.email },
        })
    }

    return NextResponse.json({
      message: '登出成功',
    })

  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: '登出失败，请稍后重试' },
      { status: 500 }
    )
  }
}
