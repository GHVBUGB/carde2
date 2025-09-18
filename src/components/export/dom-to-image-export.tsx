'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { saveAs } from 'file-saver'
import domtoimage from 'dom-to-image-more'
import { useAuthStore } from '@/store/auth'

interface DomToImageExportProps {
  cardRef: React.RefObject<HTMLDivElement>
  className?: string
}

export default function DomToImageExport({ 
  cardRef, 
  className = '' 
}: DomToImageExportProps) {
  const [exporting, setExporting] = useState(false)
  const [status, setStatus] = useState('')
  const [optimizing, setOptimizing] = useState(false)
  
  const { user } = useAuthStore()

  // 🎯 DOM导出 + 外部API优化
  const exportWithOptimization = async (format: 'png' | 'jpeg' = 'png') => {
    if (!cardRef.current) {
      setStatus('❌ 名片组件未找到')
      return
    }

    setExporting(true)
    setStatus('正在准备DOM导出...')

    try {
      const startTime = Date.now()
      const domNode = cardRef.current
      
      // === 第一步：DOM导出 ===
      setStatus('第一步：DOM-to-image导出...')
      
      // 获取设备像素比
      const ratio = window.devicePixelRatio || 1
      console.log('设备像素比:', ratio)
      
      // DOM导出配置 - 修复边框和比例问题
      const domOptions = {
        width: 350,  // 固定宽度
        height: 500, // 固定高度
        quality: 1.0,
        backgroundColor: 'transparent',
        cacheBust: true,
        pixelRatio: ratio,
        style: {
          margin: '0',
          padding: '0',
          border: 'none',
          borderRadius: '0', // 移除圆角
          boxShadow: 'none', // 移除阴影
          transform: 'scale(1)',
          transformOrigin: '0 0',
          position: 'relative',
          overflow: 'hidden'
        },
        filter: (node: HTMLElement) => {
          // 深度清理所有可能影响渲染的样式
          if (node.style) {
            node.style.boxShadow = 'none'
            node.style.filter = 'none'
            node.style.border = 'none'
            node.style.outline = 'none'
            node.style.borderRadius = '0'
            node.style.margin = '0'
            node.style.padding = '0'
          }
          
          // 移除所有可能影响布局的CSS类
          if (node.classList) {
            node.classList.remove(
              'rounded-2xl', 'rounded-lg', 'rounded-md', 'rounded',
              'shadow-2xl', 'shadow-lg', 'shadow-md', 'shadow',
              'border', 'border-2', 'border-gray-200', 'border-gray-300',
              'overflow-hidden'
            )
          }
          
          return true
        }
      }
      
      // 执行DOM导出
      let dataUrl: string
      if (format === 'png') {
        dataUrl = await domtoimage.toPng(domNode, domOptions)
      } else {
        dataUrl = await domtoimage.toJpeg(domNode, domOptions)
      }
      
      setStatus('第二步：调用外部API优化...')
      setOptimizing(true)
      
      // === 第二步：外部API优化 ===
      try {
        const optimizeResponse = await fetch('/api/external-optimize', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            image: dataUrl,
            format: format
          })
        })

        if (optimizeResponse.ok) {
          const optimizeResult = await optimizeResponse.json()
          
          if (optimizeResult.success) {
            setStatus('第三步：生成优化后文件...')
            
            // 转换为blob并下载
            const response = await fetch(optimizeResult.optimized_image)
            const blob = await response.blob()
            
            const filename = `${user?.name || 'business-card'}-optimized.${format}`
            saveAs(blob, filename)

            const duration = Date.now() - startTime
            const fileSizeKB = (blob.size / 1024).toFixed(1)
            setStatus(`✅ 导出成功！方法: ${optimizeResult.method}, 放大: ${optimizeResult.scale}x, 大小: ${fileSizeKB}KB, 耗时: ${duration}ms`)

            console.log('✅ DOM导出+外部优化详情:', {
              原始尺寸: `${domNode.offsetWidth}×${domNode.offsetHeight}`,
              优化方法: optimizeResult.method,
              放大倍数: optimizeResult.scale,
              文件大小: fileSizeKB + 'KB',
              总耗时: duration + 'ms'
            })
          } else {
            throw new Error('外部API优化失败')
          }
        } else {
          throw new Error('外部API调用失败')
        }
      } catch (optimizeError) {
        console.warn('外部API优化失败，使用本地优化:', optimizeError)
        setStatus('外部API不可用，使用本地优化...')
        
        // 降级：使用本地Canvas优化
        try {
          const image = new Image()
          image.crossOrigin = 'anonymous'
          
          await new Promise((resolve, reject) => {
            image.onload = resolve
            image.onerror = reject
            image.src = dataUrl
          })
          
          // 创建高质量Canvas
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')!
          
          // 设置2倍分辨率
          canvas.width = image.width * 2
          canvas.height = image.height * 2
          
          // 高质量渲染设置
          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = 'high'
          
          // 绘制放大图像
          ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
          
          // 转换为blob并下载
          const blob = await new Promise<Blob>((resolve, reject) => {
            const mimeType = format === 'png' ? 'image/png' : 'image/jpeg'
            canvas.toBlob((blob) => {
              if (blob) resolve(blob)
              else reject(new Error('本地优化失败'))
            }, mimeType, 0.95)
          })
          
          const filename = `${user?.name || 'business-card'}-local-optimized.${format}`
          saveAs(blob, filename)

          const duration = Date.now() - startTime
          const fileSizeKB = (blob.size / 1024).toFixed(1)
          setStatus(`✅ 本地优化成功！尺寸: ${canvas.width}×${canvas.height}, 大小: ${fileSizeKB}KB, 耗时: ${duration}ms`)
          
        } catch (localError) {
          // 最终降级：直接下载原始图片
          const response = await fetch(dataUrl)
          const blob = await response.blob()
          
          const filename = `${user?.name || 'business-card'}-dom-export.${format}`
          saveAs(blob, filename)

          const duration = Date.now() - startTime
          const fileSizeKB = (blob.size / 1024).toFixed(1)
          setStatus(`✅ DOM导出成功（未优化）！大小: ${fileSizeKB}KB, 耗时: ${duration}ms`)
        }
      }

    } catch (error: any) {
      console.error('❌ DOM导出失败:', error)
      setStatus(`❌ 导出失败: ${error.message}`)
    } finally {
      setExporting(false)
      setOptimizing(false)
      setTimeout(() => setStatus(''), 8000)
    }
  }

  // 🎯 快速DOM导出（不优化）
  const quickDomExport = async (format: 'png' | 'jpeg' = 'png') => {
    if (!cardRef.current) {
      setStatus('❌ 名片组件未找到')
      return
    }

    setExporting(true)
    setStatus('正在进行快速DOM导出...')

    try {
      const startTime = Date.now()
      const domNode = cardRef.current
      
      // 简单配置 - 修复边框和比例问题
      const options = {
        width: 350,  // 固定宽度
        height: 500, // 固定高度
        quality: format === 'png' ? 1.0 : 0.95,
        backgroundColor: 'transparent',
        cacheBust: true,
        pixelRatio: 2,
        style: {
          margin: '0',
          padding: '0',
          border: 'none',
          borderRadius: '0',
          boxShadow: 'none',
          transform: 'scale(1)',
          transformOrigin: '0 0',
          position: 'relative',
          overflow: 'hidden'
        },
        filter: (node: HTMLElement) => {
          // 清理样式
          if (node.style) {
            node.style.boxShadow = 'none'
            node.style.border = 'none'
            node.style.outline = 'none'
            node.style.borderRadius = '0'
            node.style.margin = '0'
            node.style.padding = '0'
          }
          
          // 移除CSS类
          if (node.classList) {
            node.classList.remove(
              'rounded-2xl', 'rounded-lg', 'rounded-md', 'rounded',
              'shadow-2xl', 'shadow-lg', 'shadow-md', 'shadow',
              'border', 'border-2', 'border-gray-200', 'border-gray-300',
              'overflow-hidden'
            )
          }
          
          return true
        }
      }

      let dataUrl: string
      if (format === 'png') {
        dataUrl = await domtoimage.toPng(domNode, options)
      } else {
        dataUrl = await domtoimage.toJpeg(domNode, options)
      }
      
      // 转换为blob并下载
      const response = await fetch(dataUrl)
      const blob = await response.blob()
      
      const filename = `${user?.name || 'business-card'}-quick.${format}`
      saveAs(blob, filename)

      // 记录下载日志
      if (user?.id) {
        try {
          await fetch('/api/log-download', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: user.id,
              format: format,
              fileSize: blob.size,
              filename: filename
            })
          })
        } catch (logError) {
          console.warn('记录下载日志失败:', logError)
        }
      }

      const duration = Date.now() - startTime
      const fileSizeKB = (blob.size / 1024).toFixed(1)
      setStatus(`✅ 快速导出成功！大小: ${fileSizeKB}KB, 耗时: ${duration}ms`)

    } catch (error: any) {
      console.error('❌ 快速导出失败:', error)
      setStatus(`❌ 导出失败: ${error.message}`)
    } finally {
      setExporting(false)
      setTimeout(() => setStatus(''), 5000)
    }
  }

  return (
    <Card className={`p-4 ${className} border-2 border-purple-500`}>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-purple-700">🎨 DOM导出 + 外部优化</h3>
          <Badge variant="secondary" className="bg-purple-100 text-purple-800">
            dom-to-image + 免费API
          </Badge>
        </div>
        
        <div className="text-sm text-purple-700 bg-purple-50 p-2 rounded">
          <strong>技术方案：</strong>DOM导出 → 外部免费API画质优化 → 高清图片生成
        </div>
        
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => exportWithOptimization('png')}
              disabled={exporting}
              className="bg-purple-600 hover:bg-purple-700"
              size="sm"
            >
              {exporting ? (optimizing ? '优化中...' : '导出中...') : '🎨 优化PNG'}
            </Button>
            <Button
              onClick={() => exportWithOptimization('jpeg')}
              disabled={exporting}
              variant="outline"
              size="sm"
            >
              {exporting ? (optimizing ? '优化中...' : '导出中...') : '🎨 优化JPEG'}
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
              onClick={() => quickDomExport('jpeg')}
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
            'bg-purple-50 text-purple-700'
          }`}>
            {status}
          </div>
        )}
        
        <div className="text-xs text-gray-600 space-y-1">
          <div className="font-semibold text-purple-700">🎨 优化流程：</div>
          <div>1. dom-to-image基础导出</div>
          <div>2. 调用外部免费API优化</div>
          <div>3. Real-ESRGAN / Waifu2x / BigJPG</div>
          <div>4. 本地算法降级保护</div>
          <div>5. 生成高清优化图片</div>
          <div className="text-purple-600 font-semibold">免费API一键高清！</div>
        </div>
      </div>
    </Card>
  )
}
