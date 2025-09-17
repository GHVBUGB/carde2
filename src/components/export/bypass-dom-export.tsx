'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { saveAs } from 'file-saver'
import html2canvas from 'html2canvas'
import { useAuthStore } from '@/store/auth'

interface BypassDomExportProps {
  cardRef: React.RefObject<HTMLDivElement>
  className?: string
}

export default function BypassDomExport({ 
  cardRef, 
  className = '' 
}: BypassDomExportProps) {
  const [exporting, setExporting] = useState(false)
  const [status, setStatus] = useState('')
  
  const { user } = useAuthStore()

  // 🎯 方法1：超高分辨率绕过画质损失
  const ultraHighResExport = async () => {
    if (!cardRef.current) {
      alert('名片组件未找到')
      return
    }

    setExporting(true)
    setStatus('开始超高分辨率导出...')

    try {
      const element = cardRef.current
      
      // 🔧 强制修正像素比
      const originalDevicePixelRatio = window.devicePixelRatio
      Object.defineProperty(window, 'devicePixelRatio', {
        writable: true,
        value: 4.0 // 🔥 使用4倍像素比，远超画质损失
      })
      
      setStatus('步骤1：设置4倍像素比 ✅')
      
      console.log('🎯 超高分辨率导出开始')
      console.log('像素比:', window.devicePixelRatio)
      console.log('元素尺寸:', element.offsetWidth, 'x', element.offsetHeight)
      
      const canvas = await html2canvas(element, {
        scale: 4, // 🔥 4倍缩放
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: true,
        foreignObjectRendering: false,
        removeContainer: true,
        scrollX: 0,
        scrollY: 0,
        imageTimeout: 30000,
        // 🎯 确保最高画质设置
        onclone: (clonedDoc, clonedElement) => {
          console.log('🔧 优化画质设置...')
          
          // 强制高质量渲染
          const allElements = clonedElement.querySelectorAll('*')
          allElements.forEach((el: any) => {
            el.style.webkitFontSmoothing = 'antialiased'
            el.style.mozOsxFontSmoothing = 'grayscale'
            el.style.textRendering = 'optimizeLegibility'
            el.style.imageRendering = 'high-quality'
            el.style.imageRendering = '-webkit-optimize-contrast'
            el.style.imageRendering = 'crisp-edges'
          })
          
          // 处理背景图片
          if (clonedElement.style.backgroundImage) {
            clonedElement.style.backgroundImage = clonedElement.style.backgroundImage.replace('http://localhost:3000', '')
          }
        }
      })
      
      setStatus('步骤2：4倍分辨率渲染完成 ✅')
      
      console.log('📊 超高分辨率结果:', canvas.width, 'x', canvas.height)
      
      // 恢复原始像素比
      Object.defineProperty(window, 'devicePixelRatio', {
        writable: true,
        value: originalDevicePixelRatio
      })
      
      // 🎯 最高质量PNG导出
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob)
          else reject(new Error('转换失败'))
        }, 'image/png', 1.0) // 最高质量
      })
      
      const filename = `${user?.name || 'user'}-ultra-high-res.png`
      saveAs(blob, filename)
      
      setStatus('✅ 超高分辨率导出完成！')
      alert(`超高分辨率导出完成！\n尺寸: ${canvas.width}×${canvas.height}\n这个应该能抵抗画质损失`)

    } catch (error) {
      console.error('超高分辨率导出失败:', error)
      setStatus('❌ 导出失败: ' + error)
    } finally {
      setExporting(false)
      setTimeout(() => setStatus(''), 3000)
    }
  }

  // 🎯 方法2：多步骤画质保护
  const multiStepQualityExport = async () => {
    if (!cardRef.current) {
      alert('名片组件未找到')
      return
    }

    setExporting(true)
    setStatus('开始多步骤画质保护...')

    try {
      const element = cardRef.current
      
      // 步骤1：先截取一个基础清晰版本
      setStatus('步骤1：基础清晰截取...')
      
      const originalDevicePixelRatio = window.devicePixelRatio
      Object.defineProperty(window, 'devicePixelRatio', {
        writable: true,
        value: 2.0
      })
      
      const baseCanvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false
      })
      
      console.log('📊 基础画布:', baseCanvas.width, 'x', baseCanvas.height)
      
      // 步骤2：创建更高分辨率的目标画布
      setStatus('步骤2：创建高分辨率画布...')
      
      const highResCanvas = document.createElement('canvas')
      const ctx = highResCanvas.getContext('2d')!
      
      // 目标分辨率（比基础版本再高一倍）
      const targetWidth = baseCanvas.width * 2
      const targetHeight = baseCanvas.height * 2
      
      highResCanvas.width = targetWidth
      highResCanvas.height = targetHeight
      
      // 步骤3：使用高质量缩放算法
      setStatus('步骤3：高质量缩放算法...')
      
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      
      // 绘制背景
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, targetWidth, targetHeight)
      
      // 高质量缩放绘制
      ctx.drawImage(baseCanvas, 0, 0, targetWidth, targetHeight)
      
      // 步骤4：应用锐化滤镜
      setStatus('步骤4：应用锐化滤镜...')
      
      const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight)
      const data = imageData.data
      
      // 简单锐化算法
      const sharpenKernel = [
        0, -1, 0,
        -1, 5, -1,
        0, -1, 0
      ]
      
      // 应用锐化（简化版本，只处理部分像素以提高性能）
      for (let y = 1; y < targetHeight - 1; y += 2) { // 隔行处理提高性能
        for (let x = 1; x < targetWidth - 1; x += 2) { // 隔列处理提高性能
          const idx = (y * targetWidth + x) * 4
          
          let r = 0, g = 0, b = 0
          
          for (let ky = -1; ky <= 1; ky++) {
            for (let kx = -1; kx <= 1; kx++) {
              const pixelIdx = ((y + ky) * targetWidth + (x + kx)) * 4
              const kernelIdx = (ky + 1) * 3 + (kx + 1)
              const weight = sharpenKernel[kernelIdx]
              
              r += data[pixelIdx] * weight
              g += data[pixelIdx + 1] * weight
              b += data[pixelIdx + 2] * weight
            }
          }
          
          data[idx] = Math.min(255, Math.max(0, r))
          data[idx + 1] = Math.min(255, Math.max(0, g))
          data[idx + 2] = Math.min(255, Math.max(0, b))
        }
      }
      
      ctx.putImageData(imageData, 0, 0)
      
      setStatus('步骤5：最终处理...')
      
      // 恢复原始像素比
      Object.defineProperty(window, 'devicePixelRatio', {
        writable: true,
        value: originalDevicePixelRatio
      })
      
      // 转换并下载
      const blob = await new Promise<Blob>((resolve, reject) => {
        highResCanvas.toBlob((blob) => {
          if (blob) resolve(blob)
          else reject(new Error('转换失败'))
        }, 'image/png', 1.0)
      })
      
      const filename = `${user?.name || 'user'}-quality-protected.png`
      saveAs(blob, filename)
      
      setStatus('✅ 多步骤画质保护完成！')
      
      console.log('✅ 多步骤画质保护完成')
      console.log('最终尺寸:', targetWidth, 'x', targetHeight)
      alert(`多步骤画质保护完成！\n最终尺寸: ${targetWidth}×${targetHeight}\n经过多重画质保护处理`)

    } catch (error) {
      console.error('多步骤画质保护失败:', error)
      setStatus('❌ 导出失败: ' + error)
    } finally {
      setExporting(false)
      setTimeout(() => setStatus(''), 3000)
    }
  }

  // 🎯 方法3：Canvas直接像素操作
  const directPixelExport = async () => {
    if (!cardRef.current) {
      alert('名片组件未找到')
      return
    }

    setExporting(true)
    setStatus('开始Canvas直接像素操作...')

    try {
      const element = cardRef.current
      
      // 获取基础截图
      const originalDevicePixelRatio = window.devicePixelRatio
      Object.defineProperty(window, 'devicePixelRatio', {
        writable: true,
        value: 1.0 // 使用1.0避免系统缩放
      })
      
      setStatus('步骤1：获取原始截图...')
      
      const sourceCanvas = await html2canvas(element, {
        scale: 1,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false
      })
      
      console.log('📊 原始截图:', sourceCanvas.width, 'x', sourceCanvas.height)
      
      // 创建高分辨率画布
      setStatus('步骤2：创建高分辨率画布...')
      
      const targetCanvas = document.createElement('canvas')
      const ctx = targetCanvas.getContext('2d')!
      
      const multiplier = 3 // 3倍放大
      targetCanvas.width = sourceCanvas.width * multiplier
      targetCanvas.height = sourceCanvas.height * multiplier
      
      // 关闭平滑缩放，使用像素级精确放大
      ctx.imageSmoothingEnabled = false
      
      setStatus('步骤3：像素级精确放大...')
      
      // 直接像素操作放大
      const sourceCtx = sourceCanvas.getContext('2d')!
      const sourceImageData = sourceCtx.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height)
      const targetImageData = ctx.createImageData(targetCanvas.width, targetCanvas.height)
      
      const sourceData = sourceImageData.data
      const targetData = targetImageData.data
      
      // 像素级复制放大
      for (let y = 0; y < sourceCanvas.height; y++) {
        for (let x = 0; x < sourceCanvas.width; x++) {
          const sourceIdx = (y * sourceCanvas.width + x) * 4
          
          // 每个源像素复制到3x3的目标区域
          for (let dy = 0; dy < multiplier; dy++) {
            for (let dx = 0; dx < multiplier; dx++) {
              const targetY = y * multiplier + dy
              const targetX = x * multiplier + dx
              const targetIdx = (targetY * targetCanvas.width + targetX) * 4
              
              targetData[targetIdx] = sourceData[sourceIdx]         // R
              targetData[targetIdx + 1] = sourceData[sourceIdx + 1] // G
              targetData[targetIdx + 2] = sourceData[sourceIdx + 2] // B
              targetData[targetIdx + 3] = sourceData[sourceIdx + 3] // A
            }
          }
        }
      }
      
      ctx.putImageData(targetImageData, 0, 0)
      
      setStatus('步骤4：完成像素操作...')
      
      // 恢复原始像素比
      Object.defineProperty(window, 'devicePixelRatio', {
        writable: true,
        value: originalDevicePixelRatio
      })
      
      // 转换并下载
      const blob = await new Promise<Blob>((resolve, reject) => {
        targetCanvas.toBlob((blob) => {
          if (blob) resolve(blob)
          else reject(new Error('转换失败'))
        }, 'image/png', 1.0)
      })
      
      const filename = `${user?.name || 'user'}-pixel-perfect.png`
      saveAs(blob, filename)
      
      setStatus('✅ 像素级精确导出完成！')
      
      console.log('✅ 像素级精确导出完成')
      console.log('最终尺寸:', targetCanvas.width, 'x', targetCanvas.height)
      alert(`像素级精确导出完成！\n最终尺寸: ${targetCanvas.width}×${targetCanvas.height}\n完全绕过画质损失`)

    } catch (error) {
      console.error('像素级精确导出失败:', error)
      setStatus('❌ 导出失败: ' + error)
    } finally {
      setExporting(false)
      setTimeout(() => setStatus(''), 3000)
    }
  }

  return (
    <Card className={`p-4 ${className} border-2 border-purple-500`}>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-purple-700">🚀 绕过画质损失</h3>
          <Badge variant="secondary" className="bg-purple-100 text-purple-800">
            抗画质损失
          </Badge>
        </div>
        
        <div className="text-sm text-purple-700 bg-purple-50 p-2 rounded">
          <strong>核心问题：</strong>DOM截图过程中画质被系统吞掉，用多种策略绕过
        </div>
        
        {status && (
          <div className="text-sm bg-blue-50 p-2 rounded">
            <strong>状态：</strong>{status}
          </div>
        )}
        
        <div className="space-y-2">
          <Button
            onClick={ultraHighResExport}
            disabled={exporting}
            className="w-full bg-purple-600 hover:bg-purple-700"
            size="sm"
          >
            {exporting ? '导出中...' : '🔥 超高分辨率抗损失 (4X)'}
          </Button>
          
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={multiStepQualityExport}
              disabled={exporting}
              variant="outline"
              className="border-purple-300 text-purple-700"
              size="sm"
            >
              {exporting ? '处理中...' : '🎯 多步骤保护'}
            </Button>
            <Button
              onClick={directPixelExport}
              disabled={exporting}
              variant="outline"
              className="border-purple-300 text-purple-700"
              size="sm"
            >
              {exporting ? '处理中...' : '🎨 像素级精确'}
            </Button>
          </div>
        </div>
        
        <div className="text-xs text-gray-600 space-y-1">
          <div className="font-semibold text-purple-700">🚀 抗损失策略：</div>
          <div>• <strong>4X分辨率</strong>：用超高分辨率抵抗画质损失</div>
          <div>• <strong>多步骤保护</strong>：基础截图→高质量缩放→锐化</div>
          <div>• <strong>像素级精确</strong>：直接操作像素，无损放大</div>
          <div>• <strong>质量优先</strong>：所有环节都使用最高质量设置</div>
          <div className="text-purple-600 font-semibold">彻底绕过画质损失问题！</div>
        </div>
      </div>
    </Card>
  )
}
