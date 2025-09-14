import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { is51TalkEmail, isValidEmail } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const { email, newPassword } = await request.json()

    // 验证输入
    if (!email || !newPassword) {
      return NextResponse.json(
        { error: '邮箱和新密码不能为空' },
        { status: 400 }
      )
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: '请输入有效的邮箱地址' },
        { status: 400 }
      )
    }

    if (!is51TalkEmail(email)) {
      return NextResponse.json(
        { error: '只能重置51Talk邮箱密码' },
        { status: 400 }
      )
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: '密码至少需要8个字符' },
        { status: 400 }
      )
    }

    // 使用管理员权限重置密码
    const adminSupabase = createAdminClient()

    // 查找用户
    const { data: users, error: findError } = await adminSupabase.auth.admin.listUsers()
    
    if (findError) {
      console.error('Find user error:', findError)
      return NextResponse.json(
        { error: '查找用户失败' },
        { status: 500 }
      )
    }

    const user = users.users.find(u => u.email === email)
    
    if (!user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      )
    }

    // 重置密码
    const { error: updateError } = await adminSupabase.auth.admin.updateUserById(
      user.id,
      { password: newPassword }
    )

    if (updateError) {
      console.error('Password update error:', updateError)
      return NextResponse.json(
        { error: '密码重置失败' },
        { status: 500 }
      )
    }

    // 记录操作
    await adminSupabase
      .from('usage_stats')
      .insert({
        user_id: user.id,
        action_type: 'password_reset',
        details: { email, timestamp: new Date().toISOString() },
      })

    return NextResponse.json({
      message: '密码重置成功',
      email,
      notice: '您现在可以使用新密码登录'
    })

  } catch (error) {
    console.error('Password reset error:', error)
    return NextResponse.json(
      { error: '密码重置失败，请稍后重试' },
      { status: 500 }
    )
  }
}

