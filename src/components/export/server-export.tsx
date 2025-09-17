'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { saveAs } from 'file-saver'
import { useAuthStore } from '@/store/auth'

interface ServerExportProps {
  cardRef: React.RefObject<HTMLDivElement>
  className?: string
}

export default function ServerExport({ 
  cardRef, 
  className = '' 
}: ServerExportProps) {
  const [exporting, setExporting] = useState(false)
  const [status, setStatus] = useState('')
  const [progress, setProgress] = useState(0)
  
  const { user } = useAuthStore()

  // 服务端导出
  const serverExport = async (format: 'png' | 'jpeg' | 'pdf' = 'png', scale: number = 2) => {
    if (!cardRef.current) {
      setStatus('❌ 名片组件未找到')
      return
    }

    setExporting(true)
    setStatus('🚀 正在准备服务端导出...')
    setProgress(10)

    try {
      const startTime = Date.now()
      const element = cardRef.current
      
      setStatus('📦 收集页面数据...')
      setProgress(20)
      
      // 收集页面HTML和样式
      const pageData = await collectPageData(element)
      
      setStatus('🌐 发送到服务端...')
      setProgress(40)
      
      // 发送到服务端API
      const response = await fetch('/api/server-export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          html: pageData.html,
          css: pageData.css,
          format: format,
          scale: scale,
          width: 350,
          height: 500,
          user: {
            name: user?.name,
            title: user?.title,
            phone: user?.phone,
            avatar_url: user?.avatar_url
          }
        })
      })
      
      setStatus('⚡ 服务端处理中...')
      setProgress(70)
      
      if (!response.ok) {
        throw new Error(`服务端错误: ${response.status}`)
      }
      
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || '服务端处理失败')
      }
      
      setStatus('💾 下载文件...')
      setProgress(90)
      
      // 下载文件
      const fileResponse = await fetch(result.fileUrl)
      const blob = await fileResponse.blob()
      
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '')
      const filename = `${user?.name || 'business-card'}-Server-${scale}x-${timestamp}.${format}`
      
      saveAs(blob, filename)
      
      const duration = Date.now() - startTime
      const fileSizeKB = (blob.size / 1024).toFixed(1)
      
      setProgress(100)
      setStatus(`✅ 服务端导出成功！大小: ${fileSizeKB}KB, 耗时: ${duration}ms`)
      
      console.log('🎯 服务端导出详情:', {
        导出方式: 'Puppeteer服务端',
        输出格式: format.toUpperCase(),
        放大倍数: `${scale}x`,
        文件大小: fileSizeKB + 'KB',
        总耗时: duration + 'ms'
      })

    } catch (error: any) {
      console.error('❌ 服务端导出失败:', error)
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

  // 收集页面数据
  const collectPageData = async (element: HTMLElement) => {
    // 获取HTML
    const html = element.outerHTML
    
    // 收集所有相关CSS
    const stylesheets = Array.from(document.styleSheets)
    let css = ''
    
    for (const stylesheet of stylesheets) {
      try {
        if (stylesheet.cssRules) {
          for (const rule of Array.from(stylesheet.cssRules)) {
            css += rule.cssText + '\n'
          }
        }
      } catch (e) {
        // 跨域样式表可能无法访问
        console.warn('无法访问样式表:', e)
      }
    }
    
    // 添加内联样式
    const styleElements = document.querySelectorAll('style')
    styleElements.forEach(style => {
      css += style.textContent + '\n'
    })
    
    return { html, css }
  }

  return (
    <Card className={`p-4 ${className} border-2 border-red-500 bg-gradient-to-br from-red-50 to-pink-50`}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-red-700 flex items-center gap-2">
            🚀 服务端导出
            <Badge variant="secondary" className="bg-red-100 text-red-800 text-xs">
              Puppeteer
            </Badge>
          </h3>
        </div>
        
        <div className="text-sm text-red-700 bg-red-50 p-3 rounded-lg border border-red-200">
          <div className="font-semibold mb-1">🚀 技术特点：</div>
          <div className="space-y-1 text-xs">
            <div>• 基于Puppeteer无头浏览器</div>
            <div>• 服务端渲染，质量最高</div>
            <div>• 支持PNG/JPEG/PDF格式</div>
            <div>• 完美的字体和样式支持</div>
            <div>• 适合批量和自动化处理</div>
          </div>
        </div>
        
        {/* 进度条 */}
        {exporting && (
          <div className="space-y-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-red-500 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="text-xs text-center text-red-600">
              {progress}% 完成
            </div>
          </div>
        )}
        
        {/* 导出按钮 */}
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <Button
              onClick={() => serverExport('png', 3)}
              disabled={exporting}
              className="bg-red-600 hover:bg-red-700 text-white"
              size="sm"
            >
              {exporting ? '处理中...' : '🚀 PNG (3x)'}
            </Button>
            <Button
              onClick={() => serverExport('jpeg', 3)}
              disabled={exporting}
              className="bg-red-600 hover:bg-red-700 text-white"
              size="sm"
            >
              {exporting ? '处理中...' : '🚀 JPEG (3x)'}
            </Button>
            <Button
              onClick={() => serverExport('pdf', 3)}
              disabled={exporting}
              className="bg-red-600 hover:bg-red-700 text-white"
              size="sm"
            >
              {exporting ? '处理中...' : '🚀 PDF (3x)'}
            </Button>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <Button
              onClick={() => serverExport('png', 2)}
              disabled={exporting}
              variant="outline"
              className="border-red-300 text-red-700 hover:bg-red-50"
              size="sm"
            >
              {exporting ? '处理中...' : '📱 PNG (2x)'}
            </Button>
            <Button
              onClick={() => serverExport('jpeg', 2)}
              disabled={exporting}
              variant="outline"
              className="border-red-300 text-red-700 hover:bg-red-50"
              size="sm"
            >
              {exporting ? '处理中...' : '📱 JPEG (2x)'}
            </Button>
            <Button
              onClick={() => serverExport('pdf', 2)}
              disabled={exporting}
              variant="outline"
              className="border-red-300 text-red-700 hover:bg-red-50"
              size="sm"
            >
              {exporting ? '处理中...' : '📱 PDF (2x)'}
            </Button>
          </div>
        </div>

        {/* 状态显示 */}
        {status && (
          <div className={`text-sm text-center p-3 rounded-lg border ${
            status.includes('✅') ? 'bg-green-50 text-green-700 border-green-200' :
            status.includes('❌') ? 'bg-red-50 text-red-700 border-red-200' :
            'bg-red-50 text-red-700 border-red-200'
          }`}>
            {status}
          </div>
        )}
        
        {/* 技术说明 */}
        <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg space-y-1">
          <div className="font-semibold text-red-700 mb-2">🚀 服务端导出优势：</div>
          <div className="grid grid-cols-1 gap-1">
            <div>• 无头浏览器渲染，质量最高</div>
            <div>• 不受客户端性能限制</div>
            <div>• 支持PDF等特殊格式</div>
            <div>• 完美的字体和CSS支持</div>
            <div>• 适合批量处理和API调用</div>
          </div>
        </div>
        
        {/* 注意事项 */}
        <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
          <div className="font-semibold mb-1">⚠️ 注意事项：</div>
          <div>需要服务端支持Puppeteer，首次使用可能需要安装依赖</div>
        </div>
      </div>
    </Card>
  )
}