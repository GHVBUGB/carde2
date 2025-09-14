import { NextRequest, NextResponse } from 'next/server'
import { createRouteClient, createAdminClient } from '@/lib/supabase/server'
import { emailVerificationService } from '@/lib/supabase/server'
import { sendVerificationEmail } from '@/lib/auth/mailer'
import { is51TalkEmail, isValidEmail } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const { email, name, password } = await request.json()

    // 验证输入
    if (!email || !name || !password) {
      return NextResponse.json(
        { error: '邮箱、姓名和密码不能为空' },
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
        { error: '只能使用51Talk邮箱注册' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: '密码至少需要8个字符' },
        { status: 400 }
      )
    }

    const supabase = createRouteClient()

    // 检查邮箱是否已注册
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: '该邮箱已注册，请直接登录' },
        { status: 409 }
      )
    }

    // 生成验证码
    const verificationCode = await emailVerificationService.generateCode(email)

    // 发送邮件验证码
    try {
      const sent = await sendVerificationEmail(email, verificationCode)
      if (sent?.previewUrl) {
        console.log('Preview email at:', sent.previewUrl)
      }
    } catch (mailError) {
      console.error('Failed to send verification email:', mailError)
      return NextResponse.json(
        { error: '邮件发送失败，请稍后重试' },
        { status: 502 }
      )
    }

    // 临时存储用户信息（在验证码验证后再创建用户）
    // 这里可以使用Redis或其他临时存储

    return NextResponse.json({
      message: '验证码已发送到您的邮箱，请查收',
      email,
    })

  } catch (error) {
    const err = error as Error
    console.error('Registration error:', err)
    const message = err.message?.startsWith('FAILED_TO_GENERATE_CODE:')
      ? mapCodeGenerationError(err.message)
      : '注册失败，请稍后重试'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// 验证码验证接口
export async function PUT(request: NextRequest) {
  try {
    const { email, code, name, password } = await request.json()

    if (!email || !code || !name || !password) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      )
    }

    // 验证验证码
    const isValidCode = await emailVerificationService.verifyCode(email, code)
    
    if (!isValidCode) {
      return NextResponse.json(
        { error: '验证码无效或已过期' },
        { status: 400 }
      )
    }

    const supabase = createRouteClient()

    // 创建认证用户，使用用户提供的密码，自动确认邮箱
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password: password,
      options: {
        data: {
          name,
        },
        emailRedirectTo: undefined, // 不发送确认邮件
      },
    })

    // 使用管理员权限强制确认邮箱
    if (authData.user && !authError) {
      const adminSupabase = createAdminClient()
      await adminSupabase.auth.admin.updateUserById(
        authData.user.id,
        { email_confirm: true }
      )
    }

    if (authError) {
      return NextResponse.json(
        { error: '用户创建失败' },
        { status: 500 }
      )
    }

    // 使用 service role 创建用户档案，避免 RLS 策略问题
    if (authData.user) {
      const adminSupabase = createAdminClient()
      const { error: profileError } = await adminSupabase
        .from('users')
        .insert({
          id: authData.user.id,
          email,
          name,
        })

      if (profileError) {
        console.error('Profile creation error:', profileError)
        // 不阻断流程，用户可以后续完善信息
      }

      // 记录注册统计
      await adminSupabase
        .from('usage_stats')
        .insert({
          user_id: authData.user.id,
          action_type: 'register',
          details: { email, name },
        })
    }

    return NextResponse.json({
      message: '注册成功',
      user: {
        id: authData.user?.id,
        email,
        name,
      },
      notice: '注册成功！请使用您设置的邮箱和密码登录'
    })

  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.json(
      { error: '验证失败，请稍后重试' },
      { status: 500 }
    )
  }
}

function mapCodeGenerationError(codeMessage: string) {
  const pgCode = codeMessage.split(':')[1]
  switch (pgCode) {
    case '42P01':
      return '服务端数据表缺失：请在 Supabase 执行 schema.sql 以创建 verification_codes 表'
    case '42501':
      return '服务端权限不足：请检查 Service Role Key 是否配置正确'
    default:
      return '生成验证码失败，请联系管理员查看服务器日志'
  }
}
