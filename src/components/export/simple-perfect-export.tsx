'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { saveAs } from 'file-saver'
import html2canvas from 'html2canvas'
import { useAuthStore } from '@/store/auth'

interface SimplePerfectExportProps {
  cardRef: React.RefObject<HTMLDivElement>
  className?: string
}

export default function SimplePerfectExport({ 
  cardRef, 
  className = '' 
}: SimplePerfectExportProps) {
  const [exporting, setExporting] = useState(false)
  const [status, setStatus] = useState('')
  
  const { user } = useAuthStore()

  // 🎯 简单完美导出 - 完全不改变任何东西，只截图
  const simplePerfectExport = async (format: 'png' | 'jpeg') => {
    if (!cardRef.current) {
      setStatus('❌ 名片组件未找到')
      return
    }

    setExporting(true)
    setStatus('正在准备导出...')

    try {
      const element = cardRef.current
      
      // 等待所有图片加载完成
      setStatus('等待资源加载...')
      await waitForResources(element)

      setStatus('正在生成图片...')

      // 🔥 最简单的配置 - 什么都不改变
      const canvas = await html2canvas(element, {
        scale: 1, // 🔥 关键：使用1倍，完全不缩放
        useCORS: true,
        allowTaint: false,
        logging: true, // 开启日志查看详情
        backgroundColor: null, // 保持透明
        imageTimeout: 30000,
        removeContainer: true,
        scrollX: 0,
        scrollY: 0,
      })

      console.log('🎯 简单导出结果:', {
        原始元素: { width: element.offsetWidth, height: element.offsetHeight },
        画布尺寸: { width: canvas.width, height: canvas.height },
        比例: `${canvas.width}/${element.offsetWidth} = ${(canvas.width/element.offsetWidth).toFixed(2)}`
      })

      setStatus('正在处理图片...')
      
      // 如果需要高清，手动放大画布
      let finalCanvas = canvas
      const highRes = true // 是否需要高清
      
      if (highRes && (canvas.width < 700 || canvas.height < 1000)) {
        setStatus('正在生成高清版本...')
        finalCanvas = await upscaleCanvas(canvas, 2) // 2倍放大
      }
      
      // 转换为Blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        const mimeType = format === 'png' ? 'image/png' : 'image/jpeg'
        const quality = format === 'png' ? 1.0 : 0.95
        
        finalCanvas.toBlob((blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('无法生成图片文件'))
          }
        }, mimeType, quality)
      })
      
      // 下载文件
      const filename = `${user?.name || 'business-card'}-simple-perfect.${format}`
      saveAs(blob, filename)

      // 记录下载日志
      if (user?.id) {
        try {
          await fetch('/api/log-download', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: user.id,
              format: format,
              fileSize: blob.size,
              filename: filename
            })
          })
        } catch (logError) {
          console.warn('记录下载日志失败:', logError)
        }
      }

      const fileSizeKB = (blob.size / 1024).toFixed(1)
      const dimensions = `${finalCanvas.width}×${finalCanvas.height}`
      setStatus(`✅ 简单完美导出成功！尺寸: ${dimensions}, 大小: ${fileSizeKB}KB`)

    } catch (error: any) {
      console.error('❌ 简单完美导出失败:', error)
      setStatus(`❌ 导出失败: ${error.message}`)
    } finally {
      setExporting(false)
      setTimeout(() => setStatus(''), 5000)
    }
  }

  // 手动放大画布（保持质量）
  const upscaleCanvas = async (originalCanvas: HTMLCanvasElement, scale: number): Promise<HTMLCanvasElement> => {
    const scaledCanvas = document.createElement('canvas')
    const ctx = scaledCanvas.getContext('2d')!
    
    scaledCanvas.width = originalCanvas.width * scale
    scaledCanvas.height = originalCanvas.height * scale
    
    // 高质量缩放
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    
    ctx.drawImage(originalCanvas, 0, 0, scaledCanvas.width, scaledCanvas.height)
    
    return scaledCanvas
  }

  // 等待资源加载
  const waitForResources = async (element: HTMLElement): Promise<void> => {
    const promises: Promise<void>[] = []

    // 等待图片
    const images = element.querySelectorAll('img')
    images.forEach(img => {
      if (img.complete && img.naturalHeight !== 0) return
      
      promises.push(new Promise((resolve) => {
        const timeout = setTimeout(resolve, 5000) // 5秒超时
        img.onload = () => { clearTimeout(timeout); resolve() }
        img.onerror = () => { clearTimeout(timeout); resolve() }
      }))
    })

    // 等待字体
    if (document.fonts) {
      promises.push(document.fonts.ready.then(() => {}))
    }

    await Promise.all(promises)
    await new Promise(resolve => setTimeout(resolve, 200)) // 额外等待
  }

  return (
    <Card className={`p-4 ${className} border-2 border-blue-500`}>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-blue-700">🚀 简单完美导出</h3>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            1:1原样导出
          </Badge>
        </div>

        {/* 导出按钮 */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={() => simplePerfectExport('png')}
            disabled={exporting}
            className="bg-blue-600 hover:bg-blue-700"
            size="sm"
          >
            {exporting ? '导出中...' : 'PNG (推荐)'}
          </Button>
          <Button
            onClick={() => simplePerfectExport('jpeg')}
            disabled={exporting}
            variant="outline"
            size="sm"
          >
            {exporting ? '导出中...' : 'JPEG'}
          </Button>
        </div>

        {/* 状态显示 */}
        {status && (
          <div className={`text-sm text-center p-2 rounded ${
            status.includes('✅') ? 'bg-green-50 text-green-700' :
            status.includes('❌') ? 'bg-red-50 text-red-700' :
            'bg-blue-50 text-blue-700'
          }`}>
            {status}
          </div>
        )}

        {/* 说明 */}
        <div className="text-xs text-gray-600 space-y-1">
          <div className="font-semibold text-blue-700">🚀 特点：</div>
          <div>• Scale=1，完全不缩放</div>
          <div>• 保持原始布局和尺寸</div>
          <div>• 后期手动放大提升清晰度</div>
          <div>• 绝对不会挤压变形</div>
        </div>
      </div>
    </Card>
  )
}
