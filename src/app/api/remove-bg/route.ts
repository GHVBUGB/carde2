import { NextRequest, NextResponse } from 'next/server'
import { createRouteClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    // 验证用户身份
    const supabase = createRouteClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      )
    }

    // 检查API密钥
    if (!process.env.REMOVE_BG_API_KEY) {
      console.error('Remove.bg API key not configured')
      return NextResponse.json(
        { error: 'AI抠图服务暂时不可用' },
        { status: 503 }
      )
    }

    // 获取上传的图片
    const formData = await request.formData()
    const imageFile = formData.get('image_file') as File

    if (!imageFile) {
      return NextResponse.json(
        { error: '未找到图片文件' },
        { status: 400 }
      )
    }

    // 验证文件类型
    if (!imageFile.type.startsWith('image/')) {
      return NextResponse.json(
        { error: '文件类型不支持' },
        { status: 400 }
      )
    }

    // 验证文件大小 (5MB)
    if (imageFile.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: '图片大小不能超过5MB' },
        { status: 400 }
      )
    }

    try {
      // 调用Remove.bg API
      const removeBgFormData = new FormData()
      removeBgFormData.append('image_file', imageFile)
      removeBgFormData.append('size', 'auto')

      const response = await fetch('https://api.remove.bg/v1.0/removebg', {
        method: 'POST',
        headers: {
          'X-Api-Key': process.env.REMOVE_BG_API_KEY,
        },
        body: removeBgFormData,
      })

      if (!response.ok) {
        const error = await response.text()
        console.error('Remove.bg API error:', error)
        
        // 根据不同错误返回友好提示
        if (response.status === 402) {
          return NextResponse.json(
            { error: 'AI抠图服务配额已用完，请稍后重试' },
            { status: 503 }
          )
        } else if (response.status === 400) {
          return NextResponse.json(
            { error: '图片格式不支持或图片质量过低' },
            { status: 400 }
          )
        } else {
          return NextResponse.json(
            { error: 'AI抠图服务暂时不可用' },
            { status: 503 }
          )
        }
      }

      const processedImageBuffer = await response.arrayBuffer()

      // 记录API调用统计
      await supabase
        .from('usage_stats')
        .insert({
          user_id: user.id,
          action_type: 'api_call',
          details: { 
            service: 'remove_bg',
            file_size: imageFile.size,
            file_type: imageFile.type,
          },
        })

      // 返回处理后的图片
      return new NextResponse(processedImageBuffer, {
        headers: {
          'Content-Type': 'image/png',
          'Content-Length': processedImageBuffer.byteLength.toString(),
        },
      })

    } catch (apiError) {
      console.error('Remove.bg API call failed:', apiError)
      return NextResponse.json(
        { error: 'AI抠图处理失败，请稍后重试' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Remove.bg route error:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

// 健康检查接口
export async function GET() {
  const hasApiKey = !!process.env.REMOVE_BG_API_KEY
  
  return NextResponse.json({
    service: 'Remove.bg API',
    status: hasApiKey ? 'available' : 'unavailable',
    message: hasApiKey 
      ? 'AI抠图服务可用' 
      : 'AI抠图服务未配置',
  })
}
