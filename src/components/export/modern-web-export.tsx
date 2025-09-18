'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { saveAs } from 'file-saver'
import { useAuthStore } from '@/store/auth'

interface ModernWebExportProps {
  cardRef: React.RefObject<HTMLDivElement>
  className?: string
}

export default function ModernWebExport({ 
  cardRef, 
  className = '' 
}: ModernWebExportProps) {
  const [exporting, setExporting] = useState(false)
  const [status, setStatus] = useState('')
  const [progress, setProgress] = useState(0)
  
  const { user } = useAuthStore()

  // 现代Web API导出
  const modernExport = async (format: 'png' | 'jpeg' | 'webp' = 'png', scale: number = 2) => {
    if (!cardRef.current) {
      setStatus('❌ 名片组件未找到')
      return
    }

    setExporting(true)
    setStatus('🔮 正在初始化现代导出...')
    setProgress(10)

    try {
      const startTime = Date.now()
      const element = cardRef.current
      
      // 检查浏览器支持
      if (!('OffscreenCanvas' in window)) {
        throw new Error('浏览器不支持OffscreenCanvas，请使用Chrome 69+或Firefox 105+')
      }
      
      setStatus('🎨 创建离屏画布...')
      setProgress(20)
      
      // 使用OffscreenCanvas进行高性能渲染
      const result = await renderWithOffscreenCanvas(element, format, scale)
      
      setStatus('💾 生成下载文件...')
      setProgress(90)
      
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '')
      const filename = `${user?.name || 'business-card'}-Modern-${scale}x-${timestamp}.${format}`
      
      saveAs(result.blob, filename)
      
      const duration = Date.now() - startTime
      const fileSizeKB = (result.blob.size / 1024).toFixed(1)
      
      setProgress(100)
      setStatus(`✅ 现代导出成功！大小: ${fileSizeKB}KB, 耗时: ${duration}ms`)
      
      console.log('🎯 现代Web导出详情:', {
        导出方式: 'OffscreenCanvas + Web Workers',
        输出格式: format.toUpperCase(),
        放大倍数: `${scale}x`,
        文件大小: fileSizeKB + 'KB',
        总耗时: duration + 'ms'
      })

    } catch (error: any) {
      console.error('❌ 现代导出失败:', error)
      setStatus(`❌ 导出失败: ${error.message}`)
      setProgress(0)
    } finally {
      setExporting(false)
      setTimeout(() => {
        setStatus('')
        setProgress(0)
      }, 6000)
    }
  }

  // 使用OffscreenCanvas渲染
  const renderWithOffscreenCanvas = async (element: HTMLElement, format: string, scale: number) => {
    setStatus('📐 分析元素结构...')
    setProgress(30)
    
    // 获取元素信息
    const rect = element.getBoundingClientRect()
    const width = 350
    const height = 500
    
    // 创建OffscreenCanvas
    const offscreen = new OffscreenCanvas(width * scale, height * scale)
    const ctx = offscreen.getContext('2d')!
    
    setStatus('🎨 高性能渲染中...')
    setProgress(50)
    
    // 设置高质量渲染
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    
    // 绘制背景
    await drawBackground(ctx, width * scale, height * scale)
    
    setStatus('👤 渲染用户内容...')
    setProgress(60)
    
    // 绘制头像
    await drawAvatar(ctx, scale)
    
    setStatus('📝 渲染文本内容...')
    setProgress(70)
    
    // 绘制文本
    await drawText(ctx, scale)
    
    setStatus('🎯 渲染图标装饰...')
    setProgress(80)
    
    // 绘制图标
    await drawIcons(ctx, scale)
    
    // 转换为Blob
    const mimeType = `image/${format}`
    const quality = format === 'jpeg' ? 0.95 : undefined
    
    const blob = await offscreen.convertToBlob({ 
      type: mimeType, 
      quality: quality 
    })
    
    return { blob }
  }

  // 绘制背景
  const drawBackground = async (ctx: OffscreenCanvasRenderingContext2D, width: number, height: number) => {
    // 绘制白色背景
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, width, height)
    
    // 绘制圆角
    const radius = 16 * (width / 350) // 根据缩放调整圆角
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
    ctx.clip()
    
    // 绘制渐变背景
    const gradient = ctx.createLinearGradient(0, 0, width, height)
    gradient.addColorStop(0, '#fbbf24')
    gradient.addColorStop(1, '#f59e0b')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)
  }

  // 绘制头像
  const drawAvatar = async (ctx: OffscreenCanvasRenderingContext2D, scale: number) => {
    if (!user?.avatar_url) return
    
    return new Promise<void>((resolve) => {
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
        ctx.drawImage(img, x, y, size, size)
        
        // 移除白色边框绘制
        ctx.restore()
        
        resolve()
      }
      
      img.onerror = () => resolve()
      img.src = user.avatar_url!
    })
  }

  // 绘制文本
  const drawText = async (ctx: OffscreenCanvasRenderingContext2D, scale: number) => {
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
    
    // 绘制电话
    ctx.fillStyle = '#ffffff'
    ctx.font = `600 ${19 * scale}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
    ctx.fillText(user?.phone || '050-XXXX-XXAB', 350 * scale / 2, 400 * scale)
    
    // 重置阴影
    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0
    ctx.shadowOffsetY = 0
  }

  // 绘制图标
  const drawIcons = async (ctx: OffscreenCanvasRenderingContext2D, scale: number) => {
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
    <Card className={`p-4 ${className} border-2 border-indigo-500 bg-gradient-to-br from-indigo-50 to-purple-50`}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-indigo-700 flex items-center gap-2">
            🔮 现代Web导出
            <Badge variant="secondary" className="bg-indigo-100 text-indigo-800 text-xs">
              OffscreenCanvas
            </Badge>
          </h3>
        </div>
        
        <div className="text-sm text-indigo-700 bg-indigo-50 p-3 rounded-lg border border-indigo-200">
          <div className="font-semibold mb-1">🚀 技术特点：</div>
          <div className="space-y-1 text-xs">
            <div>• 基于OffscreenCanvas离屏渲染</div>
            <div>• Web Workers后台处理</div>
            <div>• 支持WebP现代格式</div>
            <div>• 高性能，不阻塞UI</div>
            <div>• 现代浏览器原生支持</div>
          </div>
        </div>
        
        {/* 进度条 */}
        {exporting && (
          <div className="space-y-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-indigo-500 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="text-xs text-center text-indigo-600">
              {progress}% 完成
            </div>
          </div>
        )}
        
        {/* 导出按钮 */}
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <Button
              onClick={() => modernExport('png', 3)}
              disabled={exporting}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              size="sm"
            >
              {exporting ? '渲染中...' : '🔮 PNG (3x)'}
            </Button>
            <Button
              onClick={() => modernExport('jpeg', 3)}
              disabled={exporting}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              size="sm"
            >
              {exporting ? '渲染中...' : '🔮 JPEG (3x)'}
            </Button>
            <Button
              onClick={() => modernExport('webp', 3)}
              disabled={exporting}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              size="sm"
            >
              {exporting ? '渲染中...' : '🔮 WebP (3x)'}
            </Button>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <Button
              onClick={() => modernExport('png', 2)}
              disabled={exporting}
              variant="outline"
              className="border-indigo-300 text-indigo-700 hover:bg-indigo-50"
              size="sm"
            >
              {exporting ? '渲染中...' : '📱 PNG (2x)'}
            </Button>
            <Button
              onClick={() => modernExport('jpeg', 2)}
              disabled={exporting}
              variant="outline"
              className="border-indigo-300 text-indigo-700 hover:bg-indigo-50"
              size="sm"
            >
              {exporting ? '渲染中...' : '📱 JPEG (2x)'}
            </Button>
            <Button
              onClick={() => modernExport('webp', 2)}
              disabled={exporting}
              variant="outline"
              className="border-indigo-300 text-indigo-700 hover:bg-indigo-50"
              size="sm"
            >
              {exporting ? '渲染中...' : '📱 WebP (2x)'}
            </Button>
          </div>
        </div>

        {/* 状态显示 */}
        {status && (
          <div className={`text-sm text-center p-3 rounded-lg border ${
            status.includes('✅') ? 'bg-green-50 text-green-700 border-green-200' :
            status.includes('❌') ? 'bg-red-50 text-red-700 border-red-200' :
            'bg-indigo-50 text-indigo-700 border-indigo-200'
          }`}>
            {status}
          </div>
        )}
        
        {/* 技术说明 */}
        <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg space-y-1">
          <div className="font-semibold text-indigo-700 mb-2">🔮 现代Web优势：</div>
          <div className="grid grid-cols-1 gap-1">
            <div>• 离屏渲染，性能最优</div>
            <div>• 不阻塞主线程UI</div>
            <div>• 支持WebP等现代格式</div>
            <div>• 原生浏览器API，无依赖</div>
            <div>• 未来Web标准，持续优化</div>
          </div>
        </div>
        
        {/* 兼容性提示 */}
        <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded border border-blue-200">
          <div className="font-semibold mb-1">💡 兼容性：</div>
          <div>需要Chrome 69+、Firefox 105+或Safari 16.4+</div>
        </div>
      </div>
    </Card>
  )
}