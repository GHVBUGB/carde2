'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { User } from '@/lib/types'
import { saveAs } from 'file-saver'
import domtoimage from 'dom-to-image-more'
import html2canvas from 'html2canvas'
import { useAuthStore } from '@/store/auth'

interface EnhancedDomExportProps {
  cardRef: React.RefObject<HTMLDivElement>
  className?: string
}

export default function EnhancedDomExport({ 
  cardRef, 
  className = '' 
}: EnhancedDomExportProps) {
  const [exporting, setExporting] = useState(false)
  const [status, setStatus] = useState('')
  
  const { user } = useAuthStore()

  // 🎯 增强版DOM导出：基于现有DOM功能 + 画质提升
  const enhancedDomExport = async (format: 'png' | 'jpg' = 'png') => {
    if (!cardRef.current) {
      setStatus('❌ 名片组件未找到')
      return
    }

    setExporting(true)
    setStatus('正在准备增强DOM导出...')

    try {
      const startTime = Date.now()
      const scale = format === 'png' ? 2 : 1.5
      const width = 350
      const height = 500

      // === 第一步：使用现有DOM导出逻辑 ===
      setStatus('第一步：创建DOM优化容器...')
      
      // 创建临时容器（复用现有逻辑）
      const tempContainer = document.createElement('div')
      tempContainer.style.position = 'fixed'
      tempContainer.style.top = '-9999px'
      tempContainer.style.left = '-9999px'
      tempContainer.style.width = `${width}px`
      tempContainer.style.height = `${height}px`
      tempContainer.style.overflow = 'hidden'
      tempContainer.style.background = 'transparent'
      tempContainer.style.margin = '0'
      tempContainer.style.padding = '0'
      tempContainer.style.border = 'none'
      tempContainer.style.boxSizing = 'border-box'
      
      // 克隆目标元素（复用现有逻辑）
      const clonedCard = cardRef.current.cloneNode(true) as HTMLElement
      
      // 重置克隆元素样式（复用现有逻辑）
      clonedCard.style.position = 'relative'
      clonedCard.style.top = '0'
      clonedCard.style.left = '0'
      clonedCard.style.margin = '0'
      clonedCard.style.padding = '0'
      clonedCard.style.border = 'none'
      clonedCard.style.boxShadow = 'none'
      clonedCard.style.outline = 'none'
      clonedCard.style.transform = 'none'
      clonedCard.style.width = `${width}px`
      clonedCard.style.height = `${height}px`
      clonedCard.style.maxWidth = `${width}px`
      clonedCard.style.maxHeight = `${height}px`
      clonedCard.style.minWidth = `${width}px`
      clonedCard.style.minHeight = `${height}px`
      clonedCard.style.overflow = 'hidden'
      clonedCard.style.boxSizing = 'border-box'
      
      // 移除可能导致问题的类名
      clonedCard.classList.remove('border', 'border-gray-200', 'shadow-lg', 'rounded-lg', 'shadow', 'border-2')
      
      // 深度清理子元素
      const allElements = clonedCard.querySelectorAll('*')
      allElements.forEach((el: any) => {
        if (el.style) {
          el.style.margin = '0'
          el.style.border = 'none'
          el.style.boxShadow = 'none'
          el.style.outline = 'none'
        }
        if (el.classList) {
          el.classList.remove('border', 'border-gray-200', 'shadow-lg', 'rounded-lg', 'shadow', 'border-2')
        }
      })

      tempContainer.appendChild(clonedCard)
      document.body.appendChild(tempContainer)

      // 等待渲染完成
      await new Promise(resolve => setTimeout(resolve, 200))

      // === 第二步：DOM导出 ===
      setStatus('第二步：DOM基础导出...')
      
      // DOM-to-image配置（复用现有配置）
      const domOptions = {
        width: width,
        height: height,
        style: {
          margin: '0',
          padding: '0',
          border: 'none',
          boxShadow: 'none',
          outline: 'none',
          transform: 'none',
          position: 'relative',
          top: '0',
          left: '0'
        },
        quality: format === 'png' ? 1.0 : 0.95,
        bgcolor: '#ffffff',
        cacheBust: true,
        skipAutoScale: true,
        pixelRatio: scale,
        filter: (node: HTMLElement) => {
          if (node.classList) {
            node.classList.remove('shadow-lg', 'border', 'border-gray-200')
            return !node.classList.contains('export-exclude')
          }
          return true
        }
      }

      let domDataUrl: string
      if (format === 'png') {
        domDataUrl = await domtoimage.toPng(clonedCard, domOptions)
      } else {
        domDataUrl = await domtoimage.toJpeg(clonedCard, domOptions)
      }

      // === 第三步：画质增强 ===
      setStatus('第三步：画质增强处理...')
      
      // 将DOM导出结果转换为图片元素
      const domImage = new Image()
      domImage.crossOrigin = 'anonymous'
      
      await new Promise((resolve, reject) => {
        domImage.onload = resolve
        domImage.onerror = reject
        domImage.src = domDataUrl
      })

      // 创建一个容器来装载DOM导出的图片
      const enhanceContainer = document.createElement('div')
      enhanceContainer.style.position = 'fixed'
      enhanceContainer.style.top = '-9999px'
      enhanceContainer.style.left = '-9999px'
      enhanceContainer.style.width = `${width}px`
      enhanceContainer.style.height = `${height}px`
      enhanceContainer.style.background = '#ffffff'
      enhanceContainer.style.overflow = 'hidden'
      
      // 添加DOM导出的图片
      domImage.style.width = '100%'
      domImage.style.height = '100%'
      domImage.style.objectFit = 'cover'
      enhanceContainer.appendChild(domImage)
      document.body.appendChild(enhanceContainer)

      // 等待图片渲染
      await new Promise(resolve => setTimeout(resolve, 100))

      // === 第四步：html2canvas二次优化 ===
      setStatus('第四步：html2canvas画质优化...')
      
      const enhancedCanvas = await html2canvas(enhanceContainer, {
        scale: 2, // 二次放大提升画质
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: width,
        height: height,
        imageTimeout: 30000,
        removeContainer: true
      })

      // === 第五步：最终优化 ===
      setStatus('第五步：最终画质优化...')
      
      // 创建最终的高质量画布
      const finalCanvas = document.createElement('canvas')
      const ctx = finalCanvas.getContext('2d')!
      
      // 设置最终尺寸
      const finalWidth = width * 2  // 高清版本
      const finalHeight = height * 2
      finalCanvas.width = finalWidth
      finalCanvas.height = finalHeight
      
      // 高质量渲染设置
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      
      // 绘制增强后的内容
      ctx.drawImage(enhancedCanvas, 0, 0, finalWidth, finalHeight)
      
      // 清理临时容器
      document.body.removeChild(tempContainer)
      document.body.removeChild(enhanceContainer)
      
      setStatus('正在生成最终文件...')
      
      // 转换为blob
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
      const filename = `${user?.name || 'business-card'}-enhanced-dom.${format}`
      saveAs(blob, filename)

      const duration = Date.now() - startTime
      const fileSizeKB = (blob.size / 1024).toFixed(1)
      setStatus(`✅ 增强DOM导出成功！尺寸: ${finalCanvas.width}×${finalCanvas.height}, 大小: ${fileSizeKB}KB, 耗时: ${duration}ms`)

      console.log('✅ 增强DOM导出详情:', {
        原始尺寸: `${width}×${height}`,
        DOM导出完成: '✓',
        html2canvas增强: '✓',
        最终尺寸: `${finalCanvas.width}×${finalCanvas.height}`,
        文件大小: fileSizeKB + 'KB',
        总耗时: duration + 'ms'
      })

    } catch (error: any) {
      console.error('❌ 增强DOM导出失败:', error)
      setStatus(`❌ 导出失败: ${error.message}`)
    } finally {
      setExporting(false)
      setTimeout(() => setStatus(''), 8000)
    }
  }

  // 🎯 快速DOM导出（只用DOM，不增强）
  const quickDomExport = async (format: 'png' | 'jpg' = 'png') => {
    if (!cardRef.current) {
      setStatus('❌ 名片组件未找到')
      return
    }

    setExporting(true)
    setStatus('正在进行快速DOM导出...')

    try {
      // 使用现有的DOM导出逻辑，但简化配置
      const element = cardRef.current
      
      const options = {
        width: 350,
        height: 500,
        quality: format === 'png' ? 1.0 : 0.95,
        bgcolor: '#ffffff',
        cacheBust: true,
        pixelRatio: 2,
      }

      let dataUrl: string
      if (format === 'png') {
        dataUrl = await domtoimage.toPng(element, options)
      } else {
        dataUrl = await domtoimage.toJpeg(element, options)
      }
      
      // 转换为blob
      const response = await fetch(dataUrl)
      const blob = await response.blob()
      
      // 下载文件
      const filename = `${user?.name || 'business-card'}-quick-dom.${format}`
      saveAs(blob, filename)

      const fileSizeKB = (blob.size / 1024).toFixed(1)
      setStatus(`✅ 快速DOM导出成功！大小: ${fileSizeKB}KB`)

    } catch (error: any) {
      console.error('❌ 快速DOM导出失败:', error)
      setStatus(`❌ 导出失败: ${error.message}`)
    } finally {
      setExporting(false)
      setTimeout(() => setStatus(''), 5000)
    }
  }

  return (
    <Card className={`p-4 ${className} border-2 border-blue-500`}>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-blue-700">🚀 增强DOM导出</h3>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            基于现有DOM + 画质提升
          </Badge>
        </div>
        
        <div className="text-sm text-blue-700 bg-blue-50 p-2 rounded">
          <strong>技术方案：</strong>DOM导出 → 图片化 → html2canvas二次优化 → 画质增强
        </div>
        
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => enhancedDomExport('png')}
              disabled={exporting}
              className="bg-blue-600 hover:bg-blue-700"
              size="sm"
            >
              {exporting ? '增强中...' : '🚀 增强PNG'}
            </Button>
            <Button
              onClick={() => enhancedDomExport('jpg')}
              disabled={exporting}
              variant="outline"
              size="sm"
            >
              {exporting ? '增强中...' : '🚀 增强JPEG'}
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => quickDomExport('png')}
              disabled={exporting}
              variant="outline"
              size="sm"
            >
              {exporting ? '导出中...' : '⚡ 快速PNG'}
            </Button>
            <Button
              onClick={() => quickDomExport('jpg')}
              disabled={exporting}
              variant="outline"
              size="sm"
            >
              {exporting ? '导出中...' : '⚡ 快速JPEG'}
            </Button>
          </div>
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
          <div className="font-semibold text-blue-700">🚀 增强流程：</div>
          <div>1. 复用现有DOM导出逻辑</div>
          <div>2. DOM-to-image生成基础图片</div>
          <div>3. 图片化后用html2canvas二次处理</div>
          <div>4. 高质量Canvas渲染优化</div>
          <div>5. 最终生成2倍高清图片</div>
          <div className="text-blue-600 font-semibold">五步画质提升！</div>
        </div>
      </div>
    </Card>
  )
}
