'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { saveAs } from 'file-saver'
import { useAuthStore } from '@/store/auth'

interface CanvasPerfectExportProps {
  cardRef: React.RefObject<HTMLDivElement>
  className?: string
}

export default function CanvasPerfectExport({ 
  cardRef, 
  className = '' 
}: CanvasPerfectExportProps) {
  const [exporting, setExporting] = useState(false)
  const [status, setStatus] = useState('')
  const [progress, setProgress] = useState(0)
  
  const { user } = useAuthStore()

  // Canvas原生绘制导出 - 最佳版型控制
  const canvasExport = async (format: 'png' | 'jpeg' = 'png', scale: number = 3) => {
    if (!cardRef.current) {
      setStatus('❌ 名片组件未找到')
      return
    }

    setExporting(true)
    setStatus('🎨 正在准备Canvas绘制...')
    setProgress(10)

    try {
      const startTime = Date.now()
      const element = cardRef.current
      
      // 创建高分辨率Canvas
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      
      // 设置Canvas尺寸 - 固定350x500的完美比例
      const baseWidth = 350
      const baseHeight = 500
      canvas.width = baseWidth * scale
      canvas.height = baseHeight * scale
      
      setStatus('🖼️ 绘制背景和基础结构...')
      setProgress(20)
      
      // 设置高质量渲染
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      // 移除不存在的 textRenderingOptimization 属性
      
      // 绘制白色背景
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // 绘制背景图片
      setStatus('🌅 绘制背景图片...')
      setProgress(30)
      await drawBackgroundImage(ctx, canvas.width, canvas.height, scale)
      
      // 绘制圆角容器效果
      setStatus('🔲 绘制容器边框...')
      setProgress(40)
      drawRoundedContainer(ctx, canvas.width, canvas.height, scale)
      
      // 绘制头像
      setStatus('👤 绘制用户头像...')
      setProgress(50)
      await drawAvatar(ctx, scale)
      
      // 绘制文本内容
      setStatus('📝 绘制文本内容...')
      setProgress(70)
      await drawTextContent(ctx, scale)
      
      // 绘制图标和装饰
      setStatus('🎯 绘制图标装饰...')
      setProgress(85)
      await drawIcons(ctx, scale)
      
      setStatus('💾 生成最终图片...')
      setProgress(95)
      
      // 转换为高质量图片
      const mimeType = format === 'png' ? 'image/png' : 'image/jpeg'
      const quality = format === 'png' ? 1.0 : 0.98
      
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Canvas转换失败'))
          }
        }, mimeType, quality)
      })
      
      // 生成文件名并下载
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '')
      const filename = `${user?.name || 'business-card'}-Canvas-${scale}x-${timestamp}.${format}`
      
      saveAs(blob, filename)
      
      const duration = Date.now() - startTime
      const fileSizeKB = (blob.size / 1024).toFixed(1)
      
      setProgress(100)
      setStatus(`✅ Canvas导出成功！尺寸: ${canvas.width}×${canvas.height}px, 大小: ${fileSizeKB}KB, 耗时: ${duration}ms`)
      
      console.log('🎨 Canvas导出详情:', {
        导出方式: 'Canvas原生绘制',
        导出尺寸: `${canvas.width}×${canvas.height}px`,
        放大倍数: `${scale}x`,
        文件大小: fileSizeKB + 'KB',
        总耗时: duration + 'ms',
        格式: format.toUpperCase()
      })

    } catch (error: any) {
      console.error('❌ Canvas导出失败:', error)
      setStatus(`❌ 导出失败: ${error.message}`)
      setProgress(0)
    } finally {
      setExporting(false)
      setTimeout(() => {
        setStatus('')
        setProgress(0)
      }, 8000)
    }
  }

  // 绘制背景图片
  const drawBackgroundImage = async (ctx: CanvasRenderingContext2D, width: number, height: number, scale: number): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      
      img.onload = () => {
        // 计算背景图片的cover效果
        const imgRatio = img.naturalWidth / img.naturalHeight
        const canvasRatio = width / height
        
        let drawWidth, drawHeight, offsetX, offsetY
        
        if (imgRatio > canvasRatio) {
          // 图片更宽，以高度为准
          drawHeight = height
          drawWidth = drawHeight * imgRatio
          offsetX = (width - drawWidth) / 2
          offsetY = 0
        } else {
          // 图片更高，以宽度为准
          drawWidth = width
          drawHeight = drawWidth / imgRatio
          offsetX = 0
          offsetY = (height - drawHeight) / 2
        }
        
        // 绘制背景图片
        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight)
        resolve()
      }
      
      img.onerror = () => {
        console.warn('背景图片加载失败，使用渐变背景')
        // 绘制渐变背景作为备用
        const gradient = ctx.createLinearGradient(0, 0, width, height)
        gradient.addColorStop(0, '#fbbf24')
        gradient.addColorStop(1, '#f59e0b')
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, width, height)
        resolve()
      }
      
      // 尝试从DOM获取背景图片URL
      const bgElement = cardRef.current?.querySelector('[style*="background-image"]') as HTMLElement
      if (bgElement) {
        const bgImage = bgElement.style.backgroundImage
        const urlMatch = bgImage.match(/url\(["']?([^"'\)]+)["']?\)/)
        if (urlMatch) {
          img.src = urlMatch[1]
        } else {
          img.src = '/ditu.png' // 默认背景
        }
      } else {
        img.src = '/ditu.png' // 默认背景
      }
    })
  }

  // 绘制圆角容器
  const drawRoundedContainer = (ctx: CanvasRenderingContext2D, width: number, height: number, scale: number) => {
    const radius = 16 * scale // rounded-2xl 对应 16px
    
    // 创建圆角路径
    ctx.beginPath()
    ctx.moveTo(radius, 0)
    ctx.lineTo(width - radius, 0)
    ctx.quadraticCurveTo(width, 0, width, radius)
    ctx.lineTo(width, height - radius)
    ctx.quadraticCurveTo(width, height, width - radius, height)
    ctx.lineTo(radius, height)
    ctx.quadraticCurveTo(0, height, 0, height - radius)
    ctx.lineTo(0, radius)
    ctx.quadraticCurveTo(0, 0, radius, 0)
    ctx.closePath()
    
    // 裁剪到圆角区域
    ctx.clip()
    
    // 绘制阴影效果
    ctx.shadowColor = 'rgba(0, 0, 0, 0.25)'
    ctx.shadowBlur = 25 * scale
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 8 * scale
  }

  // 绘制头像
  const drawAvatar = async (ctx: CanvasRenderingContext2D, scale: number): Promise<void> => {
    return new Promise((resolve) => {
      if (!user?.avatar_url) {
        resolve()
        return
      }
      
      const img = new Image()
      img.crossOrigin = 'anonymous'
      
      img.onload = () => {
        const size = 120 * scale
        const x = (350 * scale - size) / 2
        const y = 80 * scale
        
        // 绘制圆形头像
        ctx.save()
        ctx.beginPath()
        ctx.arc(x + size/2, y + size/2, size/2, 0, Math.PI * 2)
        ctx.clip()
        
        // 绘制头像图片
        ctx.drawImage(img, x, y, size, size)
        
        // 移除白色边框绘制
        ctx.restore()
        
        resolve()
      }
      
      img.onerror = () => {
        console.warn('头像加载失败')
        resolve()
      }
      
      img.src = user.avatar_url
    })
  }

  // 绘制文本内容
  const drawTextContent = async (ctx: CanvasRenderingContext2D, scale: number): Promise<void> => {
    // 设置字体渲染质量
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    
    // 绘制姓名
    ctx.fillStyle = '#ffffff'
    ctx.font = `bold ${32 * scale}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)'
    ctx.shadowBlur = 4 * scale
    ctx.shadowOffsetY = 2 * scale
    ctx.fillText(user?.name || 'أحمد', 350 * scale / 2, 220 * scale)
    
    // 绘制职位
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
    ctx.font = `${16 * scale}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
    ctx.shadowBlur = 2 * scale
    ctx.fillText(user?.title || 'SENIOR LANGUAGE COACH', 350 * scale / 2, 260 * scale)
    
    // 绘制电话号码
    ctx.fillStyle = '#ffffff'
    ctx.font = `600 ${19 * scale}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
    ctx.fillText(user?.phone || '050-XXXX-XXAB', 350 * scale / 2, 400 * scale)
    
    // 重置阴影
    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0
    ctx.shadowOffsetY = 0
  }

  // 绘制图标
  const drawIcons = async (ctx: CanvasRenderingContext2D, scale: number): Promise<void> => {
    const icons = ['📚', '💬', '📊', '🔗']
    const iconSize = 50 * scale
    const startX = (350 * scale - (icons.length * iconSize + (icons.length - 1) * 20 * scale)) / 2
    const y = 320 * scale
    
    icons.forEach((icon, index) => {
      const x = startX + index * (iconSize + 20 * scale)
      
      // 绘制图标背景
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)'
      ctx.beginPath()
      ctx.arc(x + iconSize/2, y + iconSize/2, iconSize/2, 0, Math.PI * 2)
      ctx.fill()
      
      // 绘制图标文字
      ctx.fillStyle = '#ffffff'
      ctx.font = `${24 * scale}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(icon, x + iconSize/2, y + iconSize/2)
    })
  }

  return (
    <Card className={`p-4 ${className} border-2 border-purple-500 bg-gradient-to-br from-purple-50 to-indigo-50`}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-purple-700 flex items-center gap-2">
            🎨 Canvas完美导出
            <Badge variant="secondary" className="bg-purple-100 text-purple-800 text-xs">
              原生绘制
            </Badge>
          </h3>
        </div>
        
        <div className="text-sm text-purple-700 bg-purple-50 p-3 rounded-lg border border-purple-200">
          <div className="font-semibold mb-1">🚀 技术优势：</div>
          <div className="space-y-1 text-xs">
            <div>• Canvas原生绘制，完美版型控制</div>
            <div>• 无html2canvas限制，渲染质量最佳</div>
            <div>• 精确像素控制，字体渲染优化</div>
            <div>• 固定350×500完美比例</div>
            <div>• 支持高分辨率导出</div>
          </div>
        </div>
        
        {/* 进度条 */}
        {exporting && (
          <div className="space-y-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-purple-500 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="text-xs text-center text-purple-600">
              {progress}% 完成
            </div>
          </div>
        )}
        
        {/* 导出按钮 */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => canvasExport('png', 3)}
              disabled={exporting}
              className="bg-purple-600 hover:bg-purple-700 text-white"
              size="sm"
            >
              {exporting ? '绘制中...' : '🎨 超清PNG (3x)'}
            </Button>
            <Button
              onClick={() => canvasExport('jpeg', 3)}
              disabled={exporting}
              className="bg-purple-600 hover:bg-purple-700 text-white"
              size="sm"
            >
              {exporting ? '绘制中...' : '🎨 超清JPEG (3x)'}
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => canvasExport('png', 2)}
              disabled={exporting}
              variant="outline"
              className="border-purple-300 text-purple-700 hover:bg-purple-50"
              size="sm"
            >
              {exporting ? '绘制中...' : '📱 高清PNG (2x)'}
            </Button>
            <Button
              onClick={() => canvasExport('jpeg', 2)}
              disabled={exporting}
              variant="outline"
              className="border-purple-300 text-purple-700 hover:bg-purple-50"
              size="sm"
            >
              {exporting ? '绘制中...' : '📱 高清JPEG (2x)'}
            </Button>
          </div>
        </div>

        {/* 状态显示 */}
        {status && (
          <div className={`text-sm text-center p-3 rounded-lg border ${
            status.includes('✅') ? 'bg-green-50 text-green-700 border-green-200' :
            status.includes('❌') ? 'bg-red-50 text-red-700 border-red-200' :
            'bg-purple-50 text-purple-700 border-purple-200'
          }`}>
            {status}
          </div>
        )}
        
        {/* 技术说明 */}
        <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg space-y-1">
          <div className="font-semibold text-purple-700 mb-2">🎯 Canvas导出优势：</div>
          <div className="grid grid-cols-1 gap-1">
            <div>• 完美版型控制，无DOM限制</div>
            <div>• 高质量字体渲染和图像处理</div>
            <div>• 精确的圆角和阴影效果</div>
            <div>• 固定比例，避免变形问题</div>
            <div>• 更小的文件体积，更快的处理速度</div>
          </div>
        </div>
      </div>
    </Card>
  )
}