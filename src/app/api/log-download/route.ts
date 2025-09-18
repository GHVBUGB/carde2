import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { ApiLogger } from '@/lib/api-logger'

// 创建管理员客户端
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, format, fileSize, filename } = body

    // 验证必需参数
    if (!userId) {
      return NextResponse.json(
        { error: '缺少用户ID' },
        { status: 400 }
      )
    }

    // 记录下载日志
    await ApiLogger.logDownload(userId, {
      format: format || 'png',
      fileSize: fileSize || 0,
      filename: filename || 'business-card'
    })

    return NextResponse.json({ 
      success: true,
      message: '下载日志记录成功'
    })

  } catch (error) {
    console.error('记录下载日志失败:', error)
    return NextResponse.json(
      { error: '记录下载日志失败' },
      { status: 500 }
    )
  }
}