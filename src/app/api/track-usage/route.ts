import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { action_type, details = {} } = await req.json()
    
    if (!action_type) {
      return NextResponse.json({ 
        success: false, 
        error: 'action_type is required' 
      }, { status: 400 })
    }

    const supabase = createClient()
    
    // 获取当前用户
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ 
        success: false, 
        error: 'User not authenticated' 
      }, { status: 401 })
    }

    // 记录使用统计
    const { error: insertError } = await supabase
      .from('usage_stats')
      .insert({
        user_id: user.id,
        action_type,
        details,
        created_at: new Date().toISOString()
      })

    if (insertError) {
      console.error('Error tracking usage:', insertError)
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to track usage' 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Usage tracked successfully' 
    })

  } catch (error: any) {
    console.error('Track usage API error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}
