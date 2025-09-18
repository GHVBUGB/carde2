'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { saveAs } from 'file-saver'
import { toPng, toJpeg, toSvg } from 'html-to-image'
import { useAuthStore } from '@/store/auth'

interface HtmlToImageExportProps {
  cardRef: React.RefObject<HTMLDivElement>
  className?: string
}

export default function HtmlToImageExport({ 
  cardRef, 
  className = '' 
}: HtmlToImageExportProps) {
  const [exporting, setExporting] = useState(false)
  const [status, setStatus] = useState('')
  const [progress, setProgress] = useState(0)
  
  const { user } = useAuthStore()

  // html-to-image 导出
  const htmlToImageExport = async (format: 'png' | 'jpeg' | 'svg' = 'png', scale: number = 2) => {
    if (!cardRef.current) {
      setStatus('❌ 名片组件未找到')
      return
    }

    setExporting(true)
    setStatus('🔍 正在分析HTML结构...')
    setProgress(10)

    try {
      const startTime = Date.now()
      const element = cardRef.current
      
      setStatus('⚙️ 配置导出选项...')
      setProgress(20)
      
      // 固定名片尺寸，避免偏移问题
      const width = 350
      const height = 500
      
      // html-to-image 配置 - 修复偏移问题和白色边框
      const options = {
        quality: 1.0,
        pixelRatio: scale,
        backgroundColor: 'transparent',
        width: width,
        height: height,
        style: {
          transform: 'scale(1)',
          transformOrigin: 'center center',
          margin: '0',
          padding: '0',
          position: 'relative',
          left: '0',
          top: '0'
        },
        filter: (node: HTMLElement) => {
          // 过滤不需要的元素
          if (node.classList?.contains('export-ignore')) return false
          if (node.tagName === 'SCRIPT') return false
          if (node.tagName === 'NOSCRIPT') return false
          return true
        },
        skipFonts: false,
        cacheBust: true,
        imagePlaceholder: undefined
      }
      
      setStatus('🎨 HTML转换中...')
      setProgress(50)
      
      let dataUrl: string
      
      if (format === 'png') {
        dataUrl = await toPng(element, options)
      } else if (format === 'jpeg') {
        dataUrl = await toJpeg(element, { ...options, quality: 0.95 })
      } else {
        dataUrl = await toSvg(element, options)
      }
      
      setStatus('💾 生成下载文件...')
      setProgress(80)
      
      // 转换为blob并下载
      const response = await fetch(dataUrl)
      const blob = await response.blob()
      
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '')
      const filename = `${user?.name || 'business-card'}-HTML2IMG-${scale}x-${timestamp}.${format}`
      
      saveAs(blob, filename)
      
      const duration = Date.now() - startTime
      const fileSizeKB = (blob.size / 1024).toFixed(1)
      
      setProgress(100)
      setStatus(`✅ HTML导出成功！大小: ${fileSizeKB}KB, 耗时: ${duration}ms`)
      
      console.log('🎯 html-to-image导出详情:', {
        导出方式: 'html-to-image',
        输出格式: format.toUpperCase(),
        放大倍数: `${scale}x`,
        文件大小: fileSizeKB + 'KB',
        总耗时: duration + 'ms'
      })

    } catch (error: any) {
      console.error('❌ HTML导出失败:', error)
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

  return (
    <Card className={`p-4 ${className} border-2 border-orange-500 bg-gradient-to-br from-orange-50 to-amber-50`}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-orange-700 flex items-center gap-2">
            🔧 HTML-to-Image导出
          </h3>
        </div>
        
        {/* 技术特点说明已隐藏 */}
        
        {/* 进度条 */}
        {exporting && (
          <div className="space-y-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-orange-500 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="text-xs text-center text-orange-600">
              {progress}% 完成
            </div>
          </div>
        )}
        
        {/* 导出按钮 */}
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <Button
              onClick={() => htmlToImageExport('png', 3)}
              disabled={exporting}
              className="bg-orange-600 hover:bg-orange-700 text-white"
              size="sm"
            >
              {exporting ? '转换中...' : 'PNG (3x)'}
            </Button>
            <Button
              onClick={() => htmlToImageExport('jpeg', 3)}
              disabled={exporting}
              className="bg-orange-600 hover:bg-orange-700 text-white"
              size="sm"
            >
              {exporting ? '转换中...' : 'JPEG (3x)'}
            </Button>
            <Button
              onClick={() => htmlToImageExport('svg', 3)}
              disabled={exporting}
              className="bg-orange-600 hover:bg-orange-700 text-white"
              size="sm"
            >
              {exporting ? '转换中...' : 'SVG (3x)'}
            </Button>
          </div>
          
          {/* 2x按钮组已隐藏 */}
        </div>

        {/* 状态显示 */}
        {status && (
          <div className={`text-sm text-center p-3 rounded-lg border ${
            status.includes('✅') ? 'bg-green-50 text-green-700 border-green-200' :
            status.includes('❌') ? 'bg-red-50 text-red-700 border-red-200' :
            'bg-orange-50 text-orange-700 border-orange-200'
          }`}>
            {status}
          </div>
        )}
        
        {/* HTML导出优势说明已隐藏 */}
      </div>
    </Card>
  )
}