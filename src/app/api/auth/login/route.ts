import { NextRequest, NextResponse } from 'next/server'
import { createRouteClient, createAdminClient } from '@/lib/supabase/server'
import { ApiLogger } from '@/lib/api-logger'
import { is51TalkEmail, isValidEmail } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // 验证输入
    if (!email) {
      return NextResponse.json(
        { error: '邮箱不能为空' },
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
        { error: '只能使用51Talk邮箱登录' },
        { status: 400 }
      )
    }

    const supabase = createRouteClient()

    // 检查用户是否存在
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (!user) {
      return NextResponse.json(
        { error: '用户不存在，请先注册' },
        { status: 404 }
      )
    }

    // 如果提供了密码，使用密码登录
    if (password) {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        return NextResponse.json(
          { error: '邮箱或密码错误' },
          { status: 401 }
        )
      }

      // 记录登录统计 + 更新最后登录时间 + 写入api_logs
      if (authData.user) {
        const adminSupabase = createAdminClient()
        await Promise.all([
          supabase
            .from('usage_stats')
            .insert({
              user_id: authData.user.id,
              action_type: 'login',
              details: { method: 'password', email },
            } as any),
          adminSupabase
            .from('users')
            .update({ last_login: new Date().toISOString() } as any)
            .eq('id', authData.user.id),
          ApiLogger.logLogin(authData.user.id, { method: 'password', email }, request)
        ])
      }

      return NextResponse.json({
        message: '登录成功',
        user: {
          id: authData.user?.id,
          email: authData.user?.email,
          name: user.name,
        },
      })
    }

    // 如果没有密码，发送魔法链接或验证码
    const { error: magicLinkError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
      },
    })

    if (magicLinkError) {
      return NextResponse.json(
        { error: '发送登录链接失败' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: '登录链接已发送到您的邮箱，请查收',
      email,
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: '登录失败，请稍后重试' },
      { status: 500 }
    )
  }
}

// 验证魔法链接或验证码
export async function PUT(request: NextRequest) {
  try {
    const { email, token, type } = await request.json()

    if (!email || !token || !type) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      )
    }

    const supabase = createRouteClient()

    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: type as any, // 'email' | 'sms' | 'phone_change' | 'email_change'
    })

    if (error) {
      return NextResponse.json(
        { error: '验证失败，请检查验证码是否正确' },
        { status: 400 }
      )
    }

    // 获取用户信息
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    // 记录登录统计 + 更新最后登录时间 + 写入api_logs
    if (data.user) {
      const adminSupabase = createAdminClient()
      await Promise.all([
        supabase
          .from('usage_stats')
          .insert({
            user_id: data.user.id,
            action_type: 'login',
            details: { method: 'otp', email },
          } as any),
        adminSupabase
          .from('users')
          .update({ last_login: new Date().toISOString() } as any)
          .eq('id', data.user.id),
        ApiLogger.logLogin(data.user.id, { method: 'otp', email }, request)
      ])
    }

    return NextResponse.json({
      message: '登录成功',
      user: {
        id: data.user?.id,
        email: data.user?.email,
        name: user?.name,
      },
    })

  } catch (error) {
    console.error('OTP verification error:', error)
    return NextResponse.json(
      { error: '验证失败，请稍后重试' },
      { status: 500 }
    )
  }
}
