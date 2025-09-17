'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { saveAs } from 'file-saver'
import html2canvas from 'html2canvas'
import { useAuthStore } from '@/store/auth'

interface LayoutPerfectExportProps {
  cardRef: React.RefObject<HTMLDivElement>
  className?: string
}

export default function LayoutPerfectExport({ 
  cardRef, 
  className = '' 
}: LayoutPerfectExportProps) {
  const [exporting, setExporting] = useState(false)
  const [status, setStatus] = useState('')
  
  const { user } = useAuthStore()

  // 🎯 精确布局复制 - 保持不糊 + 正确布局
  const perfectLayoutExport = async () => {
    if (!cardRef.current) {
      alert('名片组件未找到')
      return
    }

    setExporting(true)
    setStatus('开始精确布局复制...')

    try {
      const element = cardRef.current
      
      // 🔧 应用之前成功的像素比修正
      const originalDevicePixelRatio = window.devicePixelRatio
      console.log('🔍 原始设备像素比:', originalDevicePixelRatio)
      
      // 强制修正像素比（之前证明有效）
      Object.defineProperty(window, 'devicePixelRatio', {
        writable: true,
        value: 2.0
      })
      
      setStatus('步骤1：修正设备像素比 ✅')
      
      // 🎯 获取元素的精确信息
      const rect = element.getBoundingClientRect()
      const computedStyle = window.getComputedStyle(element)
      
      console.log('📐 元素详细信息:')
      console.log('- offsetWidth/Height:', element.offsetWidth, 'x', element.offsetHeight)
      console.log('- clientWidth/Height:', element.clientWidth, 'x', element.clientHeight)
      console.log('- boundingRect:', rect.width, 'x', rect.height)
      console.log('- computedStyle:', computedStyle.width, 'x', computedStyle.height)
      
      setStatus('步骤2：分析元素尺寸 ✅')
      
      // 🎯 使用最精确的尺寸
      const accurateWidth = Math.round(rect.width)
      const accurateHeight = Math.round(rect.height)
      
      console.log('🎯 使用精确尺寸:', accurateWidth, 'x', accurateHeight)
      
      // 🔥 关键改进：不强制修改DOM，让html2canvas自然渲染
      const canvas = await html2canvas(element, {
        scale: 2, // 使用修正后的像素比对应的缩放
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: true,
        // 🔥 关键：不强制width/height，让html2canvas自动检测
        // width: accurateWidth,  // 注释掉强制尺寸
        // height: accurateHeight, // 注释掉强制尺寸
        foreignObjectRendering: false,
        removeContainer: true,
        scrollX: 0,
        scrollY: 0,
        imageTimeout: 30000,
        // 🎯 最小化onclone干预，只处理关键问题
        onclone: (clonedDoc, clonedElement) => {
          console.log('🔧 最小化修复克隆元素...')
          
          // 只修复背景图片跨域问题，不改变布局
          const bgElements = clonedElement.querySelectorAll('[style*="background-image"]')
          bgElements.forEach((bgEl: any) => {
            if (bgEl.style.backgroundImage && bgEl.style.backgroundImage.includes('localhost:3000')) {
              console.log('🖼️ 修复背景图片路径')
              bgEl.style.backgroundImage = bgEl.style.backgroundImage.replace('http://localhost:3000', '')
            }
          })
          
          // 确保字体渲染质量，但不改变大小
          const allElements = clonedElement.querySelectorAll('*')
          allElements.forEach((el: any) => {
            // 只优化渲染质量，不改变尺寸
            el.style.webkitFontSmoothing = 'antialiased'
            el.style.mozOsxFontSmoothing = 'grayscale'
            el.style.textRendering = 'optimizeLegibility'
          })
          
          console.log('✅ 最小化修复完成，保持原始布局')
        }
      })
      
      setStatus('步骤3：html2canvas精确渲染 ✅')
      
      console.log('📊 渲染结果:')
      console.log('- 画布尺寸:', canvas.width, 'x', canvas.height)
      console.log('- 元素尺寸x2:', accurateWidth * 2, 'x', accurateHeight * 2)
      
      // 🎯 如果尺寸差异很大，进行智能调整
      const expectedWidth = accurateWidth * 2
      const expectedHeight = accurateHeight * 2
      const widthDiff = Math.abs(canvas.width - expectedWidth)
      const heightDiff = Math.abs(canvas.height - expectedHeight)
      
      if (widthDiff > 20 || heightDiff > 20) { // 允许小差异
        console.log('⚠️ 检测到布局差异，进行智能调整')
        console.log('预期:', expectedWidth, 'x', expectedHeight)
        console.log('实际:', canvas.width, 'x', canvas.height)
        console.log('差异:', widthDiff, 'x', heightDiff)
        
        // 创建目标尺寸的画布
        const adjustedCanvas = document.createElement('canvas')
        const ctx = adjustedCanvas.getContext('2d')!
        
        adjustedCanvas.width = expectedWidth
        adjustedCanvas.height = expectedHeight
        
        // 绘制白色背景
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, adjustedCanvas.width, adjustedCanvas.height)
        
        // 智能缩放原canvas到新canvas
        const scaleX = expectedWidth / canvas.width
        const scaleY = expectedHeight / canvas.height
        const scale = Math.min(scaleX, scaleY) // 保持宽高比
        
        const newWidth = canvas.width * scale
        const newHeight = canvas.height * scale
        const offsetX = (expectedWidth - newWidth) / 2
        const offsetY = (expectedHeight - newHeight) / 2
        
        ctx.drawImage(canvas, offsetX, offsetY, newWidth, newHeight)
        
        // 替换原canvas
        canvas.width = adjustedCanvas.width
        canvas.height = adjustedCanvas.height
        const originalCtx = canvas.getContext('2d')!
        originalCtx.clearRect(0, 0, canvas.width, canvas.height)
        originalCtx.drawImage(adjustedCanvas, 0, 0)
        
        setStatus('步骤4：智能布局调整 ✅')
      } else {
        setStatus('步骤4：布局完美，无需调整 ✅')
      }
      
      // 恢复原始设备像素比
      Object.defineProperty(window, 'devicePixelRatio', {
        writable: true,
        value: originalDevicePixelRatio
      })
      
      // 转换并下载
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob)
          else reject(new Error('转换失败'))
        }, 'image/png', 1.0)
      })
      
      const filename = `${user?.name || 'user'}-perfect-layout.png`
      saveAs(blob, filename)
      
      setStatus('✅ 精确布局导出完成！')
      
      console.log('✅ 精确布局导出成功')
      alert(`精确布局导出完成！\n最终尺寸: ${canvas.width}×${canvas.height}\n应该既清晰又布局正确`)

    } catch (error) {
      console.error('精确布局导出失败:', error)
      setStatus('❌ 导出失败: ' + error)
      alert('精确布局导出失败: ' + error)
    } finally {
      setExporting(false)
      setTimeout(() => setStatus(''), 3000)
    }
  }

  // 🔍 布局对比分析
  const analyzeLayout = async () => {
    if (!cardRef.current) {
      alert('名片组件未找到')
      return
    }

    try {
      const element = cardRef.current
      
      // 获取所有子元素的位置信息
      const children = Array.from(element.children)
      const layoutInfo = children.map((child, index) => {
        const rect = child.getBoundingClientRect()
        const elementRect = element.getBoundingClientRect()
        const style = window.getComputedStyle(child as HTMLElement)
        
        return {
          index,
          tagName: child.tagName,
          className: child.className || '无',
          相对位置: {
            left: Math.round(rect.left - elementRect.left),
            top: Math.round(rect.top - elementRect.top),
            width: Math.round(rect.width),
            height: Math.round(rect.height)
          },
          样式: {
            position: style.position,
            zIndex: style.zIndex,
            transform: style.transform,
            fontSize: style.fontSize,
            fontWeight: style.fontWeight
          }
        }
      })
      
      console.log('🎯 布局分析结果:')
      console.log('元素总数:', children.length)
      layoutInfo.forEach(info => {
        console.log(`${info.index}. ${info.tagName}:`, info.相对位置, info.样式)
      })
      
      alert(`布局分析完成！\n找到 ${children.length} 个子元素\n详细信息请查看控制台`)
      
    } catch (error) {
      console.error('布局分析失败:', error)
      alert('布局分析失败: ' + error)
    }
  }

  return (
    <Card className={`p-4 ${className} border-2 border-green-500`}>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-green-700">🎯 精确布局导出</h3>
          <Badge variant="default" className="bg-green-100 text-green-800">
            不糊+正确布局
          </Badge>
        </div>
        
        <div className="text-sm text-green-700 bg-green-50 p-2 rounded">
          <strong>策略：</strong>保持像素比修正（不糊） + 最小干预（正确布局）
        </div>
        
        {status && (
          <div className="text-sm bg-blue-50 p-2 rounded">
            <strong>状态：</strong>{status}
          </div>
        )}
        
        <div className="space-y-2">
          <Button
            onClick={perfectLayoutExport}
            disabled={exporting}
            className="w-full bg-green-600 hover:bg-green-700"
            size="sm"
          >
            {exporting ? '导出中...' : '🎯 精确布局导出'}
          </Button>
          
          <Button
            onClick={analyzeLayout}
            disabled={exporting}
            variant="outline"
            className="w-full border-green-300 text-green-700"
            size="sm"
          >
            {exporting ? '分析中...' : '🔍 布局分析（查看控制台）'}
          </Button>
        </div>
        
        <div className="text-xs text-gray-600 space-y-1">
          <div className="font-semibold text-green-700">🎯 改进策略：</div>
          <div>• 保持有效的像素比修正（解决糊化）</div>
          <div>• 移除强制尺寸设置（保持布局）</div>
          <div>• 最小化DOM修改（避免破坏样式）</div>
          <div>• 智能尺寸调整（处理小差异）</div>
          <div>• 只修复关键问题（背景图片等）</div>
          <div className="text-green-600 font-semibold">既清晰又正确的布局！</div>
        </div>
      </div>
    </Card>
  )
}
