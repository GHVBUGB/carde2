'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { saveAs } from 'file-saver'
import { useAuthStore } from '@/store/auth'

interface SVGExportProps {
  cardRef: React.RefObject<HTMLDivElement>
  className?: string
}

export default function SVGExport({ 
  cardRef, 
  className = '' 
}: SVGExportProps) {
  const [exporting, setExporting] = useState(false)
  const [status, setStatus] = useState('')
  const [progress, setProgress] = useState(0)
  
  const { user } = useAuthStore()

  // SVG导出
  const svgExport = async (format: 'svg' | 'png' = 'svg', scale: number = 2) => {
    if (!cardRef.current) {
      setStatus('❌ 名片组件未找到')
      return
    }

    setExporting(true)
    setStatus('📐 正在构建SVG结构...')
    setProgress(10)

    try {
      const startTime = Date.now()
      const element = cardRef.current
      
      setStatus('🎨 分析元素样式...')
      setProgress(20)
      
      // 获取元素信息
      const rect = element.getBoundingClientRect()
      const width = 350
      const height = 500
      
      setStatus('🔧 生成SVG代码...')
      setProgress(40)
      
      // 创建SVG
      const svg = await createSVGFromDOM(element, width, height, scale)
      
      setStatus('💾 处理导出文件...')
      setProgress(70)
      
      if (format === 'svg') {
        // 直接导出SVG
        const svgBlob = new Blob([svg], { type: 'image/svg+xml' })
        const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '')
        const filename = `${user?.name || 'business-card'}-SVG-${scale}x-${timestamp}.svg`
        saveAs(svgBlob, filename)
        
        const fileSizeKB = (svgBlob.size / 1024).toFixed(1)
        setProgress(100)
        setStatus(`✅ SVG导出成功！大小: ${fileSizeKB}KB`)
      } else {
        // 转换为PNG
        setStatus('🖼️ SVG转PNG中...')
        setProgress(85)
        
        const pngBlob = await svgToPng(svg, width * scale, height * scale)
        const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '')
        const filename = `${user?.name || 'business-card'}-SVG-PNG-${scale}x-${timestamp}.png`
        saveAs(pngBlob, filename)
        
        const fileSizeKB = (pngBlob.size / 1024).toFixed(1)
        setProgress(100)
        setStatus(`✅ SVG→PNG导出成功！大小: ${fileSizeKB}KB`)
      }
      
      const duration = Date.now() - startTime
      console.log('🎯 SVG导出详情:', {
        导出方式: 'SVG矢量',
        输出格式: format.toUpperCase(),
        放大倍数: `${scale}x`,
        总耗时: duration + 'ms'
      })

    } catch (error: any) {
      console.error('❌ SVG导出失败:', error)
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

  // 从DOM创建SVG
  const createSVGFromDOM = async (element: HTMLElement, width: number, height: number, scale: number): Promise<string> => {
    const svgNS = 'http://www.w3.org/2000/svg'
    
    // 创建SVG字符串
    let svg = `<svg xmlns="${svgNS}" width="${width * scale}" height="${height * scale}" viewBox="0 0 ${width} ${height}">`
    
    // 添加背景
    svg += `<rect width="${width}" height="${height}" fill="#ffffff" rx="16" ry="16"/>`
    
    // 添加背景图片
    const bgImg = element.querySelector('img') || element.querySelector('[style*="background-image"]')
    if (bgImg) {
      const bgSrc = bgImg instanceof HTMLImageElement ? bgImg.src : extractBackgroundImage(bgImg as HTMLElement)
      if (bgSrc) {
        svg += `<defs><clipPath id="roundedClip"><rect width="${width}" height="${height}" rx="16" ry="16"/></clipPath></defs>`
        svg += `<image href="${bgSrc}" width="${width}" height="${height}" clip-path="url(#roundedClip)" preserveAspectRatio="xMidYMid slice"/>`
      }
    }
    
    // 添加头像
    const avatar = element.querySelector('img[alt="Avatar"]') as HTMLImageElement
    if (avatar && user?.avatar_url) {
      const avatarSize = 120
      const avatarX = (width - avatarSize) / 2
      const avatarY = 80
      
      svg += `<defs><clipPath id="avatarClip"><circle cx="${avatarX + avatarSize/2}" cy="${avatarY + avatarSize/2}" r="${avatarSize/2}"/></clipPath></defs>`
      svg += `<circle cx="${avatarX + avatarSize/2}" cy="${avatarY + avatarSize/2}" r="${avatarSize/2 + 2}" fill="white"/>`
      svg += `<image href="${user.avatar_url}" x="${avatarX}" y="${avatarY}" width="${avatarSize}" height="${avatarSize}" clip-path="url(#avatarClip)" preserveAspectRatio="xMidYMid slice"/>`
    }
    
    // 添加文本
    const nameY = 220
    const titleY = 260
    const phoneY = 400
    
    // 姓名
    svg += `<text x="${width/2}" y="${nameY}" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="32" font-weight="bold" fill="white" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))">${user?.name || 'أحمد'}</text>`
    
    // 职位
    svg += `<text x="${width/2}" y="${titleY}" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" fill="rgba(255,255,255,0.9)" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.3))">${user?.title || 'SENIOR LANGUAGE COACH'}</text>`
    
    // 电话
    svg += `<text x="${width/2}" y="${phoneY}" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="19" font-weight="600" fill="white" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.3))">${user?.phone || '050-XXXX-XXAB'}</text>`
    
    // 添加图标
    const icons = ['📚', '💬', '📊', '🔗']
    const iconSize = 50
    const iconsY = 320
    const totalIconsWidth = icons.length * iconSize + (icons.length - 1) * 20
    const startX = (width - totalIconsWidth) / 2
    
    icons.forEach((icon, index) => {
      const x = startX + index * (iconSize + 20)
      
      // 图标背景圆
      svg += `<circle cx="${x + iconSize/2}" cy="${iconsY + iconSize/2}" r="${iconSize/2}" fill="rgba(255,255,255,0.2)"/>`
      
      // 图标文字
      svg += `<text x="${x + iconSize/2}" y="${iconsY + iconSize/2 + 8}" text-anchor="middle" font-size="24" fill="white">${icon}</text>`
    })
    
    svg += '</svg>'
    return svg
  }

  // 提取背景图片URL
  const extractBackgroundImage = (element: HTMLElement): string | null => {
    const bgImage = element.style.backgroundImage
    const match = bgImage.match(/url\(["']?([^"'\)]+)["']?\)/)
    return match ? match[1] : null
  }

  // SVG转PNG
  const svgToPng = async (svgString: string, width: number, height: number): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      
      canvas.width = width
      canvas.height = height
      
      const img = new Image()
      img.onload = () => {
        ctx.drawImage(img, 0, 0)
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('SVG转PNG失败'))
          }
        }, 'image/png', 1.0)
      }
      
      img.onerror = () => reject(new Error('SVG图片加载失败'))
      
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml' })
      const url = URL.createObjectURL(svgBlob)
      img.src = url
    })
  }

  return (
    <Card className={`p-4 ${className} border-2 border-green-500 bg-gradient-to-br from-green-50 to-emerald-50`}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-green-700 flex items-center gap-2">
            📐 SVG矢量导出
            <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
              矢量图形
            </Badge>
          </h3>
        </div>
        
        <div className="text-sm text-green-700 bg-green-50 p-3 rounded-lg border border-green-200">
          <div className="font-semibold mb-1">🚀 技术特点：</div>
          <div className="space-y-1 text-xs">
            <div>• 矢量图形，无限缩放不失真</div>
            <div>• 文件体积小，加载速度快</div>
            <div>• 支持导出为SVG或PNG格式</div>
            <div>• 完美的文字和图形渲染</div>
            <div>• 适合印刷和高分辨率显示</div>
          </div>
        </div>
        
        {/* 进度条 */}
        {exporting && (
          <div className="space-y-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="text-xs text-center text-green-600">
              {progress}% 完成
            </div>
          </div>
        )}
        
        {/* 导出按钮 */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => svgExport('svg', 3)}
              disabled={exporting}
              className="bg-green-600 hover:bg-green-700 text-white"
              size="sm"
            >
              {exporting ? '生成中...' : '📐 矢量SVG (3x)'}
            </Button>
            <Button
              onClick={() => svgExport('png', 3)}
              disabled={exporting}
              className="bg-green-600 hover:bg-green-700 text-white"
              size="sm"
            >
              {exporting ? '转换中...' : '🖼️ SVG→PNG (3x)'}
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => svgExport('svg', 2)}
              disabled={exporting}
              variant="outline"
              className="border-green-300 text-green-700 hover:bg-green-50"
              size="sm"
            >
              {exporting ? '生成中...' : '📐 标准SVG (2x)'}
            </Button>
            <Button
              onClick={() => svgExport('png', 2)}
              disabled={exporting}
              variant="outline"
              className="border-green-300 text-green-700 hover:bg-green-50"
              size="sm"
            >
              {exporting ? '转换中...' : '🖼️ 标准PNG (2x)'}
            </Button>
          </div>
        </div>

        {/* 状态显示 */}
        {status && (
          <div className={`text-sm text-center p-3 rounded-lg border ${
            status.includes('✅') ? 'bg-green-50 text-green-700 border-green-200' :
            status.includes('❌') ? 'bg-red-50 text-red-700 border-red-200' :
            'bg-green-50 text-green-700 border-green-200'
          }`}>
            {status}
          </div>
        )}
        
        {/* 技术说明 */}
        <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg space-y-1">
          <div className="font-semibold text-green-700 mb-2">📐 SVG导出优势：</div>
          <div className="grid grid-cols-1 gap-1">
            <div>• 矢量格式，任意缩放不失真</div>
            <div>• 文件体积小，网络传输快</div>
            <div>• 支持搜索引擎索引和无障碍访问</div>
            <div>• 可编辑性强，便于后期修改</div>
            <div>• 完美支持高DPI显示设备</div>
          </div>
        </div>
      </div>
    </Card>
  )
}