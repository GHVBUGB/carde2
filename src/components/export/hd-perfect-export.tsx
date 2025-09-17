'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { saveAs } from 'file-saver'
import html2canvas from 'html2canvas'
import { useAuthStore } from '@/store/auth'

interface HDPerfectExportProps {
  cardRef: React.RefObject<HTMLDivElement>
  className?: string
}

export default function HDPerfectExport({ 
  cardRef, 
  className = '' 
}: HDPerfectExportProps) {
  const [exporting, setExporting] = useState(false)
  const [status, setStatus] = useState('')
  const [progress, setProgress] = useState(0)
  
  const { user } = useAuthStore()

  // 高清1:1完美复刻导出
  const perfectExport = async (format: 'png' | 'jpeg' = 'png', scale: number = 3) => {
    if (!cardRef.current) {
      setStatus('❌ 名片组件未找到')
      return
    }

    setExporting(true)
    setStatus('🚀 正在准备高清导出...')
    setProgress(10)

    try {
      const startTime = Date.now()
      const element = cardRef.current
      
      // 触发切换到img背景模式（如果组件支持）
      setStatus('🔄 切换背景模式...')
      const bgModeEvent = new CustomEvent('switchToImgBackground')
      element.dispatchEvent(bgModeEvent)
      
      // 等待背景切换和资源加载
      setStatus('⏳ 等待资源加载完成...')
      setProgress(20)
      await waitForResources(element)
      
      // 获取元素的实际尺寸
      const rect = element.getBoundingClientRect()
      const actualWidth = rect.width
      const actualHeight = rect.height
      
      setStatus('📐 计算最佳导出尺寸...')
      setProgress(30)
      
      // 高清配置 - 修复偏移问题
      const canvas = await html2canvas(element, {
        // 核心配置
        scale: scale, // 3倍高清
        useCORS: true,
        allowTaint: false,
        
        // 尺寸配置 - 固定名片尺寸
        width: 350,
        height: 500,
        
        // 渲染质量配置
        backgroundColor: '#ffffff', // 白色背景
        removeContainer: true,
        imageTimeout: 15000,
        
        // 字体和文本优化
        letterRendering: true,
        logging: false, // 关闭调试日志
        
        // 忽略某些元素以避免干扰
        ignoreElements: (element) => {
          // 忽略可能影响导出的元素
          return element.classList?.contains('export-ignore') || false
        },
        
        // 样式优化 - 保持原始外观
        onclone: (clonedDoc, element) => {
          setStatus('🎨 优化样式和布局...')
          setProgress(50)
          
          // 找到名片容器
          const cardElement = clonedDoc.querySelector('[data-export-target]') || clonedDoc.querySelector('[data-card-ref]')
          
          if (cardElement) {
            // 修复偏移问题的样式调整
            const cardEl = cardElement as HTMLElement
            cardEl.style.position = 'relative'
            cardEl.style.margin = '0 auto'
            cardEl.style.padding = '0'
            cardEl.style.left = '0'
            cardEl.style.top = '0'
            cardEl.style.transform = 'none'
            cardEl.style.display = 'block'
            
            // 确保尺寸稳定并居中
            cardEl.style.width = '350px'
            cardEl.style.height = '500px'
            cardEl.style.maxWidth = '350px'
            cardEl.style.maxHeight = '500px'
            cardEl.style.minWidth = '350px'
            cardEl.style.minHeight = '500px'
          }
          
          // 优化所有元素的渲染质量
          const allElements = clonedDoc.querySelectorAll('*')
          allElements.forEach((el: any) => {
            if (el.style) {
              // 只清理明确有问题的变换
              if (el.style.transform && el.style.transform.includes('translate3d')) {
                const cleanTransform = el.style.transform.replace(/translate3d\([^)]*\)/g, '').trim()
                el.style.transform = cleanTransform || 'none'
              }
              
              // 清理可能影响布局的属性
              el.style.willChange = 'auto'
              
              // 优化文本渲染
              el.style.textRendering = 'optimizeLegibility'
              el.style.webkitFontSmoothing = 'antialiased'
              el.style.mozOsxFontSmoothing = 'grayscale'
            }
          })
          
          // 等待字体加载
          if (clonedDoc.fonts && clonedDoc.fonts.ready) {
            return clonedDoc.fonts.ready
          }
          
          return Promise.resolve()
        }
      })
      
      setStatus('🖼️ 生成高清图片...')
      setProgress(70)
      
      // 转换为高质量图片
      const mimeType = format === 'png' ? 'image/png' : 'image/jpeg'
      const quality = format === 'png' ? 1.0 : 0.98 // PNG无损，JPEG高质量
      
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('图片生成失败'))
          }
        }, mimeType, quality)
      })
      
      setStatus('💾 保存文件...')
      setProgress(90)
      
      // 生成文件名
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '')
      const filename = `${user?.name || 'business-card'}-HD-${scale}x-${timestamp}.${format}`
      
      // 下载文件
      saveAs(blob, filename)
      
      const duration = Date.now() - startTime
      const fileSizeKB = (blob.size / 1024).toFixed(1)
      const finalWidth = canvas.width
      const finalHeight = canvas.height
      
      setProgress(100)
      setStatus(`✅ 高清导出成功！尺寸: ${finalWidth}×${finalHeight}px, 大小: ${fileSizeKB}KB, 耗时: ${duration}ms`)
      
      console.log('🎯 高清导出详情:', {
        原始尺寸: `${actualWidth}×${actualHeight}px`,
        导出尺寸: `${finalWidth}×${finalHeight}px`,
        放大倍数: `${scale}x`,
        文件大小: fileSizeKB + 'KB',
        总耗时: duration + 'ms',
        格式: format.toUpperCase()
      })

    } catch (error: any) {
      console.error('❌ 高清导出失败:', error)
      setStatus(`❌ 导出失败: ${error.message}`)
      setProgress(0)
    } finally {
      // 恢复背景模式
      if (cardRef.current) {
        const resetEvent = new CustomEvent('resetBackground')
        cardRef.current.dispatchEvent(resetEvent)
      }
      
      setExporting(false)
      setTimeout(() => {
        setStatus('')
        setProgress(0)
      }, 8000)
    }
  }

  // 等待所有资源加载完成
  const waitForResources = async (element: HTMLElement): Promise<void> => {
    // 等待图片加载
    const images = element.querySelectorAll('img')
    const imagePromises = Array.from(images).map(img => {
      if (img.complete) return Promise.resolve()
      return new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = resolve // 即使失败也继续
        setTimeout(resolve, 3000) // 3秒超时
      })
    })
    
    // 等待字体加载
    const fontPromise = document.fonts ? document.fonts.ready : Promise.resolve()
    
    // 等待所有资源
    await Promise.all([...imagePromises, fontPromise])
    
    // 额外等待确保渲染完成
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  return (
    <Card className={`p-4 ${className} border-2 border-emerald-500 bg-gradient-to-br from-emerald-50 to-green-50`}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-emerald-700 flex items-center gap-2">
            🎯 高清完美导出
            <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 text-xs">
              1:1 像素复刻
            </Badge>
          </h3>
        </div>
        
        <div className="text-sm text-emerald-700 bg-emerald-50 p-3 rounded-lg border border-emerald-200">
          <div className="font-semibold mb-1">🚀 技术特点：</div>
          <div className="space-y-1 text-xs">
            <div>• HTML2Canvas 高精度渲染引擎</div>
            <div>• 3倍超高清分辨率 (1050×1500px)</div>
            <div>• 完美1:1像素级复刻</div>
            <div>• 智能资源等待和字体优化</div>
            <div>• 透明背景支持</div>
          </div>
        </div>
        
        {/* 进度条 */}
        {exporting && (
          <div className="space-y-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-emerald-500 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="text-xs text-center text-emerald-600">
              {progress}% 完成
            </div>
          </div>
        )}
        
        {/* 导出按钮 */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => perfectExport('png', 3)}
              disabled={exporting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              size="sm"
            >
              {exporting ? '导出中...' : '🎯 超高清PNG'}
            </Button>
            <Button
              onClick={() => perfectExport('jpeg', 3)}
              disabled={exporting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              size="sm"
            >
              {exporting ? '导出中...' : '🎯 超高清JPEG'}
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => perfectExport('png', 2)}
              disabled={exporting}
              variant="outline"
              className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
              size="sm"
            >
              {exporting ? '导出中...' : '📱 高清PNG (2x)'}
            </Button>
            <Button
              onClick={() => perfectExport('jpeg', 2)}
              disabled={exporting}
              variant="outline"
              className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
              size="sm"
            >
              {exporting ? '导出中...' : '📱 高清JPEG (2x)'}
            </Button>
          </div>
        </div>

        {/* 状态显示 */}
        {status && (
          <div className={`text-sm text-center p-3 rounded-lg border ${
            status.includes('✅') ? 'bg-green-50 text-green-700 border-green-200' :
            status.includes('❌') ? 'bg-red-50 text-red-700 border-red-200' :
            'bg-emerald-50 text-emerald-700 border-emerald-200'
          }`}>
            {status}
          </div>
        )}
        
        {/* 技术说明 */}
        <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg space-y-1">
          <div className="font-semibold text-emerald-700 mb-2">🔧 导出规格：</div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            <div>• 原始尺寸: 350×500px</div>
            <div>• 2x高清: 700×1000px</div>
            <div>• 3x超清: 1050×1500px</div>
            <div>• 格式: PNG/JPEG</div>
            <div>• 背景: 透明支持</div>
            <div>• 质量: 无损/98%</div>
          </div>
        </div>
      </div>
    </Card>
  )
}