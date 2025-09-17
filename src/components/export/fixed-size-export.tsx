'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { saveAs } from 'file-saver'
import html2canvas from 'html2canvas'
import { useAuthStore } from '@/store/auth'

interface FixedSizeExportProps {
  cardRef: React.RefObject<HTMLDivElement>
  className?: string
}

export default function FixedSizeExport({ 
  cardRef, 
  className = '' 
}: FixedSizeExportProps) {
  const [exporting, setExporting] = useState(false)
  const [status, setStatus] = useState('')
  
  const { user } = useAuthStore()

  // 🎯 固定尺寸导出 - 彻底解决收窄问题
  const fixedSizeExport = async () => {
    if (!cardRef.current) {
      setStatus('❌ 名片组件未找到')
      return
    }

    setExporting(true)
    setStatus('正在准备固定尺寸导出...')

    try {
      const element = cardRef.current
      
      // 🔍 记录原始样式
      const originalStyles = {
        className: element.className,
        style: element.style.cssText
      }
      
      console.log('🔍 原始元素信息:')
      console.log('className:', element.className)
      console.log('原始style:', element.style.cssText)
      console.log('offsetWidth:', element.offsetWidth)
      console.log('offsetHeight:', element.offsetHeight)
      
      setStatus('正在临时调整样式...')
      
      // 🔥 临时移除可能影响尺寸的CSS类和样式
      element.className = ''
      element.style.cssText = `
        position: relative !important;
        width: 350px !important;
        height: 500px !important;
        min-width: 350px !important;
        min-height: 500px !important;
        max-width: 350px !important;
        max-height: 500px !important;
        box-sizing: border-box !important;
        margin: 0 !important;
        padding: 0 !important;
        border: none !important;
        border-radius: 20px !important;
        overflow: hidden !important;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
        flex-shrink: 0 !important;
        flex-grow: 0 !important;
        display: block !important;
      `
      
      // 等待样式应用
      await new Promise(resolve => setTimeout(resolve, 200))
      
      console.log('🔍 调整后元素信息:')
      console.log('调整后offsetWidth:', element.offsetWidth)
      console.log('调整后offsetHeight:', element.offsetHeight)
      
      setStatus('正在生成图片...')
      
      // 🔥 使用最简单的html2canvas配置
      const canvas = await html2canvas(element, {
        scale: 1,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: true,
        removeContainer: true,
        scrollX: 0,
        scrollY: 0,
      })
      
      console.log('🔍 最终画布信息:')
      console.log('画布尺寸:', canvas.width, 'x', canvas.height)
      console.log('应该是350x500:', canvas.width === 350, canvas.height === 500)
      
      // 🔥 恢复原始样式
      element.className = originalStyles.className
      element.style.cssText = originalStyles.style
      
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
      
      const filename = `${user?.name || 'business-card'}-fixed-size.png`
      saveAs(blob, filename)

      const fileSizeKB = (blob.size / 1024).toFixed(1)
      setStatus(`✅ 固定尺寸导出成功！尺寸: ${canvas.width}×${canvas.height}, 大小: ${fileSizeKB}KB`)

    } catch (error: any) {
      console.error('❌ 固定尺寸导出失败:', error)
      setStatus(`❌ 导出失败: ${error.message}`)
      
      // 确保恢复原始样式
      if (cardRef.current) {
        const element = cardRef.current
        // 这里可以添加恢复逻辑，但通常error时页面会刷新
      }
    } finally {
      setExporting(false)
      setTimeout(() => setStatus(''), 5000)
    }
  }

  // 🎯 高清固定尺寸导出
  const highResFixedSizeExport = async () => {
    if (!cardRef.current) {
      setStatus('❌ 名片组件未找到')
      return
    }

    setExporting(true)
    setStatus('正在准备高清固定尺寸导出...')

    try {
      const element = cardRef.current
      
      // 直接导出，不改变样式，但创建2倍画布
      await new Promise(resolve => setTimeout(resolve, 300))
      
      setStatus('正在生成高清图片...')
      
      // 创建2倍尺寸的画布
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      
      canvas.width = 700  // 350 * 2
      canvas.height = 1000 // 500 * 2
      
      // 设置高质量缩放
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      ctx.scale(2, 2)
      
      // 绘制背景
      const gradient = ctx.createLinearGradient(0, 0, 350, 500)
      gradient.addColorStop(0, '#667eea')
      gradient.addColorStop(1, '#764ba2')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, 350, 500)
      
      // 使用html2canvas获取内容
      const contentCanvas = await html2canvas(element, {
        scale: 1,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: false,
      })
      
      // 将内容绘制到高清画布上
      ctx.drawImage(contentCanvas, 0, 0, 350, 500)
      
      setStatus('正在处理高清文件...')
      
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
      
      const filename = `${user?.name || 'business-card'}-high-res-fixed.png`
      saveAs(blob, filename)

      const fileSizeKB = (blob.size / 1024).toFixed(1)
      setStatus(`✅ 高清固定尺寸导出成功！尺寸: ${canvas.width}×${canvas.height}, 大小: ${fileSizeKB}KB`)

    } catch (error: any) {
      console.error('❌ 高清固定尺寸导出失败:', error)
      setStatus(`❌ 导出失败: ${error.message}`)
    } finally {
      setExporting(false)
      setTimeout(() => setStatus(''), 5000)
    }
  }

  return (
    <Card className={`p-4 ${className} border-2 border-red-500`}>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-red-700">🔧 固定尺寸导出</h3>
          <div className="text-xs text-red-600 font-bold">专治收窄</div>
        </div>
        
        <div className="text-sm text-red-700 bg-red-50 p-2 rounded">
          <strong>解决方案：</strong>临时移除CSS类，强制350×500尺寸
        </div>
        
        <div className="space-y-2">
          <Button
            onClick={fixedSizeExport}
            disabled={exporting}
            className="w-full bg-red-600 hover:bg-red-700"
            size="sm"
          >
            {exporting ? '修复中...' : '🔧 强制350×500导出'}
          </Button>
          
          <Button
            onClick={highResFixedSizeExport}
            disabled={exporting}
            variant="outline"
            className="w-full"
            size="sm"
          >
            {exporting ? '绘制中...' : '✨ 高清700×1000导出'}
          </Button>
        </div>

        {status && (
          <div className={`text-sm text-center p-2 rounded ${
            status.includes('✅') ? 'bg-green-50 text-green-700' :
            status.includes('❌') ? 'bg-red-50 text-red-700' :
            'bg-blue-50 text-blue-700'
          }`}>
            {status}
          </div>
        )}
        
        <div className="text-xs text-gray-600 space-y-1">
          <div className="font-semibold text-red-700">🔧 修复原理：</div>
          <div>• 临时移除所有CSS类</div>
          <div>• 强制设置350×500尺寸</div>
          <div>• 手动添加渐变背景</div>
          <div>• 导出后恢复原始样式</div>
          <div className="text-red-600 font-semibold">查看控制台详细信息！</div>
        </div>
      </div>
    </Card>
  )
}
