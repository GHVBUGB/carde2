'use client'

import React, { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { User } from '@/lib/types'
import { saveAs } from 'file-saver'
import domtoimage from 'dom-to-image-more'

interface DualExportMethodsProps {
  user: User
  cardRef: React.RefObject<HTMLDivElement>
  className?: string
}

interface ExportResult {
  method: 'canvas' | 'dom'
  format: 'png' | 'jpg'
  success: boolean
  fileSize?: number
  duration?: number
  error?: string
}

export default function DualExportMethods({ 
  user, 
  cardRef,
  className = '' 
}: DualExportMethodsProps) {
  const [exporting, setExporting] = useState(false)
  const [results, setResults] = useState<ExportResult[]>([])
  const [showResults, setShowResults] = useState(false)

  // 🎯 方法1: 原生Canvas导出 - 精确控制版本
  const exportWithNativeCanvas = async (format: 'png' | 'jpg' = 'png'): Promise<ExportResult> => {
    const startTime = Date.now()
    
    try {
      if (!cardRef.current) {
        throw new Error('名片引用不存在')
      }

      // 创建高分辨率Canvas
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        throw new Error('无法创建Canvas上下文')
      }

      const scale = format === 'png' ? 3 : 2 // PNG用3倍分辨率，JPG用2倍
      const width = 350
      const height = 500
      
      // 设置Canvas尺寸
      canvas.width = width * scale
      canvas.height = height * scale
      
      // 设置高质量渲染
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      
      // 1. 绘制白色背景
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // 2. 绘制背景图案 - 渐变效果
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      gradient.addColorStop(0, '#667eea')
      gradient.addColorStop(1, '#764ba2')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // 3. 添加背景纹理
      const backgroundImg = new Image()
      backgroundImg.crossOrigin = 'anonymous'
      
      await new Promise((resolve, reject) => {
        backgroundImg.onload = resolve
        backgroundImg.onerror = reject
        backgroundImg.src = '/ditu.png'
      })
      
      // 绘制背景图片
      ctx.globalAlpha = 0.3
      ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height)
      ctx.globalAlpha = 1.0
      
      // 4. 绘制头像
      if (user.avatar_url) {
        const avatarImg = new Image()
        avatarImg.crossOrigin = 'anonymous'
        
        await new Promise((resolve, reject) => {
          avatarImg.onload = resolve
          avatarImg.onerror = reject
          avatarImg.src = user.avatar_url!
        })
        
        // 头像位置和大小
        const avatarSize = 100 * scale
        const avatarX = (width - 100) / 2 * scale // 居中
        const avatarY = 50 * scale
        
        // 创建圆形裁剪路径
        ctx.save()
        ctx.beginPath()
        ctx.arc(
          avatarX + avatarSize / 2, 
          avatarY + avatarSize / 2, 
          avatarSize / 2, 
          0, 
          Math.PI * 2
        )
        ctx.clip()
        
        // 绘制头像
        ctx.drawImage(avatarImg, avatarX, avatarY, avatarSize, avatarSize)
        ctx.restore()
        
        // 绘制头像边框
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 4 * scale
        ctx.beginPath()
        ctx.arc(
          avatarX + avatarSize / 2, 
          avatarY + avatarSize / 2, 
          avatarSize / 2, 
          0, 
          Math.PI * 2
        )
        ctx.stroke()
      }
      
      // 5. 绘制文字内容
      ctx.fillStyle = '#ffffff'
      ctx.textAlign = 'center'
      ctx.font = `bold ${28 * scale}px Arial, sans-serif`
      
      // 姓名
      if (user.name) {
        ctx.fillText(user.name, width / 2 * scale, 200 * scale)
      }
      
      // 职位
      ctx.font = `${18 * scale}px Arial, sans-serif`
      if (user.title) {
        ctx.fillText(user.title, width / 2 * scale, 230 * scale)
      }
      
      // 统计数据
      ctx.font = `bold ${24 * scale}px Arial, sans-serif`
      if (user.students_served) {
        const studentsText = user.students_served >= 1000 
          ? `${Math.floor(user.students_served / 1000)}K+`
          : user.students_served.toString()
        ctx.fillText(studentsText, 120 * scale, 320 * scale)
        
        ctx.font = `${12 * scale}px Arial, sans-serif`
        ctx.fillText('STUDENTS', 120 * scale, 340 * scale)
        ctx.fillText('SERVED', 120 * scale, 355 * scale)
      }
      
      if (user.rating) {
        ctx.font = `bold ${24 * scale}px Arial, sans-serif`
        ctx.fillText(`${user.rating}%`, 230 * scale, 320 * scale)
        
        ctx.font = `${12 * scale}px Arial, sans-serif`
        ctx.fillText('POSITIVE', 230 * scale, 340 * scale)
        ctx.fillText('RATING', 230 * scale, 355 * scale)
      }
      
      // 电话
      if (user.phone) {
        ctx.font = `${16 * scale}px Arial, sans-serif`
        
        // 绘制电话背景
        const phoneText = `电话: ${user.phone}`
        const textMetrics = ctx.measureText(phoneText)
        const phoneX = width / 2 * scale
        const phoneY = 450 * scale
        
        ctx.fillStyle = 'rgba(255,255,255,0.2)'
        ctx.fillRect(
          phoneX - textMetrics.width / 2 - 20 * scale,
          phoneY - 20 * scale,
          textMetrics.width + 40 * scale,
          30 * scale
        )
        
        ctx.fillStyle = '#ffffff'
        ctx.fillText(phoneText, phoneX, phoneY)
      }
      
      // 6. 导出为blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Canvas导出失败'))
          }
        }, format === 'png' ? 'image/png' : 'image/jpeg', 0.95)
      })
      
      // 7. 下载文件
      const filename = `${user.name || 'business-card'}-canvas.${format}`
      saveAs(blob, filename)
      
      const duration = Date.now() - startTime
      return {
        method: 'canvas',
        format,
        success: true,
        fileSize: blob.size,
        duration
      }
      
    } catch (error: any) {
      const duration = Date.now() - startTime
      console.error('Canvas导出失败:', error)
      return {
        method: 'canvas',
        format,
        success: false,
        duration,
        error: error.message
      }
    }
  }

  // 🎯 方法2: DOM-to-image导出 - 保真度版本
  const exportWithDomToImage = async (format: 'png' | 'jpg' = 'png'): Promise<ExportResult> => {
    const startTime = Date.now()
    
    try {
      if (!cardRef.current) {
        throw new Error('名片引用不存在')
      }

      const scale = format === 'png' ? 2 : 1.5 // 降低缩放避免偏移
      const width = 350
      const height = 500

      // 创建临时容器来避免布局影响
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
      
      // 克隆目标元素
      const clonedCard = cardRef.current.cloneNode(true) as HTMLElement
      
      // 重置克隆元素的样式，避免偏移和边框
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
      
      // 移除可能导致边框和偏移的类名和样式
      clonedCard.classList.remove('border', 'border-gray-200', 'shadow-lg', 'rounded-lg', 'shadow', 'border-2')
      
      // 深度清理所有子元素的边框和偏移样式
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
      
      // 添加到临时容器
      tempContainer.appendChild(clonedCard)
      document.body.appendChild(tempContainer)
      
      // 等待渲染完成
      await new Promise(resolve => setTimeout(resolve, 200))

      // DOM-to-image配置 - 精确控制
      const options = {
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
        skipAutoScale: true, // 禁用自动缩放
        pixelRatio: scale, // 使用pixelRatio而不是transform
        // 跨域图片处理
        filter: (node: HTMLElement) => {
          // 过滤掉不需要的元素和样式
          if (node.classList) {
            // 移除可能导致偏移的类
            node.classList.remove('shadow-lg', 'border', 'border-gray-200')
            return !node.classList.contains('export-exclude')
          }
          return true
        }
      }

      let dataUrl: string
      
      if (format === 'png') {
        dataUrl = await domtoimage.toPng(clonedCard, options)
      } else {
        dataUrl = await domtoimage.toJpeg(clonedCard, options)
      }
      
      // 清理临时容器
      document.body.removeChild(tempContainer)
      
      // 转换为blob
      const response = await fetch(dataUrl)
      const blob = await response.blob()
      
      // 下载文件
      const filename = `${user.name || 'business-card'}-dom.${format}`
      saveAs(blob, filename)
      
      const duration = Date.now() - startTime
      return {
        method: 'dom',
        format,
        success: true,
        fileSize: blob.size,
        duration
      }
      
    } catch (error: any) {
      const duration = Date.now() - startTime
      console.error('DOM-to-image导出失败:', error)
      return {
        method: 'dom',
        format,
        success: false,
        duration,
        error: error.message
      }
    }
  }

  // 🚀 单一方法导出
  const handleSingleExport = async (method: 'canvas' | 'dom', format: 'png' | 'jpg') => {
    setExporting(true)
    
    try {
      let result: ExportResult
      
      if (method === 'canvas') {
        result = await exportWithNativeCanvas(format)
      } else {
        result = await exportWithDomToImage(format)
      }
      
      setResults([result])
      setShowResults(true)
      
      if (result.success) {
        alert(`✅ ${method.toUpperCase()}导出成功！\n格式: ${format.toUpperCase()}\n耗时: ${result.duration}ms\n文件大小: ${(result.fileSize! / 1024).toFixed(1)}KB`)
      } else {
        alert(`❌ ${method.toUpperCase()}导出失败: ${result.error}`)
      }
      
    } catch (error) {
      console.error('导出过程错误:', error)
      alert('导出过程发生错误，请重试')
    } finally {
      setExporting(false)
    }
  }

  // 🔥 对比导出 - 同时使用两种方法
  const handleCompareExport = async (format: 'png' | 'jpg') => {
    setExporting(true)
    
    try {
      console.log('=== 开始对比导出 ===')
      
      // 并行执行两种方法
      const [canvasResult, domResult] = await Promise.all([
        exportWithNativeCanvas(format),
        exportWithDomToImage(format)
      ])
      
      setResults([canvasResult, domResult])
      setShowResults(true)
      
      // 生成对比报告
      const report = generateComparisonReport(canvasResult, domResult)
      console.log('对比报告:', report)
      
      alert(`🔥 对比导出完成！\n\n${report}`)
      
    } catch (error) {
      console.error('对比导出错误:', error)
      alert('对比导出发生错误，请重试')
    } finally {
      setExporting(false)
    }
  }

  // 📊 生成对比报告
  const generateComparisonReport = (canvasResult: ExportResult, domResult: ExportResult): string => {
    const lines = []
    
    lines.push('📊 导出方法对比报告')
    lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    // Canvas结果
    lines.push(`🎨 Canvas导出: ${canvasResult.success ? '✅ 成功' : '❌ 失败'}`)
    if (canvasResult.success) {
      lines.push(`   ⏱️ 耗时: ${canvasResult.duration}ms`)
      lines.push(`   📦 大小: ${(canvasResult.fileSize! / 1024).toFixed(1)}KB`)
    } else {
      lines.push(`   ❌ 错误: ${canvasResult.error}`)
    }
    
    lines.push('')
    
    // DOM结果
    lines.push(`🌐 DOM-to-image: ${domResult.success ? '✅ 成功' : '❌ 失败'}`)
    if (domResult.success) {
      lines.push(`   ⏱️ 耗时: ${domResult.duration}ms`)
      lines.push(`   📦 大小: ${(domResult.fileSize! / 1024).toFixed(1)}KB`)
    } else {
      lines.push(`   ❌ 错误: ${domResult.error}`)
    }
    
    // 性能对比
    if (canvasResult.success && domResult.success) {
      lines.push('')
      lines.push('🏆 性能对比:')
      const fasterMethod = canvasResult.duration! < domResult.duration! ? 'Canvas' : 'DOM-to-image'
      const timeDiff = Math.abs(canvasResult.duration! - domResult.duration!)
      lines.push(`   ⚡ 更快: ${fasterMethod} (快${timeDiff}ms)`)
      
      const smallerMethod = canvasResult.fileSize! < domResult.fileSize! ? 'Canvas' : 'DOM-to-image'
      const sizeDiff = Math.abs(canvasResult.fileSize! - domResult.fileSize!) / 1024
      lines.push(`   💾 更小: ${smallerMethod} (小${sizeDiff.toFixed(1)}KB)`)
    }
    
    return lines.join('\n')
  }

  return (
    <Card className={`p-6 ${className}`}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">🚀 双重导出引擎</h3>
          <div className="flex gap-2">
            <Badge variant="outline">Canvas</Badge>
            <Badge variant="outline">DOM-to-image</Badge>
          </div>
        </div>
        
        <div className="text-sm text-gray-600">
          提供原生Canvas和DOM-to-image两种导出方法，可单独使用或对比测试
        </div>
        
        {/* 单一方法导出 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-blue-600">🎨 Canvas导出</h4>
            <div className="space-y-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleSingleExport('canvas', 'png')}
                disabled={exporting}
                className="w-full"
              >
                PNG高质量
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleSingleExport('canvas', 'jpg')}
                disabled={exporting}
                className="w-full"
              >
                JPG小文件
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-green-600">🌐 DOM导出</h4>
            <div className="space-y-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleSingleExport('dom', 'png')}
                disabled={exporting}
                className="w-full"
              >
                PNG保真
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleSingleExport('dom', 'jpg')}
                disabled={exporting}
                className="w-full"
              >
                JPG兼容
              </Button>
            </div>
          </div>
        </div>
        
        {/* 对比导出 */}
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-purple-600 mb-2">🔥 对比导出</h4>
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => handleCompareExport('png')}
              disabled={exporting}
              className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
            >
              {exporting ? '对比中...' : 'PNG对比'}
            </Button>
            <Button
              onClick={() => handleCompareExport('jpg')}
              disabled={exporting}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              {exporting ? '对比中...' : 'JPG对比'}
            </Button>
          </div>
        </div>
        
        {/* 结果显示 */}
        {showResults && results.length > 0 && (
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium mb-2">📊 导出结果</h4>
            <div className="space-y-2">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${
                    result.success 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant={result.method === 'canvas' ? 'default' : 'secondary'}>
                        {result.method === 'canvas' ? '🎨 Canvas' : '🌐 DOM'}
                      </Badge>
                      <span className="text-sm">
                        {result.format.toUpperCase()}
                      </span>
                      {result.success ? (
                        <span className="text-green-600 text-sm">✅ 成功</span>
                      ) : (
                        <span className="text-red-600 text-sm">❌ 失败</span>
                      )}
                    </div>
                    {result.success && (
                      <div className="text-xs text-gray-500">
                        {result.duration}ms | {(result.fileSize! / 1024).toFixed(1)}KB
                      </div>
                    )}
                  </div>
                  {!result.success && result.error && (
                    <div className="text-xs text-red-600 mt-1">
                      错误: {result.error}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* 方法说明 */}
        <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600">
          <div className="space-y-1">
            <div><strong>🎨 Canvas方法:</strong> 原生绘制，完全控制，适合标准化输出</div>
            <div><strong>🌐 DOM方法:</strong> 保持样式，兼容性好，适合复杂布局</div>
            <div><strong>🔥 对比模式:</strong> 同时使用两种方法，便于选择最佳方案</div>
          </div>
        </div>
      </div>
    </Card>
  )
}
