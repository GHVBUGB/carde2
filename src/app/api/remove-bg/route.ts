import { NextRequest, NextResponse } from 'next/server'
import { createRouteClient } from '@/lib/supabase/server'
import { ApiLogger } from '@/lib/api-logger'
import { RemoveApiLogger } from '@/lib/remove-api-logger'

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

    // 获取用户信息
    const { data: userData } = await supabase
      .from('users')
      .select('name, email')
      .eq('id', user.id)
      .single()

    // 检查用户使用限制
    const usageLimit = await RemoveApiLogger.checkUserUsageLimit(user.id, 5)
    if (!usageLimit.canUse) {
      return NextResponse.json(
        { 
          error: `今日抠图次数已达上限（${usageLimit.dailyCount}/5），请明天再试` 
        },
        { status: 429 }
      )
    }

    // 使用提供的API密钥
    const API_KEY = process.env.REMOVE_BG_API_KEY || 'CUkG97quGQMhjG1KM9DcW3c5'

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

    const startTime = Date.now()
    let success = false
    let errorMessage = ''
    let errorCode = ''
    let processedImageBuffer: ArrayBuffer | null = null

    try {
      // 调用Remove.bg API
      const removeBgFormData = new FormData()
      removeBgFormData.append('image_file', imageFile)
      removeBgFormData.append('size', 'auto')

      const response = await fetch('https://api.remove.bg/v1.0/removebg', {
        method: 'POST',
        headers: {
          'X-Api-Key': API_KEY,
        },
        body: removeBgFormData,
      })

      const processingTime = Date.now() - startTime

      if (!response.ok) {
        const error = await response.text()
        console.error('Remove.bg API error:', error)
        
        errorMessage = error
        errorCode = response.status.toString()
        
        // 记录失败的API调用
        await RemoveApiLogger.logRemoveApiCall({
          userId: user.id,
          userEmail: userData?.email || user.email || '',
          userName: userData?.name,
          apiProvider: 'remove_bg',
          originalFileSize: imageFile.size,
          originalFileType: imageFile.type,
          processingTime,
          success: false,
          errorMessage,
          errorCode
        }, request)
        
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

      processedImageBuffer = await response.arrayBuffer()
      success = true

      // 记录成功的API调用
      await Promise.all([
        // 原有的usage_stats记录（保持兼容性）
        supabase
          .from('usage_stats')
          .insert({
            user_id: user.id,
            action_type: 'remove_bg_api',
            details: { 
              service: 'remove_bg',
              file_size: imageFile.size,
              file_type: imageFile.type,
            },
          } as any),
        // 原有的ApiLogger记录（保持兼容性）
        ApiLogger.logRemoveBackground(user.id, {
          imageSize: imageFile.size,
          success: true
        }, request),
        // 新的RemoveApiLogger记录
        RemoveApiLogger.logRemoveApiCall({
          userId: user.id,
          userEmail: userData?.email || user.email || '',
          userName: userData?.name,
          apiProvider: 'remove_bg',
          originalFileSize: imageFile.size,
          originalFileType: imageFile.type,
          processedFileSize: processedImageBuffer.byteLength,
          processingTime,
          success: true
        }, request)
      ])

      // 返回处理后的图片
      return new NextResponse(processedImageBuffer, {
        headers: {
          'Content-Type': 'image/png',
          'Content-Length': processedImageBuffer.byteLength.toString(),
        },
      })

    } catch (apiError) {
      const processingTime = Date.now() - startTime
      console.error('Remove.bg API call failed:', apiError)
      
      errorMessage = apiError instanceof Error ? apiError.message : 'Unknown error'
      errorCode = '500'
      
      // 记录失败的API调用
      await RemoveApiLogger.logRemoveApiCall({
        userId: user.id,
        userEmail: userData?.email || user.email || '',
        userName: userData?.name,
        apiProvider: 'remove_bg',
        originalFileSize: imageFile.size,
        originalFileType: imageFile.type,
        processingTime,
        success: false,
        errorMessage,
        errorCode
      }, request)
      
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
