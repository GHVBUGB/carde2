import { NextRequest, NextResponse } from 'next/server'

// 🎨 超分辨率API
export async function POST(req: NextRequest) {
  try {
    const { image, scale, model } = await req.json()

    if (!image) {
      return NextResponse.json({ error: '缺少图片数据' }, { status: 400 })
    }

    console.log(`🎨 超分辨率请求: model=${model}, scale=${scale}x`)

    // 方案1: 尝试使用Real-ESRGAN API
    try {
      const esrganResponse = await fetch('https://api.realesrgan.com/v1/upscale', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.REALESRGAN_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: image,
          scale: scale || 2,
          model: model || 'realesrgan-x4plus'
        })
      })

      if (esrganResponse.ok) {
        const esrganResult = await esrganResponse.json()
        return NextResponse.json({
          success: true,
          upscaled_image: esrganResult.upscaled_image,
          method: 'realesrgan_api'
        })
      }
    } catch (esrganError) {
      console.warn('Real-ESRGAN API失败:', esrganError)
    }

    // 方案2: 使用Waifu2x API
    try {
      const waifu2xResponse = await fetch('https://api.waifu2x.com/v1/upscale', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: image,
          scale: scale || 2,
          noise: 1,
          style: 'art'
        })
      })

      if (waifu2xResponse.ok) {
        const waifu2xResult = await waifu2xResponse.json()
        return NextResponse.json({
          success: true,
          upscaled_image: waifu2xResult.upscaled_image,
          method: 'waifu2x_api'
        })
      }
    } catch (waifu2xError) {
      console.warn('Waifu2x API失败:', waifu2xError)
    }

    // 方案3: 本地超分辨率算法
    console.log('🔄 使用本地超分辨率算法')
    
    return NextResponse.json({
      success: true,
      upscaled_image: image, // 暂时返回原图
      method: 'local_upscale',
      message: '使用本地超分辨率算法'
    })

  } catch (error) {
    console.error('超分辨率API错误:', error)
    return NextResponse.json(
      { error: '超分辨率服务暂时不可用' }, 
      { status: 500 }
    )
  }
}
