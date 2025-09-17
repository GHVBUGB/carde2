'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { saveAs } from 'file-saver'
import html2canvas from 'html2canvas'
import { useAuthStore } from '@/store/auth'

interface UltimateExportFixProps {
  cardRef: React.RefObject<HTMLDivElement>
  className?: string
}

export default function UltimateExportFix({ 
  cardRef, 
  className = '' 
}: UltimateExportFixProps) {
  const [exporting, setExporting] = useState(false)
  const [status, setStatus] = useState('')
  
  const { user } = useAuthStore()

  // 🎯 终极修复：深度诊断并修复html2canvas
  const ultimateExport = async (format: 'png' | 'jpeg') => {
    if (!cardRef.current) {
      setStatus('❌ 名片组件未找到')
      return
    }

    setExporting(true)
    setStatus('正在进行深度诊断...')

    try {
      const element = cardRef.current
      
      // 🔍 深度诊断
      console.log('=== 深度诊断开始 ===')
      console.log('元素:', element)
      console.log('元素尺寸:', {
        offsetWidth: element.offsetWidth,
        offsetHeight: element.offsetHeight,
        clientWidth: element.clientWidth,
        clientHeight: element.clientHeight,
        scrollWidth: element.scrollWidth,
        scrollHeight: element.scrollHeight
      })
      
      const rect = element.getBoundingClientRect()
      console.log('getBoundingClientRect:', rect)
      
      const computedStyle = window.getComputedStyle(element)
      console.log('计算样式:', {
        width: computedStyle.width,
        height: computedStyle.height,
        background: computedStyle.background,
        backgroundImage: computedStyle.backgroundImage,
        backgroundSize: computedStyle.backgroundSize,
        position: computedStyle.position,
        transform: computedStyle.transform,
        display: computedStyle.display
      })

      // 等待所有资源
      setStatus('等待所有资源加载...')
      await waitForAllResources(element)

      setStatus('正在使用终极配置导出...')

      // 🔥 终极html2canvas配置
      const canvas = await html2canvas(element, {
        // 基础设置
        scale: 1, // 先用1倍，避免缩放问题
        useCORS: true,
        allowTaint: true, // 允许跨域，重要！
        backgroundColor: null, // 保持透明
        logging: true, // 开启详细日志
        
        // 尺寸设置
        width: element.offsetWidth,
        height: element.offsetHeight,
        
        // 渲染设置
        imageTimeout: 30000,
        removeContainer: true,
        foreignObjectRendering: true, // 启用外部对象渲染
        
        // 滚动设置
        scrollX: 0,
        scrollY: 0,
        x: 0,
        y: 0,
        
        // 窗口设置
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
        
        // 🔥 关键：onclone回调修复样式
        onclone: (clonedDoc, clonedElement) => {
          console.log('=== 克隆回调开始 ===')
          console.log('克隆元素:', clonedElement)
          
          // 强制设置样式
          clonedElement.style.cssText = `
            width: ${element.offsetWidth}px !important;
            height: ${element.offsetHeight}px !important;
            position: relative !important;
            display: block !important;
            margin: 0 !important;
            padding: 0 !important;
            transform: none !important;
            zoom: 1 !important;
            overflow: visible !important;
          `
          
          // 修复背景
          const originalBg = computedStyle.backgroundImage
          if (originalBg && originalBg !== 'none') {
            clonedElement.style.backgroundImage = originalBg
            clonedElement.style.backgroundSize = 'cover'
            clonedElement.style.backgroundPosition = 'center'
            clonedElement.style.backgroundRepeat = 'no-repeat'
          } else {
            // 如果没有背景图，设置渐变
            clonedElement.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          }
          
          // 修复所有子元素
          const allElements = clonedElement.querySelectorAll('*')
          allElements.forEach((el: any) => {
            const originalEl = element.querySelector(`[data-element-id="${el.getAttribute('data-element-id')}"]`)
            if (originalEl) {
              const originalStyle = window.getComputedStyle(originalEl)
              el.style.cssText = originalStyle.cssText
            }
            
            // 特殊处理图片
            if (el.tagName === 'IMG') {
              el.style.objectFit = 'cover'
              el.style.objectPosition = 'center'
              el.crossOrigin = 'anonymous'
            }
          })
          
          console.log('克隆元素修复完成')
        }
      })

      console.log('=== html2canvas完成 ===')
      console.log('画布尺寸:', { width: canvas.width, height: canvas.height })

      // 如果需要高清，手动放大
      let finalCanvas = canvas
      if (canvas.width < 700) {
        setStatus('正在生成高清版本...')
        finalCanvas = await upscaleCanvas(canvas, 2)
        console.log('放大后画布尺寸:', { width: finalCanvas.width, height: finalCanvas.height })
      }

      setStatus('正在生成文件...')
      
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
      const filename = `${user?.name || 'business-card'}-ultimate-fix.${format}`
      saveAs(blob, filename)

      const fileSizeKB = (blob.size / 1024).toFixed(1)
      const dimensions = `${finalCanvas.width}×${finalCanvas.height}`
      setStatus(`✅ 终极修复导出成功！尺寸: ${dimensions}, 大小: ${fileSizeKB}KB`)

    } catch (error: any) {
      console.error('❌ 终极修复导出失败:', error)
      setStatus(`❌ 导出失败: ${error.message}`)
    } finally {
      setExporting(false)
      setTimeout(() => setStatus(''), 8000)
    }
  }

  // 等待所有资源加载
  const waitForAllResources = async (element: HTMLElement): Promise<void> => {
    const promises: Promise<void>[] = []

    // 等待图片
    const images = element.querySelectorAll('img')
    images.forEach((img, index) => {
      // 给每个图片添加唯一ID用于后续匹配
      img.setAttribute('data-element-id', `img-${index}`)
      
      if (img.complete && img.naturalHeight !== 0) return
      
      promises.push(new Promise((resolve) => {
        const timeout = setTimeout(() => {
          console.warn('图片加载超时:', img.src)
          resolve()
        }, 10000)

        img.onload = () => {
          clearTimeout(timeout)
          console.log('图片加载完成:', img.src)
          resolve()
        }
        img.onerror = () => {
          clearTimeout(timeout)
          console.warn('图片加载失败:', img.src)
          resolve()
        }
      }))
    })

    // 等待背景图片
    const bgImage = window.getComputedStyle(element).backgroundImage
    if (bgImage && bgImage !== 'none' && bgImage.includes('url(')) {
      const url = bgImage.match(/url\(['"]?([^'")]+)['"]?\)/)?.[1]
      if (url) {
        promises.push(new Promise((resolve) => {
          const img = new Image()
          img.crossOrigin = 'anonymous'
          img.onload = () => {
            console.log('背景图片加载完成:', url)
            resolve()
          }
          img.onerror = () => {
            console.warn('背景图片加载失败:', url)
            resolve()
          }
          img.src = url
        }))
      }
    }

    // 等待字体
    if (document.fonts) {
      promises.push(document.fonts.ready.then(() => {
        console.log('字体加载完成')
      }))
    }

    await Promise.all(promises)
    
    // 额外等待确保渲染稳定
    await new Promise(resolve => setTimeout(resolve, 500))
    console.log('所有资源加载完成')
  }

  // 手动放大画布
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

  return (
    <Card className={`p-4 ${className} border-2 border-purple-500`}>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-purple-700">⚡ 终极修复导出</h3>
          <Badge variant="secondary" className="bg-purple-100 text-purple-800">
            深度诊断+修复
          </Badge>
        </div>

        {/* 导出按钮 */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={() => ultimateExport('png')}
            disabled={exporting}
            className="bg-purple-600 hover:bg-purple-700"
            size="sm"
          >
            {exporting ? '修复中...' : '⚡ PNG 终极修复'}
          </Button>
          <Button
            onClick={() => ultimateExport('jpeg')}
            disabled={exporting}
            variant="outline"
            size="sm"
          >
            {exporting ? '修复中...' : '⚡ JPEG 终极修复'}
          </Button>
        </div>

        {/* 状态显示 */}
        {status && (
          <div className={`text-sm text-center p-2 rounded ${
            status.includes('✅') ? 'bg-green-50 text-green-700' :
            status.includes('❌') ? 'bg-red-50 text-red-700' :
            'bg-purple-50 text-purple-700'
          }`}>
            {status}
          </div>
        )}

        {/* 说明 */}
        <div className="text-xs text-gray-600 space-y-1">
          <div className="font-semibold text-purple-700">⚡ 终极修复技术：</div>
          <div>• 深度诊断所有样式和资源</div>
          <div>• 强制修复克隆元素样式</div>
          <div>• allowTaint=true 解决跨域</div>
          <div>• foreignObjectRendering 增强渲染</div>
          <div>• 详细日志输出便于调试</div>
          <div className="text-purple-600 font-semibold">请查看控制台日志！</div>
        </div>
      </div>
    </Card>
  )
}
