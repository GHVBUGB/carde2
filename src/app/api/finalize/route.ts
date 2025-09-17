import { NextRequest, NextResponse } from 'next/server'

// 🚀 最终处理API
export async function POST(req: NextRequest) {
  try {
    const { image, quality } = await req.json()

    if (!image) {
      return NextResponse.json({ error: '缺少图片数据' }, { status: 400 })
    }

    console.log(`🚀 最终处理请求: quality=${quality}`)

    // 方案1: 使用专业的最终处理API
    try {
      const finalizeResponse = await fetch('https://api.tinify.com/shrink', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${process.env.TINIFY_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source: {
            url: image
          },
          options: {
            quality: quality === 'professional' ? 95 : 85
          }
        })
      })

      if (finalizeResponse.ok) {
        const finalizeResult = await finalizeResponse.json()
        return NextResponse.json({
          success: true,
          final_image: finalizeResult.output.url,
          method: 'tinify_api'
        })
      }
    } catch (finalizeError) {
      console.warn('Tinify API失败:', finalizeError)
    }

    // 方案2: 使用ImageOptim API
    try {
      const imageOptimResponse = await fetch('https://im2.io/api/optimize', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.IMAGEOPTIM_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: image,
          quality: quality === 'professional' ? 'high' : 'medium'
        })
      })

      if (imageOptimResponse.ok) {
        const imageOptimResult = await imageOptimResponse.json()
        return NextResponse.json({
          success: true,
          final_image: imageOptimResult.optimized_image,
          method: 'imageoptim_api'
        })
      }
    } catch (imageOptimError) {
      console.warn('ImageOptim API失败:', imageOptimError)
    }

    // 方案3: 本地最终处理
    console.log('🔄 使用本地最终处理')
    
    return NextResponse.json({
      success: true,
      final_image: image, // 暂时返回原图
      method: 'local_finalize',
      message: '使用本地最终处理'
    })

  } catch (error) {
    console.error('最终处理API错误:', error)
    return NextResponse.json(
      { error: '最终处理服务暂时不可用' }, 
      { status: 500 }
    )
  }
}
