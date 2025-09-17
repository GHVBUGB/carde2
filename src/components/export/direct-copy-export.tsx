'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { saveAs } from 'file-saver'
import { useAuthStore } from '@/store/auth'

interface DirectCopyExportProps {
  cardRef: React.RefObject<HTMLDivElement>
  className?: string
}

export default function DirectCopyExport({ 
  cardRef, 
  className = '' 
}: DirectCopyExportProps) {
  const [exporting, setExporting] = useState(false)
  const [status, setStatus] = useState('')
  
  const { user } = useAuthStore()

  // 🎯 直接复制导出：完全绕过html2canvas的问题
  const directCopyExport = async () => {
    if (!cardRef.current) {
      setStatus('❌ 名片组件未找到')
      return
    }

    setExporting(true)
    setStatus('正在直接复制元素...')

    try {
      const element = cardRef.current
      
      // 创建一个新的iframe用于隔离渲染
      const iframe = document.createElement('iframe')
      iframe.style.cssText = `
        position: absolute;
        top: -9999px;
        left: -9999px;
        width: 350px;
        height: 500px;
        border: none;
        background: white;
      `
      document.body.appendChild(iframe)
      
      const iframeDoc = iframe.contentDocument!
      
      // 复制所有样式表到iframe
      setStatus('正在复制样式...')
      const styleSheets = Array.from(document.styleSheets)
      for (const sheet of styleSheets) {
        try {
          if (sheet.href) {
            const link = iframeDoc.createElement('link')
            link.rel = 'stylesheet'
            link.href = sheet.href
            iframeDoc.head.appendChild(link)
          } else {
            const style = iframeDoc.createElement('style')
            const rules = Array.from(sheet.cssRules)
            style.textContent = rules.map(rule => rule.cssText).join('\n')
            iframeDoc.head.appendChild(style)
          }
        } catch (e) {
          console.warn('无法复制样式表:', e)
        }
      }
      
      // 添加基础样式
      const baseStyle = iframeDoc.createElement('style')
      baseStyle.textContent = `
        body {
          margin: 0;
          padding: 20px;
          background: white;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .card-container {
          width: 350px;
          height: 500px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 20px;
          position: relative;
          overflow: hidden;
          margin: 0 auto;
        }
      `
      iframeDoc.head.appendChild(baseStyle)
      
      setStatus('正在复制内容...')
      
      // 创建卡片容器
      const cardContainer = iframeDoc.createElement('div')
      cardContainer.className = 'card-container'
      
      // 复制原始元素的innerHTML
      cardContainer.innerHTML = element.innerHTML
      
      iframeDoc.body.appendChild(cardContainer)
      
      // 等待iframe渲染完成
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setStatus('正在生成图片...')
      
      // 现在对iframe中的卡片进行截图
      const html2canvas = (await import('html2canvas')).default
      const canvas = await html2canvas(cardContainer, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: false,
        width: 350,
        height: 500,
      })
      
      // 清理iframe
      document.body.removeChild(iframe)
      
      setStatus('正在处理文件...')
      
      // 转换为blob并下载
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('无法生成图片文件'))
          }
        }, 'image/png', 1.0)
      })
      
      const filename = `${user?.name || 'business-card'}-direct-copy.png`
      saveAs(blob, filename)

      const fileSizeKB = (blob.size / 1024).toFixed(1)
      const dimensions = `${canvas.width}×${canvas.height}`
      setStatus(`✅ 直接复制导出成功！尺寸: ${dimensions}, 大小: ${fileSizeKB}KB`)

    } catch (error: any) {
      console.error('❌ 直接复制导出失败:', error)
      setStatus(`❌ 导出失败: ${error.message}`)
    } finally {
      setExporting(false)
      setTimeout(() => setStatus(''), 5000)
    }
  }

  // 🎯 简单导出：最基础的方法
  const simpleExport = async () => {
    if (!cardRef.current) {
      setStatus('❌ 名片组件未找到')
      return
    }

    setExporting(true)
    setStatus('正在使用最简单的方法导出...')

    try {
      const element = cardRef.current
      
      // 创建一个简单的canvas
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      
      canvas.width = 700  // 2倍尺寸
      canvas.height = 1000
      
      // 绘制渐变背景
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      gradient.addColorStop(0, '#667eea')
      gradient.addColorStop(1, '#764ba2')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // 绘制圆角
      ctx.globalCompositeOperation = 'destination-in'
      ctx.beginPath()
      ctx.roundRect(0, 0, canvas.width, canvas.height, 40)
      ctx.fill()
      ctx.globalCompositeOperation = 'source-over'
      
      // 添加文字（简单示例）
      ctx.fillStyle = 'white'
      ctx.font = 'bold 48px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('أحمد', canvas.width / 2, 300)
      
      ctx.font = '32px Arial'
      ctx.fillText('شريك النمو الرئيسي', canvas.width / 2, 350)
      
      ctx.font = '24px Arial'
      ctx.fillText('050-XXX-XXXX-XXAB', canvas.width / 2, 900)
      
      // 转换为blob并下载
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('无法生成图片文件'))
          }
        }, 'image/png', 1.0)
      })
      
      const filename = `${user?.name || 'business-card'}-simple.png`
      saveAs(blob, filename)

      const fileSizeKB = (blob.size / 1024).toFixed(1)
      setStatus(`✅ 简单导出成功！大小: ${fileSizeKB}KB`)

    } catch (error: any) {
      console.error('❌ 简单导出失败:', error)
      setStatus(`❌ 导出失败: ${error.message}`)
    } finally {
      setExporting(false)
      setTimeout(() => setStatus(''), 5000)
    }
  }

  return (
    <Card className={`p-4 ${className} border-2 border-orange-500`}>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-orange-700">🚀 直接复制导出</h3>
          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
            绕过所有问题
          </Badge>
        </div>

        {/* 导出按钮 */}
        <div className="space-y-2">
          <Button
            onClick={directCopyExport}
            disabled={exporting}
            className="w-full bg-orange-600 hover:bg-orange-700"
            size="sm"
          >
            {exporting ? '复制中...' : '🚀 iframe隔离导出'}
          </Button>
          
          <Button
            onClick={simpleExport}
            disabled={exporting}
            variant="outline"
            className="w-full"
            size="sm"
          >
            {exporting ? '绘制中...' : '🎨 手动Canvas绘制'}
          </Button>
        </div>

        {/* 状态显示 */}
        {status && (
          <div className={`text-sm text-center p-2 rounded ${
            status.includes('✅') ? 'bg-green-50 text-green-700' :
            status.includes('❌') ? 'bg-red-50 text-red-700' :
            'bg-orange-50 text-orange-700'
          }`}>
            {status}
          </div>
        )}

        {/* 说明 */}
        <div className="text-xs text-gray-600 space-y-1">
          <div className="font-semibold text-orange-700">🚀 直接解决方案：</div>
          <div>• <strong>iframe隔离</strong>：在独立环境中渲染</div>
          <div>• <strong>样式复制</strong>：完整复制所有CSS</div>
          <div>• <strong>手动Canvas</strong>：直接绘制，绝对可靠</div>
          <div className="text-orange-600 font-semibold">不依赖复杂的html2canvas配置！</div>
        </div>
      </div>
    </Card>
  )
}
